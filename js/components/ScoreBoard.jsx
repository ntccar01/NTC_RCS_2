import React, { useMemo, useState } from 'react';
import { Icons } from './Icons.jsx';
import { ATTENDANCE_RATE_THRESHOLDS } from '../config/constants.js';
import { sortStudents } from '../models/student.js';
import { getStudentFullStats } from '../models/record.js';

export function ScoreBoard({ behaviors, course, onClose }) {
  const [sortBy, setSortBy] = useState('score');
  const [sortDir, setSortDir] = useState('asc');
  const [expandedId, setExpandedId] = useState(null);

  const students = useMemo(() => sortStudents(course.students), [course.students]);

  const statsMap = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      map[s.id] = getStudentFullStats(course, s.id, behaviors);
    });
    return map;
  }, [course, students]);

  const sorted = useMemo(() => {
    const arr = [...students];
    arr.sort((a, b) => {
      const sa = statsMap[a.id];
      const sb = statsMap[b.id];
      let va, vb;
      if (sortBy === 'score') { va = sa.score; vb = sb.score; }
      else if (sortBy === 'attendance') { va = sa.attendance.rate; vb = sb.attendance.rate; }
      else if (sortBy === 'homework') { va = sa.homework.rate; vb = sb.homework.rate; }
      else { va = sa.behaviorCounts ? Object.values(sa.behaviorCounts).reduce((s, v) => s + v, 0) : 0;
             vb = sb.behaviorCounts ? Object.values(sb.behaviorCounts).reduce((s, v) => s + v, 0) : 0; }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return arr;
  }, [students, statsMap, sortBy, sortDir]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const getRateLabel = (rate) => {
    const t = ATTENDANCE_RATE_THRESHOLDS.find((t) => rate >= t.min);
    return t || ATTENDANCE_RATE_THRESHOLDS[ATTENDANCE_RATE_THRESHOLDS.length - 1];
  };

  const SortHeader = ({ field, label }) => (
    <button onClick={() => toggleSort(field)}
      className={`text-xs font-bold cursor-pointer hover:text-indigo-600 flex items-center gap-0.5 ${sortBy === field ? 'text-indigo-600' : 'text-gray-400'}`}>
      {label}
      {sortBy === field && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-t-2xl md:rounded-2xl shadow-2xl m-0 md:m-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Icons.ShieldCheck size={20} className="text-indigo-500"/> 績效排行榜
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><Icons.X size={20}/></button>
        </div>

        {/* Table Header */}
        <div className="px-4 py-2 border-b bg-gray-50 grid grid-cols-[2.5rem_1fr_4rem_4rem_4rem_4rem] gap-2 items-center">
          <span className="text-xs text-gray-400">#</span>
          <span className="text-xs text-gray-400">姓名</span>
          <SortHeader field="score" label="績效分"/>
          <SortHeader field="attendance" label="出勤率"/>
          <SortHeader field="homework" label="作業率"/>
          <SortHeader field="behaviors" label="行為數"/>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {sorted.map((s, i) => {
            const st = statsMap[s.id];
            const rateInfo = getRateLabel(st.attendance.rate);
            const isExpanded = expandedId === s.id;
            const behaviorCount = Object.values(st.behaviorCounts).reduce((sum, v) => sum + v, 0);

            return (
              <div key={s.id} className="border-b border-gray-100">
                <div className="px-4 py-3 grid grid-cols-[2.5rem_1fr_4rem_4rem_4rem_4rem] gap-2 items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                  <span className="text-sm text-gray-400 font-mono">{i + 1}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-gray-400">{s.number || ''}</span>
                    <span className="font-bold text-sm truncate">{s.name}</span>
                  </div>
                  <span className={`text-sm font-bold ${st.score > 0 ? 'text-green-600' : st.score < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {st.score > 0 ? '+' : ''}{st.score}
                  </span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${rateInfo.color} ${rateInfo.bg}`}>
                    {st.attendance.rate}%
                  </span>
                  <span className={`text-xs font-bold ${st.homework.rate >= 80 ? 'text-green-600' : st.homework.rate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {st.homework.total > 0 ? st.homework.rate + '%' : '-'}
                  </span>
                  <span className="text-xs text-gray-500">{behaviorCount}</span>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 bg-gray-50 text-xs space-y-2">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-gray-400">出席 </span>
                        <span className="font-bold text-green-600">{st.attendance.present}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">缺席 </span>
                        <span className="font-bold text-red-600">{st.attendance.absent}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">遲到 </span>
                        <span className="font-bold text-yellow-600">{st.attendance.late}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">早退 </span>
                        <span className="font-bold text-orange-600">{st.attendance.leaveEarly}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">假別 </span>
                        <span className="font-bold text-purple-600">{st.attendance.sick + st.attendance.personal + st.attendance.official}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {behaviors.map((b) => {
                        const count = st.behaviorCounts[b.id] || 0;
                        if (count === 0) return null;
                        return (
                          <span key={b.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded border text-gray-600">
                            {b.icon} {count}
                          </span>
                        );
                      })}
                      {behaviorCount === 0 && <span className="text-gray-400">無行為紀錄</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="p-8 text-center text-gray-400">尚無學生資料</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700">關閉</button>
        </div>
      </div>
    </div>
  );
}
