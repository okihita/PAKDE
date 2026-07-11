import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";

let cachedVersion: string | null = null;

/** Returns the running app version, sourced from the Tauri bundle (package.json). */
export function useAppVersion(): string {
  const [version, setVersion] = useState(() => cachedVersion ?? "");

  useEffect(() => {
    if (cachedVersion) return;
    let active = true;
    getVersion()
      .then((v) => {
        cachedVersion = v;
        if (active) setVersion(v);
      })
      .catch(() => {
        /* fall back to empty string */
      });
    return () => {
      active = false;
    };
  }, []);

  return version;
}
