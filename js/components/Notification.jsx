import React from 'react';
import { Icons } from './Icons.jsx';

export function Notification({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg z-[70] flex items-center gap-2">
      <Icons.Check size={16} className="text-green-400"/>{message}
    </div>
  );
}
