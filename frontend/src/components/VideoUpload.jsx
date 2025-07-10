import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function VideoUpload({ onFeedback, fileInputRef, setIsUploading, setUploadedVideoURL, setStatusMessage }) {
  const socketRef = useRef(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError('No file selected');
      setStatusMessage(' No file selected');
      return;
    }

    setUploading(true);
    setIsUploading(true);
    setError(null);
    setStatusMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'posture_videos');

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error(`Cloudinary upload failed: ${cloudinaryData.error?.message || 'Unknown error'}`);
      }

      const videoUrl = cloudinaryData.secure_url;
      console.log('Cloudinary upload successful:', videoUrl);
      setUploadedVideoURL(videoUrl);

      setStatusMessage('Analyzing posture...');

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posture/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${responseData.message || response.statusText}`);
      }

      console.log('Backend response:', responseData);
      onFeedback(responseData);
    } catch (error) {
      console.error(error);
      setError(error.message);
      setStatusMessage(` ${error.message}`);
      onFeedback([{ message: error.message, type: 'error' }]);
    } finally {
      setUploading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-4">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input
        type="file"
        accept="video/mp4,video/webm"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}

export default VideoUpload;

