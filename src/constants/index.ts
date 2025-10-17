/**
 * Constants Index - Central Export Hub
 * Provides clean imports for all game constants and configuration
 */

// Game configuration and settings
export * from "./gameConfig";

// Educational content and learning materials
export * from "./educationalContent";

// Re-export commonly used configurations
export {
  DEFAULT_GAME_CONFIG,
  DIFFICULTY_LEVELS,
  GAME_PHASES,
} from "./gameConfig";

export {
  LEARNING_OBJECTIVES,
  EDUCATIONAL_SCENARIOS,
  EDUCATIONAL_TIPS,
  CONTEXTUAL_HELP,
  ACHIEVEMENTS,
} from "./educationalContent";
