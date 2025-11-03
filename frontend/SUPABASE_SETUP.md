# Supabase Integration Guide

This guide will help you set up Supabase for the ReFabric Marketplace application.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

## Enable Google OAuth (Optional but Recommended)

If you want to enable Google login:

1. Go to Supabase Dashboard > Authentication > Providers
2. Find "Google" in the list and toggle it ON
3. Click on "Google" to configure it
4. You'll need:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. To get Google credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select existing)
   - Enable "Google+ API"
   - Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
     - Replace `YOUR_PROJECT_ID` with your Supabase project ID
   - Copy the Client ID and Client Secret
6. Paste them into Supabase Google provider settings
7. Save

**Note**: If you don't set up Google OAuth, users will only be able to sign up/login with email and password.

## Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

## Database Schema

Run the following SQL in your Supabase SQL Editor to create the required tables:

### 1. Enable UUID Extension

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Create Profiles Table

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('vendor', 'buyer')) DEFAULT 'buyer',
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Anyone can read profiles (for vendor info display)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Trigger: Automatically create profile when user signs up
-- This ensures profile is created even if email confirmation is required
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Create Fabrics Table

```sql
CREATE TABLE fabrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price_per_meter NUMERIC NOT NULL,
  image_url TEXT,
  fabric_type TEXT,
  pattern TEXT,
  colors JSONB DEFAULT '[]'::jsonb,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read fabrics
CREATE POLICY "Fabrics are viewable by everyone"
  ON fabrics FOR SELECT
  USING (true);

-- Policy: Vendors can insert their own fabrics
CREATE POLICY "Vendors can insert fabrics"
  ON fabrics FOR INSERT
  WITH CHECK (
    auth.uid() = vendor_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'vendor'
    )
  );

-- Policy: Vendors can update their own fabrics
CREATE POLICY "Vendors can update own fabrics"
  ON fabrics FOR UPDATE
  USING (
    auth.uid() = vendor_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'vendor'
    )
  );

-- Policy: Vendors can delete their own fabrics
CREATE POLICY "Vendors can delete own fabrics"
  ON fabrics FOR DELETE
  USING (
    auth.uid() = vendor_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'vendor'
    )
  );
```

### 4. Create Storage Bucket for Fabric Images

1. Go to Storage in Supabase dashboard
2. Create a new bucket called `fabric-images`
3. Set it to **Public** (or configure policies as needed)

#### Storage Policy (if bucket is private):

```sql
-- Policy: Anyone can view images
CREATE POLICY "Fabric images are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fabric-images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload fabric images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fabric-images' AND
    auth.role() = 'authenticated'
  );

-- Policy: Users can update their own images
CREATE POLICY "Users can update own fabric images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'fabric-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own fabric images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fabric-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Authentication Setup

### Enable Google OAuth (Optional)

1. Go to Authentication > Providers in Supabase dashboard
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## Real-time Setup

1. Go to Database > Replication in Supabase dashboard
2. Enable replication for the `fabrics` table
3. This allows real-time updates when fabrics are added/updated/deleted

## Testing

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Create a test account through the signup page
4. Try uploading a fabric as a vendor
5. View fabrics as a buyer

## Troubleshooting

### RLS Policy Errors
- Make sure Row Level Security is enabled
- Check that policies allow the operations you're trying to perform
- Verify user authentication state

### Storage Upload Errors
- Ensure the `fabric-images` bucket exists
- Check storage policies
- Verify file size limits (default is 50MB)

### Real-time Not Working
- Enable replication for the `fabrics` table
- Check that you're subscribed to the correct channel
- Verify WebSocket connections in browser console

## Next Steps

1. Set up email templates in Supabase for password reset
2. Configure custom domain (optional)
3. Set up backups
4. Configure environment-specific projects (dev, staging, prod)

