"use client";
import React, { useState, useEffect } from 'react';
import { User, BookOpen, Shield, Calendar, CheckCircle, ArrowRight, Award, Lock } from 'lucide-react';

export default function ExamManagementLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const signinOptions = [
    {
      type: 'Student',
      icon: <User className="w-7 h-7" />,
      description: 'Access exam schedules, view results, and manage your academic timeline',
      features: ['Personal Dashboard', 'Exam Calendar', 'Result Tracking'],
      delay: 'delay-[200ms]'
    },
    {
      type: 'Professor',
      icon: <BookOpen className="w-7 h-7" />,
      description: 'Create exams, manage assessments, and analyze student performance',
      features: ['Exam Builder', 'Grade Management', 'Analytics Suite'],
      delay: 'delay-[400ms]'
    },
    {
      type: 'Admin',
      icon: <Shield className="w-7 h-7" />,
      description: 'Oversee operations, manage users, and configure system settings',
      features: ['User Management', 'System Config', 'Reports Center'],
      delay: 'delay-[600ms]'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`fixed top-0 w-full bg-white border-b border-gray-200 z-50 shadow-sm transform transition-all duration-700 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ExamHub</h1>
                <p className="text-xs text-gray-500 font-medium">University Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Secure Platform</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-8 py-16">
          
          {/* Hero Section */}
          <div className={`max-w-4xl mx-auto text-center mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full text-blue-700 text-sm font-medium mb-8">
                <Award className="w-4 h-4" />
                <span>Trusted by 500+ Universities</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
              University Exam
              <br />
              <span className="text-blue-600">Management System</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Streamline your academic operations with our comprehensive platform designed 
              specifically for higher education institutions. Manage exams, track performance, 
              and enhance student outcomes with enterprise-grade reliability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold transition-colors duration-200">
                View Demo
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {[
              { number: '500+', label: 'Universities' },
              { number: '2M+', label: 'Students' },
              { number: '50K+', label: 'Professors' },
              { number: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Overview */}
          <div className={`bg-white rounded-2xl border border-gray-200 p-12 mb-20 shadow-sm transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything You Need for Academic Excellence
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Built specifically for universities, our platform integrates seamlessly with existing 
                academic systems while providing advanced tools for modern educational management.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Calendar className="w-8 h-8 text-blue-600" />,
                  title: 'Smart Scheduling',
                  description: 'Automated conflict detection, room optimization, and resource allocation for seamless exam coordination.'
                },
                {
                  icon: <CheckCircle className="w-8 h-8 text-green-600" />,
                  title: 'Real-time Monitoring',
                  description: 'Live tracking of exam progress, attendance monitoring, and instant notification systems.'
                },
                {
                  icon: <Shield className="w-8 h-8 text-purple-600" />,
                  title: 'Enterprise Security',
                  description: 'Bank-level encryption, role-based access control, and comprehensive audit trails.'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-in Options */}
          <div className="max-w-6xl mx-auto">
            <div className={`text-center mb-16 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Access Your Dashboard
              </h2>
              <p className="text-xl text-gray-600">Choose your role to continue to your personalized workspace</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {signinOptions.map((option, index) => (
                <div
                  key={option.type}
                  className={`group bg-white border-2 border-gray-200 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${option.delay}`}
                  onMouseEnter={() => setActiveCard(index)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                      <div className="text-blue-600">
                        {option.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {option.type}
                      </h3>
                      <div className="text-sm text-gray-500 font-medium">Portal Access</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {option.description}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    activeCard === index 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}>
                    <span>Sign In as {option.type}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-20 text-center transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="font-medium">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span className="font-medium">256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span className="font-medium">FERPA Certified</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}