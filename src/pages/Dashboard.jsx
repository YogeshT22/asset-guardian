/**
 * Dashboard.jsx
 * Production practices applied:
 * 1. Zero API logic in this file — all fetching is in useAssets() hook
 * 2. No alert() or window.confirm() — replaced with Toast + ConfirmDialog
 * 3. Error state rendered in UI, not just console.error
 * 4. Accessible table with proper ARIA roles
 * 5. Loading skeleton instead of plain text
 */
import { useState } from 'react';
import { Trash2, Edit, LogOut, PlusCircle, Monitor, Server, Network, Cloud, Cpu, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../hooks/useAssets';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import ConfirmDialog from '../components/ConfirmDialog';

// ── Asset type → icon map ────────────────────────────────────────────────────
const TYPE_ICONS = {
  Server: <Server size={18} />,
  Workstation: <Monitor size={18} />,
  Network: <Network size={18} />,
  Cloud: <Cloud size={18} />,
  IoT: <Cpu size={18} />,
};

// ── Status → style map ───────────────────────────────────────────────────────
const STATUS_STYLES = {
  Online: 'bg-green-100 text-green-700',
  Offline: 'bg-red-100 text-red-700',
  Maintenance: 'bg-yellow-100 text-yellow-700',
};

export default function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toasts, toast } = useToast();

  // All data logic lives in the custom hook
  const {
    assets, isLoading, error,
    formData, setFormData,
    editingId,
    saveAsset, deleteAsset,
    startEdit, cancelEdit,
  } = useAssets();

  // Confirm dialog state
  const [confirmTarget, setConfirmTarget] = useState(null); // { id, name }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    const result = await saveAsset(e);
    if (result.success) {
      toast.success(result.isEdit ? 'Asset updated successfully.' : 'Asset deployed successfully.');
    } else {
      toast.error('Failed to save asset. Please try again.');
    }
  };

  const handleDeleteRequest = (asset) => {
    setConfirmTarget({ id: asset.id, name: asset.name });
  };

  const handleDeleteConfirm = async () => {
    const { id, name } = confirmTarget;
    setConfirmTarget(null);
    const result = await deleteAsset(id);
    if (result.success) {
      toast.success(`"${name}" has been removed.`);
    } else {
      toast.error('Failed to delete asset. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">ASSET GUARDIAN</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Operator</p>
            <p className="text-sm font-medium text-gray-700">{user}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors bg-gray-100 px-4 py-2 rounded-lg"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">

        {/* ── FORM SECTION ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-2 mb-6 text-gray-700">
            <PlusCircle size={20} className="text-blue-500" />
            <h2 className="font-bold">{editingId ? 'Modify Record' : 'Register New Asset'}</h2>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="Asset Name (e.g. Proxmox-Node-01)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required
              aria-label="Asset name"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="border border-gray-200 p-3 rounded-lg bg-white"
              aria-label="Asset type"
            >
              <option value="Server">Server</option>
              <option value="Workstation">Workstation</option>
              <option value="Network">Network</option>
              <option value="Cloud">Cloud</option>
              <option value="IoT">IoT</option>
            </select>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="border border-gray-200 p-3 rounded-lg bg-white"
              aria-label="Asset status"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex-1 py-3 rounded-lg text-white font-bold transition-all ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {editingId ? 'Update Asset' : 'Deploy Asset'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ── API ERROR BANNER ───────────────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-4 rounded-xl mb-6"
          >
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── DATA TABLE ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left" role="table" aria-label="Asset inventory">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Resource</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {TYPE_ICONS[asset.type] ?? <Monitor size={18} />}
                      </div>
                      <span className="font-semibold text-gray-700">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{asset.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[asset.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(asset)}
                        aria-label={`Edit ${asset.name}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(asset)}
                        aria-label={`Delete ${asset.name}`}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <div className="p-10 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}
          {!isLoading && !error && assets.length === 0 && (
            <div className="p-10 text-center text-gray-400 italic font-light text-lg">
              Inventory empty. No resources detected.
            </div>
          )}
        </div>
      </main>

      {/* ── GLOBAL UI OVERLAYS ────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} />
      <ConfirmDialog
        isOpen={!!confirmTarget}
        message={`Are you sure you want to permanently delete "${confirmTarget?.name}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
