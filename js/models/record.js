export const getRecord = (course, date, period, studentId) => {
  const raw = course.records?.[date]?.[period]?.[studentId];
  if (typeof raw === 'object' && raw !== null) return raw.attendance || 'PRESENT';
  return raw || 'PRESENT';
};

export const getRecordObj = (course, date, period, studentId) =>
  course.records?.[date]?.[period]?.[studentId] || null;

export const setAttendance = (course, date, period, studentId, statusId) => {
  const dayRec = course.records[date] || {};
  const periodRec = dayRec[period] || {};
  const existing = periodRec[studentId];

  let updated;
  if (typeof existing === 'object' && existing !== null) {
    updated = { ...existing, attendance: statusId };
  } else {
    updated = { attendance: statusId };
  }

  return {
    ...course,
    records: {
      ...course.records,
      [date]: {
        ...dayRec,
        [period]: { ...periodRec, [studentId]: updated },
      },
    },
  };
};

export const setRecordField = (course, date, period, studentId, field, value) => {
  const dayRec = course.records[date] || {};
  const periodRec = dayRec[period] || {};
  const existing = periodRec[studentId];

  let recordObj;
  if (typeof existing === 'object' && existing !== null) {
    recordObj = { ...existing };
  } else if (typeof existing === 'string') {
    recordObj = { attendance: existing };
  } else {
    recordObj = { attendance: 'PRESENT' };
  }

  recordObj[field] = value;

  return {
    ...course,
    records: {
      ...course.records,
      [date]: {
        ...dayRec,
        [period]: { ...periodRec, [studentId]: recordObj },
      },
    },
  };
};

export const quickToggle = (course, date, period, studentId) => {
  const current = getRecord(course, date, period, studentId);
  const next = current === 'PRESENT' ? 'ABSENT' : 'PRESENT';
  return setAttendance(course, date, period, studentId, next);
};

export const getPeriodStats = (students, records, date, period) => {
  const rec = records?.[date]?.[period] || {};
  let p = 0, a = 0, o = 0;
  students.forEach((s) => {
    const st = typeof rec[s.id] === 'object' ? rec[s.id]?.attendance : (rec[s.id] || 'PRESENT');
    if (st === 'PRESENT') p++;
    else if (st === 'ABSENT') a++;
    else o++;
  });
  return { p, a, o, t: students.length };
};

// --- 課堂紀錄：行為、作業、備註 ---

export const getFullRecord = (course, date, period, studentId) => {
  const raw = course.records?.[date]?.[period]?.[studentId];
  if (!raw) return { attendance: 'PRESENT', behaviors: [], homework: 'NONE', note: '' };
  if (typeof raw === 'string') return { attendance: raw, behaviors: [], homework: 'NONE', note: '' };
  return {
    attendance: raw.attendance || 'PRESENT',
    behaviors: raw.behaviors || [],
    homework: raw.homework || 'NONE',
    note: raw.note || '',
  };
};

const ensureRecordObj = (existing) => {
  if (typeof existing === 'object' && existing !== null) return { ...existing };
  if (typeof existing === 'string') return { attendance: existing, behaviors: [], homework: 'NONE', note: '' };
  return { attendance: 'PRESENT', behaviors: [], homework: 'NONE', note: '' };
};

export const toggleBehavior = (course, date, period, studentId, behaviorId) => {
  const dayRec = course.records[date] || {};
  const periodRec = dayRec[period] || {};
  const recordObj = ensureRecordObj(periodRec[studentId]);

  const behaviors = recordObj.behaviors || [];
  recordObj.behaviors = behaviors.includes(behaviorId)
    ? behaviors.filter((b) => b !== behaviorId)
    : [...behaviors, behaviorId];

  return {
    ...course,
    records: {
      ...course.records,
      [date]: {
        ...dayRec,
        [period]: { ...periodRec, [studentId]: recordObj },
      },
    },
  };
};

export const setHomeworkStatus = (course, date, period, studentId, status) => {
  const dayRec = course.records[date] || {};
  const periodRec = dayRec[period] || {};
  const recordObj = ensureRecordObj(periodRec[studentId]);
  recordObj.homework = status;

  return {
    ...course,
    records: {
      ...course.records,
      [date]: {
        ...dayRec,
        [period]: { ...periodRec, [studentId]: recordObj },
      },
    },
  };
};

export const setStudentNote = (course, date, period, studentId, note) => {
  const dayRec = course.records[date] || {};
  const periodRec = dayRec[period] || {};
  const recordObj = ensureRecordObj(periodRec[studentId]);
  recordObj.note = note;

  return {
    ...course,
    records: {
      ...course.records,
      [date]: {
        ...dayRec,
        [period]: { ...periodRec, [studentId]: recordObj },
      },
    },
  };
};

export const calcBehaviorScore = (behaviors, behaviorConfig) => {
  return behaviors.reduce((sum, bId) => {
    const cfg = behaviorConfig.find((c) => c.id === bId);
    if (!cfg) return sum;
    return sum + (cfg.penalty || 0) + (cfg.bonus || 0);
  }, 0);
};

export const getCourseBehaviorSummary = (course, date, students, behaviorConfig) => {
  const periodRec = course.records?.[date] || {};
  const summary = {};
  students.forEach((s) => {
    let totalScore = 0;
    const allBehaviors = [];
    Object.values(periodRec).forEach((periodData) => {
      const raw = periodData?.[s.id];
      if (!raw || typeof raw === 'string') return;
      (raw.behaviors || []).forEach((bId) => {
        allBehaviors.push(bId);
        const cfg = behaviorConfig.find((c) => c.id === bId);
        if (cfg) totalScore += (cfg.penalty || 0) + (cfg.bonus || 0);
      });
    });
    summary[s.id] = { score: totalScore, behaviors: allBehaviors };
  });
  return summary;
};

// --- Phase 2: 統計彙整 ---

export const getStudentFullStats = (course, studentId, behaviorConfig) => {
  const records = course.records || {};
  let totalScore = 0;
  const behaviorCounts = {};
  let present = 0, absent = 0, late = 0, leaveEarly = 0, sick = 0, personal = 0, official = 0;
  let homeworkDone = 0, homeworkTotal = 0;
  let totalPeriods = 0;

  Object.values(records).forEach((dayRec) => {
    Object.values(dayRec).forEach((periodRec) => {
      const raw = periodRec?.[studentId];
      if (!raw) return;
      totalPeriods++;

      const att = typeof raw === 'string' ? raw : (raw.attendance || 'PRESENT');
      if (att === 'PRESENT') present++;
      else if (att === 'ABSENT') absent++;
      else if (att === 'LATE') late++;
      else if (att === 'LEAVE_EARLY') leaveEarly++;
      else if (att === 'SICK') sick++;
      else if (att === 'PERSONAL') personal++;
      else if (att === 'OFFICIAL') official++;

      const hw = typeof raw === 'object' ? raw.homework : null;
      if (hw && hw !== 'NONE') {
        homeworkTotal++;
        if (hw === 'DONE') homeworkDone++;
      }

      const behaviors = typeof raw === 'object' ? (raw.behaviors || []) : [];
      behaviors.forEach((bId) => {
        behaviorCounts[bId] = (behaviorCounts[bId] || 0) + 1;
        const cfg = behaviorConfig.find((c) => c.id === bId);
        if (cfg) totalScore += (cfg.penalty || 0) + (cfg.bonus || 0);
      });
    });
  });

  const attendanceRate = totalPeriods > 0 ? Math.round((present / totalPeriods) * 100) : 100;
  const homeworkRate = homeworkTotal > 0 ? Math.round((homeworkDone / homeworkTotal) * 100) : 100;

  return {
    score: totalScore,
    attendance: { present, absent, late, leaveEarly, sick, personal, official, total: totalPeriods, rate: attendanceRate },
    homework: { done: homeworkDone, total: homeworkTotal, rate: homeworkRate },
    behaviorCounts,
  };
};

export const getDailyTrend = (course, students, periodConfig) => {
  const dates = Object.keys(course.records).sort();
  return dates.map((date) => {
    let p = 0, a = 0, o = 0;
    const dayRec = course.records[date] || {};
    students.forEach((s) => {
      let hasRecord = false;
      periodConfig.forEach((period) => {
        const raw = dayRec[period]?.[s.id];
        if (!raw) return;
        hasRecord = true;
        const att = typeof raw === 'string' ? raw : (raw.attendance || 'PRESENT');
        if (att === 'PRESENT') p++;
        else if (att === 'ABSENT') a++;
        else o++;
      });
      if (!hasRecord) p++;
    });
    const total = students.length * periodConfig.length || 1;
    return {
      date,
      present: p,
      absent: a,
      other: o,
      rate: Math.round((p / total) * 100),
    };
  });
};

export const getBehaviorDistribution = (course, students, behaviorConfig) => {
  const dist = {};
  behaviorConfig.forEach((b) => { dist[b.id] = 0; });

  Object.values(course.records).forEach((dayRec) => {
    Object.values(dayRec).forEach((periodRec) => {
      students.forEach((s) => {
        const raw = periodRec?.[s.id];
        if (!raw || typeof raw === 'string') return;
        (raw.behaviors || []).forEach((bId) => {
          if (dist[bId] !== undefined) dist[bId]++;
        });
      });
    });
  });

  return behaviorConfig
    .map((b) => ({ ...b, count: dist[b.id] || 0 }))
    .sort((a, b) => b.count - a.count);
};

export const getHomeworkStats = (course, students) => {
  const stats = { DONE: 0, NOT_DONE: 0, LATE: 0, NONE: 0 };
  Object.values(course.records).forEach((dayRec) => {
    Object.values(dayRec).forEach((periodRec) => {
      students.forEach((s) => {
        const raw = periodRec?.[s.id];
        if (!raw || typeof raw === 'string') return;
        const hw = raw.homework || 'NONE';
        stats[hw] = (stats[hw] || 0) + 1;
      });
    });
  });
  return stats;
};
