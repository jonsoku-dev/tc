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
            foreignKeyName: "alert_settings_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
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
            foreignKeyName: "alerts_recipient_id_profiles_profile_id_fk"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "alerts_sender_id_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
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
      profiles: {
        Row: {
          created_at: string
          line_user_id: string | null
          name: string
          profile_id: string
          role: Database["public"]["Enums"]["role"] | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          line_user_id?: string | null
          name: string
          profile_id: string
          role?: Database["public"]["Enums"]["role"] | null
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          line_user_id?: string | null
          name?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["role"] | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_status: "UNREAD" | "READ" | "ARCHIVED"
      alert_type: "SYSTEM_NOTIFICATION"
      role: "ADVERTISER" | "INFLUENCER" | "ADMIN"
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
