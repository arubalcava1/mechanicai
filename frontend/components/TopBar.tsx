"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function TopBar({
  onToggleSidebar,
  onLogin,
}: {
  onToggleSidebar: () => void;
  onLogin: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="h-14 flex items-center justify-between px-3 border-b border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="font-semibold">MechanicAI</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(mounted && theme === "dark" ? "light" : "dark")}
          className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
        >
          {mounted && theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <button
          onClick={onLogin}
          className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
        >
          Login
        </button>
      </div>
    </header>
  );
}