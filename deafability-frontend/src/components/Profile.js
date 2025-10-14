import React from 'react';
import './Profile.css';
import DropdownNav from './DropdownNav';
import logo from '../assets/logo_nobg.png';
import womanPlaceholder from '../assets/womanPlaceholder.png';
import exampleCourseCover from '../assets/ป.png';

const profileData = {
  name: "สมหญิง",
  age: 22,
  education: "อนุปริญญา",
  interested_job: "งานธุรการ",
  email: "somyi@example.com",
  imageURL: "https://via.placeholder.com/150"
};

// 🔹 Mock completed course (demo only)
const completedCourse = {
  id: 1,
  name: "การสื่อสารธุรกิจเบื้องต้น",
  level: "ง่าย",
  category: "การสื่อสาร",
  description: "บทเรียนนี้ออกแบบมาสำหรับผู้พิการทางการได้ยิน.....",
  cover_url: "",
  progress: 100
};

function ProfileCard() {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="header" role="banner">
        <div className="brand">
          <img src={logo} alt="DeafAbility Logo" className="logo" />
        </div>
        <DropdownNav />
      </header>

      {/* Profile Section */}
      <main className="profile-container">
        <div className="profile-card">
          <img
            className="profile-img"
            src={womanPlaceholder}
            alt={`รูปโปรไฟล์ของ ${profileData.name}`}
          />
          <h1 className="profile-name">{profileData.name}</h1>

          <div className="profile-info">
            <p><strong>อายุ:</strong> {profileData.age} ปี</p>
            <p><strong>การศึกษา:</strong> {profileData.education}</p>
            <p><strong>งานที่สนใจ:</strong> {profileData.interested_job}</p>
          </div>

          <div className="contact">
            <p>
              <strong>ติดต่อ:</strong> <span>{profileData.email}</span>
            </p>
          </div>

          <h2 className="past-courses-head">🎓 บทเรียนที่ฉันเรียนสำเร็จ</h2>

          {/* Completed Course Card */}
          <div className="course-card-fancy">
            <div className="card-image-wrapper">
              <img
                src={exampleCourseCover}
                alt={completedCourse.name}
                className="course-image"
              />
              <div className="card-icons">
                <span className="icon-item">📊 {completedCourse.level}</span>
                <span className="icon-item">🏷️ {completedCourse.category}</span>
              </div>
            </div>

            <div className="card-content">
              <h3 className="course-title">{completedCourse.name}</h3>
              <p className="course-desc">{completedCourse.description}</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${completedCourse.progress}%` }}
                ></div>
              </div>
              <p className="progress-text">เรียนครบ {completedCourse.progress}% ✅</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfileCard;
