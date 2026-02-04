# Sales Follow-Up Tracker

A modern React application for managing sales follow-ups and customer relationships, powered by Supabase.

## Features

- Customer management with follow-up tracking
- Sales person management
- Mobile-responsive design
- Real-time data updates with Supabase
- Search and filtering capabilities
- Role-based access control

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Supabase project:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migration script in the Supabase SQL editor
   - Get your project URL and anon key

4. Update the `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following Supabase tables:

### sales_persons
- `id` (uuid, primary key)
- `name` (text)
- `created_at` (timestamp)

### customers
- `id` (uuid, primary key)
- `name` (text)
- `mobile` (text)
- `location` (text)
- `referral_source` (text)
- `sales_person_id` (uuid, foreign key)
- `remarks` (text)
- `created_at` (timestamp)

### follow_ups
- `id` (uuid, primary key)
- `customer_id` (uuid, foreign key)
- `date` (date)
- `status` (text)
- `remarks` (text)
- `created_at` (timestamp)

## Supabase Setup

1. Create a new Supabase project
2. Run the migration script located in `supabase/migrations/create_sales_tracker_schema.sql`
3. The script will:
   - Create all necessary tables
   - Set up Row Level Security (RLS)
   - Insert default sales persons
   - Configure proper relationships

## Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Development

The application uses:
- React 18 with TypeScript
- Supabase for backend and database
- Tailwind CSS for styling
- React Router for navigation
- Date-fns for date handling
- Lucide React for icons

## Building for Production

```bash
npm run build
```

## Features

- ✅ Real-time data synchronization with Supabase
- ✅ Automatic database relationships
- ✅ Row Level Security for data protection
- ✅ Mobile-responsive design
- ✅ Loading states and error handling
- ✅ Search and filtering
- ✅ CRUD operations for customers and sales persons
- ✅ Follow-up tracking and status updates

## Authentication

Currently uses a simple mock authentication system. For production, implement Supabase Auth:

```typescript
// Example Supabase Auth integration
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```