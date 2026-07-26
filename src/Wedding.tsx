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
import qr from "./assets/qr.png";

import bcm from "./assets/bcm.wav";
/* ------------------------------------------------------------------ */
/*  Dummy assets — swap these for the real files before shipping.      */
/* ------------------------------------------------------------------ */
const ASSETS = {
    introVideo: introVideoPath,
    loopVideo: loopVideoPath,
    qrImage: qr,
    nasheedAudio: bcm,
    googleMapUrl:
        "https://maps.app.goo.gl/p2dJU2om5vQNSyEy6",
};

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/*  bg-deep   #0A2019  near-black emerald, primary background          */
/*  bg-panel  #123A2E  lighter emerald, gradients / panels             */
/*  gold      #CBA135  antique gold, borders + accents                 */
/*  gold-lt   #F0D98C  soft gold glow / highlight text                 */
/*  ivory     #F6EFE0  primary text on dark                            */
/*  maroon    #4A1620  secondary accent, quote backdrop                */
/* ------------------------------------------------------------------ */

const FONT_LINK_ID = "wedding-invite-fonts";

type SectionId = "hero" | "family" | "location" | "quote";

/* ------------------------------------------------------------------ */
/*  Small decorative primitives                                        */
/* ------------------------------------------------------------------ */

const RubElHizb: React.FC<{ size?: number; className?: string }> = ({
    size = 120,
    className = "",
}) => (
    <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        fill="none"
        aria-hidden="true"
    >
        <rect
            x="22"
            y="22"
            width="56"
            height="56"
            stroke="currentColor"
            strokeWidth="1.4"
        />
        <rect
            x="22"
            y="22"
            width="56"
            height="56"
            stroke="currentColor"
            strokeWidth="1.4"
            transform="rotate(45 50 50)"
        />
        <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="0.6" opacity={0.6} />
    </svg>
);

const Sparkle: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" />
    </svg>
);

const CornerOrnament: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
        <path
            d="M2 2 H20 M2 2 V20"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
        />
        <path
            d="M2 2 C 18 4, 26 14, 28 30"
            stroke="currentColor"
            strokeWidth="1"
            opacity={0.7}
        />
        <circle cx="28" cy="30" r="2" fill="currentColor" opacity={0.8} />
    </svg>
);

const Divider: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#CBA135]/70" />
        <Sparkle className="h-3 w-3 text-[#CBA135]" />
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#CBA135]/70" />
    </div>
);

/** Ambient lantern-glow particle drifting slowly in the background. */
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
                "radial-gradient(circle, rgba(240,217,140,0.35) 0%, rgba(203,161,53,0.08) 55%, rgba(203,161,53,0) 75%)",
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
/*  Countdown Component                                                */
/* ------------------------------------------------------------------ */

const TARGET_DATE = new Date("2026-10-11T10:00:00+05:30").getTime();

const CountdownTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(0);
    const reduceMotion = !!useReducedMotion();

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
        <Reveal className="flex w-full flex-col items-center gap-6 py-2" delay={0.1}>
            {/* Calendar Design for the Date */}
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-[#CBA135]/40 bg-[#0A2019]/80 px-8 py-3 shadow-lg backdrop-blur-sm">
                <div className="absolute top-0 h-1 w-full bg-[#CBA135]" />
                <span className="mt-1 text-[10px] uppercase tracking-widest text-[#F0D98C]" style={{ fontFamily: "'Poppins', sans-serif" }}>October</span>
                <span className="text-4xl text-[#F6EFE0]" style={{ fontFamily: "'Amiri', serif" }}>11</span>
                <span className="text-[10px] tracking-widest text-[#F0D98C]" style={{ fontFamily: "'Poppins', sans-serif" }}>2026</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-[#F6EFE0]/60" style={{ fontFamily: "'Poppins', sans-serif" }}>10:00 AM</span>
            </div>

            {/* Countdown Grid */}
            <div className="flex gap-5 text-center">
                {[
                    { label: "Days", value: days },
                    { label: "Hrs", value: hours },
                    { label: "Mins", value: minutes },
                    { label: "Secs", value: seconds },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center">
                        <span className="text-2xl text-[#F6EFE0]" style={{ fontFamily: "'Amiri', serif" }}>
                            {String(item.value).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-[#CBA135]">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Add to Calendar Button */}
            <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding+of+Mohamed+Anas+and+Rukkiya+Begam&dates=20261011T043000Z/20261011T123000Z&details=Join+us+for+our+wedding!&location=Annamailayar+Mahal,+Udayar+Kovil,+Nagai+Main+Road"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 rounded-full border border-[#CBA135]/60 bg-[#CBA135]/10 px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#F0D98C] transition-colors hover:bg-[#CBA135]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D98C]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
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
    const [videoStage, setVideoStage] = useState<"intro" | "loop">("intro");
    const [musicOn, setMusicOn] = useState(false);
    const [activeSection, setActiveSection] = useState<SectionId>("hero");
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const handleVideoLoaded = useCallback(() => {
        setIsVideoLoaded(true);
    }, []);

    useEffect(() => {
        if (introVideoRef.current && introVideoRef.current.readyState >= 3) {
            setIsVideoLoaded(true);
        }
    }, []);

    /* ---- load display fonts once --------------------------------------*/
    useEffect(() => {
        if (document.getElementById(FONT_LINK_ID)) return;
        const link = document.createElement("link");
        link.id = FONT_LINK_ID;
        link.rel = "stylesheet";
        link.href =
            "https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;700&family=Noto+Naskh+Arabic:wght@400;600&family=Poppins:wght@300;400;500&family=Great+Vibes&display=swap";
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
        const revealText = window.setTimeout(() => setShowInviteText(true), 4000);
        const switchVideo = window.setTimeout(() => setVideoStage("loop"), 10000);
        return () => {
            window.clearTimeout(revealText);
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
        <div className="flex min-h-screen w-full items-center justify-center bg-[#060F0C] p-0 sm:p-6">
            <AnimatePresence>
                {!isVideoLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060F0C]"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#CBA135]/30 border-t-[#CBA135]" />
                            <p className="text-xs uppercase tracking-[0.2em] text-[#F0D98C]/70" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Loading...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
        @keyframes wi-pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(203,161,53,0.55)); }
          50% { filter: drop-shadow(0 0 18px rgba(240,217,140,0.85)); }
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
            <div className="relative h-screen w-full overflow-hidden bg-[#0A2019] text-[#F6EFE0] shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:h-[92vh] sm:max-h-[880px] sm:w-[420px] sm:rounded-[2rem] sm:ring-1 sm:ring-[#CBA135]/40">
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
                        {/* Video backgrounds */}
                        <video
                            ref={introVideoRef}
                            muted
                            playsInline
                            onLoadedData={handleVideoLoaded}
                            onCanPlayThrough={handleVideoLoaded}
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[4000ms] ${videoStage === "intro" ? "opacity-100" : "opacity-0"
                                }`}
                            src={ASSETS.introVideo}
                        />
                        <video
                            ref={loopVideoRef}
                            muted
                            playsInline
                            loop
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[4000ms] ${videoStage === "loop" ? "opacity-50" : "opacity-0"
                                }`}
                            src={ASSETS.loopVideo}
                        />
                        {/* Overlays for legibility */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#060F0C]/40 via-[#0A2019]/30 to-[#060F0C]/40" />
                        {/* Ambient particles */}
                        <FloatingGlow top="12%" left="18%" size={90} reduceMotion={reduceMotion} />
                        <FloatingGlow top="65%" left="78%" size={70} delay={1.4} reduceMotion={reduceMotion} />
                        <FloatingGlow top="80%" left="15%" size={60} delay={2.6} reduceMotion={reduceMotion} />

                        {/* Corner ornaments */}
                        <CornerOrnament className="absolute left-3 top-3 h-8 w-8 text-[#CBA135]/70" />
                        <CornerOrnament className="absolute right-3 top-3 h-8 w-8 -scale-x-100 text-[#CBA135]/70" />
                        <CornerOrnament className="absolute bottom-3 left-3 h-8 w-8 -scale-y-100 text-[#CBA135]/70" />
                        <CornerOrnament className="absolute bottom-3 right-3 h-8 w-8 -scale-x-100 -scale-y-100 text-[#CBA135]/70" />

                        {/* Content column */}
                        <div className="relative z-10 flex h-full w-full flex-col items-center justify-between px-6 py-10 text-center">
                            {/* Bismillah eyebrow */}
                            <p
                                className="text-sm tracking-[0.2em] text-[#F0D98C]/90"
                                style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
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
                                            <button
                                                type="button"
                                                aria-label="Open the invitation"
                                                onClick={handleSealTap}
                                                className="wi-seal-glow relative flex h-32 w-32 items-center justify-center rounded-full text-[#F0D98C] outline-none ring-0 transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#F0D98C]"
                                            >
                                                {/* <RubElHizb size={128} className="absolute inset-0 h-full w-full text-[#CBA135]" /> */}
                                                {/* <span
                                                    className="text-[11px] leading-tight tracking-wide text-[#F0D98C]"
                                                    style={{ fontFamily: "'Scheherazade New', serif" }}
                                                >
                                                    دعوة
                                                    <br />
                                                    زفاف
                                                </span> */}
                                            </button>
                                            <motion.p
                                                animate={reduceMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2.2, repeat: Infinity }}
                                                className="text-[11px] uppercase tracking-[0.3em] text-[#F6EFE0]/70"
                                                style={{ fontFamily: "'Poppins', sans-serif" }}
                                            >
                                                Tap to open
                                            </motion.p>
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
                                            className="flex flex-col items-center gap-5"
                                        >
                                            <p
                                                className="max-w-[260px] text-sm leading-relaxed text-[#F6EFE0]/85"
                                                style={{ fontFamily: "'Poppins', sans-serif" }}
                                            >
                                                We are honored to welcome you to the wedding ceremony of
                                            </p>

                                            <div className="flex flex-col items-center gap-1">
                                                <span
                                                    className="text-xs uppercase tracking-[0.35em] text-[#CBA135]"
                                                    style={{ fontFamily: "'Poppins', sans-serif" }}
                                                >
                                                    Groom
                                                </span>
                                                <h2
                                                    className="text-6xl text-[#F6EFE0] mt-2 mb-1"
                                                    style={{ fontFamily: "'Great Vibes', cursive" }}
                                                >
                                                    Mohamed Anas
                                                </h2>
                                                <span className="text-xs tracking-widest text-[#F6EFE0]/60">B.E.</span>
                                            </div>

                                            <Divider className="my-1" />
                                            <span
                                                className="-mt-3 text-lg italic text-[#F0D98C]"
                                                style={{ fontFamily: "'Amiri', serif" }}
                                            >
                                                weds
                                            </span>

                                            <div className="flex flex-col items-center gap-1">
                                                <span
                                                    className="text-xs uppercase tracking-[0.35em] text-[#CBA135]"
                                                    style={{ fontFamily: "'Poppins', sans-serif" }}
                                                >
                                                    Bride
                                                </span>
                                                <h2
                                                    className="text-6xl text-[#F6EFE0] mt-2 mb-1"
                                                    style={{ fontFamily: "'Great Vibes', cursive" }}
                                                >
                                                    Rukkiya Begam
                                                </h2>
                                                <span className="text-xs tracking-widest text-[#F6EFE0]/60">B.Sc.</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Bottom logistics */}
                            <AnimatePresence>
                                {showInviteText && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.9, delay: 0.3 }}
                                        className="flex w-full flex-col items-center gap-4 pb-2"
                                    >
                                        <p
                                            className="text-xs tracking-wide text-[#F6EFE0]/80"
                                            style={{ fontFamily: "'Poppins', sans-serif" }}
                                        >
                                            Date: 11 / Oct / 2026 &nbsp;·&nbsp; Time: 11:00 AM – 12:00 PM
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => scrollToSection(locationRef)}
                                            className="flex items-center gap-2 rounded-full border border-[#CBA135]/70 px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#F0D98C] transition-colors hover:bg-[#CBA135]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D98C]"
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
                                            className="mt-1 text-[#F6EFE0]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D98C]"
                                        >
                                            <FiChevronDown className="h-5 w-5" />
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* ============================= SLIDE 2 — FAMILY ============================= */}
                    <section
                        ref={familyRef}
                        className="relative flex h-full min-h-screen w-full snap-start flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-b from-[#0A2019] via-[#0F2E24] to-[#0A2019] px-6 py-10 sm:min-h-full"
                    >
                        <FloatingGlow top="20%" left="80%" size={80} reduceMotion={reduceMotion} />
                        <FloatingGlow top="75%" left="10%" size={64} delay={1.8} reduceMotion={reduceMotion} />

                        <CountdownTimer />

                        <Reveal className="flex flex-col items-center gap-2 text-center" delay={0.2}>
                            <Divider />
                            <p
                                className="mt-2 text-sm text-[#F6EFE0]/75"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                With the blessings of our families
                            </p>
                        </Reveal>

                        <div className="flex w-full max-w-xs flex-col gap-6">
                            <Reveal delay={0.3} className="flex flex-col items-center gap-3 text-center">
                                <motion.div
                                    animate={reduceMotion ? {} : { y: [0, -8, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="text-[#CBA135]"
                                >
                                    {/* <RubElHizb size={52} /> */}
                                </motion.div>
                                <span
                                    className="text-xs uppercase tracking-[0.3em] text-[#CBA135]"
                                    style={{ fontFamily: "'Poppins', sans-serif" }}
                                >
                                    Bride&rsquo;s Parents
                                </span>
                                <h3
                                    className="text-2xl leading-snug text-[#F6EFE0]"
                                    style={{ fontFamily: "'Amiri', serif" }}
                                >
                                    Asan Khadar &amp; Jainul Arabiya
                                </h3>
                            </Reveal>

                            <Reveal delay={0.3} className="flex flex-col items-center gap-3 text-center">
                                <motion.div
                                    animate={reduceMotion ? {} : { y: [0, -8, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    className="text-[#CBA135]"
                                >
                                    {/* <RubElHizb size={52} /> */}
                                </motion.div>
                                <span
                                    className="text-xs uppercase tracking-[0.3em] text-[#CBA135]"
                                    style={{ fontFamily: "'Poppins', sans-serif" }}
                                >
                                    Groom&rsquo;s Parents
                                </span>
                                <h3
                                    className="text-2xl leading-snug text-[#F6EFE0]"
                                    style={{ fontFamily: "'Amiri', serif" }}
                                >
                                    Yakatali &amp; Sharmila
                                </h3>
                            </Reveal>
                        </div>
                    </section>

                    {/* ============================= SLIDE 3 — LOCATION ============================= */}
                    <section
                        ref={locationRef}
                        className="relative flex h-full min-h-screen w-full snap-start flex-col items-center justify-center gap-8 overflow-hidden bg-[#0A2019] px-6 py-16 sm:min-h-full"
                    >
                        <CornerOrnament className="absolute left-3 top-3 h-8 w-8 text-[#CBA135]/60" />
                        <CornerOrnament className="absolute right-3 top-3 h-8 w-8 -scale-x-100 text-[#CBA135]/60" />

                        <Reveal className="flex flex-col items-center gap-3 text-center">
                            <Divider />
                            <h3
                                className="mt-1 text-2xl text-[#F0D98C]"
                                style={{ fontFamily: "'Amiri', serif" }}
                            >
                                Venue
                            </h3>
                            <p
                                className="mt-3 text-[11px] uppercase tracking-widest text-[#F0D98C]"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                October 24, 2026 • 10:00 AM
                            </p>
                            <p
                                className="mt-2 max-w-[240px] text-[11px] leading-relaxed text-[#F6EFE0]/75"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                Annamailayar Mahal, Udayar Kovil, Nagai Main Road
                            </p>
                        </Reveal>

                        <Reveal delay={0.15}>
                            <div className="rounded-2xl border border-[#CBA135]/50 bg-[#F6EFE0]/5 p-4 shadow-[0_0_30px_rgba(203,161,53,0.15)]">
                                <img
                                    src={ASSETS.qrImage}
                                    alt="QR code linking to the venue location"
                                    className="h-36 w-36 rounded-md object-cover"
                                />
                            </div>
                        </Reveal>

                        <Reveal delay={0.3}>
                            <a
                                href={ASSETS.googleMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-full bg-[#CBA135] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-[#0A2019] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D98C]"
                            >
                                <FiMapPin className="h-3.5 w-3.5" />
                                Get Directions
                            </a>
                        </Reveal>
                    </section>

                    {/* ============================= SLIDE 4 — QUOTE + FOOTER ============================= */}
                    <section
                        ref={quoteRef}
                        className="relative flex h-full min-h-screen w-full snap-start flex-col items-center justify-center gap-8 overflow-hidden bg-gradient-to-b from-[#0A2019] via-[#3A1220]/70 to-[#0A2019] px-6 py-16 text-center sm:min-h-full"
                    >
                        <FloatingGlow top="15%" left="15%" size={70} reduceMotion={reduceMotion} />
                        <FloatingGlow top="70%" left="85%" size={70} delay={2} reduceMotion={reduceMotion} />

                        <Reveal className="flex flex-col items-center gap-4">
                            <p
                                dir="rtl"
                                className="max-w-[280px] text-2xl leading-relaxed text-[#F0D98C]"
                                style={{ fontFamily: "'Scheherazade New', serif" }}
                            >
                                وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
                            </p>
                            <p
                                className="max-w-[260px] text-xs italic leading-relaxed text-[#F6EFE0]/75"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                &ldquo;Among His signs is that He created for you mates from among
                                yourselves, that you may find tranquility in them, and He placed
                                between you love and mercy.&rdquo;
                            </p>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#CBA135]/80">
                                Surah Ar-Rum, 30:21
                            </span>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <Divider />
                        </Reveal>

                        <Reveal delay={0.35} className="flex flex-col items-center gap-2">
                            <p
                                className="max-w-[260px] text-sm leading-relaxed text-[#F6EFE0]/85"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                Thank you for visiting. We look forward to meeting you at the
                                wedding.
                            </p>
                            <p
                                className="mt-4 text-4xl text-[#F0D98C]"
                                style={{ fontFamily: "'Great Vibes', cursive" }}
                            >
                                Mohamed Anas &amp; Rukkiya Begam
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
                                    className={`h-2 w-2 rounded-full border border-[#CBA135] transition-all ${activeSection === item.id ? "bg-[#CBA135] scale-125" : "bg-transparent"
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
                        className="pointer-events-auto absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[#CBA135]/60 bg-[#0A2019]/70 text-[#F0D98C] backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D98C]"
                    >
                        {musicOn ? <FiVolume2 className="h-4 w-4" /> : <FiVolumeX className="h-4 w-4" />}
                    </button>
                </div>

                <audio ref={audioRef} src={ASSETS.nasheedAudio} loop preload="auto" />
            </div>
        </div>
    );
};

export default WeddingLanding;