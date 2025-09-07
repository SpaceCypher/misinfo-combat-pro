'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/simple-auth-context';

export default function Terms() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">MisInfo Combat Pro</h1>
            </div>

            {/* Center - Navigation */}
            <nav className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/training"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Training
              </Link>
              <Link
                href="/analyzer"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Analyze
              </Link>
              <Link
                href="/verifier"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Verify
              </Link>
            </nav>

            {/* Right side - Profile */}
            {user ? (
              <Link href="/profile" className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">Level 3</span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.displayName ? 
                          user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : 
                          user?.email?.[0]?.toUpperCase() || 'U'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using MisInfo Combat Pro, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not 
                use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description of Service</h2>
              <p className="text-gray-700 mb-4">
                MisInfo Combat Pro is an AI-powered platform that provides:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Misinformation detection and analysis</li>
                <li>Interactive training modules for media literacy</li>
                <li>Real-time claim verification services</li>
                <li>Educational resources about misinformation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <p className="text-gray-700 mb-4">As a user of our service, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and complete information when creating an account</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not upload content that violates intellectual property rights</li>
                <li>Not attempt to circumvent security measures</li>
                <li>Not use the service to spread misinformation</li>
                <li>Respect the rights and privacy of other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content and Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                You retain ownership of content you upload to our service. However, by uploading content, 
                you grant us a license to process, analyze, and store that content for the purpose of 
                providing our services.
              </p>
              <p className="text-gray-700">
                All intellectual property rights in the service, including software, algorithms, and 
                educational content, remain our property or that of our licensors.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accuracy and Limitations</h2>
              <p className="text-gray-700 mb-4">
                While we strive to provide accurate misinformation detection and fact-checking services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Our AI systems may not be 100% accurate</li>
                <li>Results should be used as guidance, not absolute truth</li>
                <li>Users should exercise critical thinking and verify information independently</li>
                <li>We are not responsible for decisions made based on our analysis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy and Data Protection</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy to understand how we 
                collect, use, and protect your information. By using our service, you consent to the 
                collection and use of information as outlined in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700">
                To the maximum extent permitted by law, MisInfo Combat Pro shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages, or any loss of profits 
                or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, 
                or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account and access to the service immediately, without 
                prior notice or liability, for any reason whatsoever, including without limitation if you 
                breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify or replace these Terms at any time. If a revision is 
                material, we will try to provide at least 30 days notice prior to any new terms taking 
                effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be interpreted and governed by the laws of India, without regard to its 
                conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@misinfocombatpro.com<br />
                  <strong>Address:</strong> [Your Address]<br />
                  <strong>Phone:</strong> [Your Phone Number]
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}