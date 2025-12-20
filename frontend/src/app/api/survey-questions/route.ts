import { NextResponse } from 'next/server';


export async function GET() {
  // Proxy to backend Express API
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${backendUrl}/api/survey-questions`);
    if (!res.ok) {
      console.error('Backend returned non-OK status', res.status);
      return NextResponse.json({ questions: [] }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({ questions: data.questions || [] }, { status: 200 });
  } catch (err: any) {
    // Handle connection errors (e.g., backend not running)
    console.error('Failed to fetch survey questions from backend:', err?.message || err);
    return NextResponse.json({ questions: [] , error: String(err?.message || err) }, { status: 502 });
  }
}
