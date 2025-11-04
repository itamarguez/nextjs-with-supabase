// NoMoreFOMO Prompt Analyzer
// Categorizes user prompts into task types for optimal model selection

import { TaskCategory } from '../types';

/**
 * Keywords and patterns for each task category
 */
const CATEGORY_PATTERNS = {
  coding: {
    keywords: [
      'code',
      'function',
      'debug',
      'error',
      'bug',
      'implement',
      'refactor',
      'algorithm',
      'programming',
      'python',
      'javascript',
      'typescript',
      'react',
      'api',
      'database',
      'sql',
      'git',
      'regex',
      'class',
      'method',
      'variable',
      'syntax',
      'compile',
      'runtime',
      'npm',
      'install',
      'component',
      'hook',
    ],
    patterns: [
      /```[\s\S]*?```/, // Code blocks
      /`[^`]+`/, // Inline code
      /\bdef\s+\w+/i, // Python functions
      /\bfunction\s+\w+/i, // JS functions
      /\bconst\s+\w+\s*=/i, // Variable declarations
      /\bimport\s+/i, // Import statements
      /\bclass\s+\w+/i, // Class definitions
    ],
  },

  math: {
    keywords: [
      'calculate',
      'solve',
      'equation',
      'mathematics',
      'algebra',
      'geometry',
      'calculus',
      'probability',
      'statistics',
      'formula',
      'theorem',
      'proof',
      'derivative',
      'integral',
      'matrix',
      'vector',
      'sum',
      'average',
      'percentage',
    ],
    patterns: [
      /\d+\s*[\+\-\*\/\^]\s*\d+/, // Math operations
      /\b\d+%/, // Percentages
      /\b\d+\.\d+/, // Decimals
      /[∫∑∏√≤≥±∞]/, // Math symbols
      /\b(x|y|z)\s*[=<>]/i, // Variables in equations
    ],
  },

  creative: {
    keywords: [
      'write',
      'story',
      'poem',
      'creative',
      'blog',
      'article',
      'essay',
      'novel',
      'character',
      'plot',
      'narrative',
      'fiction',
      'draft',
      'brainstorm',
      'imagine',
      'describe',
      'scene',
      'dialogue',
      'marketing',
      'slogan',
      'advertisement',
      'email',
      'letter',
      'script',
    ],
    patterns: [
      /write\s+(a|an|me)\s+/i,
      /create\s+(a|an)\s+(story|poem|article)/i,
      /help\s+me\s+write/i,
    ],
  },

  data_analysis: {
    keywords: [
      'analyze',
      'data',
      'summarize',
      'extract',
      'table',
      'chart',
      'csv',
      'json',
      'dataset',
      'report',
      'trend',
      'insight',
      'pattern',
      'compare',
      'metrics',
      'dashboard',
      'visualization',
      'parse',
      'format',
      'transform',
    ],
    patterns: [
      /\bcsv\b/i,
      /\bjson\b/i,
      /\bdata\s+(analysis|science|mining)/i,
      /summarize\s+(this|the)/i,
    ],
  },

  casual: {
    // Default fallback category
    keywords: [
      'what',
      'how',
      'why',
      'when',
      'where',
      'who',
      'explain',
      'tell',
      'help',
      'advice',
      'recommend',
      'opinion',
      'think',
      'suggest',
    ],
    patterns: [],
  },
};

/**
 * Estimate token count (rough approximation)
 * 1 token ≈ 4 characters for English text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Analyze a prompt and categorize it
 */
export function analyzePrompt(prompt: string): {
  category: TaskCategory;
  confidence: number;
  estimatedTokens: number;
  reasoning: string;
} {
  const lowerPrompt = prompt.toLowerCase();
  const scores: Record<TaskCategory, number> = {
    coding: 0,
    creative: 0,
    math: 0,
    casual: 0,
    data_analysis: 0,
  };

  // Detect simple informational questions (boost casual category)
  const isSimpleQuestion =
    /^(what is|what are|who is|who are|where is|when is|why is)/i.test(lowerPrompt.trim()) &&
    !/(write|create|code|function|build|implement|develop)/i.test(lowerPrompt);

  // Score each category based on keyword matches
  for (const [category, config] of Object.entries(CATEGORY_PATTERNS)) {
    const cat = category as TaskCategory;

    // Keyword scoring
    for (const keyword of config.keywords) {
      if (lowerPrompt.includes(keyword)) {
        scores[cat] += 1;
      }
    }

    // Pattern scoring (higher weight)
    for (const pattern of config.patterns) {
      if (pattern.test(prompt)) {
        scores[cat] += 3;
      }
    }
  }

  // Boost casual for simple informational questions
  if (isSimpleQuestion) {
    scores.casual += 5; // Strong boost for "What is..." questions
  }

  // Find the category with the highest score
  let maxScore = 0;
  let selectedCategory: TaskCategory = 'casual';

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      selectedCategory = category as TaskCategory;
    }
  }

  // If no clear category, default to casual
  if (maxScore === 0) {
    selectedCategory = 'casual';
  }

  // Calculate confidence (0-1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? maxScore / totalScore : 0.5;

  // Generate reasoning
  const reasoning = generateReasoning(selectedCategory, maxScore, prompt);

  return {
    category: selectedCategory,
    confidence,
    estimatedTokens: estimateTokens(prompt),
    reasoning,
  };
}

/**
 * Generate human-readable reasoning for category selection
 */
function generateReasoning(
  category: TaskCategory,
  score: number,
  prompt: string
): string {
  const reasons: Record<TaskCategory, string[]> = {
    coding: [
      'contains code syntax',
      'mentions programming concepts',
      'includes technical keywords',
    ],
    math: [
      'contains mathematical expressions',
      'includes numerical calculations',
      'mentions math concepts',
    ],
    creative: [
      'requests creative writing',
      'asks for content generation',
      'involves storytelling',
    ],
    data_analysis: [
      'requests data processing',
      'mentions analysis or summarization',
      'involves structured data',
    ],
    casual: [
      'general question',
      'conversational request',
      'informational query',
    ],
  };

  const categoryReasons = reasons[category];
  const selectedReasons = categoryReasons.slice(0, Math.min(2, score));

  if (selectedReasons.length === 0) {
    return `Categorized as ${category} (general purpose)`;
  }

  return `Categorized as ${category} because it ${selectedReasons.join(' and ')}`;
}

/**
 * Check if prompt might be abusive/suspicious
 */
export function detectSuspiciousPrompt(prompt: string): {
  isSuspicious: boolean;
  reason?: string;
} {
  // Too short (likely spam/testing)
  if (prompt.trim().length < 3) {
    return { isSuspicious: true, reason: 'Prompt too short' };
  }

  // Too long (trying to abuse token limits)
  if (prompt.length > 50000) {
    return { isSuspicious: true, reason: 'Prompt exceeds reasonable length' };
  }

  // Repeated characters (spam)
  const repeatedChars = /(.)\1{50,}/;
  if (repeatedChars.test(prompt)) {
    return { isSuspicious: true, reason: 'Contains excessive repeated characters' };
  }

  // Excessive special characters (obfuscation attempt)
  const specialCharRatio = (prompt.match(/[^a-zA-Z0-9\s]/g) || []).length / prompt.length;
  if (specialCharRatio > 0.5) {
    return { isSuspicious: true, reason: 'Excessive special characters' };
  }

  return { isSuspicious: false };
}

/**
 * Check if two prompts are too similar (spam detection)
 */
export function calculatePromptSimilarity(prompt1: string, prompt2: string): number {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');

  const p1 = normalize(prompt1);
  const p2 = normalize(prompt2);

  // Exact match
  if (p1 === p2) return 1.0;

  // Simple Jaccard similarity on words
  const words1 = new Set(p1.split(' '));
  const words2 = new Set(p2.split(' '));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
