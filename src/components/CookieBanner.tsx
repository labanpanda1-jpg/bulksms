import { useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const COOKIE_KEY = 'abancool_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(() => localStorage.getItem(COOKIE_KEY) !== 'accepted');
  if (!visible) return null;
  const accept = () => { localStorage.setItem(COOKIE_KEY, 'accepted'); setVisible(false); };
  return <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/15"><div className="flex items-start gap-4"><div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Cookie className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="text-sm font-bold text-slate-900">We use cookies responsibly</h2><button onClick={accept} aria-label="Close cookie notice" className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button></div><p className="mt-1 text-xs leading-5 text-slate-500">ABANCOOL uses essential cookies to keep the website secure and remember your preferences. By continuing, you agree to this use.</p><Button size="sm" className="mt-3" onClick={accept}>Accept cookies</Button></div></div></div>;
}
