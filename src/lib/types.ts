export interface Contact {
  id: string;
  name: string;
  type: 'Customer' | 'Supplier';
  company: string;
  email: string;
  phone: string;
  transactionCount: number;
}

export interface Task {
  id: string;
  title: string;
  assignee: {
    name: string;
    avatarUrl: string;
  };
  status: 'To Do' | 'In Progress' | 'Done';
  type: 'Delivery' | 'Harvest' | 'Maintenance' | 'Planting';
  dueDate: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: 'Sales' | 'Services' | 'Payroll' | 'Operations' | 'Utilities';
  amount: number;
  type: 'Income' | 'Expense';
}

export interface Investment {
  id: string;
  name: string;
  date: string;
  amount: number;
  currentValue: number;
  status: 'Active' | 'Closed';
}

export type FinancialData = {
  month: string;
  Income: number;
  Expenses: number;
};
