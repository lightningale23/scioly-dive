// When each Daily is played. Day numbers name the Dailies (day N is the calendar date N·86400000, so
// 20784 is Nov 27, 2026). Through 20785 a Daily ran midnight to midnight UTC on its date. From 20786 on,
// every Daily was moved forward a day: Daily N runs midnight to midnight Pacific time on date N - 1
// (the Nov 29 Daily on Pacific Nov 28, and so on). The Nov 28 Daily (20785), which began at midnight UTC
// Nov 28, ends at midnight Pacific that night. Shared by the client (bundled into game.js), the server
// and the scripts.
export const DAY_MS = 86400000;
const zone = 'America/Los_Angeles';
const pacificDate = new Intl.DateTimeFormat('en-US', {timeZone: zone, year: 'numeric', month: 'numeric', day: 'numeric'});
const FIRST_SHIFTED_DAY = 20786;

// The day number of the Pacific calendar date at a moment (Pacific Standard and Daylight Time alike).
export function pacificDay(time = Date.now()) {
  const part = type => Number(pacificDate.formatToParts(time).find(item => item.type === type).value);
  return Date.UTC(part('year'), part('month') - 1, part('day')) / DAY_MS;
}

// The Daily live at a moment (valid from midnight UTC Nov 28, 2026 on).
export const dailyDay = (time = Date.now()) => pacificDay(time) + 1;

// The calendar date (as a day number) a Daily is played on, for showing to players.
export const playDay = day => day >= FIRST_SHIFTED_DAY ? day - 1 : day;

// Midnight Pacific at the start of a calendar date (7 or 8 hours after midnight UTC).
function pacificMidnight(date) {
  for (const hours of [8, 7]) {
    const time = date * DAY_MS + hours * 3600000;
    if (pacificDay(time) === date && pacificDay(time - 1) === date - 1) return time;
  }
  throw new Error('No Pacific midnight found for day ' + date);
}

// The moment a Daily begins.
export const dailyStart = day => day < FIRST_SHIFTED_DAY ? day * DAY_MS : pacificMidnight(day - 1);
