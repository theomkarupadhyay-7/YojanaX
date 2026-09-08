import { useCallback, useMemo, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

// ---------------------------------------------------------------------------
// Mock / demo partner data generator
// Generates temporary partners around the user's coordinates so the UI can
// be demonstrated before real backend data is available.
// ---------------------------------------------------------------------------
function generateMockPartners(lat, lng) {
  const templates = [
    { name: 'State Bank of India – Branch Office', type: 'Banks', offsetLat: 0.008, offsetLng: 0.005 },
    { name: 'Punjab National Bank – MSME Branch', type: 'Banks', offsetLat: -0.006, offsetLng: 0.009 },
    { name: 'Bank of Baroda – Financial Inclusion Branch', type: 'Banks', offsetLat: 0.012, offsetLng: -0.004 },
    { name: 'State Channelizing Agency – District Office', type: 'SCA', offsetLat: -0.010, offsetLng: -0.007 },
    { name: 'SC / ST Development Corporation – Regional Centre', type: 'SCA', offsetLat: 0.003, offsetLng: -0.012 },
    { name: 'Grameen Koota Financial Services', type: 'NBFC-MFI', offsetLat: -0.014, offsetLng: 0.002 },
    { name: 'Bandhan Financial Services – MFI Branch', type: 'NBFC-MFI', offsetLat: 0.006, offsetLng: 0.013 },
    { name: 'Ujjivan Small Finance Bank – MFI Desk', type: 'NBFC-MFI', offsetLat: -0.003, offsetLng: -0.015 },
  ];

  return templates.map((t, i) => {
    const pLat = lat + t.offsetLat + (Math.random() - 0.5) * 0.002;
    const pLng = lng + t.offsetLng + (Math.random() - 0.5) * 0.002;
    const dist = Math.sqrt((pLat - lat) ** 2 + (pLng - lng) ** 2) * 111;
    return {
      id: i + 1,
      name: t.name,
      type: t.type,
      lat: pLat,
      lng: pLng,
      distance: `${dist.toFixed(1)} km`,
      distanceKm: dist,
    };
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BackButton({ onClick }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-slate-100 hover:text-saffron-600 cursor-pointer"
      onClick={onClick}
      type="button"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back
    </button>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      className={`rounded-full border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
        active
          ? 'border-navy-900 bg-navy-900 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function PartnerCard({ partner }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}`;

  const typeColor = {
    Banks: 'bg-blue-50 text-blue-700 border-blue-200',
    SCA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'NBFC-MFI': 'bg-purple-50 text-purple-700 border-purple-200',
  }[partner.type] ?? 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-navy-900 leading-snug">{partner.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${typeColor}`}>
              {partner.type}
            </span>
            <span className="text-xs text-slate-500">≈ {partner.distance}</span>
          </div>
        </div>
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-saffron-600 border border-orange-200/60">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
      </div>

      {/* Eligible Channel Partner badge */}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
        <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[11px] font-bold text-emerald-700">Eligible Channel Partner</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 transition-all hover:border-navy-900 hover:shadow-sm cursor-pointer"
          type="button"
        >
          View Details
        </button>
        <a
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-navy-800 cursor-pointer text-center"
          href={directionsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          Directions
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Partners page
// ---------------------------------------------------------------------------
export default function Partners({ onBack }) {
  const [location, setLocation] = useState(null);          // { lat, lng }
  const [locStatus, setLocStatus] = useState('idle');       // idle | loading | success | error
  const [locError, setLocError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // ------- Geolocation -------
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocStatus('loading');
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus('success');
      },
      (err) => {
        setLocStatus('error');
        if (err.code === err.PERMISSION_DENIED) {
          setLocError('Location permission was denied. Please allow location access in your browser settings and try again.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocError('Your location information is currently unavailable. Please try again later.');
        } else {
          setLocError('Unable to retrieve your location. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // ------- Mock partners -------
  const partners = useMemo(
    () => (location ? generateMockPartners(location.lat, location.lng) : []),
    [location],
  );

  const filteredPartners = useMemo(
    () => (activeFilter === 'All' ? partners : partners.filter((p) => p.type === activeFilter)).sort((a, b) => a.distanceKm - b.distanceKm),
    [partners, activeFilter],
  );

  const filters = ['All', 'Banks', 'SCA', 'NBFC-MFI'];

  // ------- Render -------
  return (
    <div className="min-h-screen font-sans text-slate-800 antialiased">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-6 border-b border-slate-200 pb-5">
          <BackButton onClick={onBack} />
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-saffron-600 border border-orange-200/60 shadow-sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-saffron-600">YOJANAX</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">Find Nearby Partners</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Find eligible government channel partners near your location.
          </p>
        </header>

        {/* Location button */}
        <div className="mb-6">
          <button
            className="inline-flex items-center gap-2.5 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-navy-800 disabled:opacity-60 cursor-pointer"
            disabled={locStatus === 'loading'}
            onClick={requestLocation}
            type="button"
          >
            {locStatus === 'loading' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Locating…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Use My Location
              </>
            )}
          </button>

          {locStatus === 'loading' && (
            <p className="mt-2 text-xs font-medium text-slate-500 animate-pulse">
              Requesting your location — please allow access if prompted…
            </p>
          )}
          {locStatus === 'error' && (
            <div className="mt-3 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {locError}
            </div>
          )}
          {locStatus === 'success' && location && (
            <p className="mt-2 text-xs font-medium text-emerald-600">
              ✓ Location found — showing nearby partners
            </p>
          )}
        </div>

        {/* Map */}
        {location && apiKey && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={{ height: 380 }}>
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={location}
                defaultZoom={13}
                gestureHandling="greedy"
                mapId="yojanax-partners-map"
                style={{ width: '100%', height: '100%' }}
              >
                {/* User marker */}
                <AdvancedMarker position={location} title="Your location">
                  <Pin background="#102a56" glyphColor="#fff" borderColor="#0a1d3d" />
                </AdvancedMarker>

                {/* Partner markers */}
                {filteredPartners.map((p) => (
                  <AdvancedMarker key={p.id} position={{ lat: p.lat, lng: p.lng }} title={p.name}>
                    <Pin background="#f28c28" glyphColor="#fff" borderColor="#c66a0e" />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        )}

        {location && !apiKey && (
          <div className="mb-6 flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
            <div>
              <p className="text-sm font-semibold text-slate-600">Google Maps API key not configured</p>
              <p className="mt-1 text-xs text-slate-400">
                Add <code className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to your <code className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-mono">.env</code> file
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        {location && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.map((f) => (
              <FilterButton key={f} label={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
            ))}
          </div>
        )}

        {/* Partner cards */}
        {location && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPartners.map((p) => (
              <PartnerCard key={p.id} partner={p} />
            ))}
          </div>
        )}

        {/* Info note */}
        {location && (
          <div className="mt-8 mb-8 rounded-xl border border-orange-100 bg-orange-50/70 p-4 text-xs leading-relaxed text-slate-600">
            <strong className="text-slate-700">ℹ Note:</strong> Partner availability and eligibility will be verified using Yojanax's official partner data.
            The partners shown above are temporary data for demonstration purposes only.
          </div>
        )}
      </div>
    </div>
  );
}