import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  async function checkForUpdates() {
    setIsUpdating(true);
    setUpdateStatus("Checking for updates...");
    try {
      const update = await check();
      if (update) {
        setUpdateStatus(`Installing update v${update.version}...`);
        await update.downloadAndInstall();
        setUpdateStatus("Relaunching application...");
        await relaunch();
      } else {
        setUpdateStatus("Application is up to date!");
        setTimeout(() => setUpdateStatus(""), 3000);
      }
    } catch (error) {
      console.error(error);
      setUpdateStatus(`Update failed: ${error}`);
      setTimeout(() => setUpdateStatus(""), 5000);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={checkForUpdates} disabled={isUpdating}>
          {isUpdating ? "Checking..." : "Check for Updates"}
        </button>
        {updateStatus && <p style={{ fontSize: "0.9rem", color: "#646cff" }}>{updateStatus}</p>}
      </div>
    </main>
  );
}

export default App;
