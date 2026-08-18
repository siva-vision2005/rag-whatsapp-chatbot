"use client";

import { useState, useRef } from "react";
import { Smile, Paperclip, SendHorizontal, Mic, Plus } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3 border-t border-[#222e35]/30 shrink-0">
      
      {/* Emoji and Attachment Icon Panel */}
      <div className="flex items-center gap-2 text-[#8696a0]">
        <button
          type="button"
          title="Attach files"
          className="p-1.5 hover:bg-[#2a3942] rounded-full transition-all cursor-pointer hover:text-white"
        >
          <Plus size={22} />
        </button>
        <button
          type="button"
          title="Emojis"
          className="p-1.5 hover:bg-[#2a3942] rounded-full transition-all cursor-pointer hover:text-white"
        >
          <Smile size={22} />
        </button>
      </div>

      {/* Message Input Box */}
      <div className="flex-1">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          type="text"
          placeholder="Type a message"
          className="w-full rounded-lg bg-[#2a3942] px-4 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] outline-none border border-transparent focus:border-transparent shadow-inner"
        />
      </div>

      {/* Dynamic Action Button: Send or Microphone */}
      <div className="text-[#8696a0] flex items-center shrink-0">
        {text.trim() ? (
          <button
            onClick={handleSend}
            title="Send message"
            className="p-2 bg-[#00a884] text-white hover:bg-[#008f72] rounded-full transition-all cursor-pointer shadow-md active:scale-95"
          >
            <SendHorizontal size={18} />
          </button>
        ) : (
          <button
            type="button"
            title="Voice message"
            className="p-2 hover:bg-[#2a3942] rounded-full transition-all cursor-pointer hover:text-white"
          >
            <Mic size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
