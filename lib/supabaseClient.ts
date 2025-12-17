import { createClient } from '@supabase/supabase-js';

// 这些是占位符。在实际环境中，请从 Supabase 控制台获取真实凭据。
// 为了防止 "Failed to fetch" 错误崩溃，我们添加了 global fetch 错误处理的思路。
const SUPABASE_URL = 'https://stockwise.art/api'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYWt3YnhrZnRva2ZkeXFkcm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTAzNDAsImV4cCI6MjA4MTQ3OTg0MH0.2Stwx6UV3Tv9ZpQdoc2_FEqyyLO8e2YDBmzIcNiIEfk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'prism-stockwise' }
  }
});

// 安全获取 Session 的辅助函数
export const getSafeSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase connection failed, switching to demo mode context.");
    return { session: null };
  }
};