import type { Page } from '@playwright/test';

export async function measureCursorTracking(page: Page) {
  return page.evaluate(async () => {
    const cursor = document.querySelector('[data-brand-cursor]') as HTMLElement;
    const errors: number[] = [], intervals: number[] = [];
    let previous = 0;
    for (let index = 0; index < 40; index++) {
      const x = index % 2 ? innerWidth - 48 : 48;
      const y = index % 2 ? innerHeight - 48 : 48;
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y }));
      const timestamp = await new Promise<number>(resolve => requestAnimationFrame(resolve));
      const bounds = cursor.getBoundingClientRect();
      errors.push(Math.hypot(bounds.x + bounds.width / 2 - x, bounds.y + bounds.height / 2 - y));
      if (previous) intervals.push(timestamp - previous);
      previous = timestamp;
    }
    return { maximumError: Math.max(...errors), medianFrameMs: [...intervals].sort((a,b) => a-b)[Math.floor(intervals.length / 2)], samples: errors.length };
  });
}
