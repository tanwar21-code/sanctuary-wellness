'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect, useRef } from 'react';

const suggestedPrompts = ['I feel lonely', "I can't focus on studies", "I'm burned out", 'I feel anxious about exams', 'I need motivation', "I'm having trouble sleeping"];

interface ChatMsg { id?: string; user_message: string; ai_response: string; created_at?: string; }

export default function AISupportPage() {
  const { dbUser } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dbUser?.id) {
      fetch(`/api/ai-chat?userId=${dbUser.id}`)
        .then(r => r.json())
        .then(d => { setMessages(d.chats || []); setLoadingHistory(false); })
        .catch(() => setLoadingHistory(false));
    }
  }, [dbUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || !dbUser || loading) return;
    setInput('');
    setLoading(true);

    // Optimistic: show user message
    const tempMsg: ChatMsg = { user_message: msg, ai_response: '' };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: dbUser.id, message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev.slice(0, -1), data.chat]);
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { user_message: msg, ai_response: 'Sorry, something went wrong. Please try again. 💙' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="animate-fadeIn" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Disclaimer */}
      <div style={{ padding: '10px 16px', background: '#fef3c7', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: '0.8rem', color: '#92400e', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
        ⚠️ AI support is not a replacement for professional medical care.
      </div>

      {/* Chat Area */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gradient-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧠</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Sanctuary AI</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--mint-dark)' }}>● Online — Here to listen</div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loadingHistory ? (
            <div className="loading-container"><div className="loading-spinner" /></div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>💬</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Start a Conversation</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: 24 }}>I&apos;m here to listen and support you.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {suggestedPrompts.map((p, i) => (
                  <button key={i} onClick={() => sendMessage(p)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'var(--bg-accent)', border: '1px solid var(--border-light)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--lavender-dark)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i}>
                  <div className="chat-bubble user">{msg.user_message}</div>
                  {msg.ai_response && (
                    <div className="chat-bubble ai" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{msg.ai_response}</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="chat-bubble ai" style={{ display: 'flex', gap: 6 }}>
                  <span style={{ animation: 'typing 1.4s infinite', animationDelay: '0s' }}>●</span>
                  <span style={{ animation: 'typing 1.4s infinite', animationDelay: '0.2s' }}>●</span>
                  <span style={{ animation: 'typing 1.4s infinite', animationDelay: '0.4s' }}>●</span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." rows={1} style={{ flex: 1, resize: 'none', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', outline: 'none', maxHeight: 120 }} />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="btn-primary" style={{ padding: '12px 20px', opacity: !input.trim() || loading ? 0.5 : 1 }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
