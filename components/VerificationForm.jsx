import { useState } from 'react';

export default function VerificationForm() {
  const [username, setUsername] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, consent }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Votre demande a été envoyée. L\'équipe Kelo Social va vérifier votre compte W Social sous 24h.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Une erreur est survenue.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Impossible de se connecter au serveur.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-6 bg-green-50 text-green-700 rounded-lg shadow-md max-w-md mx-auto text-center border border-green-200">
        <h3 className="font-bold text-lg mb-2">Demande envoyée !</h3>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Lier W Social à Kelo Social</h2>
      
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Nom d'utilisateur W Social
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ex: mon_pseudo"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-6">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <span className="ml-2 text-sm text-gray-600">
            J'accepte que l'équipe de Kelo Social consulte publiquement mon profil W Social afin de vérifier la présence de mon badge d'identité.
          </span>
        </label>
      </div>

      {status === 'error' && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !consent || !username}
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Envoi en cours...' : 'Demander la vérification'}
      </button>
    </form>
  );
}
