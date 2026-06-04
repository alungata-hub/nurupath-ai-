import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { actionPlanAgent, guardianAgent } from '@/lib/ai-agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, career_path } = body;

    if (!user_id || !career_path) {
      return NextResponse.json({ error: 'user_id and career_path required' }, { status: 400 });
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

    const planResult = await actionPlanAgent(profile, career_path, apiKey);
    const guardianResult = await guardianAgent('action_plan', planResult, profile, apiKey);
    const finalOutput = (guardianResult.modified_output || planResult) as typeof planResult;

    const { data: plan, error } = await supabaseServer
      .from('action_plans')
      .insert({
        user_id,
        plan_30_days: finalOutput.plan_30_days || {},
        plan_90_days: finalOutput.plan_90_days || {},
        plan_1_year: finalOutput.plan_1_year || {},
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
      action: 'action_plan_generated',
      resource_type: 'action_plan',
      resource_id: plan?.id,
      details: { career_path },
    });

    return NextResponse.json({ data: plan });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
