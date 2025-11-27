import { NextRequest } from 'next/server'

export const runtime = 'edge'

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
  settings: {
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
}

export async function POST(req: NextRequest) {
  const { messages, settings }: ChatRequest = await req.json()

  const systemMessage = settings.systemPrompt
    ? { role: 'system', content: settings.systemPrompt }
    : null

  const allMessages = systemMessage
    ? [systemMessage, ...messages]
    : messages

  try {
    let endpoint = ''
    let requestBody: any = {}

    if (settings.provider === 'ollama') {
      endpoint = `${settings.baseUrl}/api/chat`
      requestBody = {
        model: settings.model,
        messages: allMessages,
        stream: settings.streamResponse,
        options: {
          temperature: settings.temperature,
          num_predict: settings.maxTokens,
          top_p: settings.topP,
          top_k: settings.topK,
          repeat_penalty: settings.repeatPenalty,
        },
      }
    } else {
      // LM Studio
      endpoint = `${settings.baseUrl}/v1/chat/completions`
      requestBody = {
        model: settings.model,
        messages: allMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        stream: settings.streamResponse,
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      return new Response(
        JSON.stringify({ error: `API Error: ${error}` }),
        { status: response.status }
      )
    }

    if (settings.streamResponse) {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n').filter((line) => line.trim())

              for (const line of lines) {
                if (settings.provider === 'ollama') {
                  try {
                    const json = JSON.parse(line)
                    if (json.message?.content) {
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ content: json.message.content })}\n\n`
                        )
                      )
                    }
                    if (json.done) {
                      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                } else {
                  // LM Studio
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6)
                    if (data === '[DONE]') {
                      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    } else {
                      try {
                        const json = JSON.parse(data)
                        const content = json.choices?.[0]?.delta?.content
                        if (content) {
                          controller.enqueue(
                            encoder.encode(
                              `data: ${JSON.stringify({ content })}\n\n`
                            )
                          )
                        }
                      } catch (e) {
                        // Skip invalid JSON
                      }
                    }
                  }
                }
              }
            }
          } catch (error) {
            controller.error(error)
          } finally {
            reader.releaseLock()
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    } else {
      // Non-streaming response
      const data = await response.json()
      let content = ''

      if (settings.provider === 'ollama') {
        content = data.message?.content || ''
      } else {
        content = data.choices?.[0]?.message?.content || ''
      }

      return new Response(JSON.stringify({ content }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to connect to AI service' }),
      { status: 500 }
    )
  }
}
