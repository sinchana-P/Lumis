import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// https://console.cron-job.org/jobs/create

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ ok: false, error: 'Missing env vars' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error } = await supabase.from('users').select('id').limit(1);

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}
