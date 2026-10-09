/** @param {Date} date @param {'tr' | 'en'} locale */
export function siteClock(date, locale) {
 const language = locale === 'tr' ? 'tr-TR' : 'en-GB';
 return {
  date: new Intl.DateTimeFormat(language, {timeZone:'Europe/Istanbul',day:'numeric',month:'long',year:'numeric'}).format(date),
  time: new Intl.DateTimeFormat(language, {timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date),
  iso: date.toISOString()
 };
}
