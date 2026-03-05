"use client";

import { useMemo, useState } from "react";

export type Msg = {
  role: "user" | "assistant";
  content: string;
};

export function Chat({
  messages,
  onSend,
}: {
  messages: Msg[];
  onSend: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const hasMessages = messages.length > 0;

  const canSend = useMemo(() => text.trim().length > 0, [text]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {!hasMessages ? (
          <div className="h-full flex items-center justify-center px-4">
            <div className="w-full max-w-2xl text-center">
              <h1 className="text-3xl font-semibold">MechanicAI</h1>
              <p className="mt-2 text-black/60 dark:text-white/60">
                Enter your vehicle and symptoms. I’ll suggest likely causes and next steps.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={[
                  "rounded-2xl px-4 py-3 whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-black/5 dark:bg-white/10"
                    : "bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10",
                ].join(" ")}
              >
                <div className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">
                  {m.role}
                </div>
                {m.content}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Describe your symptoms…"
              className="flex-1 resize-none rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
            />
            <button
              disabled={!canSend}
              onClick={async () => {
                const msg = text.trim();
                if (!msg) return;
                setText("");
                await onSend(msg);
              }}
              className={[
                "rounded-xl px-4 py-2",
                canSend
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-black/20 text-black/40 dark:bg-white/20 dark:text-white/40 cursor-not-allowed",
              ].join(" ")}
            >
              Send
            </button>
          </div>

          <div className="mt-2 text-xs text-black/50 dark:text-white/50">
            Example: 1999 Integra B18B1 hesitation above 4k RPM
          </div>
        </div>
      </div>
    </div>
  );
}