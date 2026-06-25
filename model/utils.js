export function evalCondition(condition, st) {
  const { pain, energy, satiety, sensitivity, depravity, obedience, lewd, hygiene } = st
  return new Function('pain', 'energy', 'satiety', 'sensitivity', 'depravity', 'obedience', 'lewd', 'hygiene', `return (${condition})`)(pain, energy, satiety, sensitivity, depravity, obedience, lewd, hygiene)
}

export function beijingNow() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + 8 * 3600000)
}

export function calculateDays(startTimestamp) {
  if (!startTimestamp) return 1
  const now = Date.now()
  const diffDays = Math.floor((now - startTimestamp) / (24 * 60 * 60 * 1000))
  return diffDays + 1
}
