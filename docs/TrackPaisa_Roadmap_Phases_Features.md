# TrackPaisa - Roadmap Phases, Page Status, and Feature Plan

## Roadmap Philosophy

TrackPaisa should be built in small, stable phases. The app should first become excellent at personal daily tracking before adding advanced analytics, AI, or optional cloud-like behavior.

Core principle: build a fast, private, local-first money journal before building a finance platform.

## Overall Product Status

| Area | Status | QA Status | Notes |
|---|---:|---:|---|
| Product strategy | Completed | Completed | Direction is documented in the research and AI context files. |
| Branding | Completed | Completed | Working name, logo concept, and palette are in place; public launch validation is still required. |
| Design system | Completed | Completed | Phase 0 tokens, shell, light/dark mode, layout, and Phase 1 form/list patterns are implemented. |
| Engineering foundation | Completed | Completed | Next.js, TypeScript, Tailwind, IndexedDB schema, and Vitest checks are in place. |
| MVP tracking workflow | Completed | Completed | Phase 1 add, list, search/filter, edit, delete, dashboard summary, and categories management workflows are implemented. |
| Reports and analytics | Completed | Completed | Phase 2 period summaries, category breakdowns, comparisons, and monthly trend views are implemented. |
| Import/export | Completed | Completed | Phase 3 JSON backup, restore preview, duplicate handling, and safety backup are implemented; CSV remains a V2 enhancement. |
| PWA/offline | Completed | Completed | Phase 4 install metadata, offline shell, service worker, and update prompt are implemented. |
| AI layer | Incomplete | Incomplete | Future optional layer only. |
| Cloud sync | Incomplete | Incomplete | Future optional layer only after local app is stable. |

## Page and Screen Status

| Page / Screen | Phase | Build Status | QA Status | Priority |
|---|---:|---:|---:|---:|
| App shell / layout | 0 | Completed | Completed | P0 |
| Overview dashboard | 1 | Completed | Completed | P0 |
| Add transaction | 1 | Completed | Completed | P0 |
| Transactions list | 1 | Completed | Completed | P0 |
| Categories | 1 | Completed | Completed | P0 |
| Reports | 2 | Completed | Completed | P1 |
| Import / Export | 3 | Completed | Completed | P1 |
| Settings | 0-4 | Completed | Completed | P1 | Includes light/dark mode, green-blue/colorful theme selection, and PWA status controls. |
| PWA install/offline page | 4 | Completed | Completed | P2 |
| Advanced tracking | 5 | Incomplete | Incomplete | P2 |
| AI assistant/insights | 6 | Incomplete | Incomplete | P3 |
| Optional cloud sync | 7 | Incomplete | Incomplete | P4 |
| Launch readiness / legal review | 8 | Incomplete | Incomplete | P0 before public launch |

## Phase 0 - Foundation, Branding, and App Shell

### Status

Build Status: Completed

QA Status: Completed

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
- Green-blue and colorful theme palettes
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
- Color theme selection works from Settings.
- Navigation structure is clear.
- Brand colors and logo are visible.
- Empty states are readable and useful.
- No browser-only APIs are called from server-rendered paths.

## Phase 1 - MVP Personal Tracker

### Status

Build Status: Completed

QA Status: Completed

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
- Users can add, edit, and delete unused custom categories.
- Custom categories are available when adding or editing transactions.

## Phase 2 - Reports and Analytics

### Status

Build Status: Completed

QA Status: Completed

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

Build Status: Completed

QA Status: Completed

### Goal

Allow users to manually move data between devices and protect local data from loss.

### Features

- JSON full backup export
- JSON restore/import
- Import preview
- Duplicate detection
- Skip/overwrite duplicate option
- Backup before restore
- Import success/failure summary
- Backup metadata such as export date and app version
- CSV transaction export, V2 enhancement
- CSV transaction import, V2 enhancement
- Data reset option, V2 enhancement

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

Build Status: Completed

QA Status: Completed

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
- New cached app versions can be applied from a visible reload prompt.

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

- [x] Next.js setup - Status: Completed
- [x] TypeScript setup - Status: Completed
- [x] Tailwind setup - Status: Completed
- [x] App shell - Status: Completed
- [x] Light/dark mode - Status: Completed
- [x] Theme switcher - Status: Completed
- [x] IndexedDB wrapper - Status: Completed
- [x] Repository/service layer - Status: Completed
- [x] Default categories seed - Status: Completed
- [x] Add income - Status: Completed
- [x] Add expense - Status: Completed
- [x] Transaction list - Status: Completed
- [x] Search and filters - Status: Completed
- [x] Edit transaction - Status: Completed
- [x] Delete transaction - Status: Completed
- [x] Dashboard summary - Status: Completed
- [x] Category management - Status: Completed
- [x] Category report - Status: Completed
- [x] Monthly report - Status: Completed
- [x] JSON export - Status: Completed
- [x] JSON import - Status: Completed
- [x] Responsive mobile layout - Status: Completed
- [x] Responsive tablet layout - Status: Completed
- [x] Responsive desktop layout - Status: Completed
- [x] Basic QA test pass - Status: Completed

## V2 Feature Checklist

- [ ] CSV export - Status: Incomplete
- [ ] CSV import - Status: Incomplete
- [ ] Import preview - Status: Incomplete
- [ ] Duplicate handling - Status: Incomplete
- [x] PWA install - Status: Completed
- [x] Offline shell - Status: Completed
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

Status: Completed

- [x] Totals match transactions.
- [x] Date validation rejects invalid dates.
- [x] Edit/delete updates saved transaction data.
- [x] Refresh preserves data.
- [x] Import does not corrupt data.

### Gate 2 - Responsive UI

Status: Completed

- [x] Mobile layout works.
- [x] Tablet layout works.
- [x] Desktop layout works.
- [x] Text does not overflow.
- [x] Charts remain readable.

### Gate 3 - Accessibility

Status: Completed

- [x] Keyboard navigation works.
- [x] Color contrast is acceptable.
- [x] Charts include labels/summaries.
- [x] Buttons and inputs have accessible names.
- [x] Income/expense are not identified by color only.

### Gate 4 - Privacy and Local-First Behavior

Status: Completed

- [x] No required login.
- [x] No paid backend database.
- [x] No financial data sent to a server in MVP.
- [x] Import/export is clear.
- [x] AI and sync remain optional future layers.
