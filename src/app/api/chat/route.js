import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Você é o assistente virtual da Tecnosup, uma empresa de tecnologia localizada em Cruzeiro, SP. Responda sempre em português, de forma profissional mas descontraída, como um consultor técnico que conhece bem a empresa.

## Sobre a Tecnosup
A Tecnosup é especializada em sistemas web sob medida e assistência técnica em hardware. Fundada por dois sócios técnicos:
- Abraão (WhatsApp: +55 12 99606-5673)
- Vitor (WhatsApp: +55 12 98178-3439)

## Serviços de Software
- Sistemas Web Sob Medida — aplicações completas: e-commerce, sistemas de gestão, dashboards, portais, automações
- Otimização de Processos — digitalização de fluxos, integrações entre sistemas, redução de trabalho manual
- Diagnóstico Digital — análise das necessidades do cliente antes de qualquer proposta

## Serviços de Hardware / Assistência Técnica
- Formatação + Windows + drivers: R$ 80
- Limpeza + troca de pasta térmica: R$ 50
- Formatação + limpeza (combo): R$ 110
- Diagnóstico geral: R$ 30 (cobrado só se não fechar serviço)
- Instalação de SSD/HD: R$ 40 (mão de obra)
- Upgrade de memória RAM: R$ 40 (mão de obra)
- Remoção de vírus / malware: R$ 60
- Configuração de rede / roteador: R$ 50
- Montagem de PC do zero: R$ 120
- Suporte remoto (por sessão): R$ 35

## TecnoApp
Produto próprio da Tecnosup — aplicativo desktop para Windows (Python/PySide6) com 4 módulos:
1. Limpeza — remove arquivos temporários, cache, logs antigos
2. Otimização — desativa programas desnecessários na inicialização
3. Reparos — executa sfc/dism e corrige erros do sistema
4. Modo Gamer — desativa processos em segundo plano para performance em jogos

## Cases
- NYX.wear — e-commerce completo para marca de streetwear: https://nyx-xxx.vercel.app/

## Regras
- Preços de software dependem do escopo — ofereça direcionar para o WhatsApp (Abraão ou Vitor)
- Para hardware, use os preços listados acima
- Seja objetivo — 2 a 4 linhas no máximo por resposta
- Nunca invente preços ou funcionalidades`;

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 10;

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: 'API key não configurada.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const rawMessage = typeof body?.message === 'string' ? body.message : '';
    const rawHistory = Array.isArray(body?.history) ? body.history : [];

    const message = rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!message) {
      return Response.json({ error: 'Mensagem vazia.' }, { status: 400 });
    }

    const history = rawHistory
      .slice(-MAX_HISTORY_TURNS)
      .filter(h => typeof h?.role === 'string' && typeof h?.content === 'string')
      .map(h => ({ role: h.role, content: String(h.content).slice(0, MAX_MESSAGE_LENGTH) }));

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const geminiHistory = history.map(({ role, content }) => ({
      role: role === 'assistant' ? 'model' : 'user',
      parts: [{ text: content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessageStream(message);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            controller.enqueue(encoder.encode(chunk.text()));
          }
        } catch {
          controller.enqueue(encoder.encode('\n\n[Erro ao gerar resposta. Tente novamente.]'));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return Response.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}
