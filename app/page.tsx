'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Users,
    Code2,
    BarChart3,
    TrendingUp,
    Shield,
    Clock,
    CheckCircle,
    ArrowRight,
    Building2,
    Globe,
    Award,
    Brain,
    DollarSign,
    UserCheck,
    LineChart,
    Star,
    LogIn,
    Lock,
    LayoutDashboard
} from 'lucide-react'

// ─── Data ──────────────────────────────────────────────────────────────────────

const PLATFORM_MODULES = [
    {
        id: 'software-engineer',
        icon: Code2,
        title: 'Software Engineers',
        subtitle: 'Automated Code Evaluation',
        description:
            'AI-powered GitHub repository analysis with algorithmic pattern detection, code quality scoring, and intelligent interview evaluation.',
        features: ['GitHub Repo Analysis', 'Algorithm Detection', 'Code Quality Metrics', 'AI Interview Q&A'],
        href: '/code-evaluation',
        gradient: 'from-violet-600 to-indigo-600',
        accent: 'bg-violet-50 border-violet-200 text-violet-700',
        badgeColor: 'bg-violet-600',
        glow: 'shadow-violet-200',
        tag: 'Live',
    },
    {
        id: 'accountant',
        icon: DollarSign,
        title: 'Accountants',
        subtitle: 'Finance & Compliance',
        description:
            'Assess financial acumen through real-world accounting scenarios, compliance checks, GAAP knowledge, and analytical problem-solving.',
        features: ['Financial Modeling', 'GAAP Compliance', 'Tax Knowledge', 'Audit Readiness'],
        href: '/attendee/login',
        gradient: 'from-amber-500 to-orange-600',
        accent: 'bg-amber-50 border-amber-200 text-amber-700',
        badgeColor: 'bg-amber-500',
        glow: 'shadow-amber-200',
        tag: 'Live',
    },
]

const STATS = [
    { label: 'Hiring Roles Covered', value: '4', icon: Award },
    { label: 'AI Models Integrated', value: '3+', icon: Brain },
    { label: 'Evaluation Metrics', value: '20+', icon: BarChart3 },
    { label: 'Avg. Time Saved', value: '70%', icon: Clock },
]

const PROCESS_STEPS = [
    {
        step: '01',
        title: 'Select Role',
        description: 'Choose from Software Engineer, Project Manager, Accountant, or Merchandiser modules.',
        icon: UserCheck,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
    },
    {
        step: '02',
        title: 'Submit & Analyze',
        description: 'Provide candidate work samples, GitHub repositories, or complete structured assessments.',
        icon: Brain,
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
    },
    {
        step: '03',
        title: 'AI Evaluation',
        description: 'Our ML models analyze skills, detect patterns, and generate intelligent interview questions.',
        icon: Brain,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
    },
    {
        step: '04',
        title: 'Hire Confidently',
        description: 'Receive comprehensive scores, grade breakdowns, and detailed candidate feedback reports.',
        icon: Award,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
    },
]

const TRUST_BADGES = [
    { icon: Shield, label: 'Data Secure', sub: 'End-to-end encrypted' },
    { icon: Globe, label: 'Cloud Ready', sub: 'Multi-region deployment' },
    { icon: LineChart, label: 'Real Analytics', sub: 'Live score dashboards' },
    { icon: Star, label: 'Research-Grade', sub: 'Academic peer reviewed' },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
    const [scrolled, setScrolled] = useState(false)
    const [activeModule, setActiveModule] = useState<string | null>(null)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="min-h-screen bg-[#f8f9fc] font-sans">
            {/* ── NAV ─────────────────────────────────────────────────────────────── */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200' : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-300">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <span className="text-white text-[5px] font-bold">AI</span>
                            </div>
                        </div>
                        <div>
                            <p className={`font-bold leading-tight text-sm transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-white'}`}>SmartHire</p>
                            <p className={`text-[10px] leading-tight transition-colors duration-300 ${scrolled ? 'text-slate-500' : 'text-white/70'}`}>Job Matching Platform</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className={`hidden md:flex items-center gap-6 text-sm font-medium transition-colors duration-300 ${scrolled ? 'text-slate-600' : 'text-white/80'}`}>
                        <a href="#modules" className="hover:text-indigo-400 transition-colors">Solutions</a>
                        <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
                        <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>
                    </div>

                    {/* Portal access buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            href="/attendee/login"
                            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-100 transition-all duration-200"
                        >
                            <LogIn className="w-4 h-4" />
                            User Login
                        </Link>
                        <Link
                            href="/admin"
                            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-indigo-300 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ────────────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950">
                    {/* Animated circles */}
                    <div className="absolute top-20 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-800/10 rounded-full blur-3xl" />
                    {/* Gold accent for finance */}
                    <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl animate-pulse delay-500" />

                    {/* Grid overlay */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `
                linear-gradient(to right, rgba(139,92,246,0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(139,92,246,0.3) 1px, transparent 1px)
              `,
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Text */}
                    <div className="space-y-8">

                        {/* Headline */}
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                                Hire Smarter.
                                <br />
                                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                                    Hire Faster.
                                </span>
                            </h1>
                            <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                                An intelligent, AI-powered recruitment platform that automates evaluation
                                for <span className="text-amber-400 font-semibold">Software Engineers</span>,
                                <span className="text-emerald-400 font-semibold"> Project Managers</span>,
                                <span className="text-amber-300 font-semibold"> Accountants</span> &
                                <span className="text-rose-400 font-semibold"> Merchandisers</span>.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/attendee/login"
                                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-amber-400/30 transition-all duration-200 hover:-translate-y-1 text-base"
                            >
                                <LogIn className="w-5 h-5" />
                                User Login
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200 text-base"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                Admin Portal
                            </Link>
                        </div>

                        {/* Mini stats */}
                        <div className="flex flex-wrap gap-6 pt-2">
                            {STATS.map((s) => {
                                const Icon = s.icon
                                return (
                                    <div key={s.label} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
                                            <p className="text-slate-400 text-xs leading-tight">{s.label}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right: Visual Card Stack */}
                    <div className="hidden lg:block relative">
                        {/* Main card */}
                        <div className="relative bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">Live Evaluation</p>
                                    <p className="text-white/60 text-xs">Real-time AI analysis</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-emerald-400 text-xs font-semibold">Active</span>
                                </div>
                            </div>

                            {/* Mock score display */}
                            <div className="bg-gradient-to-br from-indigo-600/40 to-violet-700/40 rounded-2xl p-5 mb-4">
                                <p className="text-white/70 text-xs font-semibold mb-2 uppercase tracking-wider">Candidate Score</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-6xl font-black text-white">8.4</span>
                                    <span className="text-white/50 text-xl mb-2">/10</span>
                                    <div className="ml-auto bg-emerald-500 text-white font-black text-2xl px-4 py-2 rounded-xl">B+</div>
                                </div>
                                <div className="mt-3 h-2.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full" style={{ width: '84%' }} />
                                </div>
                            </div>

                            {/* Mini metrics */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Code Quality', val: '9.1', color: 'text-emerald-400' },
                                    { label: 'Algorithm', val: '7.8', color: 'text-amber-400' },
                                    { label: 'Interview', val: '8.2', color: 'text-violet-400' },
                                ].map((m) => (
                                    <div key={m.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                                        <p className={`text-xl font-bold ${m.color}`}>{m.val}</p>
                                        <p className="text-white/50 text-[10px] mt-0.5 leading-tight">{m.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating badges */}
                        <div className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl px-4 py-3 shadow-xl rotate-3">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-white" />
                                <span className="text-white text-xs font-bold">AI-Powered</span>
                            </div>
                        </div>

                        <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl -rotate-2 border border-slate-100">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span className="text-slate-800 text-xs font-bold">Bias-Free Hiring</span>
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            {/* ── TRUST STRIP ─────────────────────────────────────────────────────── */}
            <section className="bg-white border-y border-slate-100 py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {TRUST_BADGES.map((b) => {
                            const Icon = b.icon
                            return (
                                <div key={b.label} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                        <Icon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-semibold text-sm">{b.label}</p>
                                        <p className="text-slate-500 text-xs">{b.sub}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ── QUICK ACCESS PORTALS ───────────────────────────────────────────── */}
            <section id="portals" className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid sm:grid-cols-2 gap-5">

                    {/* User / Candidate Portal */}
                    <div className="group relative overflow-hidden rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-sm hover:shadow-xl hover:shadow-amber-200 hover:-translate-y-1 transition-all duration-300">
                        {/* Decorative blob */}
                        <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-300/20 rounded-full blur-2xl" />
                        <div className="relative flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-300 shrink-0">
                                <LogIn className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-black text-slate-900">User Portal</h3>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />
                                        Live
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mb-1 font-medium">Accountants &amp; Candidates</p>
                                <p className="text-slate-500 text-sm leading-relaxed mb-5">
                                    Log in to access your assessments, take quizzes, view results, and track your evaluation progress.
                                </p>
                                <Link
                                    href="/attendee/login"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-amber-300 text-sm transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Go to Login
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Admin Portal */}
                    <div className="group relative overflow-hidden rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-1 transition-all duration-300">
                        {/* Decorative blob */}
                        <div className="absolute -right-8 -top-8 w-36 h-36 bg-indigo-300/20 rounded-full blur-2xl" />
                        <div className="relative flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-300 shrink-0">
                                <LayoutDashboard className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-black text-slate-900">Admin Portal</h3>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />
                                        Live
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mb-1 font-medium">HR Managers &amp; Administrators</p>
                                <p className="text-slate-500 text-sm leading-relaxed mb-5">
                                    Access your admin dashboard to manage candidates, review scores, configure assessments, and generate reports.
                                </p>
                                <Link
                                    href="/admin"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-300 text-sm transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <Lock className="w-4 h-4" />
                                    Admin Access
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── MODULES ─────────────────────────────────────────────────────────── */}
            <section id="modules" className="py-24 max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-3">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full">
                        <Code2 className="w-3.5 h-3.5" />
                        Smart Role Modules
                    </div>
                    <h2 className="text-4xl font-black text-slate-900">
                        One Platform, Every Role
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Discover AI-driven evaluation modules purpose-built for each professional
                        function — from code to finance.
                    </p>
                </div>

                {/* Module Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {PLATFORM_MODULES.map((mod) => {
                        const Icon = mod.icon
                        const isActive = activeModule === mod.id
                        return (
                            <div
                                key={mod.id}
                                onMouseEnter={() => setActiveModule(mod.id)}
                                onMouseLeave={() => setActiveModule(null)}
                                className={`group relative bg-white rounded-3xl border-2 transition-all duration-300 overflow-hidden cursor-pointer ${isActive
                                    ? 'border-slate-300 shadow-2xl ' + mod.glow + ' -translate-y-1'
                                    : 'border-slate-100 shadow-sm hover:shadow-lg'
                                    }`}
                            >
                                {/* Top gradient strip */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${mod.gradient}`} />

                                <div className="p-7">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">{mod.title}</h3>
                                                <p className="text-slate-500 text-sm">{mod.subtitle}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${mod.tag === 'Live'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                            {mod.tag === 'Live' && <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />}
                                            {mod.tag}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-600 text-sm leading-relaxed mb-5">
                                        {mod.description}
                                    </p>

                                    {/* Feature pills */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {mod.features.map((f) => (
                                            <span key={f} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${mod.accent}`}>
                                                {f}
                                            </span>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        href={mod.href}
                                        className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${mod.tag === 'Live'
                                            ? `bg-gradient-to-r ${mod.gradient} text-white hover:shadow-lg hover:opacity-90`
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                        onClick={mod.tag !== 'Live' ? (e) => e.preventDefault() : undefined}
                                    >
                                        {mod.tag === 'Live' ? (
                                            <>
                                                <LogIn className="w-4 h-4" />
                                                Launch Module
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-4 h-4" />
                                                Coming Soon
                                            </>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
            <section id="how-it-works" className="bg-gradient-to-br from-slat-50 to-indigo-50/50 py-24 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Section Header */}
                    <div className="text-center mb-16 space-y-3">
                        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-full shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Simple 4-Step Process
                        </div>
                        <h2 className="text-4xl font-black text-slate-900">How SmartHire Works</h2>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto">
                            From candidate submission to final hiring decision — all automated, all intelligent.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {/* Connector line (desktop) */}
                        <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 via-amber-200 to-emerald-200 z-0" />

                        {PROCESS_STEPS.map((step, idx) => {
                            const Icon = step.icon
                            return (
                                <div key={step.step} className="relative z-10 text-center">
                                    <div className={`mx-auto w-28 h-28 rounded-3xl ${step.bg} border-2 ${step.border} flex flex-col items-center justify-center gap-1 mb-5 shadow-sm`}>
                                        <Icon className={`w-8 h-8 ${step.color}`} />
                                        <span className={`text-xs font-black ${step.color} opacity-60`}>{step.step}</span>
                                    </div>
                                    <h3 className="text-slate-900 font-bold text-lg mb-2">{step.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed px-2">{step.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ── HR & FINANCE HIGHLIGHT ───────────────────────────────────────────── */}
            <section id="about" className="py-24 max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Finance Focus Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-3xl blur-2xl" />
                        <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                            {/* Finance header */}
                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Finance-Ready Assessments</p>
                                        <p className="text-white/80 text-sm">Accountants & Budget Roles</p>
                                    </div>
                                </div>
                                <p className="text-white/90 text-sm">
                                    Evaluate financial professionals with domain-specific tests covering accounting standards, compliance, and real-world fiscal scenarios.
                                </p>
                            </div>

                            {/* Finance metrics mock */}
                            <div className="p-6 space-y-4">
                                {[
                                    { label: 'GAAP Knowledge', pct: 88, color: 'bg-amber-500' },
                                    { label: 'Audit Readiness', pct: 72, color: 'bg-orange-500' },
                                    { label: 'Financial Modeling', pct: 94, color: 'bg-yellow-500' },
                                    { label: 'Tax Compliance', pct: 80, color: 'bg-amber-600' },
                                ].map((m) => (
                                    <div key={m.label}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-slate-700 font-medium">{m.label}</span>
                                            <span className="text-slate-500 font-bold">{m.pct}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Text */}
                    <div className="space-y-7">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full mb-4">
                                <Users className="w-3.5 h-3.5" />
                                Built for HR Teams
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 leading-tight">
                                Where HR Meets{' '}
                                <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                                    Finance Intelligence
                                </span>
                            </h2>
                        </div>

                        <p className="text-slate-600 text-lg leading-relaxed">
                            SmartHire bridges the gap between people management and financial precision.
                            HR teams get structured, data-driven candidate reports that align with
                            budget constraints, role requirements, and company growth targets.
                        </p>

                        <div className="space-y-4">
                            {[
                                {
                                    icon: Shield,
                                    title: 'Standardized & Fair',
                                    desc: 'Eliminate hiring bias with objective AI scoring across all candidates.',
                                    color: 'text-indigo-600',
                                    bg: 'bg-indigo-50',
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'ROI-Driven Decisions',
                                    desc: 'Reduce mis-hires and cut recruitment costs with precision assessments.',
                                    color: 'text-amber-600',
                                    bg: 'bg-amber-50',
                                },
                                {
                                    icon: BarChart3,
                                    title: 'Actionable Insights',
                                    desc: 'Detailed score breakdowns, feedback reports, and grade comparisons.',
                                    color: 'text-emerald-600',
                                    bg: 'bg-emerald-50',
                                },
                            ].map((item) => {
                                const Icon = item.icon
                                return (
                                    <div key={item.title} className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                                            <Icon className={`w-5 h-5 ${item.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-bold text-base">{item.title}</p>
                                            <p className="text-slate-500 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <Link
                            href="/attendee/login"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-indigo-300 transition-all duration-200 hover:-translate-y-0.5 text-base"
                        >
                            <LogIn className="w-5 h-5" />
                            Go to Login
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-12 text-center shadow-2xl">
                        {/* Decorative blobs */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl" />

                        <div className="relative space-y-6 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-4 py-2 rounded-full">
                                <Award className="w-3.5 h-3.5" />
                                Research-Grade · 2025-2026 FYP
                            </div>
                            <h2 className="text-4xl font-black text-white">
                                Ready to Transform Your Hiring?
                            </h2>
                            <p className="text-slate-300 text-lg">
                                Experience the future of automated recruitment. Evaluate your first
                                candidate in minutes — no setup required.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/attendee/login"
                                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold px-10 py-4 rounded-xl hover:shadow-xl hover:shadow-amber-400/30 transition-all duration-200 hover:-translate-y-1 text-base"
                                >
                                    <LogIn className="w-5 h-5" />
                                    User Login
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/admin"
                                    className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/20 transition-all duration-200 text-base"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Admin Portal
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
            <footer className="border-t border-slate-200 bg-white py-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-700 font-bold text-sm">SmartHire Platform</span>
                    </div>
                    <p className="text-slate-400 text-sm text-center">
                        © 2026 SmartHire · All rights reserved
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Shield className="w-4 h-4 text-indigo-400" />
                        Research Use Only
                    </div>
                </div>
            </footer>
        </div>
    )
}
