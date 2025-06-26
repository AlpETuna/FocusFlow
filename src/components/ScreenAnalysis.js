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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Focus Monitoring</h3>
        <div className="flex items-center gap-2">
          {isCapturing ? (
            <span className="flex items-center gap-2 text-sm text-success">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Active
            </span>
          ) : (
            <span className="text-sm text-secondary">Inactive</span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-danger bg-opacity-10 border border-danger rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        </div>
      )}

      {!permissionGranted && !isCapturing && (
        <div className="text-center py-6">
          <Monitor size={48} className="mx-auto mb-4 text-secondary opacity-50" />
          <h4 className="font-semibold mb-2">Enable AI Monitoring</h4>
          <p className="text-sm text-secondary mb-4">
            AI will analyze your screen periodically to track focus levels
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Shield size={16} className="text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-800">
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
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={analyzeNow} className="btn btn-secondary btn-sm">
              Analyze Now
            </button>
            <button onClick={stopAnalysis} className="btn btn-outline btn-sm">
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
              <div className="flex-1">
                <p className="font-semibold" style={{ color: getFocusScoreColor(lastAnalysis.focusScore) }}>
                  {getFocusScoreLabel(lastAnalysis.focusScore)}
                </p>
                <p className="text-sm text-secondary">
                  Activity: <span className="capitalize">{lastAnalysis.category}</span>
                </p>
                {lastAnalysis.reasoning && (
                  <p className="text-xs text-secondary mt-1">{lastAnalysis.reasoning}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
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