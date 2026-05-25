export interface User {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  nama_property: string;
  group?: string | null;
  lebar: number; // Decimal represented as number in JS
  panjang: number; // Decimal represented as number in JS
  hadap: string[]; // multi: Banyak (Utara, Selatan, Timur, Barat)
  tipe: 'Ruko' | 'Villa';
  tingkat: number; // Decimal represented as number 1-10
  price: number; // integer rupiah
  carport: boolean;
  status: 'in_stock' | 'sold_out';
  siap: 'siap_huni' | 'siap_kosong' | 'siap_huni_renovasi';
  maps_link?: string | null;
  kawasan: string[]; // multi-tag: Krakatau, Pancing, Cemara Asri/Kuala, Tembung, Helvetia
  unit?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  propertyId: string;
  propertyName: string;
  oldData?: any;
  newData?: any;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  nama: string;
  email: string;
  nomorHp: string;
  pesan: string;
  ipAddress: string;
  createdAt: string;
}
