export function getTimezoneDiff() {
  // UTC offset in ms
  const timeZoneOffset = (new Date().getTimezoneOffset() * -1) / 60
  // EDT is UTC-4
  const EDTOffset = -4
  const timeZoneDiff = EDTOffset - timeZoneOffset
  return timeZoneDiff * 60 * 60 * 1000
}

export function getEDTHours(
  fromHour: number,
  fromMin: number,
  toHour: number,
  toMin: number
) {
  function lastFriday(d: Date) {
    // sunday
    if (d.getDay() === 0) {
      return new Date(d.getTime() - 2 * 24 * 60 * 60 * 1000)
    } else if (d.getDay() === 6) {
      return new Date(d.getTime() - 1 * 24 * 60 * 60 * 1000)
    }
    return d
  }
  const timeZoneDiff = getTimezoneDiff()
  let openEDT = new Date(Date.now())
  openEDT.setHours(fromHour, fromMin, 0, 0)
  openEDT = lastFriday(openEDT)
  const open = new Date(openEDT.getTime() - timeZoneDiff)
  let closeEDT = new Date(Date.now())
  closeEDT.setHours(toHour, toMin, 0, 0)
  closeEDT = lastFriday(closeEDT)
  const close = new Date(closeEDT.getTime() - timeZoneDiff)
  return { open, close }
}

export function getTradingHours() {
  // 7:00 - 9:30
  let preMarket = getEDTHours(7, 0, 9, 30)
  // 9:30 - 16:00
  let marketOpen = getEDTHours(9, 30, 16, 0)
  // 16:00 - 20:00
  let afterHours = getEDTHours(16, 0, 20, 0)
  return { preMarket, marketOpen, afterHours }
}
