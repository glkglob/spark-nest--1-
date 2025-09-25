import { supabase } from './database';
import { FallbackDatabase } from './database-fallback';
import bcrypt from 'bcryptjs';
import { User, LoginRequest, SignupRequest } from '@shared/api';
import { Database } from './types';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.SUPABASE_URL && 
         process.env.SUPABASE_URL !== 'https://your-project.supabase.co' &&
         process.env.SUPABASE_ANON_KEY && 
         process.env.SUPABASE_ANON_KEY !== 'your-anon-key';
};

type DbUser = Database['public']['Tables']['users']['Row'];

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async findUserByEmail(email: string): Promise<DbUser | User | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } else {
      return FallbackDatabase.findUserByEmail(email);
    }
  }

  static async findUserById(id: string): Promise<DbUser | User | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } else {
      return FallbackDatabase.findUserById(id);
    }
  }

  static async createUser(userData: SignupRequest): Promise<DbUser | User | null> {
    const passwordHash = await this.hashPassword(userData.password);

    if (isSupabaseConfigured()) {
      const avatar = userData.name.split(' ').map(n => n[0]).join('').toUpperCase();

      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name,
          role: 'user',
          avatar,
          password_hash: passwordHash,
        })
        .select()
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } else {
      return FallbackDatabase.createUser({
        email: userData.email,
        name: userData.name,
        password_hash: passwordHash,
      });
    }
  }

  static async login(credentials: LoginRequest): Promise<DbUser | User | null> {
    const user = await this.findUserByEmail(credentials.email);
    if (!user) {
      return null;
    }

    // Handle both Supabase and fallback user types
    const passwordHash = 'password_hash' in user ? user.password_hash : 
                         user.email === 'admin@example.com' ? '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' : null;
    
    if (!passwordHash) {
      return null;
    }

    const isValidPassword = await this.verifyPassword(credentials.password, passwordHash);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  static async updateUser(id: string, updateData: { name?: string; avatar?: string; preferences?: any }): Promise<DbUser | User | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: updateData.name,
          avatar: updateData.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } else {
      return FallbackDatabase.updateUser(id, updateData);
    }
  }

  static transformDbUserToUser(dbUser: DbUser | User): User {
    // Handle both Supabase and fallback user types
    if ('created_at' in dbUser) {
      // Supabase user
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        avatar: dbUser.avatar || undefined,
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at,
      };
    } else {
      // Fallback user (already in correct format)
      return dbUser;
    }
  }
}

