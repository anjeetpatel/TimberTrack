
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  useEffect(() => {
    // Set dark mode off for landing specifically
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="bg-surface font-inter">
      
{/*  TopNavBar  */}
<header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm dark:shadow-none">
<nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
<div className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">TimberTrack</div>
<div className="hidden md:flex items-center gap-8 font-inter tracking-tight font-medium text-sm">
<a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" >Features</a>
<a href="#pricing" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" >Pricing</a>
<a href="#contact" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" >Contact</a>
</div>
<div className="flex items-center gap-4">
<Link to="/login" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out hover:scale-[1.02] shadow-lg shadow-primary/20">
                    Get Started
                </Link>
</div>
</nav>
</header>
{/*  Hero Section  */}
<section className="pt-32 pb-20 px-6 overflow-hidden">
<div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
<div className="space-y-8">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-bold tracking-widest uppercase">
<span className="material-symbols-outlined text-[14px]">bolt</span> New Release 2.0
                </div>
<h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface leading-[1.1]">
                    Manage Your Rental Business <span className="text-primary">Without Pen &amp; Paper</span>
</h1>
<p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
                    Track inventory, rentals, returns, and payments — all in one simple system designed for industrial speed.
                </p>
<div className="flex flex-wrap gap-4 pt-4">
<Link to="/login" className="inline-block bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl text-lg font-bold transition-all hover:shadow-2xl hover:scale-[1.02]">
                        Start Free
                    </Link>
</div>
</div>
<div className="relative group">
<div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>
<div className="relative bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden transform rotate-2 group-hover:rotate-0 transition-transform duration-700">
<img className="w-full h-auto" data-alt="Modern SaaS dashboard interface showing colorful charts, inventory lists, and financial analytics on a clean white background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbWnq-sXepk2J5WN_X0Gsz9HppWJPaRqTQ_nk1Gr434r_T2GteNeaEh0_cFSBc-e-SGCGUgq7ReUqYNsTHgMEsRlni8Sd3To5CPxKVW4ev7u1NIdg549yZ_Jfmpd9tB6MTOhODBh696H1LmjgJ_bzGHSci1-xFwrsPu4miAG-3TyHRdRU-OT1O5gycgyFJGY5792K3aWEJjifi1JCia6LNCyYU7VlmR83YJxyyJCsUkDOva_WuCkvzfPc79nSkgpen9cdoFM4uWWs" />
{/*  Decorative HUD elements  */}
<div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur p-4 rounded-xl shadow-xl border border-outline-variant/10">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span className="material-symbols-outlined">trending_up</span>
</div>
<div>
<div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Revenue</div>
<div className="text-lg font-black">$42,850.00</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  Problem Section  */}
<section className="py-24 bg-surface-container-low px-6">
<div className="max-w-7xl mx-auto">
<div className="text-center mb-20">
<h2 className="text-4xl font-black tracking-tighter text-on-surface mb-6">The Way You Manage Rentals Today Is Broken</h2>
<div className="w-24 h-1.5 bg-tertiary mx-auto rounded-full"></div>
</div>
<div className="grid md:grid-cols-4 gap-8">
<div className="bg-surface-container-lowest p-8 rounded-xl space-y-4">
<span className="material-symbols-outlined text-tertiary text-4xl">book</span>
<h3 className="text-xl font-bold">Manual notebooks</h3>
<p className="text-on-surface-variant text-sm">Illegible handwriting and torn pages shouldn't be your database.</p>
</div>
<div className="bg-surface-container-lowest p-8 rounded-xl space-y-4">
<span className="material-symbols-outlined text-tertiary text-4xl">inventory_2</span>
<h3 className="text-xl font-bold">Lost items</h3>
<p className="text-on-surface-variant text-sm">Where is that generator? No one knows until it's too late.</p>
</div>
<div className="bg-surface-container-lowest p-8 rounded-xl space-y-4">
<span className="material-symbols-outlined text-tertiary text-4xl">calculate</span>
<h3 className="text-xl font-bold">Confusing math</h3>
<p className="text-on-surface-variant text-sm">Prorated returns shouldn't require a math degree and a calculator.</p>
</div>
<div className="bg-surface-container-lowest p-8 rounded-xl space-y-4">
<span className="material-symbols-outlined text-tertiary text-4xl">error</span>
<h3 className="text-xl font-bold">Payment issues</h3>
<p className="text-on-surface-variant text-sm">Outstanding balances forgotten because they weren't highlighted.</p>
</div>
</div>
</div>
</section>
{/*  Solution Section  */}
<section className="py-24 px-6 overflow-hidden">
<div className="max-w-7xl mx-auto bg-surface-container-lowest rounded-[3rem] p-12 md:p-20 relative flex flex-col md:flex-row items-center gap-16">
<div className="flex-1 space-y-6">
<h2 className="text-4xl font-black tracking-tighter">Introducing TimberTrack</h2>
<p className="text-lg text-on-surface-variant">We've built a bridge from chaotic paperwork to digital precision. Every piece of equipment, every customer signature, and every cent is now exactly where it belongs.</p>
<ul className="space-y-4">
<li className="flex items-center gap-3 font-semibold">
<span className="material-symbols-outlined text-primary" data-weight="fill">check_circle</span> Instant Inventory Visibility
                    </li>
<li className="flex items-center gap-3 font-semibold">
<span className="material-symbols-outlined text-primary" data-weight="fill">check_circle</span> One-Click Rental Agreements
                    </li>
<li className="flex items-center gap-3 font-semibold">
<span className="material-symbols-outlined text-primary" data-weight="fill">check_circle</span> Real-time Cashflow Monitoring
                    </li>
</ul>
</div>
<div className="flex-1 relative">
<img className="rounded-xl shadow-xl transform -rotate-3" data-alt="Person working on a sleek modern laptop in a bright professional workspace with architectural blueprints nearby" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlaCPn9oB0OUAvDyJdyPIYWolaJ-YJLQ0jG-P6cmmqEs-efkUP4xZQ_5S7J3ZmeIXSf1zePg_8ee7zwKAPeK5e_SP0Pl9CQh-HtciCmURJiJU879dDyIABF8zGQYGdsUH_NTneul2NVVF_zSWAmMJnZ4J28JVJQRYmU8C-GSuTlzDqcpO65zPYE4vVQPrvTQNEXyDDR_sEvgnjx7UcCrjO4dQGLLmxUaiIrmY5fyT6-ZDKhJzSGURgh_dzyz0VZWOfFhmV0KpoiZA" />
<div className="absolute -bottom-6 -left-6 bg-primary p-6 rounded-xl text-on-primary shadow-xl">
<div className="text-3xl font-black">99.9%</div>
<div className="text-xs font-bold uppercase tracking-widest opacity-80">Accuracy Guaranteed</div>
</div>
</div>
</div>
</section>
{/*  Features Bento Grid  */}
<section id="features" className="py-24 px-6 bg-surface-container-low">
<div className="max-w-7xl mx-auto">
<div className="text-center mb-16 space-y-4">
<h2 className="text-4xl font-black tracking-tighter">Built for Industrial Strength</h2>
<p className="text-on-surface-variant max-w-2xl mx-auto">Every feature is engineered to handle the rough-and-tumble of construction material rentals.</p>
</div>
<div className="grid md:grid-cols-12 gap-6">
<div className="md:col-span-8 bg-surface-container-lowest p-10 rounded-xl space-y-4 flex flex-col justify-end min-h-[300px]">
<span className="material-symbols-outlined text-primary text-5xl">warehouse</span>
<h3 className="text-2xl font-black">Inventory Management</h3>
<p className="text-on-surface-variant">Real-time tracking of assets across multiple locations. Know exactly what's in stock, what's out, and what needs maintenance.</p>
</div>
<div className="md:col-span-4 bg-surface-container-lowest p-10 rounded-xl space-y-4">
<span className="material-symbols-outlined text-primary text-5xl">history_edu</span>
<h3 className="text-2xl font-black">Rental Tracking</h3>
<p className="text-on-surface-variant">Log start dates, expected returns, and customer details in seconds.</p>
</div>
<div className="md:col-span-4 bg-surface-container-lowest p-10 rounded-xl space-y-4">
<span className="material-symbols-outlined text-primary text-5xl">keyboard_return</span>
<h3 className="text-2xl font-black">Partial Returns</h3>
<p className="text-on-surface-variant">Handle complex returns where only half the order comes back. Math included.</p>
</div>
<div className="md:col-span-8 bg-surface-container-lowest p-10 rounded-xl space-y-4 flex flex-col justify-end min-h-[300px]">
<span className="material-symbols-outlined text-primary text-5xl">receipt_long</span>
<h3 className="text-2xl font-black">Smart Billing &amp; Payments</h3>
<p className="text-on-surface-variant">Generate professional invoices and track payments automatically. Receive alerts for overdue balances to keep your cash flow healthy.</p>
</div>
</div>
</div>
</section>
{/*  AI Feature Highlight  */}
<section className="py-24 px-6">
<div className="max-w-7xl mx-auto bg-gradient-to-br from-primary to-primary-container rounded-[3rem] overflow-hidden flex flex-col lg:flex-row">
<div className="lg:w-1/2 p-12 md:p-20 space-y-6 text-on-primary">
<div className="inline-block px-4 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">Exclusive AI Feature</div>
<h2 className="text-4xl md:text-5xl font-black tracking-tighter">Smart Billing Powered by AI</h2>
<p className="text-lg opacity-90">Our AI analyzes rental duration and returns to draft the perfect summary for your customers. Send professional WhatsApp updates in one tap.</p>
<div className="pt-8">
<Link to="/login" className="inline-block bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-black hover:scale-105 transition-transform">Explore AI Billing</Link>
</div>
</div>
<div className="lg:w-1/2 bg-on-primary-fixed/10 backdrop-blur p-8 md:p-16 flex items-center justify-center">
<div className="bg-surface-container-lowest w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4 border border-white/20">
<div className="flex items-center gap-3 pb-4 border-b border-surface-container-low">
<div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
<span className="material-symbols-outlined">chat</span>
</div>
<div className="text-sm font-bold text-on-surface">WhatsApp Summary Draft</div>
</div>
<div className="bg-green-50 p-4 rounded-lg text-sm text-on-surface-variant leading-relaxed">
                        "Hi James! Your rental of <span className="font-bold text-on-surface">50x Scaffolding Units</span> has been partially returned. Current balance: <span className="font-bold text-primary">$1,200.00</span>. View your full invoice here: tt.co/inv-882"
                    </div>
<div className="flex justify-end pt-2">
<button className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                            Send via WhatsApp <span className="material-symbols-outlined text-xs">send</span>
</button>
</div>
</div>
</div>
</div>
</section>
{/*  How It Works  */}
<section className="py-24 px-6 bg-surface">
<div className="max-w-4xl mx-auto">
<div className="text-center mb-16">
<h2 className="text-4xl font-black tracking-tighter">How It Works</h2>
</div>
<div className="space-y-12 relative">
<div className="absolute left-6 top-8 bottom-8 w-1 bg-surface-container-highest"></div>
<div className="relative flex gap-12 group">
<div className="w-12 h-12 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-on-primary font-black z-10 shadow-lg shadow-primary/40 group-hover:scale-110 transition-transform">1</div>
<div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm flex-grow">
<h3 className="text-xl font-bold mb-2">Add Inventory</h3>
<p className="text-on-surface-variant">Upload your catalog with photos, SKU numbers, and rental rates. Organize everything by category.</p>
</div>
</div>
<div className="relative flex gap-12 group">
<div className="w-12 h-12 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center text-on-surface font-black z-10 group-hover:bg-primary group-hover:text-on-primary transition-all">2</div>
<div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm flex-grow">
<h3 className="text-xl font-bold mb-2">Create Rental</h3>
<p className="text-on-surface-variant">Select items, pick a customer, and set the duration. TimberTrack handles the contracts and digital signatures.</p>
</div>
</div>
<div className="relative flex gap-12 group">
<div className="w-12 h-12 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center text-on-surface font-black z-10 group-hover:bg-primary group-hover:text-on-primary transition-all">3</div>
<div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm flex-grow">
<h3 className="text-xl font-bold mb-2">Track Returns &amp; Payments</h3>
<p className="text-on-surface-variant">Log returns as they come in. Our system calculates the final bill and tracks the payment status automatically.</p>
</div>
</div>
</div>
</div>
</section>
{/*  Benefits Section  */}
<section className="py-24 px-6 bg-surface-container-low">
<div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
<div className="text-center space-y-4 p-6">
<div className="w-16 h-16 bg-primary-fixed mx-auto rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">schedule</span>
</div>
<h3 className="text-xl font-bold">Save time</h3>
<p className="text-sm text-on-surface-variant">Reduce administrative overhead by 40% with automated workflows.</p>
</div>
<div className="text-center space-y-4 p-6">
<div className="w-16 h-16 bg-primary-fixed mx-auto rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">safety_check</span>
</div>
<h3 className="text-xl font-bold">Reduce losses</h3>
<p className="text-sm text-on-surface-variant">Never lose an item again with real-time location and status tracking.</p>
</div>
<div className="text-center space-y-4 p-6">
<div className="w-16 h-16 bg-primary-fixed mx-auto rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">payments</span>
</div>
<h3 className="text-xl font-bold">Improve cash flow</h3>
<p className="text-sm text-on-surface-variant">Faster billing and overdue reminders mean you get paid on time, every time.</p>
</div>
<div className="text-center space-y-4 p-6">
<div className="w-16 h-16 bg-primary-fixed mx-auto rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">touch_app</span>
</div>
<h3 className="text-xl font-bold">Easy to use</h3>
<p className="text-sm text-on-surface-variant">No training required. If you can use a smartphone, you can use TimberTrack.</p>
</div>
</div>
</section>
{/*  Pricing Section  */}
<section id="pricing" className="py-24 px-6">
<div className="max-w-5xl mx-auto">
<div className="text-center mb-16 space-y-4">
<h2 className="text-4xl font-black tracking-tighter text-on-surface">Transparent Pricing</h2>
<p className="text-on-surface-variant">Built to scale with your business, from local yard to regional giant.</p>
</div>
<div className="grid md:grid-cols-2 gap-8 items-stretch">
{/*  Free Plan  */}
<div className="bg-surface-container-lowest p-10 rounded-xl space-y-8 flex flex-col">
<div className="space-y-2">
<h3 className="text-2xl font-black">Free</h3>
<p className="text-on-surface-variant">Perfect for getting started</p>
</div>
<div className="text-5xl font-black">$0<span className="text-lg font-medium text-on-surface-variant">/mo</span></div>
<ul className="space-y-4 flex-grow">
<li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-primary">check</span> Up to 50 items</li>
<li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-primary">check</span> 1 Location</li>
<li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-primary">check</span> Basic Reporting</li>
<li className="flex items-center gap-3 text-sm font-medium opacity-40"><span className="material-symbols-outlined">close</span> AI Smart Billing</li>
</ul>
<Link to="/login" className="w-full block text-center py-4 rounded-full font-bold border border-solid border-primary text-primary hover:bg-primary hover:text-on-primary transition-all">Get Started</Link>
</div>
{/*  Paid Plan  */}
<div className="bg-gradient-to-br from-primary to-primary-container p-10 rounded-xl space-y-8 flex flex-col text-on-primary relative transform scale-105 shadow-2xl">
<div className="absolute top-4 right-6 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Most Popular</div>
<div className="space-y-2">
<h3 className="text-2xl font-black">Pro</h3>
<p className="opacity-80">Full power for growing teams</p>
</div>
<div className="text-5xl font-black">$49<span className="text-lg font-medium opacity-80">/mo</span></div>
<ul className="space-y-4 flex-grow">
<li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined">check</span> Unlimited items</li>
<li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined">check</span> Unlimited Locations</li>
<li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined">check</span> Advanced AI Features</li>
<li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined">check</span> Priority 24/7 Support</li>
</ul>
<Link to="/login" className="w-full block text-center bg-surface-container-lowest text-primary py-4 rounded-xl font-black shadow-xl hover:scale-[1.02] transition-all">Go Pro Now</Link>
</div>
</div>
</div>
</section>
{/*  Final CTA  */}
<section className="py-24 px-6 bg-surface-container-lowest overflow-hidden relative">
<div className="max-w-7xl mx-auto text-center relative z-10 space-y-8">
<h2 className="text-5xl md:text-6xl font-black tracking-tighter text-on-surface">Start Managing Your Business Smarter Today</h2>
<p className="text-xl text-on-surface-variant max-w-2xl mx-auto">Join 500+ industrial rental companies who have ditched the notebook for TimberTrack.</p>
<div className="pt-8">
<Link to="/login" className="inline-block bg-gradient-to-br from-primary to-primary-container text-on-primary px-12 py-5 rounded-xl text-xl font-black shadow-2xl hover:scale-105 transition-transform">
                    Get Started Free
                </Link>
</div>
<div className="pt-4 text-sm font-medium text-on-surface-variant">No credit card required. Cancel anytime.</div>
</div>
{/*  Abstract geometric backgrounds  */}
<div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
<div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary/5 rounded-full blur-[100px]"></div>
</section>
{/*  Footer  */}
<footer id="contact" className="bg-slate-50 dark:bg-slate-950 w-full border-t border-slate-200 dark:border-slate-800">
<div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 max-w-7xl mx-auto gap-8">
<div className="space-y-4">
<div className="text-lg font-bold tracking-tighter text-slate-900 dark:text-white">TimberTrack</div>
<div className="font-inter text-sm text-slate-500 dark:text-slate-400">© 2024 TimberTrack. Built for the industrial era.</div>
</div>
<div className="flex flex-wrap justify-center gap-8 font-inter text-sm text-slate-500 dark:text-slate-400">
<a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" >Features</a>
<a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" >Pricing</a>
<a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" >Contact</a>
<Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" >Privacy</Link>
<Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" >Terms</Link>
<Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" >Support</Link>
</div>
<div className="flex gap-4">
<div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors cursor-pointer">
<span className="material-symbols-outlined text-xl">share</span>
</div>
<div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors cursor-pointer">
<span className="material-symbols-outlined text-xl">language</span>
</div>
</div>
</div>
</footer>

    </div>
  );
}
