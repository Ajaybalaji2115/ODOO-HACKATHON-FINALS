import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaApple, FaGooglePlay, FaLinkedinIn, FaGithub,
    FaInstagram, FaEnvelope, FaAward,
    FaUsers, FaCertificate, FaGlobe
} from 'react-icons/fa';

const Footer = () => {
    const valueProps = [
        { icon: <FaAward className="text-blue-600" />, title: "Industry Recognized", desc: "Certificates valued by top global employers." },
        { icon: <FaUsers className="text-purple-600" />, title: "Expert Community", desc: "Learn from 500+ industry leading mentors." },
        { icon: <FaCertificate className="text-emerald-600" />, title: "Skills Analytics", desc: "Track your growth with AI-driven insights." },
        { icon: <FaGlobe className="text-amber-600" />, title: "Global Access", desc: "Join 2M+ learners across 150 countries." },
    ];

    const linkColumns = [
        {
            title: "Learning",
            links: [
                { name: "Browse Catalog", path: "/catalog" },
                { name: "Executive Programs", path: "/executive" },
                { name: "Skill Mastery Tracks", path: "/tracks" },
                { name: "Enterprise Learning", path: "/enterprise" },
                { name: "University Credits", path: "/credits" },
                { name: "Free Courses", path: "/free" }
            ]
        },
        {
            title: "Community",
            links: [
                { name: "Learner Stories", path: "/stories" },
                { name: "Partner with Us", path: "/partners" },
                { name: "Beta Program", path: "/beta" },
                { name: "The Insight Blog", path: "/blog" },
                { name: "Mentorship", path: "/mentors" },
                { name: "Affiliates", path: "/affiliates" }
            ]
        },
        {
            title: "Company",
            links: [
                { name: "Our Mission", path: "/about" },
                { name: "Leadership", path: "/leadership" },
                { name: "Careers", path: "/careers" },
                { name: "Press & Media", path: "/press" },
                { name: "Social Impact", path: "/impact" },
                { name: "Contact", path: "/contact" }
            ]
        },
        {
            title: "Resources",
            links: [
                { name: "Help Center", path: "/help" },
                { name: "Certification FAQ", path: "/faq" },
                { name: "System Status", path: "/status" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Use", path: "/terms" },
                { name: "Sitemap", path: "/sitemap" }
            ]
        }
    ];

    return (
        <footer className="bg-white border-t border-slate-200 font-sans relative">
            {/* Top Value Props Banner */}
            <div className="bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-10 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {valueProps.map((prop, idx) => (
                            <div key={idx} className="flex items-start gap-4 group">
                                <div className="text-2xl mt-1 transition-transform group-hover:scale-110 duration-300">{prop.icon}</div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">{prop.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{prop.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trending Skills Section */}
            <div className="border-b border-slate-100 bg-white shadow-sm relative z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest min-w-fit whitespace-nowrap flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Trending Skills
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Large Language Models", "Cyber Resilience", "AWS Architecture", "Strategic UX",
                                "Product Management", "Data Governance", "Ethical AI", "FinOps", "Salesforce",
                                "Tableau Mastery", "Six Sigma Black Belt"
                            ].map((skill, idx) => (
                                <Link
                                    key={idx}
                                    to="#"
                                    className="px-3 py-1 bg-blue-50/50 border border-blue-100 rounded-full text-[11px] text-blue-700 hover:bg-blue-100 hover:border-blue-200 hover:translate-y-[-1px] transition-all font-semibold no-underline shadow-sm"
                                >
                                    {skill}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                        <div>
                            <Link to="/" className="flex items-center gap-2 mb-6 no-underline group w-fit">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-lg shadow-blue-500/20">
                                    <span className="text-white font-bold text-xl">LS</span>
                                </div>
                                <span className="text-2xl font-extrabold tracking-tight">
                                    <span className="text-blue-700">Learn</span>
                                    <span className="text-slate-900">Sphere</span>
                                </span>
                            </Link>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm font-medium">
                                The world's most trusted professional learning platform. We provide the tools and certifications needed to succeed in the digital economy.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {[
                                { icon: <FaLinkedinIn size={18} />, href: "https://linkedin.com", label: "LinkedIn", color: "hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5]" },
                                { icon: <FaGithub size={18} />, href: "https://github.com", label: "GitHub", color: "hover:bg-[#333] hover:text-white hover:border-[#333]" },
                                { icon: <FaInstagram size={18} />, href: "#", label: "Instagram", color: "hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C]" },
                                { icon: <FaEnvelope size={18} />, href: "mailto:support@learnsphere.com", label: "Email", color: "hover:bg-red-500 hover:text-white hover:border-red-500" },
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 transition-all shadow-sm ${social.color}`}
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Grid Column */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {linkColumns.map((col, idx) => (
                                <div key={idx}>
                                    <h3 className="font-bold text-slate-900 mb-6 text-sm tracking-wide">{col.title}</h3>
                                    <ul className="space-y-3">
                                        {col.links.map((link, lIdx) => (
                                            <li key={lIdx}>
                                                <Link
                                                    to={link.path}
                                                    className="text-[13px] text-slate-500 hover:text-blue-600 no-underline transition-all font-medium flex items-center group"
                                                >
                                                    <span className="w-0 h-px bg-blue-600 mr-0 transition-all duration-300 group-hover:w-2 group-hover:mr-2 opacity-0 group-hover:opacity-100"></span>
                                                    {link.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Final Bottom Row */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-[12px] text-slate-400 font-medium">
                        &copy; {new Date().getFullYear()} LearnSphere Inc. &middot; <span className="text-slate-300">|</span> Global HQ: San Francisco, CA.
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-400 hover:shadow-md hover:scale-105 transition-all duration-300 group">
                            <FaApple size={20} className="text-slate-900" />
                            <div className="text-left">
                                <p className="text-[8px] text-slate-400 font-bold uppercase leading-tight group-hover:text-slate-500 transition-colors">Download on</p>
                                <p className="text-xs font-bold text-slate-900 leading-tight">App Store</p>
                            </div>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-400 hover:shadow-md hover:scale-105 transition-all duration-300 group">
                            <FaGooglePlay size={16} className="text-slate-900" />
                            <div className="text-left">
                                <p className="text-[8px] text-slate-400 font-bold uppercase leading-tight group-hover:text-slate-500 transition-colors">Get it on</p>
                                <p className="text-xs font-bold text-slate-900 leading-tight">Google Play</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
