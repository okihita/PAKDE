import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import "./App.css";

interface ConsoleLine {
  text: string;
  type: "input" | "system" | "error" | "success";
}

function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "console" | "updates">("dashboard");

  // Greeting State
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  // Live Stats State
  const [ramUsage, setRamUsage] = useState("42.4");
  const [uptime, setUptime] = useState(0);
  const [networkLatency, setNetworkLatency] = useState(12);

  // Update Center State
  const [updateStatus, setUpdateStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Console State
  const [commandInput, setCommandInput] = useState("");
  const [consoleHistory, setConsoleHistory] = useState<ConsoleLine[]>([
    { text: "PAKDE System Console v0.3.0 initialized.", type: "system" },
    { text: "Type /help to see available commands.", type: "system" },
  ]);

  // Live updates simulator for stats
  useEffect(() => {
    const statsInterval = setInterval(() => {
      // Modulate RAM slightly
      const baseRam = 42.4;
      const noise = (Math.random() - 0.5) * 1.2;
      setRamUsage((baseRam + noise).toFixed(1));

      // Update uptime counter (in seconds)
      setUptime((prev) => prev + 1);

      // Latency fluctuation
      setNetworkLatency(Math.floor(8 + Math.random() * 9));
    }, 1000);

    return () => clearInterval(statsInterval);
  }, []);

  // Greet Action
  async function greet() {
    if (!name) return;
    try {
      const msg: string = await invoke("greet", { name });
      setGreetMsg(msg);
    } catch (e) {
      console.error(e);
    }
  }

  // Update Action
  async function checkForUpdates() {
    setIsUpdating(true);
    setUpdateStatus("Connecting to update server...");
    try {
      const update = await check();
      if (update) {
        setUpdateStatus(`Downloading update package v${update.version}...`);
        await update.downloadAndInstall();
        setUpdateStatus("Restarting application...");
        await relaunch();
      } else {
        setUpdateStatus("Application is already at the latest version!");
        setTimeout(() => setUpdateStatus(""), 3500);
      }
    } catch (error) {
      console.error(error);
      setUpdateStatus(`Failed to update: ${error}`);
      setTimeout(() => setUpdateStatus(""), 5000);
    } finally {
      setIsUpdating(false);
    }
  }

  // Console Commands Action
  const handleConsoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    const newHistory = [...consoleHistory, { text: cmd, type: "input" as const }];
    setConsoleHistory(newHistory);
    setCommandInput("");

    // Command parser
    const args = cmd.split(" ");
    const commandName = args[0].toLowerCase();

    setTimeout(async () => {
      if (commandName === "/help") {
        setConsoleHistory((prev) => [
          ...prev,
          { text: "Available Commands:", type: "system" },
          { text: "  /help         - Shows this list of console commands.", type: "system" },
          { text: "  /greet <name> - Calls Rust greet command.", type: "system" },
          { text: "  /system       - Displays current system usage metrics.", type: "system" },
          { text: "  /clear        - Clears the console logs.", type: "system" },
        ]);
      } else if (commandName === "/greet") {
        const greetName = args.slice(1).join(" ");
        if (!greetName) {
          setConsoleHistory((prev) => [...prev, { text: "Error: Please specify a name. Usage: /greet [name]", type: "error" }]);
        } else {
          try {
            const resp: string = await invoke("greet", { name: greetName });
            setConsoleHistory((prev) => [...prev, { text: resp, type: "success" }]);
          } catch (err) {
            setConsoleHistory((prev) => [...prev, { text: `Rust Greet Error: ${err}`, type: "error" }]);
          }
        }
      } else if (commandName === "/system") {
        setConsoleHistory((prev) => [
          ...prev,
          { text: `System Stats at index:`, type: "system" },
          { text: `  Memory Load: ${ramUsage}% RAM`, type: "system" },
          { text: `  Active Latency: ${networkLatency}ms`, type: "system" },
          { text: `  Session Uptime: ${Math.floor(uptime / 60)}m ${uptime % 60}s`, type: "system" },
        ]);
      } else if (commandName === "/clear") {
        setConsoleHistory([]);
      } else {
        setConsoleHistory((prev) => [
          ...prev,
          { text: `Unknown command: '${commandName}'. Type /help for assistance.`, type: "error" },
        ]);
      }
    }, 150);
  };

  // Helper to format uptime
  const formatUptime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <span className="brand-logo">PAKDE COCKPIT</span>
          </div>
          <nav className="nav-links">
            <div
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              📊 Dashboard
            </div>
            <div
              className={`nav-item ${activeTab === "console" ? "active" : ""}`}
              onClick={() => setActiveTab("console")}
            >
              💻 System Console
            </div>
            <div
              className={`nav-item ${activeTab === "updates" ? "active" : ""}`}
              onClick={() => setActiveTab("updates")}
            >
              🔄 Update Center
            </div>
          </nav>
        </div>

        <div className="footer-section">
          <div className="status-badge">
            <div className="status-dot"></div>
            <span>v0.3.0 Local Dev</span>
          </div>
        </div>
      </aside>

      {/* Main Panel views */}
      <main className="main-content">
        {activeTab === "dashboard" && (
          <div>
            <header className="view-header">
              <h2>Overview Dashboard</h2>
              <p>Monitor status logs and invoke custom Rust commands live.</p>
            </header>

            {/* Metrics cards grid */}
            <div className="cards-grid">
              <div className="glass-card">
                <div className="card-title">Memory Allocation</div>
                <div className="card-value">{ramUsage}%</div>
                <div className="card-subtext">Optimized backend heap limit</div>
              </div>
              <div className="glass-card">
                <div className="card-title">Session Uptime</div>
                <div className="card-value">{formatUptime(uptime)}</div>
                <div className="card-subtext">Real-time application activity</div>
              </div>
              <div className="glass-card">
                <div className="card-title">Network Ping</div>
                <div className="card-value">{networkLatency} ms</div>
                <div className="card-subtext">Direct to update CDN latency</div>
              </div>
            </div>

            {/* Command Greet Execution */}
            <div className="glass-card">
              <div className="card-title" style={{ marginBottom: "1.5rem" }}>Invoke Greet Command</div>
              <div className="greet-section">
                <form
                  className="input-group"
                  onSubmit={(e) => {
                    e.preventDefault();
                    greet();
                  }}
                >
                  <input
                    type="text"
                    onChange={(e) => setName(e.currentTarget.value)}
                    value={name}
                    placeholder="Enter greeting recipient name..."
                  />
                  <button type="submit">Call Rust</button>
                </form>
                {greetMsg && <div className="response-box">{greetMsg}</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "console" && (
          <div>
            <header className="view-header">
              <h2>System Shell</h2>
              <p>Execute custom system scripts and talk to the Rust backend directly.</p>
            </header>

            <div className="console-box">
              <div className="console-output">
                {consoleHistory.map((line, idx) => (
                  <div key={idx} className={`console-line ${line.type}`}>
                    {line.type === "input" && <span className="console-prompt">&gt;</span>}
                    {line.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleConsoleSubmit} className="console-input-line">
                <span className="console-prompt">&gt;</span>
                <input
                  type="text"
                  className="console-input"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Type console command here (e.g. /help)..."
                  autoFocus
                />
              </form>
            </div>
          </div>
        )}

        {activeTab === "updates" && (
          <div>
            <header className="view-header">
              <h2>System Update Center</h2>
              <p>Manage application releases and configure OTA updates.</p>
            </header>

            <div className="cards-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="glass-card">
                <div className="card-title">OTA Build Upgrader</div>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
                  Check for version releases stored on GitHub. The updater validates the download binary signature dynamically.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <button onClick={checkForUpdates} disabled={isUpdating}>
                    {isUpdating ? "Checking Pipeline..." : "Check for Updates Now"}
                  </button>
                  {updateStatus && <span style={{ color: "#00f2fe", fontWeight: "600" }}>{updateStatus}</span>}
                </div>
              </div>

              <div className="glass-card">
                <div className="card-title">Changelog & History</div>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-version">v0.3.0</div>
                    <div className="timeline-content">
                      <div className="timeline-title">Premium Cockpit Cockpit UI</div>
                      <div className="timeline-desc">Implemented high-fidelity dark dashboard, console interpreter, and sidebar navigation system.</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-version">v0.2.0</div>
                    <div className="timeline-content">
                      <div className="timeline-title">Integrated Updater Plugin</div>
                      <div className="timeline-desc">Registered secure updater and process restart plugins in Rust backend and capabilities settings.</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-version">v0.1.0</div>
                    <div className="timeline-content">
                      <div className="timeline-title">Initial Project Scaffold</div>
                      <div className="timeline-desc">Scaffolded Tauri v2 React/TypeScript boilerplate with Vite development configurations.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
