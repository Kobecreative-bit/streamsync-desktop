export function getYouTubeScraperScript(): string {
  return `
    (function() {
      try {
        const comments = [];
        const els = document.querySelectorAll(
          'yt-live-chat-text-message-renderer, ' +
          'yt-live-chat-paid-message-renderer, ' +
          '[class*="style-scope yt-live-chat-item-list-renderer"] > div'
        );
        els.forEach(el => {
          const userEl = el.querySelector(
            '#author-name, [class*="author-name"], yt-live-chat-author-chip #author-name'
          );
          const textEl = el.querySelector(
            '#message, [id="message"], [class*="message"]'
          );
          if (userEl && textEl) {
            const user = userEl.textContent.trim();
            const text = textEl.textContent.trim();
            if (user && text) {
              comments.push({ user: user, text: text });
            }
          }
        });
        return comments.slice(-20);
      } catch(e) { return []; }
    })()
  `;
}
