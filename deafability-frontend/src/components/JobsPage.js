// src/components/JobsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from './utils/api';

export default function JobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // data
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);

  // ui states
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  // filters (sync กับ query string)
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [pos, setPos] = useState(searchParams.get('position_type') || '');

  // โหลด list (รองรับ q / position_type)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = {};
        if (q) params.q = q;
        if (pos) params.position_type = pos;
        
        const res = await axios.get('/api/jobs/', { params });
        
        // **********************************************
        // 1. จุดแก้ไข: แปลง response ให้เป็น array ก่อน setJobs
        // ตรวจสอบว่าเป็น Array? ถ้าไม่ใช่ ให้ดูว่ามี .results มั้ย? ถ้าไม่มี ให้เป็น Array ว่าง []
        const items = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
        setJobs(items);
        // **********************************************
        
        setError(null);

        // sync query ใน URL
        const next = {};
        if (q) next.q = q;
        if (pos) next.position_type = pos;
        setSearchParams(next, { replace: true });

        // **********************************************
        // 2. จุดแก้ไข: อ้างอิง 'items' แทน 'res.data'
        // เลือกอัตโนมัติอันแรกถ้ายังไม่ได้เลือก
        if (!activeJob && items.length > 0) {
          handleSelect(items[0].id);
        } else if (items.length === 0) {
          setActiveJob(null);
        }
        // **********************************************

      } catch (e) {
        console.error(e);
        setError('ไม่สามารถโหลดรายการงานได้');
        // **********************************************
        // เพื่อความปลอดภัย ให้เคลียร์ jobs ด้วย
        setJobs([]); 
        // **********************************************
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, pos]);

  const handleSelect = async (jobId) => {
    try {
      setLoadingDetail(true);
      const res = await axios.get(`/api/jobs/${jobId}/`);
      setActiveJob(res.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // **********************************************
  // 3. จุดแก้ไข: useMemo เพื่อให้แน่ใจว่า jobs เป็น Array
  const positionOptions = useMemo(() => {
    const arr = Array.isArray(jobs) ? jobs : [];
    const set = new Set(arr.map(j => (j.position_type || '').trim()).filter(Boolean));
    return Array.from(set);
  }, [jobs]);
  // **********************************************

  return (
    <div className="container">
      {/* Header reuse เดิม */}
      <div className="header">
        <h1>💼 DeafAbility Jobs</h1>
        <p>ค้นหางานและคอร์สที่เกี่ยวข้องได้ในหน้าเดียว</p>
      </div>

      {/* แถบค้นหา/กรอง */}
      <div className="filter-section">
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
            {positionOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="filter-info">
          <p>รายการงาน: {jobs.length} รายการ</p>
        </div>
      </div>

      {/* แบ่ง 2 คอลัมน์: ซ้ายลิสต์ / ขวารายละเอียด */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 16 }}>
        {/* ซ้าย: ลิสต์งาน */}
        <div>
          {loading ? (
            <div className="loading"><h3>🔄 กำลังโหลดรายการงาน...</h3></div>
          ) : error ? (
            <div className="error"><p>❌ {error}</p></div>
          ) : jobs.length === 0 ? (
            <div className="no-courses"><p>📭 ไม่พบงานที่ตรงเงื่อนไข</p></div>
          ) : (
            <div className="course-grid" style={{ gridTemplateColumns: '1fr' }}>
              {jobs.map(job => {
                const isActive = activeJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    className="course-card"
                    onClick={() => handleSelect(job.id)}
                    style={{
                      border: isActive ? '2px solid #444' : undefined,
                      cursor: 'pointer'
                    }}
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
                );
              })}
            </div>
          )}
        </div>

        {/* ขวา: รายละเอียดงานที่เลือก */}
        <div>
          {!activeJob ? (
            <div className="no-courses"><p>เลือกงานทางซ้ายเพื่อดูรายละเอียด</p></div>
          ) : (
            <div className="course-detail-card">
              <h2 className="course-detail-title">{activeJob.title}</h2>
              <div className="course-detail-info">
                <div className="info-item">
                  <span className="info-label">🧭 ตำแหน่ง:</span>
                  <span className="info-value">{activeJob.position_type || '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🕒 สร้างเมื่อ:</span>
                  <span className="info-value">
                    {new Date(activeJob.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {loadingDetail ? (
                <p>กำลังโหลดรายละเอียด...</p>
              ) : (
                <>
                  {activeJob.description && (
                    <div className="course-description" style={{ marginTop: 12 }}>
                      <h3>📝 รายละเอียดงาน</h3>
                      <p>{activeJob.description}</p>
                    </div>
                  )}

                  <div className="lessons-section" style={{ marginTop: 16 }}>
                    <h3>📚 คอร์สที่เกี่ยวข้อง</h3>
                    {(!activeJob.courses || activeJob.courses.length === 0) ? (
                      <p>— ไม่มีคอร์สที่เชื่อมไว้ —</p>
                    ) : (
                      <div className="lessons-list">
                        {activeJob.courses.map((c, idx) => (
                          <div
                            key={c.id}
                            className="lesson-item"
                            onClick={() => navigate(`/course/${c.id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="lesson-number">{idx + 1}</div>
                            <div className="lesson-content">
                              <h4 className="lesson-title">{c.name}</h4>
                              <p className="lesson-description">
                                📊 {c.level} • 🏷️ {c.category}
                              </p>
                            </div>
                            <div className="lesson-arrow">→</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}