import React from 'react';
import './Profile.css'; // ต้องสร้างไฟล์ CSS นี้แยกต่างหาก

// 1. กำหนดข้อมูล Profile
const profileData = {
    name: "สมหญิง ใจดี",
    title: "นักพัฒนาเว็บไซต์มือใหม่",
    email: "somying.dev@example.com",
    imageURL: "https://via.placeholder.com/100" 
};

function ProfileCard() {
    return (
        // 2. ใช้ข้อมูลใน JSX โดยตรง
        <div className="profile-card">
            <img 
                className="profile-img" 
                src={profileData.imageURL} 
                alt="รูปโปรไฟล์"
            />
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-title">{profileData.title}</p>
            <div className="contact">
                <p>ติดต่อ: <span>{profileData.email}</span></p>
            </div>
        </div>
    );
}

export default ProfileCard;