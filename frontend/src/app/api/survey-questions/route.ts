import { NextResponse } from 'next/server';

// Provide a resilient API route for survey questions. When the backend
// is unavailable, return local sample questions so the UI remains usable.
export async function GET() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  // lazy-load sample questions to avoid increasing bundle size for normal runs
  const loadSamples = () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SAMPLE_SURVEY_QUESTIONS } = require('@/constants/sampleSurveyQuestions');
    return SAMPLE_SURVEY_QUESTIONS || [];
  };

  try {
    const res = await fetch(`${backendUrl}/api/survey-questions`);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let parsed: any = undefined;
      try { parsed = text ? JSON.parse(text) : undefined; } catch (e) { parsed = undefined; }
      console.warn('Backend returned non-OK status for survey-questions', res.status, parsed ?? text);
      // Fall back to local sample questions so the form remains functional
      return NextResponse.json({ questions: loadSamples(), source: 'fallback', warning: parsed?.error ?? text ?? `backend status ${res.status}` }, { status: 200 });
    }

    const dataText = await res.text().catch(() => '');
    try {
      const data = dataText ? JSON.parse(dataText) : { questions: [] };
      return NextResponse.json({ questions: data.questions || [], source: 'backend' }, { status: 200 });
    } catch (e) {
      console.warn('Failed to parse backend survey-questions JSON:', e);
      return NextResponse.json({ questions: loadSamples(), source: 'fallback', warning: 'parse_error' }, { status: 200 });
    }
  } catch (err: any) {
    console.error('Failed to fetch survey questions from backend:', err?.message || err);
    return NextResponse.json({ questions: loadSamples(), source: 'fallback', error: String(err?.message || err) }, { status: 200 });
  }
}
