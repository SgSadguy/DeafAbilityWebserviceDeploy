import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses-list/');
      setCourses(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId, courseName) => {
    alert(`คลิกที่คอร์ส: ${courseName}\nID: ${courseId}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>🎓 DeafAbility</h1>
          <p>ระบบจัดการคอร์สสำหรับผู้พิการทางการได้ยิน</p>
        </div>
        <div className="loading">
          <h2>🔄 กำลังโหลดข้อมูล...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>🎓 DeafAbility</h1>
          <p>ระบบจัดการคอร์สสำหรับผู้พิการทางการได้ยิน</p>
        </div>
        <div className="error">
          <p>❌ {error}</p>
          <button 
            onClick={fetchCourses}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 ลองใหม่
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
      
      <h2 className="page-title">📚 คอร์สทั้งหมด</h2>
      
      {courses.length === 0 ? (
        <div className="no-courses">
          <p>📭 ไม่มีคอร์สในระบบ</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <div
              key={course.id}
              className="course-card"
              onClick={() => handleCourseClick(course.id, course.name)}
            >
              <div className="course-title">{course.name}</div>
              <div className="course-info">
                <strong>📊 ระดับ:</strong> {course.level}
              </div>
              <div className="course-info">
                <strong>🏷️ สายงาน:</strong> {course.category}
              </div>
              {course.description && (
                <div className="course-description">
                  {course.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
