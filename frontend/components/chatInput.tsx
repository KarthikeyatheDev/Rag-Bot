import { useRef } from "react";

type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  pendingFileName?: string | null;
  disabled?: boolean;
  placeholder?: string;
};

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M17 8.5 9.5 16a3 3 0 1 1-4.24-4.24L13.5 3.5a4.5 4.5 0 1 1 6.36 6.36L11.5 18.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M4.5 12h15M13 5.5 19.5 12 13 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  onFileSelect,
  pendingFileName,
  disabled,
  placeholder,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isDisabled = isLoading || disabled;

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#12141a] p-3 shadow-lg shadow-black/20">
      {pendingFileName && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#e8a13d]/10 px-3 py-1.5 text-xs text-[#e8a13d]">
          <PaperclipIcon />
          <span className="truncate">Attaching {pendingFileName}…</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          title="Attach a document"
          aria-label="Attach a document"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-stone-400 transition hover:bg-white/[0.06] hover:text-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PaperclipIcon />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder ?? "Ask a question about your documents…"}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoGrow(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
              requestAnimationFrame(() => {
                if (textareaRef.current) textareaRef.current.style.height = "auto";
              });
            }
          }}
          disabled={isDisabled}
          className="max-h-[200px] min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] text-stone-100 outline-none placeholder:text-stone-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          onClick={onSend}
          disabled={isDisabled || !input.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8a13d] text-[#1a1305] transition hover:bg-[#f0b158] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11px] text-stone-500">
        <span>Enter to send</span>
        <span>Shift + Enter for a new line</span>
      </div>
    </div>
  );
}
