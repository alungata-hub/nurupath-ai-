import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { scholarshipAgent, guardianAgent } from '@/lib/ai-agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 });
    }

    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const scholarshipResult = await scholarshipAgent(profile, apiKey);
    const guardianResult = await guardianAgent('scholarship', scholarshipResult, profile, apiKey);
    const finalOutput = (guardianResult.modified_output || scholarshipResult) as typeof scholarshipResult;

    const { data: match, error } = await supabaseServer
      .from('scholarship_matches')
      .insert({
        user_id,
        matches: finalOutput.matches || [],
        confidence_score: finalOutput.confidence_score || 0,
        reasoning: finalOutput.reasoning || '',
        risks: finalOutput.risks || [],
        next_steps: finalOutput.next_steps || [],
        guardian_approved: guardianResult.approved,
        guardian_flags: guardianResult.flags || [],
        governance_status: guardianResult.approved ? 'approved' : 'escalated',
      })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabaseServer.from('audit_logs').insert({
      user_id,
      action: 'scholarship_search',
      resource_type: 'scholarship_match',
      resource_id: match?.id,
      details: { match_count: finalOutput.matches?.length || 0 },
    });

    return NextResponse.json({ data: match });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
