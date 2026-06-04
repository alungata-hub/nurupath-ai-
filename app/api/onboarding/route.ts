import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, full_name, age, county, sub_county, gender, education_level, academic_performance, career_interests, skills, financial_constraints, language_preference } = body;

    if (!user_id || !full_name || !county || !education_level) {
      return NextResponse.json({ error: 'Missing required fields: user_id, full_name, county, education_level' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('profiles')
      .upsert({
        user_id,
        full_name,
        age: age || null,
        county,
        sub_county: sub_county || '',
        gender: gender || '',
        education_level,
        academic_performance: academic_performance || '',
        career_interests: career_interests || [],
        skills: skills || [],
        financial_constraints: financial_constraints || '',
        language_preference: language_preference || 'en',
        onboarding_completed: true,
      }, { onConflict: 'user_id' })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log to audit
    await supabaseServer.from('audit_logs').insert({
      user_id,
      action: 'onboarding_complete',
      resource_type: 'profile',
      resource_id: data?.id,
      details: { education_level, county },
    });

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
