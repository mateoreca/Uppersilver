'use client';

import { useState, useRef, useEffect } from 'react';

interface AiChatProps {
  /** URL base del backend NestJS, e.g. http://localhost:3001 */
  backendUrl?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AiChat({ backendUrl = process.env.NEXT_PUBLIC_API_URL ?? '' }: AiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${backendUrl}/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error('Error del servidor');

      const text = await res.text();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError('Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        id="ai-chat-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--gradient-gold)',
          border: 'none',
          color: '#1a1000',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(212,175,122,0.35)',
          transition: 'transform 150ms, box-shadow 150ms',
        }}
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente de UpperSilver'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Panel del chat */}
      {isOpen && (
        <div
          id="ai-chat-panel"
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            width: '360px',
            height: '500px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            overflow: 'hidden',
          }}
          role="dialog"
          aria-label="Asistente de UpperSilver"
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--bg-elevated)',
              padding: '16px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--gradient-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1a1000',
              }}
            >
              US
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Asistente UpperSilver</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Te ayudo a encontrar lo que buscas</p>
            </div>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 && (
              <div style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                <p style={{ fontSize: '24px', marginBottom: '8px' }}>👋</p>
                <p>¡Hola! Soy el asistente de UpperSilver.</p>
                <p style={{ marginTop: '4px' }}>Pregúntame sobre productos, tallas o precios.</p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '80%',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    background: message.role === 'user' ? 'var(--gradient-gold)' : 'var(--bg-elevated)',
                    color: message.role === 'user' ? '#1a1000' : 'var(--text-primary)',
                    border: message.role === 'assistant' ? '1px solid var(--border-card)' : 'none',
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: '12px', padding: '12px 16px', border: '1px solid var(--border-card)' }}>
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', animation: `fadeUp 0.8s ${delay}ms ease infinite alternate` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#ef4444' }}>{error}</p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
            }}
          >
            <input
              id="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="¿Qué estás buscando?"
              disabled={isLoading}
              style={{
                flex: 1,
                borderRadius: '100px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-base)',
                padding: '10px 16px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              id="ai-chat-send"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: input.trim() ? 'var(--gradient-gold)' : 'var(--bg-elevated)',
                border: 'none',
                color: input.trim() ? '#1a1000' : 'var(--text-muted)',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 150ms',
              }}
              aria-label="Enviar mensaje"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: 'rotate(90deg)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
