export const STATUS_CONFIG = {
  PRESENT: { id: 'PRESENT', label: '出席', color: 'bg-green-100 text-green-700 border-green-300', iconType: 'UserCheck' },
  ABSENT: { id: 'ABSENT', label: '缺席', color: 'bg-red-100 text-red-700 border-red-300', iconType: 'UserX' },
  LATE: { id: 'LATE', label: '遲到', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', iconType: 'Clock' },
  LEAVE_EARLY: { id: 'LEAVE_EARLY', label: '早退', color: 'bg-orange-100 text-orange-700 border-orange-300', iconType: 'LogOut' },
  SICK: { id: 'SICK', label: '病假', color: 'bg-rose-100 text-rose-700 border-rose-300', iconType: 'Thermometer' },
  PERSONAL: { id: 'PERSONAL', label: '事假', color: 'bg-purple-100 text-purple-700 border-purple-300', iconType: 'Coffee' },
  OFFICIAL: { id: 'OFFICIAL', label: '公假', color: 'bg-blue-100 text-blue-700 border-blue-300', iconType: 'Briefcase' },
};

export const DEFAULT_BEHAVIORS = [
  { id: 'USE_PHONE',   label: '使用手機', icon: '📱', penalty: -1, color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 'SLEEP',       label: '睡覺',     icon: '😴', penalty: -2, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'NOISY',       label: '吵鬧',     icon: '🗣️', penalty: -1, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  { id: 'DISTRACT',    label: '分心',     icon: '😵', penalty: -1, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'TALK',        label: '講話',     icon: '💬', penalty: -1, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  { id: 'FOOD',        label: '吃東西',   icon: '🍔', penalty: -1, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'LEAVE_SEAT',  label: '離座',     icon: '🚶', penalty: -1, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'ACTIVE',      label: '積極回答', icon: '🙋', bonus: +2,  color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 'HELP_OTHERS', label: '幫助同學', icon: '🤝', bonus: +1,  color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'GOOD_Q',      label: '提問優質', icon: '💡', bonus: +1,  color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
];

export const HOMEWORK_STATUS = {
  DONE:    { id: 'DONE',    label: '已交', color: 'bg-green-100 text-green-700 border-green-300', icon: '✅' },
  NOT_DONE:{ id: 'NOT_DONE',label: '未交', color: 'bg-red-100 text-red-700 border-red-300',     icon: '❌' },
  LATE:    { id: 'LATE',    label: '補交', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⏰' },
  NONE:    { id: 'NONE',    label: '無作业', color: 'bg-gray-100 text-gray-500 border-gray-300', icon: '➖' },
};

export const DEFAULT_PERIODS = ['早自習', '第一節', '第二節', '第三節', '第四節', '午休', '第五節', '第六節', '第七節', '第八節'];

export const STORAGE_KEYS = {
  COURSES: 'rc_courses_v5',
  ACTIVE_COURSE_ID: 'rc_active_course_id',
  PERIOD_CONFIG: 'rc_periods_config',
  SCRIPT_URL: 'rc_google_script_url',
  CUSTOM_BEHAVIORS: 'rc_custom_behaviors',
  HIDDEN_DEFAULTS: 'rc_hidden_defaults',
};

export const CHART_COLORS = {
  PRESENT: '#22c55e',
  ABSENT: '#ef4444',
  LATE: '#eab308',
  LEAVE_EARLY: '#f97316',
  SICK: '#f43f5e',
  PERSONAL: '#a855f7',
  OFFICIAL: '#3b82f6',
};

export const ATTENDANCE_RATE_THRESHOLDS = [
  { min: 90, label: '優秀', color: 'text-green-600', bg: 'bg-green-50' },
  { min: 75, label: '良好', color: 'text-blue-600', bg: 'bg-blue-50' },
  { min: 60, label: '普通', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { min: 0,  label: '需改善', color: 'text-red-600', bg: 'bg-red-50' },
];
