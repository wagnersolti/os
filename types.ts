
export enum OSStatus {
  OPEN = 'ABERTA',
  IN_PROGRESS = 'EM ANDAMENTO',
  PENDING_PARTS = 'AGUARDANDO PEÇAS',
  COMPLETED = 'CONCLUÍDA',
  CANCELLED = 'CANCELADA'
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  document: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'SERVICE' | 'PRODUCT';
}

export interface OSItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CompanyInfo {
  name: string;
  logo?: string; // base64
  address?: string;
  phone?: string;
  email?: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: number;
  customerId: string;
  customerName: string;
  status: OSStatus;
  items: OSItem[];
  description: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  technicalNotes?: string;
}

export interface DashboardStats {
  totalOS: number;
  pendingOS: number;
  completedOS: number;
  totalRevenue: number;
  monthlyData: { month: string; value: number }[];
}
