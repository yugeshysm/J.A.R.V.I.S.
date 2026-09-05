import { useEffect, useState } from "react";
import {
  Activity,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  Command,
  Cpu,
  FileText,
  Globe2,
  History,
  Keyboard,
  Mic,
  MicOff,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Sparkles,
  Volume2,
  Wifi,
  X,
  Zap,
} from "lucide-react";

const actions = [
  { label: "Voice command", icon: Mic },
  { label: "Coding assistant", icon: Code2 },
  { label: "Web search", icon: Globe2 },
  { label: "Files", icon: FileText },
  { label: "Tasks", icon: Zap },
  { label: "Memory", icon: BrainCircuit },
];

const conversations = [
  "Project discussion",
  "Code debugging",
  "Research assistant",
];

function StatusDot({ active = true }) {
  return <span className={`status-dot ${active ? "active" : ""}`} />;
}

function App() {
  const [listening, setListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [command, setCommand] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Good evening. I'm ready when you are." },
  ]);

  useEffect(() => {
    if (!listening) return undefined;
    const handleKey = (event) => {
      if (event.code === "Space") event.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [listening]);

  const sendCommand = () => {
    const trimmed = command.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      { role: "assistant", text: "I received that. Voice and LiveKit integration will connect here next." },
    ]);
    setCommand("");
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {sidebarOpen && (
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark"><Sparkles size={17} /></div>
            <div>
              <strong>J.A.R.V.I.S.</strong>
              <span>PERSONAL AI</span>
            </div>
          </div>

          <button className="new-chat" onClick={() => setMessages([])}>
            <Plus size={17} /> New conversation
          </button>

          <div className="side-section">
            <div className="section-label">QUICK ACTIONS</div>
            {actions.map(({ label, icon: Icon }) => (
              <button className="side-action" key={label} onClick={() => setCommand(label)}>
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="side-section recent">
            <div className="section-label">RECENT</div>
            {conversations.map((item) => (
              <button className="recent-item" key={item}>
                <History size={14} />
                <span>{item}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <button className="side-action"><Settings size={16} /><span>Settings</span></button>
            <button className="side-action"><CircleHelp size={16} /><span>Help & shortcuts</span></button>
          </div>
        </aside>
      )}

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle sidebar">
            {sidebarOpen ? <PanelLeftClose size={18} /> : <Command size={18} />}
          </button>
          <div className="topbar-title">
            <span>COMMAND CENTER</span>
            <small>Personal AI operating interface</small>
          </div>
          <div className="topbar-right">
            <div className="online-pill"><StatusDot /> SYSTEM ONLINE</div>
            <button className="icon-button"><Moon size={17} /></button>
            <button className="icon-button"><MoreHorizontal size={18} /></button>
          </div>
        </header>

        <section className="dashboard">
          <div className="hero-grid">
            <section className="core-card glass-card">
              <div className="card-eyebrow"><Activity size={14} /> AI CORE <span>v0.1</span></div>
              <div className={`jarvis-core ${listening ? "listening" : ""}`}>
                <div className="core-ring ring-back" />
                <div className="core-ring ring-mid" />
                <div className="core-ring ring-front" />
                <div className="core-orb">
                  <Sparkles size={29} />
                </div>
                <div className="orbit-dot dot-a" />
                <div className="orbit-dot dot-b" />
                <div className="orbit-dot dot-c" />
              </div>
              <div className="core-state">{listening ? "LISTENING..." : "READY"}</div>
              <h1>{listening ? "I'm listening." : "How can I help?"}</h1>
              <p>{listening ? "Speak naturally. I'll wait for you to finish." : "Your personal AI assistant is standing by."}</p>
              <button className={`speak-button ${listening ? "active" : ""}`} onClick={() => setListening((value) => !value)}>
                {listening ? <MicOff size={19} /> : <Mic size={19} />}
                {listening ? "Stop listening" : "Start speaking"}
              </button>
              <div className="keyboard-hint"><Keyboard size={13} /> Space to talk</div>
            </section>

            <section className="system-card glass-card">
              <div className="card-heading">
                <div><span className="card-eyebrow">SYSTEM</span><h2>Intelligence status</h2></div>
                <Activity size={18} />
              </div>
              <div className="system-list">
                {[
                  ["AI engine", "Online", BrainCircuit],
                  ["Voice engine", "Ready", Volume2],
                  ["Microphone", "Available", Mic],
                  ["Network", "Connected", Wifi],
                ].map(([label, value, Icon]) => (
                  <div className="system-row" key={label}>
                    <div className="system-name"><Icon size={16} /><span>{label}</span></div>
                    <div className="system-value"><StatusDot /> {value}</div>
                  </div>
                ))}
              </div>
              <div className="device-title">DEVICE LOAD</div>
              <div className="metric"><div><span>CPU</span><strong>24%</strong></div><div className="bar"><i style={{ width: "24%" }} /></div></div>
              <div className="metric"><div><span>MEMORY</span><strong>41%</strong></div><div className="bar"><i style={{ width: "41%" }} /></div></div>
              <div className="metric"><div><span>BATTERY</span><strong>82%</strong></div><div className="bar"><i style={{ width: "82%" }} /></div></div>
            </section>
          </div>

          <section className="conversation glass-card">
            <div className="conversation-header">
              <div><span className="card-eyebrow">CONVERSATION</span><h2>Live transcript</h2></div>
              <button className="text-button"><Search size={14} /> Search</button>
            </div>
            <div className="messages">
              {messages.length === 0 && <div className="empty-state"><Sparkles size={19} /> New conversation started</div>}
              {messages.map((message, index) => (
                <div className={`message ${message.role}`} key={`${message.text}-${index}`}>
                  <div className="message-label">{message.role === "assistant" ? "J.A.R.V.I.S." : "YOU"}</div>
                  <div className="message-body">{message.text}</div>
                  {message.role === "assistant" && <div className="message-tools"><button><Volume2 size={13} /> Speak</button><button><Check size={13} /> Copy</button></div>}
                </div>
              ))}
            </div>
          </section>

          <div className="command-row">
            <div className="command-box glass-card">
              <button className={`command-mic ${listening ? "active" : ""}`} onClick={() => setListening((value) => !value)}>
                <Mic size={19} />
              </button>
              <input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && sendCommand()}
                placeholder="Speak to J.A.R.V.I.S. or type a command..."
              />
              <span className="command-shortcut">Enter</span>
              <button className="send-button" onClick={sendCommand}><ChevronRight size={19} /></button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
