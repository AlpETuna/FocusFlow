// Screen capture utility for FocusFlow
// Integrates with browser APIs for screen recording and analysis

class ScreenCaptureManager {
  constructor() {
    this.mediaStream = null;
    this.isCapturing = false;
    this.captureInterval = null;
    this.canvas = null;
    this.context = null;
    this.video = null;
  }

  // Initialize screen capture
  async initialize() {
    try {
      // Check if screen capture is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen capture not supported in this browser');
      }

      // Create canvas for image processing
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      
      // Create video element for stream processing
      this.video = document.createElement('video');
      this.video.autoplay = true;
      this.video.muted = true;

      return true;
    } catch (error) {
      console.error('Failed to initialize screen capture:', error);
      throw error;
    }
  }

  // Request screen capture permission and start stream
  async startCapture() {
    try {
      if (this.isCapturing) {
        console.warn('Screen capture already active');
        return;
      }

      // Request screen capture permission
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 1, max: 5 } // Low frame rate to reduce processing
        },
        audio: false // We don't need audio for focus analysis
      });

      // Set up video stream
      this.video.srcObject = this.mediaStream;
      await new Promise((resolve) => {
        this.video.onloadedmetadata = resolve;
      });

      this.isCapturing = true;

      // Handle stream end (user stops sharing)
      this.mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopCapture();
      });

      console.log('Screen capture started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start screen capture:', error);
      throw error;
    }
  }

  // Stop screen capture
  stopCapture() {
    try {
      if (this.captureInterval) {
        clearInterval(this.captureInterval);
        this.captureInterval = null;
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      if (this.video) {
        this.video.srcObject = null;
      }

      this.isCapturing = false;
      console.log('Screen capture stopped');
    } catch (error) {
      console.error('Error stopping screen capture:', error);
    }
  }

  // Capture a single screenshot
  async captureScreenshot() {
    try {
      if (!this.isCapturing || !this.video || !this.canvas || !this.context) {
        throw new Error('Screen capture not initialized or not active');
      }

      // Set canvas size to match video
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;

      // Draw current video frame to canvas
      this.context.drawImage(this.video, 0, 0);

      // Convert to base64 image
      const imageDataUrl = this.canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = imageDataUrl.split(',')[1];

      return {
        base64: base64Data,
        width: this.canvas.width,
        height: this.canvas.height,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      throw error;
    }
  }

  // Start automatic periodic screenshots
  startPeriodicCapture(intervalMinutes = 2, onCapture = null) {
    try {
      if (this.captureInterval) {
        clearInterval(this.captureInterval);
      }

      const intervalMs = intervalMinutes * 60 * 1000;

      this.captureInterval = setInterval(async () => {
        try {
          const screenshot = await this.captureScreenshot();
          if (onCapture) {
            await onCapture(screenshot);
          }
        } catch (error) {
          console.error('Error in periodic capture:', error);
        }
      }, intervalMs);

      console.log(`Started periodic capture every ${intervalMinutes} minutes`);
    } catch (error) {
      console.error('Failed to start periodic capture:', error);
      throw error;
    }
  }

  // Stop automatic periodic screenshots
  stopPeriodicCapture() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
      console.log('Stopped periodic capture');
    }
  }

  // Check if screen capture is currently active
  isActive() {
    return this.isCapturing;
  }

  // Get current capture status
  getStatus() {
    return {
      isCapturing: this.isCapturing,
      hasStream: !!this.mediaStream,
      isPeriodicActive: !!this.captureInterval,
      videoReady: this.video && this.video.readyState >= 2
    };
  }
}

// API service for sending screenshots to backend
class FocusAnalysisAPI {
  constructor(baseURL, authToken) {
    this.baseURL = baseURL;
    this.authToken = authToken;
  }

  // Send screenshot for analysis
  async analyzeScreen(screenshot, sessionId = null) {
    try {
      const response = await fetch(`${this.baseURL}/analysis/screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          imageBase64: screenshot.base64,
          sessionId: sessionId,
          timestamp: screenshot.timestamp
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error('Failed to analyze screen:', error);
      throw error;
    }
  }

  // Get focus scores history
  async getFocusScores(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.sessionId) params.append('sessionId', options.sessionId);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const response = await fetch(`${this.baseURL}/analysis/scores?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get focus scores: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get focus scores:', error);
      throw error;
    }
  }
}

// Main integration class
export class FocusFlowScreenAnalysis {
  constructor(apiBaseURL, authToken) {
    this.screenCapture = new ScreenCaptureManager();
    this.analysisAPI = new FocusAnalysisAPI(apiBaseURL, authToken);
    this.currentSessionId = null;
    this.onAnalysisResult = null;
  }

  // Initialize the system
  async initialize() {
    await this.screenCapture.initialize();
  }

  // Start focus session with screen monitoring
  async startFocusSession(sessionId, intervalMinutes = 2) {
    try {
      this.currentSessionId = sessionId;
      
      // Start screen capture
      await this.screenCapture.startCapture();
      
      // Start periodic analysis
      this.screenCapture.startPeriodicCapture(intervalMinutes, async (screenshot) => {
        try {
          const analysis = await this.analysisAPI.analyzeScreen(screenshot, this.currentSessionId);
          
          if (this.onAnalysisResult) {
            this.onAnalysisResult(analysis);
          }
          
          console.log(`Focus analysis: Score ${analysis.focusScore}, Category: ${analysis.category}`);
        } catch (error) {
          console.error('Analysis failed:', error);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to start focus session:', error);
      throw error;
    }
  }

  // Stop focus session
  stopFocusSession() {
    this.screenCapture.stopPeriodicCapture();
    this.screenCapture.stopCapture();
    this.currentSessionId = null;
  }

  // Manual screenshot analysis
  async analyzeNow() {
    try {
      const screenshot = await this.screenCapture.captureScreenshot();
      return await this.analysisAPI.analyzeScreen(screenshot, this.currentSessionId);
    } catch (error) {
      console.error('Manual analysis failed:', error);
      throw error;
    }
  }

  // Set callback for analysis results
  setAnalysisCallback(callback) {
    this.onAnalysisResult = callback;
  }

  // Get system status
  getStatus() {
    return {
      ...this.screenCapture.getStatus(),
      currentSessionId: this.currentSessionId
    };
  }
}

export default FocusFlowScreenAnalysis;