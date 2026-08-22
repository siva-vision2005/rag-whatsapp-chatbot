"use client";

import { MoreVertical, ArrowLeft, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
  contactName: string;
  statusText: string;
  isOnline?: boolean;
  onBack?: () => void;
  onToggleSearch?: () => void;
  onClearChat?: () => void;
  onExportChat?: () => void;
}

export default function ChatHeader({
  contactName,
  statusText,
  isOnline = false,
  onBack,
  onToggleSearch,
  onClearChat,
  onExportChat,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-[#202c33] text-[#e9edef] h-16 flex items-center justify-between px-4 border-b border-[#222e35] select-none shrink-0 relative">
      
      {/* Contact Profile Info */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            title="Back to chats"
            className="p-1.5 hover:bg-[#2a3942] rounded-full transition-all cursor-pointer text-[#aebac1] hover:text-white mr-1 flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="w-10 h-10 rounded-full bg-[#111b21] flex items-center justify-center text-lg shadow-inner relative border border-[#222e35]/30 shrink-0">
          🤖
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#202c33] rounded-full"></span>
          )}
        </div>

        <div>
          <h1 className="font-medium text-[15px] tracking-wide leading-tight text-[#e9edef]">
            {contactName}
          </h1>
          <p className="text-[11.5px] text-[#8696a0] font-normal">
            {statusText}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 text-[#aebac1]">
        {onToggleSearch && (
          <button
            onClick={onToggleSearch}
            title="Search Chat"
            className="p-2 hover:bg-[#2a3942] rounded-full transition-all cursor-pointer hover:text-white"
          >
            <Search size={19} />
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Menu"
            className={`p-2 rounded-full transition-all cursor-pointer hover:text-white ${isMenuOpen ? "bg-[#2a3942] text-white" : "hover:bg-[#2a3942]"}`}
          >
            <MoreVertical size={19} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-[#233138] rounded shadow-lg py-2 z-50 text-[14.5px] text-[#e9edef]">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onClearChat) onClearChat();
                }}
                className="w-full text-left px-5 py-3 hover:bg-[#182229] transition-colors cursor-pointer"
              >
                Clear chat
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onExportChat) onExportChat();
                }}
                className="w-full text-left px-5 py-3 hover:bg-[#182229] transition-colors cursor-pointer"
              >
                Export chat
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}