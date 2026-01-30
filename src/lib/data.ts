import type { Contact, Task, Transaction, Investment, FinancialData } from './types';

export const contacts: Contact[] = [
  { id: 'C001', name: 'John Doe', type: 'Customer', company: 'Green Valley Grocers', email: 'john.d@gvg.com', phone: '555-0101', transactionCount: 12 },
  { id: 'S001', name: 'Jane Smith', type: 'Supplier', company: 'FarmSupply Co.', email: 'jane.s@farmsupply.com', phone: '555-0102', transactionCount: 45 },
  { id: 'C002', name: 'Alice Williams', type: 'Customer', company: 'Organic Eats', email: 'alice.w@organiceats.com', phone: '555-0103', transactionCount: 8 },
  { id: 'S002', name: 'Bob Brown', type: 'Supplier', company: 'Heavy Machines Inc.', email: 'bob.b@heavymachines.com', phone: '555-0104', transactionCount: 5 },
  { id: 'C003', name: 'Charlie Green', type: 'Customer', company: 'The Corner Market', email: 'charlie.g@cornermarket.com', phone: '555-0105', transactionCount: 21 },
];

export const tasks: Task[] = [
  { id: 'T001', title: 'Deliver tomatoes to Green Valley', assignee: { name: 'Mike', avatarUrl: 'https://picsum.photos/seed/avatar1/100/100' }, status: 'Done', type: 'Delivery', dueDate: '2024-07-20' },
  { id: 'T002', title: 'Harvest corn fields A & B', assignee: { name: 'Sarah', avatarUrl: 'https://picsum.photos/seed/avatar2/100/100' }, status: 'In Progress', type: 'Harvest', dueDate: '2024-07-25' },
  { id: 'T003', title: 'Perform maintenance on Tractor X', assignee: { name: 'Tom', avatarUrl: 'https://picsum.photos/seed/avatar3/100/100' }, status: 'To Do', type: 'Maintenance', dueDate: '2024-07-28' },
  { id: 'T004', title: 'Plant new batch of lettuce', assignee: { name: 'Sarah', avatarUrl: 'https://picsum.photos/seed/avatar2/100/100' }, status: 'To Do', type: 'Planting', dueDate: '2024-08-01' },
];

export const transactions: Transaction[] = [
  { id: 'TR001', date: '2024-07-15', description: 'Sale of 100kg tomatoes', category: 'Sales', amount: 500, type: 'Income' },
  { id: 'TR002', date: '2024-07-15', description: 'Monthly Payroll', category: 'Payroll', amount: 3500, type: 'Expense' },
  { id: 'TR003', date: '2024-07-16', description: 'Tractor fuel', category: 'Operations', amount: 200, type: 'Expense' },
  { id: 'TR004', date: '2024-07-18', description: 'Consulting service for crop rotation', category: 'Services', amount: 300, type: 'Income' },
  { id: 'TR005', date: '2024-07-20', description: 'Electricity Bill', category: 'Utilities', amount: 150, type: 'Expense' },
  { id: 'TR006', date: '2024-06-15', description: 'Sale of lettuce', category: 'Sales', amount: 800, type: 'Income' },
  { id: 'TR007', date: '2024-06-15', description: 'Monthly Payroll', category: 'Payroll', amount: 3500, type: 'Expense' },
];

export const investments: Investment[] = [
  { id: 'INV001', name: 'New Greenhouse Construction', date: '2023-01-10', amount: 15000, currentValue: 18000, status: 'Active' },
  { id: 'INV002', name: 'Solar Panel Installation', date: '2022-05-20', amount: 25000, currentValue: 32000, status: 'Active' },
  { id: 'INV003', name: 'Farmland Expansion Plot B', date: '2021-03-15', amount: 50000, currentValue: 75000, status: 'Closed' },
];


export const financialChartData: FinancialData[] = [
  { month: 'Jan', Income: 4000, Expenses: 2400 },
  { month: 'Feb', Income: 3000, Expenses: 1398 },
  { month: 'Mar', Income: 5000, Expenses: 4800 },
  { month: 'Apr', Income: 4780, Expenses: 3908 },
  { month: 'May', Income: 6890, Expenses: 4800 },
  { month: 'Jun', Income: 5390, Expenses: 3800 },
  { month: 'Jul', Income: 6490, Expenses: 4300 },
];
