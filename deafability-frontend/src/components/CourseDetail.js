// src/components/CourseDetail.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { API_ROOT } from './utils/api'; // ✅ ดึง API_ROOT ให้เหมือนอีกไฟล์
import DropdownNav from './DropdownNav';
import logo from '../assets/logo_nobg.png';
import './CourseDetail.css';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState({
    percent: 0,
    completed_lessons: 0,
    total_lessons: 0,
  });

  // ✅ ให้เหมือนอีกไฟล์: ใช้ API_ROOT ไม่ใช่ window.location.origin
  const toMediaURL = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_ROOT}${url.startsWith('/') ? '' : '/'}${url}`;
  }, []);

  const onImgErr = (e) => {
    // ป้องกัน loop error หาก fallback เองก็พัง
    if (e.currentTarget.dataset.fallbackApplied === '1') return;
    e.currentTarget.dataset.fallbackApplied = '1';
    e.currentTarget.src =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="#888">No Image</text></svg>');
  };

  const isQuizAvailable = enrolled && Number(progress?.percent) >= 100;

  const handleQuizClick = () => {
    navigate(`/quiz/${id}`);
  };

  const fetchCourseDetail = async () => {
    try {
      const courseRes = await axios.get(`/api/courses/${id}/`);
      setCourse(courseRes.data || null);
      setError(null);
    } catch (e) {
      console.error('fetch course detail error:', e);
      setError('ไม่สามารถโหลดข้อมูลคอร์สได้');
      setCourse(null);
    }
  };

  const fetchProgress = async () => {
    try {
      const progRes = await axios.get(`/api/courses/${id}/progress/`);
      const d = progRes.data || {};
      setProgress({
        percent: d?.percent ?? 0,
        completed_lessons: d?.completed_lessons ?? 0,
        total_lessons: d?.total_lessons ?? 0,
      });
      if (d && d.total_lessons > 0) setEnrolled(true);
    } catch (e) {
      console.error('fetch progress error:', e);
      setProgress({ percent: 0, completed_lessons: 0, total_lessons: 0 });
      setEnrolled(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [courseRes, progRes] = await Promise.allSettled([
          axios.get(`/api/courses/${id}/`),
          axios.get(`/api/courses/${id}/progress/`),
        ]);

        if (courseRes.status === 'fulfilled') {
          setCourse(courseRes.value.data || null);
          setError(null);
        } else {
          throw courseRes.reason;
        }

        if (progRes.status === 'fulfilled') {
          const d = progRes.value.data || {};
          setProgress({
            percent: d?.percent ?? 0,
            completed_lessons: d?.completed_lessons ?? 0,
            total_lessons: d?.total_lessons ?? 0,
          });
          if (d && d.total_lessons > 0) setEnrolled(true);
        } else {
          setProgress({ percent: 0, completed_lessons: 0, total_lessons: 0 });
          setEnrolled(false);
        }
      } catch (e) {
        console.error('fetch error:', e);
        setError('ไม่สามารถโหลดข้อมูลคอร์สได้');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const onFocus = () => {
      if (localStorage.getItem('progress_dirty') === '1') {
        fetchProgress();
        fetchCourseDetail();
        localStorage.removeItem('progress_dirty');
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('progress_dirty') === '1') {
      fetchProgress();
      fetchCourseDetail();
      localStorage.removeItem('progress_dirty');
    }
  }, []);

  const handleBack = () => navigate('/courses');

  const handleEnroll = async () => {
    try {
      await axios.post(`/api/courses/${id}/enroll/`);
      setEnrolled(true);
      alert('สมัครเรียนสำเร็จ');
    } catch (e) {
      console.error(e);
      alert('ไม่สามารถสมัครเรียนได้');
    }
  };

  const handleLessonClick = async (lessonId) => {
    try {
      await axios.get(`/api/courses/${id}/lessons/${lessonId}/`);
    } catch (_) {}
    navigate(`/videoplayer/${id}/${lessonId}`);
  };

  const fmtDur = (sec) => {
    if (sec == null) return null;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="cd-container">
        <div className="cd-card"><p>กำลังโหลดข้อมูล…</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cd-container">
        <div className="cd-card cd-error">
          <p>{error}</p>
          <button className="cd-btn cd-btn-gray" onClick={handleBack}>← กลับหน้ารวมคอร์ส</button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="cd-container">
        <div className="cd-card cd-error">
          <p>ไม่พบคอร์สที่ต้องการ</p>
          <button className="cd-btn cd-btn-gray" onClick={handleBack}>← กลับหน้ารวมคอร์ส</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-page">
      {/* Header */}
      <header className="cd-header" role="banner">
        <div className="cd-brand">
          <img src={logo} alt="DeafAbility" className="cd-logo" />
        </div>
        <DropdownNav />
      </header>

      <div className="cd-container">
        <div className="cd-card">
          <h1 className="cd-title">{course.name}</h1>

          {/* ✅ ปกคอร์ส: ใช้ toMediaURL + onError */}
          {course.cover_url && (
            <div className="cd-hero">
              <img
                src={toMediaURL(course.cover_url)}
                alt={`Cover for ${course.name}`}
                className="cd-hero-img"
                loading="lazy"
                onError={onImgErr}
              />
            </div>
          )}

          {course.description && (
            <section className="cd-desc">
              <h3>เกี่ยวกับคอร์สนี้</h3>
              <p>{course.description}</p>
            </section>
          )}

          <section className="cd-tiles">
            <div className="cd-tile">
              <div className="cd-tile-label">ระดับ</div>
              <div className="cd-tile-value">{course.level || '—'}</div>
            </div>
            <div className="cd-tile">
              <div className="cd-tile-label">หมวดหมู่</div>
              <div className="cd-tile-value">{course.category || '—'}</div>
            </div>
            <div className="cd-tile">
              <div className="cd-tile-label">ความคืบหน้า</div>
              <div className="cd-tile-value">
                {progress.completed_lessons}/{progress.total_lessons} ({progress.percent}%)
              </div>
              <div className="cd-progress">
                <div
                  className="cd-progress-fill"
                  style={{ width: `${Math.max(0, Math.min(100, progress.percent))}%` }}
                />
              </div>
            </div>
          </section>

{/* รายการบทเรียน */}
{Array.isArray(course.lessons) && course.lessons.length > 0 ? (
  <section className="cd-lessons">
    <h3>รายการบทเรียน</h3>

    <div className="cd-lesson-grid">
      {course.lessons.map((lesson, idx) => {
        const thumb = toMediaURL(lesson.cover_url || course.cover_url); // ⬅️ สั้นสุด
        return (
          <div
            key={lesson.id}
            className="cd-lesson-card"
            role="button"
            tabIndex={0}
            onClick={() => handleLessonClick(lesson.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleLessonClick(lesson.id)}
          >
            <div className="cd-lesson-thumb">
              <img
                src={thumb}
                alt={lesson.title || course.name}
                className="course-image"
                loading="lazy"
                onError={onImgErr}
              />
              <span className="cd-lesson-badge">บทที่ {idx + 1}</span>
              {lesson.completed && <span className="cd-lesson-badge done">✔ ทำแล้ว</span>}
              {lesson.duration_seconds != null && (
                <span className="cd-lesson-badge time">{fmtDur(lesson.duration_seconds)}</span>
              )}
            </div>

            <div className="cd-lesson-body">
              <h4 className="cd-lesson-title">{lesson.title}</h4>
              <p className="cd-lesson-desc">
                {lesson.description?.slice(0, 80) || 'ไม่มีคำอธิบาย'}
                {lesson.description?.length > 80 ? '...' : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </section>
) : (
  <div className="cd-empty">ยังไม่มีบทเรียนในคอร์สนี้</div>
)}

          {/* ปุ่มการทำงาน */}
          <div className="cd-actions">
            {!enrolled ? (
              <button className="cd-btn cd-btn-green" onClick={handleEnroll}>
                สมัครเรียน
              </button>
            ) : (
              <div className="cd-badge-enrolled">สมัครเรียนแล้ว</div>
            )}

            {isQuizAvailable && (
              <button
                className="cd-btn cd-btn-primary"
                onClick={handleQuizClick}
                aria-label="ทำแบบทดสอบหลังจบคอร์ส"
              >
                ทำแบบทดสอบ
              </button>
            )}

            <button className="cd-btn cd-btn-gray" onClick={handleBack}>
              ← กลับหน้ารวมคอร์ส
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
