import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get('provider') || 'ollama'
  const baseUrl = searchParams.get('baseUrl') || 'http://localhost:11434'

  try {
    let endpoint = ''

    if (provider === 'ollama') {
      endpoint = `${baseUrl}/api/tags`
    } else {
      // LM Studio
      endpoint = `${baseUrl}/v1/models`
    }

    const response = await fetch(endpoint)

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch models' }),
        { status: response.status }
      )
    }

    const data = await response.json()
    let models: string[] = []

    if (provider === 'ollama') {
      models = data.models?.map((m: any) => m.name) || []
    } else {
      // LM Studio
      models = data.data?.map((m: any) => m.id) || []
    }

    return new Response(JSON.stringify({ models }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch models' }),
      { status: 500 }
    )
  }
}
