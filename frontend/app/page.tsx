"use client";
"use client";
import { useEffect, useRef, useState } from "react";
import ChatInput from "@/components/chatInput";
import ChatMessage from "@/components/chatMessages";
import { fetchMessages, sendMessage, createConversation, fetchConversations,uploadFile } from "./api";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type Conversation = {
  id: number;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [convoList, setConvoList] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll to bottom when messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  // load conversations once on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const conversations = await fetchConversations();
        setConvoList(conversations);

        if (conversations.length > 0) {
          // select last conversation by default
          setSelectedConvo(conversations[conversations.length - 1]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadConversations();
  }, []);

  // load messages when selected conversation changes
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

  const handleFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  if (
    !e.target.files ||
    !selectedConvo?.id
  ) return;

  const file = e.target.files[0];

  try {

    await uploadFile(
      selectedConvo?.id,
      file
    );

    console.log(
      "File uploaded successfully"
    );

  } catch (error) {

    console.error(error);

  }
};

  const handleNewChat = async () => {
    try {
      const newConversation = await createConversation();
      setConvoList((prev) => [...prev, newConversation]);
      setSelectedConvo(newConversation);
      setMessages([]);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">RAG Bot</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Chat with your knowledge assistant
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Streamlined AI chat with contextual retrieval in mind. This interface is optimized for speed,
                clarity, and a premium experience while you integrate your backend.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/90 px-5 py-4 text-sm text-slate-300 ring-1 ring-white/10">
              <div className="font-semibold text-white">Quick tips</div>
              <p className="mt-2 leading-6">
                Send a message, then watch the assistant think through the response. Use this as a clean RAG chat prototype.
              </p>
            </div>
          </div>
        </section>

        <div className="flex-1 overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex h-full min-h-[56vh] flex-col">
            {/* Top bar */}
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/90">Conversation</p>
                  <p className="mt-1 text-sm text-slate-400">Your messages are rendered in a clean conversational card layout.</p>
                </div>
                <div className="rounded-full bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300 ring-1 ring-white/10">
                  Live preview mode
                </div>
              </div>
            </div>

            {/* Main content: sidebar + chat */}
            <div className="flex-1 min-h-0 flex">
              <aside className="w-64 border-r border-white/10 p-4 overflow-y-auto min-h-0">
                <button onClick={handleNewChat} className="w-full rounded-lg bg-white/10 p-3">
                  + New Chat
                </button>

                <div className="mt-4 space-y-2">
                  {convoList.length === 0 && <div className="text-sm text-slate-400">No conversations yet</div>}

                  {convoList.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConvo(conversation)}
                      className={`w-full rounded-lg p-3 text-left ${selectedConvo?.id === conversation.id ? "bg-cyan-500/20" : "bg-white/5"}`}
                    >
                      Chat {conversation.id}
                    </button>
                  ))}
                </div>
              </aside>

              <section className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                  {messages.map((message, index) => (
                    <ChatMessage key={index} role={message.role} content={message.content} />
                  ))}

                  {isLoading && (
                    <div className="flex max-w-3xl items-center gap-4 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm text-cyan-100 shadow-lg shadow-cyan-500/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-200">⏳</div>
                      <div>
                        <div className="font-medium text-white">Thinking…</div>
                      </div>
                    </div>
                  )}

                  <div ref={scrollRef} />
                </div>

                <div className="px-6 py-6">
                  <input type="file" onChange={handleFileUpload}/>
                  <ChatInput input={input} setInput={setInput} onSend={handleSend} isLoading={isLoading} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}