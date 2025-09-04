'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/simple-auth-context';
import { Shield, Brain, Search, Upload, Eye, ArrowRight, Play, Menu, X, User, LogOut } from 'lucide-react';

export default function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSignOut = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">MisInfo Combat Pro</span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Features
                            </Link>
                            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                                How It Works
                            </Link>
                            <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                                About
                            </Link>
                            <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Contact
                            </Link>

                            {user ? (
                                // Authenticated user navigation
                                <div className="flex items-center space-x-4">
                                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                                        Dashboard
                                    </Link>
                                    <div className="flex items-center space-x-2">
                                        <Link href="/profile" className="hover:opacity-80 transition-opacity">
                                            {user.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt="Profile"
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </div>
                                            )}
                                        </Link>
                                        <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                                            {user.displayName || user.email}
                                        </Link>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                // Unauthenticated user navigation
                                <>
                                    <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 transition-colors">
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100">
                            <div className="flex flex-col space-y-4">
                                <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Features
                                </Link>
                                <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    How It Works
                                </Link>
                                <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    About
                                </Link>
                                <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Contact
                                </Link>

                                {user ? (
                                    // Authenticated user mobile navigation
                                    <>
                                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                                            Dashboard
                                        </Link>
                                        <div className="flex items-center space-x-2 py-2">
                                            <Link href="/profile" className="hover:opacity-80 transition-opacity">
                                                {user.photoURL ? (
                                                    <img
                                                        src={user.photoURL}
                                                        alt="Profile"
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                )}
                                            </Link>
                                            <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                                                {user.displayName || user.email}
                                            </Link>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </>
                                ) : (
                                    // Unauthenticated user mobile navigation
                                    <>
                                        <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 transition-colors">
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/auth/signup"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-center"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Combat Misinformation with AI
                            <span className="block text-blue-600">Education</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Detect fake news, learn manipulation patterns, and verify claims instantly.
                            Empowering Indian citizens with AI-powered tools to fight misinformation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href={user ? "/dashboard" : "/analyzer"}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors flex items-center space-x-2"
                            >
                                <Upload className="w-5 h-5" />
                                <span>{user ? "Go to Dashboard" : "Start Analyzing Content"}</span>
                            </Link>
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                                <Play className="w-5 h-5" />
                                <span>Watch Demo</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Powerful AI Tools for Truth
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Three essential features to combat misinformation effectively
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Smart Analyzer */}
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <Brain className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Analyzer</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Upload text, images, or videos for instant AI-powered misinformation detection with detailed analysis reports.
                            </p>
                            <Link
                                href="/analyzer"
                                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 transition-colors"
                            >
                                <span>Learn More</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Interactive Trainer */}
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <Eye className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Trainer</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Practice identifying fake news patterns through gamified training modules with real-time examples.
                            </p>
                            <Link
                                href="/training"
                                className="text-green-600 hover:text-green-700 font-semibold flex items-center space-x-1 transition-colors"
                            >
                                <span>Start Training</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Claim Verifier */}
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                <Search className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Claim Verifier</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Extract and verify factual claims from any content with real-time source checking and credibility scoring.
                            </p>
                            <Link
                                href="/verifier"
                                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1 transition-colors"
                            >
                                <span>Verify Claims</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Simple steps to verify information and learn about misinformation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Content</h3>
                            <p className="text-gray-600">
                                Share text, images, or videos you want to verify
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analysis</h3>
                            <p className="text-gray-600">
                                Our AI examines patterns, sources, and credibility
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Get Results</h3>
                            <p className="text-gray-600">
                                Receive detailed analysis with risk scores
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">4</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Learn & Share</h3>
                            <p className="text-gray-600">
                                Understand why and share verified information
                            </p>
                        </div>
                    </div>
                </div>
            </section>



            {/* CTA Section */}
            <section className="py-20 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Fight Misinformation?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join thousands of Indians using AI to verify information and combat fake news.
                    </p>
                    <Link
                        href={user ? "/dashboard" : "/auth/signup"}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-lg text-lg transition-colors inline-block"
                    >
                        {user ? "Go to Dashboard" : "Get Started Free"}
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">MisInfo Combat Pro</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Empowering India with AI-powered misinformation detection and education.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white mb-4">Features</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/analyzer" className="hover:text-white transition-colors">Smart Analyzer</Link></li>
                                <li><Link href="/training" className="hover:text-white transition-colors">Interactive Trainer</Link></li>
                                <li><Link href="/verifier" className="hover:text-white transition-colors">Claim Verifier</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 MisInfo Combat Pro. All rights reserved.
                        </p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <span className="text-gray-400 text-sm">4 / 5</span>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-gray-400 text-sm">Made in India</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
