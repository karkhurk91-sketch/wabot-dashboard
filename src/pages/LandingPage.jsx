// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 flex-wrap gap-4">
            <div className="flex items-center">
              <span className="text-2xl font-extrabold">
                <span className="text-green-600">Sah</span><span className="text-green-800">AI</span>
              </span>
              <span className="text-xs text-gray-500 ml-1">by TaskCraft</span>
            </div>
            <nav className="hidden md:flex space-x-6 text-sm font-medium">
              <a href="#problem" className="text-gray-700 hover:text-green-600">Problem</a>
              <a href="#solution" className="text-gray-700 hover:text-green-600">Solution</a>
              <a href="#features" className="text-gray-700 hover:text-green-600">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-green-600">How it works</a>
              <a href="#who" className="text-gray-700 hover:text-green-600">Who it's for</a>
              <a href="#pricing" className="text-gray-700 hover:text-green-600">Pricing</a>
              <a href="#faq" className="text-gray-700 hover:text-green-600">FAQ</a>
              <a href="#blogs" className="text-gray-700 hover:text-green-600">Blogs</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-green-600 font-medium hover:underline">Login</Link>
              <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                Built for Indian small businesses
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Never Miss a Lead, <span className="text-green-600">Never Lose a Sale.</span>
              </h1>
              <p className="text-gray-600 text-lg mt-6">
                SahAI is a 24/7 WhatsApp AI assistant that replies instantly, captures leads, shares your catalogue, and sends private broadcasts — so you can focus on closing deals, not typing the same answer ten times a day.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                <Link to="/signup" className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition shadow-md">
                  Start 7‑Day Free Trial →
                </Link>
                <a href="#how-it-works" className="border border-green-600 text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition">
                  See How It Works
                </a>
              </div>
              <p className="text-gray-500 text-sm mt-5">
                No credit card • Setup in under 10 minutes • Cancel anytime
              </p>
            </div>
            {/* WhatsApp mock chat */}
            <div className="flex-1 bg-gray-900 rounded-2xl p-5 shadow-2xl border border-white/10">
              <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold text-white">S</div>
                <div>
                  <div className="font-semibold text-white text-sm">Sharma Coaching Classes</div>
                  <div className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> online · replies in <strong>2s</strong></div>
                </div>
              </div>
              <div className="space-y-3 pt-4 text-sm">
                <div className="flex justify-end"><div className="bg-gradient-to-l from-green-500 to-green-700 text-white rounded-2xl rounded-br-none px-4 py-2 max-w-[85%]">Hi, do you have weekend batches for Class 10 maths?</div></div>
                <div className="flex"><div className="bg-gray-800 text-white rounded-2xl rounded-bl-none px-4 py-2 max-w-[85%]">Namaste! 👋 Yes, our Saturday batch (4–6 PM) has 3 seats left. Fees are ₹3,500/month. May I have your name and area?</div></div>
                <div className="flex justify-end"><div className="bg-gradient-to-l from-green-500 to-green-700 text-white rounded-2xl rounded-br-none px-4 py-2 max-w-[85%]">Rahul, from Malviya Nagar. Can I get a demo?</div></div>
                <div className="flex"><div className="bg-gray-800 text-white rounded-2xl rounded-bl-none px-4 py-2 max-w-[85%]">Perfect, Rahul ❤️ I've booked a free demo for Saturday 4 PM. Sharma sir will call you in 10 min to confirm. Meanwhile, here's the syllabus: 📘</div></div>
              </div>
              <div className="text-[10px] text-gray-400 text-center pt-3">↑ AI captured the lead, answered FAQs & pinged the owner — at 11:43 PM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-gray-50 border-y py-3 text-xs text-gray-600 flex flex-wrap justify-center gap-6">
        <span>⚡ Meta Cloud API</span>
        <span>🤖 Powered by Groq + Llama 3.1</span>
        <span>📚 RAG over your own docs</span>
        <span>🔒 Isolated per-business data</span>
        <span>🇮🇳 DLT & GST ready</span>
      </div>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-sm text-red-500 font-semibold tracking-wide uppercase">THE PROBLEM</div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Small businesses are losing customers every single night</h2>
            <p className="text-gray-600 mt-4">WhatsApp is the #1 way Indian customers reach out. But the typical shopkeeper, tutor, or agent simply can't keep up.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4"><div className="text-4xl mb-3">🌙</div><h3 className="text-xl font-semibold mb-2">Late-night messages go unanswered</h3><p className="text-gray-600">A customer asks about price at 10:47 PM. By morning, they've already bought from a competitor.</p></div>
            <div className="text-center p-4"><div className="text-4xl mb-3">📢</div><h3 className="text-xl font-semibold mb-2">WhatsApp groups leak customers</h3><p className="text-gray-600">Broadcast groups are noisy, unprofessional, and hand your customer list to competitors.</p></div>
            <div className="text-center p-4"><div className="text-4xl mb-3">⏳</div><h3 className="text-xl font-semibold mb-2">Hours wasted on repeat questions</h3><p className="text-gray-600">"Kitne ka hai?" "Timing?" "Home delivery?" — answered 30 times a day.</p></div>
            <div className="text-center p-4"><div className="text-4xl mb-3">📋</div><h3 className="text-xl font-semibold mb-2">No system to capture leads</h3><p className="text-gray-600">Names, numbers, interests — scattered across chats. Follow-ups never happen.</p></div>
          </div>
        </div>
      </section>

      {/* Solution Section (Two Superpowers) */}
      <section id="solution" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-sm text-green-600 font-semibold tracking-wide uppercase">THE SOLUTION</div>
            <h2 className="text-3xl md:text-4xl font-bold">One WhatsApp AI agent. <span className="text-green-600">Two superpowers.</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
              <div className="text-4xl mb-4">📢</div>
              <h3 className="text-2xl font-bold">Private Broadcasts</h3>
              <p className="text-gray-600 mt-3">Send offers, updates, and festival promotions to thousands of customers in one click — directly to their inbox. No group, no leaked contacts.</p>
              <div className="flex flex-wrap gap-2 mt-4"><span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Meta-approved templates</span><span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Scheduled sends</span><span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Segmented lists</span></div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold">24/7 AI Chatbot</h3>
              <p className="text-gray-600 mt-3">Answers customer questions, shares catalogues, captures leads, and escalates to you only when the deal is ready to close. Works even at 2 AM.</p>
              <div className="flex flex-wrap gap-2 mt-4"><span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">RAG over your docs</span><span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Hindi + English</span><span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Smart escalation</span></div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8 max-w-2xl mx-auto">The result: owners never miss a message, save 20+ hours a week, and close more sales — without the customer installing anything.</p>
        </div>
      </section>

      {/* How it works (5 steps) */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">From <span className="text-green-600">"Hi"</span> to a ready-to-buy lead</h2>
            <p className="text-gray-600 mt-2">Five steps. Zero effort from the owner.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-6 text-center">
            <div><div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-green-700 mx-auto mb-3">1</div><h3 className="font-semibold">Customer messages</h3><p className="text-sm text-gray-500">They text your business WhatsApp number — even at 2 AM.</p></div>
            <div><div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-green-700 mx-auto mb-3">2</div><h3 className="font-semibold">AI replies instantly</h3><p className="text-sm text-gray-500">Natural, friendly, in Hindi or English.</p></div>
            <div><div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-green-700 mx-auto mb-3">3</div><h3 className="font-semibold">Answers & captures</h3><p className="text-sm text-gray-500">FAQs, catalogue, name, number, interest — all collected.</p></div>
            <div><div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-green-700 mx-auto mb-3">4</div><h3 className="font-semibold">Owner notified</h3><p className="text-sm text-gray-500">You get the full chat + a "ready to buy" flag.</p></div>
            <div><div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-green-700 mx-auto mb-3">5</div><h3 className="font-semibold">You close the deal</h3><p className="text-sm text-gray-500">Warm lead. One call. Done.</p></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to sell on WhatsApp</h2>
            <p className="text-gray-600 mt-2">A complete multi-tenant platform, not a toy chatbot.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm"><div className="text-3xl mb-3">🤖</div><h3 className="text-xl font-semibold">24/7 AI Agent</h3><p className="text-gray-600">Groq + Llama 3.1 responds in under 2 seconds with conversational memory per customer.</p></div>
            <div className="bg-white rounded-xl p-6 shadow-sm"><div className="text-3xl mb-3">📚</div><h3 className="text-xl font-semibold">Knowledge Base (RAG)</h3><p className="text-gray-600">Upload PDFs, price lists, catalogues. AI answers from your own content.</p></div>
            <div className="bg-white rounded-xl p-6 shadow-sm"><div className="text-3xl mb-3">📢</div><h3 className="text-xl font-semibold">Private Broadcasts</h3><p className="text-gray-600">Send Meta-approved templates to segmented lists. Never a group message.</p></div>
            <div className="bg-white rounded-xl p-6 shadow-sm"><div className="text-3xl mb-3">🎯</div><h3 className="text-xl font-semibold">Auto Lead Capture</h3><p className="text-gray-600">Keyword-triggered creation. Track new → contacted → converted → lost.</p></div>
            <div className="bg-white rounded-xl p-6 shadow-sm"><div className="text-3xl mb-3">📇</div><h3 className="text-xl font-semibold">Customer CRM</h3><p className="text-gray-600">Full contact records, notes, tags, history — export to CSV.</p></div>
            <div className="bg-white rounded-xl p-6 shadow-sm"><div className="text-3xl mb-3">⚙️</div><h3 className="text-xl font-semibold">Custom AI Prompts</h3><p className="text-gray-600">Edit system prompt, temperature, lead keywords — tune the agent's personality.</p></div>
            <div className="bg-white rounded-xl p-6 shadow-sm"><div className="text-3xl mb-3">📊</div><h3 className="text-xl font-semibold">Analytics Dashboard</h3><p className="text-gray-600">Messages over time, top customers, lead funnel, broadcast ROI.</p></div>
            <div className="bg-white rounded-xl p-6 shadow-sm"><div className="text-3xl mb-3">🔐</div><h3 className="text-xl font-semibold">Multi-Tenant & Isolated</h3><p className="text-gray-600">Every business gets its own number, data, AI config. Super admin oversight.</p></div>
            <div className="bg-white rounded-xl p-6 shadow-sm"><div className="text-3xl mb-3">🌐</div><h3 className="text-xl font-semibold">Web Chat Widget</h3><p className="text-gray-600">The same AI also runs as a web chat on your site — one brain, two channels.</p></div>
          </div>
        </div>
      </section>

      {/* Who it's for (Industries / Stats) */}
      <section id="who" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Built for the businesses India runs on</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6"><div className="text-5xl mb-3">🛍️</div><h3 className="text-xl font-semibold">Retail & Shopping</h3><p className="text-gray-600">Grocery, apparel, electronics — never lose a night‑time sale.</p></div>
            <div className="p-6"><div className="text-5xl mb-3">💇</div><h3 className="text-xl font-semibold">Salons & Spas</h3><p className="text-gray-600">Automate bookings, send reminders, capture repeat clients.</p></div>
            <div className="p-6"><div className="text-5xl mb-3">📚</div><h3 className="text-xl font-semibold">Coaching & Tuition</h3><p className="text-gray-600">Handle inquiries, share demos, book free classes instantly.</p></div>
            <div className="p-6"><div className="text-5xl mb-3">🏠</div><h3 className="text-xl font-semibold">Real Estate</h3><p className="text-gray-600">Qualify buyers, share property lists, schedule site visits.</p></div>
            <div className="p-6"><div className="text-5xl mb-3">🍽️</div><h3 className="text-xl font-semibold">Restaurants & Cafes</h3><p className="text-gray-600">Take orders, share specials, manage reservations.</p></div>
            <div className="p-6"><div className="text-5xl mb-3">🚚</div><h3 className="text-xl font-semibold">Tiffin & Delivery</h3><p className="text-gray-600">Automate daily menu sharing and order collection.</p></div>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div><div className="text-3xl font-bold text-green-600">500M+</div><p className="text-gray-600">WhatsApp users in India</p></div>
            <div><div className="text-3xl font-bold text-green-600">₹18k+</div><p className="text-gray-600">Average extra revenue per month</p></div>
            <div><div className="text-3xl font-bold text-green-600">24/7</div><p className="text-gray-600">Always-on lead capture</p></div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Plans that pay for themselves</h2>
            <p className="text-gray-600 mt-2">Choose the perfect plan for your business</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h3 className="text-xl font-bold">Basic — Lead Gen</h3>
              <p className="text-3xl font-bold mt-4">₹5,000<span className="text-base font-normal text-gray-500">/mo</span></p>
              <p className="text-sm text-gray-500 mt-1">+ Meta fees</p>
              <ul className="mt-6 space-y-2 text-left">
                <li>✅ AI handles FAQs automatically</li><li>✅ Automatic lead capture</li><li>✅ Up to 1,000 conversations/mo</li><li>✅ Basic analytics dashboard</li><li>✅ Email support</li>
              </ul>
              <Link to="/signup" className="mt-8 block w-full border border-green-600 text-green-600 py-2 rounded-full text-center font-semibold hover:bg-green-50">Start 7-Day Trial</Link>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">Most Popular</div>
              <h3 className="text-xl font-bold">Pro — Sales</h3>
              <p className="text-3xl font-bold mt-4">₹10,000<span className="text-base font-normal text-gray-500">/mo</span></p>
              <p className="text-sm text-gray-500 mt-1">+ Meta fees</p>
              <ul className="mt-6 space-y-2 text-left">
                <li>✅ Everything in Basic</li><li>✅ Product catalogue & availability</li><li>✅ Unlimited private broadcasts</li><li>✅ RAG over your documents</li><li>✅ Priority WhatsApp support</li>
              </ul>
              <p className="text-xs text-green-600 mt-4 text-center">Recovers its cost with just 1 extra lead/week</p>
              <Link to="/signup" className="mt-6 block w-full bg-green-600 text-white py-2 rounded-full text-center font-semibold hover:bg-green-700">Start 14-Day Trial</Link>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h3 className="text-xl font-bold">Enterprise — Full Support</h3>
              <p className="text-3xl font-bold mt-4">Custom</p>
              <p className="text-sm text-gray-500 mt-1">Tailored for your needs</p>
              <ul className="mt-6 space-y-2 text-left">
                <li>✅ Everything in Pro</li><li>✅ AI-driven order taking</li><li>✅ Razorpay payment links</li><li>✅ Dedicated account manager</li><li>✅ Custom integrations & API</li>
              </ul>
              <Link to="/contact" className="mt-8 block w-full border border-gray-400 text-gray-700 py-2 rounded-full text-center font-semibold hover:bg-gray-50">Contact sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold">Is my customer data safe?</h3><p className="text-gray-600 mt-1">Yes. Every business's data is isolated by tenant. You own your customer list, and we never share or use it for any other purpose.</p></div>
            <div><h3 className="text-lg font-semibold">Do I need technical skills to set up?</h3><p className="text-gray-600 mt-1">No. We handle the WhatsApp API connection, webhook, and AI training. You just add your business number and start using the dashboard.</p></div>
            <div><h3 className="text-lg font-semibold">Can I try before paying?</h3><p className="text-gray-600 mt-1">Absolutely. Start a free 7‑day trial (no credit card required). You can upgrade, downgrade, or cancel anytime.</p></div>
            <div><h3 className="text-lg font-semibold">What if I need a custom feature?</h3><p className="text-gray-600 mt-1">Our Enterprise plan includes custom development. Contact us to discuss your requirements.</p></div>
          </div>
        </div>
      </section>

      {/* Blogs teaser section */}
      <section id="blogs" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from our blog</h2>
          <p className="text-gray-600 mb-8">Tips, case studies, and updates on WhatsApp automation.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"><h3 className="text-xl font-semibold">How a salon recovered 3 lost leads in week 1</h3><p className="text-gray-500 text-sm mt-2">Case study: Glamour Salon, Gurgaon – 35% revenue increase</p><a href="#" className="text-green-600 text-sm font-medium mt-3 inline-block">Read more →</a></div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"><h3 className="text-xl font-semibold">19 WhatsApp message templates that actually convert</h3><p className="text-gray-500 text-sm mt-2">Proven templates for marketing, reminders, and follow‑ups</p><a href="#" className="text-green-600 text-sm font-medium mt-3 inline-block">Read more →</a></div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"><h3 className="text-xl font-semibold">Meta’s 2026 pricing changes – what you must know</h3><p className="text-gray-500 text-sm mt-2">How to optimise costs for your WhatsApp campaigns</p><a href="#" className="text-green-600 text-sm font-medium mt-3 inline-block">Read more →</a></div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-700 to-green-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Stop losing leads while you sleep.</h2>
          <p className="text-lg mt-4 opacity-90">Set up SahAI in under 10 minutes. First 7 days on us.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-5">
            <Link to="/signup" className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition">Start 7-Day Free Trial →</Link>
            <a href="#contact" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition">Book a Demo</a>
          </div>
          <p className="text-sm mt-6 opacity-80">📧 hello@sahai.ai | 📞 +91 98765 43210 | <a href="https://wa.me/919876543210" className="underline">WhatsApp us</a></p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-sm">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2026 <span className="font-semibold text-white">TaskCraft</span> – SahAI.ai. AI‑powered WhatsApp automation for Indian small businesses.</p>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/faq" className="hover:text-white">FAQ</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;