import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_TTL_MS = 60 * 60 * 1000;

export function isCacheFresh(storedAt: number | null | undefined): boolean {
  if (typeof storedAt !== 'number' || !Number.isFinite(storedAt)) return false;
  return Date.now() - storedAt < CACHE_TTL_MS;
}

export async function readCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as { storedAt?: number; data?: T };
    if (!isCacheFresh(parsed.storedAt)) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return parsed.data ?? null;
  } catch {
    await AsyncStorage.removeItem(key).catch(() => {});
    return null;
  }
}

export async function writeCachedData<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(
    key,
    JSON.stringify({ storedAt: Date.now(), data }),
  );
}
