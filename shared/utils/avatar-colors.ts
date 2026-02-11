export const AVATAR_COLORS = [
  "#FFCF95", "#D09AFB", "#88B6FF", "#82EFCE", "#FB97BA",
];

export const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
