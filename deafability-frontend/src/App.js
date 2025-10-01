import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import VideoPlayer from './components/VideoPlayer';
import CourseDetail from './components/CourseDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/videoplayer/:courseId/:lessonId" element={<VideoPlayer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;