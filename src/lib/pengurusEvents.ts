// Tiny cross-component signal: the Board (Pengurus) tab notifies any listener
// (e.g. the Dashboard readiness chip) the moment a position is added, edited,
// or removed — without coupling the two views through props.

type Listener = () => void;

const listeners = new Set<Listener>();

/** Subscribe to board changes. Returns an unsubscribe fn. */
export function onPengurusChanged(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Notify all subscribers that the board changed. */
export function emitPengurusChanged(): void {
  for (const cb of listeners) cb();
}
