export function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

export function trackTimeSpent(pageName, seconds) {
  trackEvent('time_spent', {
    page: pageName,
    seconds_spent: seconds,
  })
}
