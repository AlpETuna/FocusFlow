import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const TimerContext = createContext();

export function useTimer() {
  return useContext(TimerContext);
}

export function TimerProvider({ children }) {
  const { refreshUser } = useAuth();
  const [sessionTime, setSessionTime] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(sessionTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState('focus');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('pomodoro');
  const intervalRef = useRef(null);

  const presets = {
    pomodoro: { focus: 25, break: 5 },
    short: { focus: 15, break: 3 },
    long: { focus: 45, break: 10 },
  };

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('focusflow_timer_state');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.isActive && state.startTime) {
        // Calculate how much time has passed
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const remaining = Math.max(0, state.timeLeft - elapsed);
        
        setTimeLeft(remaining);
        setIsActive(state.isActive);
        setIsPaused(state.isPaused);
        setSessionType(state.sessionType);
        setCurrentSessionId(state.currentSessionId);
        setSelectedPreset(state.selectedPreset);
        setSessionTime(state.sessionTime);
      }
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (isActive) {
      const state = {
        timeLeft,
        isActive,
        isPaused,
        sessionType,
        currentSessionId,
        selectedPreset,
        sessionTime,
        startTime: Date.now() - ((sessionTime - timeLeft) * 1000)
      };
      localStorage.setItem('focusflow_timer_state', JSON.stringify(state));
    } else {
      localStorage.removeItem('focusflow_timer_state');
    }
  }, [timeLeft, isActive, isPaused, sessionType, currentSessionId, selectedPreset, sessionTime]);

  // Timer countdown
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

  const startTimer = async (groupId = null, goal = null) => {
    try {
      if (sessionType === 'focus') {
        const response = await api.startFocusSession(
          groupId,
          goal || `${selectedPreset} session`
        );
        
        if (response.session && response.session.sessionId) {
          setCurrentSessionId(response.session.sessionId);
          setIsActive(true);
          setIsPaused(false);
          return { success: true, sessionId: response.session.sessionId };
        } else {
          throw new Error(response.error || 'Failed to start session');
        }
      } else {
        setIsActive(true);
        setIsPaused(false);
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to start timer:', error);
      return { success: false, error: error.message };
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = async () => {
    try {
      if (currentSessionId && sessionType === 'focus') {
        await api.endFocusSession(currentSessionId);
        await refreshUser();
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
    
    setIsActive(false);
    setIsPaused(false);
    setCurrentSessionId(null);
    resetTimer();
  };

  const resetTimer = () => {
    const time = sessionType === 'focus' 
      ? presets[selectedPreset].focus * 60 
      : presets[selectedPreset].break * 60;
    setTimeLeft(time);
    setSessionTime(time);
  };

  const completeSession = async () => {
    setIsActive(false);
    setIsPaused(false);
    
    if (sessionType === 'focus' && currentSessionId) {
      try {
        await api.endFocusSession(currentSessionId);
        setCurrentSessionId(null);
        await refreshUser();
        
        // Switch to break
        setSessionType('break');
        const breakTime = presets[selectedPreset].break * 60;
        setTimeLeft(breakTime);
        setSessionTime(breakTime);
      } catch (error) {
        console.error('Failed to end focus session:', error);
      }
    } else {
      // Break completed, switch back to focus
      setSessionType('focus');
      const focusTime = presets[selectedPreset].focus * 60;
      setTimeLeft(focusTime);
      setSessionTime(focusTime);
    }
  };

  const value = {
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
    completeSession,
    setSessionTime,
    setTimeLeft
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}