"use client";

export type Conversation = {
  id: string;
  title: string;
};

export function Sidebar({
  open,
  conversations,
  activeId,
  onSelect,
  onNew,
}: {
  open: boolean;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <aside
      className={[
        "h-screen border-r border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950",
        "transition-all duration-200 overflow-hidden",
        open ? "w-72" : "w-0",
      ].join(" ")}
    >
      <div className="h-full flex flex-col">
        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            + New chat
          </button>
        </div>

        <div className="px-2 pb-3 text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
          History
        </div>

        <div className="flex-1 overflow-auto px-2 pb-3 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={[
                "w-full text-left rounded-lg px-3 py-2 text-sm",
                "hover:bg-black/5 dark:hover:bg-white/5",
                activeId === c.id ? "bg-black/10 dark:bg-white/10" : "",
              ].join(" ")}
            >
              {c.title}
            </button>
          ))}
        </div>

        <div className="p-3 text-xs text-black/50 dark:text-white/50">
          MechanicAI • local dev
        </div>
      </div>
    </aside>
  );
}
