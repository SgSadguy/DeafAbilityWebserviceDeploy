import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './utils/api';
import './VideoPlayer.css';

export default function VideoPlayer({ course: initialCourse, lesson: initialLesson }) {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(initialCourse || null);
  const [lesson, setLesson] = useState(initialLesson || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNextCta, setShowNextCta] = useState(false);
  const [reportedDone, setReportedDone] = useState(false);
  const [nextLessonId, setNextLessonId] = useState(null);

  const html5VideoRef = useRef(null);
  const ytPlayerRef = useRef(null);

  /** โหลดข้อมูลคอร์สและบทเรียน */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        let c = initialCourse;
        if (!c && courseId) {
          const res = await axios.get(`/api/courses/${courseId}/`);
          c = res.data;
        }

        let l = initialLesson;
        if (!l && courseId && lessonId) {
          const res2 = await axios.get(`/api/courses/${courseId}/lessons/${lessonId}/`);
          l = res2.data;
        }

        if (!cancelled) {
          setCourse(c || null);
          setLesson(l || null);
          setNextLessonId(l?.next_lesson_id || null);
          setError(null);
        }
      } catch (e) {
        console.error('Error loading video:', e);
        if (!cancelled) setError('โหลดวิดีโอไม่สำเร็จ');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [courseId, lessonId]);

  /** ฟังก์ชันเลือก URL วิดีโอหลัก */
  const pickPrimaryVideo = () => {
    if (lesson?.links?.length) {
      const main =
        lesson.links.find(l => (l.role || '').toLowerCase().includes('main')) ||
        lesson.links.find(l => (l.kind || '').toLowerCase() === 'youtube') ||
        lesson.links[0];

      const isYouTube =
        (main.kind || '').toLowerCase() === 'youtube' ||
        (main.embed_url || '').includes('youtube');

      return {
        type: isYouTube ? 'youtube' : 'file',
        url: isYouTube ? (main.embed_url || main.href) : main.href,
      };
    }

    const courseUrl = course?.video_url || course?.course_video_url;
    if (courseUrl) {
      const isYouTube = courseUrl.includes('youtube');
      return { type: isYouTube ? 'youtube' : 'file', url: courseUrl };
    }

    return null;
  };

  const primary = pickPrimaryVideo();

  /** ฟังก์ชันรายงานบทเรียนจบแล้ว */
  const completeLesson = async () => {
    if (reportedDone) return;
    try {
      await axios.post(`/api/courses/${courseId}/lessons/${lessonId}/complete/`);
      setReportedDone(true);
    } catch (e1) {
      try {
        await axios.post(`/api/courses/${courseId}/progress/`, {
          lesson_id: Number(lessonId),
          status: 'completed',
        });
        setReportedDone(true);
      } catch (e2) {
        try {
          await axios.patch(`/api/courses/${courseId}/lessons/${lessonId}/`, {
            completed: true,
          });
          setReportedDone(true);
        } catch (e3) {
          console.warn('completeLesson failed', e1, e2, e3);
        }
      }
    } finally {
      try { localStorage.setItem('progress_dirty', '1'); } catch {}
      setLesson(prev => prev ? { ...prev, completed: true } : prev);
    }
  };
useEffect(() => {
  setShowNextCta(false);
  setReportedDone(false);
}, [lessonId]);
  /** สร้าง player YouTube และจับตอนจบ */
  useEffect(() => {
    if (!primary || primary.type !== 'youtube') return;

    const ensureApi = () =>
      new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve();
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        document.body.appendChild(s);
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => { prev && prev(); resolve(); };
      });

    const getVideoId = (url) => {
      const m1 = url.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
      if (m1) return m1[1];
      const m2 = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
      if (m2) return m2[1];
      return null;
    };

    let cancelled = false;
    let pollTimer = null;

    (async () => {
      await ensureApi();
      if (cancelled) return;
      const vid = getVideoId(primary.url);
      if (!vid) return;

      try { ytPlayerRef.current && ytPlayerRef.current.destroy(); } catch {}
      ytPlayerRef.current = new window.YT.Player('yt-iframe', {
        videoId: vid,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          origin: window.location.origin,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: async (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              await completeLesson();
              setShowNextCta(true);
            }
          },
        },
      });

      pollTimer = setInterval(async () => {
        const p = ytPlayerRef.current;
        if (!p) return;
        const d = p.getDuration?.() ?? 0;
        const t = p.getCurrentTime?.() ?? 0;
        if (d > 0 && d - t <= 1.0) {
          await completeLesson();
          setShowNextCta(true);
        }
      }, 700);
    })();

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      try { ytPlayerRef.current && ytPlayerRef.current.destroy(); } catch {}
      ytPlayerRef.current = null;
    };
  }, [primary?.url]);

  /** HTML5 video (ไฟล์ตรง) */
  useEffect(() => {
    if (primary?.type !== 'file') return;
    const v = html5VideoRef.current;
    if (!v) return;
    const onEnded = async () => {
      await completeLesson();
      setShowNextCta(true);
    };
    v.addEventListener('ended', onEnded);
    return () => v.removeEventListener('ended', onEnded);
  }, [primary?.url]);

  /** ไปบทถัดไป */
  const handleNextLesson = async () => {
    await completeLesson();
    if (nextLessonId) navigate(`/videoplayer/${courseId}/${nextLessonId}`);
    else navigate(`/course/${courseId}`);
  };

  if (loading) return <p>กำลังโหลดวิดีโอ...</p>;
  if (error) return <p>{error}</p>;
  if (!primary) return <p>ไม่พบวิดีโอในบทเรียนนี้</p>;

  return (
    <div className="player-container">
      <div className="main-player">
        {primary.type === 'youtube' ? (
          <div id="yt-iframe" className="yt-player" />
        ) : (
          <video
            ref={html5VideoRef}
            src={primary.url}
            controls
            autoPlay
            className="html5-player"
          />
        )}
      </div>

      {/* ปุ่มถัดไป */}
      {showNextCta && (
        <div className="next-cta">
          <button className="next-cta-btn" onClick={handleNextLesson}>
            ไปบทถัดไป →
          </button>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="back-btn">
        ← กลับ
      </button>
    </div>
  );
}
