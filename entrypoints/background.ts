export default defineBackground(() => {
  browser.commands.onCommand.addListener(async (command: string) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await browser.tabs.sendMessage(tab.id, { type: 'listen-back-command', command }).catch(() => undefined);
  });
});
