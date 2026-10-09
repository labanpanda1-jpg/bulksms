import { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, Check, CheckCircle2, Cloud, CreditCard, LayoutDashboard, Send } from 'lucide-react';

const demoSteps = ['Sign in', 'Dashboard', 'Buy SMS', 'Send campaign'] as const;
const stepDurations = [2200, 3000, 3000, 4200];
const totalDuration = stepDurations.reduce((a, b) => a + b, 0);

export function ProductDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (let i = 0; i < stepDurations.length; i++) {
      timers.push(setTimeout(() => setStep(i), elapsed));
      elapsed += stepDurations[i];
    }
    timers.push(setTimeout(() => setStep(0), totalDuration));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <div className="absolute -inset-6 rounded-[2rem] bg-sky-300/20 blur-2xl" />
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="ml-3 flex-1 rounded-md bg-white border border-slate-200 px-3 py-1 text-[10px] text-slate-400">app.abancool.com</div>
        </div>
        <div className="flex h-[400px]">
          {step > 0 && (
            <div className="w-[120px] border-r border-slate-100 bg-[#07133f] p-3 flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-4 px-1">
                <Cloud className="w-4 h-4 text-sky-300" />
                <span className="text-[10px] font-bold text-white">ABANCOOL</span>
              </div>
              {[
                { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Dashboard', active: step === 1 },
                { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Buy SMS', active: step === 2 },
                { icon: <Send className="w-3.5 h-3.5" />, label: 'Send SMS', active: step === 3 },
                { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Reports', active: false },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium transition ${item.active ? 'bg-blue-600 text-white' : 'text-blue-200/60'}`}>
                  {item.icon}<span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {step === 0 && <DemoLogin />}
            {step === 1 && <DemoDashboard />}
            {step === 2 && <DemoBuySms />}
            {step === 3 && <DemoSendSms />}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {demoSteps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition ${i === step ? 'bg-white/20 text-white' : 'text-blue-200/50'}`}>
              <span className={`w-1.5 h-1.5 rounded-full transition ${i === step ? 'bg-sky-300' : 'bg-blue-200/30'}`} />
              {label}
            </div>
            {i < demoSteps.length - 1 && <span className="text-blue-200/30">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoLogin() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6 animate-[fade-in_.4s_ease-out]">
      <div className="w-full max-w-[200px]">
        <div className="mb-4 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Cloud className="w-5 h-5" /></div>
          <p className="text-sm font-black text-slate-900">ABANCOOL</p>
          <p className="text-[9px] text-slate-400">Sign in to your account</p>
        </div>
        <div className="space-y-2">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-400">biz@abancool.com</div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-400">••••••••</div>
          <div className="rounded-lg bg-blue-600 px-3 py-2 text-center text-[10px] font-bold text-white shadow-md">Sign in</div>
        </div>
      </div>
    </div>
  );
}

function DemoDashboard() {
  return (
    <div className="h-full overflow-hidden bg-slate-50 p-4 animate-[fade-in_.4s_ease-out]">
      <p className="text-xs font-bold text-slate-900 mb-3">Welcome back, Sarah</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg border border-slate-200 bg-white p-2.5">
          <p className="text-[8px] uppercase tracking-wide text-slate-400">SMS Balance</p>
          <p className="text-base font-black text-slate-900">1,250</p>
          <div className="mt-1 flex items-center gap-1 text-[8px] font-bold text-green-600"><ArrowRight className="w-2.5 h-2.5 rotate-[-45deg]" /> +500 today</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2.5">
          <p className="text-[8px] uppercase tracking-wide text-slate-400">Delivered</p>
          <p className="text-base font-black text-slate-900">98.4%</p>
          <div className="mt-1 flex items-center gap-1 text-[8px] font-bold text-blue-600"><CheckCircle2 className="w-2.5 h-2.5" /> this month</div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-[8px] uppercase tracking-wide text-slate-400 mb-2">Delivery trend</p>
        <div className="flex h-16 items-end gap-1.5">
          {[30, 55, 42, 68, 50, 75, 88].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-sky-300 transition-all duration-700" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoBuySms() {
  return (
    <div className="h-full overflow-hidden bg-slate-50 p-4 animate-[fade-in_.4s_ease-out]">
      <p className="text-xs font-bold text-slate-900 mb-3">Buy SMS Credits</p>
      <div className="space-y-2">
        {[
          { qty: '500', price: 'KES 400', featured: false },
          { qty: '1,000', price: 'KES 750', featured: true },
          { qty: '5,000', price: 'KES 3,500', featured: false },
        ].map((pkg) => (
          <div key={pkg.qty} className={`rounded-lg border p-2.5 flex items-center justify-between transition ${pkg.featured ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 bg-white'}`}>
            <div>
              <p className="text-xs font-black text-slate-900">{pkg.qty} SMS</p>
              <p className="text-[9px] text-slate-400">{pkg.price}</p>
            </div>
            {pkg.featured && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[8px] font-bold text-white">Selected</span>}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-2.5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div>
        <div>
          <p className="text-[10px] font-bold text-green-800">M-Pesa STK Push sent</p>
          <p className="text-[8px] text-green-600">Enter PIN on your phone to confirm</p>
        </div>
      </div>
      <div className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-center text-[10px] font-bold text-white shadow-md">Complete payment</div>
    </div>
  );
}

function DemoSendSms() {
  const [phase, setPhase] = useState<'compose' | 'sending' | 'done'>('compose');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('sending'), 1600);
    const t2 = setTimeout(() => setPhase('done'), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="h-full overflow-hidden bg-slate-50 p-4 animate-[fade-in_.4s_ease-out]">
      {phase === 'done' ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 animate-[fade-in_.4s_ease-out]">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-7 h-7 text-green-600" /></div>
          <p className="text-sm font-black text-slate-900">Campaign sent!</p>
          <div className="w-full space-y-1.5">
            <div className="rounded-lg border border-slate-200 bg-white p-2 flex items-center justify-between">
              <span className="text-[9px] text-slate-400">Recipients</span><span className="text-[10px] font-bold text-slate-900">1,247</span>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-2 flex items-center justify-between">
              <span className="text-[9px] text-green-600">Delivered</span><span className="text-[10px] font-bold text-green-700">1,227 (98.4%)</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2 flex items-center justify-between">
              <span className="text-[9px] text-slate-400">Credits used</span><span className="text-[10px] font-bold text-slate-900">1,247</span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs font-bold text-slate-900 mb-3">Send Bulk SMS</p>
          <div className="space-y-2">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-400">Sender: <span className="font-bold text-slate-700">ABANCOOL</span></div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 min-h-[52px]">
              <p className="text-[10px] leading-relaxed text-slate-700">Dear customer, your order #4821 is ready for pickup. Thank you for choosing us.</p>
              <p className="text-[8px] text-slate-400 mt-1">1 SMS part · 160 chars</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Recipients</span><span className="text-[10px] font-bold text-blue-600">1,247 contacts</span>
            </div>
            <div className={`rounded-lg px-3 py-2 text-center text-[10px] font-bold text-white shadow-md transition ${phase === 'sending' ? 'bg-amber-500' : 'bg-blue-600'}`}>
              {phase === 'sending' ? 'Sending…' : 'Send to 1,247 recipients'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
