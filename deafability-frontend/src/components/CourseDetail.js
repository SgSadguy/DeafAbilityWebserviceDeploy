// src/components/CourseDetail.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { API_ROOT } from './utils/api';
import DropdownNav from './DropdownNav';
import logo from '../assets/logo_nobg.png';
import './CourseDetail.css';
import { formatSeconds } from './utils/time';

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

  // ใช้ API_ROOT สำหรับสื่อมีเดียให้ถูกโดเมน/พาธ
  const toMediaURL = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_ROOT}${url.startsWith('/') ? '' : '/'}${url}`;
  }, []);

  const onImgErr = (e) => {
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

  // ---- เพิ่มจากโค้ดแรก: ตัวคำนวณเวลารวมคอร์สแบบ fallback หลายชั้น ----
  const calcCourseDuration = (courseData) => {
    if (!courseData) return 0;

    // 1) เอาค่าจาก backend ถ้ามี
    if (courseData?.total_duration_seconds) return courseData.total_duration_seconds;

    // 2) รวมจากบทเรียนถ้าบทเรียนมี field duration
    const sumLessons =
      courseData?.lessons?.reduce((acc, ls) => {
        // รองรับหลายชื่อฟิลด์: lesson_duration_seconds, duration_seconds
        const d =
          ls.lesson_duration_seconds ??
          ls.duration_seconds ??
          0;
        return acc + (Number.isFinite(d) ? d : 0);
      }, 0) ?? 0;
    if (sumLessons > 0) return sumLessons;

    // 3) สำรองสุดท้าย: รวมจากลิงก์ของบทเรียนทุกอัน
    const sumLinks =
      courseData?.lessons?.reduce((acc, ls) => {
        const sub = (ls.links || []).reduce((a, lk) => {
          const v = lk.duration_seconds ?? 0;
          return a + (Number.isFinite(v) ? v : 0);
        }, 0);
        return acc + sub;
      }, 0) ?? 0;

    return sumLinks;
  };

  // ------------------------------------------------------------

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

  // รีเฟรช progress/course เมื่อกลับจากหน้าวิดีโอ
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

  const totalSeconds = calcCourseDuration(course);

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

          {/* ปกคอร์ส: ใช้ toMediaURL */}
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

          {/* รวมเวลาคอร์ส */}
          <h2 className="course-total">
            รวมเวลาคอร์ส: <b>{formatSeconds(totalSeconds)}</b>
          </h2>

          {/* คำอธิบายคอร์ส */}
          {course.description && (
            <section className="cd-desc">
              <h3>เกี่ยวกับคอร์สนี้</h3>
              <p>{course.description}</p>
            </section>
          )}

          {/* Tiles: ระดับ/หมวด/ความคืบหน้า */}
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
                  const thumb = toMediaURL(lesson.cover_url || course.cover_url);
                  // รวมเวลาบทเรียนแบบ fallback หลายชั้น
                  const lsec =
                    lesson.lesson_duration_seconds ??
                    lesson.duration_seconds ??
                    (lesson.links || []).reduce((a, lk) => a + (lk.duration_seconds ?? 0), 0) ??
                    0;

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

                        {/* Badge มุมซ้าย: บทที่ + เวลา */}
                        <div className="cd-lesson-badge-group">
                          <span className="cd-lesson-badge">บทที่ {idx + 1}</span>
                          {Number.isFinite(lsec) && lsec > 0 && (
                            <span className="cd-duration-badge">{formatSeconds(lsec)}</span>
                          )}
                        </div>

                        {/* ทำแล้ว */}
                        {lesson.completed && <span className="cd-lesson-badge done">✔ ทำแล้ว</span>}
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
