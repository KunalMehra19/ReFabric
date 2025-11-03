# Debugging Profile Query Timeout

If you're seeing "Profile query timeout" errors, here's how to diagnose:

## Quick Check

1. **Verify Supabase Connection**
   - Open browser DevTools > Network tab
   - Look for requests to `supabase.co` 
   - Check if they're completing or failing

2. **Check RLS Policies**
   Run this in Supabase SQL Editor:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
   
   You should see policies that allow:
   - SELECT: Everyone can read profiles
   - INSERT: Users can insert their own profile
   - UPDATE: Users can update their own profile

3. **Test Direct Query**
   Run this in Supabase SQL Editor (replace with your user ID):
   ```sql
   SELECT * FROM profiles WHERE id = '79afd1c0-066d-4cc4-93df-c65808b77678';
   ```
   
   - If this works: RLS is fine, might be client-side issue
   - If this fails: Check RLS policies

4. **Check Browser Console**
   Look for CORS errors or network errors in the console

## Common Issues

### Issue 1: RLS Policy Too Restrictive
**Symptom**: Query times out
**Solution**: Make sure you have this policy:
```sql
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);
```

### Issue 2: Network/Firewall Blocking
**Symptom**: All Supabase queries timeout
**Solution**: Check network connectivity, VPN, firewall settings

### Issue 3: Profiles Table Doesn't Exist
**Symptom**: Query timeout
**Solution**: Verify table exists:
```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'profiles'
);
```

### Issue 4: Supabase URL/Key Incorrect
**Symptom**: Queries timeout
**Solution**: Double-check `.env` file has correct values

## Temporary Workaround

The code now falls back to auth user data after timeout, so the app should still work. The profile will be created in the background.

If timeouts persist, you can:
1. Increase timeout in `AuthContext.jsx` (line 189)
2. Skip profile loading entirely and just use auth user metadata
3. Check Supabase dashboard for any service issues

