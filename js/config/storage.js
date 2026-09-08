import { STORAGE_KEYS } from './constants.js';

export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  },

  getString(key, fallback = '') {
    return localStorage.getItem(key) || fallback;
  },

  setString(key, value) {
    localStorage.setItem(key, value);
  },
};

export const loadCourses = () =>
  storage.get(STORAGE_KEYS.COURSES, [
    { id: 'default', name: '預設課程', students: [], records: {} },
  ]);

export const saveCourses = (courses) => storage.set(STORAGE_KEYS.COURSES, courses);

export const loadActiveCourseId = (courses) =>
  storage.getString(STORAGE_KEYS.ACTIVE_COURSE_ID, courses[0]?.id || '');

export const saveActiveCourseId = (id) => storage.setString(STORAGE_KEYS.ACTIVE_COURSE_ID, id);

export const loadPeriodConfig = () =>
  storage.get(STORAGE_KEYS.PERIOD_CONFIG, null);

export const savePeriodConfig = (config) => storage.set(STORAGE_KEYS.PERIOD_CONFIG, config);

export const loadScriptUrl = () => storage.getString(STORAGE_KEYS.SCRIPT_URL);

export const saveScriptUrl = (url) => storage.setString(STORAGE_KEYS.SCRIPT_URL, url);

export const loadCustomBehaviors = () => storage.get(STORAGE_KEYS.CUSTOM_BEHAVIORS, []);

export const saveCustomBehaviors = (behaviors) => storage.set(STORAGE_KEYS.CUSTOM_BEHAVIORS, behaviors);

export const loadHiddenDefaults = () => storage.get(STORAGE_KEYS.HIDDEN_DEFAULTS, []);

export const saveHiddenDefaults = (ids) => storage.set(STORAGE_KEYS.HIDDEN_DEFAULTS, ids);
