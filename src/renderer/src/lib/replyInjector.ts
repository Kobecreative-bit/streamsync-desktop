type Platform = 'tiktok' | 'youtube' | 'instagram' | 'facebook'

export function getReplyInjectorScript(platform: Platform, text: string): string {
  const escaped = text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')

  switch (platform) {
    case 'tiktok':
      return `
        (function() {
          try {
            const input = document.querySelector(
              '[class*="DivInputContainer"] textarea, ' +
              '[class*="chat-input"] textarea, ' +
              '[data-e2e="comment-input"] textarea, ' +
              'textarea[placeholder*="comment"], ' +
              'textarea[placeholder*="chat"], ' +
              '[class*="tiktok-live"] textarea'
            );
            if (!input) return false;
            const nativeSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype, 'value'
            ).set;
            nativeSetter.call(input, '${escaped}');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            const sendBtn = document.querySelector(
              '[class*="DivSendButton"], [class*="send-btn"], ' +
              '[data-e2e="comment-post"], button[type="submit"]'
            );
            if (sendBtn) {
              setTimeout(() => sendBtn.click(), 100);
            }
            return true;
          } catch(e) { return false; }
        })()
      `

    case 'youtube':
      return `
        (function() {
          try {
            const input = document.querySelector(
              '#input[contenteditable="true"], ' +
              'yt-live-chat-text-input-field-renderer #input, ' +
              '[id="input"][contenteditable], ' +
              'div[contenteditable="true"][aria-label*="chat"]'
            );
            if (!input) return false;
            input.focus();
            input.textContent = '${escaped}';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            const sendBtn = document.querySelector(
              '#send-button button, ' +
              'yt-button-renderer#send-button button, ' +
              '[id="send-button"] button, ' +
              'button[aria-label*="Send"]'
            );
            if (sendBtn) {
              setTimeout(() => sendBtn.click(), 100);
            }
            return true;
          } catch(e) { return false; }
        })()
      `

    case 'instagram':
      return `
        (function() {
          try {
            const input = document.querySelector(
              'textarea[placeholder*="comment" i], ' +
              'textarea[placeholder*="message" i], ' +
              '[contenteditable="true"][role="textbox"], ' +
              'form textarea'
            );
            if (!input) return false;
            if (input.tagName === 'TEXTAREA') {
              const nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, 'value'
              ).set;
              nativeSetter.call(input, '${escaped}');
            } else {
              input.focus();
              input.textContent = '${escaped}';
            }
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            const sendBtn = document.querySelector(
              'button[type="submit"], ' +
              '[class*="submit"], ' +
              'form button:not([type="button"])'
            );
            if (sendBtn) {
              setTimeout(() => sendBtn.click(), 100);
            }
            return true;
          } catch(e) { return false; }
        })()
      `

    case 'facebook':
      return `
        (function() {
          try {
            const input = document.querySelector(
              '[contenteditable="true"][role="textbox"], ' +
              '[data-testid="UFI2CommentInput"], ' +
              'div[contenteditable="true"][aria-label*="comment" i], ' +
              'div[contenteditable="true"][aria-label*="Write" i], ' +
              'form [contenteditable="true"]'
            );
            if (!input) return false;
            input.focus();
            input.textContent = '${escaped}';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new InputEvent('input', {
              bubbles: true,
              inputType: 'insertText',
              data: '${escaped}'
            }));
            const sendBtn = input.closest('form')?.querySelector(
              'button[type="submit"], [aria-label*="submit" i], [aria-label*="send" i], ' +
              '[class*="send"], [data-testid*="send"]'
            );
            if (sendBtn) {
              setTimeout(() => sendBtn.click(), 100);
            }
            return true;
          } catch(e) { return false; }
        })()
      `
  }
}

export async function sendReply(
  webview: Electron.WebviewTag,
  platform: Platform,
  text: string
): Promise<boolean> {
  try {
    const script = getReplyInjectorScript(platform, text)
    const result = await webview.executeJavaScript(script)
    return result === true
  } catch {
    return false
  }
}
