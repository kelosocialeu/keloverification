// pages/admin.jsx
// Page d'administration protegee par Supabase Auth,
// presentee a l'ecran comme un simple "code d'acces".
// Le compte admin est cree une seule fois dans le dashboard Supabase
// (Authentication > Users) - jamais cote public.
// RLS autorise SELECT/UPDATE uniquement pour un utilisateur authentifie.
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

  useEffect(function () {
    supabase.auth.getSession().then(function (result) {
      setSession(result.data.session);
    });

    const listener = supabase.auth.onAuthStateChange(function (_event, newSession) {
      setSession(newSession);
    });

    return function () {
      listener.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(function () {
    if (session) {
      fetchRequests();
    }
  }, [session]);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const result = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: code,
    });

    setAuthLoading(false);

    if (result.error) {
      setAuthError('Code incorrect.');
    }
  }

  async function fetchRequests() {
    setLoadingRequests(true);

    const result = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!result.error && result.data) {
      setRequests(result.data);
    }

    setLoadingRequests(false);
  }

  async function markAsProcessed(id) {
    await supabase
      .from('verification_requests')
      .update({ status: 'processed' })
      .eq('id', id);

    fetchRequests();
  }

  function copyUsername(username, id) {
    navigator.clipboard.writeText(username);
    setCopiedId(id);
    setTimeout(function () {
      setCopiedId(null);
    }, 1500);
  }

  if (!session) {
    return (
      <Layout>
        <section className="max-w-sm mx-auto px-6 py-24">
          <h1 className="text-2xl font-semibold tracking-tight mb-6 text-center">
            Acces administration
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={function (e) { setCode(e.target.value); }}
              placeholder="Code d'acces"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-violet focus:outline-none"
            />
            {authError ? (
              <p className="text-sm text-red-600" role="alert">
                {authError}
              </p>
            ) : null}
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
          Demandes de verification
        </h1>

        {loadingRequests ? <p className="text-gray-500 mb-4">Chargement...</p> : null}

        <div className="space-y-4">
          {requests.map(function (req) {
            const profileUrl = 'https://wsocial.eu/@' + req.wsocial_username;

            return (
              <div
                key={req.id}
                className="bg-surface rounded-xl2 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{'@' + req.wsocial_username}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(req.created_at).toLocaleString('fr-FR')}
                    {' - '}
                    <span className={req.status === 'processed' ? 'text-green-600' : 'text-violet'}>
                      {req.status}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={function () { copyUsername(req.wsocial_username, req.id); }}>
                    {copiedId === req.id ? 'Copie' : 'Copier'}
                  </Button>

                  <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost">Ouvrir le profil</Button>
                  </a>

                  {req.status !== 'processed' ? (
                    <Button onClick={function () { markAsProcessed(req.id); }}>
                      Marquer comme traite
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}

          {!loadingRequests && requests.length === 0 ? (
            <p className="text-gray-500">Aucune demande pour le moment.</p>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}
