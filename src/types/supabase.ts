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
      // User Connections (existing)
      user_connections: {
        Row: {
          id: string
          user_id: string
          provider: string
          provider_user_id: string
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          provider_user_id: string
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          provider_user_id?: string
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Forum Tables
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          created_at: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          created_at?: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          created_at?: string
          sort_order?: number
        }
      }

      forum_threads: {
        Row: {
          id: string
          category_id: string
          user_id: string | null
          title: string
          slug: string
          created_at: string
          updated_at: string
          last_activity_at: string
          is_pinned: boolean
          is_locked: boolean
          view_count: number
        }
        Insert: {
          id?: string
          category_id: string
          user_id?: string | null
          title: string
          slug: string
          created_at?: string
          updated_at?: string
          last_activity_at?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
        }
        Update: {
          id?: string
          category_id?: string
          user_id?: string | null
          title?: string
          slug?: string
          created_at?: string
          updated_at?: string
          last_activity_at?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
        }
      }

      forum_posts: {
        Row: {
          id: string
          thread_id: string
          user_id: string | null
          content: string
          parent_post_id: string | null
          created_at: string
          updated_at: string
          is_solution: boolean
          attachments: Json | null
        }
        Insert: {
          id?: string
          thread_id: string
          user_id?: string | null
          content: string
          parent_post_id?: string | null
          created_at?: string
          updated_at?: string
          is_solution?: boolean
          attachments?: Json | null
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string | null
          content?: string
          parent_post_id?: string | null
          created_at?: string
          updated_at?: string
          is_solution?: boolean
          attachments?: Json | null
        }
      }

      // Notification System
      notifications: {
        Row: {
          id: string
          recipient_user_id: string
          actor_user_id: string | null
          type: string
          references: Json
          content_summary: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_user_id: string
          actor_user_id?: string | null
          type: string
          references: Json
          content_summary: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_user_id?: string
          actor_user_id?: string | null
          type?: string
          references?: Json
          content_summary?: string
          is_read?: boolean
          created_at?: string
        }
      }

      thread_subscriptions: {
        Row: {
          user_id: string
          thread_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          thread_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          thread_id?: string
          created_at?: string
        }
      }
    }
    
    Views: {
      [_ in never]: never
    }
    
    Functions: {
      [_ in never]: never
    }
    
    Enums: {
      notification_type: 'reply' | 'mention' | 'reaction' | 'new_follower' | 'thread_update'
    }
    
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
