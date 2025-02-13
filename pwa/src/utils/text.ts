export function getCountForm(count: number): 'one' | 'few' | 'many' {
  count = Math.abs(count)
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastDigit === 1 && lastTwoDigits !== 11) return 'one'
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) return 'few'
  return 'many'
} 