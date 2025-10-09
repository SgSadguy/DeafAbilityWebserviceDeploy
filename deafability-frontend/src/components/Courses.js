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
const filterCourses = () => {
if (!Array.isArray(courses)) {
  setFilteredCourses([]);
  return;
}

let filtered = courses;

if (searchTerm) {
  filtered = filtered.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

if (selectedLevel) {
  filtered = filtered.filter(course => course.level === selectedLevel);
}

if (selectedCategory) {
  filtered = filtered.filter(course => course.category === selectedCategory);
}

setFilteredCourses(filtered);
};

filterCourses();
}, [courses, searchTerm, selectedLevel, selectedCategory]);

const fetchCourses = async () => {
try {
setLoading(true);
console.log('🔄 Fetching courses...');
const response = await axios.get('/courses/');
console.log('📚 Courses response:', response.data);
console.log('📚 Response type:', typeof response.data);
console.log('📚 Is array:', Array.isArray(response.data));

// Handle different response formats
let coursesData = response.data;
if (Array.isArray(coursesData)) {
  setCourses(coursesData);
} else if (coursesData && Array.isArray(coursesData.results)) {
  setCourses(coursesData.results);
} else if (coursesData && Array.isArray(coursesData.data)) {
  setCourses(coursesData.data);
} else {
  console.warn('⚠️ Unexpected response format:', coursesData);
  setCourses([]);
}

setError(null);
} catch (err) {
console.error('❌ Error fetching courses:', err);
console.error('❌ Error details:', err.response?.data);
console.error('❌ Error status:', err.response?.status);
setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่');
setCourses([]);
} finally {
setLoading(false);
}
};

// const filterCourses = () => {
// let filtered = courses;

// if (searchTerm) {
//   filtered = filtered.filter(course =>
//     course.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
// }

// if (selectedLevel) {
//   filtered = filtered.filter(course => course.level === selectedLevel);
// }

// if (selectedCategory) {
//   filtered = filtered.filter(course => course.category === selectedCategory);
// }

// setFilteredCourses(filtered);
// };

const getUniqueLevels = () => {
if (!Array.isArray(courses)) return [];
return [...new Set(courses.map(course => course.level))];
};

const getUniqueCategories = () => {
if (!Array.isArray(courses)) return [];
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
    <h1 className="page-title">บทเรียน</h1>
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
      <p>แสดง {filteredCourses.length} จาก {courses.length} บทเรียน</p>
    </div>
  </div>

  {/* แสดงคอร์ส */}
  {filteredCourses.length === 0 ? (
    <div className="no-courses">
      <p>📭 ไม่พบบทเรียนที่ตรงกับเงื่อนไข</p>
    </div>
  ) : (
    <div className="course-grid">
      {filteredCourses.map((course) => (
        <div
          key={course.id}
          className="course-card"
          onClick={() => handleCourseClick(course.id)}
        >
          <div className="course-title">{course.name}</div>
          <div className="course-info"><strong>📊 ระดับ:</strong> {course.level}</div>
          <div className="course-info"><strong>🏷️ สายงาน:</strong> {course.category}</div>
          {course.description && (
            <div className="course-description">{course.description}</div>
          )}
        </div>
      ))}
    </div>
    
  )}
  {/* Footer */}
  <footer className="footer" role="contentinfo">
    <div>© {new Date().getFullYear()} DeafAbility</div>
    <div className="small">
      ติดต่อ: <a href="/contact">ติดต่อเรา</a>
    </div>
  </footer>
</div>


);
};

export default Courses;
