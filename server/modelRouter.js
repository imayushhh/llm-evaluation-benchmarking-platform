import { askDeepSeek } from "./deepSeek.js";
import { askQwen } from "./Qwen.js";

export async function askModel(model, question) {
  if (model === "deepseek") return askDeepSeek(question);
  if (model === "qwen") return askQwen(question);

  throw new Error(`Unknown model: ${model}`);
}
