'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  Play, 
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Video,
  Dumbbell,
  Target,
  TrendingUp,
  Info
} from 'lucide-react';

interface JointAngle {
  name: string;
  angle: number;
  idealMin: number;
  idealMax: number;
  status: 'good' | 'warning' | 'error';
}

interface FormIssue {
  severity: 'low' | 'medium' | 'high';
  issue: string;
  suggestion: string;
  affectedJoint?: string;
}

interface AnalysisResult {
  exerciseType: string;
  overallScore: number;
  jointAngles: JointAngle[];
  issues: FormIssue[];
  feedback: string;
  tips: string[];
}

const SUPPORTED_EXERCISES = [
  { id: 'squat', name: 'Squat', icon: '🏋️', description: 'Full body lower exercise' },
  { id: 'pushup', name: 'Push-up', icon: '💪', description: 'Upper body pressing' },
  { id: 'plank', name: 'Plank', icon: '🧘', description: 'Core stability' },
];

export default function FormCheckPage() {
  const { data: session, status } = useSession();
  const [selectedExercise, setSelectedExercise] = useState<string>('squat');
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [poseLoaded, setPoseLoaded] = useState(false);
  const [keypoints, setKeypoints] = useState<any[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const poseRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);

  // Load MediaPipe Pose
  useEffect(() => {
    const loadMediaPipe = async () => {
      try {
        // Load MediaPipe scripts dynamically
        const script1 = document.createElement('script');
        script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1635988162/pose.js';
        script1.crossOrigin = 'anonymous';
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1632432234/camera_utils.js';
        script2.crossOrigin = 'anonymous';
        document.head.appendChild(script2);

        const script3 = document.createElement('script');
        script3.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js';
        script3.crossOrigin = 'anonymous';
        document.head.appendChild(script3);

        await new Promise(resolve => setTimeout(resolve, 2000));
        setPoseLoaded(true);
      } catch (err) {
        console.error('Failed to load MediaPipe:', err);
      }
    };

    loadMediaPipe();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setAnalysisResult(null);
    setError('');
    setKeypoints([]);
  };

  // Toggle video playback
  const togglePlayback = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Reset everything
  const resetAnalysis = () => {
    setVideoSrc(null);
    setAnalysisResult(null);
    setError('');
    setKeypoints([]);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Analyze single frame with simulated keypoints
  const analyzeFrame = async () => {
    if (!videoRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    setError('');

    try {
      // Pause video at current frame
      videoRef.current.pause();
      setIsPlaying(false);

      // Generate simulated keypoints based on video dimensions
      // In production, this would use actual MediaPipe pose detection
      const simulatedKeypoints = generateSimulatedKeypoints(
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      );

      setKeypoints(simulatedKeypoints);

      // Send to API for analysis
      const response = await fetch('/api/form-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseType: selectedExercise,
          keypoints: simulatedKeypoints,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze form');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate simulated keypoints for demo purposes
  // In production, MediaPipe would provide real keypoints
  const generateSimulatedKeypoints = (width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Create 33 landmarks matching MediaPipe Pose format
    const landmarks = [];
    
    // Simulated body pose positions (approximating a person in frame)
    const positions = [
      { x: centerX, y: centerY * 0.3 }, // nose
      { x: centerX - 10, y: centerY * 0.28 }, // left eye inner
      { x: centerX - 20, y: centerY * 0.28 }, // left eye
      { x: centerX - 30, y: centerY * 0.28 }, // left eye outer
      { x: centerX + 10, y: centerY * 0.28 }, // right eye inner
      { x: centerX + 20, y: centerY * 0.28 }, // right eye
      { x: centerX + 30, y: centerY * 0.28 }, // right eye outer
      { x: centerX - 50, y: centerY * 0.3 }, // left ear
      { x: centerX + 50, y: centerY * 0.3 }, // right ear
      { x: centerX - 15, y: centerY * 0.35 }, // mouth left
      { x: centerX + 15, y: centerY * 0.35 }, // mouth right
      { x: centerX - 80, y: centerY * 0.5 }, // left shoulder
      { x: centerX + 80, y: centerY * 0.5 }, // right shoulder
      { x: centerX - 120, y: centerY * 0.7 }, // left elbow
      { x: centerX + 120, y: centerY * 0.7 }, // right elbow
      { x: centerX - 140, y: centerY * 0.9 }, // left wrist
      { x: centerX + 140, y: centerY * 0.9 }, // right wrist
      { x: centerX - 145, y: centerY * 0.92 }, // left pinky
      { x: centerX + 145, y: centerY * 0.92 }, // right pinky
      { x: centerX - 148, y: centerY * 0.91 }, // left index
      { x: centerX + 148, y: centerY * 0.91 }, // right index
      { x: centerX - 142, y: centerY * 0.88 }, // left thumb
      { x: centerX + 142, y: centerY * 0.88 }, // right thumb
      { x: centerX - 60, y: centerY * 0.85 }, // left hip
      { x: centerX + 60, y: centerY * 0.85 }, // right hip
      { x: centerX - 65, y: centerY * 1.2 }, // left knee
      { x: centerX + 65, y: centerY * 1.2 }, // right knee
      { x: centerX - 70, y: centerY * 1.55 }, // left ankle
      { x: centerX + 70, y: centerY * 1.55 }, // right ankle
      { x: centerX - 75, y: centerY * 1.6 }, // left heel
      { x: centerX + 75, y: centerY * 1.6 }, // right heel
      { x: centerX - 65, y: centerY * 1.62 }, // left foot index
      { x: centerX + 65, y: centerY * 1.62 }, // right foot index
    ];

    return positions.map(pos => ({
      x: pos.x / width,
      y: pos.y / height,
      visibility: 0.9 + Math.random() * 0.1,
    }));
  };

  // Draw keypoints on canvas
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || keypoints.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [25, 27], [24, 26], [26, 28], // Legs
    ];

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;

    connections.forEach(([i, j]) => {
      if (keypoints[i] && keypoints[j]) {
        ctx.beginPath();
        ctx.moveTo(keypoints[i].x * canvas.width, keypoints[i].y * canvas.height);
        ctx.lineTo(keypoints[j].x * canvas.width, keypoints[j].y * canvas.height);
        ctx.stroke();
      }
    });

    // Draw keypoints
    keypoints.forEach((point, idx) => {
      if (idx > 10) { // Skip face landmarks for cleaner visualization
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [keypoints]);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-red-500/20 border-red-500';
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Background */}
      <img src="/bg.png" alt="Background" className="fixed inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none z-0" />

      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">AI Form Checker</h1>
                <p className="text-sm text-gray-400">Analyze your exercise technique</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {/* Exercise Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Select Exercise</h2>
          <div className="grid grid-cols-3 gap-3">
            {SUPPORTED_EXERCISES.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise.id)}
                className={`p-4 rounded-xl border transition flex flex-col items-center gap-2 ${
                  selectedExercise === exercise.id
                    ? 'bg-primary-600/20 border-primary-500 text-white'
                    : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-700/60'
                }`}
              >
                <span className="text-2xl">{exercise.icon}</span>
                <span className="font-medium">{exercise.name}</span>
                <span className="text-xs text-gray-400">{exercise.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Section */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-primary-500" />
                Video Analysis
              </h3>
            </div>

            <div className="p-4">
              {!videoSrc ? (
                /* Upload Area */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-gray-700/30 transition"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Upload Exercise Video</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Record yourself performing a {selectedExercise} and upload it for analysis
                  </p>
                  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition">
                    Choose File
                  </button>
                </div>
              ) : (
                /* Video Player */
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      className="w-full h-full object-contain"
                      onEnded={() => setIsPlaying(false)}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                  </div>

                  {/* Video Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayback}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                    >
                      {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white" />}
                    </button>
                    
                    <button
                      onClick={analyzeFrame}
                      disabled={isAnalyzing}
                      className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4" />
                          Analyze Current Frame
                        </>
                      )}
                    </button>

                    <button
                      onClick={resetAnalysis}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                    >
                      <RotateCcw className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {error && (
                <div className="mt-4 bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary-500" />
                Form Analysis Results
              </h3>
            </div>

            <div className="p-4">
              {!analysisResult ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Upload a video and click "Analyze Current Frame" to get form feedback
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className={`p-4 rounded-xl border ${getScoreBgColor(analysisResult.overallScore)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm text-gray-300 mb-1">Overall Form Score</h4>
                        <p className={`text-4xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                          {analysisResult.overallScore}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">{analysisResult.exerciseType.toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{analysisResult.jointAngles.length} joints analyzed</p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      AI Feedback
                    </h4>
                    <p className="text-white">{analysisResult.feedback}</p>
                  </div>

                  {/* Joint Angles */}
                  {analysisResult.jointAngles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Joint Analysis</h4>
                      <div className="space-y-2">
                        {analysisResult.jointAngles.map((joint, idx) => (
                          <div key={idx} className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(joint.status)}
                              <div>
                                <p className="text-white text-sm font-medium">{joint.name}</p>
                                <p className="text-xs text-gray-400">
                                  Ideal: {joint.idealMin}° - {joint.idealMax}°
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                joint.status === 'good' ? 'text-green-500' :
                                joint.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {joint.angle.toFixed(1)}°
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  {analysisResult.issues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Areas to Improve
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.issues.map((issue, idx) => (
                          <div key={idx} className={`rounded-lg p-3 ${
                            issue.severity === 'high' ? 'bg-red-900/30 border border-red-700' :
                            issue.severity === 'medium' ? 'bg-yellow-900/30 border border-yellow-700' :
                            'bg-gray-700/50'
                          }`}>
                            <p className="text-white text-sm font-medium">{issue.issue}</p>
                            <p className="text-gray-300 text-xs mt-1">{issue.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {analysisResult.tips.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Pro Tips
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary-500">1</span>
              </div>
              <h4 className="font-medium text-white mb-1">Select Exercise</h4>
              <p className="text-sm text-gray-400">Choose the exercise you want to analyze</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary-500">2</span>
              </div>
              <h4 className="font-medium text-white mb-1">Upload Video</h4>
              <p className="text-sm text-gray-400">Record yourself performing the exercise</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary-500">3</span>
              </div>
              <h4 className="font-medium text-white mb-1">AI Analysis</h4>
              <p className="text-sm text-gray-400">Our AI detects your body position and angles</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary-500">4</span>
              </div>
              <h4 className="font-medium text-white mb-1">Get Feedback</h4>
              <p className="text-sm text-gray-400">Receive personalized form corrections</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
