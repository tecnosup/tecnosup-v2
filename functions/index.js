const { onRequest } = require('firebase-functions/v2/https');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { defineSecret } = require('firebase-functions/params');

const geminiKey = defineSecret('GEMINI_API_KEY');

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
- Diagnóstico Técnico: Grátis (só paga se quiser continuar)
- Limpeza Simples: R$ 50
- Limpeza Complexa: R$ 100
- Formatação Completa: R$ 60
- Otimização Windows: R$ 30
- Remoção de Vírus: R$ 30
- Montagem de PC: R$ 100+
- Upgrade / Troca de Peças: R$ 50+
- Pendrive Bootável: R$ 90

## TecnoApp
Produto próprio da Tecnosup — aplicativo desktop para Windows (Python/PySide6) com 4 módulos:
1. Limpeza — remove arquivos temporários, cache, logs antigos
2. Otimização — plano de energia máxima, defrag, TCP acelerado
3. Reparos — corrige rede, Windows Update, Microsoft Store e erros do sistema
4. Modo Gamer — otimizações para mais FPS e desempenho no Windows

## Cases
- NYX.wear — e-commerce completo para marca de streetwear: https://nyx-xxx.vercel.app/

## Regras
- Preços de software dependem do escopo — ofereça direcionar para o WhatsApp (Abraão ou Vitor)
- Para hardware, use os preços listados acima
- Seja objetivo — 2 a 4 linhas no máximo por resposta
- Nunca invente preços ou funcionalidades`;

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 10;

exports.chat = onRequest(
  { secrets: [geminiKey], region: 'southamerica-east1', cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const rawMessage = typeof req.body?.message === 'string' ? req.body.message : '';
    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];

    const message = rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!message) {
      res.status(400).json({ error: 'Mensagem vazia.' });
      return;
    }

    const history = rawHistory
      .slice(-MAX_HISTORY_TURNS)
      .filter(h => typeof h?.role === 'string' && typeof h?.content === 'string')
      .map(h => ({ role: h.role, content: String(h.content).slice(0, MAX_MESSAGE_LENGTH) }));

    try {
      const genAI = new GoogleGenerativeAI(geminiKey.value());
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

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of result.stream) {
        res.write(chunk.text());
      }
      res.end();
    } catch (err) {
      console.error('Chat error:', err);
      res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }
  }
);
