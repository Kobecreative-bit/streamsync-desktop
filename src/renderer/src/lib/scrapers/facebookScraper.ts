export function getFacebookScraperScript(): string {
  return `
    (function() {
      try {
        const comments = [];
        const els = document.querySelectorAll(
          '[data-testid="UFI2Comment"], [class*="UFIComment"], ' +
          '[role="article"], [class*="comment"], ' +
          '[class*="live-comment-item"], [class*="chat-message"]'
        );
        els.forEach(el => {
          const userEl = el.querySelector(
            '.UFICommentActorName, [class*="UFICommentActorName"], ' +
            '[data-testid="UFI2Comment/author"], a[role="link"][tabindex="0"], ' +
            '[class*="author"], span[dir="auto"] > span[class*="weight"]'
          );
          const textEl = el.querySelector(
            '.UFICommentBody, [class*="UFICommentBody"], ' +
            '[data-testid="UFI2Comment/body"], ' +
            '[dir="auto"]:not([class*="author"]), [class*="comment-body"]'
          );
          if (userEl && textEl) {
            const user = userEl.textContent.trim();
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
