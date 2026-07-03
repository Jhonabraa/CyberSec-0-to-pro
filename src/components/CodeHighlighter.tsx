/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { playClick, playBeep } from '../utils/audio';

interface CodeHighlighterProps {
  code: string;
  language?: 'bash' | 'sql' | 'javascript' | 'html' | 'c' | 'text';
  title?: string;
  allowTilt?: boolean;
}

export default function CodeHighlighter({
  code,
  language = 'bash',
  title,
  allowTilt = true,
}: CodeHighlighterProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    playBeep();
    setTimeout(() => setCopied(false), 2000);
  };

  // 3D Mouse Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowTilt || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotate maximum 10 degrees
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = -((y - centerY) / centerY) * 8;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out',
    });
  };

  // Simple Regex Tokenizer for security highlights
  const highlightCode = (rawCode: string, lang: string) => {
    const lines = rawCode.split('\n');
    return lines.map((line, idx) => {
      // Return simple styled line
      if (!line.trim()) return <div key={idx} className="h-4" />;

      let formattedLine: React.ReactNode = line;

      if (lang === 'bash') {
        // Highlight Unix commands and flags
        const parts = line.split(/(\s+)/);
        formattedLine = parts.map((part, pIdx) => {
          if (/^(chmod|cat|ls|whoami|clear|grep|nc|nmap|sqlmap|msfconsole)$/.test(part)) {
            return <span key={pIdx} className="text-emerald-400 font-bold">{part}</span>;
          }
          if (/^-(-?[a-zA-Z]+)+$/.test(part)) {
            return <span key={pIdx} className="text-cyan-400">{part}</span>;
          }
          if (/^(FLAG\{[A-Z0-9_]+\})$/.test(part)) {
            return <span key={pIdx} className="text-rose-400 font-black animate-pulse">{part}</span>;
          }
          if (part.startsWith('\'') || part.startsWith('"')) {
            return <span key={pIdx} className="text-amber-300">{part}</span>;
          }
          return part;
        });
      } else if (lang === 'sql') {
        // Highlight SQL statements and Injection payloads
        const parts = line.split(/(\s+|'|OR|1=1|true|--|#)/i);
        formattedLine = parts.map((part, pIdx) => {
          const upper = part.toUpperCase();
          if (/^(SELECT|FROM|WHERE|OR|AND|INSERT|INTO|UPDATE|SET|DELETE|UNION|ALL)$/.test(upper)) {
            return <span key={pIdx} className="text-purple-400 font-bold">{part}</span>;
          }
          if (part === '1=1' || part === 'true' || part === "'") {
            return <span key={pIdx} className="text-rose-400 font-bold">{part}</span>;
          }
          if (part === '--' || part === '#') {
            return <span key={pIdx} className="text-slate-500 font-bold">{part}</span>;
          }
          return part;
        });
      } else if (lang === 'html' || lang === 'javascript') {
        // Highlight tags, attributes and scripting contexts
        const parts = line.split(/(<script>|<\/script>|<img|onerror=|onload=|alert\(|confirm\(|"|')/i);
        formattedLine = parts.map((part, pIdx) => {
          const lower = part.toLowerCase();
          if (lower.includes('script') || lower === '<img') {
            return <span key={pIdx} className="text-rose-400 font-bold">{part}</span>;
          }
          if (lower.includes('onerror') || lower.includes('onload')) {
            return <span key={pIdx} className="text-yellow-400 font-semibold">{part}</span>;
          }
          if (lower.startsWith('alert') || lower.startsWith('confirm')) {
            return <span key={pIdx} className="text-cyan-400 font-medium">{part}</span>;
          }
          return part;
        });
      } else if (lang === 'c') {
        // Highlight C constructs (useful for buffer overflows)
        const parts = line.split(/(\s+|gets\(|printf\(|strcpy\(|void|int|char|\[|\])/);
        formattedLine = parts.map((part, pIdx) => {
          if (/^(gets\(|strcpy\()$/.test(part)) {
            return <span key={pIdx} className="text-rose-500 font-bold underline animate-pulse">{part}</span>;
          }
          if (/^(printf\(|void|int|char)$/.test(part)) {
            return <span key={pIdx} className="text-blue-400">{part}</span>;
          }
          return part;
        });
      }

      return (
        <div key={idx} className="flex select-text font-mono text-[11px] leading-relaxed">
          <span className="w-8 text-slate-600 select-none text-right pr-3 border-r border-slate-900 mr-3">{idx + 1}</span>
          <span className="flex-1 whitespace-pre-wrap">{formattedLine}</span>
        </div>
      );
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="relative rounded-xl border border-slate-800 bg-slate-950/95 overflow-hidden transition-all duration-300 shadow-[0_15px_30px_-15px_rgba(0,0,0,0.8)] [transform-style:preserve-3d] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.1)] hover:border-emerald-500/30 group"
    >
      {/* 3D Glass Layer Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-900/40 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block" />
          </div>
          <span className="text-[10px] font-mono text-slate-500 ml-2 uppercase tracking-widest">{title || language} console</span>
        </div>

        <button
          onClick={() => {
            playClick();
            handleCopy();
          }}
          className="text-slate-400 hover:text-emerald-400 bg-slate-900 hover:bg-slate-800 p-1.5 rounded-md border border-slate-800 transition-all flex items-center gap-1 text-[10px] font-mono"
          title="Copy payload to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>

      {/* Code Container */}
      <div className="p-4 overflow-x-auto bg-slate-950/60 max-h-72 overflow-y-auto">
        {highlightCode(code, language)}
      </div>

      {/* Subtle depth lighting badge */}
      <div className="absolute bottom-2 right-2 text-[9px] text-slate-600 font-mono tracking-widest uppercase select-none opacity-40 group-hover:opacity-100 transition-opacity">
        3D SECURE CONSOLE
      </div>
    </div>
  );
}
