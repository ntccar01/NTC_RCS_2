export const parseStudentList = (text) => {
  return text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l)
    .map((line) => {
      const m = line.match(/^(\d+)[.\s]+(.+)$/);
      return {
        id: Date.now() + Math.random(),
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

export const addStudents = (course, newStudents) => ({
  ...course,
  students: [...course.students, ...newStudents],
});
