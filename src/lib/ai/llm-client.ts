/**
 * GymMind.ai - AI Service Configuration
 * ======================================
 * Configuration and factory for LLM providers.
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==========================================
// Types
// ==========================================

export type LLMProvider = 'openai' | 'gemini' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  provider: LLMProvider;
}

// ==========================================
// Default Configuration
// ==========================================

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: (process.env.LLM_PROVIDER as LLMProvider) || 'gemini',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxTokens: 2048,
  temperature: 0.7,
};

// ==========================================
// OpenAI Client
// ==========================================

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// ==========================================
// Gemini Client
// ==========================================

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
}

// ==========================================
// Unified LLM Interface
// ==========================================

export async function generateLLMResponse(
  messages: LLMMessage[],
  config: Partial<LLMConfig> = {}
): Promise<LLMResponse> {
  const finalConfig = { ...DEFAULT_LLM_CONFIG, ...config };

  switch (finalConfig.provider) {
    case 'openai':
      return generateOpenAIResponse(messages, finalConfig);
    case 'gemini':
      return generateGeminiResponse(messages, finalConfig);
    default:
      throw new Error(`Unsupported LLM provider: ${finalConfig.provider}`);
  }
}

// ==========================================
// OpenAI Implementation
// ==========================================

async function generateOpenAIResponse(
  messages: LLMMessage[],
  config: LLMConfig
): Promise<LLMResponse> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: config.model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: config.maxTokens,
    temperature: config.temperature,
  });

  const content = response.choices[0]?.message?.content || '';
  const tokensUsed = response.usage?.total_tokens || 0;

  return {
    content,
    tokensUsed,
    provider: 'openai',
  };
}

// ==========================================
// Gemini Implementation
// ==========================================

async function generateGeminiResponse(
  messages: LLMMessage[],
  config: LLMConfig
): Promise<LLMResponse> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: process.env.GOOGLE_GEMINI_MODEL || 'gemini-pro',
  });

  // Convert messages to Gemini format
  const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
  const chatMessages = messages.filter((m) => m.role !== 'system');

  // Build prompt
  let prompt = systemMessage ? `System: ${systemMessage}\n\n` : '';
  for (const msg of chatMessages) {
    prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
  }

  const result = await model.generateContent(prompt);
  const response = result.response;
  const content = response.text();

  return {
    content,
    tokensUsed: 0, // Gemini doesn't return token count in same way
    provider: 'gemini',
  };
}

// ==========================================
// AI Usage Tracking
// ==========================================

export interface AIUsageRecord {
  userId: string;
  provider: LLMProvider;
  feature: string;
  tokensUsed: number;
  timestamp: Date;
}

export function createUsageRecord(
  userId: string,
  feature: string,
  response: LLMResponse
): AIUsageRecord {
  return {
    userId,
    provider: response.provider,
    feature,
    tokensUsed: response.tokensUsed,
    timestamp: new Date(),
  };
}
