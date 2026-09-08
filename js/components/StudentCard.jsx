import React from 'react';
import { STATUS_CONFIG, HOMEWORK_STATUS } from '../config/constants.js';
import { getStatusIcon } from './Icons.jsx';

export function StudentCard({ behaviors, student, record, onClick, onOpenRecord }) {
  const statusKey = record.attendance;
  const st = STATUS_CONFIG[statusKey];
  const hwCfg = HOMEWORK_STATUS[record.homework];

  const behaviorIcons = record.behaviors
    .map((bId) => behaviors.find((b) => b.id === bId))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className={`relative flex items-center p-3 bg-white rounded-xl shadow-sm border border-transparent hover:shadow-md active:scale-[0.98] ${
      statusKey !== 'PRESENT' ? st.color.replace('text-', 'border-').replace('bg-', 'ring-1 ring-') : 'hover:border-gray-200'
    }`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${st.color.replace('text-', 'bg-').split(' ')[0]}`}></div>

      {/* Main area: click to quick toggle */}
      <div className="flex-1 flex items-center cursor-pointer select-none min-w-0" onClick={onClick}>
        <div className="w-8 pl-2 font-mono text-gray-400 font-bold text-lg">{student.number || ''}</div>
        <div className="flex-1 px-2 min-w-0">
          <div className="font-bold text-gray-800 text-lg truncate">{student.name}</div>
          <div className="flex items-center gap-1 mt-0.5">
            {behaviorIcons.map((b) => (
              <span key={b.id} className="text-xs" title={b.label}>{b.icon}</span>
            ))}
            {record.behaviors.length > 4 && <span className="text-xs text-gray-400">+{record.behaviors.length - 4}</span>}
            {record.note && <span className="text-xs text-gray-400 ml-1" title={record.note}>📝</span>}
          </div>
        </div>
      </div>

      {/* Right side: homework + status button */}
      <div className="flex items-center gap-2">
        {hwCfg && hwCfg.id !== 'NONE' && (
          <span className="text-sm" title={hwCfg.label}>{hwCfg.icon}</span>
        )}
        <button onClick={(e) => { e.stopPropagation(); onOpenRecord(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${st.color}`}>
          {getStatusIcon(st.iconType, { size: 18 })}{st.label}
        </button>
      </div>
    </div>
  );
}
