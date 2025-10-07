import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './components/Home';
import VideoPlayer from './components/VideoPlayer';
import CourseDetail from './components/CourseDetail';
import Courses from './components/Courses';
import JobsPage from './components/JobsPage';
import './App.css';
import JobDetail from './components/JobDetail';
import Home2 from './components/Home2';

import axios from './components/utils/api';

function App() {
  useEffect(() => {
    axios.get('/api/csrf/').catch(() => {});
  }, []);
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home2 />} />
          <Route path="/jobs" element={<JobsPage />} />   
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/videoplayer/:courseId/:lessonId" element={<VideoPlayer />} />
          <Route path="/courses/:courseId" element={<VideoPlayer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
