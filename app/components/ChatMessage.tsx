'use client'

import { Message } from '../store'
import { User, Bot } from 'lucide-react'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={`flex gap-3 p-4 ${
        message.role === 'user' ? 'bg-zinc-900' : 'bg-zinc-950'
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
        {message.role === 'user' ? (
          <User size={18} className="text-blue-400" />
        ) : (
          <Bot size={18} className="text-green-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold mb-1 text-zinc-400">
          {message.role === 'user' ? 'You' : 'AI Assistant'}
        </div>
        <div className="text-zinc-100 whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  )
}
