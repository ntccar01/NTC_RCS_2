import React from 'react';
import { Icons } from './Icons.jsx';

export function Header({
  activeCourseName, currentDate, setCurrentDate,
  currentPeriod, setCurrentPeriod, periodConfig, stats,
  setIsSidebarOpen,
}) {
  return (
    <header className="bg-slate-800 text-white shadow-lg z-20">
      <div className="flex justify-between items-center p-3 lg:px-6">
        <div className="flex items-center gap-2 overflow-hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-700 rounded-full"><Icons.Menu size={20}/></button>
          <div className="font-bold text-lg truncate max-w-[150px] md:max-w-xs">{activeCourseName}</div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-slate-700 rounded-lg px-2 py-1 border border-slate-600">
            <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent text-white border-none outline-none text-xs w-[85px] cursor-pointer"/>
          </div>
          <div className="relative">
            <select value={currentPeriod} onChange={(e) => setCurrentPeriod(e.target.value)}
              className="appearance-none bg-indigo-600 text-white pl-3 pr-8 py-1 rounded-lg text-sm font-bold border border-indigo-500 cursor-pointer">
              {periodConfig.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-200"><Icons.Clock size={12}/></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-px bg-slate-700 border-t border-slate-600 text-center py-2">
        <div><span className="text-[10px] text-slate-400 block">應到</span><span className="text-lg font-bold text-slate-300">{stats.t}</span></div>
        <div><span className="text-[10px] text-slate-400 block">實到</span><span className="text-lg font-bold text-green-400">{stats.p}</span></div>
        <div><span className="text-[10px] text-slate-400 block">缺席</span><span className="text-lg font-bold text-red-400">{stats.a}</span></div>
        <div><span className="text-[10px] text-slate-400 block">其他</span><span className="text-lg font-bold text-yellow-400">{stats.o}</span></div>
      </div>
    </header>
  );
}
