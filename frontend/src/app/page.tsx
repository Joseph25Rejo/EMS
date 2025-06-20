import React, { useState, useEffect } from 'react';
import { User, BookOpen, Shield, Calendar, ArrowRight, Zap, Target, Clock, Sparkles, Star, Hexagon } from 'lucide-react';

export default function ExamManagementLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: { clientX: any; clientY: any; }) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const signinOptions = [
    {
      type: 'Student',
      icon: <User className="w-8 h-8" />,
      description: 'Your academic journey starts here - schedules, results, and more',
      accent: 'cyan',
      gradient: 'from-cyan-400 to-blue-600',
      pattern: 'dots'
    },
    {
      type: 'Professor',
      icon: <BookOpen className="w-8 h-8" />,
      description: 'Powerful tools for creating and managing student assessments',
      accent: 'purple',
      gradient: 'from-purple-400 to-pink-600',
      pattern: 'lines'
    },
    {
      type: 'Admin',
      icon: <Shield className="w-8 h-8" />,
      description: 'Complete control over your institution\'s exam ecosystem',
      accent: 'emerald',
      gradient: 'from-emerald-400 to-teal-600',
      pattern: 'grid'
    }
  ];

  const getAccentColors = (color: string, isHovered: boolean) => {
    const colors = {
      cyan: {
        bg: isHovered ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-cyan-400 to-blue-500',
        text: 'text-cyan-500',
        border: 'border-cyan-200/50',
        shadow: 'shadow-cyan-500/25',
        glow: 'shadow-cyan-400/50'
      },
      purple: {
        bg: isHovered ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gradient-to-r from-purple-400 to-pink-500',
        text: 'text-purple-500',
        border: 'border-purple-200/50',
        shadow: 'shadow-purple-500/25',
        glow: 'shadow-purple-400/50'
      },
      emerald: {
        bg: isHovered ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-emerald-400 to-teal-500',
        text: 'text-emerald-500',
        border: 'border-emerald-200/50',
        shadow: 'shadow-emerald-500/25',
        glow: 'shadow-emerald-400/50'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Dynamic gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
          style={{
            left: mousePosition.x / 10 - 100,
            top: mousePosition.y / 10 - 100,
            transform: `translate3d(0, ${scrollY * 0.1}px, 0)`
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
          style={{
            right: mousePosition.x / 15 - 80,
            bottom: mousePosition.y / 15 - 80,
            transform: `translate3d(0, ${scrollY * -0.05}px, 0)`
          }}
        ></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate3d(0, ${scrollY * 0.02}px, 0)`
        }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className={`relative z-50 bg-black/20 backdrop-blur-2xl border-b border-white/10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-cyan-500/25">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/30 to-blue-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  ExamHub
                </h1>
                <p className="text-sm text-cyan-400 font-bold -mt-1 animate-pulse">Smart. Simple. Secure.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-6xl mx-auto px-8 py-16">
          
          {/* Hero Section */}
          <div className={`text-center mb-20 transform transition-all duration-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
              
              <h1 className="relative text-7xl md:text-8xl font-black text-white mb-6 tracking-tight leading-none">
                Exam Management
                <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent relative animate-pulse">
                  Reimagined
                  <div className="absolute -bottom-4 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full opacity-60 animate-pulse"></div>
                </span>
              </h1>
              
              {/* Floating geometric elements */}
              <Hexagon className="absolute -top-12 -right-16 w-8 h-8 text-cyan-400/60 animate-spin" style={{ animationDuration: '10s' }} />
              <Star className="absolute -bottom-8 -left-16 w-6 h-6 text-purple-400/60 animate-pulse" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse"></div>
            </div>
            
            <p className="text-2xl text-slate-300 mb-16 max-w-4xl mx-auto font-light leading-relaxed">
              The most <span className="font-bold text-cyan-400">intuitive platform</span> for universities to handle exams, schedules, and assessments.
              <br className="hidden md:block" />
              <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Built for the future of education.</span>
            </p>
          </div>

          {/* Sign-in Options - Primary Focus */}
          <div className="mb-24">
            <div className={`text-center mb-16 transform transition-all duration-1200 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
              <h2 className="text-5xl font-black text-white mb-6 bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                Choose Your Portal
              </h2>
              <p className="text-2xl text-slate-300 font-light">Step into your personalized workspace</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {signinOptions.map((option, index) => {
                const colors = getAccentColors(option.accent, hoveredCard === index);
                return (
                  <div
                    key={option.type}
                    className={`group relative bg-black/40 backdrop-blur-xl rounded-3xl p-10 cursor-pointer transform transition-all duration-700 hover:scale-105 hover:-translate-y-4 border border-white/10 hover:border-white/20 hover:shadow-2xl ${colors.glow} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}
                    style={{ 
                      transitionDelay: `${600 + index * 200}ms`,
                      boxShadow: hoveredCard === index ? `0 25px 50px -12px ${option.accent === 'cyan' ? 'rgba(6, 182, 212, 0.4)' : option.accent === 'purple' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(16, 185, 129, 0.4)'}` : ''
                    }}
                    onMouseEnter={() => setHoveredCard(index as number)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Animated background gradient */}
                    <div className={`absolute inset-0 rounded-3xl opacity-10 bg-gradient-to-br ${option.gradient} group-hover:opacity-20 transition-opacity duration-500`}></div>
                    
                    {/* Background pattern */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                      <div className={`absolute top-0 right-0 w-40 h-40 opacity-10 bg-gradient-to-br ${option.gradient}`} style={{
                        maskImage: option.pattern === 'dots' ? 
                          'radial-gradient(circle at 3px 3px, black 2px, transparent 0)' :
                          option.pattern === 'lines' ?
                          'repeating-linear-gradient(45deg, black 0px, black 2px, transparent 2px, transparent 12px)' :
                          'linear-gradient(90deg, black 2px, transparent 2px), linear-gradient(180deg, black 2px, transparent 2px)',
                        maskSize: option.pattern === 'dots' ? '16px 16px' : option.pattern === 'lines' ? '12px 12px' : '12px 12px'
                      }}></div>
                    </div>
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-8">
                        <div className={`w-20 h-20 bg-gradient-to-br ${option.gradient} rounded-3xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}>
                          <div className="text-white transform group-hover:scale-110 transition-transform duration-300">
                            {option.icon}
                          </div>
                        </div>
                        <Sparkles className="w-6 h-6 text-yellow-400 mx-auto animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      
                      {/* Content */}
                      <div className="text-center">
                        <h3 className="text-3xl font-black text-white mb-4 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                          {option.type}
                        </h3>
                        
                        <p className="text-slate-300 mb-10 leading-relaxed text-lg font-light">
                          {option.description}
                        </p>
                        
                        {/* Button */}
                        <button className={`w-full bg-gradient-to-r ${option.gradient} text-white py-5 px-8 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transform transition-all duration-500 hover:shadow-2xl hover:scale-105 shadow-lg relative overflow-hidden group-hover:animate-pulse`}>
                          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <span className="relative z-10">Enter Portal</span>
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Features - Secondary */}
          <div className={`transform transition-all duration-1200 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="bg-black/30 backdrop-blur-2xl rounded-3xl border border-white/10 p-16 shadow-2xl relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-16">
                  <h3 className="text-4xl font-black text-white mb-6 bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                    Why Choose ExamHub?
                  </h3>
                  <p className="text-xl text-slate-300 max-w-3xl mx-auto font-light">
                    Experience the perfect blend of <span className="font-bold text-cyan-400">innovation</span> and <span className="font-bold text-purple-400">elegance</span> in academic management
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-10">
                  {[
                    {
                      icon: <Zap className="w-10 h-10 text-yellow-400" />,
                      title: 'Lightning Fast',
                      description: 'Instant loading, real-time updates, zero delays in your workflow',
                      gradient: 'from-yellow-400 to-orange-500'
                    },
                    {
                      icon: <Target className="w-10 h-10 text-green-400" />,
                      title: 'Precision Built',
                      description: 'Every feature crafted specifically for academic excellence',
                      gradient: 'from-green-400 to-emerald-500'
                    },
                    {
                      icon: <Clock className="w-10 h-10 text-blue-400" />,
                      title: 'Save Hours Daily',
                      description: 'Automate repetitive tasks and focus on what matters most',
                      gradient: 'from-blue-400 to-cyan-500'
                    }
                  ].map((feature, index) => (
                    <div key={index} className="text-center group relative">
                      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500" style={{
                        background: `linear-gradient(135deg, ${feature.gradient.split(' ')[0].replace('from-', '')}, ${feature.gradient.split(' ')[2].replace('to-', '')})`
                      }}></div>
                      
                      <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl relative`}>
                        <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 text-white">
                          {feature.icon}
                        </div>
                      </div>
                      
                      <h4 className="text-2xl font-bold text-white mb-4 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-lg font-light group-hover:text-slate-200 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`text-center mt-20 transform transition-all duration-1200 delay-1400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex items-center justify-center space-x-6 text-slate-400 font-semibold text-lg">
              <span className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Secure</span>
              </span>
              <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
              <span className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Reliable</span>
              </span>
              <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
              <span className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Built for Education</span>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}