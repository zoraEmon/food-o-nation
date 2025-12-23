"use client";

export default function AttachEventPolyfill() {
  // No-op: Leaflet handlers are rewritten in MapPicker to avoid using
  // legacy attachEvent/detachEvent and global polyfills were removed.
  return null;
}
