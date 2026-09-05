import { useEffect, useRef, useState } from "react";
import {
  Activity, BrainCircuit, Check, ChevronRight, CircleHelp, Code2, Command,
  FileText, Globe2, History, Keyboard, Mic, MicOff, Moon, MoreHorizontal,
  PanelLeftClose, Plus, Search, Settings, Sparkles, Volume2, Wifi, Zap,
} from "lucide-react";
import { createLiveKitClient } from "./livekit";

const actions = [
  ["Voice command", Mic], ["Coding assistant", Code2], ["Web search", Globe2],
  ["Files", FileText], ["Tasks", Zap], ["Memory", BrainCircuit],
];
const recent = ["Project discussion", "Code debugging", "Research assistant"];

function StatusDot({ active = true }) { return <span className={`status-dot ${active ? "active" : ""}`} />; }

export default function App() {
  const clientRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [state, setState] = useState("ready");
  const [command, setCommand] = useState("");
  const [roomName, setRoomName] = useState("");
  const [participants, setParticipants] = useState(0);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Good evening. I'm ready when you are." },
  ]);

  useEffect(() => () => { clientRef.current?.disconnect(); }, []);

  const connect = async () => {
    if (connected || connecting) return;
    setError(""); setConnecting(true); setState("connecting");
    try {
      clientRef.current = createLiveKitClient({
        onState: (next) => {
          setState(next);
          setConnected(["connected", "listening", "speaking"].includes(next));
          if (next === "disconnected") setListening(false);
        },
        onParticipantChange: setParticipants,
        onTranscript: ({ role, text, final }) => {
          if (!final) return;
          setMessages((current) => [...current, { role, text }]);
        },
      });
      const session = await clientRef.current.connect();
      setRoomName(session.room);
      setListening(true);
      setState("listening");
    } catch (err) {
      setState("error"); setError(err.message || "Unable to connect to J.A.R.V.I.S.");
      setConnected(false);
    } finally { setConnecting(false); }
  };

  const toggleMic = async () => {
    if (!connected) return connect();
    const next = !listening;
    try {
      await clientRef.current.setMicrophoneEnabled(next);
      setListening(next);
      setState(next ? "listening" : "connected");
    } catch (err) { setError(err.message); }
  };

  const disconnect = async () => {
    await clientRef.current?.disconnect();
    setConnected(false); setListening(false); setState("ready"); setRoomName("");
  };

  const sendCommand = () => {
    const text = command.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setCommand("");
  };

  const statusLabel = connecting ? "CONNECTING..." : state === "speaking" ? "RESPONDING..." : state === "listening" ? "LISTENING..." : connected ? "CONNECTED" : "READY";

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      {sidebarOpen && <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><div><strong>J.A.R.V.I.S.</strong><span>PERSONAL AI</span></div></div>
        <button className="new-chat" onClick={() => setMessages([])}><Plus size={17} /> New conversation</button>
        <div className="side-section"><div className="section-label">QUICK ACTIONS</div>
          {actions.map(([label, Icon]) => <button className="side-action" key={label} onClick={() => setCommand(label)}><Icon size={16} /><span>{label}</span></button>)}
        </div>
        <div className="side-section recent"><div className="section-label">RECENT</div>
          {recent.map((item) => <button className="recent-item" key={item}><History size={14} /><span>{item}</span></button>)}
        </div>
        <div className="sidebar-footer"><button className="side-action"><Settings size={16} /><span>Settings</span></button><button className="side-action"><CircleHelp size={16} /><span>Help & shortcuts</span></button></div>
      </aside>}

      <main className="workspace">
        <header className="topbar"><button className="icon-button" onClick={() => setSidebarOpen((v) => !v)}>{sidebarOpen ? <PanelLeftClose size={18} /> : <Command size={18} />}</button>
          <div className="topbar-title"><span>COMMAND CENTER</span><small>Personal AI operating interface</small></div>
          <div className="topbar-right"><div className="online-pill"><StatusDot active={connected} /> {connected ? "SYSTEM ONLINE" : "SYSTEM STANDBY"}</div><button className="icon-button"><Moon size={17} /></button><button className="icon-button"><MoreHorizontal size={18} /></button></div>
        </header>

        <section className="dashboard">
          {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError("")}>Dismiss</button></div>}
          <div className="hero-grid">
            <section className="core-card glass-card">
              <div className="card-eyebrow"><Activity size={14} /> AI CORE <span>LIVEKIT</span></div>
              <div className={`jarvis-core ${listening || state === "speaking" ? "listening" : ""}`}>
                <div className="core-ring ring-back" /><div className="core-ring ring-mid" /><div className="core-ring ring-front" />
                <div className="core-orb"><Sparkles size={29} /></div><div className="orbit-dot dot-a" /><div className="orbit-dot dot-b" /><div className="orbit-dot dot-c" />
              </div>
              <div className="core-state">{statusLabel}</div>
              <h1>{state === "speaking" ? "I'm responding." : listening ? "I'm listening." : "How can I help?"}</h1>
              <p>{connected ? `Secure voice session${roomName ? ` • ${roomName}` : ""}` : "Connect to your LiveKit agent to begin."}</p>
              <button className={`speak-button ${listening ? "active" : ""}`} onClick={toggleMic}>{listening ? <MicOff size={19} /> : <Mic size={19} />}{connecting ? "Connecting..." : listening ? "Stop listening" : connected ? "Start speaking" : "Connect J.A.R.V.I.S."}</button>
              {connected && <button className="disconnect-button" onClick={disconnect}>End session</button>}
              <div className="keyboard-hint"><Keyboard size={13} /> Space to talk</div>
            </section>

            <section className="system-card glass-card">
              <div className="card-heading"><div><span className="card-eyebrow">SYSTEM</span><h2>Intelligence status</h2></div><Activity size={18} /></div>
              <div className="system-list">
                {[["AI engine", connected ? "Online" : "Standby", BrainCircuit], ["Voice engine", connected ? "Live" : "Ready", Volume2], ["Microphone", listening ? "Active" : "Available", Mic], ["Network", connected ? "Connected" : "Waiting", Wifi]].map(([label, value, Icon]) => <div className="system-row" key={label}><div className="system-name"><Icon size={16} /><span>{label}</span></div><div className="system-value"><StatusDot active={connected || label === "Microphone"} /> {value}</div></div>)}
              </div>
              <div className="device-title">SESSION</div>
              <div className="metric"><div><span>PARTICIPANTS</span><strong>{participants}</strong></div><div className="bar"><i style={{ width: `${Math.min(100, Math.max(8, participants * 20))}%` }} /></div></div>
              <div className="metric"><div><span>CONNECTION</span><strong>{state.toUpperCase()}</strong></div><div className="bar"><i style={{ width: connected ? "100%" : "12%" }} /></div></div>
              <div className="metric"><div><span>ROOM</span><strong>{roomName || "—"}</strong></div></div>
            </section>
          </div>

          <section className="conversation glass-card"><div className="conversation-header"><div><span className="card-eyebrow">CONVERSATION</span><h2>Live transcript</h2></div><button className="text-button"><Search size={14} /> Search</button></div>
            <div className="messages">{messages.length === 0 && <div className="empty-state"><Sparkles size={19} /> New conversation started</div>}{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.text}-${index}`}><div className="message-label">{message.role === "assistant" ? "J.A.R.V.I.S." : "YOU"}</div><div className="message-body">{message.text}</div>{message.role === "assistant" && <div className="message-tools"><button><Volume2 size={13} /> Speak</button><button><Check size={13} /> Copy</button></div>}</div>)}</div>
          </section>

          <div className="command-row"><div className="command-box glass-card"><button className={`command-mic ${listening ? "active" : ""}`} onClick={toggleMic}><Mic size={19} /></button><input value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendCommand()} placeholder="Speak to J.A.R.V.I.S. or type a command..." /><span className="command-shortcut">Enter</span><button className="send-button" onClick={sendCommand}><ChevronRight size={19} /></button></div></div>
        </section>
      </main>
    </div>
  );
}
