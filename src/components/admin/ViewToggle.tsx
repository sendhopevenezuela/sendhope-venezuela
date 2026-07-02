"use client";

import { useState, useTransition } from "react";

type Props = {
  defaultView: "table" | "kanban";
  tableSlot: React.ReactNode;
  kanbanSlot: React.ReactNode;
};

export function ViewToggle({ defaultView, tableSlot, kanbanSlot }: Props) {
  const [view, setView] = useState<"table" | "kanban">(defaultView);

  return (
    <div>
      {/* Toggle buttons */}
      <div className="flex gap-1 p-1 bg-[#EEF4FF] rounded-xl w-fit mb-6">
        <button
          onClick={() => setView("table")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
            view === "table"
              ? "bg-white text-[#003082] shadow-sm"
              : "text-[#64748B] hover:text-[#003082]"
          }`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
          </svg>
          Tabla
        </button>
        <button
          onClick={() => setView("kanban")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
            view === "kanban"
              ? "bg-white text-[#003082] shadow-sm"
              : "text-[#64748B] hover:text-[#003082]"
          }`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M2 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 7a1 1 0 011-1h3a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm7-7a1 1 0 011-1h3a1 1 0 011 1v8a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm0 11a1 1 0 011-1h3a1 1 0 011 1v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1zm7-11a1 1 0 011-1h1a1 1 0 011 1v3a1 1 0 01-1 1h-1a1 1 0 01-1-1V4zm0 7a1 1 0 011-1h1a1 1 0 011 1v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-5z" />
          </svg>
          Kanban
        </button>
      </div>

      {/* Content */}
      {view === "table" ? tableSlot : kanbanSlot}
    </div>
  );
}
