const DEFAULT_TABS = ['posts', 'meshwrites'];

// Reads the profile tab requested in the URL (e.g. /profile?tab=meshwrites).
// Tabs the page does not support fall back to 'posts'.
export function getProfileTabFromUrl(allowedTabs = DEFAULT_TABS) {
  const requested = new URLSearchParams(window.location.search).get('tab');

  return allowedTabs.includes(requested) ? requested : 'posts';
}
