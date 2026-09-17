import React, { useState, useEffect } from 'react';
import { Icons } from './Icons.jsx';
import { STATUS_CONFIG, HOMEWORK_STATUS } from '../config/constants.js';
import { getStatusIcon } from './Icons.jsx';
import { BehaviorTags } from './BehaviorTags.jsx';
import { calcBehaviorScore } from '../models/record.js';

export function RecordPanel({ behaviors, student, record, onSetStatus, onToggleBehavior, onSetHomework, onSetNote, onUpdateStudent, onDelete, onClose, onOpenBehaviorManager }) {
  const [noteText, setNoteText] = useState(record.note);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editNumber, setEditNumber] = useState(student.number || '');
  const [editName, setEditName] = useState(student.name || '');
  const [editError, setEditError] = useState('');

  useEffect(() => { setNoteText(record.note); }, [record.note]);

  useEffect(() => {
  setEditNumber(student.number || '');
  setEditName(student.name || '');
  setEditError('');
  setIsEditingStudent(false);
}, [student.id, student.number, student.name]);

const handleSaveStudent = () => {
  if (!onUpdateStudent) return;

  const result = onUpdateStudent({
    number: editNumber,
    name: editName,
  });

  if (!result?.ok) {
    setEditError(result?.message || '修改失敗');
    return;
  }

  setEditError('');
  setIsEditingStudent(false);
};
  
  const behaviorScore = calcBehaviorScore(record.behaviors, behaviors);
  const homeworkCfg = HOMEWORK_STATUS[record.homework] || HOMEWORK_STATUS.NONE;

  const handleNoteBlur = () => {
    if (noteText !== record.note) onSetNote(noteText);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl m-0 md:m-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            {isEditingStudent ? (
  <div className="flex items-center gap-2 flex-wrap">
    <input
      value={editNumber}
      onChange={(e) => setEditNumber(e.target.value)}
      placeholder="座號"
      className="w-20 px-2 py-1 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
    />
    <input
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      placeholder="姓名"
      className="w-32 px-2 py-1 border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300"
    />
    <button
      onClick={handleSaveStudent}
      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
    >
      儲存
    </button>
    <button
      onClick={() => {
        setEditNumber(student.number || '');
        setEditName(student.name || '');
        setEditError('');
        setIsEditingStudent(false);
      }}
      className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-300"
    >
      取消
    </button>
  </div>
) : (
  <>
    <span className="px-2 py-0.5 bg-gray-200 rounded text-sm text-gray-500 font-mono">{student.number}</span>
    <h3 className="font-bold text-lg">{student.name}</h3>
    {onUpdateStudent && (
      <button
        onClick={() => setIsEditingStudent(true)}
        className="px-2 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
      >
        ✏️ 編輯
      </button>
    )}
  </>
)}
            {behaviorScore !== 0 && (
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${behaviorScore > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {behaviorScore > 0 ? '+' : ''}{behaviorScore} 分
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><Icons.X size={20}/></button>
        </div>

        {editError && (
  <div className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold border-b">
    ⚠️ {editError}
  </div>
)}
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Attendance Status */}
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-2">出缺席</h4>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(STATUS_CONFIG).map((c) => (
                <button key={c.id} onClick={() => onSetStatus(c.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                    record.attendance === c.id
                      ? `${c.color} ring-2 ring-offset-1 scale-105`
                      : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                  }`}>
                  {getStatusIcon(c.iconType, { size: 16 })}
                  <span className="mt-1">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Behavior Tags */}
          <BehaviorTags behaviors={behaviors} selectedBehaviors={record.behaviors} onToggle={onToggleBehavior} onOpenManager={onOpenBehaviorManager} />

          {/* Homework Status */}
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-2">作業狀態</h4>
            <div className="flex gap-2">
              {Object.values(HOMEWORK_STATUS).map((hw) => (
                <button key={hw.id} onClick={() => onSetHomework(hw.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                    record.homework === hw.id
                      ? `${hw.color} ring-2 ring-offset-1 scale-105`
                      : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                  }`}>
                  <span>{hw.icon}</span>
                  <span>{hw.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-2">教師備註</h4>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="記錄這位同學本節課的表現..."
              className="w-full p-3 bg-gray-50 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl space-y-3">
          {onDelete && (
            <button onClick={() => { if (confirm(`確定要將「${student.name}」從名單中移除嗎？`)) { onDelete(); onClose(); } }}
              className="flex items-center justify-center gap-2 w-full py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold">
              <Icons.Trash2 size={16}/> 移除此學生
            </button>
          )}
          <button onClick={onClose} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700">完成</button>
        </div>
      </div>
    </div>
  );
}
