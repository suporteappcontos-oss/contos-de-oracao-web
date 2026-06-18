type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private failureThreshold: number;
  private resetTimeout: number;
  private nextAttempt: number = Date.now();

  constructor(options?: CircuitBreakerOptions) {
    this.failureThreshold = options?.failureThreshold || 3;
    // Padrão de 10 segundos de timeout de reset
    this.resetTimeout = options?.resetTimeout || 10000; 
  }

  public async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('CircuitBreaker is OPEN');
      }
    }

    try {
      const response = await action();
      this.onSuccess();
      return response;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.warn(`[CircuitBreaker] Disjuntor ABERTO! Muitas falhas seguidas. Próxima tentativa em ${this.resetTimeout}ms`);
    }
  }

  public getState() {
    return this.state;
  }
}
