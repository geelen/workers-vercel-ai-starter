import type { Message } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { env } from 'cloudflare:workers'

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY
})

type JsonBody = {
  id: string;
  messages: Message[];
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/api/chat": {
        const { messages } = await request.json<JsonBody>();
        const model = google('gemini-1.5-pro-latest', {
          useSearchGrounding: true,
        });
        const result = streamText({ model, messages });
        return result.toDataStreamResponse();
      }
      default: {
        return new Response(null, { status: 404 });
      }
    }
  },
} satisfies ExportedHandler<Env>;
