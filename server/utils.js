// Extract ONLY "#### <number>" from GSM8K-style ground truth
export function extractFinalAnswer(text) {
  if (!text || typeof text !== "string") return null;

  // Matches: #### 460  OR ####460 OR ####   460
  const match = text.match(/####\s*(-?\d+(\.\d+)?)/);
  if (!match) return null;

  return Number(match[1]);
}

// Extract last number from model output (DeepSeek should return clean number, but just in case)
export function extractNumber(text) {
  if (!text || typeof text !== "string") return null;

  const cleaned = text.replace(/\\boxed\{|\}/g, "").trim();
  const matches = cleaned.match(/-?\d+(\.\d+)?/g);
  if (!matches) return null;

  return Number(matches[matches.length - 1]);
}
