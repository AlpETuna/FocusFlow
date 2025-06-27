import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, Square, RotateCcw, Settings } from 'lucide-react';
import TreeVisualization from './TreeVisualization';
import ScreenAnalysis from './ScreenAnalysis';
import api from '../services/api';

function FocusSession() {
  const { user, refreshUser } = useAuth();
  const [sessionTime, setSessionTime] = useState(25 * 60); // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(sessionTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // 'focus' or 'break'
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  
  // Backend session management
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionError, setSessionError] = useState(null);
  
  // AI Monitoring States
  const [aiMonitoring, setAiMonitoring] = useState(true);
  const [focusScores, setFocusScores] = useState([]);
  const [currentFocusScore, setCurrentFocusScore] = useState(null);

  // Timer presets
  const presets = {
    pomodoro: { focus: 25, break: 5 },
    short: { focus: 15, break: 3 },
    long: { focus: 45, break: 10 },
  };

  const [selectedPreset, setSelectedPreset] = useState('pomodoro');

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }
  }, [timeLeft, isActive]);

  // Handle analysis results from ScreenAnalysis component
  const handleAnalysisResult = (analysis) => {
    setCurrentFocusScore(analysis);
    setFocusScores(prev => [...prev.slice(-9), analysis]);
    
    // Handle low focus scores
    if (analysis.focusScore < 40 && isActive && !isPaused) {
      // Show warning for low focus
      console.warn('Low focus detected:', analysis);
    }
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    setIsPaused(false);
    
    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    if (sessionType === 'focus' && currentSessionId) {
      try {
        // End the session in the backend
        await api.endFocusSession(currentSessionId);
        setCurrentSessionId(null);
        
        // Refresh user data from backend
        await refreshUser();
        
        setCompletedSessions(prev => prev + 1);
        
        // Switch to break
        setSessionType('break');
        const breakTime = getBreakTime() * 60;
        setTimeLeft(breakTime);
        setSessionTime(breakTime);
      } catch (error) {
        console.error('Failed to end focus session:', error);
        setSessionError('Failed to save session data');
      }
    } else {
      // Break completed, switch back to focus
      setSessionType('focus');
      const focusTime = getFocusTime() * 60;
      setTimeLeft(focusTime);
      setSessionTime(focusTime);
    }
  };

  const getFocusTime = () => {
    return presets[selectedPreset].focus;
  };

  const getBreakTime = () => {
    return presets[selectedPreset].break;
  };

  const startTimer = async () => {
    try {
      setSessionError(null);
      
      if (sessionType === 'focus') {
        // Start a new focus session in the backend
        const response = await api.startFocusSession(
          null, // groupId
          `${selectedPreset} session` // goal
        );
        
        if (response.success) {
          setCurrentSessionId(response.session.sessionId);
        } else {
          throw new Error('Failed to start session');
        }
      }
      
      setIsActive(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to start session:', error);
      setSessionError('Failed to start session. Please try again.');
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = async () => {
    try {
      if (currentSessionId && sessionType === 'focus') {
        // End the session in the backend
        await api.endFocusSession(currentSessionId);
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
    
    setIsActive(false);
    setIsPaused(false);
    resetTimer();
  };

  const resetTimer = () => {
    const time = sessionType === 'focus' ? getFocusTime() * 60 : getBreakTime() * 60;
    setTimeLeft(time);
    setSessionTime(time);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((sessionTime - timeLeft) / sessionTime) * 100;
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    if (!isActive) {
      const time = sessionType === 'focus' 
        ? presets[preset].focus * 60
        : presets[preset].break * 60;
      setTimeLeft(time);
      setSessionTime(time);
    }
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '8px' }}>
            {sessionType === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {sessionType === 'focus'
              ? 'Stay focused and grow your tree'
              : 'Take a well-deserved break'
            }
          </p>
          {sessionError && (
            <div style={{
              marginTop: '16px',
              backgroundColor: 'rgba(220, 20, 60, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              padding: '12px',
              display: 'inline-block'
            }}>
              <p style={{ color: 'var(--danger)', fontSize: '14px' }}>{sessionError}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Timer Section */}
          <div>
            <div className="card">
              {/* Settings Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Timer</h2>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="btn btn-outline"
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                  disabled={isActive}
                >
                  <Settings size={16} />
                  Settings
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>Session Settings</h3>
                  
                  {/* AI Monitoring Toggle */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500' }}>AI Study Monitoring</span>
                      <button
                        onClick={() => setAiMonitoring(!aiMonitoring)}
                        style={{
                          position: 'relative',
                          width: '48px',
                          height: '24px',
                          borderRadius: '9999px',
                          border: 'none',
                          backgroundColor: aiMonitoring ? 'var(--primary)' : '#d1d5db',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          left: aiMonitoring ? '26px' : '2px',
                          width: '20px',
                          height: '20px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }} />
                      </button>
                    </label>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {aiMonitoring
                        ? 'AI will verify your study activity'
                        : 'Manual mode - no AI verification'
                      }
                    </p>
                  </div>

                  <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Timer Presets</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {Object.keys(presets).map(preset => (
                      <button
                        key={preset}
                        onClick={() => handlePresetChange(preset)}
                        className={`btn ${selectedPreset === preset ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '14px', padding: '8px 12px' }}
                        disabled={isActive}
                      >
                        <div>
                          <div style={{ textTransform: 'capitalize' }}>{preset}</div>
                          <div style={{ fontSize: '12px', opacity: 0.8 }}>
                            {presets[preset].focus}m / {presets[preset].break}m
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timer Display */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div className="timer-display">
                  {formatTime(timeLeft)}
                </div>
                <div className="timer-progress">
                  <div
                    className="timer-progress-bar"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Timer Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {!isActive ? (
                  <button onClick={startTimer} className="btn btn-primary">
                    <Play size={20} />
                    Start
                  </button>
                ) : (
                  <button onClick={pauseTimer} className="btn btn-secondary">
                    <Pause size={20} />
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                )}
                
                <button onClick={stopTimer} className="btn btn-outline">
                  <Square size={20} />
                  Stop
                </button>
                
                <button onClick={resetTimer} className="btn btn-outline" disabled={isActive && !isPaused}>
                  <RotateCcw size={20} />
                  Reset
                </button>
              </div>

              {/* Session Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '32px' }}>
                <div className="stat-card">
                  <div className="stat-value">{completedSessions}</div>
                  <div className="stat-label">Sessions Today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.floor(((user?.totalFocusTime || 0) + completedSessions * getFocusTime()) / 60)}h
                  </div>
                  <div className="stat-label">Total Focus Time</div>
                </div>
              </div>
            </div>

            {/* Screen Analysis Component */}
            {sessionType === 'focus' && aiMonitoring && (
              <div style={{ marginTop: '24px' }}>
                <ScreenAnalysis
                  sessionId={currentSessionId}
                  onAnalysisResult={handleAnalysisResult}
                  isActive={isActive && !isPaused}
                />
              </div>
            )}
          </div>

          {/* Tree Growth Section */}
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Your Growing Tree</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Level {user?.treeLevel || 1}
              </p>
            </div>
            
            <div className="tree-container" style={{ marginBottom: '24px' }}>
              <TreeVisualization
                level={user?.treeLevel || 1}
                animated={isActive && sessionType === 'focus'}
              />
            </div>

            {/* Motivation */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {isActive && sessionType === 'focus'
                  ? "🌱 Your tree is growing stronger!"
                  : sessionType === 'break'
                  ? "🌿 Rest well, your tree is absorbing nutrients!"
                  : "🌳 Ready to nurture your focus tree?"
                }
              </p>

              {/* Next Level Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Level {user?.treeLevel || 1}</span>
                  <span>Level {(user?.treeLevel || 1) + 1}</span>
                </div>
                <div className="timer-progress">
                  <div
                    className="timer-progress-bar"
                    style={{
                      width: `${Math.min(((user?.totalFocusTime || 0) % 60) / 60 * 100, 100)}%`
                    }}
                  />
                </div>
                <p style={{ fontSize: '12px', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  {60 - ((user?.totalFocusTime || 0) % 60)} minutes to next level
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio element for completion sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>
    </div>
  );
}

export default FocusSession;