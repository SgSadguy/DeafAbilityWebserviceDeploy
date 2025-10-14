import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import DropdownNav from './DropdownNav';
import logo from '../assets/logo_nobg.png';
import course_icon from '../assets/course_icon.png';
import job_icon from '../assets/job_icon.png';
import profile_icon from '../assets/profile_icon.png'

const Home = () => {
const navigate = useNavigate();

const goToCourseDetail = () => {
// navigates to course detail (example id = 1). Change id as needed.
navigate('/courses');
};

const goToJobs = () => {
navigate('/profile');
};

return ( <div className="home-container">
  <header className="header" role="banner"> 
      <div className="brand"> 
          <img src={logo} alt="DeafAbility Logo" className="logo" />
      </div>


      <DropdownNav />
  </header>

  {/* Main content */}
  <main className="main" role="main">
    <h2 className="hero-title">เลือกสิ่งที่คุณสนใจ</h2>

    <div className="buttons">
      <button
        className="big-btn course"
        onClick={goToCourseDetail}
        aria-label="ไปยังรายละเอียดคอร์ส"
      >
        <img src={course_icon} alt="Course Icon" className="icon" />
        รวมบทเรียน
      </button>

      <button
        className="big-btn profile"
        onClick={goToJobs}
        aria-label="ไปยังหน้าหางาน"
      >
        <img src={profile_icon} alt="Profile Icon" className="icon" />
        ผู้ใช้งาน
      </button>
    </div>
  </main>

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

export default Home;
