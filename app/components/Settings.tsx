'use client'

import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Settings as SettingsIcon, X, RefreshCw } from 'lucide-react'

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSettings, availableModels, setAvailableModels } =
    useStore()
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  const fetchModels = async () => {
    setIsLoadingModels(true)
    try {
      const params = new URLSearchParams({
        provider: settings.provider,
        baseUrl: settings.baseUrl,
      })
      const response = await fetch(`/api/models?${params}`)
      const data = await response.json()

      if (data.models) {
        setAvailableModels(data.models)
        if (data.models.length > 0 && !data.models.includes(settings.model)) {
          updateSettings({ model: data.models[0] })
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
    }
    setIsLoadingModels(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchModels()
    }
  }, [isOpen, settings.provider, settings.baseUrl])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        title="Settings"
      >
        <SettingsIcon size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  AI Provider
                </label>
                <select
                  value={settings.provider}
                  onChange={(e) =>
                    updateSettings({
                      provider: e.target.value as 'ollama' | 'lmstudio',
                      baseUrl:
                        e.target.value === 'ollama'
                          ? 'http://localhost:11434'
                          : 'http://localhost:1234',
                    })
                  }
                  className="w-full bg-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ollama">Ollama</option>
                  <option value="lmstudio">LM Studio</option>
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  {settings.provider === 'ollama'
                    ? 'Ollama default: http://localhost:11434'
                    : 'LM Studio default: http://localhost:1234'}
                </p>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={settings.baseUrl}
                  onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                  className="w-full bg-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:11434"
                />
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Model
                  <button
                    onClick={fetchModels}
                    disabled={isLoadingModels}
                    className="ml-2 text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    <RefreshCw
                      size={14}
                      className={isLoadingModels ? 'animate-spin' : ''}
                    />
                    Refresh
                  </button>
                </label>
                {availableModels.length > 0 ? (
                  <select
                    value={settings.model}
                    onChange={(e) => updateSettings({ model: e.target.value })}
                    className="w-full bg-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={settings.model}
                    onChange={(e) => updateSettings({ model: e.target.value })}
                    className="w-full bg-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="llama2"
                  />
                )}
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  System Prompt
                </label>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) =>
                    updateSettings({ systemPrompt: e.target.value })
                  }
                  className="w-full bg-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="You are a helpful assistant..."
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Temperature: {settings.temperature.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) =>
                    updateSettings({ temperature: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Lower values = more focused, higher values = more creative
                </p>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Tokens: {settings.maxTokens}
                </label>
                <input
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={settings.maxTokens}
                  onChange={(e) =>
                    updateSettings({ maxTokens: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Top P */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Top P: {settings.topP.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.topP}
                  onChange={(e) =>
                    updateSettings({ topP: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Nucleus sampling threshold
                </p>
              </div>

              {/* Top K */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Top K: {settings.topK}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={settings.topK}
                  onChange={(e) =>
                    updateSettings({ topK: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Number of top tokens to consider
                </p>
              </div>

              {/* Repeat Penalty */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Repeat Penalty: {settings.repeatPenalty.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.05"
                  value={settings.repeatPenalty}
                  onChange={(e) =>
                    updateSettings({
                      repeatPenalty: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Penalty for repeating tokens
                </p>
              </div>

              {/* Stream Response */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Stream Response
                </label>
                <button
                  onClick={() =>
                    updateSettings({ streamResponse: !settings.streamResponse })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.streamResponse ? 'bg-blue-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.streamResponse ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
