import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function VerificationForm() {
  const [username, setUsername] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Envoi DIRECT à Supabase sans passer par une API
      const { error } = await supabase
        .from('verification_requests')
        .insert([{ 
          wsocial_username: username, 
          consent_given: consent,
          status: 'pending'
        }]);

      if (error) throw error;

      setStatus('success');
      setMessage('Votre demande a été envoyée. L\'équipe Kelo Social va vérifier votre compte W Social sous 24h.');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Erreur lors de l\'envoi de la demande.');
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div className="mb-6">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
            required
          />
          <span className="ml-2 text-sm text-gray-600">
            J'accepte que l'équipe de Kelo Social consulte mon profil W Social pour vérifier mon identité.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'loading' || !consent || !username}
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Envoi en cours...' : 'Soumettre'}
      </button>
    </form>
  );
}
