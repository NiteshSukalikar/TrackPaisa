# TrackPaisa - Roadmap Phases, Page Status, and Feature Plan

## Roadmap Philosophy

TrackPaisa should be built in small, stable phases. The app should first become excellent at personal daily tracking before adding advanced analytics, AI, or optional cloud-like behavior.

Core principle: build a fast, private, local-first money journal before building a finance platform.

## Overall Product Status

| Area | Status | QA Status | Notes |
|---|---:|---:|---|
| Product strategy | Incomplete | Incomplete | Direction is clear, but execution is not complete. |
| Branding | Incomplete | Incomplete | Name has possible public collision risk; validate before launch. |
| Design system | Incomplete | Incomplete | Starter guide exists; production components still needed. |
| Engineering foundation | Incomplete | Incomplete | Next.js app, data layer, and tests still need implementation. |
| MVP tracking workflow | Incomplete | Incomplete | Manual income/expense tracking is the first priority. |
| Reports and analytics | Incomplete | Incomplete | Needed for product value, but should follow stable data entry. |
| Import/export | Incomplete | Incomplete | Critical for local-first portability. |
| PWA/offline | Incomplete | Incomplete | Needed after core flows are stable. |
| AI layer | Incomplete | Incomplete | Future optional layer only. |
| Cloud sync | Incomplete | Incomplete | Future optional layer only after local app is stable. |

## Page and Screen Status

| Page / Screen | Phase | Build Status | QA Status | Priority |
|---|---:|---:|---:|---:|
| App shell / layout | 0 | Incomplete | Incomplete | P0 |
| Overview dashboard | 1 | Incomplete | Incomplete | P0 |
| Add transaction | 1 | Incomplete | Incomplete | P0 |
| Transactions list | 1 | Incomplete | Incomplete | P0 |
| Categories | 1 | Incomplete | Incomplete | P0 |
| Reports | 2 | Incomplete | Incomplete | P1 |
| Import / Export | 3 | Incomplete | Incomplete | P1 |
| Settings | 0-3 | Incomplete | Incomplete | P1 |
| PWA install/offline page | 4 | Incomplete | Incomplete | P2 |
| Advanced tracking | 5 | Incomplete | Incomplete | P2 |
| AI assistant/insights | 6 | Incomplete | Incomplete | P3 |
| Optional cloud sync | 7 | Incomplete | Incomplete | P4 |
| Launch readiness / legal review | 8 | Incomplete | Incomplete | P0 before public launch |

## Phase 0 - Foundation, Branding, and App Shell

### Status

Build Status: Incomplete

QA Status: Incomplete

### Goal

Prepare project identity, technical foundation, design system, navigation, and local-first architecture.

### Deliverables

- Final app name decision
- Logo concept
- Color palette
- Typography
- Layout system
- Responsive design strategy
- Next.js project setup
- TypeScript setup
- Tailwind CSS setup
- IndexedDB decision
- Data model design
- Testing strategy
- Accessibility baseline

### Features

- App shell
- Light mode
- Dark mode
- Theme switcher
- Mobile bottom navigation
- Desktop sidebar
- Settings shell
- Empty dashboard state
- Brand logo placement
- Responsive layout grid

### Acceptance Criteria

- App opens on mobile, tablet, and desktop.
- Theme toggle works.
- Navigation structure is clear.
- Brand colors and logo are visible.
- Empty states are readable and useful.
- No browser-only APIs are called from server-rendered paths.

## Phase 1 - MVP Personal Tracker

### Status

Build Status: Incomplete

QA Status: Incomplete

### Goal

Allow users to manually track income and expenses quickly and reliably.

### Features

- Add expense
- Add income
- Edit transaction
- Delete transaction
- View transaction list
- Search transactions
- Filter by type
- Filter by category
- Filter by date range
- Default categories
- Custom categories
- Optional wallet/source field
- Basic dashboard
- IndexedDB persistence
- Validation and toast feedback

### Dashboard Widgets

- This month income
- This month expense
- Net savings
- Savings rate
- Recent transactions
- Top spending category
- Empty state when no transactions exist

### Acceptance Criteria

- User can add salary income.
- User can add expense by category.
- Data remains after browser refresh.
- User can edit/delete records.
- Dashboard updates automatically.
- Invalid amount, missing category, and missing date are blocked.
- Delete action asks for confirmation.
- Core flow works comfortably on mobile.

## Phase 2 - Reports and Analytics

### Status

Build Status: Incomplete

QA Status: Incomplete

### Goal

Help users understand spending patterns without overwhelming them.

### Features

- Category-wise report
- Monthly report
- Last month comparison
- Last 3 months report
- Last 6 months report
- Yearly report
- Custom date filter
- Income vs expense chart
- Category breakdown chart
- Monthly trend chart
- Top spending categories
- Report summary in simple language
- Export filtered report view, optional

### Acceptance Criteria

- User can clearly see spending by category.
- User can compare current month with previous month.
- User can switch between supported date periods.
- Reports work on mobile and desktop.
- Charts are readable in light and dark mode.
- Empty report states do not look broken.
- Totals match transaction data exactly.

## Phase 3 - Import, Export, and Backup

### Status

Build Status: Incomplete

QA Status: Incomplete

### Goal

Allow users to manually move data between devices and protect local data from loss.

### Features

- JSON full backup export
- JSON restore/import
- CSV transaction export
- CSV transaction import
- Import preview
- Duplicate detection
- Skip/overwrite duplicate option
- Backup before restore
- Data reset option
- Import success/failure summary
- Backup metadata such as export date and app version

### Acceptance Criteria

- User can export data from one device.
- User can import the same file on another device.
- Import does not silently corrupt data.
- Duplicate data is handled visibly.
- Invalid files show helpful errors.
- User gets a clear import summary.
- Destructive restore creates a backup first.

## Phase 4 - PWA and Offline Experience

### Status

Build Status: Incomplete

QA Status: Incomplete

### Goal

Make TrackPaisa feel like a mobile app while preserving local-first behavior.

### Features

- Web app manifest
- App icons
- Favicon and apple touch icon
- Install prompt support
- Offline page
- Service worker
- Cache app shell
- Responsive PWA layout
- Basic update available flow

### Acceptance Criteria

- App can be installed on supported browsers.
- App loads core shell offline.
- Local IndexedDB data remains available.
- App icon appears correctly when installed.
- Offline state is clear to the user.

## Phase 5 - Advanced Tracking

### Status

Build Status: Incomplete

QA Status: Incomplete

### Goal

Make tracking more powerful without adding clutter.

### Features

- Recurring income templates
- Recurring expense templates
- Tags
- Wallet/source tracking enhancements
- Budget limits per category
- Monthly savings goal
- Transaction clone
- Quick add shortcuts
- Merchant/payee field, optional
- Split transaction, optional future

### Acceptance Criteria

- User can create repeating salary/income templates.
- User can set simple category limits.
- User can filter using tags and wallet/source.
- Advanced fields do not slow down normal quick entry.
- Budget warnings are understandable and not intrusive.

## Phase 6 - AI Assistant Layer

### Status

Build Status: Incomplete

QA Status: Incomplete

### Goal

Add useful AI without compromising the app's privacy-first identity.

### Features

- Rule-based category suggestion from note
- AI monthly summary, optional future
- AI spending insight, optional future
- AI unusual expense detection, optional future
- Natural language questions, optional future
- Example: How much did I spend on food in the last 3 months?
- Example: Where can I reduce spending?
- Privacy notice and explicit opt-in
- User-managed API key, optional

### Recommended AI Approach

Start with rule-based local logic:

- Keyword-based category suggestions
- Local calculations
- Trend detection
- Threshold-based anomaly detection

Then add optional AI later:

- OpenAI API key from user settings, optional
- No financial data sent unless user explicitly enables it
- Clear privacy notice
- Data preview before any external AI request

### Acceptance Criteria

- AI is optional.
- App works fully without AI.
- User understands what data is used.
- User can disable AI features.
- No private financial data is sent externally without explicit consent.

## Phase 7 - Optional Cloud Sync

### Status

Build Status: Incomplete

QA Status: Incomplete

### Goal

Only if needed later, add optional sync without breaking local-first trust.

### Possible Options

- User-managed JSON backup
- Google Drive export/import, future
- Supabase free tier, optional future
- Local network sync, experimental
- Encrypted user-owned backup file, optional future

### Important Rule

Do not add cloud sync until the offline-first app is stable.

### Acceptance Criteria

- Sync is optional.
- Local app still works without sync.
- User understands where data is stored.
- Export/import remains available even if sync exists.
- Privacy and recovery behavior are documented.

## Phase 8 - Launch Readiness, Brand Validation, and Hardening

### Status

Build Status: Incomplete

QA Status: Incomplete

### Goal

Prepare TrackPaisa for public release with legal, quality, accessibility, and deployment readiness.

### Features

- Trademark/name validation
- Domain availability check
- App store name collision check
- Social handle check
- Production privacy statement
- Accessibility pass
- Performance pass
- Browser compatibility pass
- Backup/recovery documentation
- Error monitoring decision
- Release checklist

### Acceptance Criteria

- Brand name is cleared or a safer variant is selected.
- Lighthouse accessibility and performance issues are reviewed.
- Core flows are tested on mobile and desktop browsers.
- Import/export recovery path is documented.
- Public release does not overpromise AI, banking, sync, or automation.

## Recommended Build Order

1. Design system and layout
2. Next.js, TypeScript, Tailwind, and app shell
3. IndexedDB setup
4. Default categories
5. Add transaction
6. Transaction list
7. Edit/delete transaction
8. Dashboard calculations
9. Categories management
10. Reports
11. Import/export
12. PWA
13. Advanced tracking
14. AI features
15. Optional sync
16. Launch hardening

## V1 Feature Checklist

- [ ] Next.js setup - Status: Incomplete
- [ ] TypeScript setup - Status: Incomplete
- [ ] Tailwind setup - Status: Incomplete
- [ ] App shell - Status: Incomplete
- [ ] Light/dark mode - Status: Incomplete
- [ ] Theme switcher - Status: Incomplete
- [ ] IndexedDB wrapper - Status: Incomplete
- [ ] Repository/service layer - Status: Incomplete
- [ ] Default categories seed - Status: Incomplete
- [ ] Add income - Status: Incomplete
- [ ] Add expense - Status: Incomplete
- [ ] Transaction list - Status: Incomplete
- [ ] Search and filters - Status: Incomplete
- [ ] Edit transaction - Status: Incomplete
- [ ] Delete transaction - Status: Incomplete
- [ ] Dashboard summary - Status: Incomplete
- [ ] Category report - Status: Incomplete
- [ ] Monthly report - Status: Incomplete
- [ ] JSON export - Status: Incomplete
- [ ] JSON import - Status: Incomplete
- [ ] Responsive mobile layout - Status: Incomplete
- [ ] Responsive tablet layout - Status: Incomplete
- [ ] Responsive desktop layout - Status: Incomplete
- [ ] Basic QA test pass - Status: Incomplete

## V2 Feature Checklist

- [ ] CSV export - Status: Incomplete
- [ ] CSV import - Status: Incomplete
- [ ] Import preview - Status: Incomplete
- [ ] Duplicate handling - Status: Incomplete
- [ ] PWA install - Status: Incomplete
- [ ] Offline shell - Status: Incomplete
- [ ] Recurring templates - Status: Incomplete
- [ ] Tags - Status: Incomplete
- [ ] Wallet/source tracking enhancements - Status: Incomplete
- [ ] Budget limits - Status: Incomplete

## V3 Feature Checklist

- [ ] AI monthly summary - Status: Incomplete
- [ ] AI category suggestions - Status: Incomplete
- [ ] Ask-your-data assistant - Status: Incomplete
- [ ] Anomaly insights - Status: Incomplete
- [ ] Optional cloud backup - Status: Incomplete
- [ ] Brand/legal launch review - Status: Incomplete

## QA Gates

### Gate 1 - Data Integrity

Status: Incomplete

- [ ] Totals match transactions.
- [ ] Date filters are correct.
- [ ] Edit/delete updates reports.
- [ ] Refresh preserves data.
- [ ] Import does not corrupt data.

### Gate 2 - Responsive UI

Status: Incomplete

- [ ] Mobile layout works.
- [ ] Tablet layout works.
- [ ] Desktop layout works.
- [ ] Text does not overflow.
- [ ] Charts remain readable.

### Gate 3 - Accessibility

Status: Incomplete

- [ ] Keyboard navigation works.
- [ ] Color contrast is acceptable.
- [ ] Charts include labels/summaries.
- [ ] Buttons and inputs have accessible names.
- [ ] Income/expense are not identified by color only.

### Gate 4 - Privacy and Local-First Behavior

Status: Incomplete

- [ ] No required login.
- [ ] No paid backend database.
- [ ] No financial data sent to a server in MVP.
- [ ] Import/export is clear.
- [ ] AI and sync remain optional future layers.

