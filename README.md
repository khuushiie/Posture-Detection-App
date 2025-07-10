# 🎯 Rule-Based Bad Posture Detection App

A full-stack web application that detects bad posture (e.g., slouching, knee over toe, neck bend) using rule-based logic and computer vision. Users can either upload a video or use their webcam to get frame-by-frame feedback.

---

## 🚀 Live Demo

🌐 **App URL**: [https://your-app-url.vercel.app](https://your-app-url.vercel.app)  
📹 **Demo Video**: [Watch here](https://your-demo-video-link)

---

## 🛠 Tech Stack

### Frontend
- ⚛️ React.js (with Vite)
- 🎨 Tailwind CSS
- 📦 Socket.io Client

### Backend
- 🟢 Node.js with Express.js
- 📦 Cloudinary (for video upload)
- 🎥 OpenCV + MediaPipe (via Python)
- 🔁 Python-Node Integration (via `child_process`)
- 🌐 Socket.io Server

---

## 📸 Features

- Upload a video or use your webcam
- Real-time or frame-by-frame posture feedback
- Flags incorrect posture like:
  - Knee over toe (squat)
  - Back angle < 150°
  - Neck bend > 30°
- Displays feedback beside the video
- Clean UI with two modes: **Upload** or **Webcam**
- Cloudinary integration for smooth video uploads
- WebSocket feedback streaming

---

## 🧠 Rule-Based Logic

Implemented using MediaPipe Pose and custom heuristics:

### Squat Rules:
- **Knee over toe**: `knee.x < ankle.x`
- **Back angle**: flag if `< 150°`

### Desk Sitting Rules:
- **Neck angle**: flag if `> 30°`
- **Back not straight**: angle logic similar to squat

---

## 🧪 How It Works

1. 📤 User uploads video → stored via Cloudinary
2. 🔁 Backend fetches video → runs Python script
3. 🎯 Python (OpenCV + MediaPipe) processes frames
4. 📊 Rule-based logic analyzes posture per frame
5. 📡 WebSocket emits feedback back to frontend
6. 🎥 User sees video + alerts (like “Neck bend too high”)

---

## 📁 Project Structure

```bash
root/
├── frontend/          # React + Tailwind UI
│   └── src/
│       ├── components/
│       └── App.jsx
│   └── public/
│   └── .env
│
├── backend/           # Express.js + Python Integration
│   ├── python_analyzer/
│   │   └── analyze_video.py
│   ├── routes/
│   ├── temp/
│   └── .env
│
├── .gitignore
└── README.md
