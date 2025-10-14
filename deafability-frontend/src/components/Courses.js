import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './utils/api';
import './Courses.css';
import DropdownNav from './DropdownNav';
import logo from '../assets/logo_nobg.png';

const Courses = () => {
const navigate = useNavigate();
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
    const res = await axios.get('/api/courses-list/');
    let list = Array.isArray(res.data) ? res.data : [];

    // เรียงเก่าสุดก่อน
    const toTs = (c) => Date.parse(c.updated_at || c.created_at || 0) || 0;
    list = list.sort((a, b) => toTs(a) - toTs(b)); 

    setCourses(list);
  } catch (err) {
    setError('โหลดข้อมูลไม่สำเร็จ');
  } finally {
    setLoading(false);
  }
};

  const filterCourses = () => {
    let filtered = courses;
    if (searchTerm)
      filtered = filtered.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedLevel)
      filtered = filtered.filter(c => c.level === selectedLevel);
    if (selectedCategory)
      filtered = filtered.filter(c => c.category === selectedCategory);
    setFilteredCourses(filtered);
  };



const getUniqueLevels = () => {
return [...new Set(courses.map(course => course.level))];
};

const getUniqueCategories = () => {
return [...new Set(courses.map(course => course.category))];
};

const handleCourseClick = (courseId) => {
navigate(`/course/${courseId}`);
};

if (loading) {
return ( <div className="courses-container"> <h1>📚 กำลังโหลดข้อมูลคอร์ส...</h1> </div>
);
}

if (error) {
return ( <div className="courses-container"> <p>❌ {error}</p> <button 
       onClick={fetchCourses}
       className="retry-button"
     >
🔄 ลองใหม่ </button> </div>
);
}

return ( <div className="home-container">
{/* Header */} <header className="header" role="banner"> 
                <div className="brand"> 
                    <img src={logo} alt="DeafAbility Logo" className="logo" />
                </div>

    {/* Dropdown Navbar */}

    <DropdownNav />
  </header>

  


  {/* ฟอร์มค้นหาและกรอง */}
  <div className="filter-section">
    <h1 className="page-title">บทเรียนทั้งหมด</h1>
    <div className="filter-row">
      <input
        type="text"
        placeholder="🔍 ค้นหาตามชื่อบทเรียน..."
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
      <p>แสดง {filteredCourses.length} จาก {courses.length} บทเรียนทั้งหมด</p>
    </div>
  </div>




  {/* แสดงคอร์ส */}
  {filteredCourses.length === 0 ? (
    <div className="no-courses">
      <p>📭 ไม่พบคอร์สที่ตรงกับเงื่อนไข</p>
    </div>
  ) : (
<div className="course-grid">
  {filteredCourses.map((course) => (
    <div
      key={course.id}
      className="course-card-fancy"
      onClick={() => handleCourseClick(course.id)}
    >
      {/* รูปภาพ */}
      <div className="card-image-wrapper">
        <img
          src={course.cover_url || "https://via.placeholder.com/400x250?text=No+Image"}
          alt={course.name}
          className="course-image"
          loading="lazy"
        />
        {/* overlay icons */}
        <div className="card-icons">
          <span className="icon-item">📊 {course.level}</span>
          <span className="icon-item">🏷️ {course.category}</span>
        </div>
      </div>

      {/* ส่วนล่าง bubble */}
      <div className="card-content">
        <h3 className="course-title">{course.name}</h3>
        <p className="course-desc">
          {course.description?.slice(0, 60) || "ไม่มีคำอธิบาย"}...
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: "60%" }}></div>
        </div>
      </div>
    </div>
  ))}
</div>

    
  )}
  
</div>


);
};

export default Courses;
