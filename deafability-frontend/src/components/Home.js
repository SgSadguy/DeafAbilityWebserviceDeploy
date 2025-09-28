import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedLevel, selectedCategory]);

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

  const filterCourses = () => {
    let filtered = courses;

    // ค้นหาตามชื่อ
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // กรองตามระดับ
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // กรองตามประเภท
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    setFilteredCourses(filtered);
  };

  const getUniqueLevels = () => {
    return [...new Set(courses.map(course => course.level))];
  };

  const getUniqueCategories = () => {
    return [...new Set(courses.map(course => course.category))];
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
      
      {/* ฟอร์มค้นหาและกรอง */}
      <div className="filter-section">
        <div className="filter-row">
          <input
            type="text"
            placeholder="🔍 ค้นหาตามชื่อคอร์ส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-row">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="filter-select"
          >
            <option value="">📊 ทุกระดับ</option>
            {getUniqueLevels().map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">🏷️ ทุกประเภท</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-info">
          <p>แสดง {filteredCourses.length} จาก {courses.length} คอร์ส</p>
        </div>
      </div>
      
      {filteredCourses.length === 0 ? (
        <div className="no-courses">
          <p>📭 ไม่พบคอร์สที่ตรงกับเงื่อนไข</p>
        </div>
      ) : (
        <div className="course-grid">
          {filteredCourses.map((course) => (
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
