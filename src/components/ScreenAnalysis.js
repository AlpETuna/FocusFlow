import React, { useState, useEffect, useRef } from 'react';
import { FocusFlowScreenAnalysis } from '../utils/screenCapture';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Monitor, Shield, AlertCircle } from 'lucide-react';

const ScreenAnalysis = ({ sessionId, onAnalysisResult, isActive = false }) => {
  const { user } = useAuth();
  const [screenAnalysis, setScreenAnalysis] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const analysisRef = useRef(null);

  useEffect(() => {
    // Initialize screen analysis when component mounts
    const initializeAnalysis = async () => {
      try {
        const apiBaseURL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url.amazonaws.com/dev';
        const token = api.getToken();
        
        if (!token) {
          setError('Authentication required');
          return;
        }

        const analysis = new FocusFlowScreenAnalysis(apiBaseURL, token);
        await analysis.initialize();
        
        // Set up analysis result callback
        analysis.setAnalysisCallback((result) => {
          setLastAnalysis(result);
          if (onAnalysisResult) {
            onAnalysisResult(result);
          }
        });

        analysisRef.current = analysis;
        setScreenAnalysis(analysis);
      } catch (error) {
        console.error('Failed to initialize screen analysis:', error);
        setError(error.message);
      }
    };

    if (user) {
      initializeAnalysis();
    }

    // Cleanup on unmount
    return () => {
      if (analysisRef.current) {
        analysisRef.current.stopFocusSession();
      }
    };
  }, [user, onAnalysisResult]);

  useEffect(() => {
    // Start/stop analysis based on isActive prop
    if (screenAnalysis && sessionId) {
      if (isActive && !isCapturing) {
        startAnalysis();
      } else if (!isActive && isCapturing) {
        stopAnalysis();
      }
    }
  }, [isActive, sessionId, screenAnalysis]);

  const requestPermission = async () => {
    try {
      setError(null);
      if (screenAnalysis) {
        await screenAnalysis.startFocusSession(sessionId, 2); // Analyze every 2 minutes
        setIsCapturing(true);
        setPermissionGranted(true);
      }
    } catch (error) {
      console.error('Failed to request screen permission:', error);
      setError('Screen capture permission denied or not supported');
    }
  };

  const startAnalysis = async () => {
    try {
      setError(null);
      if (screenAnalysis && sessionId) {
        await screenAnalysis.startFocusSession(sessionId, 2);
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Failed to start analysis:', error);
      setError(error.message);
    }
  };

  const stopAnalysis = () => {
    try {
      if (screenAnalysis) {
        screenAnalysis.stopFocusSession();
        setIsCapturing(false);
      }
    } catch (error) {
      console.error('Failed to stop analysis:', error);
    }
  };

  const analyzeNow = async () => {
    try {
      setError(null);
      if (screenAnalysis) {
        const result = await screenAnalysis.analyzeNow();
        setLastAnalysis(result);
        if (onAnalysisResult) {
          onAnalysisResult(result);
        }
      }
    } catch (error) {
      console.error('Manual analysis failed:', error);
      setError(error.message);
    }
  };

  const getFocusScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#fb923c';
    return '#ef4444';
  };

  const getFocusScoreLabel = (score) => {
    if (score >= 80) return 'Highly Focused';
    if (score >= 60) return 'Moderately Focused';
    if (score >= 40) return 'Somewhat Distracted';
    return 'Distracted';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="analysis-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>AI Focus Monitoring</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCapturing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--success)' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--success)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
              Active
            </span>
          ) : (
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Inactive</span>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(220, 20, 60, 0.1)',
          border: '1px solid var(--danger)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ color: 'var(--danger)' }} />
            <p style={{ fontSize: '14px', color: 'var(--danger)' }}>{error}</p>
          </div>
        </div>
      )}

      {!permissionGranted && !isCapturing && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Monitor size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-secondary)', opacity: 0.5 }} />
          <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Enable AI Monitoring</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            AI will analyze your screen periodically to track focus levels
          </p>
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Shield size={16} style={{ color: '#2563eb', marginTop: '2px' }} />
              <p style={{ fontSize: '12px', color: '#1e40af' }}>
                Your privacy is protected. Screenshots are analyzed instantly and never stored.
              </p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="btn btn-primary"
            disabled={!sessionId}
          >
            Enable Monitoring
          </button>
        </div>
      )}

      {isCapturing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={analyzeNow} className="btn btn-secondary" style={{ fontSize: '14px', padding: '6px 12px' }}>
              Analyze Now
            </button>
            <button onClick={stopAnalysis} className="btn btn-outline" style={{ fontSize: '14px', padding: '6px 12px' }}>
              Stop Monitoring
            </button>
          </div>

          {lastAnalysis && (
            <div className="focus-score-display">
              <div
                className="focus-score-circle"
                style={{
                  backgroundColor: `${getFocusScoreColor(lastAnalysis.focusScore)}20`,
                  color: getFocusScoreColor(lastAnalysis.focusScore)
                }}
              >
                <span className="focus-score-value">{lastAnalysis.focusScore}</span>
                <span className="focus-score-label">Score</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', color: getFocusScoreColor(lastAnalysis.focusScore) }}>
                  {getFocusScoreLabel(lastAnalysis.focusScore)}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Activity: <span style={{ textTransform: 'capitalize' }}>{lastAnalysis.category}</span>
                </p>
                {lastAnalysis.reasoning && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{lastAnalysis.reasoning}</p>
                )}
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                  Last analyzed: {new Date(lastAnalysis.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreenAnalysis;