export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          internal_notes: string | null
          material: string | null
          nameplate_text: string | null
          product_source: string
          product_type: string | null
          production_batch: string | null
          production_date: string | null
          production_model: string | null
          public_slug: string
          qr_url: string
          serial_number: string
          size: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          internal_notes?: string | null
          material?: string | null
          nameplate_text?: string | null
          product_source: string
          product_type?: string | null
          production_batch?: string | null
          production_date?: string | null
          production_model?: string | null
          public_slug: string
          qr_url: string
          serial_number: string
          size?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          internal_notes?: string | null
          material?: string | null
          nameplate_text?: string | null
          product_source?: string
          product_type?: string | null
          production_batch?: string | null
          production_date?: string | null
          production_model?: string | null
          public_slug?: string
          qr_url?: string
          serial_number?: string
          size?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_images: {
        Row: {
          caption_en: string | null
          caption_zh: string | null
          created_at: string
          id: string
          image_type: string
          repair_record_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          caption_en?: string | null
          caption_zh?: string | null
          created_at?: string
          id?: string
          image_type: string
          repair_record_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          caption_en?: string | null
          caption_zh?: string | null
          created_at?: string
          id?: string
          image_type?: string
          repair_record_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_images_repair_record_id_fkey"
            columns: ["repair_record_id"]
            isOneToOne: false
            referencedRelation: "repair_records"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_records: {
        Row: {
          created_at: string
          factory: string | null
          id: string
          internal_code: string | null
          internal_notes_zh: string | null
          nameplate_code: string | null
          product_id: string
          public_notes_en: string | null
          received_date: string | null
          repair_date: string
          repair_number: number
          status: string
          summary_en: string | null
          summary_zh: string | null
          tracking_owner: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          factory?: string | null
          id?: string
          internal_code?: string | null
          internal_notes_zh?: string | null
          nameplate_code?: string | null
          product_id: string
          public_notes_en?: string | null
          received_date?: string | null
          repair_date: string
          repair_number: number
          status?: string
          summary_en?: string | null
          summary_zh?: string | null
          tracking_owner?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          factory?: string | null
          id?: string
          internal_code?: string | null
          internal_notes_zh?: string | null
          nameplate_code?: string | null
          product_id?: string
          public_notes_en?: string | null
          received_date?: string | null
          repair_date?: string
          repair_number?: number
          status?: string
          summary_en?: string | null
          summary_zh?: string | null
          tracking_owner?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_tasks: {
        Row: {
          action_en: string | null
          action_zh: string | null
          created_at: string
          description_en: string | null
          description_zh: string | null
          equipment_en: string | null
          equipment_zh: string | null
          id: string
          process_name_en: string | null
          process_name_zh: string | null
          process_type: string | null
          quantity: string | null
          repair_record_id: string
          responsible_person_en: string | null
          responsible_person_zh: string | null
          result: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          action_en?: string | null
          action_zh?: string | null
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          equipment_en?: string | null
          equipment_zh?: string | null
          id?: string
          process_name_en?: string | null
          process_name_zh?: string | null
          process_type?: string | null
          quantity?: string | null
          repair_record_id: string
          responsible_person_en?: string | null
          responsible_person_zh?: string | null
          result?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          action_en?: string | null
          action_zh?: string | null
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          equipment_en?: string | null
          equipment_zh?: string | null
          id?: string
          process_name_en?: string | null
          process_name_zh?: string | null
          process_type?: string | null
          quantity?: string | null
          repair_record_id?: string
          responsible_person_en?: string | null
          responsible_person_zh?: string | null
          result?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_tasks_repair_record_id_fkey"
            columns: ["repair_record_id"]
            isOneToOne: false
            referencedRelation: "repair_records"
            referencedColumns: ["id"]
          },
        ]
      }
      serial_counters: {
        Row: {
          id: string
          month: number
          next_number: number
          source: string
          year: number
        }
        Insert: {
          id?: string
          month: number
          next_number?: number
          source: string
          year: number
        }
        Update: {
          id?: string
          month?: number
          next_number?: number
          source?: string
          year?: number
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
