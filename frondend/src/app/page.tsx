"use client";

import { useState, useEffect } from "react";
import ChatHeader from "../components/ChatHeader";
import ChatInput from "../components/ChatInput";
import ChatWindow from "../components/ChatWindow";
import SettingsModal from "../components/SettingsModal";
import { ChatMessage, RAGMetadata } from "../types/message";
import { getMockRAGResponse } from "../utils/mockData";
import { 
  Search, 
  Settings, 
  MessageSquarePlus, 
  MessageSquare, 
  Phone, 
  CircleDot, 
  Sparkles, 
  Star,
  Users
} from "lucide-react";

interface SettingsConfig {
  mode: "live" | "demo";
  apiUrl: string;
  headers: string;
}

interface ChatSession {
  id: string;
  contactName: string;
  avatar: string;
  lastMessage: string;
  statusText: string;
  messages: ChatMessage[];
}

export default function Home() {
  // Layout responsiveness state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [activeTab, setActiveTab] = useState<"chats" | "updates" | "communities" | "calls">("chats");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // App Config Settings
  const [config, setConfig] = useState<SettingsConfig>({
    mode: "live",
    apiUrl: "http://localhost:3000/chat",
    headers: "{}",
  });

  // Load configuration and chat history from localstorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("rag_chat_config");
    if (savedConfig) {
      try { setConfig(JSON.parse(savedConfig)); } catch (e) {}
    } else {
      const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
      setConfig({
        mode: "live",
        apiUrl: `http://${host}:3000/chat`,
        headers: "{}",
      });
    }
  }, []);

  const saveConfig = (newConfig: SettingsConfig) => {
    setConfig(newConfig);
    localStorage.setItem("rag_chat_config", JSON.stringify(newConfig));
  };

  // Contacts/Chats state - ONLY keeping AI Product Assistant
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("ai-product-assistant");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Layout UI states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  // Backend Health Check
  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      if (config.mode === "demo") {
        if (isMounted) setIsBackendOnline(true);
        return;
      }

      try {
        let baseUrl = config.apiUrl;
        try {
          const parsed = new URL(config.apiUrl);
          baseUrl = `${parsed.protocol}//${parsed.host}`;
        } catch (e) {
          baseUrl = config.apiUrl.replace(/\/chat\/?$/, "");
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        let res = await fetch(`${baseUrl}/health`, {
          method: "GET",
          signal: controller.signal,
        }).catch(async () => {
          return await fetch(baseUrl, {
            method: "GET",
            signal: controller.signal,
          });
        });

        clearTimeout(timeoutId);

        if (isMounted) {
          setIsBackendOnline(res.ok);
        }
      } catch (err) {
        if (isMounted) {
          setIsBackendOnline(false);
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [config.apiUrl, config.mode]);

  // Initialize single chat session
  useEffect(() => {
    const initChats: ChatSession[] = [
      {
        id: "ai-product-assistant",
        contactName: "AI Product Assistant",
        avatar: "🤖",
        lastMessage: "Ask me about laptop specs or product choices!",
        statusText: "online • Product Catalog DB",
        messages: [
          {
            id: "init-1",
            sender: "assistant",
            content: "Hello! I am your AI Product Assistant. I am connected to our product catalog. Ask me things like:\n- 'Suggest laptops for gaming under 80000'\n- 'Which laptop has the best battery life?'",
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
          }
        ]
      }
    ];

    // Using v4 history key to force clearing of older multi-contact history lists
    const savedChats = localStorage.getItem("rag_chat_history_v4");
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        const hydrated = parsed.map((c: any) => ({
          ...c,
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setChats(hydrated);
      } catch (e) {
        setChats(initChats);
      }
    } else {
      setChats(initChats);
    }
  }, []);

  const saveChatsToStorage = (updatedChats: ChatSession[]) => {
    setChats(updatedChats);
    localStorage.setItem("rag_chat_history_v4", JSON.stringify(updatedChats));
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Send message handler
  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeChat) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: text,
      timestamp: new Date(),
    };

    // Append user message
    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChat.id) {
        return {
          ...chat,
          lastMessage: text,
          messages: [...chat.messages, userMessage],
        };
      }
      return chat;
    });
    saveChatsToStorage(updatedChats);
    setIsTyping(true);

    if (config.mode === "demo") {
      // --- DEMO OFFLINE MODE ---
      await new Promise((resolve) => setTimeout(resolve, 900));
      
      const mockResult = getMockRAGResponse(activeChat.id, text);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        content: mockResult.message,
        timestamp: new Date(),
        type: mockResult.type,
        products: mockResult.products,
        ragMetadata: mockResult.ragMetadata,
      };

      const finalChats = updatedChats.map((chat) => {
        if (chat.id === activeChat.id) {
          return {
            ...chat,
            lastMessage: botMessage.content.substring(0, 50),
            messages: [...chat.messages, botMessage],
          };
        }
        return chat;
      });

      setIsTyping(false);
      saveChatsToStorage(finalChats);


    } else {
      // --- LIVE BACKEND MODE ---
      try {
        let headersObj = { "Content-Type": "application/json" };
        if (config.headers.trim()) {
          try {
            headersObj = { ...headersObj, ...JSON.parse(config.headers) };
          } catch (e) {}
        }

        const res = await fetch(config.apiUrl, {
          method: "POST",
          headers: headersObj,
          body: JSON.stringify({
            message: text,
            chatId: activeChat.id,
          }),
        });

        if (!res.ok) {
          throw new Error(`Server returned status: ${res.status}`);
        }

        const data = await res.json();
        setIsTyping(false);

        const messageContent = data.message || data.response || data.content || JSON.stringify(data);
        
        const retrievedDocs = data.ragMetadata?.retrievedChunks || 
                             data.retrievedChunks || 
                             data.retrieved_documents || 
                             data.chunks || 
                             data.docs || [];
                             
        const mappedChunks = retrievedDocs.map((doc: any, i: number) => ({
          content: doc.content || doc.text || doc.page_content || JSON.stringify(doc),
          source: doc.source || doc.metadata?.source || doc.file || "unknown source",
          score: typeof doc.score === "number" ? doc.score : 0.85,
          rank: doc.rank || i + 1,
        }));

        const rMetadata: RAGMetadata = {
          query: data.ragMetadata?.query || text,
          tokensUsed: data.ragMetadata?.tokensUsed || data.tokens || data.total_tokens || undefined,
          latencyMs: data.ragMetadata?.latencyMs || data.latency || data.execution_time_ms || undefined,
          modelName: data.ragMetadata?.modelName || data.model || undefined,
          promptTemplate: data.ragMetadata?.promptTemplate || data.prompt || undefined,
          retrievedChunks: mappedChunks,
        };

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          content: messageContent,
          timestamp: new Date(),
          type: data.type || (data.products ? "products" : undefined),
          products: data.products,
          bestProduct: data.bestProduct,
          ragMetadata: rMetadata,
        };

        const finalChats = updatedChats.map((chat) => {
          if (chat.id === activeChat.id) {
            return {
              ...chat,
              lastMessage: botMessage.content.substring(0, 50),
              messages: [...chat.messages, botMessage],
            };
          }
          return chat;
        });
        saveChatsToStorage(finalChats);
        


      } catch (error: any) {
        console.error(error);
        setIsTyping(false);

        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          content: `❌ **Failed to reach Live RAG Endpoint**\n\nError: _${error.message || "Unknown error"}_.\n\nMake sure your server is running at \`${config.apiUrl}\` or click the settings icon at the top to toggle **Demo Mode** (offline mock data).`,
          timestamp: new Date(),
        };

        const finalChats = updatedChats.map((chat) => {
          if (chat.id === activeChat.id) {
            return {
              ...chat,
              lastMessage: "Connection Error",
              messages: [...chat.messages, errorMessage],
            };
          }
          return chat;
        });
        saveChatsToStorage(finalChats);
      }
    }
  };

  const clearChatHistory = () => {
    if (!activeChat) return;
    const clearedChats = chats.map((chat) => {
      if (chat.id === activeChat.id) {
        return {
          ...chat,
          lastMessage: "Conversation cleared",
          messages: [],
        };
      }
      return chat;
    });
    saveChatsToStorage(clearedChats);

  };

  const filteredChats = chats.filter((c) =>
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="h-screen h-[100dvh] bg-[#0b141a] flex items-center justify-center p-0 select-none overflow-hidden text-[#e9edef] w-full">
      
      {/* Container - WhatsApp Split Window Layout */}
      <div className="flex h-full w-full max-h-[100dvh] overflow-hidden bg-[#111b21] shadow-2xl relative">
        
        {/* Leftmost Vertical Navigation Rail */}
        {!isMobile && (
          <div className="hidden sm:flex w-[60px] bg-[#111b21] flex-col items-center py-4 justify-between border-r border-[#222e35] shrink-0">
            {/* Top Icons */}
            <div className="flex flex-col items-center gap-5 text-[#aebac1]">
              <div className="p-2 hover:bg-[#202c33] rounded-lg cursor-pointer text-[#00a884] bg-[#202c33]/50" title="Chats">
                <MessageSquare size={20} />
              </div>
              <div className="p-2 hover:bg-[#202c33] rounded-lg cursor-pointer hover:text-white" title="Calls">
                <Phone size={20} />
              </div>
              <div className="p-2 hover:bg-[#202c33] rounded-lg cursor-pointer hover:text-white" title="Status">
                <CircleDot size={20} />
              </div>
              <div className="p-2 hover:bg-[#202c33] rounded-lg cursor-pointer hover:text-white" title="Meta AI">
                <Sparkles size={20} className="text-[#a855f7]" />
              </div>
            </div>

            {/* Bottom Icons */}
            <div className="flex flex-col items-center gap-5 text-[#aebac1]">
              <div className="p-2 hover:bg-[#202c33] rounded-lg cursor-pointer hover:text-white" title="Starred Messages">
                <Star size={20} />
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Settings"
                className="p-2 hover:bg-[#202c33] rounded-lg cursor-pointer hover:text-white"
              >
                <Settings size={20} />
              </button>
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow cursor-pointer">
                S
              </div>
            </div>
          </div>
        )}

        {/* Contact List Sidebar Pane */}
        {(!isMobile || mobileView === "list") && (
          <div className="w-full sm:w-[340px] md:w-[380px] flex flex-col border-r border-[#222e35] bg-[#111b21] h-full shrink-0 relative">
            
            {/* Sidebar Top Header */}
            <div className="bg-[#111b21] h-16 flex items-center justify-between px-4">
              <h1 className="text-xl font-bold tracking-wide">Chats</h1>
              
              <div className="flex items-center gap-2 text-[#aebac1]">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  title="Settings"
                  className="p-2 hover:bg-[#202c33] rounded-full transition-colors cursor-pointer"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* Chat Search Box & Filter Row */}
            <div className="px-3 pb-2 bg-[#111b21] flex flex-col gap-2">
              <div className="w-full bg-[#202c33] rounded-lg flex items-center px-3 py-1.5 gap-3 border border-transparent focus-within:border-teal-500/30">
                <Search size={16} className="text-[#8696a0]" />
                <input
                  type="text"
                  placeholder="Search or start a new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs text-[#e9edef] bg-transparent outline-none placeholder-[#8696a0]"
                />
              </div>

              {/* Simulated Filter Badges */}
              <div className="flex items-center gap-1.5 py-1 text-xs select-none overflow-x-auto no-scrollbar">
                <span className="px-3 py-1 rounded-full bg-[#0a332c] text-[#00a884] font-medium cursor-pointer">All</span>
                <span className="px-3 py-1 rounded-full bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef] cursor-pointer">Unread</span>
                <span className="px-3 py-1 rounded-full bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef] cursor-pointer">Favourites</span>
                <span className="px-3 py-1 rounded-full bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef] cursor-pointer">Groups</span>
              </div>
            </div>

            {/* Contact Scroll List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/30">
              {filteredChats.length === 0 ? (
                <p className="text-xs text-[#8696a0] text-center py-8">No chats found.</p>
              ) : (
                filteredChats.map((chat) => {
                  const isActive = chat.id === activeChatId;
                  const lastMsg = chat.messages.length > 0 
                    ? chat.messages[chat.messages.length - 1]
                    : null;
                  const lastMsgTime = lastMsg ? new Date(lastMsg.timestamp) : new Date();
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setActiveChatId(chat.id);
                        setMobileView("chat");
                      }}
                      className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors ${
                        isActive && !isMobile ? "bg-[#2a3942]" : "hover:bg-[#202c33]"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#202c33] text-xl flex items-center justify-center shadow-sm shrink-0 border border-[#222e35]/20 select-none">
                        {chat.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-[15px] text-[#e9edef] truncate">
                            {chat.contactName}
                          </h3>
                          <span className="text-[10px] text-[#8696a0] shrink-0 font-medium">
                            {lastMsgTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#8696a0] truncate mt-0.5 font-normal">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Floating Action Button (FAB) on Mobile */}
            {isMobile && (
              <button
                onClick={() => alert("New AI Product Chat initiated!")}
                className="absolute bottom-20 right-4 w-12 h-12 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-[#008f72] cursor-pointer"
              >
                <MessageSquarePlus size={22} />
              </button>
            )}

            {/* Mobile Bottom Navigation Bar */}
            {isMobile && (
              <div className="h-16 border-t border-[#222e35] bg-[#111b21] flex items-center justify-around text-xs shrink-0 select-none">
                <button
                  onClick={() => setActiveTab("chats")}
                  className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "chats" ? "text-[#00a884]" : "text-[#8696a0]"
                  }`}
                >
                  <div className={`px-5 py-1 rounded-full ${activeTab === "chats" ? "bg-[#0a332c]" : ""}`}>
                    <MessageSquare size={20} />
                  </div>
                  <span>Chats</span>
                </button>

                <button
                  onClick={() => setActiveTab("updates")}
                  className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "updates" ? "text-[#00a884]" : "text-[#8696a0]"
                  }`}
                >
                  <div className={`px-5 py-1 rounded-full ${activeTab === "updates" ? "bg-[#0a332c]" : ""}`}>
                    <CircleDot size={20} />
                  </div>
                  <span>Updates</span>
                </button>

                <button
                  onClick={() => setActiveTab("communities")}
                  className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "communities" ? "text-[#00a884]" : "text-[#8696a0]"
                  }`}
                >
                  <div className={`px-5 py-1 rounded-full ${activeTab === "communities" ? "bg-[#0a332c]" : ""}`}>
                    <Users size={20} />
                  </div>
                  <span>Communities</span>
                </button>

                <button
                  onClick={() => setActiveTab("calls")}
                  className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "calls" ? "text-[#00a884]" : "text-[#8696a0]"
                  }`}
                >
                  <div className={`px-5 py-1 rounded-full ${activeTab === "calls" ? "bg-[#0a332c]" : ""}`}>
                    <Phone size={20} />
                  </div>
                  <span>Calls</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Side: Active Chat Stream */}
        {(!isMobile || mobileView === "chat") && (
          <div className="flex-1 flex flex-col h-full min-w-0 min-h-0 bg-[#0b141a] relative overflow-hidden">
            {activeChat ? (
              <>
                <ChatHeader
                  contactName={activeChat.contactName}
                  statusText={isBackendOnline ? "online" : "offline"}
                  isOnline={isBackendOnline}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onBack={isMobile ? () => setMobileView("list") : undefined}
                />

                <ChatWindow
                  messages={activeChat.messages}
                  isTyping={isTyping}
                  activeInspectMetadata={null}
                  onInspectMessage={() => {}}
                />

                <ChatInput onSend={sendMessage} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6 bg-[#0b141a]">
                <div>
                  <span className="text-5xl">💬</span>
                  <h2 className="text-lg font-bold text-[#e9edef] mt-3">Select a chat to begin</h2>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Settings configuration modal dialog overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={saveConfig}
        onClearChats={clearChatHistory}
      />

    </main>
  );
}