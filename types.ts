export type Theme = 'light' | 'dark' | 'solarized';

export type RoleLevel = '00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09';

export interface UserProfile {
  id: string;
  username: string;
  role_level: RoleLevel;
  face_descriptor?: number[];
}

export interface Store {
  id: string;
  name: string;
  parent_id?: string;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_large: string;
  unit_small: string;
  conversion_rate: number;
  image_url?: string;
  batches?: Batch[]; // Joined view
}

export interface Batch {
  id: string;
  product_id: string;
  store_id: string;
  batch_number: string;
  expiry_date: string;
  quantity_large: number;
  quantity_small: number;
  remark?: string;
}

export interface OperationLog {
  id: string;
  action_type: 'INBOUND' | 'OUTBOUND' | 'ADJUST' | 'DELETE' | 'IMPORT';
  target_id: string;
  change_delta: {
    quantity_large: number;
    quantity_small: number;
  };
  snapshot_data: Batch;
  operator_id: string;
  is_revoked: boolean;
  created_at: string;
  operator_name?: string; // Joined
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_popup: boolean;
  target_roles: RoleLevel[];
  created_at: string;
}
