import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const [profileRes, assessmentRes, careerRes, scholarshipRes, skillsRes, planRes, notesRes, notificationsRes] = await Promise.all([
      supabaseServer.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabaseServer.from('assessments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseServer.from('career_recommendations').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseServer.from('scholarship_matches').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseServer.from('skills_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseServer.from('action_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseServer.from('counselor_notes').select('*').eq('student_id', userId).order('created_at', { ascending: false }).limit(10),
      supabaseServer.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    ]);

    return NextResponse.json({
      data: {
        profile: profileRes.data,
        latestAssessment: assessmentRes.data,
        careerRecommendation: careerRes.data,
        scholarshipMatch: scholarshipRes.data,
        skillsReport: skillsRes.data,
        actionPlan: planRes.data,
        counselorNotes: notesRes.data || [],
        notifications: notificationsRes.data || [],
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
