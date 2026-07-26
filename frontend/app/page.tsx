"use client";
import { useEffect, useRef, useState } from "react";
import ChatInput from "@/components/chatInput";
import ChatMessage from "@/components/chatMessages";
import { fetchMessages, sendMessage, createConversation, fetchConversations, uploadFile } from "./api";

type Attachment = {
  name: string;
  size?: number;
};

type Message = {
  role: "assistant" | "user";
  content: string;
  attachment?: Attachment;
  status?: "uploading" | "uploaded" | "error";
};

type Conversation = {
  id: number;
};

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
      <path
        d="M4 5.5h16v10a1 1 0 0 1-1 1H9l-4 3.5v-3.5H5a1 1 0 0 1-1-1v-10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-[#e8a13d]">
      <path
        d="M12 3.5c.5 3 2.2 4.7 5.2 5.2-3 .5-4.7 2.2-5.2 5.3-.5-3.1-2.2-4.8-5.2-5.3 3-.5 4.7-2.2 5.2-5.2Z"
        fill="currentColor"
      />
      <path
        d="M18.5 15c.3 1.6 1.2 2.5 2.8 2.8-1.6.3-2.5 1.2-2.8 2.9-.3-1.7-1.2-2.6-2.8-2.9 1.6-.3 2.5-1.2 2.8-2.8Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex max-w-[70%] items-start gap-3 animate-message-in">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-stone-300 ring-1 ring-white/10">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <rect x="4" y="8" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8V5M9 5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.05] px-4 py-3.5">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-stone-400" style={{ animationDelay: "0ms" }} />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-stone-400" style={{ animationDelay: "150ms" }} />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-stone-400" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);

  const [convoList, setConvoList] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const conversations = await fetchConversations();
        setConvoList(conversations);
        if (conversations.length > 0) {
          setSelectedConvo(conversations[conversations.length - 1]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedConvo) return;

    const loadMessages = async () => {
      try {
        const data = await fetchMessages(selectedConvo.id);
        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadMessages();
  }, [selectedConvo]);

  const handleFileSelect = async (file: File) => {
    if (!selectedConvo?.id) return;

    const fileMessage: Message = {
      role: "user",
      content: "",
      attachment: { name: file.name, size: file.size },
      status: "uploading",
    };

    setMessages((prev) => [...prev, fileMessage]);
    setPendingFileName(file.name);

    try {
      await uploadFile(selectedConvo.id, file);
      setMessages((prev) => prev.map((m) => (m === fileMessage ? { ...m, status: "uploaded" } : m)));
    } catch (error) {
      console.error(error);
      setMessages((prev) => prev.map((m) => (m === fileMessage ? { ...m, status: "error" } : m)));
    } finally {
      setPendingFileName(null);
    }
  };

  const handleNewChat = async () => {
    try {
      const newConversation = await createConversation();
      setConvoList((prev) => [...prev, newConversation]);
      setSelectedConvo(newConversation);
      setMessages([]);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (isLoading || !input.trim() || !selectedConvo?.id) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      setIsLoading(true);
      const newMessage = await sendMessage(selectedConvo.id, userMessage.content);
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong sending that message. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarContent = (
    <>
      <button
        onClick={handleNewChat}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8a13d]/30 bg-[#e8a13d]/10 px-4 py-2.5 text-sm font-medium text-[#e8a13d] transition hover:bg-[#e8a13d]/15"
      >
        <PlusIcon />
        New chat
      </button>

      <div className="mt-5 flex-1 space-y-1 overflow-y-auto">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">Conversations</p>

        {convoList.length === 0 && (
          <div className="px-2 py-3 text-sm text-stone-500">No conversations yet</div>
        )}

        {convoList
          .slice()
          .reverse()
          .map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                setSelectedConvo(conversation);
                setIsSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                selectedConvo?.id === conversation.id
                  ? "bg-white/[0.08] text-stone-100"
                  : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-200"
              }`}
            >
              <ChatIcon />
              <span className="truncate">Conversation {conversation.id}</span>
            </button>
          ))}
      </div>
    </>
  );

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#0a0c10] text-stone-100">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 hover:bg-white/[0.06] hover:text-stone-200 lg:hidden"
            aria-label="Toggle conversation list"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8a13d]/15 text-[#e8a13d]">
            <SparkleIcon />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-stone-100">Knowledge Assistant</h1>
            <p className="text-xs leading-tight text-stone-500">Ask questions, grounded in your documents</p>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar - desktop */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 p-3 lg:flex">
          {sidebarContent}
        </aside>

        {/* Sidebar - mobile drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
            <aside className="relative z-50 flex w-72 flex-col border-r border-white/10 bg-[#0a0c10] p-3">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Chat column */}
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8a13d]/10 text-[#e8a13d]">
                    <SparkleIcon />
                  </div>
                  <h2 className="text-lg font-medium text-stone-200">
                    {selectedConvo ? "Start the conversation" : "Create a conversation to begin"}
                  </h2>
                  <p className="max-w-sm text-sm text-stone-500">
                    {selectedConvo
                      ? "Ask a question or attach a document with the paperclip icon below."
                      : "Use “New chat” in the sidebar to get started."}
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  attachment={message.attachment}
                  status={message.status}
                />
              ))}

              {isLoading && <TypingIndicator />}

              <div ref={scrollRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#0a0c10] px-4 py-4 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <ChatInput
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isLoading={isLoading}
                onFileSelect={handleFileSelect}
                pendingFileName={pendingFileName}
                disabled={!selectedConvo}
                placeholder={selectedConvo ? undefined : "Start a new chat to begin…"}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
