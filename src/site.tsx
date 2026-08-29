import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { nextIndex, previousIndex, splitSentences } from './reader';
import './site.css';

const sample = `On 14 March 2026, Dr. Mira Patel presented the city library's new late-hours plan to the East Ward council. The pilot keeps the study floor open until 9 p.m. on Tuesdays and Thursdays for six weeks. Patel said the $2.4 million proposal uses existing staff schedules, not new surveillance software. The U.S. Census Bureau estimates that 38% of nearby households have no quiet room for study. Council members will vote after the public comment session on 2 April.`;
const sentences = splitSentences(sample);
type Route = '/' | '/demo' | '/privacy' | '/terms' | '/404';
type SavedPlace = { scroll: [number, number]; focusId?: string };

const baseUrl = 'https://listen-back-reader.sociobot.in';
const routeDetails: Record<Route, { title: string; description: string; canonical: string }> = {
  '/': { title: 'Listen Back Reader — replay one sentence', description: 'Replay one web sentence at a time while the extension marks your place.', canonical: '/' },
  '/demo': { title: 'Demo — Listen Back Reader', description: 'Try a sample article with one sentence marked and ready to read aloud.', canonical: '/demo' },
  '/privacy': { title: 'Privacy — Listen Back Reader', description: 'Learn how Listen Back handles article text and browser speech.', canonical: '/privacy' },
  '/terms': { title: 'Terms — Listen Back Reader', description: 'Read the simple terms for using Listen Back Reader.', canonical: '/terms' },
  '/404': { title: 'Page not found — Listen Back Reader', description: 'This Listen Back Reader page could not be found.', canonical: '/404' },
};

function setMeta(selector: string, value: string) {
  const node = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (node) node instanceof HTMLLinkElement ? node.href = value : node.content = value;
}

function currentRoute(): Route {
  if (location.pathname === '/' && new URLSearchParams(location.search).get('demo') === '1') return '/demo';
  return ['/', '/demo', '/privacy', '/terms'].includes(location.pathname) ? location.pathname as Route : '/404';
}

function currentPlace(): SavedPlace {
  const active = document.activeElement as HTMLElement | null;
  return { scroll: [scrollX, scrollY], focusId: active?.id || undefined };
}

function useRoute() {
  const [route, setRoute] = useState(currentRoute);
  const [navigationKey, setNavigationKey] = useState(0);
  const restore = useRef<SavedPlace | null>(null);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    if (!history.state?.listenBack) {
      history.replaceState({ ...(history.state ?? {}), listenBack: currentPlace() }, '', location.href);
    }
    const savePlace = () => {
      history.replaceState({ ...(history.state ?? {}), listenBack: currentPlace() }, '', location.href);
    };
    const handlePopState = () => {
      restore.current = history.state?.listenBack ?? { scroll: [0, 0] };
      setRoute(currentRoute());
      setNavigationKey((key) => key + 1);
    };
    addEventListener('scroll', savePlace, { passive: true });
    addEventListener('focusin', savePlace);
    addEventListener('popstate', handlePopState);
    return () => {
      removeEventListener('scroll', savePlace);
      removeEventListener('focusin', savePlace);
      removeEventListener('popstate', handlePopState);
    };
  }, []);

  const go = (path: string) => {
    history.replaceState({ ...(history.state ?? {}), listenBack: currentPlace() }, '', location.href);
    history.pushState({ listenBack: { scroll: [0, 0] } }, '', path);
    restore.current = null;
    setRoute(currentRoute());
    setNavigationKey((key) => key + 1);
  };
  return { route, navigationKey, go, restore };
}

function Header({ go }: { go: (path: string) => void }) {
  return <>
    <a id="skip-main" className="skip" href="#main">Skip to main content</a>
    <header className="site-header">
      <a id="nav-home" className="wordmark" href="/" onClick={(event) => { event.preventDefault(); go('/'); }}><i aria-hidden="true">◉</i> Listen Back</a>
      <nav aria-label="Primary">
        <a id="nav-demo" href="/demo?demo=1" onClick={(event) => { event.preventDefault(); go('/demo?demo=1'); }}>Demo</a>
        <a id="nav-how" href="/#how" onClick={(event) => { event.preventDefault(); go('/#how'); }}>How it works</a>
        <a id="nav-privacy" href="/privacy" onClick={(event) => { event.preventDefault(); go('/privacy'); }}>Privacy</a>
      </nav>
    </header>
  </>;
}

function Footer({ go }: { go: (path: string) => void }) {
  return <footer className="site-footer">
    <p>Replay one sentence without losing your place.</p>
    <nav aria-label="Footer">
      <a id="footer-privacy" href="/privacy" onClick={(event) => { event.preventDefault(); go('/privacy'); }}>Privacy</a>
      <a id="footer-terms" href="/terms" onClick={(event) => { event.preventDefault(); go('/terms'); }}>Terms</a>
      <a href="https://sociobot.in" rel="external">Built by Param Factory (external)</a>
    </nav>
    <small>v1.0.0</small>
  </footer>;
}

function DemoBanner({ reset, startForReal }: { reset: () => void; startForReal: () => void }) {
  return <aside className="demo-banner" aria-label="Demo mode">
    <span><b>Demo</b> — sample data, nothing is saved.</span>
    <span><button id="reset-demo" onClick={reset}>Reset demo</button><button id="demo-start" onClick={startForReal}>Install the extension</button></span>
  </aside>;
}

function cancelBrowserSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // A browser voice can disappear while the reader is open. The UI still resets.
  }
}

function ReaderDemo({ initialIndex = 2 }: { initialIndex?: number }) {
  const [index, setIndex] = useState(initialIndex);
  const [slow, setSlow] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => () => cancelBrowserSpeech(), []);

  const stop = () => {
    cancelBrowserSpeech();
    setSpeaking(false);
    setStatus('Reading stopped.');
  };
  const speak = () => {
    const sentence = sentences[index];
    if (!sentence || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance !== 'function') {
      setSpeaking(false);
      setStatus('Speech is unavailable. Enable a browser voice, then try again.');
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence.text);
    utterance.rate = slow ? .8 : 1;
    utterance.onend = () => {
      setSpeaking(false);
      setStatus(`Finished sentence ${index + 1}.`);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setStatus('The browser voice could not read this sentence. Enable a browser voice, then try again.');
    };
    setSpeaking(true);
    setStatus(`Reading sentence ${index + 1}.`);
    try {
      speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(false);
      setStatus('The browser voice could not read this sentence. Enable a browser voice, then try again.');
    }
  };
  const previous = () => {
    if (speaking) stop();
    setIndex(previousIndex(index, sentences.length));
  };
  const next = () => {
    if (speaking) stop();
    setIndex(nextIndex(index, sentences.length));
  };

  return <section className="reader-shell" aria-label="Sample reader">
    <div className="reader-top"><span className="source-dot" aria-hidden="true">●</span><span>Sample article</span><span className="counter">Sentence {index + 1} / {sentences.length}</span></div>
    <div className="reader-controls reader-controls-top" aria-label="Reading controls">
      <button onClick={previous}>← Previous sentence</button>
      <button className="listen" onClick={speaking ? stop : speak}>{speaking ? 'Stop reading' : 'Read highlighted sentence'}{!speaking && <small>Uses your browser voice</small>}</button>
      <button onClick={next}>Next sentence →</button>
      <button onClick={() => setSlow(!slow)}>{slow ? 'Use normal speed' : 'Use 0.8× speed'}</button>
    </div>
    <p className="reader-status" aria-live="polite">{status}</p>
    <article className="sample-text">{sentences.map((sentence) => <p key={sentence.id} className={sentence.id === index ? 'active-sentence' : undefined} aria-current={sentence.id === index ? 'true' : undefined}>{sentence.text}</p>)}</article>
  </section>;
}

function Home({ go }: { go: (path: string) => void }) {
  return <main id="main" tabIndex={-1}>
    <section className="hero">
      <div className="hero-copy">
        <p className="kicker">A browser extension that reads one sentence at a time</p>
        <h1 id="home-heading" tabIndex={-1}>Replay each sentence. Keep your place.</h1>
        <p className="lede">For readers who lose their place in dense web text.</p>
        <div className="actions"><a id="hero-demo" className="primary" href="/demo?demo=1" onClick={(event) => { event.preventDefault(); go('/demo?demo=1'); }}>Try it with sample data</a><span>Open a sample article with one sentence marked.</span></div>
        <ul className="facts">
          <li>Listen Back does not send article text to a Listen Back server.</li>
          <li>Extension controls work offline after an article loads; speech depends on your browser voice.</li>
          <li>Free and account-free.</li>
          <li>Extension requires desktop Chrome or Chromium; the demo works on mobile.</li>
        </ul>
      </div>
      <figure><img src="/hero.webp" srcSet="/hero-mobile.webp 768w, /hero.webp 1536w" sizes="(max-width: 700px) calc(100vw - 32px), 45vw" width="1536" height="1024" fetchPriority="high" decoding="async" alt="An ink-and-paper illustration of a marked article sentence looping back through sound waves." /><figcaption>Print-style illustration for Listen Back Reader.</figcaption></figure>
    </section>
    <section className="product-preview" aria-labelledby="preview-heading">
      <div><p className="kicker">The reader</p><h2 id="preview-heading">One sentence stays visible while you listen.</h2><p>The extension marks the source sentence. Replay it until you understand it, then move to the next sentence.</p></div>
      <ReaderDemo />
    </section>
    <section id="how" className="how" aria-labelledby="how-heading">
      <p className="kicker">How it works</p><h2 id="how-heading" tabIndex={-1}>Read web text in three steps.</h2>
      <ol><li><b>Open an article.</b><span>Choose a page with the text you want to hear.</span></li><li><b>Read the sentence.</b><span>Listen Back finds readable page text and marks the current sentence.</span></li><li><b>Replay or move on.</b><span>Use the popup or Alt + R, Alt + Left, and Alt + Right.</span></li></ol>
    </section>
    <section className="limits"><div><p className="kicker">What it does not do</p><h2>It reads the article. It does not rewrite it.</h2></div><p>Listen Back does not send article text to a Listen Back server, diagnose dyslexia, create voices, or save an account. It does not read pages that explicitly block copying.</p></section>
    <section id="install" className="download">
      <p className="kicker">Use it on ordinary web pages</p><h2 id="install-heading" tabIndex={-1}>Install the free extension.</h2><p>Desktop Chrome or Chromium only.</p><p>Download the ZIP and extract it. Open chrome://extensions and enable Developer mode. Choose Load unpacked and select the extracted folder.</p><a className="primary" href="/downloads/listen-back-reader.zip" download>Download extension zip</a>
    </section>
  </main>;
}

function Demo({ go }: { go: (path: string) => void }) {
  const [key, setKey] = useState(0);
  const reset = () => {
    cancelBrowserSpeech();
    setKey((value) => value + 1);
  };
  const install = () => {
    cancelBrowserSpeech();
    go('/#install');
  };
  return <><DemoBanner reset={reset} startForReal={install} /><main id="main" tabIndex={-1} className="demo-page"><p className="kicker">Sample article</p><h1 id="demo-heading" tabIndex={-1}>Read one highlighted sentence.</h1><p className="lede">Try browser speech on a city library report. The sample stays separate from your data.</p><ReaderDemo key={key} initialIndex={0} /><p className="help">Use the controls above the article to replay, stop, change speed, or move through its sentences.</p></main></>;
}

function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy';
  return <main id="main" tabIndex={-1} className="legal"><p className="kicker">Listen Back Reader</p><h1 id={`${kind}-heading`} tabIndex={-1}>{privacy ? 'How Listen Back handles article text.' : 'Simple terms for a free reader.'}</h1>{privacy ? <><h2>No accounts or analytics</h2><p>The extension uses your browser’s speech service. Listen Back does not send article text to a Listen Back server.</p><h2>What stays in memory</h2><p>The current sentence and speed stay in memory while you read. The extension does not create a reading history.</p><h2>Page permission</h2><p>The extension reads visible article text only after you invoke it on the active page. It skips pages that explicitly block copying.</p></> : <><h2>Use the source responsibly</h2><p>Listen Back reads text already shown in your browser. You are responsible for following a site’s terms and copyright rules.</p><h2>No guarantee of availability</h2><p>Browser speech voices and page layouts vary. The extension is provided free, as available.</p></>}</main>;
}

function NotFound({ go }: { go: (path: string) => void }) {
  return <main id="main" tabIndex={-1} className="legal not-found"><p className="kicker">Page not found</p><h1 id="not-found-heading" tabIndex={-1}>We could not find this page.</h1><p>Return to the Listen Back Reader home page.</p><button className="primary" onClick={() => go('/')}>Go to home</button></main>;
}

function App() {
  const { route, navigationKey, go, restore } = useRoute();
  useLayoutEffect(() => {
    const details = routeDetails[route];
    document.title = details.title;
    setMeta('meta[name="description"]', details.description);
    setMeta('link[rel="canonical"]', `${baseUrl}${details.canonical}`);
    setMeta('meta[property="og:title"]', details.title);
    setMeta('meta[property="og:description"]', details.description);
    setMeta('meta[property="og:url"]', `${baseUrl}${details.canonical}`);
    setMeta('meta[name="twitter:title"]', details.title);
    setMeta('meta[name="twitter:description"]', details.description);
    const saved = restore.current;
    requestAnimationFrame(() => {
      if (navigationKey === 0 && !location.hash && !saved) return;
      if (saved) {
        scrollTo(...saved.scroll);
        const target = saved.focusId ? document.getElementById(saved.focusId) : document.querySelector<HTMLElement>('main h1');
        target?.focus({ preventScroll: true });
        return;
      }
      const hashTarget = location.hash ? document.getElementById(`${location.hash.slice(1)}-heading`) ?? document.querySelector<HTMLElement>(location.hash) : null;
      scrollTo(0, 0);
      if (hashTarget instanceof HTMLElement) {
        hashTarget.focus();
        hashTarget.scrollIntoView();
      } else {
        document.querySelector<HTMLElement>('main h1')?.focus();
      }
    });
  }, [route, navigationKey, restore]);
  return <><Header go={go} />{route === '/' ? <Home go={go} /> : route === '/demo' ? <Demo go={go} /> : route === '/privacy' ? <Legal kind="privacy" /> : route === '/terms' ? <Legal kind="terms" /> : <NotFound go={go} />}<Footer go={go} /><div className="route-live" aria-live="polite">{route === '/' ? 'Home' : route.slice(1) || 'Home'} page</div></>;
}

createRoot(document.getElementById('root')!).render(<App />);
