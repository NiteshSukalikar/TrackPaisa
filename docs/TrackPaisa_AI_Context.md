# TrackPaisa - AI Context and Prompting Structure

Use this file as the primary handoff context for AI coding assistants such as ChatGPT, Claude, Cursor, Codex, GitHub Copilot, or any future product/design/QA agent working on TrackPaisa.

## 1. Prompt Contract

### Product Name

TrackPaisa

### Product Type

Privacy-first, offline-first, local-first personal expense and income tracker.

### Primary Promise

Track every rupee, without the clutter.

### Build Status

In Progress

### Review Status

Phase 0 completed; Phase 1 tracking entry and transaction management workflows completed

## 2. Special Prompting Structure

When asking an AI assistant to work on TrackPaisa, use this structure:

```md
## Role
You are a senior software engineer, software architect, UI/UX designer, QA tester, and AI engineer working on TrackPaisa.

## Objective
Describe the exact task to complete.

## Context
TrackPaisa is a privacy-first, offline-first, local-first income and expense tracker. It uses Next.js, TypeScript, Tailwind CSS, IndexedDB, and responsive PWA-ready design.

## Instructions
List clear implementation instructions, constraints, and expected behavior.

## Notes
List product rules, edge cases, design rules, privacy rules, and testing expectations.

## Output Expected
Describe whether the assistant should update code, update docs, create tests, review files, or summarize findings.
```

## 3. AI Roles

### Role: Product Architect

Objective: Protect product focus and prevent TrackPaisa from becoming a finance super-app too early.

Responsibilities:

- Keep V1 focused on manual tracking, categories, reports, and import/export.
- Reject bank sync, card automation, bill payment, hosted accounts, and paid database dependencies in V1.
- Sequence advanced features into later phases.
- Validate that every feature supports local-first personal finance tracking.

### Role: Senior Software Engineer

Objective: Implement clean, typed, maintainable application code.

Responsibilities:

- Use TypeScript types for core data models.
- Keep business data in IndexedDB, not localStorage.
- Keep localStorage limited to small UI preferences.
- Prefer simple repository/service patterns for data access.
- Avoid backend dependencies unless explicitly approved.
- Keep code readable for future maintainers.

### Role: Software Architect

Objective: Keep the system modular, testable, and offline-first.

Responsibilities:

- Separate data repositories, feature logic, UI components, and utilities.
- Keep reporting calculations derived from local records.
- Avoid server-rendered access to browser-only APIs such as IndexedDB.
- Make import/export safe, validated, and reversible.
- Prepare PWA support without requiring cloud services.

### Role: UI/UX Designer

Objective: Make TrackPaisa feel fast, premium, calm, and simple across mobile, tablet, and desktop.

Responsibilities:

- Design mobile-first flows with large touch targets.
- Keep navigation simple and predictable.
- Avoid overloaded dashboards and tiny charts.
- Use empty states, confirmation states, toast feedback, and accessible color contrast.
- Use green, white, and blue as the default palette with colorful accents mainly for reports.

### Role: QA Tester

Objective: Verify that every feature works reliably with real user behavior and edge cases.

Responsibilities:

- Test add, edit, delete, filter, search, import, export, and report calculations.
- Test mobile, tablet, and desktop layouts.
- Test light mode, dark mode, and theme switching.
- Test invalid imports, duplicate records, empty states, large lists, and browser refresh persistence.
- Treat data loss and incorrect totals as high-severity defects.

### Role: AI Engineer

Objective: Add AI only when it helps users understand their own data and only when privacy is clear.

Responsibilities:

- Start with deterministic local rules before external AI.
- Keep AI optional.
- Do not send financial data to an API unless the user explicitly enables it.
- Explain what data is used for any AI feature.
- Prefer AI summaries, category suggestions, anomaly detection, and ask-your-data workflows after the core app is stable.

## 4. Product Context

### Main Goal

Build a responsive Next.js web application where users can manually track income, expenses, categories, wallets/sources, and reports without using bank sync, card connections, bill payment features, mandatory login, or paid backend databases.

### Target Users

- Salaried professionals tracking monthly salary and spending.
- Freelancers with multiple income sources.
- Students and young professionals building money discipline.
- Users who do not want to connect bank accounts or cards.
- Users who prefer manual control, privacy, and local data ownership.

### Product Positioning

TrackPaisa should be a personal money journal and local-first finance dashboard, not a large banking platform.

### Brand Risk Note

The deep research report identified possible public name collision for TrackPaisa. Use TrackPaisa as the working name, but before public launch complete trademark, domain, app-store, and social-handle checks. If needed, consider TrackPaisa Personal, TrackPaisa Solo, or TrackPaisa Ledger.

## 5. Non-Negotiable Product Rules

1. Do not build card-based finance workflows in V1.
2. Do not build bill-payment workflows in V1.
3. Do not require login in V1.
4. Do not use paid databases in V1.
5. Use IndexedDB as the main local database.
6. Use localStorage only for small UI settings.
7. The app must work on mobile, tablet, and desktop.
8. The app must support import/export so users can manually move data across devices.
9. The UI should feel premium, simple, calm, and modern.
10. The first version must stay focused and not become a finance super-app.
11. Data loss, silent import corruption, and incorrect totals are unacceptable.
12. AI and cloud sync must be optional future layers, not MVP dependencies.

## 6. Recommended Tech Stack

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Storage: IndexedDB using Dexie or idb
- UI Settings: localStorage only for small preferences
- Charts: Recharts or Chart.js
- Deployment: Vercel
- App Model: PWA-ready responsive web app
- Testing: Unit tests for calculations and repositories, component tests for forms, end-to-end tests for critical flows

## 7. Information Architecture

### Mobile Bottom Navigation

1. Overview
2. Add
3. Transactions
4. Reports
5. Settings

### Desktop Sidebar Navigation

1. Overview
2. Transactions
3. Categories
4. Reports
5. Import / Export
6. Settings

### Key Screens and Status

| Screen | Purpose | Build Status | QA Status |
|---|---|---:|---:|
| Overview | Monthly summary and recent activity | Incomplete | Incomplete |
| Add Transaction | Fast income/expense entry | Completed | Completed |
| Transactions | Search, filter, edit, delete records | Completed | Completed |
| Categories | Manage income and expense categories | Incomplete | Incomplete |
| Reports | Category, period, and trend analytics | Incomplete | Incomplete |
| Import / Export | Backup, restore, CSV, and JSON movement | Incomplete | Incomplete |
| Settings | Theme, currency, privacy, reset, AI options later | Incomplete | Incomplete |

## 8. Core Data Models

### Transaction

```ts
export type TransactionType = 'income' | 'expense';

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
```

### Category

```ts
export interface Category {
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

### Wallet / Source

```ts
export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi' | 'other';
  openingBalance?: number;
  createdAt: string;
}
```

### App Settings

```ts
export interface AppSettings {
  currency: 'INR';
  theme: 'light' | 'dark' | 'system';
  colorTheme: 'green-blue' | 'colorful';
  firstDayOfMonth?: number;
}
```

## 9. IndexedDB Stores

Use these stores:

- transactions
- categories
- wallets
- settings
- backups

Recommended indexes:

- transactions by date
- transactions by type
- transactions by categoryId
- transactions by walletId
- transactions by createdAt
- categories by type
- wallets by type

## 10. MVP Feature Instructions

### Dashboard

Show:

- Monthly income
- Monthly expense
- Net savings
- Savings rate
- Top category
- Recent transactions
- Category chart
- Monthly trend

### Add Transaction

Flow:

1. Select type: Income or Expense.
2. Enter amount.
3. Select category.
4. Select date.
5. Select wallet/source, optional.
6. Add note, optional.
7. Save.

Validation:

- Amount is required and must be greater than 0.
- Category is required.
- Date is required.
- Type is required.
- Invalid dates and non-numeric amounts must be rejected.

### Transactions List

Features:

- Search by note/category.
- Filter by type.
- Filter by category.
- Filter by date range.
- Edit transaction.
- Delete transaction.
- Sort newest first.

### Categories

Features:

- Add category.
- Edit category.
- Delete category only if unused or after clear confirmation.
- Category color.
- Category icon.
- Income and expense category separation.

### Reports

Required periods:

- This month
- Last month
- Last 3 months
- Last 6 months
- This year
- Custom range

Charts:

- Income vs expense
- Category breakdown
- Monthly trend
- Top categories

### Import / Export

Export:

- JSON full backup
- CSV transaction export

Import:

- JSON restore
- CSV transaction import

Rules:

- Validate file format.
- Preview before import.
- Detect duplicates.
- Show success/failure summary.
- Create a backup before destructive restore.

## 11. UX and Design Instructions

- Add transaction should be very fast.
- Use large touch targets on mobile.
- Do not overload the dashboard.
- Use empty states with helpful guidance.
- Use confirmation before deleting data.
- Use clear success/error toast messages.
- Reports should explain data in simple words.
- Use INR formatting by default.
- Keep text readable in light and dark mode.
- Do not use color alone to communicate income, expense, warning, or success.
- Do not use visible tutorial text where standard UI controls are enough.

## 12. Currency Format

Use Indian Rupee formatting:

```ts
new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(amount)
```

## 13. Product Copy Tone

Use simple, human language.

Preferred examples:

- Your month at a glance
- Where your money went
- Add income
- Add expense
- Back up your data
- Restore from backup
- No account needed. Your data stays on your device.
- Export anytime. Restore when needed.

Avoid:

- Bank-grade intelligence
- Financial freedom engine
- AI-powered wealth optimizer
- Complex accounting terminology for normal users

## 14. AI Assistant Implementation Instructions

When generating code for TrackPaisa:

- Keep code clean and beginner-readable.
- Use TypeScript types.
- Avoid overengineering.
- Prefer a simple repository/service pattern for IndexedDB.
- Keep UI components reusable.
- Keep mobile-first responsive design.
- Do not introduce a backend unless explicitly requested.
- Do not introduce authentication unless explicitly requested.
- Do not store sensitive financial data on a server.
- Include error handling for import/export.
- Keep naming consistent.
- Add tests for calculations, validation, import/export, and data persistence.
- Run formatting, linting, and tests when available.

## 15. AI Feature Rules

Do not build these in MVP unless explicitly requested:

- AI categorization
- AI monthly summary
- Budget planning
- Recurring transactions
- Goal tracking
- Cloud sync
- Multi-user sharing
- Receipt OCR
- Native mobile app

Future AI should follow this order:

1. Keyword-based local category suggestions.
2. Rule-based trend and anomaly detection.
3. Optional AI monthly summaries.
4. Optional ask-your-data assistant.
5. Optional external AI provider only with explicit user opt-in.

## 16. QA Notes

High-risk areas:

- Incorrect monthly totals.
- Incorrect date range filtering.
- Lost IndexedDB data after refresh.
- Import overwriting good data.
- Duplicate transaction handling.
- Broken mobile layout.
- Dark mode contrast issues.
- Chart labels becoming unreadable.

Required test scenarios:

- Fresh app with no data.
- Add first income and first expense.
- Edit and delete records.
- Add many transactions.
- Filter by month, category, type, wallet, and search text.
- Export JSON and restore it.
- Import invalid JSON and invalid CSV.
- Detect duplicate records.
- Refresh browser and confirm persistence.
- Use app on mobile, tablet, and desktop widths.

## 17. Output Expectations For AI Work

For implementation tasks, the assistant should:

1. Inspect existing files first.
2. Make scoped changes.
3. Preserve local-first constraints.
4. Add or update tests where useful.
5. Run available checks.
6. Summarize changed files, verification, and remaining risks.

For review tasks, the assistant should:

1. Lead with findings.
2. Include severity and file/line references when reviewing code.
3. Identify missing tests and product risks.
4. Avoid rewriting unrelated files.
