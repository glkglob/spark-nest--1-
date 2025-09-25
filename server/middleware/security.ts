import { RequestHandler, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

// Rate limiting configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => {
    // Skip rate limiting for successful requests
    return false;
  }
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 uploads per minute
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Speed limiting (gradually slow down repeated requests)
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes, then...
  delayMs: 500, // Begin adding 500ms of delay per request above 50
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// Input sanitization middleware
export const sanitizeInput: RequestHandler = (req, res, next) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }
    
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    
    if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    
    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

// CSRF protection middleware
export const csrfProtection: RequestHandler = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check for CSRF token in headers
  const csrfToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];
  const sessionToken = req.headers['x-session-token'];

  if (!csrfToken || !sessionToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'Request blocked due to missing security token'
    });
  }

  // In a real implementation, you would validate the CSRF token
  // against the session token here
  
  next();
};

// Request logging middleware
export const securityLogger: RequestHandler = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request details
  const requestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    userId: (req as any).userId || 'anonymous'
  };

  console.log('🔒 Security Log:', requestLog);

  // Log response details
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseLog = {
      ...requestLog,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || '0'
    };

    console.log('🔒 Response Log:', responseLog);

    // Log suspicious activity
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn('🚨 Suspicious Activity Detected:', responseLog);
    }
  });

  next();
};

// IP whitelist/blacklist middleware
export const ipFilter: RequestHandler = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Blacklisted IPs (in production, this would come from a database)
  const blacklistedIPs = [
    '127.0.0.1', // Example blacklisted IP
  ];

  if (blacklistedIPs.includes(clientIP)) {
    console.warn(`🚨 Blocked request from blacklisted IP: ${clientIP}`);
    return res.status(403).json({
      error: 'Access denied',
      message: 'Your IP address has been blocked'
    });
  }

  next();
};

// Content Security Policy middleware
export const contentSecurityPolicy: RequestHandler = (req, res, next) => {
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.openweathermap.org https://api.resend.com https://api.twilio.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspHeader);
  next();
};

// Request size limiting
export const requestSizeLimit: RequestHandler = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request size exceeds 10MB limit'
    });
  }

  next();
};

// Timeout middleware
export const requestTimeout = (timeoutMs: number = 30000): RequestHandler => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: 'Request took too long to process'
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    
    next();
  };
};

// Security headers middleware
export const securityHeaders: RequestHandler = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (HTTP Strict Transport Security)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// Brute force protection
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const bruteForceProtection: RequestHandler = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempts = failedAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };

  // Reset counter if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    attempts.count = 0;
  }

  // Check if too many attempts
  if (attempts.count >= maxAttempts) {
    const timeLeft = Math.ceil((windowMs - (now - attempts.lastAttempt)) / 1000 / 60);
    return res.status(429).json({
      error: 'Too many failed attempts',
      message: `Account temporarily locked. Try again in ${timeLeft} minutes.`,
      retryAfter: timeLeft
    });
  }

  // Track failed attempts
  if (req.url.includes('/login') || req.url.includes('/signup')) {
    res.on('finish', () => {
      if (res.statusCode === 401 || res.statusCode === 400) {
        attempts.count++;
        attempts.lastAttempt = now;
        failedAttempts.set(clientIP, attempts);
      } else if (res.statusCode === 200) {
        // Reset on successful attempt
        failedAttempts.delete(clientIP);
      }
    });
  }

  next();
};
