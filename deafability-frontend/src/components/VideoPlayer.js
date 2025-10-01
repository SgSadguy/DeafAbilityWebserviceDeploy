// src/VideoPlayer.js
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toYouTubeEmbed } from './utils/youtube';

export default function VideoPlayer() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/courses/${courseId}/lessons/${lessonId}/`);
        setPayload(res.data);
        setErr(null);
      } catch (e) {
        console.error(e);
        setErr('โหลดข้อมูลบทเรียนไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, lessonId]);

  // รองรับทั้ง payload แบบ { id, title, links } และ { lesson: {...}, message: ... }
  const lesson = useMemo(() => {
    if (!payload) return null;
    if (payload.id) return payload;              // กรณี serializer ส่ง lesson ตรง ๆ
    if (payload.lesson) return payload.lesson;   // กรณีเดิม
    return null;
  }, [payload]);

  // เตรียมลิงก์: ถ้า backend ยังไม่สร้าง embed_url ให้สร้างฝั่งหน้าเว็บด้วย toYouTubeEmbed
  const links = useMemo(() => {
    if (!lesson) return [];
    const raw = Array.isArray(lesson.links) ? lesson.links : [];
    return raw.map(x => {
      const embed = x.embed_url || (x.url ? toYouTubeEmbed(x.url) : null) || (x.href ? toYouTubeEmbed(x.href) : null);
      const href = x.href || x.url || null;
      return { ...x, embed_url: embed, href };
    });
  }, [lesson]);

  const active = links[activeIndex] || null;

  return (
    <div style={{ maxWidth: 960, margin: '24px auto', padding: '0 16px' }}>
      <button onClick={() => navigate(-1)}>&larr; กลับ</button>

      <h1 style={{ marginTop: 16 }}>Video Player</h1>

      {loading && <p>กำลังโหลด...</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      {!loading && !err && lesson && (
        <>
          <h2 style={{ margin: '8px 0' }}>{lesson.title || `Lesson #${lessonId}`}</h2>
          {lesson.description && <p style={{ opacity: 0.85 }}>{lesson.description}</p>}

          {links.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                {active?.embed_url ? (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
                    <iframe
                      src={active.embed_url.replace('www.youtube.com', 'www.youtube-nocookie.com')}
                      title={active.title || 'player'}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                    />
                  </div>
                ) : active?.href ? (
                  <div>
                    <p>ลิงก์นี้ฝังในหน้าไม่ได้</p>
                    <a href={active.href} target="_blank" rel="noreferrer">เปิดลิงก์</a>
                  </div>
                ) : (
                  <p>ไม่พบวิดีโอสำหรับลิงก์นี้</p>
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
              </aside>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <p>บทเรียนนี้ยังไม่มีลิงก์วิดีโอใน API</p>
              <p>กรุณาเพิ่ม `lesson.links[]` ในฝั่ง backend ก่อน</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
