export class BotError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'BotError';
    Object.setPrototypeOf(this, BotError.prototype);
  }
}

export class ValidationError extends BotError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends BotError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class TradeError extends BotError {
  constructor(message: string, details?: unknown) {
    super(message, 'TRADE_ERROR', details);
    this.name = 'TradeError';
  }
}

export function handleError(error: unknown, context?: string): Error {
  if (error instanceof BotError) {
    return error;
  }

  if (error instanceof Error) {
    const message = context ? `${context}: ${error.message}` : error.message;
    return new BotError(message, 'UNKNOWN_ERROR', error);
  }

  const message = context
    ? `${context}: ${String(error)}`
    : String(error);
  return new BotError(message, 'UNKNOWN_ERROR');
}
