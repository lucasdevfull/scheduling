export function srtToTime(value: string) {
  const [H, M, S] = value.split(':').map(Number)
  //const [endH, endM] = a.endTime.split(':').map(Number)
  return new Date(Date.UTC(1970, 0, 1, H, M))
}
