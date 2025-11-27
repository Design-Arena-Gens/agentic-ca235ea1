# Local AI Chat

A real-time chat application with voice input that integrates with **Ollama** and **LM Studio** to use AI models locally on your PC. Works completely offline with rich settings to control model behavior.

## Features

- 🤖 **Local AI Integration**: Connect to Ollama or LM Studio
- 🎤 **Voice Input**: Built-in speech recognition for hands-free interaction
- ⚙️ **Rich Settings**: Control temperature, tokens, top-p, top-k, repeat penalty, and more
- 💬 **Real-time Streaming**: See AI responses as they're generated
- 🌙 **Dark Theme**: Easy on the eyes
- 🔒 **Privacy First**: Everything runs locally, no internet required

## Prerequisites

You need either **Ollama** or **LM Studio** running locally:

### Option 1: Ollama
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama2`
3. Start Ollama (runs on http://localhost:11434 by default)

### Option 2: LM Studio
1. Download LM Studio from [lmstudio.ai](https://lmstudio.ai)
2. Download a model from the UI
3. Start the local server (runs on http://localhost:1234 by default)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Configure Settings**: Click the settings icon to:
   - Choose your AI provider (Ollama or LM Studio)
   - Select a model
   - Adjust temperature, tokens, and other parameters
   - Customize the system prompt

2. **Chat**: Type your message or use the microphone button for voice input

3. **Voice Input**:
   - Click the microphone button to start recording
   - Speak your message
   - Click again to stop and send

## Settings

- **Provider**: Choose between Ollama and LM Studio
- **Base URL**: Local server endpoint
- **Model**: Select from available models
- **System Prompt**: Define AI behavior and personality
- **Temperature**: Control randomness (0 = focused, 2 = creative)
- **Max Tokens**: Maximum response length
- **Top P**: Nucleus sampling threshold
- **Top K**: Number of top tokens to consider
- **Repeat Penalty**: Discourage repetition
- **Stream Response**: Enable/disable real-time streaming

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Utility-first styling
- **Zustand**: State management
- **Web Speech API**: Voice input
- **Ollama/LM Studio**: Local AI inference

## License

MIT
