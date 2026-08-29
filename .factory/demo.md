# Demo sandbox

Open `/demo?demo=1` (or `?demo=1` from the landing page) to enter the reader sample.

The sample is a five-sentence original city-library report. It includes a name,
a date, an initialism, and a decimal. It exists only in React component state.
Resetting recreates that state; leaving demo discards it. No localStorage,
IndexedDB, extension storage, or network request is used by the demo.

The persistent banner provides **Reset demo** and **Install the extension**.
Reset demo stops active sample speech before restoring the sample. Install the
extension stops active sample speech, leaves the isolated sample, and opens the
desktop-extension installation steps. Neither action transfers sample state
into any real-data namespace.

The demo’s **Read highlighted sentence** control uses `SpeechSynthesisUtterance`,
the same browser speech API used by the extension. Test controls include read,
stop, previous sentence, next sentence, and speed. If speech is missing or
fails, the live status explains how to enable a browser voice.
