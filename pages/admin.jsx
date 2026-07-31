// pages/admin.jsx
// Page d'administration protégée par une connexion Supabase Auth,
// présentée à l'écran comme un simple "code d'accès".
// Le compte admin est créé une seule fois dans le dashboard Supabase
// (Authentication > Users), jamais côté public.
// RLS autorise SELECT/UPDATE uniquement pour un utilisateur authentifié.
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchRequests();
  }, [session]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: code,
    });

    setAuthLoading(false);
    if (error) setAuthError('Code incorrect.');
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setRequests(data);
    setLoadingRequests(false);
  };

  const markAsProcessed = async (id) => {
    await supabase.from('verification_requests').update({ status: 'processed' }).eq('id', id);
    fetchRequests();
  };

  const copyUsername = (username, id) => {
    navigator.clipboard.writeText(username);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <form onSubmit={handleLogin} className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
          <h2 className="text-xl font-semibold text-ink mb-4">Accès administrateur</h2>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code d'accès"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl mb-4 text-sm focus:border-violet focus:outline-none"
          />
          {authError && (
            <p className="text-sm text-red-600 mb-3" role="alert">{authError}</p>
          )}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-ink text-white py-2.5 rounded-xl font-medium hover:bg-black/80 disabled:opacity-50"
          >
            {authLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-ink mb-6">Demandes de vérification</h1>

      {loadingRequests && <p className="text-gray-500 mb-4">Chargement...</p>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-600">Utilisateur W Social</th>
              <th className="px-6 py-3 font-medium text-gray-600">Date</th>
              <th className="px-6 py-3 font-medium text-gray-600">Statut</th>
              <th className="px-6 py-3 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t border-gray-100">
                <td className="px-6 py-4 font-medium text-ink">@{req.wsocial_username}</td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(req.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <span className={req.status === 'processed' ? 'text-green-600' : 'text-violet'}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => copyUsername(req.wsocial_username, req.id)}
                      className="px-3 py-1.5 rounded-lg bg-surface text-ink text-xs font-medium hover:bg-gray-200"
                    >
                      {copiedId === req.id ? 'Copié' : 'Copier'}
                    </button>

                    
                      href={`https://wsocial.eu/@${req.wsocial_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-surface text-ink text-xs font-medium hover:bg-gray-200"
                    >
                      Ouvrir le profil ↗
                    </a>

                    {req.status !== 'processed' && (
                      <button
                        onClick={() => markAsProcessed(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-violet text-white text-xs font-medium hover:bg-violet-dark"
                      >
                        Marquer comme traité
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {!loadingRequests && requests.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Aucune demande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Une fois le profil vérifié, attribue le badge sur le panneau admin
        principal de Kelo Social.
      </p>
    </div>
  );
}
