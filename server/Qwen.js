import { OpenAI } from "openai";
import { extractNumber } from "./utils.js";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: ""
});

export async function askQwen(question) {
  const prompt = `
Solve the following problem.

Rules:
- Return ONLY the final numeric answer
- No explanation
- No units
- No extra text

Question:
${question}

Final Answer:
`;

  const start = Date.now();

  const response = await client.chat.completions.create({
    model: "Qwen/Qwen2.5-7B-Instruct:together",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    max_tokens: 2048
  });

  const latency = Date.now() - start;
  const content = response?.choices?.[0]?.message?.content ?? "";

  return {
    raw: content,
    answer: extractNumber(content),
    latency
  };
}
