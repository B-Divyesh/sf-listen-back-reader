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

  browser.runtime.onMessage.addListener((message: unknown) => {
    const request = message as { type?: string; tabId?: number };
    if (request.type === 'listen-back-activate' && typeof request.tabId === 'number') {
      return sendToReader(request.tabId, { type: 'listen-back-get-state' });
    }
  });

  browser.commands.onCommand.addListener(async (command: string) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await sendToReader(tab.id, { type: 'listen-back-command', command }).catch(() => undefined);
  });
});
