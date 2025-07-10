import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import sys
import cv2
import mediapipe as mp
import json
import numpy as np

# Helper: calculate angle between three points
def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return round(np.degrees(angle), 2)

def analyze(video_path):
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose()
    cap = cv2.VideoCapture(video_path)

    feedback_dict = {}
    frame_num = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_num += 1
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)

        if not results.pose_landmarks:
            continue

        lm = results.pose_landmarks.landmark

        def get_coords(index):
            return [lm[index].x, lm[index].y]

        try:
            left_knee = get_coords(25)
            left_ankle = get_coords(27)
            left_hip = get_coords(23)
            left_shoulder = get_coords(11)
            neck = get_coords(12)
            nose = get_coords(0)

            issues = []

            # Knee over toe
            if left_knee[0] < left_ankle[0]:
                issues.append({
                    "message": "Knee over toe detected",
                    "type": "error"
                })

            # Back angle < 150
            back_angle = calculate_angle(
                left_hip,
                [(left_hip[0] + left_shoulder[0]) / 2, (left_hip[1] + left_shoulder[1]) / 2],
                left_shoulder
            )
            if back_angle < 150:
                issues.append({
                    "message": f"Back angle too low: {back_angle}°",
                    "type": "error"
                })

            # Neck bend > 30°
            neck_angle = calculate_angle(left_shoulder, neck, nose)
            if neck_angle > 30:
                issues.append({
                    "message": f"Neck bend too high: {neck_angle}°",
                    "type": "error"
                })

            if issues:
                feedback_dict[frame_num] = issues

        except Exception as e:
            continue

    cap.release()
    pose.close()

    grouped_feedback = []
    for frame in sorted(feedback_dict.keys())[:4]: 
        grouped_feedback.append({
            "frame": frame,
            "issues": feedback_dict[frame]
        })

    print(json.dumps(grouped_feedback))



if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_video.py <path_to_video>")
    else:
        analyze(sys.argv[1])
