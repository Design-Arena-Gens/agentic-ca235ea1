'use client'

import { useEffect, useRef } from 'react'
import { useStore } from './store'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import Settings from './components/Settings'
import { Trash2, MessageSquare } from 'lucide-react'

export default function Home() {
  const { messages, isLoading, addMessage, clearMessages, settings, setLoading, updateLastMessage } =
    useStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (content: string) => {
    addMessage({ role: 'user', content })
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content },
          ],
          settings,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        addMessage({
          role: 'assistant',
          content: `Error: ${error.error || 'Failed to get response'}`,
        })
        setLoading(false)
        return
      }

      if (settings.streamResponse) {
        addMessage({ role: 'assistant', content: '' })

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No reader available')
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter((line) => line.trim())

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                break
              }
              try {
                const json = JSON.parse(data)
                if (json.content) {
                  updateLastMessage(json.content)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } else {
        const data = await response.json()
        addMessage({ role: 'assistant', content: data.content })
      }
    } catch (error: any) {
      addMessage({
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to connect to AI service. Make sure Ollama or LM Studio is running.'}`,
      })
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-blue-400" />
            <div>
              <h1 className="text-xl font-semibold">Local AI Chat</h1>
              <p className="text-sm text-zinc-500">
                {settings.provider === 'ollama' ? 'Ollama' : 'LM Studio'} •{' '}
                {settings.model}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearMessages}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 size={20} />
            </button>
            <Settings />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500">
            <div className="text-center max-w-md px-4">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">
                Welcome to Local AI Chat
              </h2>
              <p className="text-sm mb-4">
                Chat with AI models running locally on your computer using
                Ollama or LM Studio. No internet required.
              </p>
              <div className="text-xs text-left bg-zinc-900 rounded-lg p-4 space-y-2">
                <p className="font-semibold">Getting Started:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Make sure Ollama or LM Studio is running</li>
                  <li>Click the settings icon to configure your setup</li>
                  <li>Select your preferred model</li>
                  <li>Start chatting or use voice input</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 bg-zinc-950">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-1 text-zinc-400">
                    AI Assistant
                  </div>
                  <div className="text-zinc-500">Thinking...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  )
}
