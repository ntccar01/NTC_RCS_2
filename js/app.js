import React, { useState, useMemo } from 'react';
import { DEFAULT_PERIODS } from './config/constants.js';
import { useCourses } from './hooks/useCourses.js';
import { useNotification } from './hooks/useNotification.js';
import { sortStudents } from './models/student.js';
import { getPeriodStats, getFullRecord } from './models/record.js';
import { backupReport } from './services/cloudSync.js';
import { generateReport, copyToClipboard } from './utils/report.js';
import { Sidebar } from './components/Sidebar.jsx';
import { Header } from './components/Header.jsx';
import { StudentCard } from './components/StudentCard.jsx';
import { ActionModals } from './components/ActionModals.jsx';
import { RecordPanel } from './components/RecordPanel.jsx';
import { ScoreBoard } from './components/ScoreBoard.jsx';
import { StatsPanel } from './components/StatsPanel.jsx';
import { BehaviorManager } from './components/BehaviorManager.jsx';
import { Notification } from './components/Notification.jsx';
import { Icons } from './components/Icons.jsx';

export function App() {
  const {
    courses, setCourses,
    activeCourse, activeCourseId, setActiveCourseId,
    periodConfig, setPeriodConfig,
    scriptUrl, setScriptUrl,
    behaviors, customBehaviors, addCustomBehavior, deleteCustomBehavior,
    addNewCourse, deleteCourse,
    importStudents, deleteStudent,
    setStudentStatus, quickToggleStudent,
    toggleStudentBehavior, setStudentHomework, setStudentNoteText,
    updateActiveCourse,
  } = useCourses();

  const { notification, showToast } = useNotification();

  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentPeriod, setCurrentPeriod] = useState(() => (DEFAULT_PERIODS[1] || DEFAULT_PERIODS[0]));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [recordPanelStudent, setRecordPanelStudent] = useState(null);
  const [isScoreBoardOpen, setIsScoreBoardOpen] = useState(false);
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);
  const [isBehaviorManagerOpen, setIsBehaviorManagerOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const sortedStudents = useMemo(() => sortStudents(activeCourse.students), [activeCourse.students]);
  const stats = useMemo(
    () => getPeriodStats(activeCourse.students, activeCourse.records, currentDate, currentPeriod),
    [activeCourse.students, activeCourse.records, currentDate, currentPeriod]
  );

  const handleQuickToggle = (studentId) => quickToggleStudent(studentId, currentDate, currentPeriod);

  const handleModalSubmit = () => {
    if (modalType !== 'CLOUD_SETUP' && !inputText.trim()) return;
    if (modalType === 'IMPORT') {
      importStudents(inputText);
      showToast('已匯入學生');
    } else if (modalType === 'COURSE') {
      addNewCourse(inputText.split(/\n/).map((l) => l.trim()).filter((l) => l));
      showToast('已新增課程');
    } else if (modalType === 'PERIOD') {
      setPeriodConfig(inputText.split(/\n/).map((l) => l.trim()).filter((l) => l));
      showToast('節次已更新');
    } else if (modalType === 'CLOUD_SETUP') {
      setScriptUrl(inputText.trim());
      showToast('連結已儲存');
    }
    setModalType(null);
    setInputText('');
  };

  const handleBackupReport = async () => {
    if (!scriptUrl) { setModalType('CLOUD_SETUP'); return; }
    if (!window.confirm(`確定備份「${activeCourse.name} ${currentDate}」報表至雲端？`)) return;
    setIsUploading(true);
    try {
      await backupReport(scriptUrl, activeCourse, currentDate, currentPeriod);
      showToast('☁️ 報表已備份 (請查看試算表)');
    } catch (e) { showToast('❌ 備份失敗'); }
    finally { setIsUploading(false); }
  };

  const handleCopyReport = () => {
    const report = generateReport(activeCourse, currentDate, currentPeriod);
    copyToClipboard(report);
    showToast('報表已複製 (隱私保護)');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r shadow-sm z-30">
        <Sidebar
          courses={courses} activeCourseId={activeCourseId} setActiveCourseId={setActiveCourseId}
          periodConfig={periodConfig} scriptUrl={scriptUrl} setScriptUrl={setScriptUrl}
          setPeriodConfig={setPeriodConfig} addNewCourse={addNewCourse} deleteCourse={deleteCourse}
          setModalType={setModalType} setInputText={setInputText} setIsSidebarOpen={setIsSidebarOpen}
          setCourses={setCourses} showToast={showToast}
          onOpenScoreBoard={() => setIsScoreBoardOpen(true)}
          onOpenStatsPanel={() => setIsStatsPanelOpen(true)}
        />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          activeCourseName={activeCourse.name}
          currentDate={currentDate} setCurrentDate={setCurrentDate}
          currentPeriod={currentPeriod} setCurrentPeriod={setCurrentPeriod}
          periodConfig={periodConfig} stats={stats}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Mobile Sidebar Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="bg-white w-72 shadow-2xl flex flex-col h-full animate-slide-in">
              <Sidebar
                courses={courses} activeCourseId={activeCourseId} setActiveCourseId={setActiveCourseId}
                periodConfig={periodConfig} scriptUrl={scriptUrl} setScriptUrl={setScriptUrl}
                setPeriodConfig={setPeriodConfig} addNewCourse={addNewCourse} deleteCourse={deleteCourse}
                setModalType={setModalType} setInputText={setInputText} setIsSidebarOpen={setIsSidebarOpen}
                setCourses={setCourses} showToast={showToast}
                onOpenScoreBoard={() => setIsScoreBoardOpen(true)}
                onOpenStatsPanel={() => setIsStatsPanelOpen(true)}
              />
            </div>
            <div className="flex-1 bg-black bg-opacity-30 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          </div>
        )}

        {/* Student List */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-6 pb-24 bg-gray-50">
          {sortedStudents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <Icons.LayoutGrid size={48} className="mx-auto mb-2 text-gray-300"/>
              <p>尚無學生資料</p>
              <button onClick={() => setModalType('IMPORT')} className="px-6 py-2 bg-indigo-600 text-white rounded-full shadow-lg">匯入名單</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {sortedStudents.map((s) => {
                const record = getFullRecord(activeCourse, currentDate, currentPeriod, s.id);
                return (
                  <StudentCard
                    key={s.id}
                    behaviors={behaviors}
                    student={s}
                    record={record}
                    onClick={() => handleQuickToggle(s.id)}
                    onOpenRecord={() => setRecordPanelStudent(s)}
                  />
                );
              })}
            </div>
          )}
        </main>

        {/* Action Buttons */}
        <div className="fixed bottom-6 right-6 z-10 flex gap-3">
          <button disabled={isUploading} onClick={handleBackupReport}
            className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-xl font-bold text-white ${isUploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
            {isUploading ? <span className="spinner"></span> : <Icons.CloudUpload size={18}/>}
            <span className="hidden sm:inline">{isUploading ? '上傳中...' : '備份報表'}</span>
          </button>
          <button onClick={handleCopyReport}
            className="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-full shadow-xl hover:bg-slate-700 font-bold">
            <Icons.ShieldCheck size={18} className="text-green-300"/>
            <span className="hidden sm:inline">複製報表</span>
            <span className="sm:hidden">複製</span>
          </button>
        </div>
      </div>

      {/* Record Panel */}
      {recordPanelStudent && (
        <RecordPanel
          behaviors={behaviors}
          student={recordPanelStudent}
          record={getFullRecord(activeCourse, currentDate, currentPeriod, recordPanelStudent.id)}
          onSetStatus={(statusId) => {
            setStudentStatus(recordPanelStudent.id, statusId, currentDate, currentPeriod);
          }}
          onToggleBehavior={(behaviorId) => {
            toggleStudentBehavior(recordPanelStudent.id, currentDate, currentPeriod, behaviorId);
          }}
          onSetHomework={(status) => {
            setStudentHomework(recordPanelStudent.id, currentDate, currentPeriod, status);
          }}
          onSetNote={(note) => {
            setStudentNoteText(recordPanelStudent.id, currentDate, currentPeriod, note);
          }}
          onOpenBehaviorManager={() => setIsBehaviorManagerOpen(true)}
          onDelete={() => {
            deleteStudent(recordPanelStudent.id);
            showToast('已移除學生');
          }}
          onClose={() => setRecordPanelStudent(null)}
        />
      )}

      {/* Action Modals */}
      <ActionModals
        modalType={modalType}
        inputText={inputText}
        setInputText={setInputText}
        onSubmit={handleModalSubmit}
        onClose={() => { setModalType(null); setInputText(''); }}
      />

      {/* Score Board */}
      {isScoreBoardOpen && (
        <ScoreBoard behaviors={behaviors} course={activeCourse} onClose={() => setIsScoreBoardOpen(false)}/>
      )}

      {/* Stats Panel */}
      {isStatsPanelOpen && (
        <StatsPanel behaviors={behaviors} course={activeCourse} onClose={() => setIsStatsPanelOpen(false)}/>
      )}

      {/* Behavior Manager */}
      {isBehaviorManagerOpen && (
        <BehaviorManager
          customBehaviors={customBehaviors}
          addCustomBehavior={addCustomBehavior}
          deleteCustomBehavior={deleteCustomBehavior}
          onClose={() => setIsBehaviorManagerOpen(false)}
        />
      )}

      {/* Notification */}
      <Notification message={notification}/>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

