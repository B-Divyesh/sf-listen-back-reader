import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Listen Back Reader',
    description: 'Replay one sentence at a time without losing your place.',
    permissions: ['activeTab', 'storage'],
    commands: {
      replay_sentence: { suggested_key: { default: 'Alt+R' }, description: 'Replay the current sentence' },
      previous_sentence: { suggested_key: { default: 'Alt+Left' }, description: 'Previous sentence' },
      next_sentence: { suggested_key: { default: 'Alt+Right' }, description: 'Next sentence' },
    },
  },
});
