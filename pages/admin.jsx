// pages/admin.jsx
// Page d'administration protégée par Supabase Auth,
// présentée à l'écran comme un simple "code d'accès".
// Le compte admin est créé une seule fois dans le dashboard Supabase
// (Authentication > Users) — jamais côté public.
// RLS autorise SELECT/UPDATE uniquement pour un utilisateur authentifié.
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import Button from '../components/Button';

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
      <Layout>
        <section className="max-w-sm mx-auto px-6 py-24">
          <h1 className="text-2xl font-semibold tracking-tight mb-6 text-center">
            Accès administration
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code d'accès"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-violet focus:outline-none"
            />
            {authError && (
              <p className="text-sm text-red-600" role="alert">{authError}</p>
            )}
            <Button type="submit" disabled={authLoading} variant="dark" className="w-full">
              {authLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight mb-8">
          Demandes de vérification
        </h1>

        {loadingRequests && <p className="text-gray-500 mb-4">Chargement...</p>}

        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-surface rounded-xl2 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="font-medium">@{req.wsocial_username}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(req.created_at).toLocaleString('fr-FR')} —{' '}
                  <span className={req.status === 'processed' ? 'text-green-600' : 'text-violet'}>
                    {req.status}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => copyUsername(req.wsocial_username, req.id)}>
                  {copiedId === req.id ? 'Copié' : 'Copier'}
                </Button>

                
                  href={`https://wsocial.eu/@${req.wsocial_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost">Ouvrir le profil</Button>
                </a>

                {req.status !== 'processed' && (
                  <Button onClick={() => markAsProcessed(req.id)}>
                    Marquer comme traité
                  </Button>
                )}
              </div>
            </div>
          ))}

          {!loadingRequests && requests.length === 0 && (
            <p className="text-gray-500">Aucune demande pour le moment.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}
