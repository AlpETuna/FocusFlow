import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Smartphone, Brain, Users, Trophy, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function LaunchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCard, setActiveCard] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const cards = [
    {
      id: "ai-detection",
      title: "Smart AI Detection",
      description: "Our AI snaps random screenshots to verify your focus and rewards you for every productive moment.",
      icon: <Brain size={32} />
    },
    {
      id: "tree-watering",
      title: "Virtual Tree Growth",
      description: "Watch your tree flourish with each burst of productivity.",
      icon: <TreePine size={32} />
    },
    {
      id: "social-competition",
      title: "Friends & Leaderboard",
      description: "Invite mates, compare your focus time and climb the weekly leaderboard.",
      icon: <Trophy size={32} />
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <div style={{
      minHeight: '100vh',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Animated Sky Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, #87CEEB 0%, #FFFFFF 60%, #F0FFF0 100%)',
        zIndex: -2
      }}>
        {/* Animated clouds */}
        <motion.div
          animate={{
            x: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '-20%',
            width: '140%',
            height: '100%',
            opacity: 0.4,
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
        />
      </div>

      {/* Grass Foreground */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '150px',
        background: 'linear-gradient(180deg, transparent 0%, #4CAF50 50%, #388E3C 100%)',
        zIndex: -1
      }} />

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            textAlign: 'center',
            maxWidth: '800px',
            marginBottom: '3rem'
          }}
        >
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#2d5016',
            fontFamily: 'Inter, sans-serif'
          }}>
            Stay Focused. Watch Your Tree Thrive.
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#4a7c59',
            marginBottom: '2rem',
            fontFamily: 'Roboto, sans-serif'
          }}>
            Root Flow waters your virtual tree every time you're on task. 
            Join friends, earn points and rise up the productivity ranks.
          </p>

          <Link to="/login" className="btn btn-primary" style={{
            fontSize: '1.25rem',
            padding: '1rem 3rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 25px rgba(45, 80, 22, 0.3)',
            transition: 'all 0.3s ease'
          }}>
            <LogIn size={24} />
            Join Now
          </Link>
        </motion.div>

        {/* Phone Mockup with Floating Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -20, 0]
          }}
          transition={{
            opacity: { duration: 0.8, delay: 0.3 },
            scale: { duration: 0.8, delay: 0.3 },
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            position: 'relative',
            marginBottom: '3rem'
          }}
        >
          <div style={{
            width: '300px',
            height: '600px',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            borderRadius: '30px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'white',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <TreePine size={120} style={{ color: '#2d5016' }} />
              </motion.div>
              <p style={{
                marginTop: '1rem',
                color: '#4a7c59',
                fontWeight: '600'
              }}>
                Your Focus Tree
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Carousel */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          height: '200px',
          position: 'relative',
          marginBottom: '2rem'
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCard}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="card"
              style={{
                position: 'absolute',
                width: '100%',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem'
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(45, 80, 22, 0.1)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2d5016',
                flexShrink: 0
              }}>
                {cards[activeCard].icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#2d5016'
                }}>
                  {cards[activeCard].title}
                </h3>
                <p style={{
                  color: '#4a7c59',
                  fontSize: '1.1rem'
                }}>
                  {cards[activeCard].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Indicators */}
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px'
          }}>
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCard(index)}
                style={{
                  width: index === activeCard ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: index === activeCard ? '#2d5016' : '#ccc',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            textAlign: 'center',
            marginTop: '4rem'
          }}
        >
          <p style={{
            fontSize: '1.25rem',
            color: '#4a7c59',
            marginBottom: '1.5rem',
            fontWeight: '500'
          }}>
            Ready to nurture your focus and grow your productivity?
          </p>
          <Link to="/login" className="btn btn-primary" style={{
            fontSize: '1.125rem',
            padding: '0.75rem 2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Join Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default LaunchPage;