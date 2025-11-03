import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) setLoading(false)
          return
        }

        if (session && session.user && mounted) {
          // Set user immediately from session to unblock UI
          const tempUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'buyer',
          }
          
          setUser(tempUser)
          setLoading(false)
          
          // Load full profile in background
          try {
            await loadUserProfile(session.user.id)
          } catch (error) {
            console.error('Error loading profile in background:', error)
            // Keep the temp user, don't clear it
          }
        } else if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id, session?.user?.email)
      
      // Handle SIGNED_OUT event immediately
      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
        return
      }
      
      if (session && session.user) {
        // Set user immediately from session to unblock UI
        // Profile will load in background
        const tempUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'buyer',
        }
        
        if (mounted) {
          setUser(tempUser)
          setLoading(false)
        }
        
        // Load full profile in background (non-blocking - don't await)
        // User is already set from session, so we can proceed
        if (!isLoggingOut) {
          // Fire and forget - don't await or block on this
          loadUserProfile(session.user.id).catch((error) => {
            console.error('Error loading profile in background (non-critical):', error)
            // User is already set, so we can ignore profile loading errors
          })
        }
        
        // If user just confirmed email, ensure profile exists (non-blocking)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Don't await - let it run in background
          ensureProfileExists(session.user.id, session.user.email).catch((error) => {
            console.error('Error ensuring profile exists (non-critical):', error)
          })
        }
      } else {
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const ensureProfileExists = async (userId, email) => {
    try {
      console.log('Ensuring profile exists for:', userId, email)
      
      // Use timeout to prevent hanging
      const checkPromise = supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Check timeout')), 2000)
      })

      let existingProfile, checkError
      try {
        const result = await Promise.race([checkPromise, timeoutPromise])
        existingProfile = result?.data
        checkError = result?.error
      } catch (timeoutErr) {
        console.warn('Profile check timed out, skipping profile creation')
        return // Don't try to create if we can't check
      }

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking profile:', checkError)
        return
      }

      // If no profile exists, try to create one
      if (!existingProfile) {
        console.log('Creating new profile...')
        
        const insertPromise = supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email || '',
            full_name: email?.split('@')[0] || 'User',
            role: 'buyer',
          })

        const insertTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Insert timeout')), 2000)
        })

        try {
          const { error: insertError } = await Promise.race([insertPromise, insertTimeout])
          
          if (insertError) {
            if (insertError.code === '23505') {
              console.log('Profile already exists (created by trigger)')
            } else {
              console.error('Error creating profile:', insertError)
            }
          } else {
            console.log('✓ Profile created successfully')
          }
        } catch (insertTimeoutErr) {
          console.warn('Profile creation timed out - may be created by trigger')
        }
      } else {
        console.log('✓ Profile already exists')
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error)
    }
  }

  const loadUserProfile = async (userId) => {
    // Don't load profile if logging out
    if (isLoggingOut) {
      console.log('Skipping profile load - logging out')
      return
    }
    
    try {
      console.log('Loading profile for user:', userId)
      
      // Query profile with timeout and detailed logging
      console.log('Querying profiles table for user:', userId)
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...')
      
      let queryStartTime = Date.now()
      
      // Create query with timeout
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      // 3 second timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const elapsed = Date.now() - queryStartTime
          reject(new Error(`Query timeout after ${elapsed}ms`))
        }, 3000)
      })

      // Execute query with timeout using Promise.race
      let data, error
      
      try {
        console.log('Executing query (timeout: 3s)...')
        
        // Race between query and timeout
        const result = await Promise.race([queryPromise, timeoutPromise])
        
        const elapsed = Date.now() - queryStartTime
        console.log(`✓ Query completed in ${elapsed}ms`)
        
        data = result?.data
        error = result?.error
        
        console.log('✓ Profile query result:', { 
          hasData: !!data, 
          hasError: !!error,
          errorCode: error?.code,
          errorMessage: error?.message 
        })
      } catch (queryErr) {
        const elapsed = Date.now() - queryStartTime
        
        // Check if it's a timeout or other error
        if (queryErr.message?.includes('timeout') || elapsed >= 2900) {
          console.warn(`⚠️ Profile query timed out after ${elapsed}ms`)
          console.warn('Possible causes: Network issue, RLS blocking, or Supabase service issue')
        } else {
          console.error('Query error:', queryErr)
        }
        
        // On any error/timeout, use auth user data immediately
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (authUser) {
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              role: authUser.user_metadata?.role || 'buyer',
            })
            console.log('✓ User set from auth data (query failed/timeout)')
          }
        } catch (authErr) {
          console.error('Error getting auth user during timeout:', authErr)
        }
        return
      }

      // Handle errors or missing profile
      if (error) {
        console.error('Profile query error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Any error means we should use auth user data
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            role: authUser.user_metadata?.role || 'buyer',
          })
          console.log('✓ Using auth user data due to query error')
          
          // Try to create profile in background if it doesn't exist
          if (error.code !== 'PGRST116') {
            ensureProfileExists(authUser.id, authUser.email).catch(err => {
              console.error('Error ensuring profile exists:', err)
            })
          }
        }
        return
      }
      
      // Handle case where maybeSingle returns null (profile doesn't exist)
      if (!data) {
        console.log('Profile not found in database - creating in background')
        
        // Get auth user for email
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Error getting auth user:', authError)
          return
        }
        
        if (authUser) {
          // Try to create profile in background (non-blocking)
          ensureProfileExists(authUser.id, authUser.email).catch(err => {
            console.error('Error ensuring profile exists:', err)
          })
          
          // Set user immediately with auth data
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            role: authUser.user_metadata?.role || 'buyer',
          })
          console.log('✓ Using auth user data (profile creation in background)')
        }
        return
      }

      // Profile found successfully
      if (data) {
        console.log('Profile loaded successfully:', {
          id: data.id,
          email: data.email,
          name: data.full_name,
          role: data.role
        })
        setUser({
          id: data.id,
          email: data.email || '',
          name: data.full_name || data.email?.split('@')[0] || 'User',
          role: data.role || 'buyer',
          companyName: data.company_name,
          phone: data.phone,
        })
        console.log('User state updated with profile data')
      } else {
        console.log('No profile data returned, using auth user')
        // Fallback to auth user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            role: authUser.user_metadata?.role || 'buyer',
          })
        }
      }
    } catch (error) {
      console.error('Unexpected error loading user profile:', error)
      // Fallback to auth user - don't block
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            role: authUser.user_metadata?.role || 'buyer',
          })
          console.log('Using auth user data after unexpected error')
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    }
  }

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('Login error:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('No user data returned from login')
      }

      // Ensure profile exists (in case it wasn't created during signup)
      await ensureProfileExists(data.user.id, data.user.email)
      
      // Load user profile
      await loadUserProfile(data.user.id)

      return data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signup = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: userData.name,
            role: userData.role || 'buyer',
            company_name: userData.companyName,
            phone: userData.phone,
          },
        },
      })

      if (error) {
        console.error('Signup error:', error)
        throw error
      }

      // If user is created (even if email confirmation is required)
      if (data.user) {
        try {
          // Try to create profile immediately
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email.trim(),
              full_name: userData.name || email.trim().split('@')[0],
              role: userData.role || 'buyer',
              company_name: userData.companyName || null,
              phone: userData.phone || null,
            })

          if (profileError) {
            // If profile creation fails (e.g., RLS policy), log it
            // Profile will be created via trigger or on first login
            console.warn('Profile creation during signup failed (may be created later):', profileError)
          }
        } catch (profileErr) {
          console.warn('Profile creation error (non-critical):', profileErr)
        }

        // If email confirmation is disabled or user is already confirmed, load profile
        if (data.session) {
          await loadUserProfile(data.user.id)
        } else {
          // Email confirmation required - user will be loaded after confirmation
          setLoading(false)
        }
      }

      return data
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error
    return data
  }

  const logout = async () => {
    try {
      console.log('Logging out...')
      
      // Set logging out flag to prevent profile loading
      setIsLoggingOut(true)
      
      // Clear user state immediately to unblock UI
      setUser(null)
      setLoading(false)
      
      // Sign out from Supabase (fire and forget - don't wait)
      supabase.auth.signOut().then(({ error }) => {
        if (error) {
          console.error('Error signing out from Supabase:', error)
        } else {
          console.log('Logged out successfully')
        }
        // Reset flag after signout completes
        setIsLoggingOut(false)
      }).catch((error) => {
        console.error('Logout error:', error)
        setIsLoggingOut(false)
      })
      
      // Return immediately - don't wait for signOut
      return Promise.resolve()
    } catch (error) {
      console.error('Logout failed:', error)
      // Ensure state is cleared even on error
      setIsLoggingOut(false)
      setUser(null)
      setLoading(false)
      return Promise.resolve()
    }
  }

  const value = {
    user,
    login,
    signup,
    signInWithGoogle,
    logout,
    loading,
    isAuthenticated: !!user,
    isVendor: user?.role === 'vendor',
    isBuyer: user?.role === 'buyer',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

