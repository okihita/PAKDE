import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  NewspaperIcon,
  Buildings,
  MapPin,
  Flag,
  Megaphone,
  CaretRight,
  CaretLeft,
  PushPin,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import { type MessageItem } from "@/data/message";
import { getMessages } from "@/db/message";
import MessageDetailModal from "./MessageDetailModal";
import { Tooltip } from "@/components/ui/tooltip";
import { IS_MAC } from "@/lib/utils";

const MESSAGE_READ_KEY = "pakde-messages-read";
const isMac = IS_MAC;
const messageShortcut = isMac ? "⌘⇧B" : "Ctrl+Shift+B";
const LBL_OPEN_MESSAGE = `Buka Pesan (${messageShortcut})`;
const LBL_CLOSE_MESSAGE = `Tutup Pesan (${messageShortcut})`;

type FilterTab = "all" | "internal" | "government";

interface MessageWidgetProps {
  coopId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SOURCE_BADGE: Record<MessageItem["source"], string> = {
  kementerian: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  provinsi: "bg-info/10 text-info border border-info/20",
  kabupaten: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  internal: "bg-brand/10 text-brand border border-brand/20",
};

const SOURCE_ICON: Record<MessageItem["source"], typeof Buildings> = {
  kementerian: Buildings,
  provinsi: MapPin,
  kabupaten: Flag,
  internal: Megaphone,
};

function formatRelativeTimestamp(iso: string, locale: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isIndo = locale.startsWith("id");

  if (diffDays === 0) {
    const timeStr = date.toLocaleTimeString(isIndo ? "id-ID" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${isIndo ? "Hari ini" : "Today"}, ${timeStr}`;
  }

  if (diffDays === 1) {
    const timeStr = date.toLocaleTimeString(isIndo ? "id-ID" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${isIndo ? "Kemarin" : "Yesterday"}, ${timeStr}`;
  }

  if (diffDays > 1 && diffDays < 7) {
    return isIndo ? `${diffDays} hari lalu` : `${diffDays}d ago`;
  }

  return date.toLocaleDateString(isIndo ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function useMessageRead(items: MessageItem[], coopId: string = "default") {
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`${MESSAGE_READ_KEY}:${coopId}`);
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(`${MESSAGE_READ_KEY}:${coopId}`, JSON.stringify([...readIds]));
  }, [readIds, coopId]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  }, []);

  const toggleRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const allIds = items.map((n) => n.id);
    setReadIds(new Set(allIds));
  }, [items]);

  return { readIds, markRead, toggleRead, markAllRead };
}

export default function MessageWidget({ coopId, isCollapsed, onToggleCollapse }: MessageWidgetProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      setMessagesLoading(true);
      try {
        const items = await getMessages(coopId || "");
        if (alive) setMessages(items);
      } catch {
        /* non-fatal fallback */
      } finally {
        if (alive) setMessagesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [coopId]);

  const { readIds, markRead, toggleRead, markAllRead } = useMessageRead(messages, coopId ?? "default");

  const unreadCount = useMemo(() => messages.filter((n) => !readIds.has(n.id)).length, [messages, readIds]);

  const unreadByTab = useMemo(() => {
    return {
      all: messages.filter((n) => !readIds.has(n.id)).length,
      internal: messages.filter((n) => n.source === "internal" && !readIds.has(n.id)).length,
      government: messages.filter((n) => n.source !== "internal" && !readIds.has(n.id)).length,
    };
  }, [messages, readIds]);

  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      if (activeTab === "internal" && item.source !== "internal") return false;
      if (activeTab === "government" && item.source === "internal") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchContent = item.content.toLowerCase().includes(q);
        const matchSource = item.sourceName.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchSource) return false;
      }
      return true;
    });
  }, [messages, activeTab, searchQuery]);

  const selectedMessage =
    selectedIndex !== null && filteredMessages[selectedIndex] ? filteredMessages[selectedIndex] : null;

  const handleNextMessage = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < filteredMessages.length - 1) {
      const nextIdx = selectedIndex + 1;
      setSelectedIndex(nextIdx);
      const nextItem = filteredMessages[nextIdx];
      if (nextItem && !readIds.has(nextItem.id)) {
        markRead(nextItem.id);
      }
    }
  }, [selectedIndex, filteredMessages, readIds, markRead]);

  const handlePrevMessage = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      const prevIdx = selectedIndex - 1;
      setSelectedIndex(prevIdx);
      const prevItem = filteredMessages[prevIdx];
      if (prevItem && !readIds.has(prevItem.id)) {
        markRead(prevItem.id);
      }
    }
  }, [selectedIndex, filteredMessages, readIds, markRead]);

  if (isCollapsed) {
    return (
      <div className="bg-sidebar text-foreground flex flex-col h-full items-center justify-between select-none w-12 border-l border-border">
        <div className="flex flex-col items-center gap-2 pt-3">
          <NewspaperIcon className="h-4 w-4 text-info" weight="duotone" />
          {unreadCount > 0 && (
            <span className="text-xxxs font-black bg-info/20 text-info px-1 py-0.5 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>

        <div
          className="writing-mode-vertical text-xxxs font-bold text-muted-foreground uppercase tracking-widest py-4 flex items-center gap-1 rotate-180 select-none"
          style={{ writingMode: "vertical-rl" }}
        >
          <span>{t("beranda.messages.title")}</span>
        </div>

        <div className="border-t border-border shrink-0 bg-sidebar w-full p-1.5 flex justify-center">
          <Tooltip label={LBL_OPEN_MESSAGE} side="left">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={LBL_OPEN_MESSAGE}
              className="h-10 w-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
            >
              <CaretLeft className="h-4 w-4 shrink-0" />
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sidebar text-foreground flex flex-col h-full select-none">
      <div className="p-0 space-y-0 relative border-b border-border/40 shrink-0">
        <div className="relative overflow-hidden rounded-t-xl px-3 h-11 flex items-center justify-between shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-left bg-no-repeat pointer-events-none opacity-30 dark:opacity-40 transition-opacity [transform:scaleX(-1)]"
            style={{ backgroundImage: 'url("/banners/message-banner.webp")' }}
          />
          <div className="absolute inset-0 bg-linear-to-l from-card/85 via-card/50 to-transparent pointer-events-none z-1" />

          <div className="relative z-10 flex items-center justify-between w-full gap-2">
            <CardTitle className="text-xs tracking-widest text-muted-foreground uppercase flex items-center gap-2 min-w-0">
              <NewspaperIcon className="h-3.5 w-3.5 text-info shrink-0" weight="duotone" />
              <span className="truncate">{t("beranda.messages.title")}</span>
            </CardTitle>
          </div>
        </div>

        {/* Unread status + mark-as-read, below the illustrated title strip */}
        {unreadCount > 0 && (
          <div className="px-3 py-1.5 flex items-center justify-between border-t border-border/20 bg-card/50">
            <span className="shrink-0 text-xxxs font-bold px-1.5 py-0.5 rounded-full bg-info/15 text-info animate-pulse">
              {t("beranda.messages.unread", { n: unreadCount })}
            </span>
            <button
              onClick={markAllRead}
              className="text-xxxs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded px-1"
            >
              {t("beranda.messages.markRead")}
            </button>
          </div>
        )}

        {/* Controls below the illustrated title strip: filter tabs + search, as two
            distinct always-visible zones (no mode-swap) so they never clash. */}
        <div className="p-2.5 bg-card/50 border-t border-border/20 space-y-2">
          {/* Zone 1 — category tabs */}
          <div className="flex items-center gap-1 bg-secondary/60 p-0.5 rounded-md text-xxxs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-1 px-1.5 rounded font-medium transition-all flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand ${
                activeTab === "all"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t("beranda.messages.filterAll")}</span>
              {unreadByTab.all > 0 && <span className="w-1.5 h-1.5 rounded-full bg-info shrink-0" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("internal")}
              className={`flex-1 py-1 px-1.5 rounded font-medium transition-all flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand ${
                activeTab === "internal"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t("beranda.messages.filterInternal")}</span>
              {unreadByTab.internal > 0 && <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("government")}
              className={`flex-1 py-1 px-1.5 rounded font-medium transition-all flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand ${
                activeTab === "government"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t("beranda.messages.filterGovernment")}</span>
              {unreadByTab.government > 0 && <span className="w-1.5 h-1.5 rounded-full bg-info shrink-0" />}
            </button>
          </div>

          {/* Zone 2 — search input (always visible, lives alongside the tabs) */}
          <div className="relative">
            <MagnifyingGlass className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("beranda.messages.searchPlaceholder")}
              className="h-7 text-xs bg-input border-border text-foreground pl-7 pr-7 placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t("beranda.messages.clear")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pt-1 pb-3 px-3 nav-scroll">
        <div className="space-y-1.5">
          {messagesLoading ? (
            <p className="text-xxs text-muted-foreground text-center py-6">{t("beranda.messages.loading")}</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-xxs text-muted-foreground text-center py-6">
              {searchQuery ? t("beranda.messages.noResults") : t("beranda.messages.noNews")}
            </p>
          ) : null}

          {filteredMessages.map((item, index) => {
            const isUnread = !readIds.has(item.id);
            const SourceIcon = SOURCE_ICON[item.source];

            return (
              <button
                type="button"
                key={item.id}
                className={`group text-left w-full flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isUnread
                    ? "bg-info/5 border-info/30 hover:bg-info/10 shadow-xs"
                    : "bg-card/50 border-border/60 hover:bg-secondary/70"
                }`}
                onClick={() => {
                  setSelectedIndex(index);
                  if (isUnread) markRead(item.id);
                }}
              >
                {/* Left Source Icon Rail with status indicator */}
                <div className="relative mt-0.5 shrink-0">
                  <div
                    className={`p-1.5 rounded-md ${
                      isUnread ? "bg-info/10 text-info" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <SourceIcon className="h-3.5 w-3.5" weight={isUnread ? "fill" : "regular"} />
                  </div>
                  {isUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-info border-2 border-card" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <h4
                      className={`text-xs leading-snug font-semibold line-clamp-2 ${
                        isUnread ? "text-foreground font-bold" : "text-foreground/90"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <CaretRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
                  </div>

                  <p className="text-xxs text-muted-foreground leading-relaxed mt-1 line-clamp-2">{item.content}</p>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-border/40 text-xxxs text-muted-foreground">
                    <span className={`px-1.5 py-0.5 rounded text-xxxs font-medium ${SOURCE_BADGE[item.source]}`}>
                      {item.sourceName}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.pinned && (
                        <span className="flex items-center gap-0.5 text-brand font-medium">
                          <PushPin className="h-3 w-3 fill-brand" weight="fill" />
                          {t("beranda.messages.pinned")}
                        </span>
                      )}
                      <span>{formatRelativeTimestamp(item.timestamp, i18n.language)}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── News Bottom Footer (Matching Sidebar style) ── */}
      {onToggleCollapse && (
        <div className="border-t border-border shrink-0 bg-sidebar p-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand whitespace-nowrap cursor-pointer"
          >
            <span>{LBL_CLOSE_MESSAGE}</span>
            <CaretRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      )}

      <MessageDetailModal
        selectedMessage={selectedMessage}
        onClose={() => setSelectedIndex(null)}
        onNext={handleNextMessage}
        onPrev={handlePrevMessage}
        isFirst={selectedIndex === 0}
        isLast={selectedIndex === filteredMessages.length - 1}
        currentIndex={selectedIndex ?? 0}
        totalCount={filteredMessages.length}
        isRead={selectedMessage ? readIds.has(selectedMessage.id) : false}
        onToggleRead={toggleRead}
        formatRelativeTimestamp={formatRelativeTimestamp}
        sourceBadgeClass={selectedMessage ? SOURCE_BADGE[selectedMessage.source] : ""}
      />
    </div>
  );
}
