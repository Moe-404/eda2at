const STORAGE_KEY = 'sabeel-reader-session-id';

/**
 * Stable anonymous id used to attribute reading-progress rows to a browser,
 * without requiring an account. Persisted in localStorage.
 */
export function getReaderSessionId() {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
        id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
        localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
}
