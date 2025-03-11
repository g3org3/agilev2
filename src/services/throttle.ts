/* eslint-disable @typescript-eslint/ban-ts-comment */

const cache: Record<string, number | null> = {}

// @ts-expect-error
export function throttle(func, delay) {
  const fnid = 'id' + Math.random().toString(16).slice(2)

  // @ts-expect-error
  return (...args) => {
    if (cache[fnid] !== null) {
      clearTimeout(cache[fnid])
    }

    const id = setTimeout(() => {
      console.log('invalidating')
      func(...args)
    }, delay)

    cache[fnid] = id
  }
}
