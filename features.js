// While answer lists are being filled in, the site offers only the Daily Dive.
// Set to false to bring back Unlimited, Archive, Themed Packs and the Puffer Party preview.
export const dailyOnly = true;
export const modeAllowed = mode => !dailyOnly || mode === 'Daily';
