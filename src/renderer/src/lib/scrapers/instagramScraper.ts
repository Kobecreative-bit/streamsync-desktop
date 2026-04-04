export function getInstagramScraperScript(): string {
  return `
    (function() {
      try {
        const comments = [];
        const els = document.querySelectorAll(
          '[class*="comment"], [role="listitem"], ' +
          '[class*="live-comment"], [class*="Comment"], ' +
          'ul[class*="comment"] > li, [class*="chat-line"]'
        );
        els.forEach(el => {
          const userEl = el.querySelector(
            '[class*="username"], [class*="UserName"], a[role="link"], ' +
            'span[class*="author"], [class*="commenter"]'
          );
          const textEl = el.querySelector(
            '[class*="comment-text"], span[class*="text"], ' +
            '[class*="Comment"] > span:last-child, [class*="message-body"]'
          );
          if (userEl && textEl) {
            const user = userEl.textContent.trim().replace(/^@/, '');
            const text = textEl.textContent.trim();
            if (user && text && user !== text) {
              comments.push({ user: user, text: text });
            }
          }
        });
        return comments.slice(-20);
      } catch(e) { return []; }
    })()
  `;
}
