/**
 * Multi-academy tagging for level test submissions.
 *
 * Brainiac (or any partner) academy students take the level test via a URL
 * like `/level-test?academy=brainiac`. The first time that URL is loaded the
 * academy code is persisted to sessionStorage so it survives navigation
 * between sections of the test. All level_test_results inserts then tag the
 * row with this academy so the admin Results page can filter by academy.
 */
const STORAGE_KEY = 'levelTestAcademy';
const VALID = /^[a-z0-9_-]{2,32}$/i;

export function syncAcademyFromUrl(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('academy');
    if (fromUrl && VALID.test(fromUrl)) {
      sessionStorage.setItem(STORAGE_KEY, fromUrl.toLowerCase());
      return fromUrl.toLowerCase();
    }
  } catch {
    // ignore
  }
  return getCurrentAcademy();
}

export function getCurrentAcademy(): string {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v && VALID.test(v)) return v.toLowerCase();
  } catch {
    // ignore
  }
  return 'brainiac';
}
