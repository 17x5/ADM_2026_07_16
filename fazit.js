/**
 * Hilfsfunktion zur Ermittlung des passenden Ampel-Emojis
 * Falls getEmojiColor in den helpers.js definiert ist, wird diese genutzt, 
 * andernfalls greift dieses Fallback.
 */
function sicheresEmoji(sfColor) {
  if (typeof getEmojiColor === 'function') {
    return getEmojiColor(sfColor);
  }
  const emojis = {
    "red": "🔴",
    "yellow": "🟡",
    "green": "🟢"
  };
  return emojis[sfColor] || "🚦";
}
