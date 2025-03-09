export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alert_settings: {
        Row: {
          application_alerts: boolean | null
          campaign_alerts: boolean | null
          created_at: string
          email_notifications: boolean | null
          line_notifications: boolean | null
          profile_id: string
          proposal_alerts: boolean | null
          push_notifications: boolean | null
          setting_id: string
          system_alerts: boolean | null
          updated_at: string
        }
        Insert: {
          application_alerts?: boolean | null
          campaign_alerts?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          line_notifications?: boolean | null
          profile_id: string
          proposal_alerts?: boolean | null
          push_notifications?: boolean | null
          setting_id?: string
          system_alerts?: boolean | null
          updated_at?: string
        }
        Update: {
          application_alerts?: boolean | null
          campaign_alerts?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          line_notifications?: boolean | null
          profile_id?: string
          proposal_alerts?: boolean | null
          push_notifications?: boolean | null
          setting_id?: string
          system_alerts?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_settings_profile_id_profiles_user_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_id: string
          alert_status: Database["public"]["Enums"]["alert_status"]
          alert_type: Database["public"]["Enums"]["alert_type"]
          content: string
          created_at: string
          is_important: boolean | null
          link: string | null
          metadata: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string | null
          title: string
        }
        Insert: {
          alert_id?: string
          alert_status?: Database["public"]["Enums"]["alert_status"]
          alert_type: Database["public"]["Enums"]["alert_type"]
          content: string
          created_at?: string
          is_important?: boolean | null
          link?: string | null
          metadata?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id?: string | null
          title: string
        }
        Update: {
          alert_id?: string
          alert_status?: Database["public"]["Enums"]["alert_status"]
          alert_type?: Database["public"]["Enums"]["alert_type"]
          content?: string
          created_at?: string
          is_important?: boolean | null
          link?: string | null
          metadata?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_recipient_id_profiles_user_id_fk"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "alerts_sender_id_profiles_user_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      api_keys: {
        Row: {
          api_key_id: string
          is_active: boolean | null
          key_hash: string
          name: string
          user_id: string
        }
        Insert: {
          api_key_id?: string
          is_active?: boolean | null
          key_hash: string
          name: string
          user_id: string
        }
        Update: {
          api_key_id?: string
          is_active?: boolean | null
          key_hash?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      "auth.users": {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          bookmark_id: string
          created_at: string | null
          ebook_id: string
          page_number: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bookmark_id?: string
          created_at?: string | null
          ebook_id: string
          page_number: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bookmark_id?: string
          created_at?: string | null
          ebook_id?: string
          page_number?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          cart_item_id: string
          ebook_id: string
        }
        Insert: {
          cart_id: string
          cart_item_id?: string
          ebook_id: string
        }
        Update: {
          cart_id?: string
          cart_item_id?: string
          ebook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_carts_cart_id_fk"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["cart_id"]
          },
          {
            foreignKeyName: "cart_items_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
        ]
      }
      carts: {
        Row: {
          cart_id: string
          user_id: string
        }
        Insert: {
          cart_id?: string
          user_id: string
        }
        Update: {
          cart_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categories: {
        Row: {
          category_id: string
          created_at: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string
          created_at?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      collaborators: {
        Row: {
          collaborator_id: string
          created_at: string | null
          ebook_id: string
          permission: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          collaborator_id?: string
          created_at?: string | null
          ebook_id: string
          permission?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          collaborator_id?: string
          created_at?: string | null
          ebook_id?: string
          permission?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
          {
            foreignKeyName: "collaborators_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          code: string
          discount_code_id: string
          discount_value: number
        }
        Insert: {
          code: string
          discount_code_id?: string
          discount_value: number
        }
        Update: {
          code?: string
          discount_code_id?: string
          discount_value?: number
        }
        Relationships: []
      }
      ebook_categories: {
        Row: {
          category_id: string
          created_at: string | null
          ebook_category_id: string
          ebook_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          ebook_category_id?: string
          ebook_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          ebook_category_id?: string
          ebook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebook_categories_category_id_categories_category_id_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "ebook_categories_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
        ]
      }
      ebook_pages: {
        Row: {
          blocks: Json | null
          created_at: string | null
          ebook_id: string
          page_id: string
          page_number: number
          position: number
          title: string | null
          updated_at: string | null
        }
        Insert: {
          blocks?: Json | null
          created_at?: string | null
          ebook_id: string
          page_id?: string
          page_number: number
          position: number
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          blocks?: Json | null
          created_at?: string | null
          ebook_id?: string
          page_id?: string
          page_number?: number
          position?: number
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ebook_pages_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
        ]
      }
      ebook_versions: {
        Row: {
          content_markdown: string | null
          created_at: string | null
          ebook_id: string
          version_id: string
          version_number: number
        }
        Insert: {
          content_markdown?: string | null
          created_at?: string | null
          ebook_id: string
          version_id?: string
          version_number: number
        }
        Update: {
          content_markdown?: string | null
          created_at?: string | null
          ebook_id?: string
          version_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ebook_versions_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
        ]
      }
      ebooks: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          ebook_id: string
          ebook_status: Database["public"]["Enums"]["ebook_status"]
          is_featured: boolean | null
          isbn: string | null
          language: string | null
          page_count: number | null
          price: number | null
          publication_date: string | null
          reading_time: number | null
          sample_content: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          ebook_id?: string
          ebook_status?: Database["public"]["Enums"]["ebook_status"]
          is_featured?: boolean | null
          isbn?: string | null
          language?: string | null
          page_count?: number | null
          price?: number | null
          publication_date?: string | null
          reading_time?: number | null
          sample_content?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          ebook_id?: string
          ebook_status?: Database["public"]["Enums"]["ebook_status"]
          is_featured?: boolean | null
          isbn?: string | null
          language?: string | null
          page_count?: number | null
          price?: number | null
          publication_date?: string | null
          reading_time?: number | null
          sample_content?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebooks_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      highlights: {
        Row: {
          block_id: string | null
          block_type: string | null
          color: string | null
          created_at: string | null
          ebook_id: string
          end_position: number
          highlight_id: string
          note: string | null
          page_number: number
          start_position: number
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          block_id?: string | null
          block_type?: string | null
          color?: string | null
          created_at?: string | null
          ebook_id: string
          end_position: number
          highlight_id?: string
          note?: string | null
          page_number: number
          start_position: number
          text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          block_id?: string | null
          block_type?: string | null
          color?: string | null
          created_at?: string | null
          ebook_id?: string
          end_position?: number
          highlight_id?: string
          note?: string | null
          page_number?: number
          start_position?: number
          text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "highlights_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
          {
            foreignKeyName: "highlights_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      interview_answers: {
        Row: {
          answer_content: string
          answer_id: string
          ebook_id: string
          question_id: string
        }
        Insert: {
          answer_content: string
          answer_id?: string
          ebook_id: string
          question_id: string
        }
        Update: {
          answer_content?: string
          answer_id?: string
          ebook_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
          {
            foreignKeyName: "interview_answers_question_id_interview_questions_question_id_f"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["question_id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          content: string
          is_required: boolean | null
          question_id: string
          question_type: Database["public"]["Enums"]["question_type"] | null
        }
        Insert: {
          content: string
          is_required?: boolean | null
          question_id?: string
          question_type?: Database["public"]["Enums"]["question_type"] | null
        }
        Update: {
          content?: string
          is_required?: boolean | null
          question_id?: string
          question_type?: Database["public"]["Enums"]["question_type"] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          is_read: boolean | null
          notification_id: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          content: string
          is_read?: boolean | null
          notification_id?: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          content?: string
          is_read?: boolean | null
          notification_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          line_user_id: string | null
          name: string
          role: Database["public"]["Enums"]["role"] | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          line_user_id?: string | null
          name: string
          role?: Database["public"]["Enums"]["role"] | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          line_user_id?: string | null
          name?: string
          role?: Database["public"]["Enums"]["role"] | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          created_at: string | null
          current_page: number | null
          ebook_id: string
          is_completed: boolean | null
          last_read_at: string | null
          progress_id: string
          progress_percentage: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_page?: number | null
          ebook_id: string
          is_completed?: boolean | null
          last_read_at?: string | null
          progress_id?: string
          progress_percentage?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_page?: number | null
          ebook_id?: string
          is_completed?: boolean | null
          last_read_at?: string | null
          progress_id?: string
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          ebook_id: string
          rating: number
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          ebook_id: string
          rating: number
          review_id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          ebook_id?: string
          rating?: number
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
          {
            foreignKeyName: "reviews_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sales: {
        Row: {
          ebook_id: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          price: number
          purchased_at: string
          sale_id: string
          user_id: string
        }
        Insert: {
          ebook_id: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          price: number
          purchased_at?: string
          sale_id?: string
          user_id: string
        }
        Update: {
          ebook_id?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          price?: number
          purchased_at?: string
          sale_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
          {
            foreignKeyName: "sales_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shares: {
        Row: {
          ebook_id: string
          share_id: string
          share_type: string
          user_id: string
        }
        Insert: {
          ebook_id: string
          share_id?: string
          share_type: string
          user_id: string
        }
        Update: {
          ebook_id?: string
          share_id?: string
          share_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_ebook_id_ebooks_ebook_id_fk"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["ebook_id"]
          },
          {
            foreignKeyName: "shares_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_invoices: {
        Row: {
          amount: number
          invoice_id: string
          subscription_id: string
        }
        Insert: {
          amount: number
          invoice_id?: string
          subscription_id: string
        }
        Update: {
          amount?: number
          invoice_id?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_invoices_subscription_id_subscriptions_subscriptio"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["subscription_id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          name: string
          plan_id: string
          price: number
        }
        Insert: {
          name: string
          plan_id?: string
          price: number
        }
        Update: {
          name?: string
          plan_id?: string
          price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          plan_id: string
          subscription_id: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          user_id: string
        }
        Insert: {
          plan_id: string
          subscription_id?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          user_id: string
        }
        Update: {
          plan_id?: string
          subscription_id?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_subscription_plans_plan_id_fk"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      usage_limits: {
        Row: {
          current_month_api_usage: number | null
          monthly_api_limit: number | null
          user_id: string
        }
        Insert: {
          current_month_api_usage?: number | null
          monthly_api_limit?: number | null
          user_id: string
        }
        Update: {
          current_month_api_usage?: number | null
          monthly_api_limit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_limits_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_actions: {
        Row: {
          action_id: string
          action_type: Database["public"]["Enums"]["action_type"]
          user_id: string
        }
        Insert: {
          action_id?: string
          action_type: Database["public"]["Enums"]["action_type"]
          user_id: string
        }
        Update: {
          action_id?: string
          action_type?: Database["public"]["Enums"]["action_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_actions_user_id_profiles_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
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
      action_type: "view" | "like" | "comment" | "share"
      alert_status: "UNREAD" | "READ" | "ARCHIVED"
      alert_type: "SYSTEM_NOTIFICATION"
      ebook_status: "draft" | "published" | "archived"
      notification_type: "info" | "warning" | "error"
      payment_type: "credit_card" | "bank_transfer" | "paypal"
      question_type: "text" | "multiple_choice" | "rating"
      role: "ADVERTISER" | "INFLUENCER" | "ADMIN"
      subscription_status: "active" | "paused" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
