/**
 * Swahili/English i18n for NuruPath AI
 * Mobile-first, low-bandwidth, simple language
 */

type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.assessment': 'Assessment',
    'nav.scholarships': 'Scholarships',
    'nav.skills': 'Skills Gap',
    'nav.action_plan': 'Action Plan',
    'nav.counselor': 'Counselor',
    'nav.profile': 'Profile',
    'nav.sign_in': 'Sign In',
    'nav.sign_out': 'Sign Out',
    'nav.get_started': 'Get Started',

    // Homepage
    'home.hero.title': 'Find Your Path.',
    'home.hero.subtitle': 'Shape Your Future.',
    'home.hero.description': 'NuruPath AI helps Kenyan students, TVET learners, and graduates discover personalized education-to-employment pathways based on your interests, strengths, and opportunities.',
    'home.hero.cta': 'Start Your Journey',
    'home.hero.learn_more': 'Learn More',
    'home.features.title': 'Your Complete Career Navigation Toolkit',
    'home.features.subtitle': 'From assessment to action, NuruPath AI provides everything you need to navigate your career journey with confidence.',
    'home.how_it_works': 'How NuruPath Works',
    'home.step1': 'Create Profile',
    'home.step2': 'Take Assessment',
    'home.step3': 'Get Recommendations',
    'home.step4': 'Take Action',
    'home.cta.title': 'Ready to Navigate Your Future?',
    'home.cta.subtitle': 'Join thousands of Kenyan youth discovering their path with AI-powered guidance.',

    // Auth
    'auth.welcome_back': 'Welcome Back',
    'auth.sign_in_desc': 'Sign in to your NuruPath AI account',
    'auth.create_account': 'Create Your Account',
    'auth.signup_desc': 'Start your career navigation journey',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.full_name': 'Full Name',
    'auth.signing_in': 'Signing in...',
    'auth.creating': 'Creating account...',

    // Onboarding
    'onboarding.title': 'Complete Your Profile',
    'onboarding.subtitle': 'Help us understand your background so we can guide your career journey',
    'onboarding.step1': 'Personal Info',
    'onboarding.step2': 'Education',
    'onboarding.step3': 'Interests & Skills',
    'onboarding.step4': 'Constraints',
    'onboarding.step5': 'Consent',
    'onboarding.county': 'County',
    'onboarding.education_level': 'Education Level',
    'onboarding.career_interests': 'Career Interests',
    'onboarding.skills': 'Current Skills',
    'onboarding.financial_constraints': 'Financial Constraints',
    'onboarding.consent_data': 'I consent to NuruPath AI collecting and processing my personal data for career guidance purposes, in compliance with the Kenya Data Protection Act.',
    'onboarding.consent_ai': 'I understand that career recommendations are AI-generated and should be reviewed with a qualified career counselor before making major decisions.',

    // Assessment
    'assessment.title': 'Discover Your Path',
    'assessment.subtitle': 'Answer these questions to help our AI find your best career matches',
    'assessment.progress': 'Question {n} of {total}',
    'assessment.multi_select': 'Select all that apply',
    'assessment.scale': 'Drag the slider',
    'assessment.single_select': 'Choose one option',
    'assessment.complete': 'Assessment Complete!',
    'assessment.complete_desc': 'Your responses have been recorded. Now let\'s generate your personalized career pathways.',

    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.subtitle': 'Your career navigation dashboard',
    'dashboard.profile_completion': 'Profile Completion',
    'dashboard.start_journey': 'Start Your Journey',
    'dashboard.start_desc': 'Complete your career assessment to unlock personalized recommendations, scholarship matches, and action plans.',
    'dashboard.take_assessment': 'Take Assessment',

    // Scholarships
    'scholarships.title': 'Scholarship Matcher',
    'scholarships.subtitle': 'Find funding opportunities matched to your profile',
    'scholarships.search': 'Find Your Scholarships',
    'scholarships.search_desc': 'Our AI will analyze your profile to find the best scholarship and funding opportunities for you.',
    'scholarships.search_btn': 'Search Scholarships',
    'scholarships.searching': 'Searching for scholarships...',

    // Skills
    'skills.title': 'Skills Gap Analysis',
    'skills.subtitle': 'Identify your skill gaps and get a personalized learning roadmap',
    'skills.start': 'Analyze Your Skills Gap',
    'skills.start_desc': 'Our AI will compare your current skills against your target career requirements and create a learning roadmap.',
    'skills.gaps': 'Skill Gaps',
    'skills.roadmap': 'Learning Roadmap',
    'skills.courses': 'Recommended Courses',

    // Action Plan
    'action_plan.title': 'Career Action Plan',
    'action_plan.subtitle': 'Your personalized 30-day, 90-day, and 1-year career roadmap',
    'action_plan.generate': 'Generate Your Action Plan',
    'action_plan.generate_desc': 'Our AI will create a structured career action plan with specific goals, actions, and milestones.',
    'action_plan.export_pdf': 'Export PDF',
    'action_plan.30days': '30 Days',
    'action_plan.90days': '90 Days',
    'action_plan.1year': '1 Year',

    // Governance
    'governance.guardian_approved': 'Guardian Approved',
    'governance.under_review': 'Under Review',
    'governance.confidence': 'Confidence',
    'governance.track_compliant': 'TRACK Compliant',
    'governance.oasis_compliant': 'OASIS Compliant',
    'governance.kill_switch': 'Processing Halted',
    'governance.kill_switch_desc': 'AI processing was paused for your safety. A counselor will review.',

    // Common
    'common.next': 'Next',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.refresh': 'Refresh',
    'common.close': 'Close',
  },
  sw: {
    // Navigation
    'nav.dashboard': 'Dashibodi',
    'nav.assessment': 'Tathmini',
    'nav.scholarships': 'Udhamini',
    'nav.skills': 'Ujuzi',
    'nav.action_plan': 'Mpango',
    'nav.counselor': 'Mshauri',
    'nav.profile': 'Wasifu',
    'nav.sign_in': 'Ingia',
    'nav.sign_out': 'Toka',
    'nav.get_started': 'Anza',

    // Homepage
    'home.hero.title': 'Pata Njia Yako.',
    'home.hero.subtitle': 'Jenga Mustakabali Wako.',
    'home.hero.description': 'NuruPath AI inawasaidia wanafunzi wa Kenya, wanafunzi wa TVET, na wahitimu kupata njia za elimu-kazi zinazolingana na maslahi, nguvu, na fursa zako.',
    'home.hero.cta': 'Anza Safari Yako',
    'home.hero.learn_more': 'Jifunze Zaidi',
    'home.features.title': 'Seti Yako Kamili ya Kuongoza Kazi',
    'home.features.subtitle': 'Kutoka tathmini hadi hatua, NuruPath AI inakupa kila unachohitaji kusafiri kazi yako kwa uhakika.',
    'home.how_it_works': 'Jinsi NuruPath Inavyofanya Kazi',
    'home.step1': 'Unda Wasifu',
    'home.step2': 'Fanya Tathmini',
    'home.step3': 'Pata Mapendekezo',
    'home.step4': 'Chukua Hatua',
    'home.cta.title': 'Uko Tayari Kuongoza Mustakabali Wako?',
    'home.cta.subtitle': 'Jiunge na vijana elfu nyingi za Kenya wanaogundua njia yao kwa msaada wa AI.',

    // Auth
    'auth.welcome_back': 'Karibu Tena',
    'auth.sign_in_desc': 'Ingia kwenye akaunti yako ya NuruPath AI',
    'auth.create_account': 'Unda Akaunti Yako',
    'auth.signup_desc': 'Anza safari yako ya kuongoza kazi',
    'auth.email': 'Barua pepe',
    'auth.password': 'Nenosiri',
    'auth.confirm_password': 'Thibitisha Nenosiri',
    'auth.full_name': 'Jina Kamili',
    'auth.signing_in': 'Inaingia...',
    'auth.creating': 'Inaunda akaunti...',

    // Onboarding
    'onboarding.title': 'Kamilisha Wasifu Wako',
    'onboarding.subtitle': 'Tusaidie kuelewa usuli wako ili tuweze kuongoza safari yako ya kazi',
    'onboarding.step1': 'Taarifa Za Kibinafsi',
    'onboarding.step2': 'Elimu',
    'onboarding.step3': 'Maslahi & Ujuzi',
    'onboarding.step4': 'Vikwazo',
    'onboarding.step5': 'Ridhaa',
    'onboarding.county': 'Kaunti',
    'onboarding.education_level': 'Kiwango Cha Elimu',
    'onboarding.career_interests': 'Maslahi Ya Kazi',
    'onboarding.skills': 'Ujuzi Wa Sasa',
    'onboarding.financial_constraints': 'Vikwazo Vya Kifedha',
    'onboarding.consent_data': 'Ninakubali NuruPath AI kukusanya na kusindika data yangu ya kibinafsi kwa madhumuni ya mwongozo wa kazi, kulingana na Sheria ya Kulinda Data ya Kenya.',
    'onboarding.consent_ai': 'Ninaelewa kuwa mapendekezo ya kazi yanatengenezwa na AI na yanapaswa kukaguliwa na mshauri wa kazi aliye na sifa kabla ya kufanya maamuzi makubwa.',

    // Assessment
    'assessment.title': 'Gundua Njia Yako',
    'assessment.subtitle': 'Jibu maswali haya kusaidia AI yetu kupata mechi bora ya kazi yako',
    'assessment.progress': 'Swali {n} kati ya {total}',
    'assessment.multi_select': 'Chagua yote yanayofaa',
    'assessment.scale': 'Vuta kiteuzi',
    'assessment.single_select': 'Chagua chaguo moja',
    'assessment.complete': 'Tathmini Imekamilika!',
    'assessment.complete_desc': 'Majibu yako yamerekodiwa. Sasa tuunde njia za kazi zinazokufaa.',

    // Dashboard
    'dashboard.welcome': 'Karibu',
    'dashboard.subtitle': 'Dashibodi yako ya kuongoza kazi',
    'dashboard.profile_completion': 'Ukamilifu Wa Wasifu',
    'dashboard.start_journey': 'Anza Safari Yako',
    'dashboard.start_desc': 'Kamilisha tathmini yako ya kazi kufungua mapendekezo ya kibinafsi, mechi za udhamini, na mipango ya hatua.',
    'dashboard.take_assessment': 'Fanya Tathmini',

    // Scholarships
    'scholarships.title': 'Kimecha cha Udhamini',
    'scholarships.subtitle': 'Pata fursa za ufadhili zinazolingana na wasifu wako',
    'scholarships.search': 'Pata Udhamini Wako',
    'scholarships.search_desc': 'AI yetu itachambua wasifu wako kupata fursa bora za udhamini na ufadhili.',
    'scholarships.search_btn': 'Tafuta Udhamini',
    'scholarships.searching': 'Inatafuta udhamini...',

    // Skills
    'skills.title': 'Uchambuzi Wa Pengo La Ujuzi',
    'skills.subtitle': 'Tambua mapengo ya ujuzi wako na upate ramani ya kujifunza iliyobinafsishwa',
    'skills.start': 'Chambua Pengo La Ujuzi Wako',
    'skills.start_desc': 'AI yetu italinganisha ujuzi wako wa sasa na mahitaji ya kazi unayolenga na kuunda ramani ya kujifunza.',
    'skills.gaps': 'Mapengo Ya Ujuzi',
    'skills.roadmap': 'Ramani Ya Kujifunza',
    'skills.courses': 'Kozi Zilizopendekezwa',

    // Action Plan
    'action_plan.title': 'Mpango Wa Hatua Wa Kazi',
    'action_plan.subtitle': 'Ramani yako ya kazi ya siku 30, siku 90, na mwaka 1 iliyobinafsishwa',
    'action_plan.generate': 'Tengeneza Mpango Wako Wa Hatua',
    'action_plan.generate_desc': 'AI yetu itaunda mpango wa kazi uliopangwa wenye malengo, hatua, na viashiria mahususi.',
    'action_plan.export_pdf': 'Hamisha PDF',
    'action_plan.30days': 'Siku 30',
    'action_plan.90days': 'Siku 90',
    'action_plan.1year': 'Mwaka 1',

    // Governance
    'governance.guardian_approved': 'Imeidhinishwa na Mlinzi',
    'governance.under_review': 'Inakaguliwa',
    'governance.confidence': 'Uhakika',
    'governance.track_compliant': 'Inazingatia TRACK',
    'governance.oasis_compliant': 'Inazingatia OASIS',
    'governance.kill_switch': 'Usindikaji Umesimama',
    'governance.kill_switch_desc': 'Usindikaji wa AI ulisimama kwa usalama wako. Mshauri atakagua.',

    // Common
    'common.next': 'Mbele',
    'common.back': 'Nyuma',
    'common.save': 'Hifadhi',
    'common.cancel': 'Ghairi',
    'common.loading': 'Inapakia...',
    'common.refresh': 'Onyesha upya',
    'common.close': 'Funga',
  },
} as const;

export type Locale = 'en' | 'sw';

export function t(key: TranslationKey, locale: Locale = 'en', vars?: Record<string, string | number>): string {
  let text: string = (translations[locale]?.[key] || translations.en[key] || key) as string;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}

export function getLocale(profile: { language_preference?: string } | null): Locale {
  if (profile?.language_preference === 'sw') return 'sw';
  return 'en';
}
