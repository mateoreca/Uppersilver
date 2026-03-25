'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';

interface AiChatProps {
  /** URL base del backend NestJS, e.g. http://localhost:3001 */
  backendUrl?: string;
}

export function AiChat({ backendUrl = process.env.NEXT_PUBLIC_API_URL ?? '' }: AiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    // Apuntamos al endpoint de streaming del backend NestJS
    api: `${backendUrl}/ai/chat/stream`,
    // Transformamos la request para que el backend reciba { message }
    fetch: async (url, options) => {
      const body = JSON.parse(options?.body as string);
      return fetch(url, {
        ...options,
        body: JSON.stringify({ message: body.messages.at(-1)?.content ?? '' }),
        headers: { 'Content-Type': 'application/json', ...options?.headers },
      });
    },
    // Parseamos la respuesta SSE del formato { chunk: "..." } de NestJS
    streamProtocol: 'text',
  });

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Botón flotante */}
      <button
        id="ai-chat-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-neutral-500"
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente de UpperSilver'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Panel del chat */}
      {isOpen && (
        <div
          id="ai-chat-panel"
          className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[360px] flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl"
          role="dialog"
          aria-label="Asistente de UpperSilver"
        >
          {/* Header */}
          <div className="flex items-center gap-3 rounded-t-2xl bg-neutral-900 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-900 text-sm font-bold">
              US
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Asistente UpperSilver</p>
              <p className="text-xs text-neutral-400">Te ayudo a encontrar lo que buscas</p>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="mt-4 text-center text-sm text-neutral-400">
                <p className="text-2xl mb-2">👋</p>
                <p>¡Hola! Soy el asistente de UpperSilver.</p>
                <p className="mt-1">Pregúntame sobre productos, tallas, precios o stock.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-neutral-900 text-white rounded-br-sm'
                      : 'bg-neutral-100 text-neutral-800 rounded-bl-sm'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl bg-neutral-100 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-center text-xs text-red-500">
                Ocurrió un error. Por favor intenta de nuevo.
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-neutral-100 px-3 py-3"
          >
            <input
              id="ai-chat-input"
              value={input}
              onChange={handleInputChange}
              placeholder="¿Qué estás buscando?"
              disabled={isLoading}
              className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm outline-none focus:border-neutral-400 disabled:opacity-50"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              id="ai-chat-send"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white transition-opacity hover:opacity-80 disabled:opacity-30"
              aria-label="Enviar mensaje"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
