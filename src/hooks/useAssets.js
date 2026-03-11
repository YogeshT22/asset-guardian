/**
 * useAssets.js — Custom hook for asset CRUD operations
 * Production practice: Business logic belongs in hooks, not components.
 * The component becomes a pure "view" — it only renders what the hook gives it.
 */
import { useState, useEffect, useCallback } from 'react';
import { assetsService } from '../api/assets';

const DEFAULT_FORM = { name: '', type: 'Server', status: 'Online' };

export function useAssets() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await assetsService.getAll();
      setAssets(res.data);
    } catch (err) {
      setError('Failed to load assets. Is the backend running?');
      console.error('[useAssets] fetchAssets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // ── CREATE / UPDATE ────────────────────────────────────────────────────────
  const saveAsset = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        if (editingId) {
          await assetsService.update(editingId, formData);
        } else {
          await assetsService.create(formData);
        }
        setFormData(DEFAULT_FORM);
        setEditingId(null);
        await fetchAssets();
        return { success: true, isEdit: !!editingId };
      } catch (err) {
        console.error('[useAssets] saveAsset:', err);
        return { success: false, error: err };
      }
    },
    [editingId, formData, fetchAssets]
  );

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const deleteAsset = useCallback(
    async (id) => {
      try {
        await assetsService.remove(id);
        await fetchAssets();
        return { success: true };
      } catch (err) {
        console.error('[useAssets] deleteAsset:', err);
        return { success: false, error: err };
      }
    },
    [fetchAssets]
  );

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  const startEdit = useCallback((asset) => {
    setEditingId(asset.id);
    setFormData({ name: asset.name, type: asset.type, status: asset.status });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
  }, []);

  return {
    assets,
    isLoading,
    error,
    formData,
    setFormData,
    editingId,
    saveAsset,
    deleteAsset,
    startEdit,
    cancelEdit,
  };
}
