// Re-export all domain types for convenience
export * from '../domain/trade.types';
export * from '../domain/user.types';
export * from '../config/env';

// Additional core types
export type Logger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string, err?: Error) => void;
  debug: (msg: string) => void;
};
