import { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { ChatMessage as Message, RAGMetadata } from "../types/message";

interface Props {
  messages: Message[];
  isTyping: boolean;
  activeInspectMetadata: RAGMetadata | null;
  onInspectMessage: (metadata: RAGMetadata) => void;
}

export default function ChatWindow({
  messages,
  isTyping,
  activeInspectMetadata,
  onInspectMessage,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to bottom when messages list updates or typing status changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div 
      ref={scrollRef} 
      className="flex-1 overflow-y-auto px-6 py-4 flex flex-col bg-[#0b141a] relative"
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
              Click the gear icon in the settings bar to switch between Live and offline Demo modes.
            </p>
          </div>
        ) : (
          messages.map((message) => {
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
              />
            );
          })
        )}

        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
}