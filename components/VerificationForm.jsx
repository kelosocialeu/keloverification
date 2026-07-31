import { useState } from 'react';

export default function VerificationForm({ keloUserId }) {
  const [username, setUsername] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !consent) {
      setStatus('error');
      setMessage('Merci de renseigner ton pseudo et de cocher le consentement.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kelo_user_id: keloUserId,
          w_social_username: username,
          consent_given: consent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || "Une erreur est survenue.");
        return;
      }

      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      setMessage('Impossible de contacter le serveur. Réessaie plus tard.');
    }
  };

  if (status === 'success') {
    return (
      <div className="verification-success">
        <p>{message}</p>
        <p>Ton compte sera automatiquement mis à jour une fois la vérification effectuée.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="verification-form">
      <h2>Vérification via W Social</h2>
      <p>
        Si tu es déjà vérifié·e sur W Social, tu peux obtenir le badge vérifié
        sur Kelo Social sans repasser par le processus complet.
      </p>

      <label htmlFor="w_social_username">Ton pseudo W Social</label>
      <input
        id="w_social_username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="@pseudo"
        disabled={status === 'loading'}
        required
      />

      <label className="consent-label">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={status === 'loading'}
        />
        Je consens à ce que l'équipe de Kelo Social vérifie mon statut de
        vérification sur W Social afin de valider mon compte Kelo Social.
      </label>

      {status === 'error' && <p className="error-message">{message}</p>}

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Envoi en cours...' : 'Continuer'}
      </button>
    </form>
  );
}
