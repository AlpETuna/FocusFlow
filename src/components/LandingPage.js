import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TreePine, Users, Trophy, Brain, ArrowRight, Check } from 'lucide-react';

function LandingPage() {
  const features = [
    {
      icon: <Brain size={32} />,
      title: "AI-Powered Focus Tracking",
      description: "Advanced AI monitors your screen to ensure genuine study sessions"
    },
    {
      icon: <TreePine size={32} />,
      title: "Visual Progress",
      description: "Watch your digital tree grow as you maintain focus"
    },
    {
      icon: <Users size={32} />,
      title: "Group Trees",
      description: "Create study groups where everyone's focus affects the shared tree"
    },
    {
      icon: <Trophy size={32} />,
      title: "Friendly Competition",
      description: "Compete with friends and climb the leaderboard"
    }
  ];

  const benefits = [
    "No credit card required",
    "Works with any study material",
    "Privacy-focused design",
    "Real-time progress tracking"
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 50%, #f0fff0 100%)'
    }}>
      {/* Hero Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
          >
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              marginBottom: '24px',
              background: 'linear-gradient(45deg, #2d5016, #87ceeb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Focus Better, Together
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#4a7c59',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px auto'
            }}>
              Transform your study sessions into a growing digital forest.
              Stay focused with AI monitoring and grow trees with friends.
            </p>
          
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: '32px',
              alignItems: 'center'
            }}>
              <Link to="/login" className="btn btn-primary" style={{
                fontSize: '1.125rem',
                padding: '16px 32px'
              }}>
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <a href="#features" className="btn btn-outline" style={{
                fontSize: '1.125rem',
                padding: '16px 32px'
              }}>
                Learn More
              </a>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px',
              fontSize: '0.875rem',
              color: '#4a7c59'
            }}>
              {benefits.map((benefit, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} style={{ color: '#32cd32' }} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image/Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ marginTop: '64px', maxWidth: '1000px', margin: '64px auto 0' }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '32px'
            }}>
              <div style={{
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, rgba(45, 80, 22, 0.1) 0%, rgba(135, 206, 235, 0.1) 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TreePine size={120} style={{ color: '#2d5016', opacity: 0.5 }} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={{
        paddingTop: '80px',
        paddingBottom: '80px',
        background: 'rgba(255, 255, 255, 0.95)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#2d5016' }}>
              Everything You Need to Stay Focused
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#4a7c59',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Powerful features designed to help you and your friends achieve your study goals
            </p>
          </motion.div>

          <div className="grid grid-cols-4" style={{ gap: '32px' }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(45, 80, 22, 0.1)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: '#2d5016'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#2d5016' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#4a7c59' }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Get started in minutes and see immediate results
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: "Create Account", desc: "Sign up free in seconds" },
                { step: 2, title: "Start Studying", desc: "Enable AI monitoring for authentic tracking" },
                { step: 3, title: "Grow Together", desc: "Watch your tree flourish with consistent focus" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-secondary">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Study Habits?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students already growing their focus trees
            </p>
            <Link to="/login" className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4">
              Start Growing Your Tree
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;