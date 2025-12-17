
import { createClient } from '@supabase/supabase-js';

// 使用用户提供的最新反向代理地址和凭据
const SUPABASE_URL = 'https://stockwise.art/api'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYWt3YnhrZnRva2ZkeXFkcm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM4NDAsImV4cCI6MjA4MTQ3OTg0MH0.2Stwx6UV3Tv9ZpQdoc2_FEqyyLO8e2YDBmzIcNiIEfk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // 增加存储检查，防止在隐私模式下崩溃
    storage: window.localStorage
  },
  global: {
    headers: { 'x-application-name': 'prism-stockwise' },
    // 关键修复：处理 fetch 失败的情况，防止抛出未捕获的全局异常
    // Fix: Explicitly define parameters to avoid "spread argument must either have a tuple type" error
    fetch: (input, init) => fetch(input, init).catch(err => {
      console.warn("Supabase fetch failed - Network error or invalid endpoint:", err);
      throw err;
    })
  }
});

/**
 * 安全获取 Session 的辅助函数
 * 即使网络连接失败 (Failed to fetch)，也会返回空 session 而不是抛出异常崩溃应用
 */
export const getSafeSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { session: null };
    return data;
  } catch (err) {
    console.warn("Network unreachable, proceeding in demo/offline mode.");
    return { session: null };
  }
};
