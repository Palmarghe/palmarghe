(() => {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let frame = 0;
  let x = -300;
  let y = -300;
  addEventListener('pointermove', (event) => {
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      document.body.style.setProperty('--pointer-x', `${x}px`);
      document.body.style.setProperty('--pointer-y', `${y}px`);
      frame = 0;
    });
  }, { passive: true });
})();