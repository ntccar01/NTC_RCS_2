export const generateStudentId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  // 舊版瀏覽器備援
  return `student-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

export const parseStudentList = (text) => {
  return text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l)
    .map((line) => {
      const m = line.match(/^(\d+)[.\s]+(.+)$/);
      return {
        id: generateStudentId(),
        number: m ? m[1] : '',
        name: m ? m[2] : line,
      };
    });
};

export const sortStudents = (students) =>
  [...students].sort((a, b) => (parseInt(a.number) || 999) - (parseInt(b.number) || 999));

export const removeStudent = (course, studentId) => ({
  ...course,
  students: course.students.filter((s) => s.id !== studentId),
});

export const addStudents = (course, newStudents) => {
  const usedIds = new Set((course.students || []).map((s) => String(s.id)));

  const safeStudents = newStudents.map((student) => {
    let id = student.id;

    while (id == null || usedIds.has(String(id))) {
      id = generateStudentId();
    }

    usedIds.add(String(id));

    return {
      ...student,
      id,
    };
  });

  return {
    ...course,
    students: [...course.students, ...safeStudents],
  };
};
