import { useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      setError(null)
    } catch {
      setError("Couldn't save — your changes may not persist.")
    }
  }, [key, value])

  return [value, setValue, error]
}
