/**
 * Convert milliseconds to a formatted time string
 * 
 * Formats time based on duration:
 * - For durations <= 60 minutes: Returns M:SS format (e.g., "5:30", "45:15")
 * - For durations > 60 minutes: Returns H:MM:SS format (e.g., "1:05:30", "2:45:15")
 * 
 * @param {number} [milliseconds] - Time duration in milliseconds
 * @returns {string} Formatted time string. Returns "0:00" if input is falsy or <= 0
 * 
 * @example
 * formatTime(330000) // Returns "5:30" (5 minutes 30 seconds)
 * formatTime(3930000) // Returns "1:05:30" (1 hour 5 minutes 30 seconds)
 * formatTime(0) // Returns "0:00"
 * formatTime(undefined) // Returns "0:00"
 */
export function formatTime(milliseconds?: number): string {
  if (!milliseconds || milliseconds <= 0) return "0:00";
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // If duration is more than 60 minutes, show H:MM:SS format
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  
  // Otherwise show M:SS format
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default formatTime;
