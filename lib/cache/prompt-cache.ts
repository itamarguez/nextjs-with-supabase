// NoMoreFOMO Prompt Response Cache
// LRU (Least Recently Used) in-memory cache to reduce LLM API costs

interface CacheEntry {
  response: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  timestamp: number;
  category: string;
  reason: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

/**
 * Generate SHA-256 hash using Web Crypto API (Edge runtime compatible)
 */
async function generateHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class LRUCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttlMs: number;
  private stats: CacheStats;

  constructor(maxSize: number = 1000, ttlMs: number = 60 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs; // Default: 1 hour
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
    };
  }

  /**
   * Generate a cache key from prompt, conversation history, and model
   */
  async generateKey(
    prompt: string,
    conversationHistory: Array<{ role: string; content: string }>,
    model: string
  ): Promise<string> {
    // Normalize prompt (lowercase, trim whitespace)
    const normalizedPrompt = prompt.toLowerCase().trim();

    // Create a hash of conversation history (last 5 messages for context)
    const recentContext = conversationHistory.slice(-5);
    const contextString = recentContext
      .map((m) => `${m.role}:${m.content}`)
      .join('|');

    // Combine into single string
    const cacheString = `${model}:${normalizedPrompt}:${contextString}`;

    // Generate SHA-256 hash using Web Crypto API
    return await generateHash(cacheString);
  }

  /**
   * Get cached response if available and not expired
   */
  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > this.ttlMs) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.stats.hits++;
    return entry;
  }

  /**
   * Store response in cache
   */
  set(key: string, entry: Omit<CacheEntry, 'timestamp'>): void {
    // Remove oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.stats.evictions++;
      }
    }

    // Add new entry
    this.cache.set(key, {
      ...entry,
      timestamp: Date.now(),
    });

    this.stats.size = this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & {
    hitRate: number;
    totalRequests: number;
  } {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      ...this.stats,
      hitRate,
      totalRequests,
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
    };
  }

  /**
   * Remove expired entries (cleanup)
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.ttlMs) {
        this.cache.delete(key);
        removed++;
      }
    }

    this.stats.size = this.cache.size;
    console.log(`[Cache] Cleanup removed ${removed} expired entries`);
  }
}

// Global cache instance (singleton)
export const promptCache = new LRUCache(
  1000, // Max 1000 entries
  60 * 60 * 1000 // 1 hour TTL
);

// Cleanup expired entries every 15 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    promptCache.cleanup();
  }, 15 * 60 * 1000);
}

export type { CacheEntry, CacheStats };
