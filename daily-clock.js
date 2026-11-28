// When each Daily is played. Day numbers are unchanged (day N is the calendar date N·86400000, so
// 20784 is Nov 27, 2026), but since Nov 28, 2026 a Daily runs from midnight to midnight Pacific time
// on its date, not UTC. Shared by the client (bundled into game.js), the server and the scripts.
export const DAY_MS = 86400000;
const zone = 'America/Los_Angeles';
const pacificDate = new Intl.DateTimeFormat('en-US', {timeZone: zone, year: 'numeric', month: 'numeric', day: 'numeric'});

// The day number of the Pacific calendar date at a moment (Pacific Standard and Daylight Time alike).
export function pacificDay(time = Date.now()) {
  const part = type => Number(pacificDate.formatToParts(time).find(item => item.type === type).value);
  return Date.UTC(part('year'), part('month') - 1, part('day')) / DAY_MS;
}

// The Nov 28 Daily (20785) went live at midnight UTC under the old schedule and stays live until
// midnight Pacific on Nov 29, so the switch never brings back the Nov 27 Daily.
const FIRST_PACIFIC_DAY = 20785;
export const dailyDay = (time = Date.now()) => Math.max(pacificDay(time), FIRST_PACIFIC_DAY);

// The moment a day's Daily begins: midnight Pacific at the start of that date (7 or 8 hours after
// midnight UTC, depending on daylight saving time).
export function dailyStart(day) {
  for (const hours of [8, 7]) {
    const time = day * DAY_MS + hours * 3600000;
    if (pacificDay(time) === day && pacificDay(time - 1) === day - 1) return time;
  }
  throw new Error('No Pacific midnight found for day ' + day);
}
