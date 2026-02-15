# AI App Context

## 1. System Overview
- **Name**: Vasantham Electricals Tracker (Sales Follow-up Tracker)
- **Type**: Single Page Application (SPA)
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI (Radix Primitives) + Lucide Icons
- **State Management**: TanStack Query (Server State) + React Context (Global UI State)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk (Frontend Authentication) + Supabase RLS (Backend Authorization)
- **Deployment**: Vercel (Frontend) + Supabase (Backend/Edge Functions)

## 2. Architecture

### Folder Structure
- **src/components**: Reusable UI components.
  - `ui/`: Shadcn/UI primitives (buttons, inputs, dialogs).
  - `inventory/`: Product-related components (ProductCard, ProductForm).
  - `invoices/`: Invoice-related components (InvoiceModal, InvoiceItemsTable).
- **src/pages**: Route-level components.
  - `InventoryPage`, `InvoicesPage`, `FilesPage`, `SettingsPage`, `AnalyticsPage`.
- **src/services**: API Abstraction Layer.
  - Interacts with Supabase directly or via Edge Functions.
  - Examples: `productService.ts`, `invoiceService.ts`.
- **src/hooks**: Custom React Hooks.
  - `useUserRole`: Abstraction for role-based access control.
  - `useInventoryQueries`: TanStack query wrappers.
- **src/types**: TypeScript interfaces (Global models).
- **src/lib**: Configuration and 3rd party client initialization (`supabase.ts`, `utils.ts`).
- **supabase/**: Backend configuration.
  - `migrations/`: Database schema history.
  - `functions/`: Edge functions (e.g., `drive-proxy`).

## 3. Runtime Flow

### App Startup
1. `main.tsx`: Initializes `ClerkProvider` (Auth), `QueryClientProvider` (Cache), and imports global CSS.
2. `App.tsx`: Defines Routes.
   - Public: `/sign-in`
   - Protected: `/*` wrapped in `ProtectedRoute`.
3. `ProtectedRoute.tsx`: Checks Clerk `isLoaded` and `userId`. Redirects to `/sign-in` if unauthorized.
4. `Layout.tsx`: Renders Sidebar/Header and the page content.

### Request Flow
1. **User Action**: User clicks "Save Product".
2. **Component**: `ProductForm` calls `productService.createProduct()`.
3. **Service**: `productService` calls `getClient(clerkToken)` to get an authenticated Supabase client.
4. **Supabase Client**:
   - Injects Clerk Token into `Authorization` header.
   - Sends Request to Supabase API (PostgREST).
5. **Database**: RLS Policies verify the Clerk Token JWT to allow/deny access.

## 4. API Map

### Product Service (`productService.ts`)
- `GET /products`: Fetches inventory.
- `POST /products`: Creates new product (MRP, Purchase/Sales Discounts).
- `PUT /products/:id`: Updates product.

### Invoice Service (`invoiceService.ts`)
- `GET /invoices`: Fetches invoices.
- `POST /invoices`: Creates invoice + invoice items (transactional).
- `GET /invoices/next-number`: Generates next invoice ID (e.g., INV-001).

### Google Drive Service (`driveService.ts`)
- **Proxy Pattern**: Does NOT call Google API directly from client.
- Calls Supabase Edge Function `drive-proxy`.
- Operations: `list`, `upload`, `delete`, `quota`.

## 5. Database Layer

### Core Tables
- **products**: Inventory items.
  - *Note*: `purchase_rate` column was removed. Logic now uses `mrp`, `purchase_discount_percent` -> `purchase_discounted_price`.
- **invoices**: Invoice headers (`invoice_number`, `total_amount`).
- **invoice_items**: Line items linked to invoices.
- **brands / categories**: metadata for products.
- **discount_types**: Configurable sales discount types (e.g., "Cash Discount", "Trade Discount").

### Schema Notes
- **RLS**: Enabled on all tables.
- **Policy**:
  - `admin` role has full access.
  - `user` role has restrictive access (e.g., cannot see `purchase_rate` of admin-created items).

## 6. Authentication & Authorization

### Auth Provider
- **Clerk**: Handles Login/Signup, Session Management, and User Profile.

### Authorization Strategy
- **Frontend**: `useUserRole()` hook returns `admin` or `user` based on Clerk metadata.
- **Backend (RLS)**:
  - Supabase checks JWT from Clerk.
  - Policies enforce: "Users can only update their own records" or "Admins can do everything".
  - *Special Case*: `products` table has RLS/UI logic to hide purchase info from non-creators/non-admins.

## 7. State Management

- **Server State**: TanStack Query (`@tanstack/react-query`).
  - Caches API responses.
  - Handles loading/error states.
  - Keys: `['products']`, `['invoices']`, etc.
- **Global UI State**: React Context.
  - `ExportProvider`: Manages export functionality across pages.

## 8. Environment & Config

### Required Variables
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk Public Key.
- `VITE_SUPABASE_URL`: Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key.
- `VITE_API_BASE_URL`: API Base (usually same as Supabase URL).

### Supabase Secrets (Edge Functions)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`: For Drive API.
- `DRIVE_TARGET_FOLDER_ID`: Root folder for uploads.

## 9. Integrations

### Google Drive
- **Purpose**: File storage for users.
- **Mechanism**: Edge Function proxy using OAuth2 Refresh Token flow.
- **FilesPage**: UI for listing/uploading/deleting files.

## 10. Conventions

- **Naming**: CamelCase for TS variables, snake_case for DB columns.
- **Components**: Functional Components with Hooks.
- **Styling**: Utility-first (Tailwind) with arbitrary values for specific "brand" colors.
- **Strict Mode**: Enabled.

## 11. Extension Guide

### How to add a new Feature (e.g., "Expenses")
1. **DB**: Create migration `create_expenses_table.sql`. Enable RLS.
2. **Types**: Add `Expense` type in `src/types/expenses.ts`.
3. **Service**: Create `src/services/expenseService.ts` with CRUD methods.
4. **UI**: Create `src/pages/ExpensesPage.tsx` and components.
5. **Route**: Add `<Route path="/expenses" ... />` in `App.tsx`.
6. **Nav**: Add link in `Layout.tsx` sidebar.

## 12. Known Risks & Tech Debt

- **Purchase Rate Logic**: The `purchase_rate` column was removed from the DB, but legacy code/types might still reference it. `ProductForm` and `productService` have been patched, but watch out for "undefined" errors in legacy views.
- **Google Token Expiry**: If the project is in "Testing" mode in Google Cloud, refresh tokens expire every 7 days. Requires manual update unless app is published.
- **Type Safety**: `any` usage in `driveService.ts` error handling could be improved.
