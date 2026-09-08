import { sortStudents } from '../models/student.js';
import { getRecord } from '../models/record.js';
import { STATUS_CONFIG } from '../config/constants.js';
import { anonymizeName } from './anonymize.js';

export const generateReport = (course, date, period) => {
  const sorted = sortStudents(course.students);
  const groups = { ABSENT: [], LATE: [], LEAVE_EARLY: [], SICK: [], PERSONAL: [], OFFICIAL: [] };
  let presentCount = 0;

  sorted.forEach((s) => {
    const st = getRecord(course, date, period, s.id);
    if (st === 'PRESENT') {
      presentCount++;
    } else if (groups[st]) {
      const num = s.number ? s.number + '.' : '';
      groups[st].push(`${num}${anonymizeName(s.name)}`);
    }
  });

  let report = `🏫 ${course.name}\n📅 ${date} (${period})\n📊 應到 ${sorted.length} / 實到 ${presentCount}\n------------------\n`;

  const labels = {
    ABSENT: '❌ 缺席',
    LATE: '⚠️ 遲到',
    LEAVE_EARLY: '🏃 早退',
    SICK: '😷 病假',
    PERSONAL: '🏠 事假',
    OFFICIAL: '🏢 公假',
  };

  for (const [key, list] of Object.entries(groups)) {
    if (list.length > 0) {
      report += `${labels[key]}：${list.join('、')}\n`;
    }
  }

  if (Object.values(groups).every((arr) => arr.length === 0)) {
    report += '✅ 全員到齊\n';
  }

  return report;
};

export const copyToClipboard = (text) => {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(ta);
  }
};
