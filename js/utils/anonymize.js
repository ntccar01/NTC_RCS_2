export const anonymizeName = (name) => {
  if (!name) return '';
  if (name.length === 2) return 'O' + name.slice(1);
  if (name.length === 3) return name[0] + 'O' + name.slice(2);
  if (name.length === 4) return name.slice(0, 2) + 'O' + name.slice(3);
  return name.length > 4 ? name.slice(0, -2) + 'O' + name.slice(-1) : name;
};
