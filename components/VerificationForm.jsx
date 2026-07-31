// components/VerificationForm.jsx
// Formulaire de vérification : pseudo W Social + consentement obligatoire.
// Insertion directe dans Supabase, sans API intermédiaire.
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from './Button';

export default function VerificationForm() {
  const [username, setUsername] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername || !consent) return;

    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.from('verification_requests').insert([
      {
        wsocial_username: cleanUsername,
        consent_given: consent,
        status: 'pending',
      },
    ]);

    if (error) {
      console.error(error);
      setStatus('error');
      setErrorMsg("Erreur lors de l'envoi. Réessaie dans un instant.");
      return;
    }

    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="p-8 bg-violet-light text-ink rounded-2xl max-w-md mx-auto text-center border border-violet/20">
        <span className="inline-block text-xs font-medium tracking-wide uppercase text-violet bg-white rounded-full px-3 py-1 mb-4">
          Demande envoyée
        </span>
        <h3 className="font-semibold text-lg mb-2">Demande reçue</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Ta demande a bien été enregistrée avec le statut <strong>en attente</strong>.
          Le badge sera attribué manuellement sur Kelo Social une fois la vérification effectuée.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-2xl shadow-sm max-w-md mx-auto border border-gray-100 space-y-5"
    >
      <div>
        <h2 className="text-xl font-semibold text-ink mb-1">Lier W Social à Kelo Social</h2>
        <p className="text-sm text-gray-500">
          Renseigne ton nom d'utilisateur W Social pour lancer la vérification manuelle.
        </p>
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Nom d'utilisateur W Social
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ex. mon_pseudo"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-violet focus:outline-none"
          required
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-violet rounded"
          required
        />
        <span>
          Je consens à ce que mon nom d'utilisateur soit transmis pour une vérification manuelle
          en vue de l'attribution du badge sur Kelo Social.
        </span>
      </label>

      {status === 'error' && (
        <p className="text-sm text-red-600" role="alert">{errorMsg}</p>
      )}

      <Button
        type="submit"
        disabled={status === 'loading' || !consent || !username}
        className="w-full"
      >
        {status === 'loading' ? 'Envoi en cours...' : 'Soumettre'}
      </Button>
    </form>
  );
}
