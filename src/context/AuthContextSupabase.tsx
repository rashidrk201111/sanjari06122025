import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinedDate: string;
  role?: 'user' | 'admin' | 'staff';
  emailVerified?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: any[];
  subtotal: number;
  gst: number;
  shipping: number;
  total: number;
  deliveryAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  paymentMethod: string;
  guestCheckout?: boolean;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface AuthContextType {
  user: User | null;
  orders: Order[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  socialLogin: (provider: 'google' | 'facebook') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  addOrder: (order: Order) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  loading: boolean;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  // Initialize auth state from Supabase session
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        if (session?.user && mounted) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
          await fetchUserOrders(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
          await fetchUserOrders(session.user.id);
        } else {
          setSupabaseUser(null);
          setUser(null);
          setOrders([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          joinedDate: data.created_at,
          role: data.role,
          emailVerified: data.email_verified,
        });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  // Fetch user orders from database
  const fetchUserOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      if (data) {
        const mappedOrders: Order[] = data.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          date: order.created_at,
          status: order.status,
          items: order.items || [],
          subtotal: order.total_amount * 0.85, // Approximate
          gst: order.total_amount * 0.15, // Approximate
          shipping: 0,
          total: Number(order.total_amount),
          deliveryAddress: order.shipping_address || {},
          paymentMethod: order.payment_method || 'COD',
          trackingNumber: order.tracking_number,
          estimatedDelivery: order.estimated_delivery,
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Error in fetchUserOrders:", error);
    }
  };

  // Sign up new user
  const signup = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: "Failed to create user" };
      }

      // APPROACH 1: Try using the database function (bypasses RLS)
      try {
        const { data: funcData, error: funcError } = await supabase.rpc(
          'create_user_profile',
          {
            user_id: authData.user.id,
            user_email: email,
            user_name: name,
            user_phone: phone || '',
          }
        );

        if (funcError) {
          console.error("Function error, trying direct insert:", funcError);
          throw funcError; // Fall through to direct insert
        }

        if (funcData && !funcData.success) {
          console.error("Profile creation failed:", funcData.error);
          throw new Error(funcData.error);
        }

        console.log("Profile created successfully via function");
        return { success: true };
      } catch (funcError) {
        console.error("Function approach failed, trying direct insert:", funcError);
        
        // APPROACH 2: Fallback to direct insert (requires RLS policy)
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email,
              name,
              phone: phone || '',
              role: 'user',
              email_verified: false,
            },
          ]);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          return { success: false, error: `Failed to create user profile: ${profileError.message}` };
        }

        console.log("Profile created successfully via direct insert");
        return { success: true };
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  // Login user
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Login failed" };
      }

      // User profile and orders will be fetched automatically by onAuthStateChange
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  // Logout user
  const logout = async () => {
    setUser(null);
    setSupabaseUser(null);
    setOrders([]);
    sessionStorage.removeItem("checkout_mode");
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update user profile
  const updateProfile = async (
    updates: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          phone: updates.phone,
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      setUser({ ...user, ...updates });
      return { success: true };
    } catch (error: any) {
      console.error("Update profile error:", error);
      return { success: false, error: error.message || "Failed to update profile" };
    }
  };

  // Add new order
  const addOrder = async (order: Order): Promise<{ success: boolean; error?: string }> => {
    try {
      const payload: any = {
        order_number: order.orderNumber,
        items: order.items,
        total_amount: order.total,
        status: order.status,
        shipping_address: order.deliveryAddress,
        payment_method: order.paymentMethod,
        payment_status: 'pending',
      };

      if (order.guestCheckout) {
        payload.user_id = null;
      } else if (user) {
        payload.user_id = user.id;
      } else {
        payload.user_id = null;
      }

      const { error } = await supabase
        .from('orders')
        .insert([payload]);

      if (error) {
        return { success: false, error: error.message };
      }

      // Add to local state
      setOrders((prev) => [order, ...prev]);
      return { success: true };
    } catch (error: any) {
      console.error("Add order error:", error);
      return { success: false, error: error.message || "Failed to create order" };
    }
  };

  // Social login (Google/Facebook)
  const socialLogin = async (
    provider: 'google' | 'facebook'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // OAuth will redirect to provider's login page
      // User will be redirected back after authentication
      return { success: true };
    } catch (error: any) {
      console.error("Social login error:", error);
      return { success: false, error: error.message || "Social login failed" };
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Reset password error:", error);
      return { success: false, error: error.message || "Failed to send reset email" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        login,
        signup,
        socialLogin,
        logout,
        updateProfile,
        addOrder,
        isAuthenticated: !!user,
        loading,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
