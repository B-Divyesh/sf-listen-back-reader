export default defineBackground(() => {
  const sendToReader = async (tabId: number, message: object) => {
    try {
      return await browser.tabs.sendMessage(tabId, message);
    } catch {
      await browser.scripting.executeScript({
        target: { tabId },
        files: ['/content-scripts/content.js'],
      });
      return browser.tabs.sendMessage(tabId, message);
    }
  };

  // The popup talks to the background first. Keep that asynchronous hop on
  // Chromium's documented sendResponse channel as well.
  type SendResponse = (response: unknown) => void;
  const messageEvent = browser.runtime.onMessage as unknown as {
    addListener(listener: (message: unknown, sender: unknown, sendResponse?: SendResponse) => unknown): void;
  };
  messageEvent.addListener((message: unknown, _sender: unknown, sendResponse?: SendResponse) => {
    const request = message as { type?: string; tabId?: number };
    if (request.type === 'listen-back-activate' && typeof request.tabId === 'number') {
      const response = sendToReader(request.tabId, { type: 'listen-back-get-state' });
      if (sendResponse) {
        response.then(sendResponse).catch((error: unknown) => sendResponse({ error: error instanceof Error ? error.message : 'This page cannot be read by the extension.' }));
        return true;
      }
      return response;
    }
    return undefined;
  });

  browser.commands.onCommand.addListener(async (command: string) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await sendToReader(tab.id, { type: 'listen-back-command', command }).catch(() => undefined);
  });
});
