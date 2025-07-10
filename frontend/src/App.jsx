import { io } from 'socket.io-client';
import React, { useState, useRef, useEffect } from 'react';
import VideoUpload from './components/VideoUpload';
import WebcamFeed from './components/WebcamFeed';
import PostureFeedback from './components/PostureFeedback';

function App() {
  const [feedback, setFeedback] = useState([]);
  const socketRef = useRef(null);
  const [mode, setMode] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadedVideoURL, setUploadedVideoURL] = useState(null);
  const fileInputRef = useRef(null);

  const handleFeedback = (newFeedback) => {
    console.log('Handling feedback:', newFeedback);
    setFeedback(newFeedback); 
    setStatusMessage('Feedback received');
  };

  const handleUploadClick = () => {
    setMode('upload');
    setFeedback([]);
    setUploadedVideoURL(null);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.click();
  };

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_WEBSOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketRef.current.on('postureFeedback', (incomingFeedback) => {
      console.log('Received feedback:', incomingFeedback);
      setFeedback(incomingFeedback);
      setStatusMessage('Feedback received'); 
    });


    socketRef.current.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-blue-700 mb-6 drop-shadow-md">
        Bad Posture Detection App
      </h1>

      <div className="mb-6 flex space-x-4">
        <button
          className={`px-6 py-3 rounded-lg font-semibold shadow-md ${mode === 'upload' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
            } hover:bg-blue-800 hover:scale-105 transition-transform duration-200`}
          onClick={handleUploadClick}
        >
          Upload Video
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-semibold shadow-md ${mode === 'webcam' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
            } hover:bg-blue-800 hover:scale-105 transition-transform duration-200`}
          onClick={() => {
            setMode('webcam');
            setFeedback([]);
            setStatusMessage('');
          }}
        >
          Use Webcam
        </button>
      </div>

      {statusMessage && (
        <div className="mb-4 text-lg font-medium text-blue-600">
          {statusMessage}
        </div>
      )}

      {mode === 'upload' && (
        <>
          <VideoUpload
            onFeedback={handleFeedback}
            setIsUploading={setIsUploading}
            fileInputRef={fileInputRef}
            setUploadedVideoURL={setUploadedVideoURL}
            setStatusMessage={setStatusMessage}
          />

          {isUploading ? (
            <div className="flex items-center justify-center h-48 w-full">
              {/* <p className="text-blue-600 text-xl font-semibold">Analyzing video...</p> */}
            </div>
          ) : (
            uploadedVideoURL && (
              <div className="flex flex-row w-full max-w-4xl space-x-4">
                <div className="w-1/2">
                  <video
                    src={uploadedVideoURL}
                    controls
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div className="w-1/2">
                  {feedback.length > 0 ? (
                    <PostureFeedback feedback={feedback} />
                  ) : (
                    <div className="text-gray-500">Waiting for feedback...</div>
                  )}
                </div>
              </div>
            )
          )}
        </>
      )}

      {mode === 'webcam' && (
        <div className="flex flex-row w-full max-w-4xl space-x-4">
          <div className="w-1/2">
            <WebcamFeed onFeedback={handleFeedback} />
          </div>
          <div className="w-1/2">
            <PostureFeedback feedback={feedback} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
