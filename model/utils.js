export function evalCondition(condition, st) {
  const { pain, energy, satiety, sensitivity, depravity, obedience, lewd, hygiene } = st
  return eval(condition)
}

export function calculateDays(startTimestamp) {
  if (!startTimestamp) return 1
  const now = Date.now()
  const diffDays = Math.floor((now - startTimestamp) / (24 * 60 * 60 * 1000))
  return diffDays + 1
}
