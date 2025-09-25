import { RequestHandler, Response, NextFunction } from "express";
import NodeCache from "node-cache";

// Cache configurations
const defaultCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false
});

const longCache = new NodeCache({ 
  stdTTL: 3600, // 1 hour TTL
  checkperiod: 300,
  useClones: false
});

const shortCache = new NodeCache({ 
  stdTTL: 60, // 1 minute TTL
  checkperiod: 30,
  useClones: false
});

// Cache middleware factory
export const createCacheMiddleware = (
  ttl: number = 300,
  keyGenerator?: (req: any) => string
): RequestHandler => {
  return (req, res, next) => {
    const cacheKey = keyGenerator ? keyGenerator(req) : generateCacheKey(req);
    
    // Try to get from cache
    const cachedResponse = defaultCache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`💾 Cache hit for key: ${cacheKey}`);
      return res.json(cachedResponse);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);
    
    // Override res.json to cache the response
    res.json = function(body: any) {
      // Cache the response
      defaultCache.set(cacheKey, body, ttl);
      console.log(`💾 Cached response for key: ${cacheKey} (TTL: ${ttl}s)`);
      
      // Call original json method
      return originalJson(body);
    };

    next();
  };
};

// Generate cache key from request
const generateCacheKey = (req: any): string => {
  const userId = req.userId || 'anonymous';
  const url = req.originalUrl || req.url;
  const query = JSON.stringify(req.query || {});
  
  return `cache:${userId}:${url}:${Buffer.from(query).toString('base64')}`;
};

// Specific cache middlewares
export const cacheProjects: RequestHandler = createCacheMiddleware(
  300, // 5 minutes
  (req) => `projects:${req.userId}:${JSON.stringify(req.query)}`
);

export const cacheAnalytics: RequestHandler = createCacheMiddleware(
  600, // 10 minutes
  (req) => `analytics:${req.userId}:${JSON.stringify(req.query)}`
);

export const cacheWeather: RequestHandler = createCacheMiddleware(
  900, // 15 minutes
  (req) => `weather:${JSON.stringify(req.query)}`
);

export const cacheUserProfile: RequestHandler = createCacheMiddleware(
  1800, // 30 minutes
  (req) => `profile:${req.userId}`
);

// Cache invalidation middleware
export const invalidateCache = (pattern: string): RequestHandler => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      // Invalidate cache based on pattern
      const keys = defaultCache.keys();
      const matchingKeys = keys.filter(key => key.includes(pattern));
      
      matchingKeys.forEach(key => {
        defaultCache.del(key);
        console.log(`🗑️ Invalidated cache key: ${key}`);
      });
      
      return originalJson(body);
    };

    next();
  };
};

// Cache statistics endpoint
export const getCacheStats: RequestHandler = (req, res) => {
  const stats = {
    default: {
      keys: defaultCache.keys().length,
      stats: defaultCache.getStats()
    },
    long: {
      keys: longCache.keys().length,
      stats: longCache.getStats()
    },
    short: {
      keys: shortCache.keys().length,
      stats: shortCache.getStats()
    },
    memory: process.memoryUsage()
  };

  res.json(stats);
};

// Clear cache endpoint (admin only)
export const clearCache: RequestHandler = (req, res) => {
  const { pattern } = req.query;
  
  if (pattern) {
    // Clear specific pattern
    const keys = defaultCache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern as string));
    
    matchingKeys.forEach(key => {
      defaultCache.del(key);
    });
    
    res.json({
      message: `Cleared ${matchingKeys.length} cache entries matching pattern: ${pattern}`,
      clearedKeys: matchingKeys
    });
  } else {
    // Clear all cache
    defaultCache.flushAll();
    longCache.flushAll();
    shortCache.flushAll();
    
    res.json({
      message: 'All cache cleared successfully'
    });
  }
};

// Database query caching
export const cacheDatabaseQuery = <T>(
  cache: NodeCache,
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  return new Promise((resolve, reject) => {
    // Try to get from cache first
    const cached = cache.get<T>(key);
    if (cached) {
      console.log(`💾 Database cache hit for key: ${key}`);
      return resolve(cached);
    }

    // Execute query and cache result
    queryFn()
      .then((result) => {
        cache.set(key, result, ttl);
        console.log(`💾 Database result cached for key: ${key}`);
        resolve(result);
      })
      .catch(reject);
  });
};

// Response compression middleware
export const compressResponse: RequestHandler = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(body: any) {
    // Check if client accepts gzip
    const acceptEncoding = req.headers['accept-encoding'];
    
    if (acceptEncoding && acceptEncoding.includes('gzip')) {
      // In a real implementation, you would use compression middleware
      // like compression or express-compression
      res.setHeader('Content-Encoding', 'gzip');
    }
    
    return originalJson(body);
  };

  next();
};

// Lazy loading middleware for large datasets
export const lazyLoad = (pageSize: number = 20): RequestHandler => {
  return (req, res, next) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || pageSize, 100);
    const offset = (page - 1) * limit;

    req.pagination = {
      page,
      limit,
      offset,
      pageSize
    };

    next();
  };
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        offset: number;
        pageSize: number;
      };
    }
  }
}

// Cache warming for frequently accessed data
export const warmCache = async () => {
  console.log('🔥 Warming cache...');
  
  try {
    // Pre-cache common data
    const commonQueries = [
      'system:health',
      'system:stats',
      'weather:default'
    ];

    for (const key of commonQueries) {
      // In a real implementation, you would fetch and cache actual data
      defaultCache.set(key, { warmed: true, timestamp: new Date().toISOString() }, 3600);
    }

    console.log('🔥 Cache warmed successfully');
  } catch (error) {
    console.error('🔥 Cache warming failed:', error);
  }
};

// Cache health check
export const checkCacheHealth = (): boolean => {
  try {
    // Test cache operations
    const testKey = 'health-check';
    const testValue = { timestamp: Date.now() };
    
    defaultCache.set(testKey, testValue, 10);
    const retrieved = defaultCache.get(testKey) as { timestamp: number } | undefined;
    defaultCache.del(testKey);
    
    return retrieved && retrieved.timestamp === testValue.timestamp;
  } catch (error) {
    console.error('Cache health check failed:', error);
    return false;
  }
};
