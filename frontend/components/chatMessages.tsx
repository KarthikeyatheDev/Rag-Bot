type Attachment = {
  name: string;
  size?: number;
};

type ChatMessageProps = {
  role: "assistant" | "user";
  content: string;
  attachment?: Attachment;
  status?: "uploading" | "uploaded" | "error";
};

function formatSize(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M7 3.5h6.5L18 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M13.5 3.5V8H18" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M12 8.5v5M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function Avatar({ isUser }: { isUser: boolean }) {
  return (
    <div
      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${
        isUser
          ? "bg-[#e8a13d]/15 text-[#e8a13d] ring-1 ring-[#e8a13d]/30"
          : "bg-white/[0.06] text-stone-300 ring-1 ring-white/10"
      }`}
    >
      {isUser ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 19.5c1.4-3.3 4-5 7-5s5.6 1.7 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <rect x="4" y="8" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8V5M9 5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="9" cy="13.2" r="1.1" fill="currentColor" />
          <circle cx="15" cy="13.2" r="1.1" fill="currentColor" />
        </svg>
      )}
    </div>
  );
}

export default function ChatMessage({ role, content, attachment, status }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`group flex max-w-[85%] items-start gap-3 animate-message-in sm:max-w-[70%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}>
      <Avatar isUser={isUser} />

      <div className={`flex min-w-0 flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        {attachment && (
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm ${
              isUser ? "border-[#e8a13d]/25 bg-[#e8a13d]/[0.07]" : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-stone-300">
              <FileIcon />
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-stone-100">{attachment.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                {status === "uploading" && (
                  <>
                    <SpinnerIcon />
                    <span>Uploading…</span>
                  </>
                )}
                {status === "uploaded" && (
                  <>
                    <span className="text-emerald-400"><CheckIcon /></span>
                    <span>Added to conversation</span>
                  </>
                )}
                {status === "error" && (
                  <>
                    <span className="text-rose-400"><AlertIcon /></span>
                    <span className="text-rose-400">Upload failed</span>
                  </>
                )}
                {!status && formatSize(attachment.size) && <span>{formatSize(attachment.size)}</span>}
              </div>
            </div>
          </div>
        )}

        {content && (
          <div
            className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
              isUser
                ? "rounded-tr-sm bg-[#e8a13d] text-[#1a1305]"
                : "rounded-tl-sm border border-white/10 bg-white/[0.05] text-stone-100"
            }`}
          >
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
