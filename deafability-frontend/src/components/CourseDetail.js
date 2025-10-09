import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './utils/api';
import './Courses.css';
import DropdownNav from './DropdownNav';
import logo from '../assets/logo_nobg.png';
import VideoPlayer from './VideoPlayer';


const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [progress, setProgress] = useState({
  //   percent: 0,
  //   completed_lessons: 0,
  //   total_lessons: 0,
  // });
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchCourseDetail();
      // await fetchProgress();
    };
    fetchData();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/courses/${id}/`);
      setCourse(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching course detail:', err);
      setError('ไม่สามารถโหลดข้อมูลคอร์สได้');
    } finally {
      setLoading(false);
    }
  };



  // const fetchProgress = async () => {
  //   try {
  //     const res = await axios.get(`/api/courses/${id}/progress/`);
  //     // ควรได้ { course_id, total_lessons, completed_lessons, percent }
  //     setProgress({
  //       percent: res.data?.percent ?? 0,
  //       completed_lessons: res.data?.completed_lessons ?? 0,
  //       total_lessons: res.data?.total_lessons ?? 0,
  //     });
  //   } catch (e) {
  //     console.warn('Cannot fetch progress yet. Defaulting to 0.', e);
  //     setProgress({ percent: 0, completed_lessons: 0, total_lessons: 0 });
  //   }
  // };

  // Removed unused functions

  const handleBackClick = () => {
    navigate('/courses');
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
            ← กลับหน้ารวมบทเรียน
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
            ← กลับหน้ารวมบทเรียน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="header" role="banner"> 
        <div className="brand"> 
            <img src={logo} alt="DeafAbility Logo" className="logo" />
      </div>
      <DropdownNav />
      </header>
      
      <div className="course-detail">
        
        
        <div className="course-detail-card">
          <h2 className="course-detail-title">{course.name}</h2>

          <VideoPlayer course={course} />

          {/* Progress bar */}

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
          {/* {course.lessons && course.lessons.length > 0 && (
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
                      <h4 className="lesson-title">
                        
                        {lesson.title}
                        {lesson.completed && <span style={{ marginLeft: 8, color: '#4caf50' }}>✔</span>}
                        </h4>
                      {lesson.description && (
                        <p className="lesson-description">{lesson.description}</p>
                      )}
                    </div>
                    <div className="lesson-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          <div className="course-actions">
            {/* {!enrolled ? (
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
            )} */}
            <button onClick={handleBackClick} className="back-button">
              ← กลับหน้ารวมบทเรียน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

