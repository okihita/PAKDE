// Tiny cross-component signal: the Members tab notifies any listener
// (e.g. the Beranda campaign scene) the moment the member list changes —
// without coupling the two views through props.

type Listener = () => void;

const listeners = new Set<Listener>();

/** Subscribe to member-list changes. Returns an unsubscribe fn. */
export function onMembersChanged(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Notify all subscribers that the member list changed. */
export function emitMembersChanged(): void {
  for (const cb of listeners) cb();
}
