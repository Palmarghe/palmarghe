import {siteClock} from './site-clock-format.js';
const clocks = document.querySelectorAll('[data-site-clock]');
let timer;
function update() {
 clearTimeout(timer);
 if (document.hidden) return;
 const now = new Date();
 clocks.forEach(node => {
  const value = siteClock(now, node.getAttribute('data-locale') === 'en' ? 'en' : 'tr');
  const time = node.querySelector('time');
  if (time) time.dateTime = value.iso;
  const date = node.querySelector('[data-clock-date]');
  const hour = node.querySelector('[data-clock-hour]');
  if (date) date.textContent = value.date;
  if (hour) hour.textContent = value.time;
 });
 timer = setTimeout(update, 60000 - now.getTime() % 60000 + 25);
}
update();
document.addEventListener('visibilitychange', update);
window.addEventListener('pagehide', () => {clearTimeout(timer);document.removeEventListener('visibilitychange', update);});
window.addEventListener('pageshow', event => {if(event.persisted){document.addEventListener('visibilitychange', update);update();}});
