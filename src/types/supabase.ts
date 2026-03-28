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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          business_type: string | null
          created_at: string
          id: string
          onboarding_milestones: Json | null
          onboarding_status: string | null
          product_type: string | null
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          id?: string
          onboarding_milestones?: Json | null
          onboarding_status?: string | null
          product_type?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_type?: string | null
          created_at?: string
          id?: string
          onboarding_milestones?: Json | null
          onboarding_status?: string | null
          product_type?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action_type: string | null
          admin_id: string | null
          details: string | null
          id: string
          new_value: Json | null
          previous_value: Json | null
          target_resource: string | null
          target_resource_id: string | null
          timestamp: string | null
        }
        Insert: {
          action_type?: string | null
          admin_id?: string | null
          details?: string | null
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          target_resource?: string | null
          target_resource_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action_type?: string | null
          admin_id?: string | null
          details?: string | null
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          target_resource?: string | null
          target_resource_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_manager_cost_inputs: {
        Row: {
          avg_messages_per_day: number | null
          avg_tokens_per_message: number | null
          calendar_sync_monthly_cost: number | null
          integration_api_monthly_cost: number | null
          manager_slug: string
          updated_at: string | null
        }
        Insert: {
          avg_messages_per_day?: number | null
          avg_tokens_per_message?: number | null
          calendar_sync_monthly_cost?: number | null
          integration_api_monthly_cost?: number | null
          manager_slug: string
          updated_at?: string | null
        }
        Update: {
          avg_messages_per_day?: number | null
          avg_tokens_per_message?: number | null
          calendar_sync_monthly_cost?: number | null
          integration_api_monthly_cost?: number | null
          manager_slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_manager_cost_inputs_manager_slug_fkey"
            columns: ["manager_slug"]
            isOneToOne: true
            referencedRelation: "ai_managers"
            referencedColumns: ["slug"]
          },
        ]
      }
      ai_manager_pricing_history: {
        Row: {
          changed_by: string | null
          id: string
          manager_slug: string | null
          new_price: number | null
          old_price: number | null
          timestamp: string | null
        }
        Insert: {
          changed_by?: string | null
          id?: string
          manager_slug?: string | null
          new_price?: number | null
          old_price?: number | null
          timestamp?: string | null
        }
        Update: {
          changed_by?: string | null
          id?: string
          manager_slug?: string | null
          new_price?: number | null
          old_price?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_manager_pricing_history_manager_slug_fkey"
            columns: ["manager_slug"]
            isOneToOne: false
            referencedRelation: "ai_managers"
            referencedColumns: ["slug"]
          },
        ]
      }
      ai_managers: {
        Row: {
          audience: string | null
          avatar_url: string | null
          base_monthly_price: number | null
          features: Json | null
          id: string | null
          integrations: Json | null
          name: string
          responsibility: string | null
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          audience?: string | null
          avatar_url?: string | null
          base_monthly_price?: number | null
          features?: Json | null
          id?: string | null
          integrations?: Json | null
          name: string
          responsibility?: string | null
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          audience?: string | null
          avatar_url?: string | null
          base_monthly_price?: number | null
          features?: Json | null
          id?: string | null
          integrations?: Json | null
          name?: string
          responsibility?: string | null
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_memory: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          last_used_at: string | null
          listing_id: string | null
          memory_type: string
          metadata: Json | null
          summary: string
          tenant_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          listing_id?: string | null
          memory_type: string
          metadata?: Json | null
          summary: string
          tenant_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          listing_id?: string | null
          memory_type?: string
          metadata?: Json | null
          summary?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_memory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_events: {
        Row: {
          action_type: string
          created_at: string
          credits_deducted: number
          id: string
          metadata: Json | null
          model: string | null
          tenant_id: string
          tokens_used: number
        }
        Insert: {
          action_type: string
          created_at?: string
          credits_deducted: number
          id?: string
          metadata?: Json | null
          model?: string | null
          tenant_id: string
          tokens_used: number
        }
        Update: {
          action_type?: string
          created_at?: string
          credits_deducted?: number
          id?: string
          metadata?: Json | null
          model?: string | null
          tenant_id?: string
          tokens_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          actor_id: string | null
          actor_type: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string | null
          id: string
          is_impersonated: boolean | null
          metadata: Json | null
          tenant_id: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string | null
          id?: string
          is_impersonated?: boolean | null
          metadata?: Json | null
          tenant_id?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string | null
          id?: string
          is_impersonated?: boolean | null
          metadata?: Json | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          actor_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          tenant_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          tenant_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          interval: string | null
          name: string
          price: number
          product: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id: string
          interval?: string | null
          name: string
          price: number
          product?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string | null
          name?: string
          price?: number
          product?: string | null
          type?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount: number | null
          check_in: string | null
          check_out: string | null
          created_at: string | null
          end_date: string | null
          guest_contact: string | null
          guest_id: string | null
          id: string
          id_status: string | null
          listing_id: string | null
          metadata: Json | null
          payment_id: string | null
          source: string | null
          start_date: string | null
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          amount?: number | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          end_date?: string | null
          guest_contact?: string | null
          guest_id?: string | null
          id?: string
          id_status?: string | null
          listing_id?: string | null
          metadata?: Json | null
          payment_id?: string | null
          source?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          amount?: number | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          end_date?: string | null
          guest_contact?: string | null
          guest_id?: string | null
          id?: string
          id_status?: string | null
          listing_id?: string | null
          metadata?: Json | null
          payment_id?: string | null
          source?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_sessions: {
        Row: {
          camera_id: string
          created_at: string
          frame_ref: string | null
          id: string
          ingestion_id: string | null
          metadata: Json | null
          processed_at: string | null
          size_bytes: number | null
          status: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          camera_id: string
          created_at?: string
          frame_ref?: string | null
          id?: string
          ingestion_id?: string | null
          metadata?: Json | null
          processed_at?: string | null
          size_bytes?: number | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          camera_id?: string
          created_at?: string
          frame_ref?: string | null
          id?: string
          ingestion_id?: string | null
          metadata?: Json | null
          processed_at?: string | null
          size_bytes?: number | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      consent_forms: {
        Row: {
          body_markdown: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          tenant_id: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          body_markdown: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          tenant_id: string
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          tenant_id?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_forms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          channel: string
          contact_avatar: string | null
          contact_name: string | null
          created_at: string | null
          external_id: string | null
          id: string
          last_message_at: string | null
          metadata: Json | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          channel: string
          contact_avatar?: string | null
          contact_name?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          channel?: string
          contact_avatar?: string | null
          contact_name?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      datacenters: {
        Row: {
          active_nodes: number
          admin_notes: string[] | null
          created_at: string
          id: string
          location: string
          name: string
          status: string
          total_capacity: number
        }
        Insert: {
          active_nodes?: number
          admin_notes?: string[] | null
          created_at?: string
          id: string
          location: string
          name: string
          status?: string
          total_capacity?: number
        }
        Update: {
          active_nodes?: number
          admin_notes?: string[] | null
          created_at?: string
          id?: string
          location?: string
          name?: string
          status?: string
          total_capacity?: number
        }
        Relationships: []
      }
      failures: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          message: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
          source: string
          tenant_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          severity: string
          source: string
          tenant_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          source?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "failures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          description: string | null
          is_global_enabled: boolean | null
          key: string
          tenant_overrides: string[] | null
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          is_global_enabled?: boolean | null
          key: string
          tenant_overrides?: string[] | null
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          is_global_enabled?: boolean | null
          key?: string
          tenant_overrides?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      flow_execution_logs: {
        Row: {
          error_message: string | null
          execution_steps: Json | null
          finished_at: string | null
          flow_id: string | null
          id: string
          started_at: string | null
          status: string
          tenant_id: string
          trigger_data: Json
        }
        Insert: {
          error_message?: string | null
          execution_steps?: Json | null
          finished_at?: string | null
          flow_id?: string | null
          id?: string
          started_at?: string | null
          status: string
          tenant_id: string
          trigger_data: Json
        }
        Update: {
          error_message?: string | null
          execution_steps?: Json | null
          finished_at?: string | null
          flow_id?: string | null
          id?: string
          started_at?: string | null
          status?: string
          tenant_id?: string
          trigger_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "flow_execution_logs_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "kaisa_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_execution_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      google_context: {
        Row: {
          has_business_access: boolean | null
          has_calendar_access: boolean | null
          has_gmail_access: boolean | null
          last_business_sync: string | null
          last_calendar_sync: string | null
          last_email_sync: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          has_business_access?: boolean | null
          has_calendar_access?: boolean | null
          has_gmail_access?: boolean | null
          last_business_sync?: string | null
          last_calendar_sync?: string | null
          last_email_sync?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          has_business_access?: boolean | null
          has_calendar_access?: boolean | null
          has_gmail_access?: boolean | null
          last_business_sync?: string | null
          last_calendar_sync?: string | null
          last_email_sync?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_context_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_context_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_campaigns: {
        Row: {
          auto_send: boolean | null
          created_at: string | null
          id: string
          message_template: string | null
          name: string
          stats: Json | null
          status: string | null
          tenant_id: string
          trigger_config: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          auto_send?: boolean | null
          created_at?: string | null
          id?: string
          message_template?: string | null
          name: string
          stats?: Json | null
          status?: string | null
          tenant_id: string
          trigger_config?: Json | null
          type: string
          updated_at?: string | null
        }
        Update: {
          auto_send?: boolean | null
          created_at?: string | null
          id?: string
          message_template?: string | null
          name?: string
          stats?: Json | null
          status?: string | null
          tenant_id?: string
          trigger_config?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_checkins: {
        Row: {
          arrival_time: string | null
          booking_id: string | null
          created_at: string | null
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          id_document_id: string | null
          id_verified: boolean | null
          metadata: Json | null
          num_guests: number | null
          payment_link_id: string | null
          special_requests: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          arrival_time?: string | null
          booking_id?: string | null
          created_at?: string | null
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          id_document_id?: string | null
          id_verified?: boolean | null
          metadata?: Json | null
          num_guests?: number | null
          payment_link_id?: string | null
          special_requests?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          arrival_time?: string | null
          booking_id?: string | null
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          id_document_id?: string | null
          id_verified?: boolean | null
          metadata?: Json | null
          num_guests?: number | null
          payment_link_id?: string | null
          special_requests?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_checkins_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_checkins_id_document_id_fkey"
            columns: ["id_document_id"]
            isOneToOne: false
            referencedRelation: "kyc_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_checkins_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_checkins_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_consent_signatures: {
        Row: {
          consent_form_id: string | null
          consent_form_version: string | null
          consent_text_snapshot: string
          created_at: string
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          kyc_request_id: string
          pdf_sha256: string
          pdf_size_bytes: number | null
          pdf_storage_path: string
          signature_base64: string | null
          signed_at: string
          signer_ip: string
          signer_user_agent: string
          tenant_id: string
        }
        Insert: {
          consent_form_id?: string | null
          consent_form_version?: string | null
          consent_text_snapshot: string
          created_at?: string
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          kyc_request_id: string
          pdf_sha256: string
          pdf_size_bytes?: number | null
          pdf_storage_path: string
          signature_base64?: string | null
          signed_at?: string
          signer_ip: string
          signer_user_agent: string
          tenant_id: string
        }
        Update: {
          consent_form_id?: string | null
          consent_form_version?: string | null
          consent_text_snapshot?: string
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          kyc_request_id?: string
          pdf_sha256?: string
          pdf_size_bytes?: number | null
          pdf_storage_path?: string
          signature_base64?: string | null
          signed_at?: string
          signer_ip?: string
          signer_user_agent?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_consent_signatures_consent_form_id_fkey"
            columns: ["consent_form_id"]
            isOneToOne: false
            referencedRelation: "consent_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_consent_signatures_kyc_request_id_fkey"
            columns: ["kyc_request_id"]
            isOneToOne: false
            referencedRelation: "guest_kyc_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_consent_signatures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_documents: {
        Row: {
          aadhaar_last4: string | null
          back_image_path: string | null
          created_at: string
          document_type: string
          extracted_data: Json
          front_image_path: string
          id: string
          kyc_request_id: string
          rejection_reason: string | null
          tenant_id: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          aadhaar_last4?: string | null
          back_image_path?: string | null
          created_at?: string
          document_type: string
          extracted_data?: Json
          front_image_path: string
          id?: string
          kyc_request_id: string
          rejection_reason?: string | null
          tenant_id: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          aadhaar_last4?: string | null
          back_image_path?: string | null
          created_at?: string
          document_type?: string
          extracted_data?: Json
          front_image_path?: string
          id?: string
          kyc_request_id?: string
          rejection_reason?: string | null
          tenant_id?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_documents_kyc_request_id_fkey"
            columns: ["kyc_request_id"]
            isOneToOne: false
            referencedRelation: "guest_kyc_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_id_documents: {
        Row: {
          back_image_path: string | null
          booking_id: string | null
          created_at: string | null
          document_type: string | null
          front_image_path: string | null
          id: string
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          back_image_path?: string | null
          booking_id?: string | null
          created_at?: string | null
          document_type?: string | null
          front_image_path?: string | null
          id?: string
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          back_image_path?: string | null
          booking_id?: string | null
          created_at?: string | null
          document_type?: string | null
          front_image_path?: string | null
          id?: string
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_id_documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_id_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_ids: {
        Row: {
          back_image_path: string | null
          booking_id: string | null
          front_image_path: string | null
          guest_name: string
          id: string
          id_type: string
          rejection_reason: string | null
          requested_at: string | null
          reviewed_at: string | null
          status: string | null
          tenant_id: string | null
          upload_token: string | null
          uploaded_at: string | null
        }
        Insert: {
          back_image_path?: string | null
          booking_id?: string | null
          front_image_path?: string | null
          guest_name: string
          id?: string
          id_type: string
          rejection_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          status?: string | null
          tenant_id?: string | null
          upload_token?: string | null
          uploaded_at?: string | null
        }
        Update: {
          back_image_path?: string | null
          booking_id?: string | null
          front_image_path?: string | null
          guest_name?: string
          id?: string
          id_type?: string
          rejection_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          status?: string | null
          tenant_id?: string | null
          upload_token?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_ids_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_kyc_requests: {
        Row: {
          booking_id: string | null
          booking_reference: string | null
          consent_form_id: string | null
          created_at: string
          credits_charged: boolean
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          status: string
          tenant_id: string
          token: string
          token_expires_at: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          booking_reference?: string | null
          consent_form_id?: string | null
          created_at?: string
          credits_charged?: boolean
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          status?: string
          tenant_id: string
          token?: string
          token_expires_at?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          booking_reference?: string | null
          consent_form_id?: string | null
          created_at?: string
          credits_charged?: boolean
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          status?: string
          tenant_id?: string
          token?: string
          token_expires_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_kyc_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_kyc_requests_consent_form_id_fkey"
            columns: ["consent_form_id"]
            isOneToOne: false
            referencedRelation: "consent_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_kyc_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          ai_paused: boolean | null
          channel: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          tenant_id: string | null
        }
        Insert: {
          ai_paused?: boolean | null
          channel?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          tenant_id?: string | null
        }
        Update: {
          ai_paused?: boolean | null
          channel?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token: string | null
          connected_email: string | null
          connected_name: string | null
          created_at: string
          credentials: Json | null
          enabled: boolean | null
          error_code: string | null
          expires_at: string | null
          id: string
          last_synced_at: string | null
          provider: string
          refresh_token: string | null
          scopes: string[] | null
          settings: Json | null
          status: string | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          connected_email?: string | null
          connected_name?: string | null
          created_at?: string
          credentials?: Json | null
          enabled?: boolean | null
          error_code?: string | null
          expires_at?: string | null
          id?: string
          last_synced_at?: string | null
          provider: string
          refresh_token?: string | null
          scopes?: string[] | null
          settings?: Json | null
          status?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          connected_email?: string | null
          connected_name?: string | null
          created_at?: string
          credentials?: Json | null
          enabled?: boolean | null
          error_code?: string | null
          expires_at?: string | null
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string | null
          scopes?: string[] | null
          settings?: Json | null
          status?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_documents: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          title: string
          type: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          title: string
          type?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          type?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      investor_reports: {
        Row: {
          generated_at: string | null
          id: string
          metadata: Json | null
          period: string | null
          title: string
          url: string
          user_id: string | null
        }
        Insert: {
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          period?: string | null
          title: string
          url: string
          user_id?: string | null
        }
        Update: {
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          period?: string | null
          title?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          billing_details: Json | null
          created_at: string | null
          currency: string | null
          date: string | null
          due_date: string | null
          id: string
          items: Json | null
          status: string | null
          subscription_id: string | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          billing_details?: Json | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          due_date?: string | null
          id?: string
          items?: Json | null
          status?: string | null
          subscription_id?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_details?: Json | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          due_date?: string | null
          id?: string
          items?: Json | null
          status?: string | null
          subscription_id?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kaisa_accounts: {
        Row: {
          active_modules: Json | null
          ai_manager_slug: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          plan_name: string | null
          plan_price: number | null
          role: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string | null
          wallet_balance: number | null
        }
        Insert: {
          active_modules?: Json | null
          ai_manager_slug?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          plan_name?: string | null
          plan_price?: number | null
          role?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_balance?: number | null
        }
        Update: {
          active_modules?: Json | null
          ai_manager_slug?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          plan_name?: string | null
          plan_price?: number | null
          role?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kaisa_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kaisa_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kaisa_credits: {
        Row: {
          balance: number | null
          monthly_limit: number | null
          tenant_id: string | null
          updated_at: string | null
          used_this_month: number | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          monthly_limit?: number | null
          tenant_id?: string | null
          updated_at?: string | null
          used_this_month?: number | null
          user_id: string
        }
        Update: {
          balance?: number | null
          monthly_limit?: number | null
          tenant_id?: string | null
          updated_at?: string | null
          used_this_month?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kaisa_credits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kaisa_flows: {
        Row: {
          created_at: string | null
          description: string | null
          edges: Json | null
          id: string
          name: string
          nodes: Json | null
          priority: number | null
          status: string | null
          tenant_id: string
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          name: string
          nodes?: Json | null
          priority?: number | null
          status?: string | null
          tenant_id: string
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          name?: string
          nodes?: Json | null
          priority?: number | null
          status?: string | null
          tenant_id?: string
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kaisa_flows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kaisa_memories: {
        Row: {
          confidence: number | null
          created_at: string | null
          description: string
          id: string
          last_used_at: string | null
          metadata: Json | null
          module_id: string | null
          source: string
          status: string | null
          tenant_id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          description: string
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          module_id?: string | null
          source: string
          status?: string | null
          tenant_id: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          description?: string
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          module_id?: string | null
          source?: string
          status?: string | null
          tenant_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kaisa_memories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kaisa_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          intent: string | null
          module: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          module?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          module?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          content: string
          created_at: string | null
          document_id: string
          embedding: string | null
          id: string
          metadata: Json | null
          tenant_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          tenant_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          created_at: string | null
          file_path: string
          file_type: string
          id: string
          metadata: Json | null
          name: string
          status: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_type: string
          id?: string
          metadata?: Json | null
          name: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_type?: string
          id?: string
          metadata?: Json | null
          name?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          created_at: string | null
          document_type: string
          error_message: string | null
          extracted_data: Json | null
          file_path: string
          id: string
          status: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          error_message?: string | null
          extracted_data?: Json | null
          file_path: string
          id?: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          error_message?: string | null
          extracted_data?: Json | null
          file_path?: string
          id?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_opportunities: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          expires_at: string | null
          guest_id: string | null
          id: string
          listing_id: string | null
          metadata: Json | null
          opportunity_type: string
          status: string | null
          suggested_message: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          guest_id?: string | null
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          opportunity_type: string
          status?: string | null
          suggested_message: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          guest_id?: string | null
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          opportunity_type?: string
          status?: string | null
          suggested_message?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_opportunities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "growth_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_opportunities_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_opportunities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_calendars: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          nodebase_ical_url: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          nodebase_ical_url?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          nodebase_ical_url?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_calendars_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_calendars_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_integrations: {
        Row: {
          created_at: string | null
          external_ical_url: string | null
          id: string
          last_synced_at: string | null
          listing_id: string | null
          metadata: Json | null
          platform: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_ical_url?: string | null
          id?: string
          last_synced_at?: string | null
          listing_id?: string | null
          metadata?: Json | null
          platform?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_ical_url?: string | null
          id?: string
          last_synced_at?: string | null
          listing_id?: string | null
          metadata?: Json | null
          platform?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_integrations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_price_history: {
        Row: {
          created_at: string | null
          date: string
          id: string
          listing_id: string
          metadata: Json | null
          price: number
          reason: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          listing_id: string
          metadata?: Json | null
          price: number
          reason?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          listing_id?: string
          metadata?: Json | null
          price?: number
          reason?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_price_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          base_price: number | null
          calendar_ical_url: string | null
          check_in_time: string | null
          check_out_time: string | null
          city: string | null
          created_at: string | null
          description: string | null
          dynamic_pricing_settings: Json | null
          host_id: string | null
          id: string
          internal_notes: string | null
          listing_type: string | null
          location: string | null
          max_guests: number | null
          metadata: Json | null
          name: string | null
          rules: string | null
          status: string | null
          tenant_id: string | null
          timezone: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          calendar_ical_url?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          dynamic_pricing_settings?: Json | null
          host_id?: string | null
          id?: string
          internal_notes?: string | null
          listing_type?: string | null
          location?: string | null
          max_guests?: number | null
          metadata?: Json | null
          name?: string | null
          rules?: string | null
          status?: string | null
          tenant_id?: string | null
          timezone?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          calendar_ical_url?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          dynamic_pricing_settings?: Json | null
          host_id?: string | null
          id?: string
          internal_notes?: string | null
          listing_type?: string | null
          location?: string | null
          max_guests?: number | null
          metadata?: Json | null
          name?: string | null
          rules?: string | null
          status?: string | null
          tenant_id?: string | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel: string | null
          content: string | null
          conversation_id: string | null
          created_at: string | null
          direction: string | null
          external_id: string | null
          guest_id: string | null
          id: string
          listing_id: string | null
          metadata: Json | null
          role: string
          tenant_id: string | null
        }
        Insert: {
          channel?: string | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          external_id?: string | null
          guest_id?: string | null
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          role: string
          tenant_id?: string | null
        }
        Update: {
          channel?: string | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          external_id?: string | null
          guest_id?: string | null
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          role?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      nodes: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          mou_status: string | null
          purchase_date: string | null
          unit_value: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mou_status?: string | null
          purchase_date?: string | null
          unit_value?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mou_status?: string | null
          purchase_date?: string | null
          unit_value?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_accounts: {
        Row: {
          created_at: string
          id: string
          onboarding_url: string | null
          provider: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          onboarding_url?: string | null
          provider: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_url?: string | null
          provider?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_links: {
        Row: {
          amount: number
          conversation_id: string | null
          created_at: string | null
          currency: string | null
          expires_at: string
          external_order_id: string | null
          id: string
          listing_id: string | null
          metadata: Json | null
          payment_method: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          conversation_id?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at: string
          external_order_id?: string | null
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          conversation_id?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string
          external_order_id?: string | null
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          last4: string | null
          metadata: Json | null
          provider_id: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          metadata?: Json | null
          provider_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          metadata?: Json | null
          provider_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          booking_id: string | null
          created_at: string
          id: string
          paid_at: string | null
          payment_link: string | null
          provider: string
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_link?: string | null
          provider: string
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_link?: string | null
          provider?: string
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      price_suggestions: {
        Row: {
          confidence: number | null
          created_at: string | null
          current_price: number
          date: string
          id: string
          listing_id: string
          metadata: Json | null
          reason: string | null
          status: string | null
          suggested_price: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          current_price: number
          date: string
          id?: string
          listing_id: string
          metadata?: Json | null
          reason?: string | null
          status?: string | null
          suggested_price: number
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          current_price?: number
          date?: string
          id?: string
          listing_id?: string
          metadata?: Json | null
          reason?: string | null
          status?: string | null
          suggested_price?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_suggestions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_cost_config: {
        Row: {
          core_logic_margin_pct: number | null
          id: string
          node_infra_margin_pct: number | null
          token_cost_per_1k: number | null
          updated_at: string | null
        }
        Insert: {
          core_logic_margin_pct?: number | null
          id?: string
          node_infra_margin_pct?: number | null
          token_cost_per_1k?: number | null
          updated_at?: string | null
        }
        Update: {
          core_logic_margin_pct?: number | null
          id?: string
          node_infra_margin_pct?: number | null
          token_cost_per_1k?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_id: string | null
          referrer_id: string | null
          referrer_tenant_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          referrer_tenant_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          referrer_tenant_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_tenant_id_fkey"
            columns: ["referrer_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      space_dns_records: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          project_id: string | null
          ttl: number | null
          type: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          ttl?: number | null
          type?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          ttl?: number | null
          type?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "space_dns_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "space_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      space_projects: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          last_backup: string | null
          name: string | null
          service_id: string | null
          ssl_enabled: boolean | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          last_backup?: string | null
          name?: string | null
          service_id?: string | null
          ssl_enabled?: boolean | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          last_backup?: string | null
          name?: string | null
          service_id?: string | null
          ssl_enabled?: boolean | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "space_projects_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "space_services"
            referencedColumns: ["id"]
          },
        ]
      }
      space_services: {
        Row: {
          created_at: string | null
          datacenter_id: string | null
          id: string
          limits: Json | null
          plan_name: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          datacenter_id?: string | null
          id?: string
          limits?: Json | null
          plan_name?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          datacenter_id?: string | null
          id?: string
          limits?: Json | null
          plan_name?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          sender_id: string | null
          sender_role: string | null
          ticket_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          sender_id?: string | null
          sender_role?: string | null
          ticket_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          sender_id?: string | null
          sender_role?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          priority: string | null
          product: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          product?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          product?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_flags: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: boolean | null
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: boolean | null
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: boolean | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          id: string
          message: string
          metadata: Json | null
          service: string
          severity: string
          tenant_id: string | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          message: string
          metadata?: Json | null
          service: string
          severity: string
          tenant_id?: string | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          message?: string
          metadata?: Json | null
          service?: string
          severity?: string
          tenant_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_agents: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          id: string
          instructions: string | null
          metadata: Json | null
          name: string
          personality: string | null
          role: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          metadata?: Json | null
          name: string
          personality?: string | null
          role: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          metadata?: Json | null
          name?: string
          personality?: string | null
          role?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      telephony_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          metadata: Json | null
          provider: string
          provider_reference: string | null
          recording_ref: string | null
          started_at: string | null
          status: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          provider_reference?: string | null
          recording_ref?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          provider_reference?: string | null
          recording_ref?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          role: string
          tenant_id: string | null
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          role?: string
          tenant_id?: string | null
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: string
          tenant_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_legal_agreements: {
        Row: {
          created_at: string
          file_path: string
          id: string
          sha256: string
          signed_at: string
          signer_email: string | null
          signer_ip: string | null
          signer_user_agent: string | null
          tenant_id: string
          user_id: string
          version: string
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          sha256: string
          signed_at?: string
          signer_email?: string | null
          signer_ip?: string | null
          signer_user_agent?: string | null
          tenant_id: string
          user_id: string
          version: string
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          sha256?: string
          signed_at?: string
          signer_email?: string | null
          signer_ip?: string | null
          signer_user_agent?: string | null
          tenant_id?: string
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_legal_agreements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          created_at: string
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          aadhaar_number: string | null
          address: string | null
          ai_settings: Json | null
          business_qr_url: string | null
          business_type: string | null
          created_at: string
          early_access: boolean | null
          id: string
          is_ai_enabled: boolean | null
          is_bookings_enabled: boolean | null
          is_branding_enabled: boolean | null
          is_memory_enabled: boolean | null
          is_messaging_enabled: boolean | null
          is_wallet_enabled: boolean | null
          kyc_document_path: string | null
          kyc_extracted_data: Json | null
          kyc_status: string | null
          kyc_verified_at: string | null
          legal_agreement_path: string | null
          name: string
          owner_user_id: string | null
          pan_number: string | null
          phone: string | null
          platforms: string[] | null
          property_count: number | null
          referral_code: string | null
          subscription_plan: string | null
          subscription_status: string | null
          tax_id: string | null
          timezone: string | null
          updated_at: string | null
          upi_id: string | null
          username: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          address?: string | null
          ai_settings?: Json | null
          business_qr_url?: string | null
          business_type?: string | null
          created_at?: string
          early_access?: boolean | null
          id?: string
          is_ai_enabled?: boolean | null
          is_bookings_enabled?: boolean | null
          is_branding_enabled?: boolean | null
          is_memory_enabled?: boolean | null
          is_messaging_enabled?: boolean | null
          is_wallet_enabled?: boolean | null
          kyc_document_path?: string | null
          kyc_extracted_data?: Json | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          legal_agreement_path?: string | null
          name: string
          owner_user_id?: string | null
          pan_number?: string | null
          phone?: string | null
          platforms?: string[] | null
          property_count?: number | null
          referral_code?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          upi_id?: string | null
          username?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          address?: string | null
          ai_settings?: Json | null
          business_qr_url?: string | null
          business_type?: string | null
          created_at?: string
          early_access?: boolean | null
          id?: string
          is_ai_enabled?: boolean | null
          is_bookings_enabled?: boolean | null
          is_branding_enabled?: boolean | null
          is_memory_enabled?: boolean | null
          is_messaging_enabled?: boolean | null
          is_wallet_enabled?: boolean | null
          kyc_document_path?: string | null
          kyc_extracted_data?: Json | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          legal_agreement_path?: string | null
          name?: string
          owner_user_id?: string | null
          pan_number?: string | null
          phone?: string | null
          platforms?: string[] | null
          property_count?: number | null
          referral_code?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          upi_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          business_type: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          kyc_status: string | null
          metadata: Json | null
          onboarding_status: string | null
          phone: string | null
          role: string
          status: string | null
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_type?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_status?: string | null
          metadata?: Json | null
          onboarding_status?: string | null
          phone?: string | null
          role?: string
          status?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_type?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_status?: string | null
          metadata?: Json | null
          onboarding_status?: string | null
          phone?: string | null
          role?: string
          status?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      voice_agents: {
        Row: {
          config: Json | null
          created_at: string | null
          external_agent_id: string | null
          id: string
          instructions: string | null
          phone_number: string | null
          provider: string
          status: string | null
          tenant_id: string
          updated_at: string | null
          voice_id: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          external_agent_id?: string | null
          id?: string
          instructions?: string | null
          phone_number?: string | null
          provider: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          voice_id?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          external_agent_id?: string | null
          id?: string
          instructions?: string | null
          phone_number?: string | null
          provider?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          tenant_id: string | null
          type: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          tenant_id?: string | null
          type?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          tenant_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          balance?: number
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          balance?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atomic_wallet_transaction_v1: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_tenant_id: string
          p_type: string
        }
        Returns: Json
      }
      complete_guest_kyc_v1: {
        Args: {
          p_consent_form_id?: string
          p_consent_form_version?: string
          p_consent_text: string
          p_guest_email?: string
          p_guest_name: string
          p_guest_phone?: string
          p_pdf_path: string
          p_pdf_sha256: string
          p_pdf_size_bytes?: number
          p_request_id: string
          p_signature_base64?: string
          p_signed_at?: string
          p_signer_ip: string
          p_signer_user_agent: string
          p_tenant_id: string
        }
        Returns: Json
      }
      get_kyc_request_by_token: { Args: { p_token: string }; Returns: Json }
      mask_aadhaar: { Args: { p_aadhaar: string }; Returns: string }
      match_knowledge_chunks: {
        Args: {
          match_count: number
          match_threshold: number
          p_tenant_id: string
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      record_ai_usage_v1: {
        Args: {
          p_action_type: string
          p_amount: number
          p_metadata?: Json
          p_model: string
          p_tenant_id: string
          p_tokens_used: number
        }
        Returns: Json
      }
    }
    Enums: {
      kyc_status_enum: "not_started" | "pending" | "verified" | "rejected"
      product_type_enum: "ai_employee" | "space"
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
    Enums: {
      kyc_status_enum: ["not_started", "pending", "verified", "rejected"],
      product_type_enum: ["ai_employee", "space"],
    },
  },
} as const

