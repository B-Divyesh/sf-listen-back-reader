import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

type State = { count: number; current: number; text: string; rate: number };
const initial: State = { count: 0, current: 0, text: '', rate: 1 };

function App() {
  const [state, setState] = useState<State>(initial);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const tab = async () => (await browser.tabs.query({ active: true, currentWindow: true }))[0];
  const refresh = async () => {
    try {
      const active = await tab();
      if (!active?.id) throw new Error('No active page.');
      const response = await browser.runtime.sendMessage({ type: 'listen-back-activate', tabId: active.id });
      if (response?.count === 0) setError(response?.error || 'No readable text was found here. Open an article, then try again.');
      else { setState(response); setError(''); }
    } catch { setError('This page cannot be read by the extension. Try an ordinary web article.'); }
  };
  useEffect(() => { refresh(); }, []);
  const control = async (action: string) => {
    try {
      const active = await tab();
      if (!active?.id) return;
      const response = await browser.tabs.sendMessage(active.id, { type: 'listen-back-control', action });
      if (response?.error) setError(response.error);
      await refresh();
    } catch { setError('The page changed. Reload it, then try again.'); }
  };
  return <main>
    <header><span className="brand-mark" aria-hidden="true">◉</span><div><span className="popup-wordmark">Listen Back</span><h1>Read one sentence</h1></div></header>
    <section className="status" aria-live="polite">
      {error ? <p className="error">{error}</p> : state.count ? <><p className="eyebrow">Sentence {state.current + 1} of {state.count}</p><p className="quote">{state.text}</p></> : <p>Checking this page…</p>}
    </section>
    <div className="controls" aria-label="Reading controls">
      <button onClick={() => control('previous')} aria-label="Previous sentence">←</button>
      <button className="play" onClick={() => { control(paused ? 'replay' : 'start'); setPaused(!paused); }}>{paused ? 'Replay sentence' : 'Read sentence'}</button>
      <button onClick={() => control('next')} aria-label="Next sentence">→</button>
    </div>
    <div className="minor"><button onClick={() => control('replay')}>Replay (Alt R)</button><button onClick={() => control('slow')}> {state.rate === .8 ? 'Normal speed' : 'Slow down'} </button></div>
    <footer><span>Text stays in your browser.</span><button onClick={refresh}>Refresh page</button></footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App />);
