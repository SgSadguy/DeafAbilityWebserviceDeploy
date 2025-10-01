import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CourseDetail.css';

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${id}/`);
      setCourse(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching course detail:', err);
      setError('ไม่สามารถโหลดข้อมูลคอร์สได้');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const response = await axios.post(`/api/courses/${id}/enroll/`);
      console.log('Enroll response:', response.data);
      setEnrolled(true);
      alert('สมัครเรียนสำเร็จ!');
    } catch (err) {
      console.error('Error enrolling:', err);
      alert('ไม่สามารถสมัครเรียนได้');
    }
  };

  const handleLessonClick = async (lessonId) => {
    try {
      const response = await axios.get(`/api/courses/${id}/lessons/${lessonId}/`);
      console.log('Lesson response:', response.data);
      alert(`Hello! This is lesson ${lessonId}`);
    } catch (err) {
      console.error('Error fetching lesson:', err);
      alert('ไม่สามารถโหลดบทเรียนได้');
    }
    navigate(`/videoplayer/${id}/${lessonId}`);
  };

  const handleBackClick = () => {
    navigate('/');
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
            ← กลับไปหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container">
        <div className="no-courses">
          <p>📭 ไม่พบคอร์สที่ต้องการ</p>
          <button onClick={handleBackClick} className="back-button">
            ← กลับไปหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎓 DeafAbility</h1>
        <p>ระบบจัดการคอร์สสำหรับผู้พิการทางการได้ยิน</p>
      </div>
      
      <div className="course-detail">
        <button onClick={handleBackClick} className="back-button">
          ← กลับไปหน้าแรก
        </button>
        
        <div className="course-detail-card">
          <h2 className="course-detail-title">{course.name}</h2>
          
          <div className="course-detail-info">
            <div className="info-item">
              <span className="info-label">📊 ระดับ:</span>
              <span className="info-value">{course.level}</span>
            </div>
            <div className="info-item">
              <span className="info-label">📚 หมวดหมู่:</span>
              <span className="info-value">{course.category}</span>
            </div>
          </div>

          {course.description && (
            <div className="course-description">
              <h3>📝 รายละเอียด</h3>
              <p>{course.description}</p>
            </div>
          )}

          {/* Lesson List */}
          {course.lessons && course.lessons.length > 0 && (
            <div className="lessons-section">
              <h3>📚 รายการบทเรียน</h3>
              <div className="lessons-list">
                {course.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id} 
                    className="lesson-item"
                    onClick={() => handleLessonClick(lesson.id)}
                  >
                    <div className="lesson-number">{index + 1}</div>
                    <div className="lesson-content">
                      <h4 className="lesson-title">{lesson.title}</h4>
                      {lesson.description && (
                        <p className="lesson-description">{lesson.description}</p>
                      )}
                    </div>
                    <div className="lesson-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="course-actions">
            {!enrolled ? (
              <button 
                onClick={handleEnroll}
                className="enroll-button"
              >
                🎓 สมัครเรียน
              </button>
            ) : (
              <div className="enrolled-message">
                ✅ สมัครเรียนแล้ว
              </div>
            )}
            <button onClick={handleBackClick} className="back-button">
              ← กลับไปหน้าแรก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
