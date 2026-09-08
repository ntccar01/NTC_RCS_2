import { useState, useEffect, useRef } from 'react';
import { DEFAULT_PERIODS, DEFAULT_BEHAVIORS } from '../config/constants.js';
import {
  loadCourses, saveCourses,
  loadActiveCourseId, saveActiveCourseId,
  loadPeriodConfig, savePeriodConfig,
  loadScriptUrl, saveScriptUrl,
  loadCustomBehaviors, saveCustomBehaviors,
  loadHiddenDefaults, saveHiddenDefaults,
  loadBehaviorOrder, saveBehaviorOrder,
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
  const [behaviorOrder, setBehaviorOrder] = useState(() => loadBehaviorOrder());

  const activeCourseIdRef = useRef(activeCourseId);
  activeCourseIdRef.current = activeCourseId;

  const activeCourse = findCourse(courses, activeCourseId);

  useEffect(() => saveCourses(courses), [courses]);
  useEffect(() => saveActiveCourseId(activeCourseId), [activeCourseId]);
  useEffect(() => savePeriodConfig(periodConfig), [periodConfig]);
  useEffect(() => saveScriptUrl(scriptUrl), [scriptUrl]);
  useEffect(() => saveCustomBehaviors(customBehaviors), [customBehaviors]);
  useEffect(() => saveHiddenDefaults(hiddenDefaults), [hiddenDefaults]);
  useEffect(() => saveBehaviorOrder(behaviorOrder), [behaviorOrder]);

  // Merge: defaults (minus hidden) → apply custom overrides → apply order
  const behaviors = (() => {
    const visible = DEFAULT_BEHAVIORS.filter((d) => !hiddenDefaults.includes(d.id));
    const overrides = customBehaviors.filter((c) => c.edited);
    const overriddenIds = overrides.map((o) => o.id);
    const base = visible.filter((d) => !overriddenIds.includes(d.id));
    const customNew = customBehaviors.filter((c) => !c.edited);
    const merged = [...base, ...overrides, ...customNew];

    // Apply behaviorOrder if it exists
    if (behaviorOrder && behaviorOrder.length > 0) {
      const byId = {};
      merged.forEach((b) => { byId[b.id] = b; });
      // Items in order first, then any new items not in order list
      const ordered = behaviorOrder
        .filter((id) => byId[id])
        .map((id) => byId[id]);
      const newItems = merged.filter((b) => !behaviorOrder.includes(b.id));
      return [...ordered, ...newItems];
    }
    return merged;
  })();

  const addCustomBehavior = (behavior) => {
    if (behaviors.some((b) => b.label === behavior.label && b.id !== behavior.id)) return false;
    setCustomBehaviors((prev) => [...prev, behavior]);
    // Add to end of behavior order
    setBehaviorOrder((prev) => {
      const current = prev || behaviors.map((b) => b.id);
      return [...current, behavior.id];
    });
    return true;
  };

  const deleteCustomBehavior = (behaviorId) => {
    setCustomBehaviors((prev) => prev.filter((b) => b.id !== behaviorId));
    setBehaviorOrder((prev) => prev ? prev.filter((id) => id !== behaviorId) : prev);
  };

  const hideDefaultBehavior = (behaviorId) => {
    setHiddenDefaults((prev) => [...prev, behaviorId]);
    setCustomBehaviors((prev) => prev.filter((b) => b.id !== behaviorId));
    setBehaviorOrder((prev) => prev ? prev.filter((id) => id !== behaviorId) : prev);
  };

  const showDefaultBehavior = (behaviorId) => {
    setHiddenDefaults((prev) => prev.filter((id) => id !== behaviorId));
  };

  const updateCustomBehavior = (behaviorId, updates) => {
    setCustomBehaviors((prev) => prev.map((b) => b.id === behaviorId ? { ...b, ...updates } : b));
  };

  const moveBehavior = (behaviorId, direction) => {
    const ids = behaviors.map((b) => b.id);
    const idx = ids.indexOf(behaviorId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= ids.length) return;
    // Swap
    const newIds = [...ids];
    [newIds[idx], newIds[targetIdx]] = [newIds[targetIdx], newIds[idx]];
    setBehaviorOrder(newIds);
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
    const remote = await syncBehaviorsDownload(scriptUrl);
    if (remote.result === 'error') throw new Error(remote.msg || '下載失敗');
    if (remote.customBehaviors && Array.isArray(remote.customBehaviors)) {
      setCustomBehaviors(remote.customBehaviors);
    }
    if (remote.hiddenDefaults && Array.isArray(remote.hiddenDefaults)) {
      setHiddenDefaults(remote.hiddenDefaults);
    }
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
    moveBehavior,
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
