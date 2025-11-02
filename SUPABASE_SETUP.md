# Supabase Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to get these values:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key
5. Paste them in your `.env.local` file

## Usage Examples

### Client-side usage:
```typescript
import { supabase } from '@/lib/supabase'

// Example: Sign up a user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Example: Query data
const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

### Server-side usage:
```typescript
import { createServerSupabaseClient } from '@/lib/supabase'

const supabase = createServerSupabaseClient()
// Use for server-side operations
```

## Important Notes

- Never commit your `.env.local` file to version control
- The `NEXT_PUBLIC_` prefix makes these variables available in the browser
- Restart your development server after adding environment variables
