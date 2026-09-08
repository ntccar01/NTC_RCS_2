import React from 'react';
import { Icons } from './Icons.jsx';

export function BehaviorTags({ behaviors, selectedBehaviors, onToggle, onOpenManager }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-gray-500">課堂行為</h4>
        <button onClick={onOpenManager}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
          <Icons.Plus size={12}/> 新增
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {behaviors.map((b) => {
          const isActive = selectedBehaviors.includes(b.id);
          return (
            <button
              key={b.id}
              onClick={() => onToggle(b.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                isActive
                  ? `${b.color} ring-1 ring-offset-1 scale-105`
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{b.icon}</span>
              <span>{b.label}</span>
              {b.penalty < 0 && (
                <span className={`text-xs ml-0.5 ${isActive ? 'opacity-80' : 'opacity-40'}`}>
                  {b.penalty}
                </span>
              )}
              {b.bonus > 0 && (
                <span className={`text-xs ml-0.5 ${isActive ? 'opacity-80' : 'opacity-40'}`}>
                  +{b.bonus}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}