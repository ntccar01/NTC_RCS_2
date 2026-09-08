import React, { useMemo } from 'react';
import { Icons } from './Icons.jsx';
import { CHART_COLORS } from '../config/constants.js';
import { sortStudents } from '../models/student.js';
import { getDailyTrend, getBehaviorDistribution, getHomeworkStats } from '../models/record.js';

function BarChart({ data, maxVal, colorFn, labelKey, valueKey, height = 120 }) {
  const max = maxVal || Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => {
        const h = Math.max((d[valueKey] / max) * (height - 20), 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-gray-500">{d[valueKey]}</span>
            <div className="w-full rounded-t" style={{ height: h, backgroundColor: colorFn(d, i) }}></div>
            <span className="text-[9px] text-gray-400 truncate w-full text-center">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments, size = 100 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const gradientParts = segments.map((seg) => {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = (cumulative / total) * 360;
    return `${seg.color} ${start}deg ${end}deg`;
  });
  const gradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full" style={{ background: gradient }}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-full" style={{ width: size * 0.55, height: size * 0.55 }}></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700">{total}</span>
      </div>
    </div>
  );
}

function TrendChart({ data, height = 100 }) {
  if (data.length === 0) return <div className="text-gray-400 text-sm">尚無資料</div>;
  const maxRate = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = 100 - (d.rate / maxRate) * 100;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div>
      <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
        <polygon points={areaPoints} fill="rgba(99,102,241,0.1)"/>
        <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
      </svg>
      <div className="flex justify-between text-[9px] text-gray-400 mt-1">
        <span>{data[0]?.date?.slice(5) || ''}</span>
        <span>{data[data.length - 1]?.date?.slice(5) || ''}</span>
      </div>
    </div>
  );
}

export function StatsPanel({ behaviors, course, onClose }) {
  const students = useMemo(() => sortStudents(course.students), [course.students]);

  const dailyTrend = useMemo(() => getDailyTrend(course, students, []), [course, students]);
  const behaviorDist = useMemo(() => getBehaviorDistribution(course, students, behaviors), [course, students, behaviors]);
  const hwStats = useMemo(() => getHomeworkStats(course, students), [course, students]);

  const totalPresent = dailyTrend.reduce((s, d) => s + d.present, 0);
  const totalAbsent = dailyTrend.reduce((s, d) => s + d.absent, 0);
  const totalOther = dailyTrend.reduce((s, d) => s + d.other, 0);
  const totalRecords = totalPresent + totalAbsent + totalOther || 1;
  const avgRate = dailyTrend.length > 0 ? Math.round(dailyTrend.reduce((s, d) => s + d.rate, 0) / dailyTrend.length) : 100;

  const attendanceSegments = [
    { label: '出席', value: totalPresent, color: CHART_COLORS.PRESENT },
    { label: '缺席', value: totalAbsent, color: CHART_COLORS.ABSENT },
    { label: '其他', value: totalOther, color: CHART_COLORS.LATE },
  ];

  const hwSegments = [
    { label: '已交', value: hwStats.DONE, color: '#22c55e' },
    { label: '未交', value: hwStats.NOT_DONE, color: '#ef4444' },
    { label: '補交', value: hwStats.LATE, color: '#eab308' },
  ];

  const topBehaviors = behaviorDist.filter((b) => b.count > 0).slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-t-2xl md:rounded-2xl shadow-2xl m-0 md:m-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Icons.Monitor size={20} className="text-indigo-500"/> 課堂統計
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><Icons.X size={20}/></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600">{course.students.length}</div>
              <div className="text-xs text-indigo-400">學生總數</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{avgRate}%</div>
              <div className="text-xs text-green-400">平均出勤率</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{dailyTrend.length}</div>
              <div className="text-xs text-amber-400">紀錄天數</div>
            </div>
          </div>

          {/* Attendance Donut */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-600 mb-3">出缺席分佈</h4>
            <div className="flex items-center gap-6">
              <DonutChart segments={attendanceSegments} size={100}/>
              <div className="flex-1 space-y-1.5">
                {attendanceSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: seg.color }}></div>
                      <span className="text-gray-600">{seg.label}</span>
                    </div>
                    <span className="font-bold text-gray-700">{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance Trend */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-600 mb-3">出勤率趨勢</h4>
            {dailyTrend.length > 0 ? (
              <TrendChart data={dailyTrend} height={80}/>
            ) : (
              <div className="text-gray-400 text-sm text-center py-4">尚無資料</div>
            )}
          </div>

          {/* Behavior Distribution */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-600 mb-3">行為紀錄分佈</h4>
            {topBehaviors.length > 0 ? (
              <BarChart
                data={topBehaviors}
                maxVal={Math.max(...topBehaviors.map((b) => b.count))}
                colorFn={(b) => b.bonus > 0 ? '#22c55e' : '#f97316'}
                labelKey="icon"
                valueKey="count"
                height={100}
              />
            ) : (
              <div className="text-gray-400 text-sm text-center py-4">尚無行為紀錄</div>
            )}
          </div>

          {/* Homework Stats */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-600 mb-3">作業繳交統計</h4>
            <div className="flex items-center gap-6">
              {hwStats.DONE + hwStats.NOT_DONE + hwStats.LATE > 0 ? (
                <React.Fragment>
                  <DonutChart segments={hwSegments} size={80}/>
                  <div className="flex-1 space-y-1.5">
                    {hwSegments.map((seg) => (
                      <div key={seg.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: seg.color }}></div>
                          <span className="text-gray-600">{seg.label}</span>
                        </div>
                        <span className="font-bold text-gray-700">{seg.value}</span>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              ) : (
                <div className="text-gray-400 text-sm text-center py-2 w-full">尚無作業紀錄</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700">關閉</button>
        </div>
      </div>
    </div>
  );
}
