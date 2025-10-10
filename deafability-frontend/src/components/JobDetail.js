// src/components/JobDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './utils/api';
import './CourseDetail.css'; // reuse สไตล์เดิม
import logo from '../assets/logo_nobg.png';
import DropdownNav from './DropdownNav';


const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();           // job id จาก route
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/jobs/${id}/`);
      setJob(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching job detail:', err);
      setError('ไม่สามารถโหลดข้อมูลงานได้');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/jobs'); // กลับไปหน้ารายการงาน (JobsPage)
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`); // ไปหน้ารายละเอียดคอร์สเดิมของคุณ
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <p>🔄 กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <p>❌ {error}</p>
          <button onClick={handleBackClick} className="back-button">
            ← กลับไป Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container">
        <div className="no-courses">
          <p>📭 ไม่พบนงานที่ต้องการ</p>
          <button onClick={handleBackClick} className="back-button">
            ← กลับไป Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="job-header" role="banner"> 
        <div className="brand"> 
          <img src={logo} alt="DeafAbility Logo" className="logo" />
        </div>
        <DropdownNav />
      </header>

      {/* --- HERO (IMAGE + BADGES) --- */}
      <div className="job-hero">
        <img
          src={job.image_url || "https://via.placeholder.com/1200x420?text=No+Image"}
          alt={job.title}
          className="job-hero-img"
          loading="lazy"
        />
      <div className="job-hero-badges">
        {job.position_type && <span className="job-badge">💼 {job.position_type}</span>}
        {job.location && <span className="job-badge">📍 {job.location}</span>}     {/* ✅ */}
        {job.salary && <span className="job-badge">💰 {job.salary}</span>}         {/* ✅ */}
      </div>
      </div>
      {/* --- /HERO --- */}

      <div className="course-detail">
        <div className="course-detail-card">
          <h2 className="course-detail-title">{job.title}</h2>

          {/* company ชัดขึ้น */}
          {job.company && (
            <div className="info-item" style={{ marginBottom: 8 }}>
              <span className="info-label">🏢 บริษัท:</span>
              <span className="info-value">{job.company}</span>
            </div>
          )}
        <div className="course-detail-info">
          <div className="info-item">
            <span className="info-label">🧭 ตำแหน่ง:</span>
            <span className="info-value">{job.position_type || '—'}</span>
          </div>

          <div className="info-item">  {/* ✅ Location */}
            <span className="info-label">📍 สถานที่:</span>
            <span className="info-value">{job.location || '—'}</span>
          </div>

          <div className="info-item">  {/* ✅ Salary */}
            <span className="info-label">💰 เงินเดือน:</span>
            <span className="info-value">{job.salary || '—'}</span>
          </div>

          <div className="info-item">
            <span className="info-label">🕒 สร้างเมื่อ:</span>
            <span className="info-value">
              {job.created_at ? new Date(job.created_at).toLocaleString() : '—'}
            </span>
          </div>
</div>


          {job.description && (
            <div className="course-description">
              <h3>📝 รายละเอียดงาน</h3>
              <p>{job.description}</p>
            </div>
          )}

          <div className="lessons-section">
            <h3>📚 บทเรียนที่เกี่ยวข้อง</h3>
            {(!job.courses || job.courses.length === 0) ? (
              <p>— ไม่มีบทเรียนที่เชื่อมไว้ —</p>
            ) : (
              <div className="lessons-list">
                {job.courses.map((c, index) => (
                  <div
                    key={c.id}
                    className="lesson-item"
                    onClick={() => handleCourseClick(c.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="lesson-number">{index + 1}</div>
                    <div className="lesson-content">
                      <h4 className="lesson-title">{c.name}</h4>
                      <p className="lesson-description">
                        📊 {c.level} • 🏷️ {c.category}
                      </p>
                    </div>
                    <div className="lesson-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="course-actions">
            <button onClick={handleBackClick} className="back-button">
              ← กลับไป Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
