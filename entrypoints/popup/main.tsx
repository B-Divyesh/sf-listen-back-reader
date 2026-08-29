import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

type State = {
  count: number;
  current: number;
  text: string;
  rate: number;
  speaking: boolean;
  speechError: string;
};
const initial: State = { count: 0, current: 0, text: '', rate: 1, speaking: false, speechError: '' };

function App() {
  const [state, setState] = useState<State>(initial);
  const [error, setError] = useState('');
  const tab = async () => (await browser.tabs.query({ active: true, currentWindow: true }))[0];
  const applyState = (response: State & { error?: string }) => {
    if (response?.error || response?.speechError) setError(response.error || response.speechError);
    else setError('');
    if (response?.count) setState(response);
  };
  const refresh = async () => {
    try {
      const active = await tab();
      if (!active?.id) throw new Error('No active page.');
      const response = await browser.runtime.sendMessage({ type: 'listen-back-activate', tabId: active.id });
      if (response?.count === 0) setError(response?.error || 'No readable text was found here. Open an article, then try again.');
      else applyState(response);
    } catch {
      setError('This page cannot be read by the extension. Try an ordinary web article.');
    }
  };
  useEffect(() => {
    const receive = (message: unknown) => {
      const response = message as State & { type?: string; error?: string };
      if (response.type === 'listen-back-state') applyState(response);
    };
    browser.runtime.onMessage.addListener(receive);
    refresh();
    return () => browser.runtime.onMessage.removeListener(receive);
  }, []);
  const control = async (action: string) => {
    try {
      const active = await tab();
      if (!active?.id) return;
      const response = await browser.tabs.sendMessage(active.id, { type: 'listen-back-control', action });
      applyState(response);
    } catch {
      setError('The page changed. Reload it, then try again.');
    }
  };
  return <main>
    <header><span className="brand-mark" aria-hidden="true">◉</span><div><span className="popup-wordmark">Listen Back</span><h1>Read one sentence</h1></div></header>
    <section className="status" aria-live="polite">
      {error ? <p className="error">{error}</p> : state.count ? <><p className="eyebrow">Sentence {state.current + 1} of {state.count}</p><p className="quote">{state.text}</p></> : <p>Checking this page…</p>}
    </section>
    <div className="controls" aria-label="Reading controls">
      <button onClick={() => control('previous')} aria-label="Previous sentence">←</button>
      <button className="play" onClick={() => control(state.speaking ? 'stop' : 'start')}>{state.speaking ? 'Stop reading' : 'Read sentence'}</button>
      <button onClick={() => control('next')} aria-label="Next sentence">→</button>
    </div>
    <div className="minor"><button onClick={() => control('replay')}>Replay sentence (Alt R)</button><button onClick={() => control('slow')}>{state.rate === .8 ? 'Use normal speed' : 'Use 0.8× speed'}</button></div>
    <footer><span>Listen Back does not send article text to a Listen Back server.</span><button onClick={refresh}>Refresh page</button></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
