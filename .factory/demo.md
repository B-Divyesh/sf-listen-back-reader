# Demo sandbox

Open `/demo` to enter the reader sample.

The sample is a five-sentence original article about retaining place in dense
text. It exists only in React component state. Resetting recreates that state;
leaving `/demo` discards it. No localStorage, IndexedDB, extension storage, or
network request is used by the demo.

The demo’s **Read sentence** control uses `SpeechSynthesisUtterance`, the same
native browser speech API used by the extension. Test controls include replay,
previous, next, and slow speed.
