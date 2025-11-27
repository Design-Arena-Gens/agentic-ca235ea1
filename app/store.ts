import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface ModelSettings {
  provider: 'ollama' | 'lmstudio'
  baseUrl: string
  model: string
  temperature: number
  maxTokens: number
  topP: number
  topK: number
  repeatPenalty: number
  systemPrompt: string
  streamResponse: boolean
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  isRecording: boolean
  settings: ModelSettings
  availableModels: string[]

  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setRecording: (recording: boolean) => void
  updateSettings: (settings: Partial<ModelSettings>) => void
  setAvailableModels: (models: string[]) => void
  updateLastMessage: (content: string) => void
}

export const useStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  isRecording: false,
  availableModels: [],
  settings: {
    provider: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'llama2',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
    systemPrompt: 'You are a helpful AI assistant running locally on the user\'s computer. You can help with tasks, answer questions, and search through information.',
    streamResponse: true,
  },

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),

  setLoading: (loading) => set({ isLoading: loading }),

  setRecording: (recording) => set({ isRecording: recording }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  setAvailableModels: (models) => set({ availableModels: models }),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        if (lastMessage.role === 'assistant') {
          messages[messages.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + content,
          }
        }
      }
      return { messages }
    }),
}))
