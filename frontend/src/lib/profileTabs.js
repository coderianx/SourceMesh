// Reads the profile tab requested in the URL (e.g. /profile?tab=meshwrites).
export function getProfileTabFromUrl() {
  const requested = new URLSearchParams(window.location.search).get('tab');

  return requested === 'meshwrites' ? 'meshwrites' : 'posts';
}
