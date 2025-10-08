// src/VideoPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './utils/api';
import './VideoPlayer.css';

export default function VideoPlayer({ course: initialCourse }) {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(initialCourse || null);
  const [loading, setLoading] = useState(!initialCourse);
  const [error, setError] = useState(null);

  const playerRef = useRef(null);

  // Fetch course only if no prop provided
  useEffect(() => {
    if (initialCourse) return;
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/courses/${courseId}/`);
        setCourse(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('โหลดคอร์สไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, initialCourse]);

  // Load YouTube API script once
  useEffect(() => {
    if (!course?.video_url) return;

    const isYouTube =
      course.video_url.includes('youtube.com') || course.video_url.includes('youtu.be');
    if (!isYouTube) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.body.appendChild(tag);
    }
  }, [course]);

  // Initialize YouTube player
  useEffect(() => {
    if (!course?.video_url) return;

    const isYouTube =
      course.video_url.includes('youtube.com') || course.video_url.includes('youtu.be');

    if (isYouTube) {
      const videoId = extractYouTubeId(course.video_url);
      if (!videoId) return;

      const initPlayer = () => {
        if (playerRef.current) playerRef.current.destroy?.();

        playerRef.current = new window.YT.Player('main-video', {
          videoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onReady: (event) => {
              try {
                event.target.mute();
                event.target.playVideo();
              } catch {}
            },
          },
        });
      };

      const waitForYT = () => {
        if (window.YT && window.YT.Player) initPlayer();
        else setTimeout(waitForYT, 200);
      };

      waitForYT();

      return () => playerRef.current?.destroy?.();
    }
  }, [course]);

  // Extract YouTube ID
  const extractYouTubeId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
      if (u.hostname.includes('youtube.com')) {
        const params = new URLSearchParams(u.search);
        return params.get('v') || u.pathname.split('/').pop();
      }
      return null;
    } catch {
      return null;
    }
  };

  if (loading) return <p>กำลังโหลดวิดีโอ...</p>;
  if (error) return <p>{error}</p>;
  if (!course || !course.video_url) return <p>ไม่พบวิดีโอสำหรับคอร์สนี้</p>;

  const isYouTube =
    course.video_url.includes('youtube.com') || course.video_url.includes('youtu.be');

  return (
    <div className="player-container">

      <div className="main-player">
        {isYouTube ? (
          <div id="main-video"></div>
        ) : (
          <video
            src={course.video_url}
            controls
            autoPlay
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* Optional back button if needed */}
      {!initialCourse && (
        <button onClick={() => navigate(-1)} className="back-btn">
          ← กลับ
        </button>
      )}
    </div>
  );
}
