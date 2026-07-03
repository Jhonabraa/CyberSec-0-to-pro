import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Shield, 
  Lock, 
  Unlock, 
  BookOpen, 
  Cpu, 
  Award, 
  BookMarked, 
  HelpCircle, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Info, 
  User, 
  Copy, 
  FileText, 
  AlertTriangle, 
  Key, 
  Database,
  ChevronDown,
  Sparkles,
  Command,
  Volume2,
  VolumeX,
  Layers
} from 'lucide-react';

import { 
  playClick, 
  playBeep, 
  playSuccess, 
  playExploitLaser, 
  playFailure, 
  setMute, 
  getMuteState 
} from './utils/audio';

import CodeHighlighter from './components/CodeHighlighter';

// Type definitions
interface Lesson {
  title: string;
  content: string[];
  keyTakeaways: string[];
}

interface Lab {
  id: string;
  title: string;
  objective: string;
  instructions: string;
  flag: string;
  hint: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Module {
  id: number;
  level: string;
  title: string;
  category: string;
  shortDesc: string;
  xpReward: number;
  badge: string;
  icon: React.ReactNode;
  lesson: Lesson;
  lab: Lab;
  quiz: QuizQuestion[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export default function App() {
  // --- Persistent User State ---
  const [userXp, setUserXp] = useState<number>(() => {
    const saved = localStorage.getItem('hacker_xp');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    const saved = localStorage.getItem('hacker_completed_modules');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedLabs, setCompletedLabs] = useState<string[]>(() => {
    const saved = localStorage.getItem('hacker_completed_labs');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>(() => {
    const saved = localStorage.getItem('hacker_completed_quizzes');
    return saved ? JSON.parse(saved) : [];
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('hacker_sound_muted');
    const isMuted = saved === 'true';
    setMute(isMuted);
    return isMuted;
  });

  const toggleMute = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    setMute(nextMuted);
    localStorage.setItem('hacker_sound_muted', nextMuted.toString());
    if (!nextMuted) {
      setTimeout(() => playBeep(), 50);
    }
  };

  // Save states to local storage
  useEffect(() => {
    localStorage.setItem('hacker_xp', userXp.toString());
  }, [userXp]);

  useEffect(() => {
    localStorage.setItem('hacker_completed_modules', JSON.stringify(completedModules));
  }, [completedModules]);

  useEffect(() => {
    localStorage.setItem('hacker_completed_labs', JSON.stringify(completedLabs));
  }, [completedLabs]);

  useEffect(() => {
    localStorage.setItem('hacker_completed_quizzes', JSON.stringify(completedQuizzes));
  }, [completedQuizzes]);

  // --- Active Session Navigation State ---
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'lesson' | 'lab' | 'quiz'>('lesson');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // --- Quiz Answers State ---
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // --- Flag Input State ---
  const [flagInputs, setFlagInputs] = useState<Record<string, string>>({});
  const [flagFeedback, setFlagFeedback] = useState<Record<string, { success: boolean; message: string }>>({});

  // --- Live Interactive Labs States ---
  // Lab 1: Phishing Email
  const [selectedPhishFlags, setSelectedPhishFlags] = useState<string[]>([]);
  const [phishDecision, setPhishDecision] = useState<'phish' | 'legit' | null>(null);
  const [phishVerified, setPhishVerified] = useState<boolean>(false);

  // Lab 2: Linux Terminal
  const [terminalHistory, setTerminalHistory] = useState<{ type: 'input' | 'output' | 'error'; text: string }[]>([
    { type: 'output', text: 'ShadowOS Terminal v2.4.9 - Secure Hacking Environment' },
    { type: 'output', text: 'Type "help" to list available commands. Goal: Find and read secret.txt.' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [currentDir, setCurrentDir] = useState<'/' | '/home/guest'>('/home/guest');
  const [linuxFilePermissions, setLinuxFilePermissions] = useState<Record<string, string>>({
    'hint.txt': '-rw-r--r--',
    'secret.txt': '---------',
    '.passwd': '-r--------'
  });
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Lab 3a: SQL Injection Bypass
  const [sqliUser, setSqliUser] = useState('');
  const [sqliPass, setSqliPass] = useState('');
  const [sqliBypassed, setSqliBypassed] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);

  // Lab 3b: XSS Sandbox
  const [xssInput, setXssInput] = useState('');
  const [xssGuestbook, setXssGuestbook] = useState<string[]>([
    'Hey fellow hackers, awesome course! - Alice',
    'Shadow is the best mentor out here. - Bob'
  ]);
  const [xssTriggered, setXssTriggered] = useState(false);

  // Lab 4: Caesar Decrypter
  const [caesarShift, setCaesarShift] = useState(0);
  const caesarCiphertext = "KDFNHU_DFDGHPB_FUBSWR_N1QG";

  // Lab 5: Stack Smasher Visualizer
  const [bufferPayload, setBufferPayload] = useState('');
  const [eipOverwritten, setEipOverwritten] = useState(false);

  // --- AI Hacking Mentor (Shadow) States ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        role: 'model',
        text: "Greetings, initiate. I am Shadow, your AI Security Mentor. I specialize in penetration testing, vulnerability analysis, and defensive architecture. Feel free to ask me anything about cryptography, web exploitation, shell scripting, or how to pass your interactive labs!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper for chat and terminal
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Reset tab-specific states when switching modules
  const isFirstRender = useRef(true);
  useEffect(() => {
    setActiveTab('lesson');
    setQuizSubmitted(false);
    setSelectedAnswers({});
    if (!isFirstRender.current) {
      playBeep();
    }
  }, [activeModuleId]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    playClick();
  }, [activeTab]);

  // Helper to calculate rank/title based on XP
  const getHackerRank = (xp: number) => {
    if (xp >= 1000) return { title: "Elite Overlord (Pro)", color: "text-rose-400 border-rose-500/30 bg-rose-950/20" };
    if (xp >= 750) return { title: "Cipher Ghost (Expert)", color: "text-purple-400 border-purple-500/30 bg-purple-950/20" };
    if (xp >= 500) return { title: "Web Marauder (Intermediate)", color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/20" };
    if (xp >= 250) return { title: "Shell Nomad (Novice)", color: "text-blue-400 border-blue-500/30 bg-blue-950/20" };
    if (xp >= 100) return { title: "Script Kiddie (Advanced Beginner)", color: "text-yellow-400 border-yellow-500/30 bg-yellow-950/20" };
    return { title: "Greenhorn Initiate (0 Level)", color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20" };
  };

  const currentRank = getHackerRank(userXp);

  // --- Curriculum Database ---
  const modules: Module[] = [
    {
      id: 1,
      level: "Level 0",
      category: "Fundamentals",
      title: "Social Engineering & CIA Triad",
      shortDesc: "Discover the human firewall, threat mechanics, and the fundamental pillars of defensive security.",
      xpReward: 100,
      badge: "Human Shield",
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      lesson: {
        title: "Security Fundamentals & Phishing Mechanics",
        content: [
          "Welcome to Cybersecurity! Every hacking journey starts with the core architectural pillars. The CIA Triad is the industry standard benchmark:",
          "1. Confidentiality: Restricting sensitive information access only to authorized entities.",
          "2. Integrity: Ensuring data is accurate, authentic, and has not been maliciously modified.",
          "3. Availability: Ensuring systems, portals, and data feeds are accessible on demand.",
          "Social Engineering is the act of exploiting human psychology rather than software vulnerabilities to gain access to a system. It is often a hacker's first vector because it side-steps firewalls entirely.",
          "The most common social engineering tactic is Phishing—deceptive emails masquerading as trusted organizations (e.g., banks, IT support) designed to trick users into clicking malicious links or submitting authentication tokens.",
          "To identify phishing, look for: mismatched domain addresses, spoofed headers, urgent/threatening call-to-actions, vague greetings, and suspicious hyperlinked domains."
        ],
        keyTakeaways: [
          "The CIA Triad stands for Confidentiality, Integrity, and Availability.",
          "Social engineering targets human vulnerabilities like trust, curiosity, and fear.",
          "Always double-check sender emails, domains, and HTTPS links before interacting."
        ]
      },
      lab: {
        id: "phishing_lab",
        title: "Interactive Email Phishing Inspector",
        objective: "Analyze a suspicious corporate email to determine if it is a targeted phishing attack (spear-phishing) or a legitimate system notification.",
        instructions: "Look closely at the mock email headers, email address, links, and urgent language. Click on areas of the email to inspect for 'red flags'. Identify at least 3 suspicious indicators, then select your final security triage action (Report Phish or Trust Email) to capture the Flag.",
        flag: "FLAG{HUM4N_F1R3W4LL_SECURE}",
        hint: "Hover over or tap on elements like the sender address, greeting, and call-to-action button to analyze their integrity. The domain is 'sec-secure-update.com' instead of the authentic 'securebank.com'!"
      },
      quiz: [
        {
          question: "What does the 'I' in the CIA Triad stand for?",
          options: ["Identification", "Integrity", "Instruction", "Interception"],
          correctIndex: 1,
          explanation: "The 'I' stands for Integrity, which ensures that information is correct, complete, and un-tampered with during transfer or storage."
        },
        {
          question: "Which of the following is the hallmark of a Phishing email?",
          options: [
            "A secure HTTPS lock icon on the genuine bank URL",
            "Urgent language threatening account suspension if action is not taken immediately",
            "A personal greeting with your correct full name and account details",
            "A digital signature from your internal corporate IT department"
          ],
          correctIndex: 1,
          explanation: "Phishing emails heavily exploit psychological triggers like urgency and fear to force immediate compliance without thinking."
        },
        {
          question: "An attacker calls an employee pretending to be an external auditor seeking database credentials. What specific social engineering tactic is this?",
          options: ["Baiting", "Pretexting", "Shoulder Surfing", "Watering Hole"],
          correctIndex: 1,
          explanation: "Pretexting is the act of creating an invented scenario (the pretext) to persuade a targeted victim to release sensitive access info."
        }
      ]
    },
    {
      id: 2,
      level: "Level 1",
      category: "OS & Terminal",
      title: "Linux Command Line Mastery",
      shortDesc: "Cybersecurity runs on Unix. Learn to navigate directories, read system logs, and override file permissions.",
      xpReward: 150,
      badge: "Terminal Ghost",
      icon: <Terminal className="w-5 h-5 text-blue-400" />,
      lesson: {
        title: "Linux CLI Fundamentals for Security Testing",
        content: [
          "Most cybersecurity platforms, hacking scripts, and enterprise firewalls run exclusively on Linux or Unix-based kernels.",
          "Unlike standard client operating systems, servers are managed primarily through a Command Line Interface (CLI). Navigating directories efficiently and viewing files via terminal commands is critical.",
          "Core Commands to master:",
          "• 'ls' lists directory contents. 'ls -la' shows hidden files (starting with '.') and detailed file metadata.",
          "• 'cd <dir>' switches your current path directory context.",
          "• 'cat <file>' prints the raw text content of a file straight to your shell window.",
          "• 'whoami' reports the username of your current active terminal session shell.",
          "• 'chmod' alters file permissions. Linux handles file safety using permissions groups: User, Group, and Others. Permissions are Read (4), Write (2), and Execute (1). CHMOD 777 opens read, write, and execute permissions to everyone globally."
        ],
        keyTakeaways: [
          "The CLI is the fundamental standard control board for penetration testing.",
          "Hidden configurations are frequently used to store backdoors or authorization keys.",
          "Improper file permissions (such as world-readable private keys) are extremely common privilege escalation points."
        ]
      },
      lab: {
        id: "linux_lab",
        title: "Live Linux Terminal Sandbox Simulator",
        objective: "Utilize real command-line parameters in our simulated Linux environment to discover a hidden file, alter permissions, and retrieve the encrypted security flag.",
        instructions: "Interact with the terminal shell. Perform directory discovery, check permissions, reveal hidden files, utilize 'chmod' to unlock the locked files, and read the flag contents using shell commands.",
        flag: "FLAG{L1NUX_SH3LL_GURU}",
        hint: "Start by running 'ls -la' to see hidden files. You'll find '.passwd' containing a hint, and a locked 'secret.txt' file. Run 'chmod 777 secret.txt' to authorize read access, then 'cat secret.txt'."
      },
      quiz: [
        {
          question: "Which Linux command displays all files, including hidden system files?",
          options: ["ls", "ls -la", "ls -hidden", "dir /all"],
          correctIndex: 1,
          explanation: "The flag '-a' in 'ls -la' stands for 'all', which outputs files beginning with '.' (hidden config structures)."
        },
        {
          question: "What numeric value is equivalent to granting Read, Write, and Execute permissions in CHMOD?",
          options: ["5", "6", "7", "4"],
          correctIndex: 2,
          explanation: "Read (4) + Write (2) + Execute (1) = 7. Giving user/group/others full permissions translates to chmod 777."
        },
        {
          question: "If you want to view the contents of a file without opening a heavy text editor, which lightweight command is preferred?",
          options: ["grep", "cat", "echo", "pwd"],
          correctIndex: 1,
          explanation: "'cat' (concatenate) prints a file's entire content directly to the standard output stream of the shell."
        }
      ]
    },
    {
      id: 3,
      level: "Level 2",
      category: "Web Security",
      title: "Web App Penetration Testing",
      shortDesc: "Exploit modern web applications. Study SQL Injections to bypass authentication and execute XSS payloads.",
      xpReward: 200,
      badge: "SQL Slasher",
      icon: <Database className="w-5 h-5 text-cyan-400" />,
      lesson: {
        title: "Web Exploitation: SQLi and XSS",
        content: [
          "Web applications process user queries on client browsers and database nodes. If inputs are not sanitized, attackers can alter execution logic.",
          "1. SQL Injection (SQLi): Occurs when user-supplied inputs are concatenated directly into SQL database queries. By inserting query tokens like single quotes (') and boolean conditions ('OR 1=1'), an attacker can trick the database into validating any credential and returning entire master schemas.",
          "2. Cross-Site Scripting (XSS): Occurs when malicious client-side script code (typically Javascript) is injected into pages served to other users. This happens because the browser doesn't know any better and executes whatever scripts it finds inside the loaded HTML, bypassing the Same-Origin Policy.",
          "Stored XSS deposits scripts permanently onto a database (like blog guestbooks), infecting anyone visiting the post. Reflected XSS reflects payloads off query parameters, executing immediately."
        ],
        keyTakeaways: [
          "SQL Injection exploits improper database input parameters.",
          "XSS attacks run executable script context inside a victim's client browser, facilitating cookie hijacking.",
          "Defensive sanitation via Parameterized Queries / Prepared Statements blocks SQLi completely."
        ]
      },
      lab: {
        id: "web_lab",
        title: "Interactive Web Security Labs",
        objective: "Defeat two separate web challenges: Bypassing a database-connected Admin Portal via SQLi, and running an arbitrary Cross-Site Scripting payload in our live DOM guestbook sandbox.",
        instructions: "Choose a sub-lab below. For Lab A, input a valid SQL logic bypass in the username/password to retrieve the admin database records. For Lab B, submit an executable HTML/JS tag into the guestbook to trigger script execution and extract the cookie token flag.",
        flag: "FLAG{SQU3L_INJ3CT10N_M4ST3R}",
        hint: "In SQL Lab, use the famous injection payload: ' OR '1'='1 in the username box. In XSS Lab, write an image tag like '<img src=x onerror=alert(1)>' or a script tag to trigger execution."
      },
      quiz: [
        {
          question: "How does a secure application prevent SQL Injection entirely?",
          options: [
            "Encrypting all incoming network traffic with SSL certificates",
            "Using prepared statements / parameterized queries",
            "Blocking the character 'S' from username forms",
            "Moving the database to a secondary isolated network server"
          ],
          correctIndex: 1,
          explanation: "Prepared statements pre-compile the SQL template structure, rendering user input strictly as query data values rather than executable code."
        },
        {
          question: "Which type of Cross-Site Scripting is saved inside a server's persistent database and executed on every victim's session page load?",
          options: ["Reflected XSS", "Stored XSS", "DOM-based XSS", "Blind SQLi"],
          correctIndex: 1,
          explanation: "Stored XSS (or Persistent XSS) is saved in database tables or logs, running automatically when users request the compromised records."
        },
        {
          question: "If an XSS exploit steals 'document.cookie', which cookie setting prevents this exploit from accessing it via client-side scripts?",
          options: ["Secure", "SameSite", "HttpOnly", "DomainLock"],
          correctIndex: 2,
          explanation: "The 'HttpOnly' flag instructs browsers that cookies cannot be accessed via JavaScript API calls, blocking XSS session-theft payloads."
        }
      ]
    },
    {
      id: 4,
      level: "Level 3",
      category: "Cryptography",
      title: "Cryptography & Secret Ciphers",
      shortDesc: "Understand the math behind encryption. Master symmetric, asymmetric keys, hashing algorithms, and shift decoders.",
      xpReward: 200,
      badge: "Cryptograph",
      icon: <Key className="w-5 h-5 text-purple-400" />,
      lesson: {
        title: "Introduction to Cryptography and Ciphers",
        content: [
          "Cryptography keeps our digital world private. It secures banking transactions, databases, and military logs.",
          "Key cryptographical operations to know:",
          "• Symmetric Encryption: Uses the EXACT same key to encrypt and decrypt the plaintext (e.g., AES). Extremely fast but requires secure key exchange.",
          "• Asymmetric Encryption: Employs a mathematically tied key pair: a Public key (available to anyone to encrypt messages) and a Private key (kept top secret by the owner to decrypt them, e.g., RSA).",
          "• Cryptographic Hashing: A one-way function that maps inputs of arbitrary size to a fixed-length signature string (e.g., SHA-256). Hashing is irreversible. Changing even a single bit in the source file changes the resulting hash entirely (the Avalanche effect).",
          "• Substitution Ciphers (e.g. Caesar Cipher): An ancient enciphering technique where letters of the plaintext are shifted a fixed number of positions down the alphabet."
        ],
        keyTakeaways: [
          "Hashing is irreversible; encryption is bidirectional (reversible with key).",
          "Asymmetric encryption solves the secure key transmission dilemma.",
          "Weak or static salt-less MD5/SHA1 hashes can be decrypted using pre-computed Rainbow Tables."
        ]
      },
      lab: {
        id: "crypto_lab",
        title: "Intercepted Secret Caesar Cipher Decrypter",
        objective: "Intercept an encrypted military data packet containing high-level admin operations and decrypt the cipher using an interactive alphabet shifting engine.",
        instructions: "An encrypted packet containing the hacker flag has been caught: 'KDFNHU_DFDGHPB_FUBSWR_N1QG'. Adjust the interactive slider to shift the letters. Look closely for readable text combinations that match English phrases. Discover the shift pattern and submit the decrypted message to earn your Badge.",
        flag: "FLAG{CA3SAR_S1MPH3R_CIPH3R}",
        hint: "This cipher was encrypted using a classical Caesar shift of exactly 3 characters down the alphabet. Shifting backwards by 3 (from D to A, K to H) reveals the flag code!"
      },
      quiz: [
        {
          question: "Which option represents a fundamental difference between encryption and hashing?",
          options: [
            "Encryption is slower but is easily applied on mobile networks",
            "Hashing is completely unidirectional and irreversible, while encryption is bidirectional",
            "Encryption is only used for server connections; hashing is strictly offline",
            "There is no functional mathematical difference between the two"
          ],
          correctIndex: 1,
          explanation: "Hashing produces a one-way fingerprint of data to verify integrity. Encryption is intended to preserve confidentiality and is reversible."
        },
        {
          question: "In Asymmetric Cryptography, if Alice wants to send a secret message to Bob, which key should she use to encrypt it?",
          options: ["Alice's Private Key", "Alice's Public Key", "Bob's Public Key", "Bob's Private Key"],
          correctIndex: 2,
          explanation: "Alice encrypts the message using Bob's Public Key. Bob is the only entity with the matching Private Key required to decrypt it."
        },
        {
          question: "Which hash algorithm is currently considered mathematically insecure for storing passwords due to vulnerability to collision attacks?",
          options: ["SHA-256", "SHA-3", "MD5", "Bcrypt"],
          correctIndex: 2,
          explanation: "MD5 has severe structural flaws allowing collision attacks, where two distinct inputs yield the exact same hash output. It is also extremely fast, allowing brute force."
        }
      ]
    },
    {
      id: 5,
      level: "Level 4",
      category: "Exploitation",
      title: "Binary Exploitation & Stack Smasher",
      shortDesc: "The deepest levels of hacking. Study how buffer overflows hijack execution paths and corrupt memory registers.",
      xpReward: 300,
      badge: "Stack Overlord",
      icon: <Cpu className="w-5 h-5 text-rose-400" />,
      lesson: {
        title: "Lower-Level Security: Memory Corruption and Buffer Overflows",
        content: [
          "When low-level programs written in C or C++ manage RAM manually without boundary protections, serious memory corruption vulnerability can occur.",
          "A Buffer is a sequential memory region reserved to store variables, structures, or input strings.",
          "A Buffer Overflow occurs when a program writes more data to a buffer than the allocated memory block was provisioned to hold.",
          "The CPU stack stores critical execution control values:",
          "1. Local Buffer Space: Receives input strings.",
          "2. Security Canary / Guard Cookie: A random check value to detect buffer corruption before returning execution.",
          "3. Saved EIP (Extended Instruction Pointer): Pointer to the next instruction address the CPU must run.",
          "By inputting long payload strings containing malicious code (shellcode) followed by a specific instruction address, attackers can overwrite the Saved EIP register, hijacking CPU execution to point to their own system shell."
        ],
        keyTakeaways: [
          "Buffer overflows leverage lack of array bounds validation in memory management.",
          "The Instruction Pointer (EIP/RIP) governs what memory addresses the CPU executes next.",
          "Defense techniques like ASLR (Address Space Layout Randomization) and DEP/NX (Data Execution Prevention) render exploitation significantly harder."
        ]
      },
      lab: {
        id: "buffer_lab",
        title: "Visual Stack Smasher Sandbox Lab",
        objective: "Smasher Lab: Overflow a 12-byte C-string buffer, destroy the Security Canary guard, and overwrite the Instruction Pointer (EIP) register with the address of the admin 'win' console.",
        instructions: "Observe our simulated CPU Stack Grid. Input test bytes into the buffer payload field. See how characters spill over block boundaries. Your target is to overflow exactly 12 characters of garbage, then append the target function execution pointer address (e.g. 16 total characters) to hijack the register.",
        flag: "FLAG{ST4CK_SM4SH_O_FL0W_PRO}",
        hint: "The local buffer is 8 bytes. The Canary takes 4 bytes. Entering more than 12 characters will overwrite the Saved EIP! Type exactly 16 characters or 'EXPLOIT_NOW_0x8F' to smash the stack."
      },
      quiz: [
        {
          question: "Which memory register stores the address of the next command execution path for the CPU?",
          options: ["ESP (Stack Pointer)", "EAX (Accumulator Register)", "EIP (Instruction Pointer)", "EBP (Base Pointer)"],
          correctIndex: 2,
          explanation: "The EIP (Extended Instruction Pointer) governs CPU execution, indicating which memory coordinate to run next."
        },
        {
          question: "Which of the following describes ASLR (Address Space Layout Randomization)?",
          options: [
            "It encrypts variables stored inside local stack structures",
            "It randomizes the memory location of program processes on startup, making payload targeting difficult",
            "It blocks the network connection if too many bytes are received",
            "It compiles the source code with strict boundaries"
          ],
          correctIndex: 1,
          explanation: "ASLR randomizes system library and stack coordinates on launch, preventing hackers from relying on hardcoded exploit addresses."
        },
        {
          question: "Which function in standard C is famously dangerous because it reads input without validating buffer array boundaries?",
          options: ["printf()", "gets()", "strlen()", "malloc()"],
          correctIndex: 1,
          explanation: "'gets()' reads from input streams until a newline character is found, without validating the output array's allocated dimensions."
        }
      ]
    }
  ];

  const currentModule = modules.find(m => m.id === activeModuleId) || modules[0];

  // --- Hacking terminal custom command parser logic ---
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newHistory = [...terminalHistory, { type: 'input' as const, text: `guest@shadow_shell:${currentDir}$ ${cmd}` }];
    const parts = cmd.split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputText = '';
    let isError = false;
    let isSuccess = false;

    switch (commandName) {
      case 'help':
        outputText = 'Supported Commands:\n' +
          '  ls           List files and folders in the current directory\n' +
          '  ls -la       Show details, including hidden system files\n' +
          '  cd <path>    Change the active working directory context\n' +
          '  cat <file>   Output raw text content of selected file\n' +
          '  chmod <args> Modify permissions (e.g. chmod 777 secret.txt)\n' +
          '  whoami       Display active shell account identity\n' +
          '  clear        Reset terminal history screen\n';
        break;

      case 'whoami':
        outputText = 'guest';
        break;

      case 'clear':
        playClick();
        setTerminalHistory([]);
        setTerminalInput('');
        return;

      case 'ls':
        const flagLa = args[0] === '-la' || args[0] === '-a' || args[0] === '-l';
        if (currentDir === '/') {
          outputText = flagLa 
            ? 'drwxr-xr-x   2 root   root     4096 Jul 03 11:08 .\n' +
              'drwxr-xr-x   2 root   root     4096 Jul 03 11:08 ..\n' +
              'drwxr-xr-x   2 root   guest    4096 Jul 03 11:08 home'
            : 'home';
        } else {
          // Inside /home/guest
          if (flagLa) {
            outputText = 
              `drwxr-xr-x   3 guest  guest    4096 Jul 03 11:08 .\n` +
              `drwxr-xr-x   3 root   root     4096 Jul 03 11:08 ..\n` +
              `${linuxFilePermissions['.passwd']}   1 guest  guest     128 Jul 03 11:08 .passwd\n` +
              `${linuxFilePermissions['hint.txt']}   1 guest  guest     256 Jul 03 11:08 hint.txt\n` +
              `${linuxFilePermissions['secret.txt']}   1 guest  guest     512 Jul 03 11:08 secret.txt`;
          } else {
            outputText = 'hint.txt   secret.txt';
          }
        }
        break;

      case 'cd':
        const dest = args[0];
        if (!dest || dest === '.' || dest === './') {
          // do nothing
        } else if (dest === '..' || dest === '../') {
          if (currentDir === '/home/guest') {
            setCurrentDir('/');
            outputText = '';
          } else {
            outputText = 'Already at root "/" directory.';
          }
        } else if (dest === 'home' || dest === '/home' || dest === 'home/') {
          if (currentDir === '/') {
            setCurrentDir('/'); // simulated transition, we go to root or home
            outputText = 'Navigating... (Simulation note: Type cd /home/guest to go back to target folder)';
          } else {
            outputText = 'Directory not found: ' + dest;
            isError = true;
          }
        } else if (dest === '/home/guest' || dest === 'guest' || dest === './guest') {
          setCurrentDir('/home/guest');
          outputText = '';
        } else {
          outputText = 'Directory not found or Access Restricted: ' + dest;
          isError = true;
        }
        break;

      case 'cat':
        const targetFile = args[0];
        if (!targetFile) {
          outputText = 'Usage: cat <filename>';
          isError = true;
        } else if (currentDir === '/') {
          outputText = 'cat: ' + targetFile + ': Is a directory or file not found';
          isError = true;
        } else {
          // Inside /home/guest
          if (targetFile === 'hint.txt') {
            outputText = '=== HINT ===\nAh, welcome initiate. There is a hidden password configuration file in this workspace containing security logs. Type "ls -la" to locate it. It might help you understand how to open the permissions on secret.txt!';
          } else if (targetFile === '.passwd') {
            outputText = '=== DECRYPTED ACCESS PASSWD ===\nCredential found: "shadow_in_the_shell"\nSystem Note: Use this password or write chmod permissions to decrypt secret.txt!';
          } else if (targetFile === 'secret.txt') {
            const permissions = linuxFilePermissions['secret.txt'];
            // If permissions changed to readable (chmod 777, chmod +r, or similar)
            if (permissions.includes('r') || permissions === 'r-xr-xr-x' || permissions === '-rwxrwxrwx' || permissions === '---------' && false) {
              isSuccess = true;
              outputText = '=== SYSTEM DECRYPTION SUCCESS ===\nSECURITY KEY GRANTED:\n\n' + modules[1].lab.flag + '\n\nSubmit this flag above to unlock Level 1 & obtain the Badge!';
            } else {
              outputText = 'cat: secret.txt: Permission Denied. You do not have Read (r) privileges. (Check file permissions with "ls -la")';
              isError = true;
            }
          } else {
            outputText = `cat: ${targetFile}: No such file or directory.`;
            isError = true;
          }
        }
        break;

      case 'chmod':
        const mode = args[0];
        const file = args[1];
        if (!mode || !file) {
          outputText = 'Usage: chmod <octal_mode_or_pattern> <filename> (e.g. chmod 777 secret.txt)';
          isError = true;
        } else if (file !== 'secret.txt') {
          outputText = `chmod: ${file}: Permission Denied or File Not Found.`;
          isError = true;
        } else {
          if (mode === '777' || mode === '+r' || mode === '644' || mode === 'u+r' || mode === 'a+r') {
            setLinuxFilePermissions(prev => ({ ...prev, 'secret.txt': '-rwxrwxrwx' }));
            outputText = 'Permissions changed! "secret.txt" is now globally readable (r). Use "cat secret.txt" to read the flag!';
          } else {
            outputText = `chmod: invalid mode: "${mode}". Hint: Try "chmod 777 secret.txt" to grant full privileges.`;
            isError = true;
          }
        }
        break;

      default:
        outputText = `sh: command not found: ${commandName}. Type "help" to see valid commands.`;
        isError = true;
    }

    if (isSuccess) {
      playSuccess();
    } else if (isError) {
      playFailure();
    } else {
      playBeep();
    }

    setTerminalHistory([...newHistory, { type: isError ? 'error' : 'output', text: outputText }]);
    setTerminalInput('');
  };

  // --- Lab 3a SQLi Bypass Verification ---
  const handleSqliLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUser = sqliUser.trim().replace(/\s+/g, ' ').toLowerCase();
    const normalizedPass = sqliPass.trim().replace(/\s+/g, ' ').toLowerCase();

    // Check for SQL bypass patterns
    const bypassPatterns = [
      "' or '1'='1",
      "' or 1=1",
      "admin' --",
      "' or 'a'='a",
      "' or true --",
      "admin' or '1'='1"
    ];

    const isBypassed = bypassPatterns.some(pattern => 
      normalizedUser.includes(pattern) || normalizedPass.includes(pattern)
    );

    if (isBypassed) {
      playExploitLaser();
      setTimeout(() => playSuccess(), 400);
      setSqliBypassed(true);
      setTerminalHistory(prev => [...prev, { type: 'output', text: '[System Broadcast] SQL Injection validated in Module 3. Flag unlocked: ' + modules[2].lab.flag }]);
    } else {
      playFailure();
      setTerminalHistory(prev => [...prev, { type: 'error', text: 'Database error: INVALID_CREDENTIALS. Query returned empty record.' }]);
    }
  };

  // --- Lab 3b XSS Input Submission ---
  const handleXssSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xssInput.trim()) return;

    // Detect script or event triggers
    const triggerPattern = /<script>|onerror=|onload=|javascript:|alert\(|confirm\(|<img/i;
    const isTriggered = triggerPattern.test(xssInput);

    setXssGuestbook(prev => [xssInput, ...prev]);

    if (isTriggered) {
      playExploitLaser();
      setTimeout(() => playSuccess(), 400);
      setXssTriggered(true);
    } else {
      playBeep();
    }
    setXssInput('');
  };

  // --- Caesar shift text output decrypter ---
  const getCaesarDecrypted = (text: string, shift: number) => {
    return text
      .split('')
      .map(char => {
        if (char === '_') return '_';
        if (char === '1') return '1';
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          // A-Z
          let decryptedCode = code - shift;
          if (decryptedCode < 65) decryptedCode += 26;
          if (decryptedCode > 90) decryptedCode -= 26;
          return String.fromCharCode(decryptedCode);
        }
        return char;
      })
      .join('');
  };

  const decryptedCaesarText = getCaesarDecrypted(caesarCiphertext, caesarShift);

  // --- Stack Smasher visual calculations ---
  const renderStackCell = (index: number, cellLabel: string, baseColor: string, activeColor: string) => {
    const isOccupied = bufferPayload.length > index;
    const charWritten = isOccupied ? bufferPayload[index] : '';
    
    return (
      <div 
        key={index} 
        id={`stack-cell-${index}`}
        className={`flex flex-col items-center justify-center p-2 border-2 rounded transition-all duration-300 ${
          isOccupied ? `${activeColor} border-emerald-500 scale-105 shadow-md shadow-emerald-500/20` : `${baseColor} border-slate-800`
        }`}
      >
        <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">0x{ (1000 + index * 4).toString(16).toUpperCase() }</span>
        <span className="text-lg font-mono font-bold mt-1 h-7">
          {charWritten ? (charWritten === ' ' ? '␣' : charWritten) : '0x00'}
        </span>
        <span className="text-[10px] text-slate-400 font-semibold mt-1 truncate max-w-full font-sans">
          {cellLabel}
        </span>
      </div>
    );
  };

  // Calculate stack registers based on payload input length
  useEffect(() => {
    const len = bufferPayload.length;
    if (len >= 16 || bufferPayload === 'EXPLOIT_NOW_0x8F') {
      if (!eipOverwritten) {
        playExploitLaser();
        setTimeout(() => playSuccess(), 350);
      }
      setEipOverwritten(true);
    } else {
      setEipOverwritten(false);
    }
  }, [bufferPayload]);


  // --- Quiz Submission Processing ---
  const handleQuizSubmit = () => {
    let score = 0;
    currentModule.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    setQuizSubmitted(true);

    if (score === currentModule.quiz.length) {
      playSuccess();
      // Award XP on complete correct quiz if not already rewarded
      if (!completedQuizzes.includes(currentModule.id)) {
        setUserXp(prev => prev + 50);
        setCompletedQuizzes(prev => [...prev, currentModule.id]);
      }
    } else {
      playFailure();
    }
  };

  // --- Flag verification logic ---
  const handleFlagSubmit = (moduleId: number) => {
    const inputFlag = flagInputs[moduleId]?.trim();
    const correctFlag = modules.find(m => m.id === moduleId)?.lab.flag;

    if (inputFlag === correctFlag) {
      playSuccess();
      setFlagFeedback(prev => ({
        ...prev,
        [moduleId]: { success: true, message: `Access Key Verified! Earned +${modules.find(m => m.id === moduleId)?.xpReward} XP & '${modules.find(m => m.id === moduleId)?.badge}' Badge!` }
      }));

      // Grant XP & Badges
      if (!completedModules.includes(moduleId)) {
        setCompletedModules(prev => [...prev, moduleId]);
        setUserXp(prev => prev + (modules.find(m => m.id === moduleId)?.xpReward || 50));
      }
      if (!completedLabs.includes(currentModule.lab.id)) {
        setCompletedLabs(prev => [...prev, currentModule.lab.id]);
      }
    } else {
      playFailure();
      setFlagFeedback(prev => ({
        ...prev,
        [moduleId]: { success: false, message: "Invalid Access Key. Analyze the vulnerabilities deeper in the lab!" }
      }));
    }
  };

  // --- AI Mentor Chat Submission ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsgText = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    // Append User Message
    const userMsg: ChatMessage = {
      role: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    try {
      // Setup payload history (keep last 6 items for efficiency)
      const formattedHistory = chatMessages.slice(-6).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsgText,
          history: formattedHistory,
          labId: currentModule.lab.id
        })
      });

      const data = await res.json();
      
      const responseMsg: ChatMessage = {
        role: 'model',
        text: data.text || "I was unable to secure a connection. Please retry shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, responseMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        role: 'model',
        text: "Connection failure: The hacker mainframe proxy timed out. Please verify your internet link or secret keys and retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getModuleCodeSample = (id: number) => {
    switch (id) {
      case 1:
        return {
          title: "Vulnerable Phishing Email Source Header",
          language: "html" as const,
          code: `From: "Secure Bank Customer Service" <accounts-security@sec-secure-update.com>\nTo: target-user@victim-firm.com\nSubject: URGENT: Mandatory security keys sync required immediately!\nDate: Fri, 03 Jul 2026 11:24:12 -0700\nContent-Type: text/html;\n\n<!-- WARNING: Phishing Hyperlink Mockup -->\n<p>Dear customer, suspicious attempts have been blocked on your card.</p>\n<p>Please authorize and sync your credential tokens within 24 hours:</p>\n<a href="https://sec-secure-update.com/login/auth-session" style="font-weight:bold;">\n  Synchronize Credentials Keys Now\n</a>`
        };
      case 2:
        return {
          title: "Unix Shell Privileges & Files Discovery Audit",
          language: "bash" as const,
          code: `# Standard Directory Enumeration & Hidden File Audit\n$ ls -la\n\n# Output:\n# drwxr-xr-x  3 guest guest 4096 Jul  3 11:08 .\n# -r--------  1 guest guest  128 Jul  3 11:08 .passwd\n# ----------  1 guest guest  512 Jul  3 11:08 secret.txt\n\n# Override read/write permissions for a specific resource\n$ chmod 777 secret.txt\n\n# Secure output print straight to standard session shell\n$ cat secret.txt`
        };
      case 3:
        return {
          title: "Vulnerable Login Query Concatenation vs secure prepared statement",
          language: "sql" as const,
          code: `-- VULNERABLE DIRECT CONCATENATION QUERY\nSELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = '';\n\n-- SECURE PARAMETERIZED QUERY (PREPARED STATEMENTS)\nSELECT * FROM users WHERE username = ? AND password = ?;\n-- Parameters: ["admin", "securePass123"]`
        };
      case 4:
        return {
          title: "Symmetric Caesar Cipher Substitution Decrypter",
          language: "c" as const,
          code: `// Loop based decryption function for substitution ciphers\nvoid decryptCaesar(char* ciphertext, int shift) {\n    for (int i = 0; ciphertext[i] != '\\0'; i++) {\n        char ch = ciphertext[i];\n        if (ch >= 'A' && ch <= 'Z') {\n            // Shift letter backwards through alpha loop\n            ciphertext[i] = ((ch - 'A' - shift + 26) % 26) + 'A';\n        }\n    }\n}`
        };
      case 5:
        return {
          title: "Vulnerable C-string buffer lacking array boundary validation",
          language: "c" as const,
          code: `#include <stdio.h>\n#include <string.h>\n\nvoid vulnerableFunction() {\n    char localBuffer[8]; // Allocated space of exactly 8 bytes\n    \n    // gets() is highly unsafe: reads stdin without checking boundaries\n    gets(localBuffer); \n    \n    // Overwriting elements past index 7 corrupts the stack frames,\n    // destroying canary cookies and hijacking Saved EIP pointer!\n}`
        };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans cyber-grid">
      
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <Shield className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              HackerAcademy <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-mono font-bold tracking-widest">0-PRO</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Ethical Cybersecurity Learning Engine</p>
          </div>
        </div>

        {/* User stats widget */}
        <div className="flex items-center gap-4">
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${currentRank.color} transition-all duration-300`}>
            <Award className="w-4 h-4" />
            <div className="text-left">
              <p className="text-[10px] uppercase text-slate-400 font-mono tracking-wider">Hacker Rank</p>
              <p className="text-xs font-bold leading-none">{currentRank.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-400 font-mono tracking-wider">Progress</p>
              <p className="text-xs font-mono font-bold text-emerald-400">{userXp} XP</p>
            </div>
            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min((userXp / 1000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <button 
            id="toggle-sound-btn"
            onClick={toggleMute}
            title={soundMuted ? "Unmute Audio FX" : "Mute Audio FX"}
            className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
              soundMuted 
                ? "bg-rose-950/20 border-rose-500/30 text-rose-400 hover:bg-rose-950/40" 
                : "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40"
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button 
            id="toggle-cheat-sheet-btn"
            onClick={() => {
              setShowCheatSheet(!showCheatSheet);
              playClick();
            }}
            className="px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cheat Sheet</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR NAVIGATION - ROADMAP */}
        <nav className={`w-80 border-r border-slate-800 bg-slate-900/40 shrink-0 flex flex-col ${sidebarOpen ? 'block' : 'hidden'} lg:flex`}>
          <div className="p-4 border-b border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Interactive Syllabus</p>
            <h2 className="text-sm font-semibold text-slate-200">Progressive Learning Roadmap</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {modules.map((m) => {
              const isCompleted = completedModules.includes(m.id);
              const isActive = activeModuleId === m.id;
              
              return (
                <button
                  key={m.id}
                  id={`module-nav-${m.id}`}
                  onClick={() => setActiveModuleId(m.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group flex items-start gap-3 relative ${
                    isActive 
                      ? 'bg-slate-900/80 border-emerald-500/60 shadow-lg shadow-emerald-950/20' 
                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/20'
                  }`}
                >
                  <div className={`p-1.5 rounded-md border ${isActive ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-900 border-slate-800'} transition-all`}>
                    {m.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">{m.level}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">+{m.xpReward} XP</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 truncate mt-0.5 group-hover:text-white transition-colors">{m.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{m.shortDesc}</p>
                  </div>

                  {isCompleted && (
                    <div className="absolute right-2 top-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Locked Future Badge Sandbox Box */}
            <div className="p-4 border border-dashed border-slate-800 bg-slate-950/20 rounded-lg text-center mt-6">
              <Award className="w-7 h-7 mx-auto text-slate-600 mb-2" />
              <h4 className="text-xs font-bold text-slate-400">Master Level Badges</h4>
              <p className="text-[10px] text-slate-500 mt-1">Unlock all modules and labs to earn the Pro Penetration Tester status badge.</p>
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                {modules.map(m => (
                  <span 
                    key={m.id}
                    className={`text-[9px] font-mono px-1.5 py-0.5 border rounded uppercase ${
                      completedModules.includes(m.id) 
                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/40 font-bold' 
                        : 'bg-slate-950 text-slate-600 border-slate-800'
                    }`}
                  >
                    {m.badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick status banner */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Server: <span className="text-emerald-400">ACTIVE</span></span>
            <span>Key status: <span className={process.env.GEMINI_API_KEY ? "text-emerald-400" : "text-amber-400"}>{process.env.GEMINI_API_KEY ? "AI CONNECTED" : "OFFLINE COGNITION"}</span></span>
          </div>
        </nav>

        {/* MAIN LAB & CONTENT CANVAS */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950">
          
          {/* Module Banner / Heading */}
          <section className="bg-slate-900/30 border-b border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-800 text-slate-300 font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">{currentModule.category}</span>
                <span className="text-xs text-emerald-400 font-mono font-bold">{currentModule.level}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-1">{currentModule.title}</h2>
              <p className="text-sm text-slate-400 mt-1">{currentModule.shortDesc}</p>
            </div>

            {/* Action buttons inside lesson/lab/quiz */}
            <div className="flex bg-slate-950 border border-slate-900 p-1.5 rounded-xl shrink-0 w-fit self-start gap-1">
              <button 
                id="tab-btn-lesson"
                onClick={() => {
                  setActiveTab('lesson');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'lesson' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_3px_0_0_#059669] -translate-y-0.5' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Lesson
              </button>
              
              <button 
                id="tab-btn-lab"
                onClick={() => {
                  setActiveTab('lab');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all relative cursor-pointer ${
                  activeTab === 'lab' 
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_3px_0_0_#0891b2] -translate-y-0.5' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Hands-on Lab
                {completedLabs.includes(currentModule.lab.id) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950 animate-pulse" />
                )}
              </button>

              <button 
                id="tab-btn-quiz"
                onClick={() => {
                  setActiveTab('quiz');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all relative cursor-pointer ${
                  activeTab === 'quiz' 
                    ? 'bg-purple-500 text-slate-950 font-black shadow-[0_3px_0_0_#7c3aed] -translate-y-0.5' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Challenge Quiz
                {completedQuizzes.includes(currentModule.id) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950 animate-pulse" />
                )}
              </button>
            </div>
          </section>

          {/* ACTIVE TAB VIEWS */}
          <div className="flex-1 p-6 space-y-6">
            
            {/* 1. LESSON VIEW */}
            {activeTab === 'lesson' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                
                {/* Introduction & Details Cards */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <BookMarked className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm font-mono">Curriculum Syllabus</h3>
                  </div>
                  
                  <div className="space-y-4 text-slate-300 leading-relaxed text-sm md:text-base">
                    {currentModule.lesson.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* 3D Code Highlight Panel */}
                {getModuleCodeSample(currentModule.id) && (() => {
                  const sample = getModuleCodeSample(currentModule.id)!;
                  return (
                    <div className="space-y-2">
                      <p className="text-xs uppercase text-slate-500 font-mono font-bold tracking-wider">Interactive Source Code Analyzer (Hover to tilt in 3D):</p>
                      <CodeHighlighter 
                        code={sample.code}
                        language={sample.language}
                        title={sample.title}
                        allowTilt={true}
                      />
                    </div>
                  );
                })()}

                {/* Key Takeaways summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentModule.lesson.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="bg-slate-900/20 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                      <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono shrink-0 mt-0.5">
                        0{idx + 1}
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">{takeaway}</p>
                    </div>
                  ))}
                </div>

                {/* Next Step Box */}
                <div className="bg-gradient-to-r from-emerald-950/20 to-slate-900/40 border border-emerald-500/20 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                      <Terminal className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Finished reading? Time for direct exploit labs!</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Test your acquired knowledge in the virtual hacker simulation sandbox.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('lab')}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    Launch Simulation <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. HANDS-ON LABS VIEW */}
            {activeTab === 'lab' && (
              <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Lab Header details */}
                <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full font-bold">ACTIVE SIMULATION LAB</span>
                    <h3 className="text-lg font-bold text-slate-200 mt-1">{currentModule.lab.title}</h3>
                    <p className="text-xs text-slate-400"><span className="font-bold text-slate-300">Objective:</span> {currentModule.lab.objective}</p>
                  </div>
                  
                  {/* Flag submit inputs right at lab top for simplicity */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter captured flag (e.g. FLAG{...})"
                      value={flagInputs[currentModule.id] || ''}
                      onChange={(e) => setFlagInputs({ ...flagInputs, [currentModule.id]: e.target.value })}
                      className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded px-3 py-1.5 text-xs font-mono w-48 focus:outline-none placeholder:text-slate-600"
                    />
                    <button 
                      onClick={() => handleFlagSubmit(currentModule.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-colors"
                    >
                      Submit Key
                    </button>
                  </div>
                </div>

                {/* Instruction accordion */}
                <div className="bg-slate-900/20 border border-slate-800/80 p-4 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Lab Guidelines & Instructions</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{currentModule.lab.instructions}</p>
                  <p className="text-slate-500 italic"><span className="text-slate-400 font-bold">Stuck?</span> Ask the <span className="text-emerald-400 font-bold">AI Mentor</span> in the bottom right panel! You can also click below to reveal an offline hint:</p>
                  
                  {/* Simple details dropdown */}
                  <details className="text-[11px] text-slate-400 font-mono cursor-pointer select-none bg-slate-950 p-2 rounded border border-slate-900 mt-2">
                    <summary className="font-bold text-slate-300 hover:text-emerald-400">Reveal Help & Code Hints</summary>
                    <p className="mt-1 text-slate-400 font-sans">{currentModule.lab.hint}</p>
                  </details>
                </div>

                {/* Flag submissions feedback popups */}
                {flagFeedback[currentModule.id] && (
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    flagFeedback[currentModule.id].success 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}>
                    {flagFeedback[currentModule.id].success ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
                    <p className="text-xs font-mono">{flagFeedback[currentModule.id].message}</p>
                  </div>
                )}

                {/* ==============================================
                    MODULE 1 LAB: PHISHING INSPECTOR
                    ============================================== */}
                {currentModule.id === 1 && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Simulated Mail Client Box */}
                    <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500" />
                          <span className="w-3 h-3 rounded-full bg-amber-500" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">SecMail Reader v1.0</span>
                        <span className="text-xs text-slate-500">Inbox (1 unread)</span>
                      </div>

                      {/* Header block info */}
                      <div className="p-4 border-b border-slate-800 bg-slate-950/50 space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 inline-block w-16">From:</span>
                          <button 
                            onClick={() => {
                              if (!selectedPhishFlags.includes('sender')) setSelectedPhishFlags([...selectedPhishFlags, 'sender']);
                            }}
                            className={`px-1.5 py-0.5 rounded font-mono border text-left ${
                              selectedPhishFlags.includes('sender') 
                                ? 'bg-rose-950/40 text-rose-400 border-rose-500/50' 
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            SecureBank Help Desk &lt;<span className="font-bold underline">alert@sec-secure-update.com</span>&gt;
                          </button>
                        </div>
                        <div>
                          <span className="text-slate-500 inline-block w-16">To:</span>
                          <span className="text-slate-300 font-mono">valuable-customer@user.com</span>
                        </div>
                        <div>
                          <span className="text-slate-500 inline-block w-16">Subject:</span>
                          <span className="text-slate-200 font-bold font-mono">CRITICAL WARNING: Unusual Account Activity Logged! Immediate Verification Required!</span>
                        </div>
                        <div>
                          <span className="text-slate-500 inline-block w-16">Date:</span>
                          <span className="text-slate-400">July 3, 2026, 11:08 AM</span>
                        </div>
                      </div>

                      {/* Email body payload */}
                      <div className="p-6 space-y-4 text-slate-300 text-sm bg-white text-slate-900 min-h-80 select-text">
                        <div className="border-b border-slate-200 pb-3">
                          <p className="text-xl font-extrabold text-blue-900 tracking-tight flex items-center gap-1.5">
                            🏦 SecureBank Online Security
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <p>
                            Dear customer,
                          </p>
                          <p>
                            We logged a highly unauthorized transaction attempt of <strong className="text-red-600">$4,999.00 USD</strong> from IP address 82.201.2.98 (Tehran, Iran) on your online checking account today.
                          </p>
                          <p>
                            To prevent permanent account suspension, you <strong className="text-red-600">MUST verify your identity within 1 hour</strong>. Failure to act now will result in total loss of funds and complete frozen assets according to international banking codes.
                          </p>
                          
                          <div className="py-4 text-center">
                            <button
                              onClick={() => {
                                if (!selectedPhishFlags.includes('cta')) setSelectedPhishFlags([...selectedPhishFlags, 'cta']);
                              }}
                              className={`px-6 py-3 font-bold rounded shadow-lg select-none transition-all ${
                                selectedPhishFlags.includes('cta') 
                                  ? 'bg-rose-100 text-rose-700 border-2 border-rose-500 animate-pulse' 
                                  : 'bg-yellow-500 hover:bg-yellow-600 text-slate-950 cursor-pointer'
                              }`}
                            >
                              SECURE YOUR ACCOUNT NOW
                            </button>
                            <p className="text-[10px] text-slate-500 mt-2 font-mono">
                              Secure link destination: <span className="underline text-blue-600">http://www.sec-secure-update.com/banking/signon/verify</span>
                            </p>
                          </div>

                          <p>
                            Sincerely,
                          </p>
                          <p className="font-bold text-slate-700">
                            Corporate Security Division, SecureBank Inc.
                          </p>
                        </div>
                        
                        <div className="border-t border-slate-200 pt-4 text-[9px] text-slate-400 leading-tight">
                          <p>CONFIDENTIALITY NOTICE: This system-generated email is legal bank correspondence. If you received this in error, please disregard.</p>
                          <p className="mt-1">© 2026 SecureBank Financial Services Corp. All assets locked.</p>
                        </div>
                      </div>
                    </div>

                    {/* Threat analysis panel */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                      <h4 className="font-bold text-slate-200 uppercase font-mono tracking-wider text-xs">Vulnerability Analysis Dashboard</h4>
                      
                      <div className="space-y-3 text-xs">
                        <p className="text-slate-400">Analyze the email body and headers. Select areas by clicking them to tag Red Flags. Once tagged, make your security choice below.</p>
                        
                        {/* Selected Flags indicators */}
                        <div className="space-y-2">
                          <p className="font-bold text-slate-300">Identified Indicators ({selectedPhishFlags.length}/2):</p>
                          
                          <div className={`p-2.5 rounded border ${
                            selectedPhishFlags.includes('sender') 
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                              : 'bg-slate-950 border-slate-900 text-slate-600'
                          }`}>
                            <p className="font-bold">🚩 spoofed Sender Domain</p>
                            {selectedPhishFlags.includes('sender') && (
                              <p className="text-[10px] text-slate-400 mt-0.5">Correct! The domain is 'sec-secure-update.com', which is NOT authentic. SecureBank emails always end in '@securebank.com'!</p>
                            )}
                          </div>

                          <div className={`p-2.5 rounded border ${
                            selectedPhishFlags.includes('cta') 
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                              : 'bg-slate-950 border-slate-900 text-slate-600'
                          }`}>
                            <p className="font-bold">🚩 Urgent Deadline & Phishing URL</p>
                            {selectedPhishFlags.includes('cta') && (
                              <p className="text-[10px] text-slate-400 mt-0.5">Correct! Urgently demanding verification in 1 hour and linking to unencrypted HTTP domain 'sec-secure-update.com' is a major indicator!</p>
                            )}
                          </div>
                        </div>

                        {/* Triaging tools */}
                        {selectedPhishFlags.length >= 2 && (
                          <div className="pt-4 border-t border-slate-800 space-y-3">
                            <p className="font-bold text-slate-300">Triage Decision:</p>
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => {
                                  setPhishDecision('phish');
                                  setPhishVerified(true);
                                }}
                                className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 border border-rose-500/30 font-bold py-2 rounded transition-all cursor-pointer text-center"
                              >
                                Block & Report Phish
                              </button>
                              <button 
                                onClick={() => {
                                  setPhishDecision('legit');
                                  setPhishVerified(true);
                                  alert("System: Security Warning! Trusting a phishing email led to compromised employee credentials. Exploit simulated!");
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded transition-all cursor-pointer text-center"
                              >
                                Trust Email
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Success Flag reward */}
                        {phishVerified && phishDecision === 'phish' && (
                          <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-lg text-emerald-400 text-xs space-y-2">
                            <p className="font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Threat Quarantined Successfully!</p>
                            <p className="text-[11px] text-slate-300 leading-normal">You correctly identified all red flags, defended the core, and prevented credential harvesting!</p>
                            <div className="p-2 bg-slate-950 rounded border border-emerald-500/20 mt-2 select-all font-mono font-bold text-center tracking-widest text-emerald-300">
                              {modules[0].lab.flag}
                            </div>
                            <p className="text-[9px] text-slate-500 text-center">Copy this key and paste in the 'Submit Key' field at the top to complete!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==============================================
                    MODULE 2 LAB: LINUX COMMAND LINE SANDBOX
                    ============================================== */}
                {currentModule.id === 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live Command Line Visual Frame */}
                    <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-112">
                      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-bold">
                          <Terminal className="w-3.5 h-3.5 text-blue-400" />
                          <span>guest@shadow_shell:{currentDir}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-700 animate-pulse" />
                        </div>
                      </div>

                      {/* Output terminal stream */}
                      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 leading-relaxed bg-slate-950 select-text">
                        {terminalHistory.map((line, idx) => (
                          <div 
                            key={idx} 
                            className={`${
                              line.type === 'input' 
                                ? 'text-slate-200 font-semibold' 
                                : line.type === 'error' 
                                  ? 'text-rose-400' 
                                  : 'text-emerald-400/90 whitespace-pre-wrap'
                            }`}
                          >
                            {line.text}
                          </div>
                        ))}
                        <div ref={terminalBottomRef} />
                      </div>

                      {/* Interactive form input field */}
                      <form onSubmit={handleTerminalSubmit} className="p-2 bg-slate-900/50 border-t border-slate-800 flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400 pl-2">guest@shadow_shell:{currentDir}$</span>
                        <input 
                          type="text"
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          placeholder="Type command here (e.g. ls -la)..."
                          className="flex-1 bg-transparent border-none text-xs font-mono text-emerald-400 focus:outline-none focus:ring-0 placeholder:text-slate-700"
                        />
                        <button 
                          type="submit" 
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono rounded text-xs"
                        >
                          EXE
                        </button>
                      </form>
                    </div>

                    {/* Sidebar listing current directory files & helper instructions */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-200 uppercase font-mono tracking-wider text-xs">Directory Index (Visual)</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{currentDir}</span>
                      </div>

                      <div className="space-y-3 text-xs font-mono">
                        <div className="space-y-2">
                          <div className="p-2 bg-slate-950 rounded border border-slate-800/60 flex items-center justify-between">
                            <span className="text-slate-300">📄 hint.txt</span>
                            <span className="text-[10px] text-slate-500 font-bold">-rw-r--r--</span>
                          </div>
                          
                          <div className={`p-2 rounded border transition-all ${
                            linuxFilePermissions['secret.txt'] === '-rwxrwxrwx'
                              ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-950 border-slate-800/60 text-slate-500'
                          } flex items-center justify-between`}>
                            <span className={linuxFilePermissions['secret.txt'] === '-rwxrwxrwx' ? 'font-bold' : ''}>📄 secret.txt</span>
                            <span className="text-[10px] font-mono">{linuxFilePermissions['secret.txt']}</span>
                          </div>

                          <div className="p-2 bg-slate-950 border border-slate-900 rounded text-slate-600 flex items-center justify-between">
                            <span>📄 .passwd (hidden)</span>
                            <span className="text-[10px] font-mono">-r--------</span>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-3.5 rounded border border-slate-900 font-sans text-slate-400 space-y-1 mt-4">
                          <p className="font-bold text-xs text-slate-300 font-mono">🎯 Lab Objectives Checklist:</p>
                          <ul className="space-y-1.5 text-xs mt-2 list-none">
                            <li className="flex items-center gap-1.5 text-slate-400">
                              <span className="text-blue-400 font-bold font-mono">[1]</span> Run <code className="text-emerald-400 font-mono">ls -la</code> to spot hidden files.
                            </li>
                            <li className="flex items-center gap-1.5 text-slate-400">
                              <span className="text-blue-400 font-bold font-mono">[2]</span> Run <code className="text-emerald-400 font-mono">cat .passwd</code> to read hidden credentials.
                            </li>
                            <li className="flex items-center gap-1.5 text-slate-400">
                              <span className="text-blue-400 font-bold font-mono">[3]</span> Run <code className="text-emerald-400 font-mono">chmod 777 secret.txt</code> to unlock the locked flag file.
                            </li>
                            <li className="flex items-center gap-1.5 text-slate-400">
                              <span className="text-blue-400 font-bold font-mono">[4]</span> Run <code className="text-emerald-400 font-mono">cat secret.txt</code> to extract the key.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==============================================
                    MODULE 3 LAB: WEB SECURITY (SQLi & XSS)
                    ============================================== */}
                {currentModule.id === 3 && (
                  <div className="space-y-6">
                    
                    {/* Inner Lab Tabs */}
                    <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg w-fit">
                      <button 
                        onClick={() => {
                          // Change local focus sublab
                          setSqliBypassed(false);
                          setXssTriggered(false);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold font-mono rounded bg-slate-800 text-white"
                      >
                        Vulnerability Sandbox
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* SUB-LAB A: SQL INJECTION PORTAL */}
                      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-5 space-y-4 shadow-xl">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">Vulnerability Lab A</span>
                            <span className="text-[11px] text-slate-500 font-mono">SQLi Bypassing Portal</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 mt-2">Vulnerable Admin Access Portal</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">The input on this login box concatenates parameters directly into SQL. Bypass credentials by injecting boolean logic truth conditions (e.g. <code className="text-emerald-400 font-mono">' OR '1'='1</code>).</p>
                        </div>

                        {/* Login form simulation */}
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 space-y-3">
                          <p className="text-xs font-bold text-center text-slate-400">👮 SECURE LOCK SYSTEM</p>
                          
                          <form onSubmit={handleSqliLogin} className="space-y-3 text-xs">
                            <div>
                              <label className="block text-slate-500 font-mono mb-1">Username:</label>
                              <input 
                                type="text"
                                value={sqliUser}
                                onChange={(e) => setSqliUser(e.target.value)}
                                placeholder="admin or payload..."
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-500 font-mono mb-1">Password:</label>
                              <input 
                                type="password"
                                value={sqliPass}
                                onChange={(e) => setSqliPass(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div className="pt-2 flex gap-2">
                              <button 
                                type="submit"
                                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-1.5 rounded font-bold transition-colors cursor-pointer text-center"
                              >
                                Log On
                              </button>
                              <button 
                                type="button"
                                onClick={() => setShowSqlSchema(!showSqlSchema)}
                                className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[11px] font-mono"
                              >
                                {showSqlSchema ? "Hide SQL" : "Show SQL"}
                              </button>
                            </div>
                          </form>

                          {/* Interactive live database visualizer schema */}
                          {showSqlSchema && (
                            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono text-slate-400 mt-3 space-y-1">
                              <p className="text-slate-300 font-bold">🛠️ Backend Query Constructor:</p>
                              <code className="text-rose-400 block break-all">
                                {`SELECT * FROM accounts WHERE username = '${sqliUser || 'INPUT'}' AND password = '${sqliPass || 'INPUT'}'`}
                              </code>
                              <p className="text-[9px] text-slate-500">Injecting single quotes splits context to inject boolean logic.</p>
                            </div>
                          )}
                        </div>

                        {/* SQLi Exploit complete banner */}
                        {sqliBypassed && (
                          <div className="bg-emerald-950/20 border border-emerald-500/40 p-4 rounded-lg text-emerald-400 text-xs space-y-2">
                            <p className="font-bold flex items-center gap-1.5">🚀 SQL injection Authentication Bypass Succeeded!</p>
                            <p className="text-[11px] text-slate-300">The server parsed the true condition <code className="text-emerald-400 font-mono">'1'='1'</code>, matching all admin records and bypassing cryptographic checks!</p>
                            <div className="p-2 bg-slate-950 rounded border border-emerald-500/20 font-mono font-bold text-center select-all tracking-widest text-emerald-300">
                              {modules[2].lab.flag}
                            </div>
                            <p className="text-[9px] text-slate-500 text-center">Submit this flag key in the submission field above to complete!</p>
                          </div>
                        )}
                      </div>

                      {/* SUB-LAB B: XSS INJECTION SANDBOX */}
                      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-5 space-y-4 shadow-xl">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">Vulnerability Lab B</span>
                            <span className="text-[11px] text-slate-500 font-mono">Stored XSS Payload Sandbox</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 mt-2">Malicious Javascript Injection Guestbook</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">This guestbook displays whatever HTML input is posted directly inside the DOM. Inject an image error tag or script tag (e.g. <code className="text-emerald-400 font-mono">&lt;img src=x onerror=alert(1)&gt;</code>) to hijack execution.</p>
                        </div>

                        {/* Live Guestbook app interface */}
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            <p className="text-[11px] uppercase text-slate-500 font-mono font-bold">Public Messages Ledger:</p>
                            
                            <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                              {xssGuestbook.map((msg, idx) => (
                                <div key={idx} className="bg-slate-900/50 p-2 rounded border border-slate-900/40 break-words">
                                  {/* Render HTML elements directly for simulation of XSS vulnerability! */}
                                  <div dangerouslySetInnerHTML={{ __html: msg }} />
                                </div>
                              ))}
                            </div>
                          </div>

                          <form onSubmit={handleXssSubmit} className="pt-3 border-t border-slate-900/60 flex items-center gap-2">
                            <input 
                              type="text"
                              value={xssInput}
                              onChange={(e) => setXssInput(e.target.value)}
                              placeholder="Write a message or injection payload..."
                              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                            />
                            <button 
                              type="submit"
                              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer"
                            >
                              Post
                            </button>
                          </form>
                        </div>

                        {/* Stored XSS trigger warning banner */}
                        {xssTriggered && (
                          <div className="bg-purple-950/20 border border-purple-500/40 p-4 rounded-lg text-purple-400 text-xs space-y-2">
                            <p className="font-bold flex items-center gap-1.5">💜 XSS Execution Injection Triggered!</p>
                            <p className="text-[11px] text-slate-300">Perfect! Your HTML code was loaded straight into the page context, forcing the browser engine to execute your script. Cookie captured: <span className="text-emerald-400 font-bold">{"FLAG{CR0SS_S1T3_SCR1PT_W1ZARD}"}</span></p>
                            <p className="text-[9px] text-slate-500 font-mono">You can submit this secondary captured flag to the system, or keep exploring!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==============================================
                    MODULE 4 LAB: CRYPTOGRAPHY (CAESAR DECIPHER)
                    ============================================== */}
                {currentModule.id === 4 && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cryptographic decrypter interface box */}
                    <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-bold font-mono">SIGNAL CORPS DECRYPTOR</span>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">Symmetric Caesar Shift Decoder</h4>
                        <p className="text-xs text-slate-400">Slide the shift offset slider below down the alphabet array to decrypt the military radio cipher. Watch the characters update in real-time!</p>
                      </div>

                      {/* Decryption output visual boxes */}
                      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
                        <div>
                          <p className="text-[10px] uppercase text-slate-500 font-mono font-bold tracking-wider">Intercepted Ciphertext Payload:</p>
                          <p className="text-xl font-mono font-bold text-rose-400 tracking-wider mt-1 select-all">{caesarCiphertext}</p>
                        </div>

                        <div className="border-t border-slate-900 pt-3">
                          <p className="text-[10px] uppercase text-slate-500 font-mono font-bold tracking-wider">Interactive Decrypted Stream Output:</p>
                          <p className={`text-xl font-mono font-bold tracking-wider mt-1 ${decryptedCaesarText.includes('HACKER_ACADEMY') ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}>
                            {decryptedCaesarText}
                          </p>
                        </div>
                      </div>

                      {/* Interactive slide bar */}
                      <div className="space-y-2 bg-slate-950/40 p-4 rounded-lg border border-slate-900/80">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                          <span>Alpha Shift: <span className="text-purple-400 font-bold">{caesarShift} characters</span></span>
                          <span>Shift range: 0 - 25</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="25"
                          value={caesarShift}
                          onChange={(e) => {
                            setCaesarShift(parseInt(e.target.value, 10));
                            playClick();
                          }}
                          className="w-full accent-purple-500 bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Cryptography context info card */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-200 uppercase font-mono tracking-wider text-xs">Decipher Strategy Guidelines</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Substitution ciphers shift letters along an alphabet index loop (A=0, B=1... Z=25). Because this is symmetric with a small search space (26 total outcomes), it is extremely susceptible to brute force attacks.</p>
                        
                        <div className="p-2.5 bg-slate-950 rounded border border-slate-900 font-mono text-[10px] text-slate-500 space-y-1">
                          <p className="font-bold text-slate-400">Shift Key Map Table (Shift = 3):</p>
                          <p>D ➔ A | K ➔ H | F ➔ C</p>
                          <p>N ➔ K | H ➔ E | U ➔ R</p>
                        </div>
                      </div>

                      {/* Decryption completion flag visual output */}
                      {decryptedCaesarText.includes('HACKER_ACADEMY') && (
                        <div className="bg-emerald-950/20 border border-emerald-500/40 p-4 rounded-lg text-emerald-400 text-xs space-y-2 animate-fade-in">
                          <p className="font-bold flex items-center gap-1.5">🔑 military cipher decrypted!</p>
                          <p className="text-[11px] text-slate-300">Amazing deciphering work! By sliding the shift key to exactly 3, you decoded the secure military text back to standard English!</p>
                          <div className="p-2 bg-slate-950 rounded border border-emerald-500/20 font-mono font-bold text-center tracking-widest text-emerald-300 select-all">
                            {modules[3].lab.flag}
                          </div>
                          <p className="text-[9px] text-slate-500 text-center">Copy this key and paste in 'Submit Key' above!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ==============================================
                    MODULE 5 LAB: BUFFER OVERFLOW STACK SMASHER
                    ============================================== */}
                {currentModule.id === 5 && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visual Stack Smasher grid visualizer layout */}
                    <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-bold font-mono">CPU STACK VISUALIZER</span>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">Interactive Memory Stack Layout</h4>
                        <p className="text-xs text-slate-400">Type random strings or hex arguments into the payload input below. Watch how the stack cells occupy space and overflow into adjacent boundaries!</p>
                      </div>

                      {/* The stack memory cell layout visualization */}
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Memory Stack Grid (8-bit blocks):</p>
                        <div className="grid grid-cols-4 gap-3">
                          
                          {/* Local buffer stack slots (8 bytes) */}
                          {Array.from({ length: 8 }).map((_, i) => 
                            renderStackCell(i, "Buffer Space", "bg-slate-950 text-slate-300", "bg-emerald-950/20 text-emerald-400")
                          )}

                          {/* Security Canary guard slots (4 bytes) */}
                          {Array.from({ length: 4 }).map((_, i) => 
                            renderStackCell(i + 8, "Guard Canary", "bg-yellow-950/10 text-yellow-500/50", "bg-yellow-950/40 text-yellow-400")
                          )}

                          {/* Saved EIP Instruction Pointer slots (4 bytes) */}
                          {Array.from({ length: 4 }).map((_, i) => 
                            renderStackCell(i + 12, "Saved EIP Register", "bg-rose-950/10 text-rose-500/50", "bg-rose-950/40 text-rose-400")
                          )}

                        </div>
                      </div>

                      {/* User input controller for buffer */}
                      <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-900">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-400 font-mono">Input Exploit Payload (ASCII characters):</label>
                          <span className="text-slate-500 font-mono">Length: <span className="text-emerald-400 font-bold">{bufferPayload.length} bytes</span> (Max safe buffer: 8 bytes)</span>
                        </div>
                        <input 
                          type="text"
                          value={bufferPayload}
                          onChange={(e) => {
                            setBufferPayload(e.target.value);
                            playClick();
                          }}
                          placeholder="Type random characters to fill the local buffer (e.g. AAAAAAAAAAAAAAAA)..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Stack overflow context descriptions & results */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-200 uppercase font-mono tracking-wider text-xs">Privilege Escalation Report</h4>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Canary Integrity:</span>
                            <span className={bufferPayload.length > 8 ? "text-rose-400 font-bold font-mono" : "text-emerald-400 font-bold font-mono"}>
                              {bufferPayload.length > 8 ? "🔥 COMPROMISED" : "🟢 VALID"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Saved EIP State:</span>
                            <span className={bufferPayload.length > 12 ? "text-rose-400 font-bold font-mono animate-pulse" : "text-slate-500 font-mono"}>
                              {bufferPayload.length > 12 ? "🔥 HIJACKED" : "UNMODIFIED"}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">Normally, the compiler inserts a random Safeguard Canary to block execution if corrupted. However, you completely overflowed the register boundaries and pointed the CPU instruction directly to our root shell payload!</p>
                      </div>

                      {/* Overflow flag results */}
                      {eipOverwritten && (
                        <div className="bg-emerald-950/20 border border-emerald-500/40 p-4 rounded-lg text-emerald-400 text-xs space-y-2 animate-fade-in">
                          <p className="font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-400" /> STACK BOOTSTRAP OVERFLOW SUCCESS!</p>
                          <p className="text-[11px] text-slate-300">Exploit executed successfully! The Saved EIP was overwritten, forcing CPU to jump execution to the root admin hook shell!</p>
                          <div className="p-2 bg-slate-950 rounded border border-emerald-500/20 font-mono font-bold text-center tracking-widest text-emerald-300 select-all">
                            {modules[4].lab.flag}
                          </div>
                          <p className="text-[9px] text-slate-500 text-center">Copy this key and paste in 'Submit Key' above to unlock level 4!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 3. CHALLENGE QUIZ VIEW */}
            {activeTab === 'quiz' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded font-bold font-mono">KNOWLEDGE VALIDATION GATE</span>
                    <h3 className="text-lg font-bold text-slate-200 mt-1">{currentModule.title} Challenge Quiz</h3>
                    <p className="text-xs text-slate-400">Complete all questions with 100% score to validate your module theoretical capability and obtain +50 XP progress points.</p>
                  </div>
                  
                  {completedQuizzes.includes(currentModule.id) && (
                    <div className="px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Quiz Certified</span>
                    </div>
                  )}
                </div>

                {/* List of quiz questions */}
                <div className="space-y-6">
                  {currentModule.quiz.map((q, qIdx) => {
                    const answered = selectedAnswers[qIdx] !== undefined;
                    const isCorrect = selectedAnswers[qIdx] === q.correctIndex;

                    return (
                      <div key={qIdx} className="bg-slate-900/20 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="flex gap-3">
                          <span className="text-xs font-mono font-bold text-slate-500 shrink-0 mt-0.5">Q.0{qIdx + 1}</span>
                          <h4 className="text-sm font-bold text-slate-200">{q.question}</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-7">
                          {q.options.map((option, oIdx) => {
                            const isSelected = selectedAnswers[qIdx] === oIdx;
                            const showSuccess = quizSubmitted && oIdx === q.correctIndex;
                            const showFailure = quizSubmitted && isSelected && oIdx !== q.correctIndex;

                            return (
                              <button
                                key={oIdx}
                                disabled={quizSubmitted}
                                onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })}
                                className={`w-full text-left p-3 rounded-lg border text-xs font-semibold font-mono cursor-pointer transition-all ${
                                  showSuccess 
                                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 font-bold' 
                                    : showFailure 
                                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-400 font-bold' 
                                      : isSelected 
                                        ? 'bg-slate-800 border-yellow-500/60 text-slate-200' 
                                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation block upon submission */}
                        {quizSubmitted && (
                          <div className={`p-3 rounded-lg border text-xs leading-relaxed pl-7 flex items-start gap-2.5 ${
                            isCorrect 
                              ? 'bg-emerald-950/10 border-emerald-500/10 text-emerald-400/80' 
                              : 'bg-rose-950/10 border-rose-500/10 text-rose-400/80'
                          }`}>
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <p><span className="font-bold">{isCorrect ? "Correct answer!" : "Incorrect."}</span> {q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom submit gate */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  {quizSubmitted ? (
                    <button 
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedAnswers({});
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold font-mono transition-colors"
                    >
                      Retry Challenge
                    </button>
                  ) : (
                    <button 
                      disabled={Object.keys(selectedAnswers).length < currentModule.quiz.length}
                      onClick={handleQuizSubmit}
                      className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow-lg shadow-yellow-500/10"
                    >
                      Submit Answers
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>

        {/* AI HACKING MENTOR (SHADOW) FIXED DRAWER SIDE PANEL */}
        <aside className="w-96 border-l border-slate-800 bg-slate-900/30 flex flex-col justify-between shrink-0 hidden xl:flex">
          {/* Chat header panel */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-500/15 rounded border border-emerald-500/25">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">AI Hacking Mentor</h3>
                <p className="text-[10px] text-slate-400">Logged in: <span className="font-mono text-emerald-400 font-bold">Shadow</span></p>
              </div>
            </div>
            
            <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">GEMINI 3.5</span>
          </div>

          {/* Message log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
            {chatMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] p-3 rounded-lg border text-xs leading-relaxed space-y-1 ${
                    isUser 
                      ? 'bg-slate-800/80 border-slate-700/60 text-slate-200 rounded-br-none' 
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 rounded-bl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-4 border-b border-slate-900/40 pb-1 mb-1">
                      <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-slate-400">
                        {isUser ? 'guest_student' : 'shadow_mentor'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-lg border bg-slate-950 border-slate-800 text-xs text-slate-400 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    <span className="font-mono text-[9px] uppercase font-bold text-emerald-400">Shadow is thinking...</span>
                  </div>
                  <p className="text-[11px] animate-pulse">Scanning server vectors for hints...</p>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Quick context status hint */}
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-900 text-[10px] font-sans text-slate-500 flex items-center justify-between">
            <span>Context focus: <span className="text-purple-400 font-mono font-bold">{currentModule.lab.id}</span></span>
            <span>Ask for a <span className="text-emerald-400 underline font-bold">hint</span></span>
          </div>

          {/* Message input panel */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/40 flex items-center gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Shadow for assistance or lab tips..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
            <button 
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 rounded-lg transition-all cursor-pointer shadow-md shadow-emerald-500/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>

      </div>

      {/* MODAL / BOTTOM SHEET CHEAT SHEETS TAB */}
      {showCheatSheet && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-text">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 font-mono">Penetration Testing Tools Cheat Sheets</h3>
              </div>
              <button 
                onClick={() => setShowCheatSheet(false)}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded font-mono border border-slate-700 hover:border-slate-600 text-slate-300"
              >
                Close (ESC)
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Section A: NMAP */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-blue-400 border-b border-slate-900 pb-1 flex items-center gap-1.5">
                    <Command className="w-3.5 h-3.5" /> Network Scanning (Nmap)
                  </h4>
                  <div className="space-y-1.5">
                    <p><code className="text-emerald-400">nmap -sS &lt;target&gt;</code> - SYN Stealth port scanning (stealthy and fast)</p>
                    <p><code className="text-emerald-400">nmap -sV -O &lt;target&gt;</code> - Scan target for version info and OS signature</p>
                    <p><code className="text-emerald-400">nmap -p- &lt;target&gt;</code> - Port scan all 65,535 TCP channels</p>
                    <p><code className="text-emerald-400">nmap --script vuln &lt;target&gt;</code> - Run default vulnerability audit scripts</p>
                  </div>
                </div>

                {/* Section B: Netcat */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-cyan-400 border-b border-slate-900 pb-1 flex items-center gap-1.5">
                    <Command className="w-3.5 h-3.5" /> Networking & Shells (Netcat)
                  </h4>
                  <div className="space-y-1.5">
                    <p><code className="text-emerald-400">nc -lvp &lt;port&gt;</code> - Listen on port for incoming connection hooks</p>
                    <p><code className="text-emerald-400">nc &lt;target_ip&gt; &lt;port&gt;</code> - Open simple TCP connection channel to target</p>
                    <p><code className="text-emerald-400">nc -lvp &lt;port&gt; -e /bin/bash</code> - Bind shell listener (launches shell on connect)</p>
                  </div>
                </div>

                {/* Section C: SQLMap */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-purple-400 border-b border-slate-900 pb-1 flex items-center gap-1.5">
                    <Command className="w-3.5 h-3.5" /> SQL Injection Engine (SQLMap)
                  </h4>
                  <div className="space-y-1.5">
                    <p><code className="text-emerald-400">sqlmap -u &quot;&lt;url&gt;&quot; --dbs</code> - Auto audit url, mapping and listing active database schemas</p>
                    <p><code className="text-emerald-400">sqlmap -u &quot;&lt;url&gt;&quot; -D &lt;db&gt; --tables</code> - Enumerate tables inside selected DB</p>
                    <p><code className="text-emerald-400">sqlmap -u &quot;&lt;url&gt;&quot; -T &lt;table&gt; --dump</code> - Dump credentials from target database table</p>
                  </div>
                </div>

                {/* Section D: Metasploit */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-rose-400 border-b border-slate-900 pb-1 flex items-center gap-1.5">
                    <Command className="w-3.5 h-3.5" /> Exploitation (Metasploit)
                  </h4>
                  <div className="space-y-1.5">
                    <p><code className="text-emerald-400">msfconsole</code> - Launch Metasploit interactive exploitation board</p>
                    <p><code className="text-emerald-400">search exploit &lt;vulnerability&gt;</code> - Query exploit base</p>
                    <p><code className="text-emerald-400">use &lt;exploit_path&gt;</code> - Configure specified exploit framework module</p>
                    <p><code className="text-emerald-400">set RHOSTS &lt;ip&gt; | set PAYLOAD ...</code> - Configure variables and initiate exploit execution</p>
                  </div>
                </div>

              </div>
              
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2 text-xs">
                <p className="font-bold text-slate-300">🛡️ Important Legal/Ethics Reminder:</p>
                <p className="text-slate-400 leading-relaxed">All commands, instructions, ciphers, and techniques presented in HackerAcademy are strictly for academic, defensive, and authorized penetration testing education. Running penetration scripts or scanning networks without explicit written bilateral authorization is completely illegal globally (Computer Fraud and Abuse Act in USA, etc.). Be safe, remain ethical, and defend the network!</p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
