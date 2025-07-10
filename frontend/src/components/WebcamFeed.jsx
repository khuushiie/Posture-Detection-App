import React, { useRef, useEffect, useState } from 'react';
import { calculateAngle } from '../utils/angle';

/* global Pose, drawConnectors, drawLandmarks, Camera */

function WebcamFeed({ onFeedback }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const onResults = (results) => {
      if (!isMounted || !canvasRef.current) return;

      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.poseLandmarks) {
        drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
        drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

        const feedback = [];
        const leftKnee = results.poseLandmarks[25];
        const leftAnkle = results.poseLandmarks[27];
        const leftHip = results.poseLandmarks[23];
        const leftShoulder = results.poseLandmarks[11];
        const neck = results.poseLandmarks[12];
        const nose = results.poseLandmarks[0];

        if (leftKnee && leftAnkle && leftHip && leftShoulder) {
          if (leftKnee.x < leftAnkle.x) {
            feedback.push({ message: 'Knee over toe detected', type: 'error' });
          }
          const backAngle = calculateAngle(
            leftHip,
            { x: (leftHip.x + leftShoulder.x) / 2, y: (leftHip.y + leftShoulder.y) / 2 },
            leftShoulder
          );
          if (backAngle < 150) {
            feedback.push({ message: 'Back angle too low (<150°)', type: 'error' });
          }
        }

        if (neck && leftShoulder && nose) {
          const neckAngle = calculateAngle(leftShoulder, neck, nose);
          if (neckAngle > 30) {
            feedback.push({ message: 'Neck bend too high (>30°)', type: 'error' });
          }
        }

        if (feedback.length > 0) {
          onFeedback(feedback);
        }
      }
    };

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if (!poseRef.current) {
          poseRef.current = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4/${file}`,
          });

          poseRef.current.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          poseRef.current.onResults(onResults);
        }

        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;

            const camera = new Camera(videoRef.current, {
              onFrame: async () => {
                await poseRef.current.send({ image: videoRef.current });
              },
              width: 640,
              height: 480,
            });
            camera.start();
          };
        }
      } catch (err) {
        if (isMounted) {
          setError('Error starting webcam: ' + err.message);
        }
      }
    };

    startWebcam();

    return () => {
      isMounted = false;
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onFeedback]);

  return (
    <div className="relative">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <video ref={videoRef} autoPlay className="w-full max-w-lg rounded-lg shadow-md" />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full max-w-lg" />
    </div>
  );
}

export default WebcamFeed;
