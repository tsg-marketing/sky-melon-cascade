import { useState, useEffect } from 'react';

const API_URL = '/api/b24-send-lead.php';
const YM_COUNTER = 107258870;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

// ClientID Яндекс.Метрики текущего посетителя. Запрашиваем один раз при загрузке.
let yaClientId = '';

function requestYaClientId() {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ym = (window as any).ym;
  if (typeof ym !== 'function') return;
  try {
    ym(YM_COUNTER, 'getClientID', (clientID: string) => {
      if (clientID) yaClientId = String(clientID);
    });
  } catch (_e) {
    /* noop */
  }
}

// Резервный способ: ClientID хранится Метрикой в cookie _ym_uid.
function getYaClientIdFromCookie(): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(/(?:^|;\s*)_ym_uid=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

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

/**
 * Человекопонятное название страницы, с которой пришла заявка.
 * Уходит в CRM вместе с адресом страницы, чтобы менеджер сразу видел раздел.
 */
const PAGE_TITLES: Record<string, string> = {
  '/': 'Главная',
  '/massagers': 'Массажёры мяса',
  '/injector': 'Инъекторы',
  '/slicers': 'Слайсеры',
  '/ldogenerator': 'Льдогенераторы',
  '/volchki': 'Волчки (мясорубки промышленные)',
  '/blokorezki': 'Блокорезки',
  '/kotletnyy-avtomat': 'Котлетные автоматы',
  '/pelmennye-avtomaty': 'Пельменные автоматы',
  '/contacts': 'Контакты',
  '/cart': 'Корзина',
};

function getPageSource(): string {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const known = PAGE_TITLES[path];
  if (known) return known;

  // Карточка товара лендинга: /slicers/tovar → «Слайсеры — карточка товара».
  const parts = path.split('/').filter(Boolean);
  const parent = PAGE_TITLES[`/${parts[0]}`];
  if (parent) return `${parent} — карточка товара`;

  // Категории из фида (/kuttery): русское название берём из заголовка страницы.
  const fromTitle = (typeof document !== 'undefined' ? document.title : '')
    .split(/[|—–]|\s-\s/)[0]
    .trim()
    .slice(0, 80);
  if (fromTitle) return parts.length > 1 ? `${fromTitle} — карточка товара` : fromTitle;
  return path;
}

export interface LeadPayload {
  name: string;
  phone: string;
  email?: string;
  comment?: string;
  product?: string;
  topic?: string;
  quizAnswers?: Record<string, string>;
  formType: 'quiz' | 'compare' | 'contacts' | 'modal' | 'inquiry' | 'cart';
}

export function useLeadForm() {
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    saveUtmToCookies();
    requestYaClientId();
  }, []);

  async function sendLead(payload: LeadPayload) {
    if (sending) return;
    setSending(true);
    const utm = getUtmFromCookies();
    const body = {
      ...payload,
      yaClientId: yaClientId || getYaClientIdFromCookie(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      pageSource: getPageSource(),
      pageTitle: typeof document !== 'undefined' ? document.title : '',
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
    } finally {
      setSending(false);
    }

    setThankYouOpen(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { (window as any).ym?.(107258870, 'reachGoal', 'send_FOS'); } catch (_e) { /* noop */ }
  }

  return { sendLead, sending, thankYouOpen, setThankYouOpen };
}