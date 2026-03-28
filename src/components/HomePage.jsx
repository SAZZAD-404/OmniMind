import React, { useState, useEffect, useRef } from 'react';
import { CodeXml, FileText, Flame, Database, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import '../HomePage.css';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Multi-Model AI',
    desc: 'Access GPT-4, Claude, Gemini & more — all within a single, unified workspace.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: 'Code Intelligence',
    desc: 'Smart syntax highlighting, code execution, and real-time code review with context.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Persistent Memory',
    desc: 'Conversations are saved locally. Your context, your history — always available.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" /><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" /><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" /><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" /><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" /><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z" /><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" />
      </svg>
    ),
    title: 'Project Workspaces',
    desc: 'Organize chats into projects. Keep your research, work, and ideas neatly separated.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
    ),
    title: 'Image Understanding',
    desc: 'Attach images and files directly to your conversations for visual AI analysis.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Real-time Streaming',
    desc: 'Responses stream instantly as they generate — no waiting for the full reply.'
  }
];

const MODELS = [
  { name: 'GPT-4o', color: '#10a37f', badge: 'OpenAI' },
  { name: 'Claude 3.5', color: '#d97757', badge: 'Anthropic' },
  { name: 'Gemini Pro', color: '#4285f4', badge: 'Google' },
  { name: 'Llama 3.3', color: '#a855f7', badge: 'Meta' },
  { name: 'DeepSeek', color: '#06b6d4', badge: 'DeepSeek' },
  { name: 'Grok', color: '#f59e0b', badge: 'xAI' },
];

const TYPING_TEXTS = [
  'Write a Python script to automate my workflow...',
  'Explain quantum entanglement in simple terms...',
  'Review my business plan and give feedback...',
  'Help me debug this React component...',
  'Summarize this research paper...',
  'Generate a creative story about Mars colonization...',
];

const FAQS = [
  { q: "Is OmniMind completely free to use?", a: "Yes, our core platform is free. You can use your own API keys for specific premium models, or use our provided free models seamlessly across the workspace." },
  { q: "Where is my chat data stored?", a: "All your conversations, project metadata, and history are stored completely locally in your browser cache. We never upload, view, or sell your private data." },
  { q: "Which AI models are available?", a: "OmniMind integrates with 20+ models including GPT-4o, Claude 3.5 Sonnet, Google Gemini Pro, Meta Llama 3, and DeepSeek, all within one unified interface." },
  { q: "Can I use OmniMind for coding?", a: "Absolutely! OmniMind features specialized syntax highlighting, intelligent code formatting, and a dedicated 'Code Workspace' designed for software engineers." }
];

const PROMPT_GALLERY = [
  { title: "Refactor Legacy Code", desc: "Rewrite this legacy React component using modern Hooks and optimal performance patterns.", icon: <CodeXml size={20} /> },
  { title: "Summarize Research", desc: "Extract the core methodologies and findings from this 50-page technical research document.", icon: <FileText size={20} /> },
  { title: "Creative Ideation", desc: "Draft a compelling product launch strategy and blog series for an AI-powered SaaS tool.", icon: <Flame size={20} /> },
  { title: "Data Analytics", desc: "Write an optimized SQL query to calculate the month-over-month retention rate for active user cohorts.", icon: <Database size={20} /> },
];

const USE_CASES = {
  developers: {
    title: "The Ultimate Developer Tool",
    desc: "Debug faster, write cleaner code, and automate your unit testing with native context-awareness.",
    demoCode: `function optimizeSearch(dataset) {\n  // OmniMind intelligently refactors O(n^2) to O(n log n)\n  const mapped = dataset.map(item => item.value);\n  return mapped.sort((a,b) => a - b);\n}`
  },
  researchers: {
    title: "Deep Research Mode",
    desc: "Ingest exhaustive technical documents, connect insights across multiple papers, and generate citations.",
    demoCode: `> System: Analyzing quantum_mechanics_v2.pdf...\n\n[Analysis Complete]: The dualism hypothesis in Section 4 directly correlates with the observer effect assumptions outlined in previous chat context.`
  },
  creators: {
    title: "Unbound Creativity",
    desc: "Brainstorm video scripts, draft compelling copy, and ideate marketing campaigns with unparalleled speed.",
    demoCode: `Campaign Idea 1: "The Infinite Canvas"\nFormat: 30s Visual Short\nHook: "What if your workspace could think with you?"\nVisuals: Fast-paced typing seamlessly blending into an animated workflow...`
  }
};

export default function HomePage({ onEnterApp }) {
  const [typedText, setTypedText] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('developers');
  const [particlesPaused] = useState(false);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Typewriter Effect
  useEffect(() => {
    const current = TYPING_TEXTS[textIdx];
    let timeout;

    if (!isDeleting && charIdx <= current.length) {
      timeout = setTimeout(() => {
        setTypedText(current.slice(0, charIdx));
        setCharIdx(c => c + 1);
      }, 45);
    } else if (!isDeleting && charIdx > current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setTypedText(current.slice(0, charIdx));
        setCharIdx(c => c - 1);
      }, 20);
    } else {
      setIsDeleting(false);
      setTextIdx(i => (i + 1) % TYPING_TEXTS.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, textIdx]);

  // Animated particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const PARTICLE_COUNT = 60;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 119, 87, ${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(217, 119, 87, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="home-page">
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* NAV */}
      <nav className="home-nav">
        <div className="home-nav-logo">
          <span className="nav-logo-text">OmniMind</span>
        </div>
        <div className="home-nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#models" className="nav-link">Models</a>
          <button className="nav-cta-btn" onClick={onEnterApp}>
            Launch App →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Powered by 20+ State-of-the-Art AI Models
        </div>

        <h1 className="hero-title">
          The AI Workspace<br />
          <span className="hero-gradient-text">Built for Power Users</span>
        </h1>

        <p className="hero-subtitle">
          One interface. All models. Infinite possibilities. OmniMind brings together
          the world's best AI models in a blazing-fast, beautifully designed workspace.
        </p>

        {/* Typewriter Demo */}
        <div className="hero-typewriter-box">
          <div className="typewriter-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="typewriter-text">
            {typedText}<span className="typewriter-cursor">|</span>
          </span>
        </div>

        <div className="hero-actions">
          <button className="hero-primary-btn" id="start-app-btn" onClick={onEnterApp}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Chatting — It's Free
          </button>
          <button className="hero-secondary-btn" onClick={onEnterApp}>
            Explore Features
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">20+</span>
            <span className="stat-label">AI Models</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">∞</span>
            <span className="stat-label">Free Chats</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Data Sold</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">100%</span>
            <span className="stat-label">Private</span>
          </div>
        </div>
      </section>

      {/* MODELS MARQUEE */}
      <section id="models" className="models-section">
        <p className="models-label">Powered by the world's leading AI providers</p>
        <div className="models-marquee-track">
          <div className="models-marquee">
            {/* Block 1 */}
            <div className="models-marquee-content">
              {[...MODELS, ...MODELS, ...MODELS, ...MODELS].map((m, i) => (
                <div key={`auto-${i}`} className="model-pill">
                  <span className="model-dot" style={{ background: m.color }} />
                  <span className="model-name">{m.name}</span>
                  <span className="model-badge">{m.badge}</span>
                </div>
              ))}
            </div>
            {/* Block 2 (identical duplicate for perfect seamless loop) */}
            <div className="models-marquee-content" aria-hidden="true">
              {[...MODELS, ...MODELS, ...MODELS, ...MODELS].map((m, i) => (
                <div key={`clone-${i}`} className="model-pill">
                  <span className="model-dot" style={{ background: m.color }} />
                  <span className="model-name">{m.name}</span>
                  <span className="model-badge">{m.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-eyebrow">Why OmniMind?</span>
          <h2 className="section-title">Everything you need.<br />Nothing you don't.</h2>
          <p className="section-desc">
            A complete AI workspace designed for professionals, developers, researchers, and creators.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ '--delay': `${i * 0.07}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section className="use-cases-section">
        <div className="use-cases-container">
          <div className="use-cases-sidebar">
            <button className={`use-case-tab ${activeTab === 'developers' ? 'active' : ''}`} onClick={() => setActiveTab('developers')}>For Developers</button>
            <button className={`use-case-tab ${activeTab === 'researchers' ? 'active' : ''}`} onClick={() => setActiveTab('researchers')}>For Researchers</button>
            <button className={`use-case-tab ${activeTab === 'creators' ? 'active' : ''}`} onClick={() => setActiveTab('creators')}>For Creators</button>
          </div>
          <div className="use-cases-content">
            <h3 className="use-case-title">{USE_CASES[activeTab].title}</h3>
            <p className="use-case-desc">{USE_CASES[activeTab].desc}</p>
            <div className="use-case-mockup">
              {USE_CASES[activeTab].demoCode}
            </div>
          </div>
        </div>
      </section>

      {/* PROMPT GALLERY */}
      <section className="prompts-section">
        <div className="section-header">
          <span className="section-eyebrow">Prompt Gallery</span>
          <h2 className="section-title">See what OmniMind can do</h2>
        </div>
        <div className="prompts-grid">
          {PROMPT_GALLERY.map((p, i) => (
            <div key={i} className="prompt-card" onClick={onEnterApp}>
              <div className="prompt-icon">{p.icon}</div>
              <h4 className="prompt-title">{p.title}</h4>
              <p className="prompt-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRIVACY & SECURITY */}
      <section className="privacy-section">
        <div className="privacy-box">
          <div className="privacy-icon">
            <ShieldCheck size={32} />
          </div>
          <h2 className="section-title" style={{ marginBottom: '8px' }}>Security by Design</h2>
          <p className="section-desc" style={{ marginBottom: '0' }}>
            We believe your thoughts shouldn't be monetized. OmniMind operates securely through local processing pipelines. All your chats, custom workspaces, and configuration files are stored directly on your own device. Zero cloud snooping, zero data selling, infinite privacy.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-header">
          <h2 className="section-title">Common Questions</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                {openFaq === i ? <ChevronUp size={20} color="#d97757" /> : <ChevronDown size={20} color="#737373" />}
              </div>
              {openFaq === i && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-glow" />
        <h2 className="cta-title">Ready to experience the future of AI?</h2>
        <p className="cta-subtitle">No signup. No credit card. Just pure AI power at your fingertips.</p>
        <button className="hero-primary-btn cta-main-btn" onClick={onEnterApp}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Open OmniMind Workspace
        </button>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-nav-logo">
          <span className="nav-logo-text" style={{ fontSize: '16px', color: '#737373' }}>OmniMind</span>
        </div>
        <p className="footer-copy">© 2026 OmniMind AI. Built with passion for intelligence.</p>
      </footer>
    </div>
  );
}
