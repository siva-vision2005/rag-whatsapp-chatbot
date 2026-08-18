export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white rounded-2xl px-4 py-3 shadow max-w-xs">
        <p className="text-sm text-gray-500 mb-2">
          AI Product Assistant is typing...
        </p>

        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
          <span
            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}