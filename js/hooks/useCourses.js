import { useState, useEffect, useRef } from 'react';
import { DEFAULT_PERIODS, DEFAULT_BEHAVIORS } from '../config/constants.js';
import {
  loadCourses, saveCourses,
  loadActiveCourseId, saveActiveCourseId,
  loadPeriodConfig, savePeriodConfig,
  loadScriptUrl, saveScriptUrl,
  loadCustomBehaviors, saveCustomBehaviors,
  loadHiddenDefaults, saveHiddenDefaults,
} from '../config/storage.js';
import { createCourse, deleteCourseFromList, findCourse } from '../models/course.js';
import { parseStudentList, addStudents, removeStudent } from '../models/student.js';
import { setAttendance, quickToggle, toggleBehavior, setHomeworkStatus, setStudentNote } from '../models/record.js';
import { syncBehaviorsUpload, syncBehaviorsDownload } from '../services/cloudSync.js';

export function useCourses() {
  const [courses, setCourses] = useState(() => loadCourses());
  const [activeCourseId, setActiveCourseId] = useState(() => loadActiveCourseId(courses));
  const [periodConfig, setPeriodConfig] = useState(() => loadPeriodConfig() || DEFAULT_PERIODS);
  const [scriptUrl, setScriptUrl] = useState(() => loadScriptUrl());
  const [customBehaviors, setCustomBehaviors] = useState(() => loadCustomBehaviors());
  const [hiddenDefaults, setHiddenDefaults] = useState(() => loadHiddenDefaults());

  const activeCourseIdRef = useRef(activeCourseId);
  activeCourseIdRef.current = activeCourseId;

  const activeCourse = findCourse(courses, activeCourseId);

  useEffect(() => saveCourses(courses), [courses]);
  useEffect(() => saveActiveCourseId(activeCourseId), [activeCourseId]);
  useEffect(() => savePeriodConfig(periodConfig), [periodConfig]);
  useEffect(() => saveScriptUrl(scriptUrl), [scriptUrl]);
  useEffect(() => saveCustomBehaviors(customBehaviors), [customBehaviors]);
  useEffect(() => saveHiddenDefaults(hiddenDefaults), [hiddenDefaults]);

  // Merge: defaults (minus hidden) → apply custom overrides (edited defaults replace originals)
  const behaviors = (() => {
    const visible = DEFAULT_BEHAVIORS.filter((d) => !hiddenDefaults.includes(d.id));
    const overrides = customBehaviors.filter((c) => c.edited);
    const overriddenIds = overrides.map((o) => o.id);
    const base = visible.filter((d) => !overriddenIds.includes(d.id));
    const customNew = customBehaviors.filter((c) => !c.edited);
    return [...base, ...overrides, ...customNew];
  })();

  const addCustomBehavior = (behavior) => {
    if (behaviors.some((b) => b.label === behavior.label && b.id !== behavior.id)) return false;
    setCustomBehaviors((prev) => [...prev, behavior]);
    return true;
  };

  const deleteCustomBehavior = (behaviorId) => {
    const custom = customBehaviors.find((c) => c.id === behaviorId);
    if (custom && custom.edited) {
      // Deleting an edited default → remove the override, behavior reverts to original
      setCustomBehaviors((prev) => prev.filter((b) => b.id !== behaviorId));
    } else {
      // Deleting a pure custom behavior
      setCustomBehaviors((prev) => prev.filter((b) => b.id !== behaviorId));
    }
  };

  const hideDefaultBehavior = (behaviorId) => {
    setHiddenDefaults((prev) => [...prev, behaviorId]);
    // Also remove any override if it exists
    setCustomBehaviors((prev) => prev.filter((b) => b.id !== behaviorId));
  };

  const showDefaultBehavior = (behaviorId) => {
    setHiddenDefaults((prev) => prev.filter((id) => id !== behaviorId));
  };

  const updateCustomBehavior = (behaviorId, updates) => {
    setCustomBehaviors((prev) => prev.map((b) => b.id === behaviorId ? { ...b, ...updates } : b));
  };

  const updateActiveCourse = (updater) => {
    const cid = activeCourseIdRef.current;
    setCourses((prev) => prev.map((c) => (c.id === cid ? updater(c) : c)));
  };

  const addNewCourse = (names) => {
    const newCourses = names.map((n) => createCourse(n));
    setCourses((prev) => [...prev, ...newCourses]);
    setActiveCourseId(newCourses[0].id);
  };

  const deleteCourse = (courseId) => {
    if (courses.length <= 1) return;
    const filtered = deleteCourseFromList(courses, courseId);
    setCourses(filtered);
    if (activeCourseId === courseId) {
      setActiveCourseId(filtered[0].id);
    }
  };

  const importStudents = (text) => {
    const newStudents = parseStudentList(text);
    updateActiveCourse((c) => addStudents(c, newStudents));
  };

  const deleteStudent = (studentId) => {
    updateActiveCourse((c) => removeStudent(c, studentId));
  };

  const setStudentStatus = (studentId, statusId, date, period) => {
    updateActiveCourse((c) => setAttendance(c, date, period, studentId, statusId));
  };

  const quickToggleStudent = (studentId, date, period) => {
    updateActiveCourse((c) => quickToggle(c, date, period, studentId));
  };

  const toggleStudentBehavior = (studentId, date, period, behaviorId) => {
    updateActiveCourse((c) => toggleBehavior(c, date, period, studentId, behaviorId));
  };

  const setStudentHomework = (studentId, date, period, status) => {
    updateActiveCourse((c) => setHomeworkStatus(c, date, period, studentId, status));
  };

  const setStudentNoteText = (studentId, date, period, note) => {
    updateActiveCourse((c) => setStudentNote(c, date, period, studentId, note));
  };

  const syncBehaviors = async (scriptUrl) => {
    if (!scriptUrl) throw new Error('請先設定 GAS 連結');
    // 1. Download from Sheets
    const remote = await syncBehaviorsDownload(scriptUrl);
    if (remote.result === 'error') throw new Error(remote.msg || '下載失敗');
    // 2. Merge: remote custom behaviors + hidden defaults → apply to local
    if (remote.customBehaviors && Array.isArray(remote.customBehaviors)) {
      setCustomBehaviors(remote.customBehaviors);
    }
    if (remote.hiddenDefaults && Array.isArray(remote.hiddenDefaults)) {
      setHiddenDefaults(remote.hiddenDefaults);
    }
    // 3. Upload local to Sheets
    await syncBehaviorsUpload(scriptUrl, customBehaviors, hiddenDefaults);
    return { result: 'success', msg: '行為設定同步完成' };
  };

  return {
    courses,
    setCourses,
    activeCourse,
    activeCourseId,
    setActiveCourseId,
    periodConfig,
    setPeriodConfig,
    scriptUrl,
    setScriptUrl,
    behaviors,
    customBehaviors,
    hiddenDefaults,
    addCustomBehavior,
    updateCustomBehavior,
    deleteCustomBehavior,
    hideDefaultBehavior,
    showDefaultBehavior,
    syncBehaviors,
    addNewCourse,
    deleteCourse,
    importStudents,
    deleteStudent,
    setStudentStatus,
    quickToggleStudent,
    toggleStudentBehavior,
    setStudentHomework,
    setStudentNoteText,
    updateActiveCourse,
  };
}
