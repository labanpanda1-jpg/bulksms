import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Check, CheckCircle2, ChevronDown, Cloud, CreditCard, FileText, LayoutDashboard, Mail, MessageSquare, Phone, Send, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { CookieBanner } from '@/components/CookieBanner';

const featureImages = {
  sms: 'https://images.pexels.com/photos/6214968/pexels-photo-6214968.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  sender: 'https://images.pexels.com/photos/5387173/pexels-photo-5387173.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  payments: 'https://images.pexels.com/photos/6248950/pexels-photo-6248950.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

const posts = [
  { category: 'Product updates', title: 'Why every Kenyan business needs a reliable SMS channel', date: '09 Oct 2026', excerpt: 'Turn important customer moments into conversations with simple, trackable bulk messaging.', published: true },
  { category: 'Guides', title: 'How to choose a memorable sender ID', date: '02 Oct 2026', excerpt: 'A practical guide to building recognition and trust across Safaricom, Airtel and Telkom.', published: true },
  { category: 'Business growth', title: 'Five campaigns you can automate this week', date: '25 Sep 2026', excerpt: 'Welcome messages, reminders, offers and delivery updates that keep customers close.', published: true },
];

const demoSteps = ['Sign in', 'Dashboard', 'Buy SMS', 'Send campaign'] as const;
const stepDurations = [2200, 3000, 3000, 4200];
const totalDuration = stepDurations.reduce((a, b) => a + b, 0);

function ProductDemo() {
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

export function PublicLandingPage() {
  const [faq, setFaq] = useState<number | null>(0);
  const [publishedPosts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('abancool_content') || 'null') as typeof posts | null;
      return saved?.filter(post => post.published) || posts;
    } catch {
      return posts;
    }
  });
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="bg-[#07133f] text-white text-xs py-2"><div className="max-w-7xl mx-auto px-5 flex justify-between"><span>Garissa, Kenya — serving businesses across Africa</span><span className="hidden sm:block">Sales: 0724 147 910 · Support: 0111 679 286</span></div></div>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100"><div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Cloud className="w-6 h-6" /></span><span className="text-xl font-extrabold tracking-tight">ABANCOOL</span></Link>
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600"><a href="#solutions">Solutions</a><a href="#pricing">Pricing</a><a href="#stories">News</a><a href="#faq">FAQ</a></nav>
        <div className="flex items-center gap-3"><Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-blue-600">Client Area</Link><Link to="/register" className="rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition">Start free</Link></div>
      </div></header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-[#071b8d] via-[#123fe2] to-[#1559ff] text-white"><div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} /><div className="relative max-w-7xl mx-auto px-5 py-24 lg:py-32 grid lg:grid-cols-[1.1fr_.9fr] gap-14 items-center">
          <div><p className="uppercase tracking-[.28em] text-xs font-bold text-blue-100">Bulk SMS · Payments · Digital services</p><h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl font-black leading-[.98] tracking-tight">Reach people.<br /><span className="text-sky-200">Grow boldly.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-blue-100">Professional bulk SMS for Kenyan businesses, with M-Pesa payments, branded sender IDs and delivery reports that keep every message accountable.</p><div className="mt-9 flex flex-wrap gap-3"><Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-blue-700 hover:bg-blue-50 transition">Create your account <ArrowRight className="w-4 h-4" /></Link><a href="#solutions" className="inline-flex items-center rounded-full border border-white/30 px-6 py-3.5 font-bold text-white hover:bg-white/10 transition">Explore solutions</a></div><div className="mt-10 flex flex-wrap gap-6 text-sm text-blue-100"><span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-200" /> 5 free SMS to start</span><span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-200" /> Local M-Pesa checkout</span><span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-200" /> Real-time delivery reports</span></div></div>
          <div className="relative flex flex-col items-center gap-6"><ProductDemo /><div className="flex items-center gap-4 text-xs text-blue-100"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> live demo</span><span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-sky-200" /> delivery confirmed</span></div></div>
        </div></section>

        <section id="solutions" className="max-w-7xl mx-auto px-5 py-24"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">Everything in one place</p><h2 className="mt-3 text-4xl font-black tracking-tight">Tools that move your business forward.</h2><p className="mt-4 text-slate-500 leading-7">From your first welcome message to your thousandth order, ABANCOOL helps you communicate with confidence.</p></div><div className="mt-12 grid md:grid-cols-3 gap-5"><Feature image={featureImages.sms} icon={<MessageSquare />} title="Bulk SMS" text="Send targeted campaigns, schedule reminders and track delivery in real time." /><Feature image={featureImages.sender} icon={<Sparkles />} title="Sender ID marketplace" text="Apply for a professional branded sender ID across Safaricom, Airtel and Telkom." /><Feature image={featureImages.payments} icon={<Zap />} title="M-Pesa payments" text="Collect payments through secure Daraja STK Push and receive instant receipts." /></div></section>

        <section id="pricing" className="bg-slate-50 border-y border-slate-100"><div className="max-w-7xl mx-auto px-5 py-24 grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-center"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">Sender ID marketplace</p><h2 className="mt-3 text-4xl font-black tracking-tight">Be remembered in every inbox.</h2><p className="mt-5 text-slate-500 leading-7">Reserve your business name for just <strong className="text-slate-900">KES 7,500</strong> per network. Submit your KRA PIN and business registration certificate, then our team reviews your request within 48 hours.</p><Link to="/register" className="mt-7 inline-flex items-center gap-2 font-bold text-blue-600">Apply for a sender ID <ArrowRight className="w-4 h-4" /></Link></div><div className="grid sm:grid-cols-3 gap-4"><Network name="Safaricom" price="7,500" color="bg-sky-500" /><Network name="Airtel" price="7,500" color="bg-red-500" /><Network name="Telkom" price="7,500" color="bg-orange-500" /></div></div></section>

        <section id="stories" className="max-w-7xl mx-auto px-5 py-24"><div className="flex items-end justify-between gap-5"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">From the newsroom</p><h2 className="mt-3 text-4xl font-black tracking-tight">Ideas for growing smarter.</h2></div><a href="#stories" className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-600">View all news <ArrowRight className="w-4 h-4" /></a></div><div className="mt-10 grid md:grid-cols-3 gap-6">{publishedPosts.map(post => <article key={post.title} className="group rounded-2xl border border-slate-200 p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100 transition"><div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div><p className="mt-8 text-xs font-bold uppercase tracking-widest text-blue-600">{post.category}</p><h3 className="mt-3 text-xl font-black leading-snug group-hover:text-blue-600">{post.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{post.excerpt}</p><p className="mt-6 text-xs font-semibold text-slate-400">{post.date}</p></article>)}</div></section>

        <section id="faq" className="bg-[#07133f] text-white"><div className="max-w-4xl mx-auto px-5 py-24"><p className="text-sm font-bold uppercase tracking-[.2em] text-sky-300">Questions, answered</p><h2 className="mt-3 text-4xl font-black">Make the next message count.</h2><div className="mt-10 divide-y divide-white/15">{['How soon can I start sending SMS?', 'What documents do I need for a sender ID?', 'How does M-Pesa STK Push work?'].map((question, index) => <div key={question} className="py-5"><button className="w-full flex items-center justify-between text-left font-bold" onClick={() => setFaq(faq === index ? null : index)}>{question}<ChevronDown className={`w-5 h-5 transition ${faq === index ? 'rotate-180 text-sky-300' : ''}`} /></button>{faq === index && <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">Create an account, choose a package and complete your checkout. Sender ID applications need your KRA PIN certificate, business registration certificate and an 11-character name.</p>}</div>)}</div></div></section>
      </main>
      <footer className="bg-[#050d2c] text-blue-100"><div className="max-w-7xl mx-auto px-5 py-10 flex flex-col md:flex-row justify-between gap-6 text-sm"><div><div className="flex items-center gap-2 font-black text-white"><Cloud className="w-5 h-5 text-sky-300" /> ABANCOOL</div><p className="mt-3 text-blue-300">Communications that grow with you.</p></div><div className="flex flex-wrap gap-5"><span className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@abancool.com</span><span className="flex items-center gap-2"><Phone className="w-4 h-4" /> 0111 679 286</span><span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure payments</span></div></div></footer>
      <CookieBanner />
    </div>
  );
}

function Feature({ image, icon, title, text }: { image: string; icon: React.ReactNode; title: string; text: string }) { return <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition"><div className="relative h-40 overflow-hidden"><img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#07133f]/70 to-transparent" /><div className="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">{icon}</div></div><div className="p-7"><h3 className="text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{text}</p></div></div>; }
function Network({ name, price, color }: { name: string; price: string; color: string }) { return <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200"><div className={`w-10 h-10 rounded-xl ${color} mb-8`} /><p className="font-black">{name}</p><p className="mt-2 text-2xl font-black">KES {price}</p><p className="mt-1 text-xs text-slate-400">one-time application</p><Link to="/login" className="mt-6 block text-sm font-bold text-blue-600">Apply now <ArrowRight className="inline w-4 h-4" /></Link></div>; }
