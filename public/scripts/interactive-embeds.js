(() => {
  const allowedHosts = new Set(['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com']);

  document.addEventListener('click', (event) => {
    const trigger = event.target instanceof Element ? event.target.closest('[data-embed-trigger]') : null;
    const embed = trigger?.closest('[data-content-embed]');
    if (!trigger || !embed) return;

    let source;
    try {
      source = new URL(embed.dataset.embedSrc ?? '');
    } catch {
      return;
    }
    const validPath = (source.hostname === 'player.vimeo.com' && source.pathname.startsWith('/video/'))
      || (['www.youtube.com', 'www.youtube-nocookie.com'].includes(source.hostname) && source.pathname.startsWith('/embed/'));
    if (source.protocol !== 'https:' || !allowedHosts.has(source.hostname) || !validPath) return;

    const frame = document.createElement('iframe');
    frame.src = source.href;
    frame.title = embed.dataset.embedTitle || 'Embedded video';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
    frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    frame.allowFullscreen = true;
    trigger.replaceWith(frame);
  });
})();
