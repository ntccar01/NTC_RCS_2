import React from 'react';
import { STATUS_CONFIG } from '../config/constants.js';
import { Icons } from './Icons.jsx';
import { getStatusIcon } from './Icons.jsx';

export function StatusModal({ student, onSelect, onDelete, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 shadow-2xl m-0 md:m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-sm text-gray-500 font-mono">{student.number}</span>
            {student.name}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><Icons.X size={20}/></button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(STATUS_CONFIG).map((c) => (
            <button key={c.id} onClick={() => onSelect(c.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border hover:scale-105 active:scale-95 ${c.color.replace('bg-', 'hover:bg-').replace('text-', 'hover:text-')}`}>
              <div className="mb-2">{getStatusIcon(c.iconType, { size: 20 })}</div>
              <span className="font-bold text-sm">{c.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex justify-center">
          <button onClick={onDelete} className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-bold">
            <Icons.Trash2 size={16}/> 移除此學生
          </button>
        </div>
      </div>
    </div>
  );
}
