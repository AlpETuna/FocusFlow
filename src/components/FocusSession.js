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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {sessionType === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
          </h1>
          <p className="text-secondary">
            {sessionType === 'focus' 
              ? 'Stay focused and grow your tree' 
              : 'Take a well-deserved break'
            }
          </p>
          {sessionError && (
            <div className="mt-4 bg-danger bg-opacity-10 border border-danger rounded-lg p-3 inline-block">
              <p className="text-danger text-sm">{sessionError}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="col-span-2">
            <div className="card">
              {/* Settings Toggle */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Timer</h2>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="btn btn-outline btn-sm"
                  disabled={isActive}
                >
                  <Settings size={16} />
                  Settings
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Session Settings</h3>
                  
                  {/* AI Monitoring Toggle */}
                  <div className="mb-4">
                    <label className="flex items-center justify-between">
                      <span className="font-medium">AI Study Monitoring</span>
                      <button
                        onClick={() => setAiMonitoring(!aiMonitoring)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          aiMonitoring ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          aiMonitoring ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>
                    <p className="text-sm text-secondary mt-1">
                      {aiMonitoring
                        ? 'AI will verify your study activity'
                        : 'Manual mode - no AI verification'
                      }
                    </p>
                  </div>

                  <h4 className="font-semibold mb-3">Timer Presets</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(presets).map(preset => (
                      <button
                        key={preset}
                        onClick={() => handlePresetChange(preset)}
                        className={`btn btn-sm ${
                          selectedPreset === preset ? 'btn-primary' : 'btn-outline'
                        }`}
                        disabled={isActive}
                      >
                        <div>
                          <div className="capitalize">{preset}</div>
                          <div className="text-xs opacity-80">
                            {presets[preset].focus}m / {presets[preset].break}m
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timer Display */}
              <div className="text-center mb-8">
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
              <div className="flex justify-center gap-3">
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
              <div className="mt-8 grid grid-cols-2 gap-4">
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
              <div className="mt-6">
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
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold mb-2">Your Growing Tree</h2>
              <p className="text-sm text-secondary">
                Level {user?.treeLevel || 1}
              </p>
            </div>
            
            <div className="tree-container mb-6">
              <TreeVisualization 
                level={user?.treeLevel || 1} 
                animated={isActive && sessionType === 'focus'}
              />
            </div>

            {/* Motivation */}
            <div className="text-center">
              <p className="text-sm text-secondary mb-4">
                {isActive && sessionType === 'focus' 
                  ? "🌱 Your tree is growing stronger!" 
                  : sessionType === 'break'
                  ? "🌿 Rest well, your tree is absorbing nutrients!"
                  : "🌳 Ready to nurture your focus tree?"
                }
              </p>

              {/* Next Level Progress */}
              <div>
                <div className="flex justify-between text-sm text-secondary mb-2">
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
                <p className="text-xs text-center text-secondary mt-2">
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