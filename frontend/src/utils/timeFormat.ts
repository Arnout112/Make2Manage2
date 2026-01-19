/**
 * Convert milliseconds to M:SS format used across the UI
 */
export function formatTime(milliseconds?: number): string {
  if (!milliseconds || milliseconds <= 0) return "0:00";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default formatTime;
