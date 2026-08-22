export default function TypingIndicator() {
  return (
    <div className="flex w-full mb-3.5 justify-start pl-1">
      <div className="px-3 py-2.5 rounded-xl shadow-sm bg-[#202c33] rounded-tl-none border border-[#222e35]/50 flex items-center gap-1.5 w-16 h-[34px]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce"></span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></span>
      </div>
    </div>
  );
}