export type ReaderCommand = 'replay_sentence' | 'previous_sentence' | 'next_sentence';

type ShortcutEvent = Pick<KeyboardEvent, 'altKey' | 'key'>;

/** Returns a Listen Back command only for one of its documented Alt shortcuts. */
export function readerShortcutCommand(event: ShortcutEvent): ReaderCommand | undefined {
  if (!event.altKey) return undefined;
  if (event.key.toLowerCase() === 'r') return 'replay_sentence';
  if (event.key === 'ArrowRight') return 'next_sentence';
  if (event.key === 'ArrowLeft') return 'previous_sentence';
  return undefined;
}

/** Runs a keyboard command only when the page allows the reader. */
export function runReaderShortcut(
  command: ReaderCommand | undefined,
  copyRestricted: boolean,
  run: (command: ReaderCommand) => void,
): boolean {
  if (!command || copyRestricted) return false;
  run(command);
  return true;
}
