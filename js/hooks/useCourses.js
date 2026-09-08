import { useState, useEffect, useRef } from 'react';
import { DEFAULT_PERIODS, DEFAULT_BEHAVIORS, STORAGE_KEYS } from '../config/constants.js';
import {
  loadCourses, saveCourses,
  loadActiveCourseId, saveActiveCourseId,
  loadPeriodConfig, savePeriodConfig,
  loadScriptUrl, saveScriptUrl,
  loadCustomBehaviors, saveCustomBehaviors,
} from '../config/storage.js';
import { createCourse, deleteCourseFromList, findCourse } from '../models/course.js';
import { parseStudentList, addStudents, removeStudent } from '../models/student.js';
import { setAttendance, quickToggle, toggleBehavior, setHomeworkStatus, setStudentNote } from '../models/record.js';

export function useCourses() {
  const [courses, setCourses] = useState(() => loadCourses());
  const [activeCourseId, setActiveCourseId] = useState(() => loadActiveCourseId(courses));
  const [periodConfig, setPeriodConfig] = useState(() => loadPeriodConfig() || DEFAULT_PERIODS);
  const [scriptUrl, setScriptUrl] = useState(() => loadScriptUrl());
  const [customBehaviors, setCustomBehaviors] = useState(() => loadCustomBehaviors());

  const activeCourseIdRef = useRef(activeCourseId);
  activeCourseIdRef.current = activeCourseId;

  const activeCourse = findCourse(courses, activeCourseId);

  useEffect(() => saveCourses(courses), [courses]);
  useEffect(() => saveActiveCourseId(activeCourseId), [activeCourseId]);
  useEffect(() => savePeriodConfig(periodConfig), [periodConfig]);
  useEffect(() => saveScriptUrl(scriptUrl), [scriptUrl]);
  useEffect(() => saveCustomBehaviors(customBehaviors), [customBehaviors]);

  const behaviors = [...DEFAULT_BEHAVIORS, ...customBehaviors];

  const addCustomBehavior = (behavior) => {
    const existing = [...DEFAULT_BEHAVIORS, ...customBehaviors];
    if (existing.some((b) => b.label === behavior.label)) return false;
    setCustomBehaviors((prev) => [...prev, behavior]);
    return true;
  };

  const deleteCustomBehavior = (behaviorId) => {
    setCustomBehaviors((prev) => prev.filter((b) => b.id !== behaviorId));
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
    addCustomBehavior,
    deleteCustomBehavior,
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
