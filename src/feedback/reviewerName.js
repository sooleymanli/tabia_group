const STORAGE_KEY = 'tabia-guest:reviewer-name'

// Storage can be unavailable (private mode, blocked cookies); the name is then just not remembered.
export function readReviewerName() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function rememberReviewerName(name) {
  try {
    const value = name.trim()
    if (value) localStorage.setItem(STORAGE_KEY, value)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function forgetReviewerName() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
