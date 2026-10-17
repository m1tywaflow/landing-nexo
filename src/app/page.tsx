'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Bricolage_Grotesque, Inter } from 'next/font/google';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-body', display: 'swap' });

const H = { fontFamily: 'var(--font-display), system-ui, sans-serif' } as const;
const APP_URL = 'https://chat-vert-nu-34.vercel.app/';
const DOWNLOAD_URL = 'https://chat-vert-nu-34.vercel.app/download';
const GITHUB_URL = 'https://github.com/m1tywaflow/chat';
const BORDER = 'border-[rgba(168,150,255,0.14)]';
const VOICE_BAR_HEIGHTS = [35, 55, 40, 75, 50, 90, 60, 100, 65, 85, 45, 70, 55, 95, 40, 60, 30, 50];
const BARS = [35, 60, 45, 80, 55, 95, 65, 100, 70, 85, 50, 75, 40, 60, 30];

const NAV_LINKS: [string, string][] = [
  ['features', 'Features'],
  ['demo', 'Try it'],
  ['desktop', 'Desktop'],
  ['communities', 'Groups & channels'],
  ['how', 'How it works'],
  ['roadmap', 'Roadmap'],
  ['faq', 'FAQ'],
];

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function attachTilt(card: HTMLElement) {
  let frame = 0;
  let cx = 0;
  let cy = 0;

  const apply = () => {
    frame = 0;
    const rect = card.getBoundingClientRect();
    const px = (cx - rect.left) / rect.width;
    const py = (cy - rect.top) / rect.height;
    card.style.transform = `rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 10}deg) translateZ(0)`;
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    cx = e.clientX;
    cy = e.clientY;
    if (!frame) frame = requestAnimationFrame(apply);
  };
  const leave = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    card.style.transform = 'rotateX(0) rotateY(0)';
  };

  card.addEventListener('pointermove', move);
  card.addEventListener('pointerleave', leave);
  return () => {
    if (frame) cancelAnimationFrame(frame);
    card.removeEventListener('pointermove', move);
    card.removeEventListener('pointerleave', leave);
  };
}

type Particle = { x: number; y: number; vx: number; vy: number; r: number; depth: number };

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia(REDUCED_MOTION).matches;
    const fine = window.matchMedia(FINE_POINTER).matches;
    const LINK = 120;
    const LINK2 = LINK * LINK;

    let W = 0;
    let H = 0;
    let lastW = 0;
    let raf = 0;
    let resizeTimer = 0;
    let moveFrame = 0;
    let mx = 0;
    let my = 0;
    let particles: Particle[] = [];

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (W !== lastW) {
        lastW = W;
        const count = W < 768 ? 30 : 64;
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.6,
          depth: Math.random() * 0.6 + 0.4,
        }));
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        else if (p.y > H) p.y = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            ctx.strokeStyle = `rgba(169,150,255,${(0.1 * (1 - Math.sqrt(d2) / LINK)).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,190,255,${(0.55 * p.depth).toFixed(3)})`;
        ctx.fill();
      }
    };

    const frame = () => {
      render();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    setup();
    if (reduce) render();
    else start();

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setup();
        if (reduce) render();
      }, 150);
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      if (moveFrame) return;
      moveFrame = requestAnimationFrame(() => {
        moveFrame = 0;
        canvas.style.transform = `translate3d(${(mx / W - 0.5) * -14}px, ${(my / H - 0.5) * -14}px, 0)`;
      });
    };

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    if (fine && !reduce) window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      stop();
      if (moveFrame) cancelAnimationFrame(moveFrame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 w-full h-full z-0 pointer-events-none transition-transform duration-500" />;
}

function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const els = NAV_LINKS.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <nav
      aria-label="Main"
      className="fixed top-[18px] left-1/2 -translate-x-1/2 w-[min(1200px,92vw)] z-[100] flex items-center justify-between rounded-full border border-[rgba(168,150,255,0.14)] bg-[rgba(15,11,26,0.55)] backdrop-blur-2xl px-3 py-3 pl-5"
    >
      <a href="#top" className="flex items-center gap-2.5 font-bold text-[1.05rem] tracking-tight" style={H}>
        <Mark className="w-[34px] h-[34px]" priority />
        NEXO
      </a>
      <div className="hidden xl:flex gap-[26px] text-[0.92rem] text-[#b8b0d6]">
        {NAV_LINKS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={`transition-colors hover:text-white ${active === id ? 'text-white' : ''}`}>
            {label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <a href={APP_URL} className="btn-primary rounded-full px-[22px] py-3 text-[0.92rem] font-semibold">
          Open Nexo
        </a>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className={`xl:hidden w-11 h-11 rounded-full border ${BORDER} flex items-center justify-center text-white`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
            <path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </div>
      {open && (
        <div
          id="mobile-menu"
          className={`xl:hidden absolute left-0 right-0 top-[calc(100%+10px)] rounded-3xl border ${BORDER} bg-[rgba(15,11,26,0.92)] backdrop-blur-2xl p-3 flex flex-col`}
        >
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className={`rounded-2xl px-4 py-3 text-[0.98rem] transition-colors hover:bg-white/5 ${active === id ? 'text-white bg-white/5' : 'text-[#b8b0d6]'}`}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function ScrollUI() {
  const barRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      setShowTop(window.scrollY > 900);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia(REDUCED_MOTION).matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <>
      <div
        ref={barRef}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[3px] z-[110] origin-left"
        style={{ transform: 'scaleX(0)', background: 'linear-gradient(90deg,#7c5cff,#a996ff)' }}
      />
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        className={`fixed bottom-6 right-6 z-[100] w-11 h-11 rounded-full border ${BORDER} bg-[rgba(20,14,34,0.8)] backdrop-blur-xl text-[#a996ff] flex items-center justify-center transition-all duration-300 hover:border-[#a996ff] ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}

export default function NexoLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const chatCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroVisual = heroVisualRef.current;
    const chatCard = chatCardRef.current;
    if (!heroVisual || !chatCard) return;
    if (!window.matchMedia(FINE_POINTER).matches) return;

    let frame = 0;
    let cx = 0;
    let cy = 0;

    const apply = () => {
      frame = 0;
      const rect = heroVisual.getBoundingClientRect();
      const px = (cx - rect.left) / rect.width - 0.5;
      const py = (cy - rect.top) / rect.height - 0.5;
      chatCard.style.setProperty('--ry', `${px * 22 - 10}deg`);
      chatCard.style.setProperty('--rx', `${-py * 16 + 6}deg`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cx = e.clientX;
      cy = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      chatCard.style.setProperty('--ry', '-10deg');
      chatCard.style.setProperty('--rx', '6deg');
    };

    heroVisual.addEventListener('pointermove', onMove);
    heroVisual.addEventListener('pointerleave', onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      heroVisual.removeEventListener('pointermove', onMove);
      heroVisual.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cleanups: (() => void)[] = [];
    if (window.matchMedia(FINE_POINTER).matches) {
      root.querySelectorAll<HTMLElement>('.tilt-card').forEach((card) => cleanups.push(attachTilt(card)));
    }

    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    root.querySelectorAll<HTMLElement>('.reveal, .steps-line').forEach((el) => io.observe(el));

    return () => {
      cleanups.forEach((fn) => fn());
      io.disconnect();
    };
  }, []);

  return (
    <div id="top" ref={rootRef} className={`nexo-landing ${display.variable} ${body.variable} relative bg-[#050308] text-[#f6f4ff] overflow-x-clip`}>
      <style>{nexoStyles}</style>

      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <ParticleCanvas />
      <div className="glow glow-1" aria-hidden="true" />
      <div className="glow glow-2" aria-hidden="true" />

      <ScrollUI />
      <Nav />

      <main id="main" className="relative z-[2]">
        <section className="hero min-h-screen flex items-center px-[min(6vw,90px)] pt-[150px] pb-20">
          <div className="hero-grid w-full max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div>
              <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-[rgba(168,150,255,0.14)] bg-[rgba(124,92,255,0.06)] pl-3 pr-4 py-2 text-[0.82rem] text-[#a996ff] mb-7">
                <BoltIcon className="w-3.5 h-3.5" />
                Next-generation messenger
              </span>
              <h1 className="anim-h1 text-[clamp(2.6rem,5.6vw,4.6rem)] font-bold tracking-tight leading-[1.04]" style={H}>
                Message at the
                <br />
                speed of{' '}
                <span className="bg-[linear-gradient(100deg,#a996ff,#7c5cff_55%,#5b3df0)] bg-clip-text text-transparent">thought.</span>
              </h1>
              <p className="anim-lead mt-6 max-w-[44ch] text-[1.08rem] leading-relaxed text-[#b8b0d6]">
                Nexo brings chat, calls, groups, and channels into one fast, private space — built for
                people who talk in real time, not in loading spinners.
              </p>
              <div className="anim-ctas flex flex-wrap gap-3.5 mt-9">
                <a href={APP_URL} className="btn-primary rounded-full px-6 py-3 text-[0.92rem] font-semibold">
                  Open Nexo →
                </a>
                <a href="#demo" className="btn-ghost rounded-full px-6 py-3 text-[0.92rem] font-semibold">
                  Try the live demo
                </a>
              </div>
              <div className="anim-strip flex gap-7 flex-wrap mt-14">
                <StripItem icon={<BoltIcon className="w-[18px] h-[18px] text-[#a996ff]" />} label="Real-time messaging" />
                <StripItem icon={<ShieldIcon className="w-[18px] h-[18px] text-[#a996ff]" />} label="Secure & private" />
                <StripItem icon={<GroupIcon className="w-[18px] h-[18px] text-[#a996ff]" />} label="Groups & channels" />
              </div>
            </div>

            <div ref={heroVisualRef} className="hero-visual relative h-[440px] md:h-[560px] mt-5 md:mt-0" style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}>
              <div className="orbit-wrap absolute top-[-10px] right-10 w-[150px] h-[150px]" aria-hidden="true" style={{ transformStyle: 'preserve-3d' }}>
                <div className="ring ring-a" />
                <div className="ring ring-b" />
                <div className="planet" />
              </div>

              <div className="phone-stage absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                <div ref={chatCardRef} className="chat-card w-[min(380px,82vw)] rounded-[28px] border border-[rgba(168,150,255,0.14)] p-5 backdrop-blur-2xl">
                  <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[rgba(168,150,255,0.14)]">
                    <div className="relative w-9 h-9 rounded-full flex-none overflow-hidden">
                      <Image src="/avatar.jpg" alt="mitywa" fill sizes="36px" className="object-cover" priority />
                    </div>
                    <div>
                      <div className="font-semibold text-[0.92rem]">mitywa</div>
                      <div className="text-[0.76rem] text-[#a996ff]">online</div>
                    </div>
                  </div>
                  <div className="bubble-in max-w-[80%] rounded-2xl rounded-bl-md px-4 py-2.5 text-[0.86rem] leading-snug mb-2.5 border border-[rgba(168,150,255,0.14)] bg-white/5">
                    Hey! Are you there?
                  </div>
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-[0.86rem] leading-snug mb-2.5 text-white bg-[linear-gradient(135deg,#7c5cff,#5b3df0)]" style={{ transform: 'translateZ(20px)' }}>
                    Yeah! Nexo looks amazing ✨
                  </div>
                  <div className="voice-bubble ml-auto flex items-center gap-3 max-w-[75%] rounded-2xl rounded-br-md pl-2 pr-3.5 py-2 mb-3.5 bg-[linear-gradient(135deg,#7c5cff,#5b3df0)]" style={{ transform: 'translateZ(20px)' }}>
                    <div className="voice-play w-8 h-8 rounded-full flex-none flex items-center justify-center bg-white/15">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="#fff">
                        <path d="M6 4.5v15l13-7.5z" />
                      </svg>
                    </div>
                    <div className="voice-wave flex items-end gap-[3px] h-5 flex-1" aria-hidden="true">
                      {VOICE_BAR_HEIGHTS.map((h, i) => (
                        <span key={i} className="voice-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
                      ))}
                    </div>
                    <span className="text-[0.72rem] text-white/85 flex-none">0:12</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1.5 px-3.5 py-2.5 rounded-full border border-[rgba(168,150,255,0.14)] bg-white/[0.03] text-[#7d7599] text-[0.82rem]">
                    Write a message…
                  </div>
                </div>

                <div className="float-card fc-1">
                  <MailIcon className="w-5 h-5 text-[#a996ff]" />
                  <div>
                    <div className="text-[0.82rem] font-semibold">Voice & Video</div>
                    <div className="text-[0.72rem] text-[#7d7599]">Stay closer</div>
                  </div>
                </div>
                <div className="float-card fc-2">
                  <ImageIcon className="w-5 h-5 text-[#a996ff]" />
                  <div>
                    <div className="text-[0.82rem] font-semibold">Media & Files</div>
                    <div className="text-[0.72rem] text-[#7d7599]">Share what matters</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="cv px-[min(6vw,90px)] py-[120px]">
          <div className="max-w-[1200px] mx-auto">
            <div className="reveal max-w-[640px] mb-16">
              <span className="block text-[#a996ff] text-[0.86rem] font-semibold mb-3.5">Everything, one place</span>
              <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold" style={H}>
                Built for how people actually talk.
              </h2>
              <p className="mt-4 text-[#b8b0d6] text-[1.02rem] leading-relaxed max-w-[52ch]">
                Six things a messenger needs to get right — Nexo does all of them, in one app that stays
                out of your way.
              </p>
            </div>

            <div className="reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" style={{ perspective: '1200px' }}>
              <TiltCard wide title="Real-time messaging" icon={<ChatIcon />}>
                Messages land instantly and stay synced across every device you sign into — no refresh,
                no delay.
              </TiltCard>
              <TiltCard title="Secure & private" icon={<ShieldIcon />}>
                Your conversations stay between you and the people you choose to have them with.
              </TiltCard>
              <TiltCard title="Groups & channels" icon={<GroupIcon />}>
                Build communities, broadcast to thousands, and moderate with control that scales with
                you.
              </TiltCard>
              <TiltCard title="Voice & video calls" icon={<MailIcon />}>
                Crystal-clear calls that pick up right where the chat left off — no app-switching
                required.
              </TiltCard>
              <TiltCard wide title="Custom stickers & media" icon={<SmileIcon />}>
                Say more with expressions made for how you actually talk, and share photos, video, and
                files without losing quality.
              </TiltCard>
            </div>
          </div>
        </section>

        <DetailsSection />

        <LiveDemoSection />

        <section id="interface" className="cv px-[min(6vw,90px)] py-[120px]">
          <div className="max-w-[1200px] mx-auto">
            <div className="reveal max-w-[640px] mb-14">
              <span className="block text-[#a996ff] text-[0.86rem] font-semibold mb-3.5">See it in action</span>
              <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold" style={H}>
                One interface, every device.
              </h2>
              <p className="mt-4 text-[#b8b0d6] text-[1.02rem] leading-relaxed max-w-[52ch]">
                Desktop, mobile, and calls — Nexo looks and feels the same wherever you open it.
              </p>
            </div>

            <div className="reveal showcase-frame relative rounded-[28px] border border-[rgba(168,150,255,0.14)] overflow-hidden">
              <Image
                src="/interface.png"
                alt="Nexo interface shown on desktop and mobile"
                width={1819}
                height={865}
                sizes="(min-width: 1200px) 1200px, 92vw"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </section>

        <section id="customize" className="cv px-[min(6vw,90px)] py-[120px]">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
            <div className="reveal order-2 lg:order-1">
              <span className="block text-[#a996ff] text-[0.86rem] font-semibold mb-3.5">Make it yours</span>
              <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold" style={H}>
                Customize every corner of your profile.
              </h2>
              <p className="mt-4 text-[#b8b0d6] text-[1.02rem] leading-relaxed max-w-[46ch]">
                Banners, avatar borders, decorations, card colors — build a profile that actually looks
                like you, not like everyone else.
              </p>
              <div className="mt-8 flex flex-col gap-4">
                <CustomizeBullet icon={<ImageIcon className="w-[18px] h-[18px] text-[#a996ff]" />} title="Banners & avatar borders">
                  Pick from curated sets or drop in your own.
                </CustomizeBullet>
                <CustomizeBullet icon={<SmileIcon className="w-[18px] h-[18px] text-[#a996ff]" />} title="Decorations">
                  Frame your avatar with animated extras.
                </CustomizeBullet>
                <CustomizeBullet icon={<GroupIcon className="w-[18px] h-[18px] text-[#a996ff]" />} title="Card colors">
                  Match your profile card to your vibe.
                </CustomizeBullet>
              </div>
            </div>

            <div className="reveal showcase-frame relative rounded-[28px] border border-[rgba(168,150,255,0.14)] overflow-hidden order-1 lg:order-2">
              <Image
                src="/customise.png"
                alt="Nexo profile customization panel"
                width={1672}
                height={941}
                sizes="(min-width: 1024px) 640px, 92vw"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </section>

        <section id="communities" className="cv relative px-[min(6vw,90px)] py-[130px] overflow-hidden">
          <div className="mega-glow mega-glow-a" aria-hidden="true" />
          <div className="mega-glow mega-glow-b" aria-hidden="true" />

          <div className="relative max-w-[1200px] mx-auto">
            <div className="reveal flex flex-col items-center text-center mb-14">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(168,150,255,0.22)] bg-[rgba(124,92,255,0.1)] pl-3 pr-4 py-2 text-[0.82rem] text-[#a996ff] mb-6">
                <GroupIcon className="w-3.5 h-3.5" />
                Built for communities
              </span>
              <h2 className="text-[clamp(2.1rem,4.4vw,3.4rem)] font-bold max-w-[18ch] leading-[1.08]" style={H}>
                From a small squad to a
                <span className="bg-[linear-gradient(100deg,#a996ff,#7c5cff_55%,#5b3df0)] bg-clip-text text-transparent"> 48,000-subscriber</span> broadcast.
              </h2>
              <p className="mt-5 text-[#b8b0d6] text-[1.05rem] leading-relaxed max-w-[56ch]">
                Groups keep your people close. Channels put you in front of everyone who cares — with
                the same fast, private core underneath both.
              </p>
            </div>

            <div className="reveal mega-frame relative rounded-[32px] p-[1.5px] mb-14" style={{ perspective: '1400px' }}>
              <div className="mega-frame-inner relative rounded-[30px] overflow-hidden">
                <Image
                  src="/channels-and-groups.png"
                  alt="Nexo groups and channels interface"
                  width={1672}
                  height={941}
                  sizes="(min-width: 1200px) 1200px, 92vw"
                  className="w-full h-auto block"
                />
              </div>
            </div>

            <div className="reveal grid grid-cols-1 sm:grid-cols-3 gap-5">
              <MegaStat icon={<GroupIcon className="w-5 h-5" />} title="Groups" value="Unlimited members" note="Shared files, pinned plans, group calls." />
              <MegaStat icon={<BoltIcon className="w-5 h-5" />} title="Channels" value="Broadcast to thousands" note="Reactions, comments, and post history." />
              <MegaStat icon={<ShieldIcon className="w-5 h-5" />} title="Control" value="Admin tools included" note="Moderation that scales with the community." />
            </div>
          </div>
        </section>

        <DesktopSection />

        <section id="how" className="cv px-[min(6vw,90px)] py-[120px]">
          <div className="max-w-[1200px] mx-auto">
            <div className="reveal max-w-[640px] mb-16">
              <span className="block text-[#a996ff] text-[0.86rem] font-semibold mb-3.5">How it works</span>
              <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold" style={H}>
                From sign-up to first message in under a minute.
              </h2>
            </div>

            <div className="reveal steps relative grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="steps-line hidden md:block absolute top-[27px] left-0 right-0 h-px" aria-hidden="true">
                <svg viewBox="0 0 100 2" preserveAspectRatio="none" className="w-full h-0.5 block">
                  <path d="M0 1 H100" />
                </svg>
              </div>
              <Step n="01" title="Create your space">
                Pick a username, set an avatar, and you&apos;re in — no phone number required.
              </Step>
              <Step n="02" title="Bring your people">
                Start a chat, spin up a group, or launch a channel for your community.
              </Step>
              <Step n="03" title="Talk however you want">
                Text, voice notes, stickers, or a full call — all in the same thread.
              </Step>
            </div>
          </div>
        </section>

        <StackSection />

        <RoadmapSection />

        <section id="rules" className="cv px-[min(6vw,90px)] py-[120px]">
          <div className="max-w-[1200px] mx-auto">
            <div className="reveal max-w-[640px] mb-16">
              <span className="block text-[#a996ff] text-[0.86rem] font-semibold mb-3.5">Community rules</span>
              <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold" style={H}>
                A space worth being in.
              </h2>
            </div>

            <div className="reveal grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-center">
              <div className="flex flex-col">
                <RuleItem icon={<ShieldIcon />} title="Respect other people's space">
                  Treat every chat, group, and channel the way you&apos;d want to be treated in it.
                </RuleItem>
                <RuleItem icon={<ClockIcon />} title="No spam, no scams">
                  Unsolicited links, fake giveaways, and bulk messages get accounts suspended.
                </RuleItem>
                <RuleItem icon={<LockIcon />} title="Protect your account">
                  Keep your password to yourself and enable everything Nexo offers to secure it.
                </RuleItem>
                <RuleItem icon={<AlertIcon />} title="Report what's wrong" last>
                  Every message, group, and channel can be reported straight to moderation.
                </RuleItem>
              </div>

              <div className="rounded-[28px] border border-[rgba(168,150,255,0.14)] bg-[linear-gradient(160deg,rgba(124,92,255,0.08),rgba(20,14,34,0.6))] p-11 min-h-[380px] flex flex-col justify-center items-start">
                <Mark className="w-20 h-20 mb-6" />
                <h3 className="text-[1.5rem] font-bold mb-3.5 max-w-[16ch]" style={H}>
                  Moderation you can actually reach.
                </h3>
                <p className="text-[#b8b0d6] text-[0.94rem] max-w-[34ch] leading-relaxed">
                  Reports get a response from a person, not a queue you never hear back from.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="cv px-[min(6vw,90px)] py-[120px]">
          <div className="max-w-[1200px] mx-auto">
            <div className="reveal max-w-[640px] mb-16">
              <span className="block text-[#a996ff] text-[0.86rem] font-semibold mb-3.5">FAQ</span>
              <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold" style={H}>
                Good to know.
              </h2>
            </div>

            <div className="reveal max-w-[760px]">
              <Faq q="Is Nexo free to use?" defaultOpen>
                Yes — messaging, calls, groups, and channels are free. There&apos;s no message limit and
                no ads.
              </Faq>
              <Faq q="Can I use it on desktop?">
                Nexo runs in your browser and as a desktop app, with your conversations synced across
                both.
              </Faq>
              <Faq q="What happens to my data?">
                Your messages and media are stored to keep your history available across devices, and
                you can delete any conversation permanently at any time.
              </Faq>
              <Faq q="How big can a group or channel get?">
                Groups and channels scale from a handful of friends to broadcast-size communities, with
                admin tools that scale alongside them.
              </Faq>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center text-center pt-16 pb-16 px-[min(6vw,90px)]">
          <div className="relative w-[120px] h-[120px] mb-9" aria-hidden="true" style={{ transformStyle: 'preserve-3d' }}>
            <div className="ring ring-a" style={{ animationDuration: '10s' }} />
            <div className="ring ring-b" style={{ animationDuration: '7s' }} />
            <div className="planet" />
          </div>
          <h2 className="reveal text-[clamp(2rem,4vw,3rem)] font-bold max-w-[16ch] mb-5" style={H}>
            Your space for real connections.
          </h2>
          <p className="reveal text-[#b8b0d6] max-w-[48ch] mb-9 text-[1.02rem]">
            Open Nexo and bring your people somewhere faster, quieter, and entirely yours.
          </p>
          <a href={APP_URL} className="reveal btn-primary rounded-full px-6 py-3 text-[0.92rem] font-semibold">
            Open Nexo →
          </a>
        </section>
      </main>

      <footer className="relative z-[2] px-[min(6vw,90px)] pt-[50px] pb-10 border-t border-[rgba(168,150,255,0.14)] flex items-center justify-between flex-wrap gap-5">
        <div className="flex items-center gap-2.5 font-semibold text-[0.95rem]">
          <Mark className="w-[26px] h-[26px]" />
          NEXO
        </div>
        <div className="flex items-center gap-6 text-[0.82rem] text-[#7d7599]">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            GitHub
          </a>
          <a href={DOWNLOAD_URL} className="hover:text-white transition-colors">
            Download
          </a>
          <span>© 2026 Nexo. Built for real conversations.</span>
        </div>
      </footer>
    </div>
  );
}

function StripItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[#b8b0d6] text-[0.86rem]">
      {icon}
      {label}
    </div>
  );
}

function TiltCard({ title, icon, wide, children }: { title: string; icon: React.ReactNode; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`tilt-card relative rounded-[20px] border border-[rgba(168,150,255,0.14)] p-7 overflow-hidden min-h-[200px] ${wide ? 'md:col-span-2' : ''}`}>
      <div className="tilt-icon w-11 h-11 rounded-xl flex items-center justify-center border border-[rgba(168,150,255,0.14)] bg-[rgba(124,92,255,0.12)] text-[#a996ff] mb-5" style={{ transform: 'translateZ(30px)' }}>
        {icon}
      </div>
      <h3 className="text-[1.12rem] font-semibold mb-2.5" style={{ ...H, transform: 'translateZ(24px)' }}>
        {title}
      </h3>
      <p className="text-[0.92rem] text-[#b8b0d6] leading-relaxed" style={{ transform: 'translateZ(18px)' }}>
        {children}
      </p>
    </div>
  );
}

function CustomizeBullet({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-[rgba(168,150,255,0.14)] bg-[rgba(124,92,255,0.1)] flex-none mt-0.5">{icon}</div>
      <div>
        <div className="text-[0.94rem] font-semibold mb-0.5">{title}</div>
        <div className="text-[0.86rem] text-[#7d7599] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function MegaStat({ icon, title, value, note }: { icon: React.ReactNode; title: string; value: string; note: string }) {
  return (
    <div className="mega-stat rounded-[20px] border border-[rgba(168,150,255,0.14)] p-6">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[rgba(168,150,255,0.18)] bg-[rgba(124,92,255,0.14)] text-[#a996ff] mb-4">{icon}</div>
      <div className="text-[0.8rem] text-[#a996ff] font-semibold mb-1.5">{title}</div>
      <div className="text-[1.06rem] font-semibold mb-1.5" style={H}>
        {value}
      </div>
      <p className="text-[0.86rem] text-[#7d7599] leading-relaxed">{note}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="w-[54px] h-[54px] rounded-full flex items-center justify-center border border-[#a996ff] text-[#a996ff] font-bold mb-6 relative z-[2] bg-[#050308]" style={H}>
        {n}
      </div>
      <h3 className="text-[1.1rem] font-semibold mb-2.5">{title}</h3>
      <p className="text-[#b8b0d6] text-[0.92rem] leading-relaxed max-w-[32ch]">{children}</p>
    </div>
  );
}

function RuleItem({ icon, title, children, last }: { icon: React.ReactNode; title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex gap-[18px] py-5 border-t border-[rgba(168,150,255,0.14)] ${last ? 'border-b' : ''}`}>
      <div className="w-5 h-5 text-[#a996ff] flex-none mt-0.5">{icon}</div>
      <div>
        <h4 className="text-[1rem] font-semibold mb-1.5" style={H}>
          {title}
        </h4>
        <p className="text-[0.88rem] text-[#b8b0d6] leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function Faq({ q, children, defaultOpen }: { q: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="border-t border-[rgba(168,150,255,0.14)] py-5 last:border-b group">
      <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-[1.02rem]" style={H}>
        {q}
        <span className="plus w-[26px] h-[26px] rounded-full border border-[rgba(168,150,255,0.14)] flex items-center justify-center flex-none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3 h-3" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </summary>
      <p className="text-[#b8b0d6] text-[0.94rem] leading-relaxed mt-3.5 max-w-[62ch]">{children}</p>
    </details>
  );
}

function Mark({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <div className={`relative shrink-0 ${className ?? ''}`}>
      <Image src="/logo.png" alt="" fill sizes="80px" className="object-contain" priority={priority} />
    </div>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7z" />
    </svg>
  );
}
function GroupIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2S15.5 16.4 15.5 20" />
      <circle cx="18" cy="9" r="2.6" />
      <path d="M15.8 13.5c2.7.2 4.7 2.4 4.7 5.3" />
    </svg>
  );
}
function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v9a2.5 2.5 0 0 1-2.5 2.5H7l-4 4z" />
    </svg>
  );
}
function ImageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M4 4h16v11H7l-3 3z" />
    </svg>
  );
}
function SmileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10h.01M15 10h.01M8 15c1.2 1.2 2.6 1.8 4 1.8s2.8-.6 4-1.8" />
    </svg>
  );
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}
function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M12 9v4M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function Ico({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const P = {
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  forward: 'M15 5l6 6-6 6M21 11H9a6 6 0 0 0-6 6',
  pin: 'M12 17v5M8 3h8l-1 7 3 3H6l3-3z',
  check: 'm5 12 5 5L20 7',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3c0-6-4-11-8-11z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  download: 'M12 3v12m0 0-4-4m4 4 4-4M4 20h16',
  code: 'm8 7-5 5 5 5M16 7l5 5-5 5',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
};

function Head({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="reveal max-w-[640px] mb-14">
      <span className="block text-[#a996ff] text-[0.86rem] font-semibold mb-3.5">{eyebrow}</span>
      <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold" style={H}>
        {title}
      </h2>
      {text && <p className="mt-4 text-[#b8b0d6] text-[1.02rem] leading-relaxed max-w-[52ch]">{text}</p>}
    </div>
  );
}

function Bento({ span = '', icon, title, text, children }: { span?: string; icon: React.ReactNode; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className={`tilt-card relative rounded-[20px] border ${BORDER} p-7 overflow-hidden min-h-[270px] flex flex-col ${span}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${BORDER} bg-[rgba(124,92,255,0.12)] text-[#a996ff] mb-5`}>{icon}</div>
      <h3 className="text-[1.12rem] font-semibold mb-2" style={H}>
        {title}
      </h3>
      <p className="text-[0.9rem] text-[#b8b0d6] leading-relaxed max-w-[46ch]">{text}</p>
      <div className="mt-auto pt-6">{children}</div>
    </div>
  );
}

function DetailsSection() {
  return (
    <section id="details" className="cv px-[min(6vw,90px)] py-[120px]">
      <div className="max-w-[1200px] mx-auto">
        <Head eyebrow="Details that matter" title="Small things, done properly." text="The stuff you use fifty times a day should feel effortless. We sweated every one of them." />
        <div className="reveal grid grid-cols-1 md:grid-cols-6 gap-5" style={{ perspective: '1200px' }}>
          <Bento span="md:col-span-4" icon={<Ico d={P.mic} />} title="Voice notes with a real waveform" text="Hold to record, swipe to cancel, replay at your own speed.">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 w-full max-w-[340px] rounded-2xl rounded-br-md pl-2 pr-3.5 py-2 bg-[linear-gradient(135deg,#7c5cff,#5b3df0)]">
                <div className="w-8 h-8 rounded-full flex-none flex items-center justify-center bg-white/15">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="#fff" aria-hidden="true">
                    <path d="M6 4.5v15l13-7.5z" />
                  </svg>
                </div>
                <div className="flex items-end gap-[3px] h-5 flex-1" aria-hidden="true">
                  {BARS.map((h, i) => (
                    <span key={i} className="voice-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
                  ))}
                </div>
                <span className="text-[0.72rem] text-white/85 flex-none">0:12</span>
              </div>
              <div className="flex gap-1.5">
                {['1×', '1.5×', '2×'].map((s) => (
                  <span key={s} className={`rounded-full border px-3 py-1 text-[0.78rem] ${s === '1.5×' ? 'border-[#a996ff] text-white bg-[rgba(124,92,255,0.25)]' : `${BORDER} text-[#7d7599]`}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Bento>

          <Bento span="md:col-span-2" icon={<Ico d={P.pin} />} title="React, edit, pin" text="Reactions, edits, and pinned messages — all inline.">
            <div className="flex flex-wrap items-center gap-2">
              {['❤️ 4', '🔥 2', '👍 7'].map((r) => (
                <span key={r} className={`rounded-full border ${BORDER} bg-white/5 px-3 py-1 text-[0.8rem]`}>
                  {r}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-[0.76rem] text-[#a996ff]">
                <Ico d={P.pin} className="w-3.5 h-3.5" />
                Pinned
              </span>
            </div>
          </Bento>

          <Bento span="md:col-span-2" icon={<Ico d={P.forward} />} title="Forward anywhere" text="Send a message to any chat or channel in two taps.">
            <div className={`rounded-2xl rounded-bl-md border ${BORDER} bg-white/5 px-4 py-3`}>
              <div className="text-[0.72rem] text-[#a996ff] mb-1">Forwarded from mitywa</div>
              <div className="text-[0.84rem]">Meet at 7? 🎧</div>
            </div>
          </Bento>

          <Bento span="md:col-span-2" icon={<Ico d={P.eye} />} title="Presence & read receipts" text="See who's online and when your message was read.">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[0.82rem] text-[#b8b0d6]">
                <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80]" />
                online
              </span>
              <span className="inline-flex items-center gap-1 text-[0.78rem] text-[#a996ff]">
                <Ico d={P.check} className="w-3.5 h-3.5" />
                <Ico d={P.check} className="w-3.5 h-3.5 -ml-2" />
                Read
              </span>
            </div>
          </Bento>

          <Bento span="md:col-span-2" icon={<Ico d={P.palette} />} title="Your look, your rules" text="Dark, light, or fully custom themes. Wallpapers per chat.">
            <div className="flex items-center gap-3">
              {[
                ['Dark', 'bg-[#0d0918]'],
                ['Light', 'bg-[#f2eeff]'],
                ['Custom', 'bg-[linear-gradient(135deg,#7c5cff,#f472b6)]'],
              ].map(([n, c]) => (
                <div key={n} className="flex flex-col items-center gap-1.5">
                  <span className={`w-9 h-9 rounded-full border border-[rgba(168,150,255,0.3)] ${c}`} />
                  <span className="text-[0.7rem] text-[#7d7599]">{n}</span>
                </div>
              ))}
            </div>
          </Bento>
        </div>
      </div>
    </section>
  );
}

type DemoStatus = 'sending' | 'sent' | 'read';
type DemoMsg = { id: number; mine: boolean; text: string; status?: DemoStatus; liked?: boolean };

const STATUS_LABEL: Record<DemoStatus, string> = { sending: 'Sending…', sent: '✓ Sent', read: '✓✓ Read' };
const DEMO_CHIPS = ['Hi Nexo 👋', 'Is it free?', 'Can I make a group?'];
const DEMO_RULES: [RegExp, string][] = [
  [/\b(hi|hello|hey)\b|привет/i, 'Hey! Good to see you here 👋'],
  [/free|price|cost/i, 'Free — no message limits, no ads.'],
  [/group|channel/i, 'Groups and channels scale from a small squad to thousands.'],
  [/call|video|voice/i, 'Voice and video calls start right from the chat.'],
  [/desktop|windows|app/i, 'There is a Windows app, and Nexo runs in the browser too.'],
];
const DEMO_FALLBACKS = ['Delivered instantly ⚡', 'Optimistic UI at work ✨', 'Tap any message to react ❤️', 'No spinners, just talking.'];
const DEMO_SEED: DemoMsg[] = [{ id: 1, mine: false, text: 'Hey! This is a live demo — type something 👇' }];

function LiveDemoSection() {
  const [msgs, setMsgs] = useState<DemoMsg[]>(DEMO_SEED);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(2);
  const fallbackRef = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [msgs, typing]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const send = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    const id = idRef.current++;
    setMsgs((m) => [...m, { id, mine: true, text: value, status: 'sending' as const }].slice(-40));
    setText('');

    later(() => setMsgs((m) => m.map((x) => (x.id === id ? { ...x, status: 'sent' as const } : x))), 350);
    later(() => setTyping(true), 700);
    later(() => {
      setTyping(false);
      const rule = DEMO_RULES.find(([re]) => re.test(value));
      const reply = rule ? rule[1] : DEMO_FALLBACKS[fallbackRef.current++ % DEMO_FALLBACKS.length];
      const rid = idRef.current++;
      setMsgs((m) => [...m.map((x) => (x.id === id ? { ...x, status: 'read' as const } : x)), { id: rid, mine: false, text: reply }].slice(-40));
    }, 1900);
  };

  const toggleLike = (id: number) => {
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, liked: !x.liked } : x)));
  };

  return (
    <section id="demo" className="cv px-[min(6vw,90px)] py-[120px]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
        <div className="reveal">
          <span className="block text-[#a996ff] text-[0.86rem] font-semibold mb-3.5">Try it right here</span>
          <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold" style={H}>
            Feel the speed before you sign up.
          </h2>
          <p className="mt-4 text-[#b8b0d6] text-[1.02rem] leading-relaxed max-w-[46ch]">
            Send a message. It appears the instant you hit enter, then moves through sent and read —
            the same optimistic flow the real app uses. Tap any bubble to react.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            <CustomizeBullet icon={<BoltIcon className="w-[18px] h-[18px] text-[#a996ff]" />} title="Instant by design">
              Messages render immediately and reconcile in the background.
            </CustomizeBullet>
            <CustomizeBullet icon={<SmileIcon className="w-[18px] h-[18px] text-[#a996ff]" />} title="Reactions on tap">
              Click any message bubble to drop a ❤️.
            </CustomizeBullet>
          </div>
        </div>

        <div className="reveal">
          <div className={`showcase-frame rounded-[28px] border ${BORDER} p-5`}>
            <div className={`flex items-center gap-3 pb-4 mb-4 border-b ${BORDER}`}>
              <Mark className="w-9 h-9" />
              <div>
                <div className="font-semibold text-[0.92rem]">Nexo demo</div>
                <div className="text-[0.76rem] text-[#a996ff] inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                  online
                </div>
              </div>
            </div>

            <div ref={listRef} role="log" aria-live="polite" aria-label="Demo conversation" className="demo-scroll h-[300px] overflow-y-auto flex flex-col gap-2.5 pr-1">
              {msgs.map((m) => (
                <div key={m.id} className={`msg-pop flex flex-col max-w-[82%] ${m.mine ? 'self-end items-end' : 'self-start items-start'}`}>
                  <button
                    type="button"
                    onClick={() => toggleLike(m.id)}
                    aria-label={`React to message: ${m.text}`}
                    className={`text-left rounded-2xl px-4 py-2.5 text-[0.86rem] leading-snug break-words ${m.mine ? 'rounded-br-md text-white bg-[linear-gradient(135deg,#7c5cff,#5b3df0)]' : `rounded-bl-md border ${BORDER} bg-white/5`
                      }`}
                  >
                    {m.text}
                  </button>
                  {m.liked && <span className={`-mt-1.5 rounded-full border ${BORDER} bg-[#14102a] px-1.5 text-[0.72rem]`}>❤️</span>}
                  {m.mine && m.status && <span className="mt-1 text-[0.68rem] text-[#7d7599]">{STATUS_LABEL[m.status]}</span>}
                </div>
              ))}
              {typing && (
                <div className={`msg-pop self-start flex items-center gap-1.5 rounded-2xl rounded-bl-md border ${BORDER} bg-white/5 px-4 py-3`} aria-label="Typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
                  <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {DEMO_CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => send(c)}
                  className={`rounded-full border ${BORDER} bg-white/[0.03] px-3 py-1.5 text-[0.78rem] text-[#b8b0d6] transition-colors hover:border-[#a996ff] hover:text-white`}
                >
                  {c}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(text);
              }}
              className={`mt-3 flex items-center gap-2 rounded-full border ${BORDER} bg-white/[0.03] pl-4 pr-1.5 py-1.5`}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={200}
                enterKeyHint="send"
                autoComplete="off"
                aria-label="Message"
                placeholder="Write a message…"
                className="flex-1 min-w-0 bg-transparent text-[0.88rem] text-white placeholder:text-[#7d7599] outline-none"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                aria-label="Send message"
                className="btn-primary w-10 h-10 rounded-full justify-center flex-none disabled:opacity-40 disabled:pointer-events-none"
              >
                <Ico d={P.send} className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopSection() {
  const perks = [
    ['Native notifications', 'Toasts pop up even when the app is in the tray — click to jump straight to the chat.'],
    ['Unread badge in the tray', 'Always know if something is waiting, without opening anything.'],
    ['Auto-updates', 'New versions arrive on their own. No installers to chase.'],
  ];
  return (
    <section id="desktop" className="cv px-[min(6vw,90px)] py-[120px]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
        <div className="reveal">
          <span className="block text-[#a996ff] text-[0.86rem] font-semibold mb-3.5">Desktop app</span>
          <h2 className="text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold" style={H}>
            Lives in your tray. Ready when you are.
          </h2>
          <p className="mt-4 text-[#b8b0d6] text-[1.02rem] leading-relaxed max-w-[46ch]">The Windows app keeps Nexo one click away and never lets you miss a message.</p>
          <div className="mt-8 flex flex-col gap-5">
            {perks.map(([t, d]) => (
              <div key={t} className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${BORDER} bg-[rgba(124,92,255,0.1)] flex-none mt-0.5 text-[#a996ff]`}>
                  <Ico d={P.check} className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <div className="text-[0.94rem] font-semibold mb-0.5">{t}</div>
                  <div className="text-[0.86rem] text-[#7d7599] leading-relaxed">{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <a href={DOWNLOAD_URL} className="btn-primary rounded-full px-6 py-3 text-[0.92rem] font-semibold">
              <Ico d={P.download} className="w-4 h-4" />
              Download for Windows
            </a>
            <a href={APP_URL} className="btn-ghost rounded-full px-6 py-3 text-[0.92rem] font-semibold">
              Use in browser
            </a>
          </div>
        </div>

        <div className="reveal relative" aria-hidden="true">
          <div className={`showcase-frame rounded-[24px] border ${BORDER} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-4 py-3 border-b ${BORDER} bg-white/[0.02]`}>
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="ml-3 text-[0.72rem] tracking-wide text-[#7d7599]">NEXO</span>
            </div>
            <div className="grid grid-cols-[110px_1fr] min-h-[300px]">
              <div className={`border-r ${BORDER} p-3 flex flex-col gap-2.5`}>
                {[true, false, false, false].map((active, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-lg p-2 ${active ? 'bg-[rgba(124,92,255,0.18)] border border-[rgba(169,150,255,0.35)]' : ''}`}>
                    <span className="w-6 h-6 rounded-full bg-white/10 flex-none" />
                    <span className="h-1.5 flex-1 rounded bg-white/10" />
                  </div>
                ))}
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="h-8 w-[62%] rounded-2xl rounded-bl-md bg-white/5" />
                <div className="h-8 w-[48%] rounded-2xl rounded-br-md self-end bg-[linear-gradient(135deg,#7c5cff,#5b3df0)]" />
                <div className="h-8 w-[70%] rounded-2xl rounded-bl-md bg-white/5" />
              </div>
            </div>
          </div>
          <div className={`toast-pop absolute -bottom-5 right-3 md:-right-4 flex items-center gap-3 rounded-2xl border ${BORDER} bg-[rgba(20,14,34,0.9)] backdrop-blur-xl px-4 py-3 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.7)]`}>
            <span className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#7c5cff,#5b3df0)] flex-none" />
            <div>
              <div className="text-[0.8rem] font-semibold">mitywa</div>
              <div className="text-[0.72rem] text-[#7d7599]">Are you there? 👀</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const STACK: [string, string][] = [
  ['Next.js + TypeScript', 'App & routing'],
  ['Firebase / Firestore', 'Realtime data & auth'],
  ['LiveKit', 'Voice & video calls'],
  ['Cloudinary', 'Media delivery'],
  ['Zustand', 'Client state'],
  ['Tailwind CSS', 'Design system'],
  ['Electron', 'Windows desktop app'],
  ['Vercel', 'Hosting'],
];
const PRINCIPLES: [string, string][] = [
  ['Optimistic UI', 'Your message shows up the instant you hit send.'],
  ['Live listeners', 'Data is pushed to you — no polling, no refresh.'],
  ['Rules on the server', 'Firestore security rules guard every read and write.'],
];

function StackSection() {
  return (
    <section id="stack" className="cv relative px-[min(6vw,90px)] py-[120px]">
      <div className="max-w-[1200px] mx-auto">
        <Head eyebrow="Under the hood" title="Engineered for real-time." text="A modern stack, chosen so that speed is a feature and not an afterthought." />
        <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-4">
          {STACK.map(([name, role]) => (
            <div key={name} className={`stack-chip rounded-[16px] border ${BORDER} p-5`}>
              <div className="text-[0.95rem] font-semibold mb-1" style={H}>
                {name}
              </div>
              <div className="text-[0.8rem] text-[#7d7599]">{role}</div>
            </div>
          ))}
        </div>

        <div className="reveal mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRINCIPLES.map(([t, d]) => (
            <div key={t} className="flex items-start gap-3.5">
              <div className="w-5 h-5 text-[#a996ff] flex-none mt-0.5">
                <Ico d={P.check} className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[1rem] font-semibold mb-1.5" style={H}>
                  {t}
                </h4>
                <p className="text-[0.88rem] text-[#b8b0d6] leading-relaxed max-w-[32ch]">{d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal mt-12">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost rounded-full px-6 py-3 text-[0.92rem] font-semibold">
            <Ico d={P.code} className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

type Status = 'In progress' | 'Planned' | 'Exploring';
const ROADMAP: { status: Status; title: string; text: string }[] = [
  { status: 'In progress', title: 'Faster everywhere', text: 'Virtualized lists and optimized images, so huge chats and channels stay buttery smooth.' },
  { status: 'In progress', title: 'Calls, upgraded', text: 'Sharper video, steadier connections, and polish on every call screen.' },
  { status: 'Planned', title: 'Signed desktop installer', text: 'One-click Windows install with no scary security warnings.' },
  { status: 'Planned', title: 'Screen sharing & group calls', text: 'Share your screen and talk with the whole group at once.' },
  { status: 'Planned', title: 'Smarter notifications', text: 'Per-chat mute rules and quiet hours, so you hear only what matters.' },
  { status: 'Exploring', title: 'Mobile apps', text: 'Nexo in your pocket, built natively for your phone.' },
];

function StatusPill({ status }: { status: Status }) {
  const cls =
    status === 'In progress'
      ? 'border-[#a996ff] bg-[rgba(124,92,255,0.22)] text-white'
      : status === 'Planned'
        ? `${BORDER} text-[#b8b0d6]`
        : 'border-dashed border-[rgba(168,150,255,0.3)] text-[#7d7599]';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.74rem] font-semibold self-start ${cls}`}>
      {status === 'In progress' && <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#a996ff]" />}
      {status}
    </span>
  );
}

function RoadmapSection() {
  return (
    <section id="roadmap" className="cv px-[min(6vw,90px)] py-[120px]">
      <div className="max-w-[1200px] mx-auto">
        <Head eyebrow="What's next" title="We're just getting started." text="Nexo ships constantly. Here's a look at what we're building next." />
        <div className="reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROADMAP.map((item) => (
            <div key={item.title} className={`stack-chip rounded-[20px] border ${BORDER} p-6 flex flex-col gap-4 min-h-[190px]`}>
              <StatusPill status={item.status} />
              <div>
                <h3 className="text-[1.08rem] font-semibold mb-2" style={H}>
                  {item.title}
                </h3>
                <p className="text-[0.88rem] text-[#b8b0d6] leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="reveal mt-8 text-[0.82rem] text-[#7d7599]">A roadmap is a direction, not a promise — priorities shift with what you tell us you need.</p>
      </div>
    </section>
  );
}

const nexoStyles = `
.nexo-landing { font-family: var(--font-body), system-ui, -apple-system, 'Segoe UI', sans-serif; }
.nexo-landing section[id] { scroll-margin-top: 90px; }
.nexo-landing .cv { content-visibility: auto; contain-intrinsic-size: auto 800px; }

.nexo-landing a:focus-visible,
.nexo-landing button:focus-visible,
.nexo-landing summary:focus-visible,
.nexo-landing input:focus-visible { outline: 2px solid #a996ff; outline-offset: 3px; border-radius: 10px; }

.nexo-landing .skip-link { position: absolute; left: 16px; top: -64px; z-index: 200; padding: 10px 18px; border-radius: 999px; background: #7c5cff; color: #fff; font-weight: 600; font-size: 0.9rem; transition: top .2s; }
.nexo-landing .skip-link:focus { top: 14px; }

.nexo-landing .glow { position: fixed; border-radius: 50%; filter: blur(110px); z-index: 0; pointer-events: none; }
.nexo-landing .glow-1 { width: 640px; height: 640px; top: -220px; left: -160px; background: radial-gradient(circle, rgba(124,92,255,0.35), transparent 70%); }
.nexo-landing .glow-2 { width: 560px; height: 560px; bottom: -260px; right: -140px; background: radial-gradient(circle, rgba(91,61,240,0.32), transparent 70%); }

.nexo-landing .btn-primary { display:inline-flex; align-items:center; gap:8px; color:#fff; background:linear-gradient(135deg,#7c5cff,#5b3df0); box-shadow:0 8px 24px -8px rgba(124,92,255,0.6); transition: transform .3s cubic-bezier(.16,.84,.32,1), box-shadow .3s, opacity .2s; }
.nexo-landing .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 32px -10px rgba(124,92,255,0.75); }
.nexo-landing .btn-ghost { display:inline-flex; align-items:center; gap:8px; border:1px solid rgba(168,150,255,0.14); background: rgba(255,255,255,0.02); transition: border-color .2s, background .2s; }
.nexo-landing .btn-ghost:hover { border-color:#a996ff; background: rgba(124,92,255,0.08); }

.nexo-landing .anim-h1, .nexo-landing .anim-lead, .nexo-landing .anim-ctas, .nexo-landing .anim-strip, .nexo-landing .eyebrow {
  opacity: 0; animation: nexo-rise .9s cubic-bezier(.16,.84,.32,1) forwards;
}
.nexo-landing .eyebrow { animation-delay: .1s; }
.nexo-landing .anim-h1 { animation-delay: .22s; }
.nexo-landing .anim-lead { animation-delay: .34s; }
.nexo-landing .anim-ctas { animation-delay: .46s; }
.nexo-landing .anim-strip { animation-delay: .58s; }
@keyframes nexo-rise { from { opacity:0; transform: translateY(22px); } to { opacity:1; transform: translateY(0); } }

.nexo-landing .planet { position:absolute; top:50%; left:50%; width:46px; height:46px; margin:-23px 0 0 -23px; border-radius:50%; background: radial-gradient(circle at 32% 30%, #a996ff, #5b3df0 70%); box-shadow: 0 0 40px rgba(124,92,255,0.55); }
.nexo-landing .ring { position:absolute; top:50%; left:50%; border:1.5px solid rgba(169,150,255,0.45); border-radius:50%; transform-style: preserve-3d; }
.nexo-landing .ring-a { width:150px; height:150px; margin:-75px 0 0 -75px; transform: rotateX(72deg) rotateZ(0deg); animation: nexo-spin 14s linear infinite; }
.nexo-landing .ring-b { width:110px; height:110px; margin:-55px 0 0 -55px; transform: rotateX(72deg) rotateZ(60deg); border-color: rgba(124,92,255,0.3); animation: nexo-spinb 9s linear infinite; }
.nexo-landing .ring-a::after, .nexo-landing .ring-b::after { content:''; position:absolute; width:8px; height:8px; border-radius:50%; background:#a996ff; box-shadow: 0 0 12px 2px rgba(169,150,255,0.9); top:-4px; left:50%; margin-left:-4px; }
@keyframes nexo-spin { to { transform: rotateX(72deg) rotateZ(360deg); } }
@keyframes nexo-spinb { to { transform: rotateX(72deg) rotateZ(-300deg); } }

.nexo-landing .chat-card {
  background: linear-gradient(180deg, rgba(24,17,42,0.9), rgba(13,9,24,0.92));
  box-shadow: 0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02) inset;
  transform: rotateY(var(--ry, -10deg)) rotateX(var(--rx, 6deg));
  transform-style: preserve-3d;
  transition: transform .15s ease-out;
  will-change: transform;
  opacity: 0;
  animation: nexo-rise2 1s cubic-bezier(.16,.84,.32,1) .5s forwards, nexo-float 7s ease-in-out 1.5s infinite;
}
@keyframes nexo-rise2 { from { opacity:0; transform: rotateY(-24deg) rotateX(10deg) translateY(30px); } to { opacity:1; } }
@keyframes nexo-float { 0%,100% { transform: rotateY(var(--ry,-10deg)) rotateX(var(--rx,6deg)) translateY(0px); } 50% { transform: rotateY(var(--ry,-10deg)) rotateX(var(--rx,6deg)) translateY(-14px); } }

.nexo-landing .voice-bubble { box-shadow: 0 10px 24px -12px rgba(91,61,240,0.6); }
.nexo-landing .voice-play { transition: background .2s; }
.nexo-landing .voice-play:hover { background: rgba(255,255,255,0.25); }
.nexo-landing .voice-bar { width:2.5px; flex:none; background: rgba(255,255,255,0.85); border-radius:2px; align-self:center; transform-origin:center; animation: nexo-wave 1.3s ease-in-out infinite; }
@keyframes nexo-wave { 0%,100% { transform: scaleY(0.55); } 50% { transform: scaleY(1); } }

.nexo-landing .float-card {
  position:absolute; padding:14px 18px; border-radius:14px;
  background: rgba(20,14,34,0.75); border:1px solid rgba(168,150,255,0.14); backdrop-filter: blur(16px);
  display:flex; align-items:center; gap:12px; box-shadow: 0 20px 40px -18px rgba(0,0,0,0.6);
  transform: translateZ(60px); opacity:0;
}
.nexo-landing .fc-1 { top:8%; left:-8%; animation: nexo-rise .9s cubic-bezier(.16,.84,.32,1) .7s forwards, nexo-floaty 6s ease-in-out 1.6s infinite; }
.nexo-landing .fc-2 { bottom:10%; right:-10%; animation: nexo-rise .9s cubic-bezier(.16,.84,.32,1) .82s forwards, nexo-floaty 6.5s ease-in-out 1.8s infinite reverse; }
@keyframes nexo-floaty { 0%,100% { transform: translateZ(60px) translateY(0); } 50% { transform: translateZ(60px) translateY(-10px); } }
@media (max-width: 640px) { .nexo-landing .fc-1, .nexo-landing .fc-2 { display:none; } }

.nexo-landing .tilt-card { background: linear-gradient(160deg, rgba(255,255,255,0.035), rgba(255,255,255,0.008)); transition: transform .25s cubic-bezier(.16,.84,.32,1), border-color .3s, box-shadow .3s; }
.nexo-landing .tilt-card:hover { border-color: rgba(169,150,255,0.4); box-shadow: 0 30px 60px -30px rgba(91,61,240,0.55); }
.nexo-landing .tilt-card::before {
  content:''; position:absolute; inset:0;
  background: radial-gradient(320px circle at var(--mx,50%) var(--my,50%), rgba(169,150,255,0.16), transparent 60%);
  opacity:0; transition: opacity .3s; pointer-events:none;
}
.nexo-landing .tilt-card:hover::before { opacity:1; }

.nexo-landing .showcase-frame {
  background: linear-gradient(160deg, rgba(255,255,255,0.035), rgba(255,255,255,0.008));
  box-shadow: 0 40px 90px -40px rgba(91,61,240,0.45), 0 0 0 1px rgba(255,255,255,0.02) inset;
  transition: transform .35s cubic-bezier(.16,.84,.32,1), box-shadow .35s;
}
.nexo-landing .showcase-frame:hover { transform: translateY(-4px); box-shadow: 0 50px 110px -40px rgba(91,61,240,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset; }

.nexo-landing .mega-glow { position:absolute; border-radius:50%; filter: blur(120px); pointer-events:none; z-index:0; }
.nexo-landing .mega-glow-a { width:680px; height:680px; top:-160px; left:50%; transform: translateX(-70%); background: radial-gradient(circle, rgba(124,92,255,0.32), transparent 70%); }
.nexo-landing .mega-glow-b { width:520px; height:520px; bottom:-180px; right:8%; background: radial-gradient(circle, rgba(91,61,240,0.28), transparent 70%); }

.nexo-landing .mega-frame { background: linear-gradient(135deg, rgba(169,150,255,0.55), rgba(91,61,240,0.15) 40%, rgba(169,150,255,0.4)); animation: nexo-rise .9s cubic-bezier(.16,.84,.32,1) .1s both; }
.nexo-landing .mega-frame-inner {
  background: #0a0714;
  box-shadow: 0 60px 130px -50px rgba(91,61,240,0.65), 0 0 0 1px rgba(255,255,255,0.02) inset;
  transition: transform .5s cubic-bezier(.16,.84,.32,1), box-shadow .5s;
}
.nexo-landing .mega-frame:hover .mega-frame-inner { transform: scale(1.012) translateY(-6px); box-shadow: 0 80px 160px -50px rgba(91,61,240,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset; }

.nexo-landing .mega-stat { background: linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); transition: transform .3s cubic-bezier(.16,.84,.32,1), border-color .3s, box-shadow .3s; }
.nexo-landing .mega-stat:hover { transform: translateY(-3px); border-color: rgba(169,150,255,0.4); box-shadow: 0 24px 50px -26px rgba(91,61,240,0.55); }

.nexo-landing .steps-line path { stroke:#a996ff; stroke-width:2; fill:none; stroke-dasharray:1000; stroke-dashoffset:1000; transition: stroke-dashoffset 1.4s cubic-bezier(.16,.84,.32,1); }
.nexo-landing .steps-line.in-view path { stroke-dashoffset:0; }

.nexo-landing .reveal { opacity:0; transform: translateY(30px); transition: opacity .8s cubic-bezier(.16,.84,.32,1), transform .8s cubic-bezier(.16,.84,.32,1); }
.nexo-landing .reveal.in-view { opacity:1; transform: translateY(0); }

.nexo-landing summary::-webkit-details-marker { display:none; }
.nexo-landing details[open] .plus { background:#7c5cff; border-color:#7c5cff; }
.nexo-landing details[open] .plus svg { transform: rotate(45deg); }
.nexo-landing .plus svg { transition: transform .3s cubic-bezier(.16,.84,.32,1); }

.nexo-landing .toast-pop { animation: nexo-toast 6s cubic-bezier(.16,.84,.32,1) infinite; }
@keyframes nexo-toast {
  0%, 8% { opacity: 0; transform: translateX(24px); }
  16%, 78% { opacity: 1; transform: translateX(0); }
  90%, 100% { opacity: 0; transform: translateX(24px); }
}
.nexo-landing .pulse-dot { animation: nexo-pulse 1.8s ease-in-out infinite; }
@keyframes nexo-pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(169,150,255,0.6); } 50% { opacity: .6; box-shadow: 0 0 0 6px rgba(169,150,255,0); } }
.nexo-landing .stack-chip { background: linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); transition: transform .3s cubic-bezier(.16,.84,.32,1), border-color .3s, box-shadow .3s; }
.nexo-landing .stack-chip:hover { transform: translateY(-3px); border-color: rgba(169,150,255,0.4); box-shadow: 0 24px 50px -26px rgba(91,61,240,0.55); }

.nexo-landing .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #a996ff; animation: nexo-typing 1.1s ease-in-out infinite; }
@keyframes nexo-typing { 0%, 60%, 100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-4px); opacity: 1; } }
.nexo-landing .msg-pop { animation: nexo-pop .3s cubic-bezier(.16,.84,.32,1) both; }
@keyframes nexo-pop { from { opacity: 0; transform: translateY(8px) scale(.96); } to { opacity: 1; transform: none; } }
.nexo-landing .demo-scroll { scrollbar-width: thin; scrollbar-color: rgba(169,150,255,0.3) transparent; overscroll-behavior: contain; }

@media (prefers-reduced-motion: reduce) {
  .nexo-landing * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
}
`;