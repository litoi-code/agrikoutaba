export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  address: string;
  transactionIds?: string[];
}

export interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  contactNumber: string;
  email: string;
  address: string;
  itemIds?: string[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  stockLevel: number;
  reorderLevel: number;
  supplierId: string;
}

export interface Income {
  id: string;
  date: string; // Should be ISO date string
  description: string;
  amount: number;
  customerId: string;
}

export interface Expense {
  id: string;
  date: string; // Should be ISO date string
  description: string;
  amount: number;
  supplierId: string;
}

export interface Task {
  id: string;
  description: string;
  dueDate: string; // Should be ISO date string
  status: 'To Do' | 'In Progress' | 'Completed';
  workerId: string;
  title: string;
}

export interface Worker {
  id: string;
  firstName: string;
  lastName:string;
  avatarUrl: string;
  role: string;
  contactNumber: string;
  taskIds?: string[];
  name: string;
}

export interface Investment {
  id: string;
  date: string; // Should be ISO date string
  description: string;
  amount: number;
  equityDetails: string;
  name: string;
  currentValue: number;
  status: 'Active' | 'Closed';
}


export type FinancialData = {
  month: string;
  Income: number;
  Expenses: number;
};
