"use client";

import { MoreVertical, Settings2, ArrowLeft } from "lucide-react";

interface Props {
  contactName: string;
  statusText: string;
  onOpenSettings: () => void;
  onBack?: () => void;
}

export default function ChatHeader({
  contactName,
  statusText,
  onOpenSettings,
  onBack,
}: Props) {
  return (
    <div className="bg-[#202c33] text-[#e9edef] h-16 flex items-center justify-between px-4 border-b border-[#222e35] select-none shrink-0">
      
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
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#202c33] rounded-full"></span>
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
        <button
          onClick={onOpenSettings}
          title="Connection & App Settings"
          className="p-2 hover:bg-[#2a3942] rounded-full transition-all cursor-pointer hover:text-white"
        >
          <Settings2 size={19} />
        </button>
        <button
          title="More options"
          className="p-2 hover:bg-[#2a3942] rounded-full transition-all cursor-pointer hover:text-white"
        >
          <MoreVertical size={19} />
        </button>
      </div>

    </div>
  );
}


