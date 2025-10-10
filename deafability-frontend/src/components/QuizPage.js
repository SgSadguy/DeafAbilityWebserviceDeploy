import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './utils/api';
import './QuizPage.css';

const PAGE_SIZE = 2;

function QuestionBlock({ q, value, onChange, onCheck }) {
  const toggleWord = (w) => {
    if (value.includes(w)) {
      onChange(value.filter(x => x !== w));
    } else {
      onChange([...value, w]);
    }
  };
  return (
    <div className="q-card">
      <div className="q-title">{q.prompt}</div>
      <div className="q-words">
        {(q.words || []).map((w, i) => (
          <button
            key={i}
            className={`q-word ${value.includes(w) ? 'is-picked' : ''}`}
            onClick={() => toggleWord(w)}
            type="button"
          >
            {w}
          </button>
        ))}
      </div>
      <div className="q-answer">ประโยคของคุณ: {value.join(' ') || '—'}</div>
      <button className="q-check" type="button" onClick={() => onCheck(q.id, value)}>
        ตรวจคำตอบ
      </button>
    </div>
  );
}

export default function QuizPage() {
  const { courseId } = useParams(); // ใช้ route /quiz/:courseId
  const navigate = useNavigate();

  const [all, setAll] = useState([]);         // คำถามทั้งหมดของคอร์ส
  const [page, setPage] = useState(0);        // หน้าเริ่มที่ 0
  const [answers, setAnswers] = useState({}); // เก็บคำตอบเลือกของแต่ละข้อ { [id]: string[] }
  const [result, setResult] = useState({});   // เก็บผลตรวจ { [id]: true/false }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/quiz/questions/?course=${courseId}`);
        const list = Array.isArray(res.data) ? res.data : [];
        setAll(list);
        setAnswers({}); setResult({});
        setPage(0);
        setErr('');
      } catch (e) {
        setErr('โหลดคำถามไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const totalPages = Math.max(1, Math.ceil((all.length || 0) / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  }, [all, page]);

  const setAnswer = (qid, val) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const checkOne = async (qid, val) => {
    try {
      const r = await axios.post(`/api/quiz/questions/${qid}/check/`, { answer: val });
      setResult(prev => ({ ...prev, [qid]: !!r.data?.correct }));
    } catch {
      setResult(prev => ({ ...prev, [qid]: false }));
    }
  };

  const checkPage = async () => {
    // ตรวจทุกข้อในหน้านี้
    await Promise.all(pageItems.map(q => checkOne(q.id, answers[q.id] || [])));
  };

  if (loading) return <div className="quiz-wrap"><p>กำลังโหลด...</p></div>;
  if (err) return <div className="quiz-wrap"><p style={{color:'crimson'}}>{err}</p></div>;
  if (!all.length) return <div className="quiz-wrap"><p>ยังไม่มีคำถามในคอร์สนี้</p></div>;

  return (
    <div className="quiz-wrap">
      <div className="quiz-bar">
        <button onClick={() => navigate(-1)} type="button">← กลับ</button>
        <div className="spacer" />
        <div>หน้า {page + 1} / {totalPages}</div>
      </div>

      {pageItems.map(q => (
        <div key={q.id}>
          <QuestionBlock
            q={q}
            value={answers[q.id] || []}
            onChange={(v) => setAnswer(q.id, v)}
            onCheck={checkOne}
          />
          {q.id in result && (
            <div className={`q-result ${result[q.id] ? 'ok' : 'no'}`}>
              {result[q.id] ? '✅ ถูกต้อง' : '❌ ยังไม่ถูก ลองใหม่'}
            </div>
          )}
        </div>
      ))}

      <div className="quiz-actions">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage(p => Math.max(0, p - 1))}
        >
          ← ก่อนหน้า
        </button>

        <button type="button" onClick={checkPage}>ตรวจคำตอบในหน้านี้</button>

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
        >
          ถัดไป →
        </button>
      </div>
    </div>
  );
}
