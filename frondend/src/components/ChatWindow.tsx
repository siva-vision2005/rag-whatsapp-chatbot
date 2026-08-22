import { useRef, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { ChatMessage as Message, RAGMetadata } from "../types/message";

interface Props {
  messages: Message[];
  isTyping: boolean;
  activeInspectMetadata: RAGMetadata | null;
  onInspectMessage: (metadata: RAGMetadata) => void;
  onDeleteMessage?: (id: string) => void;
  searchQuery?: string;
}

// Helper to format date groups (e.g. "Today", "Yesterday", "24 August 2026")
function getDateGroup(dateObj: Date | string): string {
  const d = typeof dateObj === "string" ? new Date(dateObj) : dateObj;
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return "Today";
  } else if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }
}

export default function ChatWindow({
  messages,
  isTyping,
  activeInspectMetadata,
  onInspectMessage,
  onDeleteMessage,
  searchQuery = ""
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Automatically scroll to bottom when messages list updates or typing status changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      
      // Briefly show date badges on new message
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 2000);
    }
  }, [messages, isTyping]);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 2000);
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter((m) => 
    searchQuery === "" || m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  
  filteredMessages.forEach((msg) => {
    const groupName = getDateGroup(msg.timestamp);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    
    if (lastGroup && lastGroup.date === groupName) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: groupName, messages: [msg] });
    }
  });

  return (
    <div 
      ref={scrollRef} 
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col bg-[#0b141a] relative min-h-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%231f2c34' fill-opacity='0.4'%3E%3Cpath fill-rule='evenodd' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zM11 68c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm58-13c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM31 38c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm18-23c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM31 73c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm34-47c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM15 47c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundAttachment: "local"
      }}
    >
      <div className="flex-1 flex flex-col justify-end">
        {messages.length === 0 ? (
          <div className="my-auto mx-auto max-w-sm text-center bg-[#182229]/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-[#222e35]/60">
            <span className="text-3xl">👋</span>
            <h3 className="font-semibold text-gray-200 mt-2">Welcome to AI Product Assistant!</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Ask any product specs, search, or comparisons. 
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date} className="flex flex-col w-full">
              {/* Date Badge Separator */}
              <div 
                className={`flex justify-center my-3 sticky top-2 z-10 transition-opacity duration-300 ${
                  isScrolling ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="bg-[#182229]/90 backdrop-blur-sm text-[#8696a0] text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-sm border border-[#222e35]/50 select-none">
                  {group.date}
                </span>
              </div>
              
              {/* Messages in this date group */}
              {group.messages.map((message) => {
                const isInspected = 
                  !!message.ragMetadata && 
                  activeInspectMetadata?.query === message.ragMetadata.query &&
                  activeInspectMetadata?.latencyMs === message.ragMetadata.latencyMs;

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onInspect={onInspectMessage}
                    isInspected={isInspected}
                    onDelete={onDeleteMessage}
                  />
                );
              })}
            </div>
          ))
        )}

        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
}