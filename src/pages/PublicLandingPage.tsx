import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, ChevronDown, Cloud, FileText, Mail, MessageSquare, Phone, ShieldCheck, Sparkles, Zap } from 'lucide-react';
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

const fullMessage = 'Your appointment is confirmed for tomorrow at 10:00 AM. Reply YES to confirm.';

function AnimatedPhone() {
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'typing' | 'sent' | 'delivered'>('typing');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let i = 0;
    setTyped('');
    setPhase('typing');

    const tick = () => {
      i++;
      setTyped(fullMessage.slice(0, i));
      if (i < fullMessage.length) {
        timer.current = setTimeout(tick, 45);
      } else {
        timer.current = setTimeout(() => setPhase('sent'), 600);
      }
    };
    tick();

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    if (phase !== 'sent') return;
    const t = setTimeout(() => setPhase('delivered'), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'delivered') return;
    const t = setTimeout(() => {
      setTyped('');
      setPhase('typing');
      let i = 0;
      const tick = () => {
        i++;
        setTyped(fullMessage.slice(0, i));
        if (i < fullMessage.length) {
          timer.current = setTimeout(tick, 45);
        } else {
          timer.current = setTimeout(() => setPhase('sent'), 600);
        }
      };
      tick();
    }, 2800);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="relative mx-auto w-[270px]">
      <div className="absolute -inset-6 rounded-[3rem] bg-sky-300/20 blur-2xl" />
      <div className="relative rounded-[2.5rem] border-[6px] border-slate-800 bg-slate-900 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-28 rounded-b-2xl bg-slate-800 z-10" />
        <div className="rounded-[2rem] overflow-hidden bg-gradient-to-b from-blue-50 to-white h-[480px] flex flex-col">
          <div className="bg-[#07133f] text-white px-4 py-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black">AB</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">ABANCOOL</p>
              <p className="text-[9px] text-blue-200">Sender ID</p>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${phase === 'delivered' ? 'bg-green-500/30 text-green-300' : 'bg-blue-500/30 text-blue-200'}`}>
              {phase === 'typing' ? 'drafting' : phase === 'sent' ? 'sending' : 'delivered'}
            </span>
          </div>
          <div className="flex-1 px-4 py-5 space-y-3 overflow-hidden">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 text-white px-3.5 py-2.5 shadow-md">
                <p className="text-[11px] leading-relaxed min-h-[2.5rem]">
                  {typed}
                  {phase === 'typing' && <span className="inline-block w-0.5 h-3.5 bg-white ml-0.5 animate-pulse align-middle" />}
                </p>
                {phase !== 'typing' && (
                  <p className="text-[8px] text-blue-200 mt-1 text-right flex items-center justify-end gap-1">
                    {phase === 'delivered' && <CheckCheck />}
                    {phase === 'sent' ? 'sending…' : 'delivered'}
                  </p>
                )}
              </div>
            </div>
            {phase === 'delivered' && (
              <div className="flex justify-start animate-[fade-in_.4s_ease-out]">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-3.5 py-2.5 shadow-sm">
                  <p className="text-[11px] leading-relaxed text-slate-700">YES</p>
                  <p className="text-[8px] text-slate-400 mt-1">customer reply</p>
                </div>
              </div>
            )}
          </div>
          <div className="px-4 pb-5">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
              <div className="flex-1 text-[10px] text-slate-400">{phase === 'typing' ? 'typing message…' : 'message sent'}</div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition ${phase === 'typing' ? 'bg-slate-300' : 'bg-blue-600'}`}>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCheck() {
  return <span className="inline-flex items-center"><Check className="w-2.5 h-2.5" /><Check className="w-2.5 h-2.5 -ml-1.5" /></span>;
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
          <div className="relative flex flex-col items-center gap-6"><AnimatedPhone /><div className="flex items-center gap-4 text-xs text-blue-100"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> live demo</span><span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-sky-200" /> delivery confirmed</span></div></div>
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
