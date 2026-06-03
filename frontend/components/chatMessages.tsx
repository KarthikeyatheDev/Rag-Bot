type ChatMessageProps = {
  role: "assistant" | "user";
  content: string;
};

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex max-w-3xl items-start gap-4 ${isUser ? "ml-auto flex-row-reverse" : ""}`}>
      <div
        className={`mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-semibold uppercase tracking-[0.22em] ${
          isUser
            ? "border-cyan-500 bg-cyan-500/15 text-cyan-200"
            : "border-slate-500 bg-slate-500/15 text-slate-200"
        }`}
      >
        {isUser ? "You" : "AI"}
      </div>
      <div
        className={`rounded-3xl border px-5 py-4 text-sm leading-7 shadow-lg ${
          isUser
            ? "border-cyan-500/20 bg-slate-950/90 text-slate-100"
            : "border-white/10 bg-white/10 text-slate-100"
        }`}
      >
        {content}
      </div>
    </div>
  );
}