import { sortStudents } from '../models/student.js';
import { getRecord } from '../models/record.js';
import { STATUS_CONFIG } from '../config/constants.js';

export const backupReport = async (scriptUrl, course, date, period) => {
  const sorted = sortStudents(course.students);
  const records = course.records?.[date]?.[period] || {};

  const payload = {
    type: 'backup_report',
    course: course.name,
    date,
    period,
    students: sorted.map((s) => ({
      number: s.number,
      name: s.name,
      statusLabel: STATUS_CONFIG[getRecord(course, date, period, s.id)].label,
    })),
  };

  const res = await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res;
};

export const syncUpload = async (scriptUrl, courses, periodConfig) => {
  const payload = { type: 'sync_upload', payload: { courses, periodConfig } };
  const res = await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res;
};

export const syncDownload = async (scriptUrl) => {
  const res = await fetch(scriptUrl + '?action=download');
  const data = await res.json();
  return data;
};

// Behavior sync: upload
export const syncBehaviorsUpload = async (scriptUrl, customBehaviors, hiddenDefaults) => {
  const payload = {
    type: 'sync_behaviors',
    customBehaviors,
    hiddenDefaults,
  };
  const res = await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res;
};

// Behavior sync: download
export const syncBehaviorsDownload = async (scriptUrl) => {
  const res = await fetch(scriptUrl + '?action=behaviors');
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return data;
  } catch {
    return { result: 'error', msg: '解析失敗' };
  }
};
