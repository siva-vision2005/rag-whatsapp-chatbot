"use client";

import { RAGMetadata, RAGChunk } from "../types/message";
import { X, Cpu, Clock, Layers, FileText, Terminal, BarChart2 } from "lucide-react";
import { useState } from "react";

interface Props {
  metadata: RAGMetadata | null;
  onClose: () => void;
}

export default function RAGInspector({ metadata, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"chunks" | "prompt" | "raw">("chunks");

  if (!metadata) {
    return (
      <div className="w-[380px] md:w-[450px] border-l border-[#222e35] bg-[#0b141a] flex flex-col items-center justify-center p-8 text-center h-full">
        <div className="p-4 rounded-full bg-[#0a332c] text-[#00a884] mb-4 animate-pulse">
          <Cpu size={32} />
        </div>
        <h3 className="font-medium text-[#e9edef] text-lg">RAG Pipeline Inspector</h3>
        <p className="text-[#8696a0] text-sm mt-2 max-w-[280px]">
          Select any AI-generated response and click the <strong>Inspect RAG</strong> icon to explore how the model fetched documents and constructed the prompt.
        </p>
      </div>
    );
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-[#00a884]";
    if (score >= 0.6) return "bg-[#e2a938]";
    return "bg-[#f43f5e]";
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.8) return "bg-[#0a332c] border-[#00a884]/30 text-[#00a884]";
    if (score >= 0.6) return "bg-[#3e2e13] border-[#e2a938]/30 text-[#e2a938]";
    return "bg-[#3f191f] border-[#f43f5e]/30 text-[#f43f5e]";
  };

  return (
    <div className="w-[380px] md:w-[480px] border-l border-[#222e35] bg-[#111b21] flex flex-col h-full shadow-2xl relative z-10 animate-slideLeft text-[#e9edef]">
      {/* Header */}
      <div className="bg-[#202c33] text-[#e9edef] p-4 flex items-center justify-between border-b border-[#222e35] shadow-sm select-none">
        <div className="flex items-center gap-2">
          <Cpu size={20} className="text-[#00a884]" />
          <div>
            <h2 className="font-semibold text-sm">RAG Query Inspector</h2>
            <p className="text-[11px] text-[#8696a0] font-mono truncate max-w-[280px]">
              Query: "{metadata.query}"
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#2a3942] rounded-full transition-colors text-[#aebac1] hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-[#111b21] border-b border-[#222e35] text-xs">
        <div className="bg-[#182229] p-2.5 rounded-lg border border-[#222e35] shadow-sm flex flex-col items-center justify-center text-center">
          <Clock size={16} className="text-[#00a884] mb-1" />
          <span className="text-[10px] uppercase font-bold text-[#8696a0]">Latency</span>
          <span className="font-semibold text-[#e9edef] mt-0.5">{metadata.latencyMs ? `${metadata.latencyMs}ms` : "N/A"}</span>
        </div>
        <div className="bg-[#182229] p-2.5 rounded-lg border border-[#222e35] shadow-sm flex flex-col items-center justify-center text-center">
          <Layers size={16} className="text-[#a855f7] mb-1" />
          <span className="text-[10px] uppercase font-bold text-[#8696a0]">Tokens</span>
          <span className="font-semibold text-[#e9edef] mt-0.5">{metadata.tokensUsed ? metadata.tokensUsed : "N/A"}</span>
        </div>
        <div className="bg-[#182229] p-2.5 rounded-lg border border-[#222e35] shadow-sm flex flex-col items-center justify-center text-center">
          <Cpu size={16} className="text-[#3b82f6] mb-1" />
          <span className="text-[10px] uppercase font-bold text-[#8696a0]">LLM Model</span>
          <span className="font-semibold text-[#e9edef] mt-0.5 truncate max-w-[80px]" title={metadata.modelName || "Standard"}>
            {metadata.modelName || "GPT-4 / LLM"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222e35] bg-[#111b21] select-none">
        <button
          onClick={() => setActiveTab("chunks")}
          className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "chunks"
              ? "border-[#00a884] text-[#00a884] bg-[#202c33]"
              : "border-transparent text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33]/50"
          }`}
        >
          <FileText size={14} />
          Retrieved ({metadata.retrievedChunks.length})
        </button>
        <button
          onClick={() => setActiveTab("prompt")}
          className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "prompt"
              ? "border-[#00a884] text-[#00a884] bg-[#202c33]"
              : "border-transparent text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33]/50"
          }`}
        >
          <Terminal size={14} />
          Injected Prompt
        </button>
        <button
          onClick={() => setActiveTab("raw")}
          className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "raw"
              ? "border-[#00a884] text-[#00a884] bg-[#202c33]"
              : "border-transparent text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33]/50"
          }`}
        >
          <BarChart2 size={14} />
          Raw JSON
        </button>
      </div>

      {/* Tab Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111b21]">
        {activeTab === "chunks" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-1 select-none">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#8696a0]">Retrieved Context Blocks</h3>
              <span className="text-[10px] text-[#8696a0] italic">Sorted by similarity score</span>
            </div>

            {metadata.retrievedChunks.length === 0 ? (
              <p className="text-sm text-[#8696a0] text-center py-8">No context was retrieved for this request.</p>
            ) : (
              metadata.retrievedChunks.map((chunk, index) => {
                const percentScore = Math.round(chunk.score * 100);
                return (
                  <div key={index} className="border border-[#222e35] rounded-xl overflow-hidden shadow-sm hover:border-[#00a884]/30 transition-colors">
                    {/* Chunk Header */}
                    <div className="bg-[#202c33] px-3 py-2 flex items-center justify-between border-b border-[#222e35] select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0a332c] text-[#00a884] flex items-center justify-center text-[10px] font-bold border border-[#00a884]/20">
                          #{chunk.rank || index + 1}
                        </span>
                        <span className="text-xs font-semibold text-[#e9edef] truncate max-w-[180px]" title={chunk.source}>
                          {chunk.source.split(/[\\/]/).pop()}
                        </span>
                      </div>
                      
                      {/* Score Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getScoreBg(chunk.score)}`}>
                        Score: {chunk.score.toFixed(4)} ({percentScore}%)
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-3 text-xs leading-relaxed text-[#aebac1] bg-[#182229] select-text">
                      <p className="whitespace-pre-wrap font-sans font-normal leading-relaxed">{chunk.content}</p>
                    </div>

                    {/* Visual Meter Bar */}
                    <div className="w-full bg-[#222e35] h-1 select-none">
                      <div
                        className={`h-full ${getScoreColor(chunk.score)}`}
                        style={{ width: `${percentScore}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "prompt" && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex justify-between items-center select-none">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#8696a0]">Contextual System Prompt</h3>
              <span className="text-[10px] bg-[#2a3942] border border-[#222e35] text-[#e9edef] px-2 py-0.5 rounded font-medium">Injected Chunks</span>
            </div>
            
            {metadata.promptTemplate ? (
              <div className="flex-1 bg-[#0b141a] text-[#e9edef] font-mono text-[11px] p-3 rounded-xl overflow-auto select-all leading-relaxed shadow-inner border border-[#222e35]">
                <pre className="whitespace-pre-wrap">{metadata.promptTemplate}</pre>
              </div>
            ) : (
              <div className="flex-1 bg-[#0b141a] text-[#aebac1] font-mono text-[11px] p-3 rounded-xl overflow-auto leading-relaxed shadow-inner border border-[#222e35] flex flex-col select-text">
                <span className="text-[#8696a0] italic mb-2">// Auto-reconstructed system template context:</span>
                <span className="text-[#00a884]">{"SYSTEM:"}</span>
                <span className="pl-2 text-[#8696a0]">You are a retail helper. Answer based ONLY on the context below.</span>
                <span className="text-[#00a884] mt-2">{"CONTEXT:"}</span>
                {metadata.retrievedChunks.map((c, i) => (
                  <span key={i} className="pl-4 border-l border-[#0a332c] text-[#8696a0] my-1">
                    {`[Source: ${c.source.split(/[\\/]/).pop()}]`}
                    <br />
                    {c.content}
                  </span>
                ))}
                <span className="text-[#00a884] mt-2">{"USER QUESTION:"}</span>
                <span className="pl-2 text-[#3b82f6] font-semibold">"{metadata.query}"</span>
              </div>
            )}
            <p className="text-[10px] text-[#8696a0] select-none">
              The LLM reads this entire prompt structure to formulate the exact grounded response, matching your query.
            </p>
          </div>
        )}

        {activeTab === "raw" && (
          <div className="h-full flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#8696a0] mb-2 select-none">Raw Pipeline JSON</h3>
            <div className="flex-1 bg-[#0b141a] text-[#00a884] font-mono text-[11px] p-4 rounded-xl overflow-auto select-all border border-[#222e35] shadow-inner">
              <pre className="whitespace-pre">{JSON.stringify(metadata, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
