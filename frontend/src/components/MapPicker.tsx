"use client";
import React, { useEffect, useRef } from 'react';

export interface MapPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange, className }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const containerIdRef = React.useRef<string>(() => `map-${Math.random().toString(36).slice(2,9)}`);
  const initializingRef = React.useRef(false);

  useEffect(() => {
    let Leaflet: any;
    let cssNode: HTMLLinkElement | null = null;

    async function init() {
      if (initializingRef.current) return; // avoid concurrent inits
      initializingRef.current = true;

      try {
        // ensure we don't double-initialize on hot reloads / StrictMode double-run
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            // ignore
          }
          mapInstanceRef.current = null;
        }

        Leaflet = await import('leaflet');

        // Rewrite Leaflet DomEvent addOne/removeOne to avoid legacy attachEvent/detachEvent
        try {
          const DomEvent: any = (Leaflet as any).DomEvent || {};
          const eventsKey = '_leaflet_events';
          const mouseSubst: any = { mouseenter: 'mouseover', mouseleave: 'mouseout', wheel: (!('onwheel' in window) && 'mousewheel') };

          const utilStamp = (Leaflet as any).Util && (Leaflet as any).Util.stamp ? (Leaflet as any).Util.stamp : (fn: any) => Math.random().toString(36).slice(2);

          const isExternalTarget = (obj: any, e: any) => {
            const related = e.relatedTarget || e.fromElement || e.toElement;
            return !related || (related !== obj && !obj.contains(related));
          };

          // Remove any non-function `attachEvent` properties on native prototypes
          try {
            if ((Element.prototype as any).attachEvent && typeof (Element.prototype as any).attachEvent !== 'function') {
              try { delete (Element.prototype as any).attachEvent; } catch (e) {}
            }
            if ((Document.prototype as any).attachEvent && typeof (Document.prototype as any).attachEvent !== 'function') {
              try { delete (Document.prototype as any).attachEvent; } catch (e) {}
            }
            if ((Window.prototype as any).attachEvent && typeof (Window.prototype as any).attachEvent !== 'function') {
              try { delete (Window.prototype as any).attachEvent; } catch (e) {}
            }
            if ((Object.prototype as any).attachEvent && typeof (Object.prototype as any).attachEvent !== 'function') {
              try { delete (Object.prototype as any).attachEvent; } catch (e) {}
            }
          } catch (e) {
            // ignore
          }

          // Implement a clean, modern on/off that never uses legacy attachEvent/detachEvent
          const eventsKeyLocal = eventsKey;

          const addOneModern = function (obj: any, type: string, fn: Function, context?: any) {
            const id = type + utilStamp(fn) + (context ? '_' + utilStamp(context) : '');
            if (obj[eventsKeyLocal] && obj[eventsKeyLocal][id]) return this;

            // handler that normalizes event object
            let handler = function (e: any) { return fn.call(context || obj, e || window.event); };

            // special-case mouseenter/mouseleave using mouseover/mouseout
            if (type === 'mouseenter' || type === 'mouseleave') {
              const mapped = mouseSubst[type] || type;
              const wrapped = (e: any) => {
                e = e || window.event;
                if (isExternalTarget(obj, e)) {
                  handler(e);
                }
              };
              try {
                if (obj && typeof obj.addEventListener === 'function') obj.addEventListener(mapped, wrapped, false);
                else if (typeof obj['on' + mapped] !== 'undefined') obj['on' + mapped] = wrapped;
              } catch (e) {}
              handler = wrapped;
            } else {
              // use addEventListener when possible
              try {
                if (obj && typeof obj.addEventListener === 'function') {
                  const eventName = mouseSubst[type] || type;
                  const options = ((Leaflet as any).Browser && (Leaflet as any).Browser.passiveEvents && (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel')) ? { passive: false } : false;
                  obj.addEventListener(eventName, handler, options as any);
                } else if (typeof obj['on' + type] !== 'undefined') {
                  obj['on' + type] = handler;
                } else {
                  // last-resort: attach as property
                  try { obj['on' + type] = handler; } catch (e) {}
                }
              } catch (e) {
                // swallow errors to avoid breaking init
              }
            }

            obj[eventsKeyLocal] = obj[eventsKeyLocal] || {};
            obj[eventsKeyLocal][id] = handler;
          };

          const removeOneModern = function (obj: any, type: string, fn: Function, context?: any, id?: any) {
            id = id || type + utilStamp(fn) + (context ? '_' + utilStamp(context) : '');
            const handler = obj[eventsKeyLocal] && obj[eventsKeyLocal][id];
            if (!handler) return this;

            try {
              const eventName = mouseSubst[type] || type;
              if (obj && typeof obj.removeEventListener === 'function') {
                try { obj.removeEventListener(eventName, handler, false); } catch (e) {}
              } else if (obj['on' + eventName] === handler) {
                try { obj['on' + eventName] = null; } catch (e) {}
              } else {
                // also try plain property cleanup
                if (obj['on' + type] === handler) {
                  try { obj['on' + type] = null; } catch (e) {}
                }
              }
            } catch (e) {
              // swallow
            }

            if (obj[eventsKeyLocal]) obj[eventsKeyLocal][id] = null;
          };

          // Override DomEvent.on/off to ensure internal calls use our modern implementations
          try {
            if (DomEvent) {
              (DomEvent as any).on = function(obj: any, types: any, fn: any, context: any) {
                if (types && typeof types === 'object') {
                  for (const type in types) {
                    addOneModern(obj, type, types[type], fn);
                  }
                } else {
                  types = (types || '').toString().split(/\s+/);
                  for (let i = 0; i < types.length; i++) {
                    addOneModern(obj, types[i], fn, context);
                  }
                }
                return this;
              };
              (DomEvent as any).off = function(obj: any, types: any, fn: any, context: any) {
                if (arguments.length === 1) {
                  // remove all
                  if (obj[eventsKeyLocal]) {
                    for (const id in obj[eventsKeyLocal]) {
                      obj[eventsKeyLocal][id] = null;
                    }
                    delete obj[eventsKeyLocal];
                  }
                } else if (types && typeof types === 'object') {
                  for (const type in types) {
                    removeOneModern(obj, type, types[type], fn);
                  }
                } else {
                  types = (types || '').toString().split(/\s+/);
                  if (arguments.length === 2) {
                    // remove all of these types
                    if (obj[eventsKeyLocal]) {
                      for (const id in obj[eventsKeyLocal]) {
                        const typeKey = id.split(/\d/)[0];
                        if (types.indexOf(typeKey) !== -1) {
                          removeOneModern(obj, typeKey, null, null, id);
                        }
                      }
                    }
                  } else {
                    for (let i = 0; i < types.length; i++) {
                      removeOneModern(obj, types[i], fn, context);
                    }
                  }
                }
                return this;
              };
            }
          } catch (e) {
            // ignore override errors
          }

        } catch (e) {
          // ignore rewrite failures — fallback behaviors still exist
        }

        // load css once
        if (!document.querySelector('link[data-leaflet]')) {
          cssNode = document.createElement('link');
          cssNode.setAttribute('data-leaflet', '1');
          cssNode.rel = 'stylesheet';
          cssNode.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          cssNode.crossOrigin = '';
          document.head.appendChild(cssNode);
        }

        // fix icon paths
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          delete (Leaflet.Icon.Default as any).prototype._getIconUrl;
          Leaflet.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
          });
        } catch (e) {
          // ignore icon fix errors
        }


        // Defensive: if the DOM container still has a leftover leaflet id, remove it so Leaflet won't throw
        try {
          const el = mapRef.current;
          if (el && (el as any)._leaflet_id) {
            try { delete (el as any)._leaflet_id; } catch(_) { /* ignore */ }
          }
        } catch (_) {}

        const center = [lat ?? 14.5995, lng ?? 120.9842];
        // Ensure the DOM container exists and is a real HTMLElement. Assign the
        // generated id to the element (so debugging and external libs can rely on it),
        // then pass the actual element into Leaflet to avoid any ambiguity.
        const containerEl = mapRef.current;
        try {
          if (!containerEl || !(containerEl instanceof HTMLElement)) {
            console.error('Map container is not an HTMLElement', containerEl);
            throw new Error('Invalid map container');
          }

          // set id for consistency/debugging
          try { containerEl.id = containerIdRef.current; } catch (e) {}

          // If someone set a non-function `attachEvent` directly on the element (rare), delete it
          if (Object.prototype.hasOwnProperty.call(containerEl, 'attachEvent') && typeof (containerEl as any).attachEvent !== 'function') {
            try { delete (containerEl as any).attachEvent; } catch (e) { /* ignore */ }
          }
        } catch (e) {
          console.error('Map initialization aborted due to invalid container:', e);
          initializingRef.current = false;
          return;
        }

        // create map using the element directly (safer than passing an id string)
        mapInstanceRef.current = Leaflet.map(containerEl).setView(center, 13);

        (Leaflet.tileLayer as any)('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        markerRef.current = Leaflet.marker(center).addTo(mapInstanceRef.current);

        mapInstanceRef.current.on('click', function(e:any) {
          const { latlng } = e;
          markerRef.current.setLatLng(latlng);
          onChange(latlng.lat, latlng.lng);
        });
      } catch (err) {
        console.error('Failed to initialize Leaflet map:', err);
      } finally {
        initializingRef.current = false;
      }
    }

    init();

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        // keep CSS in case other maps are mounted; remove only if we added it
        if (cssNode) cssNode.remove();
      } catch (e) {}
    };
  }, [lat, lng]);

  // Update marker when lat/lng props change
  useEffect(() => {
    if (markerRef.current && lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
      markerRef.current.setLatLng([lat, lng]);
      try {
        mapInstanceRef.current?.panTo([lat, lng]);
      } catch (e) {}
    }
  }, [lat, lng]);

  return (
    <div className={className}>
      <div ref={mapRef} style={{ width: '100%', height: 300 }} />
      <div className="text-xs text-gray-400 mt-2">Click on the map to set coordinates.</div>
    </div>
  );
};

export default MapPicker;
