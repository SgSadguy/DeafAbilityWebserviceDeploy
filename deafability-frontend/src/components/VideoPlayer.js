// src/VideoPlayer.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './utils/api';

function extractYouTubeIdFromEmbed(embedUrl) {
  try {
    const u = new URL(embedUrl);
    const parts = u.pathname.split('/');
    const i = parts.findIndex(p => p === 'embed');
    return i >= 0 && parts[i + 1] ? parts[i + 1] : null;
  } catch {
    return null;
  }
}

export default function VideoPlayer() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const playerRef = useRef(null);
  const ytReadyRef = useRef(false);

  // โหลดข้อมูลบทเรียน
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/courses/${courseId}/lessons/${lessonId}/`);
        if (!mounted) return;
        setLesson(res.data);
        setErr(null);
      } catch (e) {
        if (!mounted) return;
        setErr('โหลดบทเรียนไม่สำเร็จ');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [courseId, lessonId]);

  const links = useMemo(() => {
    if (!lesson) return [];
    return Array.isArray(lesson.links) ? lesson.links : [];
  }, [lesson]);

  const active = links[activeIndex] || null;

  // โหลดสคริปต์ YouTube IFrame API หนึ่งครั้ง
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      ytReadyRef.current = true;
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => { ytReadyRef.current = true; };
  }, []);

  // ฟังก์ชันนำทางเมื่อเล่นจบ
  const goAfterEnd = async () => {
    if (lesson?.is_last_lesson) {
      // ถ้าเป็นบทสุดท้าย → กลับหน้ารายละเอียดคอร์ส (หรือสรุปคอร์ส)
      navigate(`/courses/${courseId}`);
    } else if (lesson?.next_lesson_id) {
      // ถ้ามีบทถัดไป → ไปหน้า videoplayer ของบทถัดไป
      navigate(`/videoplayer/${courseId}/${lesson.next_lesson_id}`);
    } else {
      // กันตกหล่น: กลับหน้าคอร์ส
      navigate(`/courses/${courseId}`);
    }
    try {
      // แจ้งจบบทนี้ (ต้อง login ถึงจะบันทึกได้จริง หาก backend ใช้ IsAuthenticated)
      await axios.post(`/api/courses/${courseId}/lessons/${lessonId}/complete/`);
    } catch (e) {
      // เงียบ/แจ้งเตือนตามเหมาะ
    } finally {
      if (lesson?.is_last_lesson) {
        navigate(`/course/${courseId}`);
      } else if (lesson?.next_lesson_id) {
        navigate(`/videoplayer/${courseId}/${lesson.next_lesson_id}`);
      } else {
        navigate(`/course/${courseId}`);
      }
    }
  };

  // สร้าง/ทำลาย YT.Player ตามลิงก์ YouTube ที่เลือก
  useEffect(() => {
    if (!active?.embed_url) {
      // ไม่ใช่ YouTube → ทำลาย player ถ้ามี
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      return;
    }

    const init = () => {
      if (!ytReadyRef.current) {
        setTimeout(init, 100);
        return;
      }
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      const vid = extractYouTubeIdFromEmbed(active.embed_url);
      if (!vid) return;

      playerRef.current = new window.YT.Player('yt-player', {
        videoId: vid,
        playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (e) => {
            const ENDED = window.YT?.PlayerState?.ENDED;
            if (ENDED !== undefined && e.data === ENDED) {
              goAfterEnd();  // ← เล่นจบแล้วทำงานที่นี่
            }
          }
        }
      });
    };

    init();
    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [active?.embed_url, lesson?.is_last_lesson, lesson?.next_lesson_id, navigate, courseId]);

  return (
    <div style={{ maxWidth: 960, margin: '24px auto', padding: '0 16px' }}>
      <button onClick={() => navigate(-1)}>&larr; กลับ</button>
      <h1 style={{ marginTop: 16 }}>Video Player</h1>

      {loading && <p>กำลังโหลด...</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      {lesson && (
        <>
          <h2 style={{ margin: '8px 0' }}>{lesson.title || `Lesson #${lessonId}`}</h2>
          {lesson.description && <p style={{ opacity: 0.85 }}>{lesson.description}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              {active?.embed_url ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
                  <div id="yt-player"
                       style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                </div>
              ) : active?.href ? (
                <>
                  <p>ลิงก์นี้ฝังไม่ได้: <a href={active.href} target="_blank" rel="noreferrer">{active.href}</a></p>
                  <button style={{ marginTop: 12 }} onClick={goAfterEnd}>
                    ทำบทนี้เสร็จ → ไปต่อ
                  </button>
                </>
              ) : (
                <p>ยังไม่มีลิงก์วิดีโอในบทเรียนนี้</p>
              )}
            </div>

            <aside>
              <h3>รายการลิงก์</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {links.map((lnk, idx) => (
                  <button
                    key={lnk.id || idx}
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: idx === activeIndex ? '2px solid #444' : '1px solid #bbb',
                      background: idx === activeIndex ? '#f2f2f2' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{lnk.title || `Link #${idx + 1}`}</div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      {lnk.embed_url ? 'YouTube (embedded)' : (lnk.href ? lnk.href : 'N/A')}
                    </div>
                  </button>
                ))}
              </div>

              {/* ปุ่มไปต่อ/กลับคอร์ส */}
              <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                {lesson?.next_lesson_id && (
                  <button onClick={() => navigate(`/videoplayer/${courseId}/${lesson.next_lesson_id}`)}>
                    ไปบทถัดไป →
                  </button>
                )}
                {lesson?.is_last_lesson && (
                  <button onClick={() => navigate(`/courses/${courseId}`)}>
                    จบคอร์ส → กลับหน้าคอร์ส
                  </button>
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
