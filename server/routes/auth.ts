import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User, LoginRequest, SignupRequest, AuthResponse, AuthError } from "@shared/api";
import { z } from "zod";
import { AuthService } from "../lib/auth-service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

// Helper functions
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Auth middleware
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Routes
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      const errors: AuthError[] = validation.error.issues.map(err => ({
        message: err.message,
        field: err.path[0] as string,
      }));
      return res.status(400).json({ errors });
    }

    const credentials: LoginRequest = validation.data;

    // Authenticate user
    const dbUser = await AuthService.login(credentials);
    if (!dbUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(dbUser.id);

    // Transform to response format
    const user = AuthService.transformDbUserToUser(dbUser);

    const response: AuthResponse = {
      user,
      token,
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      const errors: AuthError[] = validation.error.issues.map(err => ({
        message: err.message,
        field: err.path[0] as string,
      }));
      return res.status(400).json({ errors });
    }

    const userData: SignupRequest = validation.data;

    // Check if user already exists
    const existingUser = await AuthService.findUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const dbUser = await AuthService.createUser(userData);
    if (!dbUser) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Generate token
    const token = generateToken(dbUser.id);

    // Transform to response format
    const user = AuthService.transformDbUserToUser(dbUser);

    const response: AuthResponse = {
      user,
      token,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const dbUser = await AuthService.findUserById(userId);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = AuthService.transformDbUserToUser(dbUser);
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
