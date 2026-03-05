"use client";

import { useEffect, useState } from "react";
import { Sidebar, Conversation } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { Chat, Msg } from "../components/Chat";

type ChatApiResponse = {
  reply: string;
  likely_causes: string[];
  next_steps: string[];
  follow_up_questions: string[];
  risk_level: "low" | "medium" | "high";
};

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([
    { id: "c1", title: "New chat" },
  ]);

  const [activeId, setActiveId] = useState<string | null>("c1");
  const [messages, setMessages] = useState<Msg[]>([]);

  // Vehicle input fields
  const [year, setYear] = useState("1999");
  const [make, setMake] = useState("Acura");
  const [model, setModel] = useState("Integra");
  const [engine, setEngine] = useState("B18B1");
  const [vehicleError, setVehicleError] = useState("");

  useEffect(() => {
  const savedYear = localStorage.getItem("vehicle_year");
  const savedMake = localStorage.getItem("vehicle_make");
  const savedModel = localStorage.getItem("vehicle_model");
  const savedEngine = localStorage.getItem("vehicle_engine");

  if (savedYear) setYear(savedYear);
  if (savedMake) setMake(savedMake);
  if (savedModel) setModel(savedModel);
  if (savedEngine !== null) setEngine(savedEngine);
}, []);

useEffect(() => {
  localStorage.setItem("vehicle_year", year);
  localStorage.setItem("vehicle_make", make);
  localStorage.setItem("vehicle_model", model);
  localStorage.setItem("vehicle_engine", engine);
}, [year, make, model, engine]);

  function newChat() {
    const id = crypto.randomUUID();
    setConversations((prev) => [{ id, title: "New chat" }, ...prev]);
    setActiveId(id);
    setMessages([]);
  }

  function validateVehicle() {
  const trimmedYear = year.trim();
  const trimmedMake = make.trim();
  const trimmedModel = model.trim();

  if (!trimmedYear) {
    setVehicleError("Year is required.");
    return false;
  }

  const yearNumber = Number(trimmedYear);

  if (Number.isNaN(yearNumber) || yearNumber < 1886 || yearNumber > 2100) {
    setVehicleError("Enter a valid year.");
    return false;
  }

  if (!trimmedMake) {
    setVehicleError("Make is required.");
    return false;
  }

  if (!trimmedModel) {
    setVehicleError("Model is required.");
    return false;
  }

  setVehicleError("");
  return true;
}

  // onSend function starts here
  async function onSend(text: string) {
    if (!validateVehicle()) {
      return;
    } 
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicle: {
            year: Number(year),
            make: make.trim(),
            model: model.trim(),
            engine: engine.trim() || null,
          },
          message: text,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Backend error ${res.status}: ${errorText}`);
      }

      const data: ChatApiResponse = await res.json();

      const assistantText = [
        `Vehicle: ${year} ${make} ${model}${engine.trim() ? ` ${engine}` : ""}`,
        `Risk Level: ${data.risk_level}`,
        "",
        `Reply: ${data.reply}`,
        "",
        "Likely Causes:",
        ...data.likely_causes.map((item) => `- ${item}`),
        "",
        "Next Steps:",
        ...data.next_steps.map((item) => `- ${item}`),
        "",
        "Follow-up Questions:",
        ...data.follow_up_questions.map((item) => `- ${item}`),
      ].join("\n");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText },
      ]);

      if (messages.length === 0 && activeId) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId ? { ...c, title: text.slice(0, 28) || "New chat" } : c
          )
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${message}`,
        },
      ]);
    }
  }

  return (
    <div className="h-screen flex bg-zinc-50 dark:bg-black text-black dark:text-white">
      <Sidebar
        open={sidebarOpen}
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setMessages([]);
        }}
        onNew={newChat}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onLogin={() => alert("Next step: GitHub Login")}
        />

        {/* Vehicle form */}
        <div className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3">
          <div className="mx-auto max-w-5xl">
            <div className="mb-2 text-sm font-medium">Vehicle Information</div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <input
                type="number"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
              />

              <input
                type="text"
                placeholder="Make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
              />

              <input
                type="text"
                placeholder="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
              />

              <input
                type="text"
                placeholder="Engine (optional)"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
              />
            </div>
            {vehicleError && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                {vehicleError}
              </div>
          )}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <Chat messages={messages} onSend={onSend} />
        </div>
      </div>
    </div>
    
  );
}