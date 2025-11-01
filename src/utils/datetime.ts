export function srtToTime(value: string) {
  const [H, M, S] = value.split(':').map(Number)
  const date = new Date()
  date.setUTCHours(H, M)
  return date
}
