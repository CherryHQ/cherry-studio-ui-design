import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PROVIDER_TYPES, getProviderType } from './mockProviderCatalog';
import { mockFetchModels } from './mockFetchModels';

// ===========================
// useQuickProviderSetup
// ===========================
// Owns the drawer's form state, the debounced auto-fetch of models, the
// per-model enable toggles, and the (mock) save. Prototype-only — no
// persistence, no real API.

export type FetchStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; reason: 'auth' | 'network' }
  | { kind: 'success' };

export interface ModelRow {
  id: string;
  enabled: boolean;
}

export interface QuickProviderSavePayload {
  providerId: string;
  providerName: string;
  endpointTypeId: string;
  baseUrl: string;
  apiKey: string;
  enabledModels: string[];
}

const DEBOUNCE_MS = 600;

export function useQuickProviderSetup(open: boolean) {
  const [providerId, setProviderId] = useState<string>('');
  const [endpointTypeId, setEndpointTypeId] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  // Only used for custom providers, where the user types their own name.
  const [customName, setCustomName] = useState<string>('');
  // Whether the user has hand-edited endpoint/baseUrl — if so we stop
  // auto-filling them when the provider changes.
  const touchedRef = useRef<{ endpoint: boolean; baseUrl: boolean }>({ endpoint: false, baseUrl: false });

  const [status, setStatus] = useState<FetchStatus>({ kind: 'idle' });
  const [models, setModels] = useState<ModelRow[]>([]);
  const [saving, setSaving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const provider = useMemo(() => getProviderType(providerId), [providerId]);
  const isCustom = !!provider?.isCustom;
  const allFilled =
    !!providerId &&
    !!endpointTypeId &&
    baseUrl.trim() !== '' &&
    apiKey.trim() !== '' &&
    (!isCustom || customName.trim() !== '');

  const reset = useCallback(() => {
    setProviderId('');
    setEndpointTypeId('');
    setBaseUrl('');
    setApiKey('');
    setCustomName('');
    setStatus({ kind: 'idle' });
    setModels([]);
    setSaving(false);
    touchedRef.current = { endpoint: false, baseUrl: false };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
  }, []);

  // Reset everything whenever the drawer closes so re-opening is fresh.
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // Picking a provider auto-fills endpoint + Base URL (unless hand-edited).
  const selectProvider = useCallback((id: string) => {
    setProviderId(id);
    setCustomName('');
    const p = getProviderType(id);
    if (!p) return;
    if (!touchedRef.current.endpoint) setEndpointTypeId(p.defaultEndpointTypeId);
    if (!touchedRef.current.baseUrl) setBaseUrl(p.defaultBaseUrl);
  }, []);

  const selectEndpointType = useCallback((id: string) => {
    touchedRef.current.endpoint = true;
    setEndpointTypeId(id);
  }, []);

  const changeBaseUrl = useCallback((v: string) => {
    touchedRef.current.baseUrl = true;
    setBaseUrl(v);
  }, []);

  const runFetch = useCallback(() => {
    if (!provider) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus({ kind: 'loading' });
    mockFetchModels({ providerId: provider.id, apiKey, signal: ctrl.signal })
      .then((res) => {
        if (ctrl.signal.aborted) return;
        if (res.status === 'error') {
          setStatus({ kind: 'error', reason: res.reason });
          setModels([]);
        } else {
          setStatus({ kind: 'success' });
          setModels(res.models.map((id) => ({ id, enabled: true })));
        }
      })
      .catch(() => {
        /* aborted — superseded by a newer fetch */
      });
  }, [provider, apiKey]);

  // Debounced auto-fetch when all four fields are non-empty.
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!allFilled) {
      setStatus({ kind: 'idle' });
      setModels([]);
      abortRef.current?.abort();
      return;
    }
    debounceRef.current = setTimeout(runFetch, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // runFetch closes over provider + apiKey; allFilled covers the rest.
  }, [open, allFilled, providerId, endpointTypeId, baseUrl, apiKey, runFetch]);

  const toggleModel = useCallback((id: string) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  }, []);

  const setAllModels = useCallback((enabled: boolean) => {
    setModels((prev) => prev.map((m) => ({ ...m, enabled })));
  }, []);

  const enabledCount = useMemo(() => models.filter((m) => m.enabled).length, [models]);

  const canSave = allFilled && status.kind === 'success' && enabledCount > 0 && !saving;

  const save = useCallback(
    (onSave?: (payload: QuickProviderSavePayload) => void) => {
      if (!provider || !canSave) return;
      setSaving(true);
      // Mock latency before resolving.
      setTimeout(() => {
        setSaving(false);
        onSave?.({
          providerId: provider.id,
          providerName: provider.isCustom ? customName.trim() : provider.name,
          endpointTypeId,
          baseUrl: baseUrl.trim(),
          apiKey: apiKey.trim(),
          enabledModels: models.filter((m) => m.enabled).map((m) => m.id),
        });
      }, 600);
    },
    [provider, canSave, customName, endpointTypeId, baseUrl, apiKey, models],
  );

  return {
    providers: PROVIDER_TYPES,
    provider,
    isCustom,
    providerId,
    endpointTypeId,
    baseUrl,
    apiKey,
    customName,
    setCustomName,
    setApiKey,
    selectProvider,
    selectEndpointType,
    changeBaseUrl,
    status,
    models,
    enabledCount,
    toggleModel,
    setAllModels,
    retry: runFetch,
    saving,
    canSave,
    save,
  };
}
