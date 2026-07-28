# Supabase Migration Guide

This guide walks you through connecting the AgriKoutaba app to Supabase.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in.
2. Click **New Project**.
3. Choose a name (e.g., `agrikoutaba`), select a region, and set a database password.
4. Wait for the project to be provisioned (1-2 minutes).

## Step 2: Get Your Supabase Credentials

1. In the Supabase dashboard, go to **Settings** → **API**.
2. Copy the **Project URL** and **anon (public) key**.

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root (next to `package.json`):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key...
```

> **Note:** Files that use `import.meta.env` need the `VITE_` prefix for Vite/webpack to include them in the client bundle.

## Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js
```

Firebase has been removed from the dependencies — no need to uninstall it (it won't be in package.json anymore).

## Step 5: Set Up Database Tables

### Option A: Use the Supabase SQL Editor (Easiest)

Go to **SQL Editor** in the Supabase dashboard and run the following SQL to create all required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workers (also serves as the auth user profile)
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('Admin', 'Manager', 'Worker')) DEFAULT 'Worker',
  contact_number TEXT,
  task_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  contact_number TEXT,
  address TEXT,
  email TEXT,
  transaction_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_number TEXT,
  address TEXT,
  email TEXT,
  item_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plots
CREATE TABLE plots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  area REAL NOT NULL,
  location TEXT,
  soil_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crop Cycles
CREATE TABLE crop_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plot_id UUID REFERENCES plots(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  estimated_end_date DATE,
  status TEXT CHECK (status IN ('Planned', 'Ongoing', 'Harvested', 'Cancelled')) DEFAULT 'Planned',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Harvests
CREATE TABLE harvests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  sales_value REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT CHECK (status IN ('To Do', 'In Progress', 'Completed')) DEFAULT 'To Do',
  worker_ids UUID[] DEFAULT '{}',
  crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
  plot_id UUID REFERENCES plots(id) ON DELETE CASCADE,
  harvest_id UUID REFERENCES harvests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cycle Workers (assignment + wage)
CREATE TABLE cycle_workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  salary REAL NOT NULL DEFAULT 0,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cycle_id, worker_id)
);

-- Income
CREATE TABLE incomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  customer_name TEXT,
  crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  supplier_name TEXT,
  crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_name TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  equity_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items (inventory)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Input', 'Produce', 'Equipment')),
  unit_price REAL NOT NULL,
  stock_level REAL NOT NULL DEFAULT 0,
  reorder_level REAL NOT NULL DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for all tables (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE workers;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE plots;
ALTER PUBLICATION supabase_realtime ADD TABLE crop_cycles;
ALTER PUBLICATION supabase_realtime ADD TABLE harvests;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE cycle_workers;
ALTER PUBLICATION supabase_realtime ADD TABLE incomes;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE investments;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
```

### Option B: Use the Supabase Dashboard Table Editor

Alternatively, create each table manually through **Table Editor** in the Supabase dashboard. Make sure to:
- Set `id` as `UUID` primary key with default `gen_random_uuid()`
- Add foreign key constraints as shown above
- Enable Realtime for each table

## Step 6: Configure Row Level Security (RLS)

For development/testing, you can allow public access:

```sql
-- Disable RLS for all tables (dev only)
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE plots DISABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE harvests DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE incomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
```

For production, implement proper RLS policies based on your auth requirements.

## Step 7: Seed Initial Admin User

Go to **Authentication** → **Users** in the Supabase dashboard and add a user with the email `mbongmebiang@gmail.com`. Then insert their worker record:

```sql
INSERT INTO workers (id, first_name, last_name, email, role, contact_number)
VALUES (auth.uid(), 'Admin', 'User', 'mbongmebiang@gmail.com', 'Admin', '');
```

## Step 8: Run the App

```bash
# Install dependencies (if not already done)
npm install

# Start the dev server
npm run dev
```

The app should now connect to Supabase instead of Firebase.

## Architecture Notes

### What Changed

| Before (Firebase) | After (Supabase) |
|---|---|
| `firebase/firestore` SDK | `@supabase/supabase-js` |
| `onSnapshot()` real-time | Postgres changes + `useCollection()` polling |
| `firebase/auth` | `supabase.auth` |
| `firebaseConfig` object in code | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` env vars |
| Firestore rules | Supabase RLS policies |
| `src/firebase/` directory | `src/supabase/` directory |
| `src/lib/types.ts` (same) | `src/lib/types.ts` (same structure, UUID IDs) |

### Key Files

- `src/lib/supabase.ts` — Supabase client instance
- `src/config/supabase.config.ts` — Config reads from env vars
- `src/supabase/provider.tsx` — React context provider for Supabase auth/session
- `src/supabase/useCollection.tsx` — Real-time collection hook (replaces useCollection)
- `src/supabase/writes.ts` — Helper functions for insert/update/delete/select
- `src/supabase/auth.ts` — Auth helper functions (signUp, signIn, signOut)

### Real-Time Subscriptions

The `useCollection` hook currently uses polling (fetches on mount and dependency change). For true real-time via Postgres changes, you can add Supabase channels:

```tsx
supabase
  .channel('cropCycles')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'cropCycles' })
  .subscribe((payload) => {
    // Handle real-time updates
  });
```