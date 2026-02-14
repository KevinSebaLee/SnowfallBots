import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import crypto from 'crypto'; // Import crypto to access SSL constants

const customFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const agent = process.env.HTTPS_PROXY 
      ? new HttpsProxyAgent(process.env.HTTPS_PROXY)
      : new https.Agent({ 
          keepAlive: true,
          rejectUnauthorized: false,
          // Use crypto.constants instead of require('constants')
          secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
        });

    // Add required authentication headers
    const headers = new Headers(options.headers);
    headers.set('apikey', process.env.SUPABASE_SERVICE_ROLE_KEY);
    headers.set('Authorization', `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    headers.set('Connection', 'keep-alive');

    const response = await fetch(url, {
      ...options,
      agent,
      signal: controller.signal,
      headers
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }
    
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        fetch: customFetch,
        headers: {
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache'
        }
      }
    }
  );

  (async () => {
    try {
      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', process.env.SUPABASE_URL);
      console.log('Supabase Key:', '***' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-4));

      const testRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      });
      console.log(`Basic API test: ${testRes.status} ${testRes.statusText}`);
    } catch (err) {
      console.error('❌ Connection failed:', {
        message: err.message,
        stack: err.stack
      });
    }
  })();
} else {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Database features will be unavailable.');
}

export default supabase;
