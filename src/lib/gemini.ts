'use server';

import { logger } from './logger';
import { headers } from 'next/headers';

const apiKey = process.env.GEMINI_API_KEY;

// Simple in-memory cooldown to prevent abuse
// In a distributed production env, use Redis or similar.
const lastCallTimestamps = new Map<string, number>();
const COOLDOWN_MS = 2000; // 2 second cooldown per session/ip (simulated here)

export async function callGemini(prompt: string) {
  if (!apiKey) {
    logger.error("GEMINI_API_KEY is not set in environment variables.");
    return "AI is currently unavailable. Please check configuration.";
  }

  // Rate limiting per IP to avoid noisy neighbor effect
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  const now = Date.now();
  const lastCall = lastCallTimestamps.get(ip) || 0;
  if (now - lastCall < COOLDOWN_MS) {
    logger.warn("Gemini rate limit hit (cooldown active)", { ip });
    return "Whoa there! I'm thinking as fast as I can. Please wait a moment.";
  }
  lastCallTimestamps.set(ip, now);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
        const err = await response.text();
        logger.error("AI Request failed", { status: response.status, error: err });
        throw new Error('AI Request failed');
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate that right now.";
    
    logger.info("Gemini AI response generated successfully");
    return text;
  } catch (error) {
    logger.error("Gemini Error", { error: error instanceof Error ? error.message : String(error) });
    return "Oops! My AI brain is taking a nap. Please try again later.";
  }
}
