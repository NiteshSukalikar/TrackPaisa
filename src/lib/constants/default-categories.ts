import type { Category } from "@/lib/types/finance";

const createdAt = "2026-07-07T00:00:00.000Z";

export const defaultCategories: Category[] = [
  { id: "income-salary", name: "Salary", type: "income", icon: "briefcase", color: "#16A34A", sortOrder: 1, isDefault: true, createdAt },
  { id: "income-freelance", name: "Freelance", type: "income", icon: "laptop", color: "#2563EB", sortOrder: 2, isDefault: true, createdAt },
  { id: "income-bonus", name: "Bonus", type: "income", icon: "sparkles", color: "#10B981", sortOrder: 3, isDefault: true, createdAt },
  { id: "income-gift", name: "Gift", type: "income", icon: "gift", color: "#8B5CF6", sortOrder: 4, isDefault: true, createdAt },
  { id: "income-refund", name: "Refund", type: "income", icon: "rotate-ccw", color: "#06B6D4", sortOrder: 5, isDefault: true, createdAt },
  { id: "income-side-project", name: "Side Project", type: "income", icon: "rocket", color: "#3B82F6", sortOrder: 6, isDefault: true, createdAt },
  { id: "income-other", name: "Other Income", type: "income", icon: "plus-circle", color: "#64748B", sortOrder: 7, isDefault: true, createdAt },
  { id: "expense-food", name: "Food", type: "expense", icon: "utensils", color: "#F59E0B", sortOrder: 1, isDefault: true, createdAt },
  { id: "expense-rent", name: "Rent", type: "expense", icon: "home", color: "#DC2626", sortOrder: 2, isDefault: true, createdAt },
  { id: "expense-travel", name: "Travel", type: "expense", icon: "train", color: "#3B82F6", sortOrder: 3, isDefault: true, createdAt },
  { id: "expense-shopping", name: "Shopping", type: "expense", icon: "shopping-bag", color: "#8B5CF6", sortOrder: 4, isDefault: true, createdAt },
  { id: "expense-health", name: "Health", type: "expense", icon: "heart-pulse", color: "#F43F5E", sortOrder: 5, isDefault: true, createdAt },
  { id: "expense-family", name: "Family", type: "expense", icon: "users", color: "#14B8A6", sortOrder: 6, isDefault: true, createdAt },
  { id: "expense-education", name: "Education", type: "expense", icon: "graduation-cap", color: "#1D4ED8", sortOrder: 7, isDefault: true, createdAt },
  { id: "expense-entertainment", name: "Entertainment", type: "expense", icon: "ticket", color: "#A855F7", sortOrder: 8, isDefault: true, createdAt },
  { id: "expense-mobile-internet", name: "Mobile / Internet", type: "expense", icon: "wifi", color: "#0891B2", sortOrder: 9, isDefault: true, createdAt },
  { id: "expense-utilities", name: "Utilities", type: "expense", icon: "plug", color: "#0F766E", sortOrder: 10, isDefault: true, createdAt },
  { id: "expense-emi-loan", name: "EMI / Loan", type: "expense", icon: "receipt", color: "#B91C1C", sortOrder: 11, isDefault: true, createdAt },
  { id: "expense-other", name: "Other", type: "expense", icon: "circle-ellipsis", color: "#64748B", sortOrder: 12, isDefault: true, createdAt },
];
