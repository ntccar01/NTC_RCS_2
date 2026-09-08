import React from 'react';
import { Icons } from './Icons.jsx';

const titles = {
  CLOUD_SETUP: '設定雲端連結',
  IMPORT: '匯入名單',
  COURSE: '新增課程',
  PERIOD: '設定節次',
};

const placeholders = {
  CLOUD_SETUP: 'https://script.google.com/macros/s/...',
  IMPORT: '格式：座號 姓名 (一行一位)',
  COURSE: '在此輸入課程名稱...',
  PERIOD: '早自習\n第一節\n第二節\n...',
};

const descriptions = {
  CLOUD_SETUP: '請貼上 Apps Script 網址：',
  IMPORT: '格式：座號 姓名 (一行一位)',
  COURSE: '每行一個課程名稱',
  PERIOD: '每行一個節次名稱',
};

export function ActionModals({ modalType, inputText, setInputText, onSubmit, onClose }) {
  if (!modalType) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="font-bold text-lg flex items-center gap-2">{titles[modalType]}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><Icons.X size={20}/></button>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          <p className="text-sm text-gray-500">{descriptions[modalType]}</p>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 min-h-[150px] p-3 bg-gray-50 border rounded-lg resize-none focus:outline-none font-mono text-sm"
            placeholder={placeholders[modalType]}
          />
        </div>
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onSubmit} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700">確認儲存</button>
        </div>
      </div>
    </div>
  );
}
