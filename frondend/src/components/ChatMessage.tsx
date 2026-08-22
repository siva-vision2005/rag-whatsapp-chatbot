"use client";

import { ChatMessage as Message, RAGMetadata } from "../types/message";
import ProductCard from "./ProductCard";
import { CheckCheck } from "lucide-react";

interface Props {
  message: Message;
  onInspect?: (metadata: RAGMetadata) => void;
  isInspected?: boolean;
  onDelete?: (id: string) => void;
}

/**
 * Render basic markdown formatting into React elements.
 * Handles: **bold**, *italic*, `code`, markdown tables, and newlines.
 */
function renderMarkdown(text: string) {
  const lines = text.split("\n");

  // Detect if a block contains a markdown table
  const tableBlocks: { start: number; end: number }[] = [];
  let i = 0;
  while (i < lines.length) {
    // A table starts with a line containing |, followed by a separator line like |---|---|
    if (
      lines[i].trim().startsWith("|") &&
      i + 1 < lines.length &&
      /^\|[\s\-:|]+\|/.test(lines[i + 1].trim())
    ) {
      const start = i;
      // Skip header and separator
      i += 2;
      // Continue while lines start with |
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        i++;
      }
      tableBlocks.push({ start, end: i });
    } else {
      i++;
    }
  }

  const elements: React.ReactNode[] = [];
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    // Check if current line starts a table block
    const tableBlock = tableBlocks.find((b) => b.start === lineIdx);

    if (tableBlock) {
      // Parse the table
      const headerLine = lines[tableBlock.start];
      // Skip separator line (tableBlock.start + 1)
      const dataLines = lines.slice(tableBlock.start + 2, tableBlock.end);

      const parseRow = (line: string) =>
        line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell.length > 0);

      const headers = parseRow(headerLine);
      const rows = dataLines.map(parseRow);

      elements.push(
        <div key={`table-${lineIdx}`} className="my-2 overflow-x-auto rounded-lg border border-[#222e35]">
          <table className="w-full text-[12.5px] text-left">
            <thead>
              <tr className="bg-[#1a2730] border-b border-[#222e35]">
                {headers.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 font-semibold text-[#00a884] whitespace-nowrap">
                    {formatInlineMarkdown(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={`border-b border-[#222e35]/40 ${ri % 2 === 0 ? "bg-[#182229]" : "bg-[#1a2730]/50"}`}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-1.5 text-[#e9edef] whitespace-nowrap">
                      {formatInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      lineIdx = tableBlock.end;
    } else {
      // Render normal line with inline markdown formatting
      const line = lines[lineIdx];
      elements.push(
        <span key={`line-${lineIdx}`}>
          {formatInlineMarkdown(line)}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      );
      lineIdx++;
    }
  }

  return <>{elements}</>;
}

/** Handle inline markdown: **bold**, *italic*, `code` */
function formatInlineMarkdown(text: string): React.ReactNode {
  // Split the text into segments by markdown patterns
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Match **bold**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Match *italic* (but not **)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
    // Match `code`
    const codeMatch = remaining.match(/`([^`]+?)`/);

    // Find the earliest match
    const matches = [
      boldMatch ? { type: "bold", match: boldMatch, index: boldMatch.index! } : null,
      italicMatch ? { type: "italic", match: italicMatch, index: italicMatch.index! } : null,
      codeMatch ? { type: "code", match: codeMatch, index: codeMatch.index! } : null,
    ].filter(Boolean) as { type: string; match: RegExpMatchArray; index: number }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    matches.sort((a, b) => a.index - b.index);
    const earliest = matches[0];

    // Add text before the match
    if (earliest.index > 0) {
      parts.push(remaining.substring(0, earliest.index));
    }

    // Add formatted element
    if (earliest.type === "bold") {
      parts.push(<strong key={key++} className="font-bold">{earliest.match[1]}</strong>);
    } else if (earliest.type === "italic") {
      parts.push(<em key={key++}>{earliest.match[1]}</em>);
    } else if (earliest.type === "code") {
      parts.push(
        <code key={key++} className="bg-[#111b21] text-[#00a884] text-[11.5px] px-1 py-0.5 rounded font-mono">
          {earliest.match[1]}
        </code>
      );
    }

    remaining = remaining.substring(earliest.index + earliest.match[0].length);
  }

  return <>{parts}</>;
}

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function ChatMessage({ message, onInspect, isInspected, onDelete }: Props) {
  const isUser = message.sender === "user";
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

  // Format timestamp (e.g. 10:45 AM)
  const formatTime = (dateObj: Date | string) => {
    const d = typeof dateObj === "string" ? new Date(dateObj) : dateObj;
    try {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className={`flex w-full mb-3.5 group ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative ${
          message.type === "products" || (message.products && message.products.length > 0)
            ? "w-full max-w-[95%] sm:max-w-[85%]"
            : "max-w-[88%] sm:max-w-[75%]"
        } px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl shadow-[0_1px_0.5px_rgba(0,0,0,.15)] transition-all ${
          isUser
            ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
            : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
        }`}
      >
        {/* Message Content with Markdown Rendering */}
        <div className="text-[14.2px] leading-[19px] whitespace-pre-wrap pr-12 pb-1.5 break-words select-text">
          {renderMarkdown(message.content)}
        </div>

        {/* Product List Showcase */}
        {message.type === "products" && message.products && message.products.length > 0 && (
          <div className="mt-3.5 space-y-3">
            {message.products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        )}

        {/* Meta Row: Timestamp and Ticks */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1.5 select-none">
          {/* Timestamp */}
          <span className="text-[10px] text-[#8696a0]">
            {formatTime(message.timestamp)}
          </span>
          
          {/* User Double Blue Ticks */}
          {isUser && (
            <span className="text-[#53bdeb] flex items-center">
              <CheckCheck size={15} />
            </span>
          )}
        </div>

        {/* Hover Delete Dropdown */}
        {onDelete && (
          <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-[#8696a0] hover:text-white bg-gradient-to-l from-[#202c33] to-transparent pl-4"
            >
              <ChevronDown size={20} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-6 w-36 bg-[#233138] rounded shadow-xl py-2 z-50 text-[14.5px] text-[#e9edef] border border-[#222e35]">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(message.id);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors cursor-pointer text-red-400 hover:text-red-300"
                >
                  Delete message
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}