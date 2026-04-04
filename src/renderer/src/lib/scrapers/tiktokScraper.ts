export function getTikTokScraperScript(): string {
  return `
    (function() {
      try {
        const comments = [];
        const els = document.querySelectorAll(
          '[class*="DivCommentItemContainer"], [class*="chat-item"], [data-e2e="comment-level-1"], ' +
          '[class*="tiktok-live-chat"] [class*="message-item"], [class*="DivChatMessageList"] > div'
        );
        els.forEach(el => {
          const userEl = el.querySelector(
            '[class*="SpanUserName"], [class*="user-name"], [data-e2e="comment-username-1"], ' +
            '[class*="nickname"], [class*="author-name"]'
          );
          const textEl = el.querySelector(
            '[class*="SpanComment"], [class*="comment-text"], [data-e2e="comment-level-1"] > span:last-child, ' +
            '[class*="message-content"], [class*="chat-text"]'
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
