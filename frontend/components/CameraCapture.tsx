import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, AlertTriangle, Loader2, RotateCw } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClear: () => void;
    isActive: boolean;
    label?: string;
    required?: boolean;
}

type CameraState = 'idle' | 'streaming' | 'captured';

export const CameraCapture: React.FC<CameraCaptureProps> = ({
    onCapture,
    onClear,
    isActive,
    label = "Capture from Camera",
    required = false
}) => {
    const [state, setState] = useState<CameraState>('idle');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsVideoReady(false);
        setIsInitializing(false);
    }, [stream]);

    // External state management for reset
    useEffect(() => {
        if (!isActive) {
            stopCamera();
            if (state !== 'idle') setState('idle');
            if (capturedImage) setCapturedImage(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Polling for video dimensions as a fallback for events
    useEffect(() => {
        let interval: any = null;
        let timeout: any = null;

        if (state === 'streaming' && stream && !isVideoReady) {
            interval = setInterval(() => {
                const video = videoRef.current;
                if (video && video.videoWidth > 0 && video.readyState >= 2) {
                    setIsVideoReady(true);
                    clearInterval(interval);
                    if (timeout) clearTimeout(timeout);
                }
            }, 300);

            timeout = setTimeout(() => {
                if (state === 'streaming' && !isVideoReady) {
                    setIsVideoReady(true);
                    clearInterval(interval);
                }
            }, 6000);
        }

        return () => {
            if (interval) clearInterval(interval);
            if (timeout) clearTimeout(timeout);
        };
    }, [state, stream, isVideoReady]);

    // Ensure video plays when stream is set
    useEffect(() => {
        if (state === 'streaming' && stream && videoRef.current) {
            const video = videoRef.current;
            video.srcObject = stream;

            const playVideo = async () => {
                try {
                    await video.play();
                    console.log("Video playing successfully");
                } catch (e) {
                    console.warn("Autoplay failed, user interaction may be needed", e);
                }
            };

            playVideo();
        }
    }, [state, stream]);

    const startCamera = async () => {
        setError(null);
        setIsVideoReady(false);
        setIsInitializing(true);

        try {
            // Capacitor Permission Check for Android
            if (typeof window !== 'undefined' && (window as any).Capacitor) {
                const { Camera } = await import('@capacitor/camera');
                const permission = await Camera.checkPermissions();
                if (permission.camera !== 'granted') {
                    const request = await Camera.requestPermissions();
                    if (request.camera !== 'granted') {
                        throw { name: 'NotAllowedError' };
                    }
                }
            }

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            setState('streaming');
        } catch (err: any) {
            console.error("Camera access error:", err);
            let msg = "Camera access denied.";
            if (err.name === 'NotAllowedError') msg = "Permission denied. Please enable camera access in browser settings.";
            if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') msg = "No camera found on this device.";

            setError(msg);
            setState('idle');
        } finally {
            setIsInitializing(false);
        }
    };

    const handleFeedReady = () => {
        if (videoRef.current && videoRef.current.videoWidth > 0) {
            setIsVideoReady(true);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const width = video.videoWidth || video.clientWidth;
        const height = video.videoHeight || video.clientHeight;

        if (!width || !height) {
            setError("Camera feed not ready for capture.");
            return;
        }

        try {
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(video, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

                if (dataUrl && dataUrl.length > 500) {
                    setCapturedImage(dataUrl);
                    stopCamera();
                    setState('captured');
                    setError(null);
                } else {
                    throw new Error("Captured image is empty.");
                }
            }
        } catch (e) {
            console.error("Capture failure:", e);
            setError("Failed to capture photo. Please try again.");
        }
    };

    const handleConfirm = () => {
        if (!capturedImage) return;

        try {
            const b64Data = capturedImage.split(',')[1];
            const byteCharacters = atob(b64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                byteArrays.push(new Uint8Array(byteNumbers));
            }

            const blob = new Blob(byteArrays, { type: 'image/jpeg' });
            onCapture(new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' }));
        } catch (e) {
            setError("Error processing photo.");
        }
    };

    return (
        <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className={`relative border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center min-h-[300px] transition-all`}>

                {error && (
                    <div className="absolute top-4 inset-x-4 z-50 p-3 bg-red-600 text-white text-sm rounded-xl flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in">
                        <AlertTriangle size={18} />
                        <span className="flex-1 font-medium">{error}</span>
                        <X size={18} className="cursor-pointer" onClick={() => setError(null)} />
                    </div>
                )}

                {state === 'idle' && (
                    <div
                        onClick={startCamera}
                        className="w-full h-full p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group bg-white min-h-[300px]"
                    >
                        {isInitializing ? (
                            <div className="flex flex-col items-center">
                                <RotateCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                <p className="text-slate-600 font-bold">Connecting...</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-50 p-6 rounded-full mb-4 shadow-sm group-hover:shadow-md transition-all group-hover:scale-110">
                                    <Camera className="w-12 h-12 text-blue-600" />
                                </div>
                                <p className="text-xl font-black text-slate-900">Start Camera</p>
                                <p className="text-sm text-slate-500 mt-2 text-center max-w-[240px]">Use your device camera for AI detection</p>
                            </>
                        )}
                    </div>
                )}

                {state === 'streaming' && (
                    <div className="w-full h-full flex flex-col items-center min-h-[300px] bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            onLoadedMetadata={handleFeedReady}
                            onCanPlay={handleFeedReady}
                            onPlaying={handleFeedReady}
                            className={`w-full h-auto max-h-[600px] object-contain transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
                        />

                        {!isVideoReady && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                                <div className="text-center">
                                    <p className="font-bold">Loading live feed...</p>
                                    <p className="text-xs text-slate-400 mt-1">If this persists, check browser permissions.</p>
                                </div>
                            </div>
                        )}

                        {isVideoReady && (
                            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-6 px-4 z-10">
                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-10 py-3.5 rounded-full shadow-2xl flex items-center justify-center gap-3 transition-all font-black text-xl hover:scale-105"
                                >
                                    <Camera size={24} /> Capture
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { stopCamera(); setState('idle'); }}
                                    className="bg-white/10 hover:bg-white/30 text-white p-3.5 rounded-full backdrop-blur-md border border-white/20 transition-all active:scale-95"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {state === 'captured' && capturedImage && (
                    <div className="w-full h-full flex flex-col items-center bg-white min-h-[300px]">
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full h-auto max-h-[600px] object-contain"
                        />
                        <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4 px-4">
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-10 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all font-black text-xl hover:scale-105"
                            >
                                <Check size={28} /> Confirm
                            </button>
                            <button
                                type="button"
                                onClick={() => { setCapturedImage(null); startCamera(); }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 px-8 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 transition-all font-bold"
                            >
                                <RefreshCw size={20} /> Retake
                            </button>
                        </div>
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};