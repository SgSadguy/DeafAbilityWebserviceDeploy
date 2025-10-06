import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DropdownNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="nav-wrapper">
      <nav className="dropdown-nav">
        <button
          className="menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          ☰ 
        </button>
      </nav>

      {/* 👇 The dropdown content below the header */}
      {isOpen && (
        <div className="menu-dropdown">
          <button className="nav-link" onClick={() => navigate('/')}>หน้าแรก</button>
          <button className="nav-link" onClick={() => navigate('/courses')}>คอร์ส</button>
          <button className="nav-link" onClick={() => navigate('/jobs')}>งาน</button>
        </div>
      )}
    </div>
  );
};

export default DropdownNav;
