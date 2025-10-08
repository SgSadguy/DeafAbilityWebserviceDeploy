// src/components/JobsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from './utils/api';
import './JobsPage.css';
import logo from '../assets/logo_nobg.png';
import DropdownNav from './DropdownNav';

export default function JobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* -----------------------------
  Data states
  ----------------------------- */
  const [jobs, setJobs] = useState([]);

  /* -----------------------------
  UI & control states
  ----------------------------- */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -----------------------------
  Filters (sync with query string)
  ----------------------------- */
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [pos, setPos] = useState(searchParams.get('position_type') || '');

  /* -----------------------------
  Load job list
  ----------------------------- */
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const params = {};
        if (q) params.q = q;
        if (pos) params.position_type = pos;

        const res = await axios.get('/jobs/', { params });
        const items = Array.isArray(res.data) ? res.data : res.data?.results ?? [];

        setJobs(items);
        setError(null);

        // Sync query string
        const nextParams = {};
        if (q) nextParams.q = q;
        if (pos) nextParams.position_type = pos;
        setSearchParams(nextParams, { replace: true });
      } catch (e) {
        console.error(e);
        setError('ไม่สามารถโหลดรายการงานได้');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, pos]);

  /* -----------------------------
  Position type filter options
  ----------------------------- */
  const positionOptions = useMemo(() => {
    const arr = Array.isArray(jobs) ? jobs : [];
    const types = arr
      .map((j) => (j.position_type || '').trim())
      .filter(Boolean);
    return Array.from(new Set(types));
  }, [jobs]);

  /* -----------------------------
  Handlers
  ----------------------------- */
  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  /* -----------------------------
  Render
  ----------------------------- */
  return (
    <div className="home-container">
      {/* Header */}
      <header className="job-header" role="banner">
        <div className="brand">
          <img src={logo} alt="DeafAbility Logo" className="logo" />
        </div>
        <DropdownNav />
      </header>

      {/* Filters */}
      <div className="filter-section">
        <h1 className="page-title">Jobs</h1>

        <div className="filter-row">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 ค้นหา (ชื่องาน/รายละเอียด/ชื่อคอร์ส)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <select
            className="filter-select"
            value={pos}
            onChange={(e) => setPos(e.target.value)}
          >
            <option value="">🧭 ทุกตำแหน่ง</option>
            {positionOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-info">
          <p>รายการงาน: {jobs.length} รายการ</p>
        </div>
      </div>

      {/* Job list */}
      <div className="job-list">
        {loading ? (
          <div className="loading">
            <h3>🔄 กำลังโหลดรายการงาน...</h3>
          </div>
        ) : error ? (
          <div className="error">
            <p>❌ {error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="no-courses">
            <p>📭 ไม่พบงานที่ตรงเงื่อนไข</p>
          </div>
        ) : (
          <div className="course-grid">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="course-card"
                onClick={() => handleJobClick(job.id)}
              >
                <div className="course-title">{job.title}</div>
                <div className="course-info">
                  <strong>🧭 ตำแหน่ง:</strong> {job.position_type || '—'}
                </div>
                {job.description && (
                  <div className="course-description">
                    {job.description.length > 120
                      ? job.description.slice(0, 120) + '…'
                      : job.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="footer" role="contentinfo">
    <div>© {new Date().getFullYear()} DeafAbility</div>
    <div className="small">
      ติดต่อ: <a href="/contact">ติดต่อเรา</a>
    </div>
  </footer>
    </div>
  );
}
