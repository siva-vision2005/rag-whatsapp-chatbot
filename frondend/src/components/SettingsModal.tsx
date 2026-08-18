"use client";

import { X, Settings2, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

interface SettingsConfig {
  mode: "live" | "demo";
  apiUrl: string;
  headers: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: SettingsConfig;
  onSave: (newConfig: SettingsConfig) => void;
  onClearChats: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onSave,
  onClearChats,
}: Props) {
  const [mode, setMode] = useState<"live" | "demo">(config.mode);
  const [apiUrl, setApiUrl] = useState(config.apiUrl);
  const [headers, setHeaders] = useState(config.headers);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (mode === "live") {
      if (!apiUrl.trim()) {
        setError("API URL is required for live mode.");
        return;
      }
      try {
        new URL(apiUrl);
      } catch (e) {
        setError("Invalid URL format.");
        return;
      }
      if (headers.trim()) {
        try {
          JSON.parse(headers);
        } catch (e) {
          setError("Headers must be a valid JSON object or empty.");
          return;
        }
      }
    }
    setError("");
    onSave({ mode, apiUrl, headers });
    onClose();
  };

  const handleReset = () => {
    const defaultUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/chat";
    setMode("live");
    setApiUrl(defaultUrl);
    setHeaders("{}");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md rounded-2xl bg-[#222e35] p-6 shadow-2xl transition-all border border-[#2a3942] flex flex-col max-h-[90vh] text-[#e9edef]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2a3942]">
          <div className="flex items-center gap-2 text-[#00a884]">
            <Settings2 size={20} />
            <h2 className="text-md font-semibold text-[#e9edef]">Connection & Chat Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8696a0] hover:text-[#e9edef] transition-colors p-1 rounded-full hover:bg-[#2a3942]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Mode Switcher */}
          <div>
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-2">
              Chat Interface Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#111b21] rounded-xl">
              <button
                type="button"
                onClick={() => setMode("demo")}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === "demo"
                    ? "bg-[#00a884] text-white shadow-sm"
                    : "text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33]"
                }`}
              >
                Demo Mode (Offline)
              </button>
              <button
                type="button"
                onClick={() => setMode("live")}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === "live"
                    ? "bg-[#00a884] text-white shadow-sm"
                    : "text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33]"
                }`}
              >
                Live Backend Mode
              </button>
            </div>
            <p className="mt-2 text-[11px] text-[#8696a0] leading-relaxed">
              {mode === "demo"
                ? "Simulates highly detailed RAG responses (vector search results, prompt assembly, and token stats) instantly."
                : "Connects directly to your own running RAG backend server via HTTP requests."}
            </p>
          </div>

          {/* Conditional Live settings */}
          {mode === "live" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1.5">
                  RAG API Endpoint URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:3000/chat"
                  className="w-full text-sm rounded-lg border border-[#2a3942] bg-[#111b21] px-3 py-2 outline-none focus:border-[#00a884]/60 text-[#e9edef] placeholder-[#8696a0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Custom HTTP Headers (JSON)</span>
                  <span className="text-[10px] text-[#8696a0] font-mono">{"{ \"Authorization\": \"...\" }"}</span>
                </label>
                <textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder='{ "Content-Type": "application/json" }'
                  rows={3}
                  className="w-full text-xs font-mono rounded-lg border border-[#2a3942] bg-[#111b21] px-3 py-2 outline-none focus:border-[#00a884]/60 text-[#e9edef] placeholder-[#8696a0]"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs font-semibold text-rose-400 bg-[#3f191f]/40 border border-rose-900/40 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="border-t border-[#2a3942] pt-4 space-y-3">
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
              Chat Controls
            </label>
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to clear all messages in this conversation?")) {
                  onClearChats();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-[#3f191f]/30 border border-rose-900/40 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              Clear Conversation History
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#2a3942] pt-4 mt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-[#8696a0] hover:text-[#e9edef] transition-colors font-medium cursor-pointer"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8696a0] hover:bg-[#2a3942] rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-medium text-white bg-[#00a884] hover:bg-[#008f72] rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
