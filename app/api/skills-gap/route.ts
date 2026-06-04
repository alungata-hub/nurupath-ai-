import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { skillsAgent, guardianAgent } from '@/lib/ai-agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, target_career } = body;

    if (!user_id || !target_career) {
      return NextResponse.json({ error: 'user_id and target_career required' }, { status: 400 });
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

    const skillsResult = await skillsAgent(profile, target_career, apiKey);
    const guardianResult = await guardianAgent('skills', skillsResult, profile, apiKey);
    const finalOutput = (guardianResult.modified_output || skillsResult) as typeof skillsResult;

    const { data: report, error } = await supabaseServer
      .from('skills_reports')
      .insert({
        user_id,
        current_skills: finalOutput.current_skills || profile.skills || [],
        required_skills: finalOutput.required_skills || [],
        gap_score: finalOutput.gap_score || 0,
        gap_analysis: finalOutput.gap_analysis || [],
        learning_roadmap: finalOutput.learning_roadmap || [],
        recommended_courses: finalOutput.recommended_courses || [],
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
      action: 'skills_gap_analysis',
      resource_type: 'skills_report',
      resource_id: report?.id,
      details: { target_career, gap_score: finalOutput.gap_score },
    });

    return NextResponse.json({ data: report });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
