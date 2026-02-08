import React from 'react';
import { Link } from 'react-router-dom';
import { FaApple, FaGooglePlay, FaLinkedin, FaGithub, FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    const sections = {
        skills: {
            title: "Skills",
            links: [
                "Artificial Intelligence (AI)", "Cybersecurity", "Data Analytics", "Digital Marketing",
                "English Speaking", "Generative AI (GenAI)", "Microsoft Excel", "Microsoft Power BI",
                "Project Management", "Python"
            ]
        },
        certificates: {
            title: "Certifications & Badges",
            links: [
                "LearnSphere Executive Certificate",
                "Course Completion Badges",
                "Skill Mastery Awards",
                "Project Excellence Badges",
                "Community Leadership Recognition",
                "Top Performer Status",
                "Quarterly Learning Milestones"
            ]
        }
    };

    const bottomSections = {
        brand: {
            title: "LearnSphere",
            links: ["About", "What We Offer", "Leadership", "Careers", "Catalog"]
        },
        community: {
            title: "Community",
            links: ["Learners", "Partners", "Beta Testers", "Blog", "The LearnSphere Podcast"]
        },
        more: {
            title: "More",
            links: ["Press", "Investors", "Terms", "Privacy", "Help"]
        }
    };

    return (
        <footer className="bg-gray-50 pt-16 pb-12 border-t border-gray-200 font-sans text-left">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                {/* Top Section: Skills, Certificates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {Object.entries(sections).map(([key, section]) => (
                        <div key={key}>
                            <h3 className="font-bold text-gray-900 mb-4 text-base">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link, idx) => (
                                    <li key={idx}>
                                        <Link to="#" className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors block">
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-10"></div>

                {/* Bottom Section: Brand, Community, More, App Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Brand Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-base">{bottomSections.brand.title}</h3>
                        <ul className="space-y-3">
                            {bottomSections.brand.links.map((link, idx) => (
                                <li key={idx}>
                                    {link === "Careers" || link === "Blog" ? (
                                        <a href="#" className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors block">{link}</a>
                                    ) : (
                                        <Link to={link === "About" ? "/about" : "#"} className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors block">
                                            {link}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-base">{bottomSections.community.title}</h3>
                        <ul className="space-y-3">
                            {bottomSections.community.links.map((link, idx) => (
                                <li key={idx}>
                                    <a href="#" className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors block">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* More Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-base">{bottomSections.more.title}</h3>
                        <ul className="space-y-3">
                            {bottomSections.more.links.map((link, idx) => (
                                <li key={idx}>
                                    <Link to={link === "Privacy" ? "/privacy" : link === "Terms" ? "/terms" : link === "Contact" ? "/contact" : "#"} className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors block">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* App Store Buttons */}
                    <div className="flex flex-col items-start gap-6">
                        {/* App Store Buttons */}
                        <div className="flex flex-col gap-4">
                            <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors w-48">
                                <FaApple size={28} />
                                <div className="text-left">
                                    <div className="text-[10px] leading-tight">Download on the</div>
                                    <div className="text-lg font-bold leading-tight">App Store</div>
                                </div>
                            </button>

                            <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors w-48">
                                <FaGooglePlay size={24} className="ml-0.5" />
                                <div className="text-left pl-1">
                                    <div className="text-[10px] leading-tight uppercase">Get it on</div>
                                    <div className="text-lg font-bold leading-tight">Google Play</div>
                                </div>
                            </button>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a
                                href="https://www.linkedin.com/in/ganeshsaravanan19/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#0077b5] hover:text-white transition-all duration-300"
                                aria-label="LinkedIn"
                            >
                                <FaLinkedin size={20} />
                            </a>
                            <a
                                href="https://github.com/GaneshLathin"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#333] hover:text-white transition-all duration-300"
                                aria-label="GitHub"
                            >
                                <FaGithub size={20} />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#E1306C] hover:text-white transition-all duration-300"
                                aria-label="Instagram"
                            >
                                <FaInstagram size={20} />
                            </a>
                            <a
                                href="mailto:ganeshsaravanan1905@gmail.com"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-300"
                                aria-label="Email"
                            >
                                <FaEnvelope size={20} />
                            </a>
                        </div>
                    </div>

                </div>

                {/* Footer Bottom: Copyright */}
                <div className="pt-12 mt-8 border-t border-gray-200 text-center md:text-left">
                    <span className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} LearnSphere Inc. All rights reserved.
                    </span>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
