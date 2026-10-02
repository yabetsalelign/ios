import { createClient } from 'npm:@supabase/supabase-js@2';

const configuredOrigins = (Deno.env.get('STOCKFLOW_ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const jsonHeaders = { 'Content-Type': 'application/json' };

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin');
  if (!origin || !allowedOrigins.has(origin)) {
    return new Response(JSON.stringify({ error: 'Request origin is not allowed.' }), {
      status: 403,
      headers: jsonHeaders,
    });
  }

  const corsHeaders = {
    ...jsonHeaders,
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const authorization = request.headers.get('Authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (
    typeof body !== 'object' || body === null || Array.isArray(body) ||
    Object.keys(body).length !== 1 || !Object.hasOwn(body, 'email')
  ) {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const emailValue = (body as { email?: unknown }).email;
  if (typeof emailValue !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }
  const email = emailValue.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Invitation service is unavailable.' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await callerClient.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const { data: profile, error: profileError } = await callerClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError || profile?.role !== 'manager') {
    return new Response(JSON.stringify({ error: 'Manager access required.' }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: origin,
  });
  if (inviteError) {
    return new Response(JSON.stringify({ error: 'Could not send invitation.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders,
  });
});