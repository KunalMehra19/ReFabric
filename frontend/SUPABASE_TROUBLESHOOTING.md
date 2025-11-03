# Supabase Troubleshooting Guide

## Issue: Profile Not Created After Signup

If profiles are not being created in the `profiles` table after signup:

### Solution 1: Check Database Trigger

Make sure you've created the automatic profile trigger. Run this in your Supabase SQL Editor:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If it doesn't exist, create it (from SUPABASE_SETUP.md)
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

### Solution 2: Check RLS Policies

Ensure the RLS policy allows profile insertion:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- If the insert policy doesn't exist, create it:
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Solution 3: Disable Email Confirmation (for testing)

If email confirmation is enabled, profiles might not be created until email is confirmed:

1. Go to Supabase Dashboard > Authentication > Settings
2. Disable "Enable email confirmations" (for testing only)
3. Re-enable after testing

Or manually confirm email in Supabase Dashboard > Authentication > Users

## Issue: Can't Login After Restart

If you can't login after restarting the app:

### Solution 1: Check Session Storage

Clear browser storage and try again:
1. Open Browser DevTools (F12)
2. Go to Application > Storage
3. Clear Local Storage and Session Storage
4. Refresh page and try logging in again

### Solution 2: Check Supabase Credentials

Verify your `.env` file has correct credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Solution 3: Check Browser Console

Look for errors in the browser console:
- Network errors
- CORS errors
- Authentication errors

### Solution 4: Verify User Exists

Check if user exists in Supabase:
1. Go to Supabase Dashboard > Authentication > Users
2. Search for the email
3. Check if user is confirmed

## Issue: Login Button Disappears/No Response

If the login button text disappears and nothing happens:

### Solution 1: Check Loading State

The button might be stuck in loading state. Check:
1. Browser console for errors
2. Network tab for failed requests
3. Verify Supabase URL and keys are correct

### Solution 2: Add Debug Logging

Temporarily add console logs in `AuthContext.jsx`:
```javascript
const login = async (email, password) => {
  console.log('Login attempt:', email)
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    console.log('Login response:', { data, error })
    // ... rest of code
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}
```

### Solution 3: Check Error Messages

Ensure error messages are being displayed. Check the Toast component is working.

## Issue: Email Confirmation Required

If email confirmation is enabled in Supabase:

### Option 1: Confirm Email Manually
1. Go to Supabase Dashboard > Authentication > Users
2. Find the user
3. Click "Confirm Email"

### Option 2: Use Confirmation Link
1. Check email inbox for confirmation link
2. Click the link to confirm email
3. Then try logging in

### Option 3: Disable for Development
1. Go to Authentication > Settings
2. Turn off "Enable email confirmations"
3. Note: This should be re-enabled in production!

## General Debugging Steps

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: Verify API requests are successful
3. **Check Supabase Dashboard**: Verify tables, policies, and triggers exist
4. **Verify Environment Variables**: Ensure `.env` file is in `frontend/` directory
5. **Restart Dev Server**: Sometimes a restart helps after env changes

## Testing Profile Creation

Run this in Supabase SQL Editor to test:

```sql
-- Check if profiles table exists
SELECT * FROM profiles LIMIT 1;

-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if you can manually insert (replace with your user ID)
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'YOUR_USER_ID_HERE',
  'test@example.com',
  'Test User',
  'buyer'
) ON CONFLICT (id) DO NOTHING;
```

If manual insert works but automatic doesn't, the trigger might not be set up correctly.

## Issue: Google Login Error "Unsupported provider: provider is not enabled"

If you see this error when trying to login with Google:
```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

### Solution: Enable Google OAuth in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: Authentication > Providers
   - Or directly: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/providers

2. **Enable Google Provider**
   - Find "Google" in the providers list
   - Toggle the switch to **ON**
   - Click on "Google" to configure

3. **Get Google OAuth Credentials**
   
   **Step A: Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Note the project name

   **Step B: Enable Google+ API**
   - In Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

   **Step C: Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External (for testing) or Internal (for organization)
     - Fill in required fields (App name, support email)
     - Add your email to test users if using External
     - Save and continue
   - Back to creating credentials:
     - Application type: **Web application**
     - Name: "ReFabric Marketplace" (or any name)
     - Authorized redirect URIs: Add this:
       ```
       https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
       ```
       - Replace `YOUR_PROJECT_ID` with your Supabase project ID
       - You can find it in your Supabase project URL
   - Click "Create"
   - **Copy the Client ID and Client Secret**

4. **Configure in Supabase**
   - Back in Supabase Dashboard > Authentication > Providers > Google
   - Paste the **Client ID** and **Client Secret**
   - Click "Save"

5. **Test**
   - Try logging in with Google again
   - It should now redirect to Google's login page

### Alternative: Disable Google Login (if you don't need it)

If you don't want Google login, you can remove the Google login button from your frontend:

1. In `frontend/src/pages/Login.jsx` and `frontend/src/pages/Signup.jsx`
2. Remove or comment out the Google login button
3. Or conditionally hide it if the provider isn't configured

