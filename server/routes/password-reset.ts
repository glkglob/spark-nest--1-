import { RequestHandler } from "express";
import { z } from "zod";
import { AuthService } from "../lib/auth-service";
import { authenticateToken } from "./auth";

// Validation schemas
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// In-memory store for reset tokens (in production, use Redis or database)
const resetTokens = new Map<string, { email: string; expires: number }>();

export const handleForgotPassword: RequestHandler = async (req, res) => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path[0] as string,
        }))
      });
    }

    const { email } = validation.data;
    
    // Check if user exists
    const user = await AuthService.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: "If the email exists, a password reset link has been sent." });
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    // Store token with expiration (1 hour)
    resetTokens.set(resetToken, {
      email,
      expires: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);

    res.json({ 
      message: "If the email exists, a password reset link has been sent.",
      // In development, include the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleResetPassword: RequestHandler = async (req, res) => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path[0] as string,
        }))
      });
    }

    const { token, password } = validation.data;
    
    // Check if token exists and is not expired
    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Find user by email
    const user = await AuthService.findUserByEmail(tokenData.email);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Update password
    const passwordHash = await AuthService.hashPassword(password);
    
    // In production, update password in database
    // For now, we'll just log it
    console.log(`Password reset for ${tokenData.email}: ${passwordHash}`);

    // Remove used token
    resetTokens.delete(token);

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleChangePassword: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const validation = changePasswordSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path[0] as string,
        }))
      });
    }

    const { currentPassword, newPassword } = validation.data;

    // Find user
    const user = await AuthService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const passwordHash = 'password_hash' in user ? user.password_hash :
                         user.email === 'admin@example.com' ? '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' : null;

    if (!passwordHash) {
      return res.status(400).json({ message: "Unable to verify current password." });
    }

    const isValidPassword = await AuthService.verifyPassword(currentPassword, passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // Hash new password
    const newPasswordHash = await AuthService.hashPassword(newPassword);
    
    // In production, update password in database
    console.log(`Password changed for user ${userId}: ${newPasswordHash}`);

    res.json({ message: "Password has been changed successfully." });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleVerifyResetToken: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;
    
    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      return res.status(400).json({ valid: false, message: "Invalid or expired token." });
    }

    res.json({ valid: true, message: "Token is valid." });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
