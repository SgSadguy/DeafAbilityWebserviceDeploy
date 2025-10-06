import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import DropdownNav from './DropdownNav';
import logo from '../assets/logo_nobg.png';
import course_icon from '../assets/course_icon.png';
import job_icon from '../assets/job_icon.png';

const Home = () => {
const navigate = useNavigate();

const goToCourseDetail = () => {
// navigates to course detail (example id = 1). Change id as needed.
navigate('/course/1');
};

const goToJobs = () => {
navigate('/jobs');
};

return ( <div className="home-container">
{/* Header */} <header className="header" role="banner"> 
                <div className="brand"> 
                    <img src={logo} alt="DeafAbility Logo" className="logo" />
                </div>

    {/* Dropdown Navbar */}

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
        รวมคอร์ส
      </button>

      <button
        className="big-btn job"
        onClick={goToJobs}
        aria-label="ไปยังหน้าหางาน"
      >
        <img src={job_icon} alt="Job Icon" className="icon" />
        หางาน
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
