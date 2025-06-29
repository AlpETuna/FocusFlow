import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimer } from '../contexts/TimerContext';
import { Play, Pause, Square, RotateCcw, Settings } from 'lucide-react';
import TreeVisualization from './TreeVisualization';
import ScreenAnalysis from './ScreenAnalysis';

function FocusSession() {
  const { user } = useAuth();
  const {
    sessionTime,
    timeLeft,
    isActive,
    isPaused,
    sessionType,
    currentSessionId,
    selectedPreset,
    presets,
    setSelectedPreset,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    completeSession
  } = useTimer();
  
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const audioRef = useRef(null);
  
  // AI Monitoring States
  const [aiMonitoring, setAiMonitoring] = useState(true);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isActive]);

  // Handle analysis results from ScreenAnalysis component
  const handleAnalysisResult = async (analysis) => {
    // Handle focus score-based time adjustments
    if (analysis.focusScore >= 70) {
      // High focus: add 10 minutes
      console.log('High focus detected, adding 10 minutes bonus');
      // This will be handled by the backend when the session ends
    } else if (analysis.focusScore < 40) {
      // Low focus: subtract 20 minutes
      console.warn('Low focus detected, will deduct 20 minutes');
      // This will be handled by the backend when the session ends
    }
  };

  const handleSessionComplete = async () => {
    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    await completeSession();
    setCompletedSessions(prev => prev + 1);
  };

  const handleStartTimer = async () => {
    setSessionError(null);
    const result = await startTimer();
    if (!result.success) {
      setSessionError(result.error || 'Failed to start session. Please try again.');
    }
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    if (!isActive) {
      resetTimer();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((sessionTime - timeLeft) / sessionTime) * 100;
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
                  <button onClick={handleStartTimer} className="btn btn-primary">
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
                    {Math.floor((user?.totalFocusTime || 0) / 60)}h {((user?.totalFocusTime || 0) % 60)}m
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
                Level {user?.level || 1}
              </p>
            </div>
            
            <div className="tree-container" style={{ marginBottom: '24px' }}>
              <TreeVisualization
                level={user?.level || 1}
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
                  <span>Level {user?.level || 1}</span>
                  <span>Level {(user?.level || 1) + 1}</span>
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