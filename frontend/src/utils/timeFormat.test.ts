import { formatTime } from './timeFormat';

describe('formatTime', () => {
  describe('Edge cases', () => {
    it('should return "0:00" for undefined', () => {
      expect(formatTime(undefined)).toBe('0:00');
    });

    it('should return "0:00" for zero', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('should return "0:00" for negative values', () => {
      expect(formatTime(-1000)).toBe('0:00');
    });

    it('should return "0:00" for null-like values', () => {
      expect(formatTime(null as any)).toBe('0:00');
    });
  });

  describe('M:SS format (< 60 minutes)', () => {
    it('should format seconds only', () => {
      expect(formatTime(30000)).toBe('0:30');
    });

    it('should format 1 second', () => {
      expect(formatTime(1000)).toBe('0:01');
    });

    it('should format minutes and seconds', () => {
      expect(formatTime(330000)).toBe('5:30');
    });

    it('should pad seconds with leading zero', () => {
      expect(formatTime(610000)).toBe('10:10');
    });

    it('should format exactly 60 minutes as 1 hour', () => {
      expect(formatTime(3600000)).toBe('1:00:00');
    });

    it('should format 59 minutes 59 seconds', () => {
      expect(formatTime(3599000)).toBe('59:59');
    });
  });

  describe('H:MM:SS format (>= 60 minutes)', () => {
    it('should format as H:MM:SS for 1 hour 5 minutes 30 seconds', () => {
      expect(formatTime(3930000)).toBe('1:05:30');
    });

    it('should format exactly 1 hour', () => {
      expect(formatTime(3600000)).toBe('1:00:00');
    });

    it('should format 1 hour 0 minutes 0 seconds', () => {
      expect(formatTime(3600000 + 1)).toBe('1:00:00');
    });

    it('should format 2 hours', () => {
      expect(formatTime(7200000)).toBe('2:00:00');
    });

    it('should pad minutes and seconds in H:MM:SS format', () => {
      expect(formatTime(3661000)).toBe('1:01:01');
    });

    it('should format 1 hour 30 minutes 45 seconds', () => {
      expect(formatTime(5445000)).toBe('1:30:45');
    });

    it('should format 10 hours 5 minutes 30 seconds', () => {
      expect(formatTime(36330000)).toBe('10:05:30');
    });

    it('should format 23 hours 59 minutes 59 seconds', () => {
      expect(formatTime(86399000)).toBe('23:59:59');
    });
  });

  describe('Boundary conditions', () => {
    it('should transition to H:MM:SS at exactly 60 minutes', () => {
      // 60 minutes (3600 seconds) = 1 hour, shown as H:MM:SS
      expect(formatTime(3600000)).toBe('1:00:00');
      // 60 minutes and 1 second
      expect(formatTime(3601000)).toBe('1:00:01');
    });
  });
});
