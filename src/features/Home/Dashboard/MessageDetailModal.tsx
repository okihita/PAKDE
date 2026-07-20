import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CaretRight, CaretLeft, PushPin, Copy, Check, CheckCircle, Circle } from "@phosphor-icons/react";
import { type MessageItem } from "@/data/message";

interface MessageDetailModalProps {
  selectedMessage: MessageItem | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentIndex: number;
  totalCount: number;
  isRead: boolean;
  onToggleRead: (id: string) => void;
  formatRelativeTimestamp: (iso: string, locale: string) => string;
  sourceBadgeClass: string;
}

export default function MessageDetailModal({
  selectedMessage,
  onClose,
  onNext,
  onPrev,
  isFirst,
  isLast,
  currentIndex,
  totalCount,
  isRead,
  onToggleRead,
  formatRelativeTimestamp,
  sourceBadgeClass,
}: MessageDetailModalProps) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedMessage === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMessage, onNext, onPrev]);

  const handleCopyNews = useCallback(async () => {
    if (!selectedMessage) return;
    const text = `${selectedMessage.title}\n(${selectedMessage.sourceName} · ${formatRelativeTimestamp(selectedMessage.timestamp, i18n.language)})\n\n${selectedMessage.content}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  }, [selectedMessage, i18n.language, formatRelativeTimestamp]);

  return (
    <Dialog open={selectedMessage !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-card border-border text-foreground max-w-lg p-0 overflow-hidden"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      >
        {selectedMessage && (
          <div className="flex flex-col max-h-[85vh]">
            {/* Modal Header Bar */}
            <div className="p-4 pb-3 border-b border-border bg-secondary/30 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xxxs px-2 py-0.5 rounded font-medium ${sourceBadgeClass}`}>
                    {selectedMessage.sourceName}
                  </span>
                  {selectedMessage.pinned && (
                    <span className="inline-flex items-center gap-1 text-xxxs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                      <PushPin className="h-3 w-3" weight="fill" />
                      {t("beranda.messages.pinned")}
                    </span>
                  )}
                  <span className="text-xxxs text-muted-foreground">
                    {formatRelativeTimestamp(selectedMessage.timestamp, i18n.language)}
                  </span>
                </div>
                <DialogTitle className="text-base font-bold text-foreground leading-tight pt-1">
                  {selectedMessage.title}
                </DialogTitle>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.content}
              </p>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-3 border-t border-border bg-secondary/40 flex items-center justify-between gap-2 text-xs">
              {/* Left: Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleRead(selectedMessage.id)}
                  className="h-8 text-xxs gap-1.5 border-border"
                >
                  {isRead ? (
                    <>
                      <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{t("beranda.messages.markUnread")}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-brand" />
                      <span>{t("beranda.messages.markRead")}</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyNews}
                  className="h-8 text-xxs gap-1.5 border-border"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" />
                      <span>{t("beranda.messages.copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{t("beranda.messages.copy")}</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Right: Prev/Next Carousel Nav */}
              <div className="flex items-center gap-1.5">
                <span className="text-xxxs text-muted-foreground mr-1">
                  {t("beranda.messages.itemOf", {
                    current: currentIndex + 1,
                    total: totalCount,
                  })}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isFirst}
                  onClick={onPrev}
                  className="h-7 w-7 border-border"
                  title={t("beranda.messages.prevItem")}
                >
                  <CaretLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isLast}
                  onClick={onNext}
                  className="h-7 w-7 border-border"
                  title={t("beranda.messages.nextItem")}
                >
                  <CaretRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
