'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff } from 'lucide-react'
import { useStore } from '../store'

interface ChatInputProps {
  onSend: (message: string) => void
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState('')
  const { isLoading, isRecording, setRecording } = useStore()
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setInput((prev) => prev + finalTranscript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setRecording(false)
        }

        recognitionRef.current.onend = () => {
          setRecording(false)
        }
      }
    }
  }, [setRecording])

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setRecording(false)
    } else {
      recognitionRef.current.start()
      setRecording(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input.trim())
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-800 bg-zinc-950 p-4">
      <div className="max-w-4xl mx-auto flex gap-2">
        <button
          type="button"
          onClick={toggleRecording}
          className={`flex-shrink-0 p-3 rounded-lg transition-colors ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
          disabled={isLoading}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording
              ? 'Listening...'
              : 'Type a message or use voice input...'
          }
          className="flex-1 bg-zinc-900 text-zinc-100 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
      {isRecording && (
        <div className="max-w-4xl mx-auto mt-2 text-sm text-red-400 text-center">
          Recording... Click the mic button to stop
        </div>
      )}
    </form>
  )
}
