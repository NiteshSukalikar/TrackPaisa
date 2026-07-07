# TrackPaisa — Project Data

## 1. Product Vision

**TrackPaisa** is a privacy-first, offline-first personal expense and income tracker for web, mobile, and tablet users.

The main idea is simple: help users manually track salary, extra income, daily expenses, category-wise spending, and monthly/yearly money trends without connecting bank cards, bills, or paid databases.

### Core Promise

> Track every rupee, without the clutter.

### Target Users

- Salaried professionals who want to track monthly salary and spending.
- Freelancers with multiple small income sources.
- Students or young professionals who want simple money discipline.
- Users who do not want to connect bank accounts or share financial data online.
- Users who prefer manual control and offline-first privacy.

## 2. Product Positioning

TrackPaisa should not try to become a large finance super-app in version 1. The first version should focus on being fast, clean, mobile-friendly, and private.

### What TrackPaisa Should Be

- A personal money journal.
- An income and expense tracker.
- A category-wise monthly spending analyzer.
- A local-first finance dashboard.
- A simple PWA that works on mobile, tablet, and desktop.

### What TrackPaisa Should Not Be in V1

- No credit card automation.
- No bank sync.
- No bill-payment engine.
- No financial advice engine.
- No online account system.
- No paid database.

## 3. Main Modules

### 3.1 Dashboard / Overview

The dashboard should answer the most important money questions immediately:

- How much income did I receive this month?
- How much did I spend this month?
- How much is remaining?
- Which category has the highest spending?
- How does this month compare with last month?
- What are my recent transactions?

Recommended dashboard sections:

- Monthly income
- Monthly expense
- Net balance
- Savings percentage
- Category-wise spending summary
- Recent transactions
- Monthly trend chart
- Quick add button

### 3.2 Transactions

Transactions are the core data unit.

A transaction can be either:

- Income
- Expense
- Transfer, optional future feature

Recommended fields:

```ts
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  walletId?: string;
  date: string;
  note?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 3.3 Categories

Categories should be fully customizable.

Default expense categories:

- Food
- Rent
- Travel
- Shopping
- Health
- Family
- Education
- Entertainment
- Mobile / Internet
- Utilities
- EMI / Loan
- Other

Default income categories:

- Salary
- Freelance
- Bonus
- Gift
- Refund
- Side Project
- Other Income

Recommended category fields:

```ts
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
}
```

### 3.4 Wallets / Sources

Since the user does not want card or bill-based design, use the neutral word **Source** or **Wallet**.

Possible wallet/source examples:

- Cash
- Bank
- UPI
- Salary Account
- Savings
- Other

This should be optional in V1. The app should work even if the user only tracks categories.

### 3.5 Reports

Reports should be simple but useful.

Required reports:

- This month
- Last month
- Last 3 months
- Last 6 months
- This year
- Custom date range
- Category-wise spending
- Income vs expense
- Monthly trend
- Top spending categories

Recommended charts:

- Bar chart for month-wise expense
- Donut chart for category distribution
- Line chart for income vs expense trend
- Simple list/table for transaction history

### 3.6 Import / Export

Because the app is local-first and does not use a cloud database, import/export is very important.

Required export formats:

- JSON backup: full app data backup
- CSV export: transactions only, spreadsheet-friendly

Required import formats:

- JSON restore: full app restore
- CSV import: transaction import from spreadsheet

Import rules:

- Validate required fields.
- Show preview before import.
- Detect duplicate transaction IDs.
- Allow user to skip duplicates or overwrite.
- Keep backup before large import.

## 4. Technical Architecture

### Recommended Stack

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: Custom components or shadcn/ui style system
- Charts: Recharts or Chart.js
- Storage: IndexedDB
- Local preferences: localStorage only for theme and UI settings
- Deployment: Vercel
- App model: PWA-ready responsive web application

## 5. Data Storage Decision

### Use IndexedDB for Main Data

IndexedDB is the best choice because TrackPaisa stores structured data and needs filtering, searching, date range analytics, and import/export.

Use IndexedDB for:

- Transactions
- Categories
- Wallets / Sources
- Tags
- App backups
- Report cache, optional

### Use localStorage Only for Small Preferences

Use localStorage only for:

- Theme mode: light/dark
- Color theme: green-blue or colorful
- Last selected period
- Sidebar collapsed state

Do not use localStorage for transaction data because it is synchronous, string-only, and not ideal for larger structured data.

## 6. Recommended IndexedDB Stores

```ts
const DB_NAME = 'trackpaisa-db';
const DB_VERSION = 1;

stores = {
  transactions: 'id, type, categoryId, walletId, date, createdAt',
  categories: 'id, type, name, sortOrder',
  wallets: 'id, name, type, createdAt',
  settings: 'key',
  backups: 'id, createdAt'
};
```

## 7. Suggested Folder Structure

```txt
src/
  app/
    page.tsx
    transactions/
    reports/
    categories/
    settings/
  components/
    layout/
    forms/
    charts/
    common/
  features/
    transactions/
    categories/
    reports/
    import-export/
  lib/
    db/
      indexeddb.ts
      repositories/
    utils/
    constants/
  styles/
  types/
```

## 8. Key Screens

### Mobile Screens

- Overview
- Add Transaction
- Transactions List
- Reports
- Categories
- Settings

### Tablet / Desktop Screens

- Sidebar navigation
- Wider dashboard grid
- Reports with filters on the side
- Transaction table with search and filters
- Import/export management screen

## 9. MVP Success Criteria

The MVP is successful if the user can:

1. Add salary income.
2. Add daily expenses.
3. Create and edit categories.
4. View current month summary.
5. View category-wise spending.
6. View last month and last 3 months comparison.
7. Export all data as JSON.
8. Import backup on another device.
9. Use the app comfortably on mobile and desktop.

## 10. Future AI Opportunities

AI should come after the core manual system is stable.

Future AI ideas:

- Auto-suggest category from note text.
- Monthly spending summary in plain English.
- Detect unusual spending.
- Suggest budget limits based on history.
- Ask questions like: “How much did I spend on food last 3 months?”
- Generate monthly financial reflection.
- Local-first AI if browser-based AI becomes stable.

## 11. Recommended First Build Scope

Build only these first:

- Dashboard
- Add income
- Add expense
- Category management
- Transaction list
- Basic reports
- IndexedDB storage
- JSON export/import
- Responsive design
- Light/dark mode
- Theme switcher

This scope is enough to create a solid personal-use app without overengineering.
