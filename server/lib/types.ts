export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'manager' | 'user'
          avatar: string | null
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'manager' | 'user'
          avatar?: string | null
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'manager' | 'user'
          avatar?: string | null
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: number
          name: string
          status: 'active' | 'planning' | 'completed'
          progress: number
          budget: number
          spent: number
          cpi: number
          spi: number
          quality_score: number
          safety_score: number
          acceptance_criteria_complete: number
          risk_level: 'low' | 'medium' | 'high'
          client: string | null
          location: string | null
          start_date: string | null
          end_date: string | null
          team_size: number | null
          contractor: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          status?: 'active' | 'planning' | 'completed'
          progress?: number
          budget: number
          spent?: number
          cpi?: number
          spi?: number
          quality_score?: number
          safety_score?: number
          acceptance_criteria_complete?: number
          risk_level?: 'low' | 'medium' | 'high'
          client?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          team_size?: number | null
          contractor?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          status?: 'active' | 'planning' | 'completed'
          progress?: number
          budget?: number
          spent?: number
          cpi?: number
          spi?: number
          quality_score?: number
          safety_score?: number
          acceptance_criteria_complete?: number
          risk_level?: 'low' | 'medium' | 'high'
          client?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          team_size?: number | null
          contractor?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      materials: {
        Row: {
          id: number
          name: string
          current_stock: number
          total_required: number
          status: 'adequate' | 'low' | 'critical'
          cost: number
          supplier: string
          project_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          current_stock: number
          total_required: number
          status?: 'adequate' | 'low' | 'critical'
          cost: number
          supplier: string
          project_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          current_stock?: number
          total_required?: number
          status?: 'adequate' | 'low' | 'critical'
          cost?: number
          supplier?: string
          project_id?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

