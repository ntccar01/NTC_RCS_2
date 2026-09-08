export const createCourse = (name) => ({
  id: 'c_' + Date.now() + Math.random(),
  name,
  students: [],
  records: {},
});

export const deleteCourseFromList = (courses, courseId) => {
  if (courses.length <= 1) return courses;
  return courses.filter((c) => c.id !== courseId);
};

export const updateCourse = (courses, courseId, updater) =>
  courses.map((c) => (c.id === courseId ? updater(c) : c));

export const findCourse = (courses, courseId) =>
  courses.find((c) => c.id === courseId) || courses[0];
