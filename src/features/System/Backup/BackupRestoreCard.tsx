import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DownloadSimpleIcon, UploadSimpleIcon, LockIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { save, open } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
import { buildBackup } from "./pack";
import { readEnvelope, decryptAndUnzip, applyBackup, type ParsedBackup } from "./restore";

interface Props {
  coopId: string;
  coopName: string;
}

interface Pending {
  envelope: ReturnType<typeof readEnvelope>["envelope"];
  payload: Uint8Array;
}

const PAKDE_FILTER = [{ name: "PAKDE Backup", extensions: ["pakde"] }];

export default function BackupRestoreCard({ coopId, coopName }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<null | "export-options" | "import-passphrase">(null);

  // Export form
  const [encrypt, setEncrypt] = useState(false);
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");

  // Import form
  const [importPass, setImportPass] = useState("");
  const pendingRef = useRef<Pending | null>(null);

  const resetExportForm = () => {
    setEncrypt(false);
    setPass1("");
    setPass2("");
  };

  const handleExport = async () => {
    if (encrypt && pass1 !== pass2) {
      toast.error(t("backup.passphraseMismatch"));
      return;
    }
    setBusy(true);
    try {
      const bytes = await buildBackup(coopId, { encrypted: encrypt, passphrase: encrypt ? pass1 : undefined });
      const path = await save({
        defaultPath: `${coopName || "koperasi"}.pakde`,
        filters: PAKDE_FILTER,
      });
      if (!path) return; // user cancelled
      await writeFile(path, bytes);
      toast.success(t("backup.exportSuccess", { name: coopName }));
      setMode(null);
      resetExportForm();
    } catch (err) {
      toast.error(t("backup.exportFailed", { error: String(err) }));
    } finally {
      setBusy(false);
    }
  };

  const finishImport = async (pending: Pending, passphrase?: string) => {
    setBusy(true);
    try {
      const parsed: ParsedBackup = await decryptAndUnzip(pending.envelope, pending.payload, passphrase);
      await applyBackup(parsed);
      localStorage.setItem("pakde-active-profile-id", parsed.manifest.coop_id);
      toast.success(t("backup.importSuccess", { name: parsed.manifest.coop_name }));
      setMode(null);
      pendingRef.current = null;
      setImportPass("");
      // Reload so all cached connections / stores rebuild against the restored coop.
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      const msg = String(err);
      if (msg === "PASSPHRASE_REQUIRED") {
        pendingRef.current = pending;
        setMode("import-passphrase");
        return;
      }
      toast.error(t("backup.importFailed", { error: msg }));
    } finally {
      setBusy(false);
    }
  };

  const handleImportClick = async () => {
    setBusy(true);
    try {
      const selected = await open({ filters: PAKDE_FILTER, multiple: false });
      if (!selected || Array.isArray(selected)) return;
      const bytes = await readFile(selected);
      const { envelope, payload } = readEnvelope(bytes);
      if (envelope.encrypted) {
        pendingRef.current = { envelope, payload };
        setMode("import-passphrase");
        return;
      }
      await finishImport({ envelope, payload });
    } catch (err) {
      toast.error(t("backup.importFailed", { error: String(err) }));
    } finally {
      setBusy(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!pendingRef.current) return;
    await finishImport(pendingRef.current, importPass);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => {
            resetExportForm();
            setMode("export-options");
          }}
          disabled={busy || !coopId}
          className="border-border text-muted-foreground hover:text-foreground text-xs h-9"
        >
          <DownloadSimpleIcon className="h-3.5 w-3.5 mr-1.5" />
          {t("backup.export")}
        </Button>
        <Button
          variant="outline"
          onClick={handleImportClick}
          disabled={busy}
          className="border-border text-muted-foreground hover:text-foreground text-xs h-9"
        >
          <UploadSimpleIcon className="h-3.5 w-3.5 mr-1.5" />
          {t("backup.import")}
        </Button>
      </div>

      {/* Export options dialog */}
      <Dialog
        open={mode === "export-options"}
        onOpenChange={(openState) => {
          if (!openState) {
            setMode(null);
            resetExportForm();
          }
        }}
      >
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <DownloadSimpleIcon className="h-4 w-4 text-success" />
              {t("backup.exportTitle")}
            </DialogTitle>
            <DialogDescription className="text-xxs text-muted-foreground">
              {t("backup.exportDesc", { name: coopName })}
            </DialogDescription>
          </DialogHeader>

          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
            <input type="checkbox" checked={encrypt} onChange={(e) => setEncrypt(e.target.checked)} />
            <LockIcon className="h-3.5 w-3.5 text-warning" />
            {t("backup.encrypt")}
          </label>

          {encrypt && (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={t("backup.passphrase")}
                value={pass1}
                onChange={(e) => setPass1(e.target.value)}
                className="bg-input border-border text-xs h-8"
              />
              <Input
                type="password"
                placeholder={t("backup.confirmPassphrase")}
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                className="bg-input border-border text-xs h-8"
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setMode(null);
                resetExportForm();
              }}
              className="text-xs border-border"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleExport}
              disabled={busy || (encrypt && pass1.length === 0)}
              className="bg-brand hover:bg-brand text-brand-foreground font-bold text-xs"
            >
              {busy ? t("common.processing") : t("backup.export")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import passphrase dialog */}
      <Dialog
        open={mode === "import-passphrase"}
        onOpenChange={(openState) => {
          if (!openState) {
            setMode(null);
            pendingRef.current = null;
            setImportPass("");
          }
        }}
      >
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <LockIcon className="h-4 w-4 text-warning" />
              {t("backup.unlockTitle")}
            </DialogTitle>
            <DialogDescription className="text-xxs text-muted-foreground">{t("backup.unlockDesc")}</DialogDescription>
          </DialogHeader>

          <Input
            type="password"
            placeholder={t("backup.passphrase")}
            value={importPass}
            onChange={(e) => setImportPass(e.target.value)}
            className="bg-input border-border text-xs h-8"
          />

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setMode(null);
                pendingRef.current = null;
                setImportPass("");
              }}
              className="text-xs border-border"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleImportSubmit}
              disabled={busy || importPass.length === 0}
              className="bg-brand hover:bg-brand text-brand-foreground font-bold text-xs"
            >
              {busy ? t("common.processing") : t("backup.import")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
