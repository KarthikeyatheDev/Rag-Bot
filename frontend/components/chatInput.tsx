type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
};

export default function ChatInput({ input, setInput, onSend, isLoading }: ChatInputProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/90 p-4 shadow-inner shadow-slate-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        
        <textarea
        rows={1}
          placeholder="Type your question here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        disabled={isLoading}
        className="min-h-14 flex-1 resize-none rounded-2xl border border-transparent bg-slate-950/80 px-5 py-4 text-sm text-slate-100 outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <button
        onClick={onSend}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Waiting…" : "Send"}
      </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span>Press Enter to send</span>
        <span className="rounded-full bg-white/5 px-2 py-1">Shift + Enter for new line</span>
      </div>
    </div>
  );
}