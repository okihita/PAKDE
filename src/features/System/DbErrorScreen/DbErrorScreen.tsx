import "./DbErrorScreen.css";
import { useTranslation } from "react-i18next";
import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function DbErrorScreen({ message }: { message: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-8 bg-input border border-danger/30 rounded-2xl shadow-2xl text-center">
        <Warning className="h-12 w-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-danger mb-1">{t("dbError.title")}</h2>
        <p className="text-muted-foreground text-xs mb-6">{t("dbError.message")}</p>
        <div className="bg-danger/5 border border-danger/10 p-4 rounded-xl text-danger text-left font-mono text-xs mb-6 overflow-x-auto">
          <code>{message}</code>
        </div>
        <Button variant="destructive" className="w-full" onClick={() => window.location.reload()}>
          {t("dbError.reload")}
        </Button>
      </div>
    </div>
  );
}
