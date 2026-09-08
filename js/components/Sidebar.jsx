import React, { useState } from 'react';
import { Icons } from './Icons.jsx';
import { backupReport, syncUpload, syncDownload, syncBehaviorsUpload, syncBehaviorsDownload } from '../services/cloudSync.js';

export function Sidebar({
  courses, activeCourseId, setActiveCourseId,
  periodConfig, scriptUrl, setScriptUrl, setPeriodConfig,
  addNewCourse, deleteCourse,
  setModalType, setInputText, setIsSidebarOpen,
  setCourses, showToast,
  onOpenScoreBoard, onOpenStatsPanel, onSyncBehaviors,
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCloudSyncUpload = async () => {
    if (!scriptUrl) { setModalType('CLOUD_SETUP'); return; }
    if (!window.confirm('⚠️ 確定要將「目前所有的課程、學生、紀錄」上傳覆蓋雲端存檔嗎？')) return;
    setIsSyncing(true);
    try {
      await syncUpload(scriptUrl, courses, periodConfig);
      showToast('⬆️ 設定已上傳至雲端！');
    } catch (e) { showToast('❌ 上傳失敗'); }
    finally { setIsSyncing(false); }
  };

  const handleCloudSyncDownload = async () => {
    if (!scriptUrl) { setModalType('CLOUD_SETUP'); return; }
    if (!window.confirm('⚠️ 警告：確定要從雲端還原資料嗎？\n(這將會「清除並覆蓋」您目前手機上的所有資料！)')) return;
    setIsSyncing(true);
    try {
      const data = await syncDownload(scriptUrl);
      if (data.result === 'empty') {
        showToast('☁️ 雲端尚無備份資料');
      } else if (data.courses) {
        setCourses(data.courses);
        if (data.periodConfig) setPeriodConfig(data.periodConfig);
        if (!data.courses.find((c) => c.id === activeCourseId)) {
          setActiveCourseId(data.courses[0].id);
        }
        showToast('⬇️ 資料還原成功！');
        setIsSidebarOpen(false);
      } else {
        showToast('❌ 雲端資料格式錯誤');
      }
    } catch (e) {
      showToast('❌ 下載失敗 (請檢查網址或權限)');
    } finally { setIsSyncing(false); }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (courses.length <= 1) return;
    if (confirm('刪除課程？')) deleteCourse(id);
  };

  const openSettings = (type, defaultText) => {
    setInputText(defaultText);
    setModalType(type);
    setIsSidebarOpen(false);
  };

  return (
    <React.Fragment>
      <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
        <h2 className="font-bold text-slate-700 flex items-center gap-2"><Icons.BookOpen size={18}/> 課程</h2>
        <button onClick={() => setModalType('COURSE')} className="p-1.5 bg-indigo-100 text-indigo-600 rounded"><Icons.Plus size={18}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {courses.map((c) => (
          <div key={c.id} onClick={() => { setActiveCourseId(c.id); setIsSidebarOpen(false); }}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer ${activeCourseId === c.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-100 text-gray-600'}`}>
            <span className="truncate">{c.name}</span>
            <div className="flex items-center gap-2">
              {activeCourseId === c.id && <Icons.Check size={16}/>}
              <button onClick={(e) => handleDelete(e, c.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Icons.Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t space-y-2 bg-gray-50">
        <div className="text-xs font-bold text-gray-400 uppercase mb-1">雲端同步 (換裝置用)</div>
        <button disabled={isSyncing} onClick={handleCloudSyncUpload}
          className="flex items-center w-full gap-3 p-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
          {isSyncing ? <span className="spinner"></span> : <Icons.Save size={16}/>} 上傳設定 (備份到雲端)
        </button>
        <button disabled={isSyncing} onClick={handleCloudSyncDownload}
          className="flex items-center w-full gap-3 p-3 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100">
          {isSyncing ? <span className="spinner"></span> : <Icons.Download size={16}/>} 下載設定 (從雲端還原)
        </button>
        <button disabled={isSyncing} onClick={onSyncBehaviors}
          className="flex items-center w-full gap-3 p-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100">
          {isSyncing ? <span className="spinner"></span> : <Icons.RefreshCw size={16}/>} 同步行為設定
        </button>
        <hr className="my-2"/>
        <button onClick={() => openSettings('CLOUD_SETUP', scriptUrl)}
          className={`flex items-center w-full gap-3 p-3 text-sm font-medium border rounded-lg ${scriptUrl ? 'text-green-700 bg-green-50' : 'text-gray-700 bg-white'}`}>
          <Icons.Settings size={16}/>{scriptUrl ? '已連結 Google' : '設定雲端連結'}
        </button>
        <button onClick={() => openSettings('PERIOD', periodConfig.join('\n'))}
          className="flex items-center w-full gap-3 p-3 text-sm font-medium text-gray-700 bg-white border rounded-lg">
          <Icons.List size={16}/> 設定節次
        </button>
        <button onClick={() => { setModalType('IMPORT'); setIsSidebarOpen(false); }}
          className="flex items-center w-full gap-3 p-3 text-sm font-medium text-gray-700 bg-white border rounded-lg">
          <Icons.Upload size={16}/> 匯入名單
        </button>
        <hr className="my-2"/>
        <div className="text-xs font-bold text-gray-400 uppercase mb-1">成績統計</div>
        <button onClick={() => { onOpenScoreBoard(); setIsSidebarOpen(false); }}
          className="flex items-center w-full gap-3 p-3 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100">
          <Icons.ShieldCheck size={16}/> 績效排行榜
        </button>
        <button onClick={() => { onOpenStatsPanel(); setIsSidebarOpen(false); }}
          className="flex items-center w-full gap-3 p-3 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
          <Icons.Monitor size={16}/> 課堂統計圖表
        </button>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden w-full py-2 text-center text-gray-500 bg-gray-200 rounded mt-2">關閉</button>
      </div>
    </React.Fragment>
  );
}
