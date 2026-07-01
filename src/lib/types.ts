
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  address: string;
  email?: string;
  transactionIds?: string[];
  createdAt?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  contactNumber: string;
  address: string;
  email?: string;
  itemIds?: string[];
  createdAt?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: 'Input' | 'Produce' | 'Equipment';
  unitPrice: number;
  stockLevel: number;
  reorderLevel: number;
  supplierId: string;
  createdAt?: string;
}

export interface Income {
  id: string;
  date: string; // Should be ISO date string
  description: string;
  amount: number;
  customerName: string;
  cropCycleId?: string;
  createdAt?: string;
}

export interface Expense {
  id: string;
  date: string; // Should be ISO date string
  description: string;
  amount: number;
  supplierName: string;
  cropCycleId?: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  description: string;
  dueDate: string; // Should be ISO date string
  status: 'To Do' | 'In Progress' | 'Completed';
  workerIds: string[];
  title: string;
  createdAt?: string;
}

export interface Worker {
  id: string;
  firstName: string;
  lastName:string;
  email?: string;
  avatarUrl?: string;
  role: 'Admin' | 'Manager' | 'Worker';
  contactNumber: string;
  taskIds?: string[];
  createdAt?: string;
}

export interface Investment {
  id: string;
  investorName: string;
  date: string; // Should be ISO date string
  description: string;
  amount: number;
  equityDetails: string;
  createdAt?: string;
}

export interface Plot {
  id: string;
  name: string;
  area: number;
  location?: string;
  soilType?: string;
  createdAt?: string;
}

export interface CropCycle {
  id: string;
  plotId: string;
  cropType: string;
  startDate: string;
  estimatedEndDate?: string;
  status: 'Planned' | 'Ongoing' | 'Harvested' | 'Cancelled';
  createdAt?: string;
}

export interface Harvest {
  id: string;
  cycleId: string;
  date: string;
  quantity: number;
  unit: string;
  salesValue: number;
  createdAt?: string;
}

export type FinancialData = {
  month: string;
  Income: number;
  Expenses: number;
};
