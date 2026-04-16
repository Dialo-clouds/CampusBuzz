"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Send, User, MessageCircle } from "lucide-react";

interface ChatUser {
  id: string;
  name: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        // Sync current user to database
        await fetch("/api/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name,
          }),
        });
        fetchUsers();
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  async function fetchUsers() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/chat-users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(otherUserId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/messages?userId=${otherUserId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedUser.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewMessage("");
        fetchMessages(selectedUser.id);
      } else {
        alert(`Failed to send: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Messages</h1>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden h-[70vh]">
          <div className="flex h-full">
            {/* Users Sidebar */}
            <div className="w-80 border-r border-white/10 bg-white/5">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Contacts ({users.length})</h2>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                {users.length === 0 ? (
                  <div className="p-8 text-center">
                    <User className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No other users yet</p>
                    <p className="text-white/30 text-sm">Share this app with friends to chat!</p>
                  </div>
                ) : (
                  users.map((chatUser) => (
                    <button
                      key={chatUser.id}
                      onClick={() => setSelectedUser(chatUser)}
                      className={`w-full p-4 text-left hover:bg-white/10 transition-all flex items-center gap-3 ${
                        selectedUser?.id === chatUser.id ? "bg-purple-600/20 border-l-4 border-purple-500" : ""
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{chatUser.name || chatUser.email}</p>
                        <p className="text-white/40 text-xs">Click to chat</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{selectedUser.name || selectedUser.email}</h3>
                        <p className="text-white/40 text-xs">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/40">No messages yet</p>
                          <p className="text-white/30 text-sm">Send a message to start the conversation</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                : "bg-white/10 text-white"
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40">Select a contact to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}