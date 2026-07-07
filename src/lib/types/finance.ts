export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId?: string;
  date: string;
  note?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTemplate {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId?: string;
  note?: string;
  tags?: string[];
  frequency: "weekly" | "monthly";
  nextDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLimit {
  id: string;
  categoryId: string;
  amount: number;
  monthKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: "cash" | "bank" | "upi" | "other";
  openingBalance?: number;
  createdAt: string;
}

export interface AppSettings {
  currency: "INR";
  theme: "light" | "dark" | "system";
  colorTheme: "green-blue" | "colorful";
  firstDayOfMonth?: number;
}
