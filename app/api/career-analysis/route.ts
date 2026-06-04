import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { pathfinderAgent, guardianAgent, scoutAgent } from '@/lib/ai-agents';
import { validateHandoff, logAudit, createNotification, calculateProfileCompleteness } from '@/lib/governance';
import type { GuardianFlag } from '@/lib/types';

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
      return NextResponse.json({ error: 'Profile not found. Complete onboarding first.' }, { status: 404 });
    }

    const { data: assessment } = await supabaseServer
      .from('assessments')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found. Complete the assessment first.' }, { status: 404 });
    }

    // HUNT Step 1: Scout -> Pathfinder handoff validation
    const completeness = calculateProfileCompleteness(profile);
    const handoff1 = await validateHandoff('scout_to_pathfinder', profile, { confidence_score: 0.7 });
    if (handoff1.blocking_issues.length > 0) {
      return NextResponse.json({
        error: `Cannot proceed: ${handoff1.blocking_issues.join('; ')}`,
        governance_status: 'paused',
        handoff_validation: handoff1,
      }, { status: 409 });
    }

    // Run Scout Agent
    const scoutResult = await scoutAgent(profile, apiKey);

    // Run Pathfinder Agent
    const pathfinderResult = await pathfinderAgent(profile, assessment.responses, apiKey);
    const pathfinderFlags: GuardianFlag[] = (pathfinderResult as Record<string, unknown>)._flags as GuardianFlag[] || [];

    // Run Guardian Agent
    const guardianResult = await guardianAgent('career', pathfinderResult, profile, apiKey);
    const finalOutput = (guardianResult.modified_output || pathfinderResult) as typeof pathfinderResult;

    // Determine governance status
    const governanceStatus = guardianResult.approved ? 'approved' : (guardianResult.flags?.some((f: { severity: string }) => f.severity === 'critical') ? 'killed' : 'escalated');

    // Store recommendation
    const { data: recommendation, error } = await supabaseServer
      .from('career_recommendations')
      .insert({
        user_id,
        assessment_id: assessment.id,
        recommendations: finalOutput.top_pathways || [],
        top_pathways: finalOutput.top_pathways || [],
        required_education: finalOutput.required_education || [],
        required_skills: finalOutput.required_skills || [],
        estimated_demand: finalOutput.estimated_demand || {},
        recommended_institutions: finalOutput.recommended_institutions || [],
        recommended_certifications: finalOutput.recommended_certifications || [],
        confidence_score: finalOutput.confidence_score || 0,
        reasoning: finalOutput.reasoning || '',
        risks: finalOutput.risks || [],
        next_steps: finalOutput.next_steps || [],
        guardian_approved: guardianResult.approved,
        guardian_flags: [...(guardianResult.flags || []), ...pathfinderFlags],
        governance_status: governanceStatus,
        agent_trace: [],
      })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await logAudit({
      user_id,
      action: 'career_analysis_generated',
      resource_type: 'career_recommendation',
      resource_id: recommendation?.id,
      details: {
        confidence_score: finalOutput.confidence_score,
        guardian_approved: guardianResult.approved,
        governance_status: governanceStatus,
        profile_completeness: completeness,
        guardian_flags: guardianResult.flags?.length || 0,
      },
    });

    // Notify if escalated
    if (!guardianResult.approved) {
      await createNotification({
        user_id,
        target_role: 'counselor',
        type: 'escalation_required',
        title: 'Career recommendations require review',
        message: `Guardian Agent flagged ${guardianResult.flags?.length || 0} issues with career recommendations for ${profile.full_name}.`,
        agent: 'guardian',
        priority: 'critical',
        action_required: true,
        resource_type: 'career_recommendation',
        resource_id: recommendation?.id,
      });
    }

    return NextResponse.json({ data: recommendation, governance_status: governanceStatus });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
