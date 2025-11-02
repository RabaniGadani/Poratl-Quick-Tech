# Setup Instructions for Student Registration System

## Prerequisites
- Supabase project created
- Environment variables configured in `.env.local`

## Step 1: Set up the Database Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create registered_students table
CREATE TABLE IF NOT EXISTS registered_students (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cnic VARCHAR(15) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  course VARCHAR(50) NOT NULL,
  shift VARCHAR(50) NOT NULL,
  education VARCHAR(100) NOT NULL,
  picture_url TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registered_students_email ON registered_students(email);
CREATE INDEX IF NOT EXISTS idx_registered_students_cnic ON registered_students(cnic);
CREATE INDEX IF NOT EXISTS idx_registered_students_status ON registered_students(status);
CREATE INDEX IF NOT EXISTS idx_registered_students_course ON registered_students(course);
```

## Step 2: Set up Storage Bucket

Run the following SQL to create the storage bucket:

```sql
-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile_pictures',
  'profile_pictures',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;
```

## Step 3: Set up Storage Policies

Run the following SQL to set up access policies:

```sql
-- Allow public read access to profile pictures
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'profile_pictures');

-- Allow anonymous uploads
CREATE POLICY "Anyone can upload profile pictures" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile_pictures');

-- Allow anonymous users to update profile pictures
CREATE POLICY "Anyone can update profile pictures" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile_pictures');

-- Allow anonymous users to delete profile pictures
CREATE POLICY "Anyone can delete profile pictures" ON storage.objects
FOR DELETE USING (bucket_id = 'profile_pictures');
```

## Step 4: Set up Table Policies

Run the following SQL to enable table access:

```sql
-- Enable Row Level Security (RLS) on the table
ALTER TABLE registered_students ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert into registered_students
CREATE POLICY "Anyone can insert registered students" ON registered_students
FOR INSERT WITH CHECK (true);

-- Create policy to allow public read access to registered_students
CREATE POLICY "Public read access to registered students" ON registered_students
FOR SELECT USING (true);
```

## Step 5: Verify Setup

1. Go to your Supabase Dashboard
2. Check Storage > Buckets - you should see `profile_pictures` bucket
3. Check Database > Tables - you should see `registered_students` table
4. Test the registration form

## Troubleshooting

### If you get "Storage bucket not configured" error:
- Make sure you've created the `profile_pictures` bucket
- Check that the bucket name matches exactly

### If you get "Database table not configured" error:
- Make sure you've created the `registered_students` table
- Check that all required columns exist

### If picture upload fails:
- Verify storage policies are set correctly
- Check file size (max 5MB)
- Ensure file type is supported (JPEG, PNG, GIF, WebP)

## File Structure Created

- `database_setup.sql` - Complete database and storage setup
- `supabase_storage_setup.sql` - Storage bucket setup only
- `SETUP_INSTRUCTIONS.md` - This setup guide

## Next Steps

After setup, students can:
1. Fill out the registration form
2. Upload profile pictures (optional)
3. Submit their application
4. Data is stored in `registered_students` table
5. Pictures are stored in `profile_pictures` bucket

Admin can then:
1. View all registrations in the database
2. Update status from 'pending' to 'approved'/'rejected'
3. Access uploaded profile pictures via URLs
