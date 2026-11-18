const TOKEN_KEY = 'presensiku.token';

function withStorage<T>(action: (storage: Storage) => T): T | undefined {
  try {
    return action(localStorage);
  } catch {
    return undefined;
  }
}

export const tokenStorage = {
  get: (): string | null => withStorage((storage) => storage.getItem(TOKEN_KEY)) ?? null,
  set: (token: string) => withStorage((storage) => storage.setItem(TOKEN_KEY, token)),
  clear: () => withStorage((storage) => storage.removeItem(TOKEN_KEY)),
};
