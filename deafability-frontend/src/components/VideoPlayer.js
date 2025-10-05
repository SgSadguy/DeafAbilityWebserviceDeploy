// src/VideoPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './utils/api';
import './VideoPlayer.css'; // เราจะสร้าง css สำหรับ resize/drag

export default function VideoPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mainPlayer = useRef(null);
  const signPlayer = useRef(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/courses/${courseId}/lessons/${lessonId}/`);
        setLesson(res.data);
      } catch (err) {
        setError('โหลดบทเรียนไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [courseId, lessonId]);

  // เตรียม script ของ YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    if (!lesson || !window.YT || !lesson.links) return;

    const mainLink = lesson.links.find(l => l.role === 'main');
    const signLink = lesson.links.find(l => l.role === 'sign');

    if (!mainLink?.embed_url) return;

    const setupPlayers = () => {
      if (mainPlayer.current) mainPlayer.current.destroy?.();
      if (signPlayer.current) signPlayer.current.destroy?.();

      mainPlayer.current = new window.YT.Player('main-video', {
        videoId: extractId(mainLink.embed_url),
        events: {
          onStateChange: (e) => {
            if (!signPlayer.current) return;
            if (e.data === window.YT.PlayerState.PLAYING) signPlayer.current.playVideo();
            if (e.data === window.YT.PlayerState.PAUSED) signPlayer.current.pauseVideo();
          }
        }
      });

      if (signLink?.embed_url) {
        signPlayer.current = new window.YT.Player('sign-video', {
          videoId: extractId(signLink.embed_url),
        });
      }
    };

    window.onYouTubeIframeAPIReady = setupPlayers;
    if (window.YT && window.YT.Player) setupPlayers();

    return () => {
      mainPlayer.current?.destroy?.();
      signPlayer.current?.destroy?.();
    };
  }, [lesson]);

  const extractId = (embedUrl) => {
    try {
      const u = new URL(embedUrl);
      const parts = u.pathname.split('/');
      const i = parts.findIndex(p => p === 'embed');
      return i >= 0 ? parts[i + 1] : null;
    } catch {
      return null;
    }
  };

  if (loading) return <p>กำลังโหลด...</p>;
  if (error) return <p>{error}</p>;
  if (!lesson) return <p>ไม่พบข้อมูลบทเรียน</p>;

  return (
    <div className="player-container">
      <h2>{lesson.title}</h2>
      <div className="main-player">
        <div id="main-video"></div>
      </div>

      {/* Sign video overlay */}
      <div className="sign-player" id="sign-player">
        <div id="sign-video"></div>
      </div>

      <button onClick={() => navigate(-1)} className="back-btn">← กลับ</button>
    </div>
  );
}
