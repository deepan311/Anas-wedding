import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import {
    motion,
    AnimatePresence,
    useInView,
    useReducedMotion,
} from "framer-motion";
import { FiVolume2, FiVolumeX, FiMapPin, FiChevronDown } from "react-icons/fi";
import introVideoPath from "./assets/intro.mp4";
import loopVideoPath from "./assets/loops.mp4";
import introPoster from "./assets/intro-poster.jpg";
import qr from "./assets/qr.png";

import bcm from "./assets/new-bg-a.mp3";
/* ------------------------------------------------------------------ */
/*  Assets                                                             */
/* ------------------------------------------------------------------ */
const ASSETS = {
    introVideo: introVideoPath,
    loopVideo: loopVideoPath,
    introPoster,
    qrImage: qr,
    nasheedAudio: bcm,
    googleMapUrl: "https://maps.app.goo.gl/p2dJU2om5vQNSyEy6",
};

/* ------------------------------------------------------------------ */
/*  Design tokens — dusty rose + antique gold                          */
/*  deep    #3A2E2E  cocoa-mauve, page ground behind the card          */
/*  rose    #8B6D6D  pale dusty rose, primary surface                  */
/*  panel   #5A4646  deeper mauve, cards on the rose surface           */
/*  ivory   #F7F1EA  warm ivory, primary text                          */
/*  gold    #D8B26A  antique gold, primary metallic accent             */
/*  gold-lt #EBD5A0  soft gold, glow / highlight                       */
/*  rose-lt #E7D6D6  blush highlight for sub-labels                    */
/*  plum    #4A3437  deep accent, quote backdrop                       */
/* ------------------------------------------------------------------ */

const FONT_LINK_ID = "wedding-invite-fonts";
const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Marcellus&family=Jost:wght@300;400;500&family=Great+Vibes&family=Scheherazade+New:wght@400;700&family=Noto+Naskh+Arabic:wght@400;600&display=swap";

const FONT_DISPLAY = "'Cormorant Garamond', 'Georgia', serif";
const FONT_SCRIPT = "'Great Vibes', 'Segoe Script', cursive";
const FONT_LABEL = "'Marcellus', 'Cormorant Garamond', serif";
const FONT_BODY = "'Jost', 'Helvetica Neue', system-ui, sans-serif";
const FONT_ARABIC = "'Noto Naskh Arabic', 'Amiri', serif";
const FONT_QURAN = "'Scheherazade New', 'Amiri', serif";

type SectionId = "hero" | "family" | "location" | "quote";

/* ------------------------------------------------------------------ */
/*  Small decorative primitives                                        */
/* ------------------------------------------------------------------ */

const Sparkle: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" />
    </svg>
);

const CornerOrnament: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
        <path d="M2 2 H20 M2 2 V20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M2 2 C 18 4, 26 14, 28 30" stroke="currentColor" strokeWidth="1" opacity={0.7} />
        <circle cx="28" cy="30" r="2" fill="currentColor" opacity={0.8} />
    </svg>
);

const Divider: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D8B26A]/80" />
        <Sparkle className="h-3 w-3 text-[#D8B26A]" />
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D8B26A]/80" />
    </div>
);

/** Ambient gilded-glow particle drifting slowly in the background. */
const FloatingGlow: React.FC<{
    top: string;
    left: string;
    size: number;
    delay?: number;
    reduceMotion: boolean;
}> = ({ top, left, size, delay = 0, reduceMotion }) => (
    <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
            top,
            left,
            width: size,
            height: size,
            background:
                "radial-gradient(circle, rgba(235,213,160,0.45) 0%, rgba(216,178,106,0.12) 55%, rgba(216,178,106,0) 75%)",
            filter: "blur(2px)",
        }}
        animate={
            reduceMotion
                ? { opacity: [0.45, 0.8, 0.45] }
                : { y: [0, -16, 0], opacity: [1, 0.8, 1] }
        }
        transition={{ duration: 7, repeat: Infinity, delay, ease: "easeInOut" }}
        aria-hidden="true"
    />
);

/** Fades + rises a block into view the first time it crosses the viewport. */
const Reveal: React.FC<{
    children: ReactNode;
    delay?: number;
    className?: string;
}> = ({ children, delay = 0, className = "" }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            ref={ref}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 0] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/* ------------------------------------------------------------------ */
/*  Scratch-to-reveal date card                                        */
/* ------------------------------------------------------------------ */

const SCRATCH_DATE = {
    weekday: "Sunday",
    day: "11",
    monthYear: "October 2026",
    time: "10:00 AM onwards",
};

const ScratchDateCard: React.FC<{ reduceMotion: boolean }> = ({ reduceMotion }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [revealed, setRevealed] = useState(reduceMotion);
    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);
    const moves = useRef(0);

    /* paint the foil overlay once */
    useEffect(() => {
        if (reduceMotion) return;
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;

        let disposed = false;
        const raf = requestAnimationFrame(() => {
            if (disposed) return;
            const rect = wrap.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(rect.width * dpr);
            canvas.height = Math.round(rect.height * dpr);
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.scale(dpr, dpr);

            const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
            g.addColorStop(0, "#B89E9E");
            g.addColorStop(0.45, "#D9C4C4");
            g.addColorStop(1, "#A88C8C");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, rect.width, rect.height);

            // gilded flecks
            ctx.fillStyle = "rgba(216,178,106,0.55)";
            for (let i = 0; i < 40; i++) {
                ctx.beginPath();
                ctx.arc(
                    Math.random() * rect.width,
                    Math.random() * rect.height,
                    Math.random() * 1.6,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            ctx.fillStyle = "#43302F";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "13px 'Marcellus', serif";
            ctx.fillText("✦  SCRATCH HERE  ✦", rect.width / 2, rect.height / 2 - 8);
            ctx.font = "10px 'Jost', sans-serif";
            ctx.fillText("reveal the date", rect.width / 2, rect.height / 2 + 12);

            ctx.globalCompositeOperation = "destination-out";
        });
        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
        };
    }, [reduceMotion]);

    const clearedFraction = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return 0;
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const stride = 4 * 8; // sample every 8th pixel
        let cleared = 0;
        let total = 0;
        for (let i = 3; i < data.length; i += stride) {
            total++;
            if (data[i] === 0) cleared++;
        }
        return total ? cleared / total : 0;
    }, []);

    const strokeAt = useCallback((x: number, y: number) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        ctx.lineWidth = 38;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (last.current) {
            ctx.beginPath();
            ctx.moveTo(last.current.x, last.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, 19, 0, Math.PI * 2);
        ctx.fill();
        last.current = { x, y };
    }, []);

    const localPos = (e: React.PointerEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: React.PointerEvent) => {
        if (revealed) return;
        drawing.current = true;
        last.current = null;
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        const { x, y } = localPos(e);
        strokeAt(x, y);
    };

    const onMove = (e: React.PointerEvent) => {
        if (!drawing.current || revealed) return;
        e.preventDefault();
        const { x, y } = localPos(e);
        strokeAt(x, y);
        moves.current += 1;
        if (moves.current % 6 === 0 && clearedFraction() > 0.5) setRevealed(true);
    };

    const onUp = () => {
        if (!drawing.current) return;
        drawing.current = false;
        last.current = null;
        if (!revealed && clearedFraction() > 0.42) setRevealed(true);
    };

    return (
        <Reveal className="flex w-full flex-col items-center gap-3" delay={0.05}>
            <span
                className="text-[11px] uppercase tracking-[0.4em] text-[#EBD5A0]"
                style={{ fontFamily: FONT_LABEL }}
            >
                Save the Date
            </span>

            <div
                ref={wrapRef}
                className="relative h-44 w-64 overflow-hidden rounded-2xl border border-[#D8B26A]/55 bg-gradient-to-br from-[#9C8383] to-[#6F5757] shadow-[0_18px_50px_-18px_rgba(216,178,106,0.5)]"
            >
                {/* revealed date */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
                    <span
                        className="text-[11px] uppercase tracking-[0.35em] text-[#EBD5A0]"
                        style={{ fontFamily: FONT_BODY }}
                    >
                        {SCRATCH_DATE.weekday}
                    </span>
                    <span
                        className="text-[58px] font-medium leading-none text-[#F7F1EA]"
                        style={{ fontFamily: FONT_BODY }}
                    >
                        {SCRATCH_DATE.day}
                    </span>
                    <span
                        className="text-sm tracking-[0.22em] text-[#F7F1EA]"
                        style={{ fontFamily: FONT_BODY }}
                    >
                        {SCRATCH_DATE.monthYear.toUpperCase()}
                    </span>
                    <span
                        className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#F7F1EA]/65"
                        style={{ fontFamily: FONT_BODY }}
                    >
                        {SCRATCH_DATE.time}
                    </span>
                </div>

                {/* foil scratch layer */}
                {!reduceMotion && (
                    <canvas
                        ref={canvasRef}
                        onPointerDown={onDown}
                        onPointerMove={onMove}
                        onPointerUp={onUp}
                        onPointerLeave={onUp}
                        onPointerCancel={onUp}
                        className={`absolute inset-0 h-full w-full cursor-pointer transition-opacity duration-700 ${revealed ? "pointer-events-none opacity-0" : "opacity-100"
                            }`}
                        style={{ touchAction: "none" }}
                    />
                )}
            </div>

            {!revealed && !reduceMotion && (
                <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="text-[9px] uppercase tracking-[0.25em] text-[#F7F1EA]/45 underline-offset-4 transition-colors hover:text-[#F7F1EA]/75 hover:underline"
                    style={{ fontFamily: FONT_BODY }}
                >
                    skip &amp; reveal
                </button>
            )}
        </Reveal>
    );
};

/* ------------------------------------------------------------------ */
/*  Countdown Component                                                */
/* ------------------------------------------------------------------ */

const TARGET_DATE = new Date("2026-10-11T10:00:00+05:30").getTime();

const CountdownTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const updateTimer = () => setTimeLeft(Math.max(0, TARGET_DATE - Date.now()));
        updateTimer();
        const interval = window.setInterval(updateTimer, 1000);
        return () => window.clearInterval(interval);
    }, []);

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return (
        <Reveal className="flex w-full flex-col items-center gap-5 py-1" delay={0.1}>
            <div className="flex gap-4 text-center">
                {[
                    { label: "Days", value: days },
                    { label: "Hrs", value: hours },
                    { label: "Mins", value: minutes },
                    { label: "Secs", value: seconds },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="flex min-w-[46px] flex-col items-center rounded-lg border border-[#D8B26A]/35 bg-[#5A4646]/45 px-2 py-2 backdrop-blur-sm"
                    >
                        <span
                            className="text-2xl text-[#F7F1EA]"
                            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}
                        >
                            {String(item.value).padStart(2, "0")}
                        </span>
                        <span
                            className="text-[8px] uppercase tracking-[0.2em] text-[#EBD5A0]"
                            style={{ fontFamily: FONT_LABEL }}
                        >
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding+of+Mohamed+Anas+and+Rukkiya+Begam&dates=20261011T043000Z/20261011T123000Z&details=Join+us+for+our+wedding!&location=Annamailayar+Mahal,+Udayar+Kovil,+Nagai+Main+Road"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#D8B26A]/70 bg-[#D8B26A]/12 px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] text-[#F7F1EA] transition-colors hover:bg-[#D8B26A]/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EBD5A0]"
                style={{ fontFamily: FONT_LABEL }}
            >
                Add to Calendar
            </a>
        </Reveal>
    );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const WeddingLanding: React.FC = () => {
    const reduceMotion = !!useReducedMotion();

    /* ---- refs -------------------------------------------------------- */
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const heroRef = useRef<HTMLElement | null>(null);
    const familyRef = useRef<HTMLElement | null>(null);
    const locationRef = useRef<HTMLElement | null>(null);
    const quoteRef = useRef<HTMLElement | null>(null);

    const introVideoRef = useRef<HTMLVideoElement | null>(null);
    const loopVideoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    /* ---- state --------------------------------------------------------*/
    const [sealOpened, setSealOpened] = useState(false);
    const [showInviteText, setShowInviteText] = useState(false);
    const [showNames, setShowNames] = useState(false);
    const [videoStage, setVideoStage] = useState<"intro" | "loop">("intro");
    const [musicOn, setMusicOn] = useState(false);
    const [activeSection, setActiveSection] = useState<SectionId>("hero");
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const handleVideoLoaded = useCallback(() => {
        setIsVideoLoaded(true);
    }, []);

    useEffect(() => {
        // If the first frame is already available, drop the loader immediately.
        if (introVideoRef.current && introVideoRef.current.readyState >= 2) {
            setIsVideoLoaded(true);
            return;
        }
        // iOS Safari defers video downloads until play() is called, so
        // loadeddata / canplaythrough may never fire while the seal is shown.
        // The poster frame covers the "initial screen" on iOS; this timeout
        // makes sure the loading overlay never traps the user.
        const fallback = window.setTimeout(() => setIsVideoLoaded(true), 2500);
        return () => window.clearTimeout(fallback);
    }, []);

    /* ---- load display fonts once --------------------------------------*/
    useEffect(() => {
        if (document.getElementById(FONT_LINK_ID)) return;
        const link = document.createElement("link");
        link.id = FONT_LINK_ID;
        link.rel = "stylesheet";
        link.href = FONT_HREF;
        document.head.appendChild(link);
    }, []);

    /* ---- seal-tap timeline ---------------------------------------------*/
    const handleSealTap = useCallback(() => {
        if (sealOpened) return;
        setSealOpened(true);

        introVideoRef.current?.play().catch(() => {
            /* autoplay with sound can be blocked; video stays muted regardless */
        });
        audioRef.current?.play().then(() => setMusicOn(true)).catch(() => {
            /* user can still start music manually via the floating toggle */
        });
    }, [sealOpened]);

    useEffect(() => {
        if (!sealOpened) return;
        // 1) the welcome heading animates in first
        const revealText = window.setTimeout(() => setShowInviteText(true), 4000);
        // 2) then the groom + bride names load in, staggered
        const revealNames = window.setTimeout(() => setShowNames(true), 5900);
        const switchVideo = window.setTimeout(() => setVideoStage("loop"), 10000);
        return () => {
            window.clearTimeout(revealText);
            window.clearTimeout(revealNames);
            window.clearTimeout(switchVideo);
        };
    }, [sealOpened]);

    useEffect(() => {
        if (videoStage === "loop") {
            loopVideoRef.current?.play().catch(() => { });
        }
    }, [videoStage]);

    /* ---- music toggle ---------------------------------------------------*/
    const toggleMusic = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (musicOn) {
            audio.pause();
            setMusicOn(false);
        } else {
            audio.play().then(() => setMusicOn(true)).catch(() => { });
        }
    }, [musicOn]);

    /* ---- smooth scroll nav ----------------------------------------------*/
    const scrollToSection = useCallback(
        (ref: React.RefObject<HTMLElement | null>) => {
            ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        []
    );

    /* ---- track which slide is active for the side nav dots --------------*/
    useEffect(() => {
        const root = scrollContainerRef.current;
        if (!root) return;

        const sections: [SectionId, React.RefObject<HTMLElement | null>][] = [
            ["hero", heroRef],
            ["family", familyRef],
            ["location", locationRef],
            ["quote", quoteRef],
        ];

        const observer = new IntersectionObserver(
            (entries) => {
                type Candidate = { id: SectionId; ratio: number };
                const candidates = entries
                    .map((entry): Candidate | null => {
                        const match = sections.find(([, r]) => r.current === entry.target);
                        return match ? { id: match[0], ratio: entry.intersectionRatio } : null;
                    })
                    .filter((c): c is Candidate => c !== null);

                const top = candidates.reduce<Candidate | null>(
                    (acc, cur) => (!acc || cur.ratio > acc.ratio ? cur : acc),
                    null
                );

                if (top && top.ratio > 0.4) setActiveSection(top.id);
            },
            { root, threshold: [0.4, 0.6, 0.8] }
        );

        sections.forEach(([, r]) => r.current && observer.observe(r.current));
        return () => observer.disconnect();
    }, []);

    const navItems: { id: SectionId; label: string; ref: React.RefObject<HTMLElement | null> }[] = [
        { id: "hero", label: "Home", ref: heroRef },
        { id: "family", label: "Family", ref: familyRef },
        { id: "location", label: "Venue", ref: locationRef },
        { id: "quote", label: "Blessing", ref: quoteRef },
    ];

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center bg-[#3A2E2E] p-0 sm:p-6"
            style={{ fontFamily: FONT_BODY }}
        >
            <AnimatePresence>
                {!isVideoLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#8B6D6D]"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EBD5A0]/35 border-t-[#EBD5A0]" />
                            <p
                                className="text-xs uppercase tracking-[0.3em] text-[#F7F1EA]/80"
                                style={{ fontFamily: FONT_LABEL }}
                            >
                                Loading
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @keyframes wi-pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(216,178,106,0.55)); }
          50% { filter: drop-shadow(0 0 20px rgba(235,213,160,0.9)); }
        }
        .wi-seal-glow { animation: wi-pulse-glow 2.6s ease-in-out infinite; }
        .wi-scroll::-webkit-scrollbar { display: none; }
        .wi-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        @media (prefers-reduced-motion: reduce) {
          .wi-seal-glow { animation: none; }
        }
      `}</style>

            {/* ---------------------------------------------------------------
          Invitation "card" — edge-to-edge on mobile, a framed digital
          card on larger screens.
      --------------------------------------------------------------- */}
            <div className="relative h-screen w-full overflow-hidden bg-[#8B6D6D] text-[#F7F1EA] shadow-[0_0_80px_rgba(0,0,0,0.5)] sm:h-[92vh] sm:max-h-[880px] sm:w-[420px] sm:rounded-[2rem] sm:ring-1 sm:ring-[#D8B26A]/45">
                {/* Scrollable snap sections */}
                <div
                    ref={scrollContainerRef}
                    className="wi-scroll h-full w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth"
                >
                    {/* ============================= SLIDE 1 — HERO ============================= */}
                    <section
                        ref={heroRef}
                        className="relative flex h-full min-h-screen w-full snap-start flex-col items-center justify-between overflow-hidden sm:min-h-full"
                    >
                        {/* Video backgrounds — poster shows the initial frame on iOS
                            before playback begins. */}
                        <video
                            ref={introVideoRef}
                            muted
                            playsInline
                            preload="auto"
                            poster={ASSETS.introPoster}
                            onLoadedMetadata={handleVideoLoaded}
                            onLoadedData={handleVideoLoaded}
                            onCanPlay={handleVideoLoaded}
                            onCanPlayThrough={handleVideoLoaded}
                            onError={handleVideoLoaded}
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[4000ms] ${videoStage === "intro" ? "opacity-100" : "opacity-0"
                                }`}
                            src={ASSETS.introVideo}
                        />
                        <video
                            ref={loopVideoRef}
                            muted
                            playsInline
                            loop
                            preload="none"
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[4000ms] ${videoStage === "loop" ? "opacity-50" : "opacity-0"
                                }`}
                            src={ASSETS.loopVideo}
                        />
                        {/* Overlays for legibility — soft rose wash */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#6F5757]/25 via-transparent to-[#4A3437]/45" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(74,52,55,0.5)_100%)]" />

                        {/* Ambient particles */}
                        <FloatingGlow top="12%" left="18%" size={90} reduceMotion={reduceMotion} />
                        <FloatingGlow top="65%" left="78%" size={70} delay={1.4} reduceMotion={reduceMotion} />
                        <FloatingGlow top="80%" left="15%" size={60} delay={2.6} reduceMotion={reduceMotion} />

                        {/* Corner ornaments */}
                        <CornerOrnament className="absolute left-3 top-3 h-8 w-8 text-[#EBD5A0]/80" />
                        <CornerOrnament className="absolute right-3 top-3 h-8 w-8 -scale-x-100 text-[#EBD5A0]/80" />
                        <CornerOrnament className="absolute bottom-3 left-3 h-8 w-8 -scale-y-100 text-[#EBD5A0]/80" />
                        <CornerOrnament className="absolute bottom-3 right-3 h-8 w-8 -scale-x-100 -scale-y-100 text-[#EBD5A0]/80" />

                        {/* Content column */}
                        <div className="relative z-10 flex h-full w-full flex-col items-center justify-between px-6 py-10 text-center">
                            {/* Bismillah eyebrow */}
                            <p
                                className="text-sm tracking-[0.2em] text-[#F7F1EA]/90 drop-shadow-[0_1px_6px_rgba(74,52,55,0.6)]"
                                style={{ fontFamily: FONT_ARABIC }}
                            >
                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                            </p>

                            {/* Seal + invitation text */}
                            <div className="relative flex flex-1 flex-col items-center justify-center gap-6">
                                <AnimatePresence>
                                    {!sealOpened && (
                                        <motion.div
                                            key="seal"
                                            exit={{ opacity: 0, scale: 1.4, rotate: 25 }}
                                            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                                            className="flex flex-col items-center gap-4"
                                        >
                                            {/* transparent tap target over the video's own gold wax seal */}
                                            <button
                                                type="button"
                                                aria-label="Open the invitation"
                                                onClick={handleSealTap}
                                                className="wi-seal-glow relative flex h-36 w-36 items-center justify-center rounded-full outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#EBD5A0]"
                                            >
                                                <span className="absolute inset-0 rounded-full border border-[#EBD5A0]/40" />
                                                <span className="absolute inset-2 rounded-full border border-[#EBD5A0]/20" />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {showInviteText && (
                                        <motion.div
                                            key="invite"
                                            initial={{ opacity: 0, y: 18 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                                            className="flex flex-col items-center gap-5 rounded-3xl bg-[#4A3437]/35 px-5 py-6 backdrop-blur-[3px]"
                                        >
                                            <motion.p
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                                                className="max-w-[260px] text-[13px] leading-relaxed tracking-wide text-[#F7F1EA]/90"
                                                style={{ fontFamily: FONT_BODY }}
                                            >
                                                We are honored to welcome you to the wedding ceremony of
                                            </motion.p>

                                            {/* Names stay mounted so the card keeps its full
                                                height from the start — only their opacity
                                                animates in, staggered, once showNames flips. */}
                                            <div className="flex flex-col items-center gap-5">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 16 }}
                                                    animate={showNames ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                                                    transition={{ duration: 0.8, delay: showNames ? 0.05 : 0, ease: [0.22, 1, 0.36, 1] }}
                                                    className="flex flex-col items-center gap-1"
                                                >
                                                    <span
                                                        className="text-[11px] uppercase tracking-[0.35em] text-[#EBD5A0]"
                                                        style={{ fontFamily: FONT_LABEL }}
                                                    >
                                                        Groom
                                                    </span>
                                                    <h2
                                                        className="mb-1 mt-2 text-6xl leading-none text-[#F7F1EA]"
                                                        style={{ fontFamily: FONT_SCRIPT }}
                                                    >
                                                        Mohamed Anas
                                                    </h2>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={showNames ? { opacity: 1 } : { opacity: 0 }}
                                                    transition={{ duration: 0.6, delay: showNames ? 0.65 : 0 }}
                                                    className="flex flex-col items-center gap-1"
                                                >
                                                    <Divider className="my-1" />
                                                    <span
                                                        className="-mt-3 text-xl italic text-[#EBD5A0]"
                                                        style={{ fontFamily: FONT_DISPLAY }}
                                                    >
                                                        and
                                                    </span>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, y: 16 }}
                                                    animate={showNames ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                                                    transition={{ duration: 0.8, delay: showNames ? 1.1 : 0, ease: [0.22, 1, 0.36, 1] }}
                                                    className="flex flex-col items-center gap-1"
                                                >
                                                    <span
                                                        className="text-[11px] uppercase tracking-[0.35em] text-[#EBD5A0]"
                                                        style={{ fontFamily: FONT_LABEL }}
                                                    >
                                                        Bride
                                                    </span>
                                                    <h2
                                                        className="mb-1 mt-2 text-6xl leading-none text-[#F7F1EA]"
                                                        style={{ fontFamily: FONT_SCRIPT }}
                                                    >
                                                        Rukkiya Begam
                                                    </h2>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Bottom logistics */}
                            <AnimatePresence>
                                {showNames && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.9, delay: 1.6 }}
                                        className="mb-6 flex w-full flex-col items-center gap-4 pb-2"
                                    >
                                        <p
                                            className="text-[11px] tracking-[0.18em] text-[#F7F1EA]/85 drop-shadow-[0_1px_6px_rgba(74,52,55,0.6)]"
                                            style={{ fontFamily: FONT_LABEL }}
                                        >
                                            11 OCT 2026 &nbsp;·&nbsp; 11:00 AM – 12:00 PM
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => scrollToSection(locationRef)}
                                            className="flex items-center gap-2 rounded-full border border-[#EBD5A0]/70 bg-[#4A3437]/30 px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-[#F7F1EA] backdrop-blur-sm transition-colors hover:bg-[#EBD5A0]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EBD5A0]"
                                            style={{ fontFamily: FONT_LABEL }}
                                        >
                                            <FiMapPin className="h-3.5 w-3.5" />
                                            Location
                                        </button>
                                        <motion.button
                                            type="button"
                                            aria-label="Scroll to next section"
                                            onClick={() => scrollToSection(familyRef)}
                                            animate={reduceMotion ? {} : { y: [0, 6, 0] }}
                                            transition={{ duration: 1.8, repeat: Infinity }}
                                            className="mt-1 text-[#F7F1EA]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EBD5A0]"
                                        >
                                            <FiChevronDown className="h-5 w-5" />
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* ============================= SLIDE 2 — DATE + FAMILY ============================= */}
                    <section
                        ref={familyRef}
                        className="relative flex h-full min-h-screen w-full snap-start flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-b from-[#7C6060] via-[#8B6D6D] to-[#6F5757] px-6 py-10 sm:min-h-full"
                    >
                        <FloatingGlow top="18%" left="82%" size={80} reduceMotion={reduceMotion} />
                        <FloatingGlow top="76%" left="10%" size={64} delay={1.8} reduceMotion={reduceMotion} />

                        <ScratchDateCard reduceMotion={reduceMotion} />

                        <CountdownTimer />

                        <Reveal className="flex flex-col items-center gap-2 text-center" delay={0.2}>
                            <Divider />
                            <p
                                className="mt-2 text-[13px] tracking-wide text-[#F7F1EA]/80"
                                style={{ fontFamily: FONT_BODY }}
                            >
                                With the blessings of our families
                            </p>
                        </Reveal>

                        <div className="flex w-full max-w-xs flex-col gap-3">
                            <Reveal delay={0.3} className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#D8B26A]/30 bg-[#5A4646]/35 px-5 py-4 text-center backdrop-blur-sm">
                                <span
                                    className="text-[10px] uppercase tracking-[0.3em] text-[#EBD5A0]"
                                    style={{ fontFamily: FONT_LABEL }}
                                >
                                    Groom&rsquo;s Parents
                                </span>
                                <h3
                                    className="text-2xl leading-snug text-[#F7F1EA]"
                                    style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}
                                >
                                    Asan Khadar &amp; Jainul Arabiya
                                </h3>
                            </Reveal>

                            <Reveal delay={0.38} className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#D8B26A]/30 bg-[#5A4646]/35 px-5 py-4 text-center backdrop-blur-sm">
                                <span
                                    className="text-[10px] uppercase tracking-[0.3em] text-[#EBD5A0]"
                                    style={{ fontFamily: FONT_LABEL }}
                                >
                                    Bride&rsquo;s Parents
                                </span>
                                <h3
                                    className="text-2xl leading-snug text-[#F7F1EA]"
                                    style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}
                                >
                                    Yakatali &amp; Sharmila
                                </h3>
                            </Reveal>
                        </div>
                    </section>

                    {/* ============================= SLIDE 3 — VENUE ============================= */}
                    <section
                        ref={locationRef}
                        className="relative flex h-full min-h-screen w-full snap-start flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-b from-[#7C6060] via-[#8B6D6D] to-[#6F5757] px-6 py-14 sm:min-h-full"
                    >
                        <FloatingGlow top="14%" left="12%" size={72} reduceMotion={reduceMotion} />
                        <FloatingGlow top="72%" left="84%" size={68} delay={1.6} reduceMotion={reduceMotion} />

                        <CornerOrnament className="absolute left-3 top-3 h-8 w-8 text-[#EBD5A0]/65" />
                        <CornerOrnament className="absolute right-3 top-3 h-8 w-8 -scale-x-100 text-[#EBD5A0]/65" />

                        <Reveal className="flex flex-col items-center gap-2 text-center">
                            <Divider />
                            <span
                                className="mt-2 text-[11px] uppercase tracking-[0.4em] text-[#EBD5A0]"
                                style={{ fontFamily: FONT_LABEL }}
                            >
                                The Celebration
                            </span>
                        </Reveal>

                        <Reveal delay={0.12}>
                            {/* Arch-framed venue card */}
                            <div className="relative w-[290px]">
                                <div className="relative overflow-hidden rounded-t-[145px] rounded-b-[26px] border border-[#D8B26A]/50 bg-gradient-to-b from-[#9C8383]/70 to-[#4A3437]/92 px-6 pb-7 pt-9 shadow-[0_24px_60px_-22px_rgba(216,178,106,0.45)] backdrop-blur-sm">
                                    <div className="pointer-events-none absolute inset-[6px] rounded-t-[135px] rounded-b-[18px] border border-[#EBD5A0]/25" />

                                    <div className="relative flex flex-col items-center gap-3 text-center">
                                        <Sparkle className="h-4 w-4 text-[#EBD5A0]" />

                                        <h3
                                            className="text-[28px] leading-tight text-[#F7F1EA]"
                                            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}
                                        >
                                            Annamailayar Mahal
                                        </h3>
                                        <p
                                            className="max-w-[210px] text-[11px] leading-relaxed text-[#F7F1EA]/75"
                                            style={{ fontFamily: FONT_BODY }}
                                        >
                                            Udayar Kovil, Nagai Main Road
                                        </p>

                                        <div className="my-1 flex items-center gap-2">
                                            <span
                                                className="rounded-full border border-[#D8B26A]/45 bg-[#D8B26A]/12 px-3 py-1 text-[9px] uppercase tracking-[0.15em] text-[#F7F1EA]"
                                                style={{ fontFamily: FONT_LABEL }}
                                            >
                                                11 Oct 2026
                                            </span>
                                            <span
                                                className="rounded-full border border-[#D8B26A]/45 bg-[#D8B26A]/12 px-3 py-1 text-[9px] uppercase tracking-[0.15em] text-[#F7F1EA]"
                                                style={{ fontFamily: FONT_LABEL }}
                                            >
                                                10:00 AM
                                            </span>
                                        </div>

                                        <div className="rounded-xl border border-[#D8B26A]/45 bg-[#F7F1EA] p-2.5">
                                            <img
                                                src={ASSETS.qrImage}
                                                alt="QR code linking to the venue location"
                                                className="h-28 w-28 object-cover"
                                            />
                                        </div>
                                        <span
                                            className="text-[9px] uppercase tracking-[0.2em] text-[#F7F1EA]/55"
                                            style={{ fontFamily: FONT_BODY }}
                                        >
                                            Scan for live location
                                        </span>

                                        <a
                                            href={ASSETS.googleMapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E4C58E] to-[#D8B26A] px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] text-[#3A2C2C] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7F1EA]"
                                            style={{ fontFamily: FONT_LABEL }}
                                        >
                                            <FiMapPin className="h-3.5 w-3.5" />
                                            Get Directions
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </section>

                    {/* ============================= SLIDE 4 — QUOTE + FOOTER ============================= */}
                    <section
                        ref={quoteRef}
                        className="relative flex h-full min-h-screen w-full snap-start flex-col items-center justify-center gap-8 overflow-hidden bg-gradient-to-b from-[#6F5757] via-[#4A3437] to-[#6F5757] px-6 py-16 text-center sm:min-h-full"
                    >
                        <FloatingGlow top="15%" left="15%" size={70} reduceMotion={reduceMotion} />
                        <FloatingGlow top="70%" left="85%" size={70} delay={2} reduceMotion={reduceMotion} />

                        <Reveal className="flex flex-col items-center gap-4">
                            <p
                                dir="rtl"
                                className="max-w-[280px] text-2xl leading-relaxed text-[#EBD5A0]"
                                style={{ fontFamily: FONT_QURAN }}
                            >
                                بَارَكَ اللهُ لَكُماَ وَبَارَكَ عَلَيْكُماَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
                            </p>
                            <p
                                className="max-w-[260px] text-sm italic leading-relaxed text-[#F7F1EA]/80"
                                style={{ fontFamily: FONT_BODY }}
                            >
                                &ldquo;Barakallahu lakuma wa baraka alaikuma, wa jama&apos;a bainakuma fi
                                khair.&rdquo;
                            </p>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <Divider />
                        </Reveal>

                        <Reveal delay={0.35} className="flex flex-col items-center gap-2">
                            <p
                                className="max-w-[260px] text-[13px] leading-relaxed text-[#F7F1EA]/85"
                                style={{ fontFamily: FONT_BODY }}
                            >
                                Thank you for visiting. We look forward to meeting you at the
                                wedding.
                            </p>
                            <p
                                className="mt-4 flex flex-col items-center gap-1 text-4xl leading-tight text-[#EBD5A0]"
                                style={{ fontFamily: FONT_SCRIPT }}
                            >
                                <span>Mohamed Anas</span>
                                <span className="text-2xl">&amp;</span>
                                <span>Rukkiya Begam</span>
                            </p>
                        </Reveal>
                    </section>
                </div>

                {/* ---------------------------------------------------------------
            Persistent floating UI — sits above the scroll container.
        --------------------------------------------------------------- */}
                <div className="pointer-events-none absolute inset-0 z-30">
                    {/* Side nav dots */}
                    <div className="pointer-events-auto absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-3">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                aria-label={`Go to ${item.label}`}
                                onClick={() => scrollToSection(item.ref)}
                                className="group flex items-center gap-2 focus-visible:outline-none"
                            >
                                <span
                                    className={`h-2 w-2 rounded-full border border-[#EBD5A0] transition-all ${activeSection === item.id ? "scale-125 bg-[#EBD5A0]" : "bg-transparent"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Music toggle */}
                    <button
                        type="button"
                        onClick={toggleMusic}
                        aria-label={musicOn ? "Pause music" : "Play music"}
                        aria-pressed={musicOn}
                        className="pointer-events-auto absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[#EBD5A0]/60 bg-[#4A3437]/70 text-[#F7F1EA] backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EBD5A0]"
                    >
                        {musicOn ? <FiVolume2 className="h-4 w-4" /> : <FiVolumeX className="h-4 w-4" />}
                    </button>
                </div>

                <audio ref={audioRef} src={ASSETS.nasheedAudio} loop preload="none" />
            </div>
        </div>
    );
};

export default WeddingLanding;
