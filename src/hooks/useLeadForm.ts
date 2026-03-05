import { useState, useEffect } from 'react';

const API_URL = '/api/b24-send-lead.php';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function saveUtmToCookies() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  const expStr = expires.toUTCString();
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      document.cookie = `${key}=${encodeURIComponent(value)};expires=${expStr};path=/`;
    }
  });
}

function getUtmFromCookies(): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof document === 'undefined') return result;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (UTM_KEYS.includes(key)) result[key] = decodeURIComponent(value || '');
  }
  return result;
}

export interface LeadPayload {
  name: string;
  phone: string;
  email?: string;
  comment?: string;
  product?: string;
  quizAnswers?: Record<string, string>;
  formType: 'quiz' | 'compare' | 'contacts' | 'modal' | 'inquiry';
}

export function useLeadForm() {
  const [thankYouOpen, setThankYouOpen] = useState(false);

  useEffect(() => {
    saveUtmToCookies();
  }, []);

  async function sendLead(payload: LeadPayload) {
    const utm = getUtmFromCookies();
    const body = {
      ...payload,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      utmSource: utm['utm_source'] || '',
      utmMedium: utm['utm_medium'] || '',
      utmCampaign: utm['utm_campaign'] || '',
      utmContent: utm['utm_content'] || '',
      utmTerm: utm['utm_term'] || '',
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (_e) {
      // игнорируем ошибки сети — форма показывает спасибо в любом случае
    }

    setThankYouOpen(true);
  }

  return { sendLead, thankYouOpen, setThankYouOpen };
}
