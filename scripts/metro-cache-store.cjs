// Metro's graph traversal can request many cache entries before workers run.
// Bound cache I/O separately from maxWorkers, especially on Windows.
class LimitedCacheStore {
  constructor(store, limit = 16) {
    this.store = store;
    this.limit = limit;
    this.active = 0;
    this.queue = [];
  }

  async run(operation) {
    if (this.active >= this.limit) await new Promise(resolve => this.queue.push(resolve));
    else this.active++;
    try {
      for (let attempt = 0; ; attempt++) {
        try { return await operation(); }
        catch (error) {
          if (!['EMFILE', 'ENFILE'].includes(error.code) || attempt >= 3) throw error;
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
        }
      }
    } finally {
      const next = this.queue.shift();
      if (next) next(); // Transfer the occupied slot to the next waiter.
      else this.active--;
    }
  }

  get(key) { return this.run(() => this.store.get(key)); }
  set(key, value) { return this.run(() => this.store.set(key, value)); }
  clear() { return this.store.clear(); }
}

module.exports = LimitedCacheStore;
