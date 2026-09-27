export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'manager' | 'warehouse';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: UserRole;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          sku: string;
          category: string | null;
          image_url: string | null;
          pieces_per_carton: number | null;
          selling_price_per_carton: number;
          cost_per_carton: number;
          low_stock_threshold_cartons: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sku: string;
          category?: string | null;
          image_url?: string | null;
          pieces_per_carton?: number | null;
          selling_price_per_carton: number;
          cost_per_carton: number;
          low_stock_threshold_cartons?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sku?: string;
          category?: string | null;
          image_url?: string | null;
          pieces_per_carton?: number | null;
          selling_price_per_carton?: number;
          cost_per_carton?: number;
          low_stock_threshold_cartons?: number;
          created_by?: string | null;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      inventory_transactions: {
        Row: {
          id: string;
          reference_number: string;
          product_id: string;
          type: 'purchase' | 'sale' | 'adjustment';
          quantity_cartons: number;
          related_sale_id: string | null;
          related_purchase_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reference_number: string;
          product_id: string;
          type: 'purchase' | 'sale' | 'adjustment';
          quantity_cartons: number;
          related_sale_id?: string | null;
          related_purchase_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reference_number?: string;
          product_id?: string;
          type?: 'purchase' | 'sale' | 'adjustment';
          quantity_cartons?: number;
          related_sale_id?: string | null;
          related_purchase_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          reference_number: string;
          customer_id: string;
          total_amount: number;
          amount_paid: number;
          credit_amount: number;
          payment_method: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reference_number: string;
          customer_id: string;
          total_amount: number;
          amount_paid?: number;
          payment_method?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reference_number?: string;
          customer_id?: string;
          total_amount?: number;
          amount_paid?: number;
          payment_method?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity_cartons: number;
          price_per_carton: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          quantity_cartons: number;
          price_per_carton: number;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          quantity_cartons?: number;
          price_per_carton?: number;
        };
      };
      ledger_transactions: {
        Row: {
          id: string;
          customer_id: string;
          reference_number: string;
          type: 'Sale' | 'Payment' | 'Adjustment';
          description: string | null;
          amount: number;
          payment_method: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          reference_number: string;
          type: 'Sale' | 'Payment' | 'Adjustment';
          description?: string | null;
          amount: number;
          payment_method?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          reference_number?: string;
          type?: 'Sale' | 'Payment' | 'Adjustment';
          description?: string | null;
          amount?: number;
          payment_method?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          reference_number: string;
          product_id: string;
          quantity_cartons: number;
          cost_per_carton: number;
          total_cost: number;
          supplier_name: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reference_number: string;
          product_id: string;
          quantity_cartons: number;
          cost_per_carton: number;
          supplier_name?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reference_number?: string;
          product_id?: string;
          quantity_cartons?: number;
          cost_per_carton?: number;
          supplier_name?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      v_product_stock: {
        Row: {
          product_id: string;
          name: string;
          sku: string;
          current_stock_cartons: number;
        };
      };
      v_customer_balances: {
        Row: {
          customer_id: string;
          name: string;
          total_sales: number;
          total_paid: number;
          outstanding_balance: number;
          transaction_count: number;
        };
      };
    };
    Functions: {
      record_sale: {
        Args: {
          p_customer_id: string;
          p_items: Json;
          p_amount_paid?: number;
          p_payment_method?: string;
          p_notes?: string;
        };
        Returns: Json;
      };
      record_purchase: {
        Args: {
          p_product_id: string;
          p_quantity_cartons: number;
          p_cost_per_carton: number;
          p_supplier_name?: string;
        };
        Returns: Json;
      };
      record_customer_payment: {
        Args: {
          p_customer_id: string;
          p_amount: number;
          p_payment_method: string;
          p_notes?: string;
        };
        Returns: Json;
      };
    };
  };
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
