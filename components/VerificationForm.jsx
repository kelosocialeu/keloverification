// components/VerificationForm.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function VerificationForm() {
  const [username, setUsername] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername || !consent) return;

    setStatus('loading');

    // Envoi direct à Supabase, sans API intermédiaire
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
      setMessage("Erreur lors de l'envoi de la demande. Réessaie dans un instant.");
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
          Ta demande de vérification a bien été enregistrée avec le statut
          <strong> en attente</strong>. Le badge sera attribué manuellement sur
          Kelo Social une fois la vérification effectuée.
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
        <h2 className="text-xl font-semibold text-ink mb-1">
          Lier W Social à Kelo Social
        </h2>
        <p className="text-sm text-gray-500">
          Renseigne ton nom d'utilisateur W Social pour lancer la vérification
          manuelle.
        </p>
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Nom
