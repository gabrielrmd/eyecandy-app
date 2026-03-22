/**
 * AI Provider Abstraction
 *
 * Supports two providers:
 *   - "anthropic" (default, production) — Uses Claude via @anthropic-ai/sdk
 *   - "codex" (testing/dev) — Uses OpenAI-compatible API via openai SDK
 *
 * Selection:
 *   Set AI_PROVIDER env var to "anthropic" or "codex". Defaults to "anthropic".
 *
 * Required env vars:
 *   - anthropic: ANTHROPIC_API_KEY
 *   - codex:     OPENAI_API_KEY (or CODEX_API_KEY)
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type AIProviderName = "anthropic" | "codex";

export interface AICompletionParams {
  system?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens: number;
  /** Override the model for this request. Uses provider default if omitted. */
  model?: string;
}

export interface AICompletionResult {
  text: string;
  provider: AIProviderName;
  model: string;
}

// Default models per provider
const DEFAULT_MODELS: Record<AIProviderName, string> = {
  anthropic: "claude-sonnet-4-20250514",
  codex: "gpt-4o",
};

/**
 * Returns the active provider name from env. Defaults to "anthropic".
 */
export function getProviderName(): AIProviderName {
  const env = process.env.AI_PROVIDER?.toLowerCase();
  if (env === "codex") return "codex";
  return "anthropic";
}

/**
 * Validates that the required API key is set for the active provider.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateProviderConfig(): { valid: true } | { valid: false; error: string } {
  const provider = getProviderName();

  if (provider === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { valid: false, error: "ANTHROPIC_API_KEY is not configured." };
    }
  } else if (provider === "codex") {
    const key = process.env.OPENAI_API_KEY || process.env.CODEX_API_KEY;
    if (!key) {
      return { valid: false, error: "OPENAI_API_KEY or CODEX_API_KEY is not configured for Codex provider." };
    }
  }

  return { valid: true };
}

/**
 * Generates a completion using the active AI provider.
 */
export async function generateCompletion(params: AICompletionParams): Promise<AICompletionResult> {
  const provider = getProviderName();

  if (provider === "codex") {
    return generateWithCodex(params);
  }

  return generateWithAnthropic(params);
}

// ─── Anthropic ──────────────────────────────────────────────────────────────

async function generateWithAnthropic(params: AICompletionParams): Promise<AICompletionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const model = params.model || DEFAULT_MODELS.anthropic;
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: params.maxTokens,
    system: params.system,
    messages: params.messages,
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const text = textBlock && textBlock.type === "text" ? textBlock.text : "";

  return { text, provider: "anthropic", model };
}

// ─── Codex (OpenAI-compatible) ──────────────────────────────────────────────

async function generateWithCodex(params: AICompletionParams): Promise<AICompletionResult> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.CODEX_API_KEY;
  if (!apiKey) throw new Error("No API key for Codex provider");

  const model = params.model || DEFAULT_MODELS.codex;
  const client = new OpenAI({ apiKey });

  // Build messages array with optional system message
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (params.system) {
    messages.push({ role: "system", content: params.system });
  }
  for (const msg of params.messages) {
    messages.push({ role: msg.role, content: msg.content });
  }

  const response = await client.chat.completions.create({
    model,
    max_tokens: params.maxTokens,
    messages,
  });

  const text = response.choices[0]?.message?.content || "";

  return { text, provider: "codex", model };
}
