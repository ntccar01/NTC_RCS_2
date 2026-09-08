import React, { useState } from 'react';
import { Icons } from './Icons.jsx';
import { DEFAULT_BEHAVIORS } from '../config/constants.js';

const EMOJI_LIST = ['📱','😴','🗣️','😵','💬','🍔','🚶','🙋','🤝','💡','📚','✏️','🎒','🖊️','😠','🫥','🎧','📖','💤','🎮'];

const COLOR_LIST = [
  'bg-red-50 text-red-600 border-red-200',
  'bg-orange-50 text-orange-600 border-orange-200',
  'bg-yellow-50 text-yellow-600 border-yellow-200',
  'bg-amber-50 text-amber-600 border-amber-200',
  'bg-green-50 text-green-600 border-green-200',
  'bg-blue-50 text-blue-600 border-blue-200',
  'bg-indigo-50 text-indigo-600 border-indigo-200',
  'bg-purple-50 text-purple-600 border-purple-200',
  'bg-pink-50 text-pink-600 border-pink-200',
  'bg-cyan-50 text-cyan-600 border-cyan-200',
];

export function BehaviorManager({ customBehaviors, addCustomBehavior, deleteCustomBehavior, onClose }) {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('📱');
  const [score, setScore] = useState(0);
  const [isBonus, setIsBonus] = useState(false);

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const penalty = isBonus ? 0 : -Math.abs(score);
    const bonus = isBonus ? Math.abs(score) : 0;
    const newBehavior = {
      id: 'b_' + Date.now() + Math.random(),
      label: trimmed,
      icon: icon || '⭐',
      penalty,
      bonus,
      color: COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)],
    };
    if (addCustomBehavior(newBehavior)) {
      setLabel(''); setScore(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end md:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl m-0 md:m-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="font-bold text-lg flex items-center gap-2"><Icons.Plus size={18}/> 管理行為項目</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><Icons.X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Add form */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-gray-600 mb-1">新增行為</h4>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="行為名稱（例：塗鴉、代班代答）"
              className="w-full p-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_LIST.map((em) => (
                <button key={em} onClick={() => setIcon(em)}
                  className={`w-8 h-8 text-lg rounded flex items-center justify-center ${icon === em ? 'bg-indigo-100 ring-2 ring-indigo-300' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {em}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <select value={isBonus ? 'bonus' : (score < 0 ? 'minus' : 'zero')}
                onChange={(e) => { setIsBonus(e.target.value === 'bonus'); setScore(0); }}
                className="p-2 border rounded-lg text-sm bg-white">
                <option value="minus">扣分</option>
                <option value="bonus">加分</option>
                <option value="zero">不分</option>
              </select>
              <input type="number" min="1" max="20" value={Math.abs(score)}
                onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                disabled={!isBonus && score === 0 ? false : false}
                className="w-20 p-2 border rounded-lg text-sm text-center bg-white"
              />
              <span className="text-sm text-gray-500">分</span>
            </div>
            <button onClick={handleAdd}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700">
              ＋ 新增行為
            </button>
          </div>

          {/* Custom behaviors list */}
          <div>
            <h4 className="text-sm font-bold text-gray-600 mb-2">自訂行為（{customBehaviors.length}）</h4>
            {customBehaviors.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">尚無自訂行為</p>
            ) : (
              <div className="space-y-2">
                {customBehaviors.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{b.icon}</span>
                      <span className="font-bold text-sm">{b.label}</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${b.bonus > 0 ? 'bg-green-100 text-green-600' : b.penalty < 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {b.bonus > 0 ? '+' + b.bonus : (b.penalty < 0 ? b.penalty : '0')}
                      </span>
                    </div>
                    <button onClick={() => deleteCustomBehavior(b.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><Icons.Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700">完成</button>
        </div>
      </div>
    </div>
  );
}