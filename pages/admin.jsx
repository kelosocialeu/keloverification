import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requests, setRequests] = useState([]);

  // Remplace "1234" par le code secret de ton choix
  const ADMIN_CODE = "1234"; 

  const handleLogin = (e) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setIsAuthenticated(true);
      fetchRequests();
    } else {
      alert("Code incorrect");
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setRequests(data);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Accès Administrateur</h2>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code d'accès"
            className="w-full px-3 py-2 border rounded-md mb-4"
          />
          <button type="submit" className="w-full bg-black text-white py-2 rounded-md">
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Demandes de vérification</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">Utilisateur W Social</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t">
                <td className="px-6 py-4 font-medium">{req.wsocial_username}</td>
                <td className="px-6 py-4">{new Date(req.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <a 
                    href={`https://wsocial.com/@${req.wsocial_username}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Vérifier le profil ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Une fois le profil vérifié, rends-toi sur le panneau admin principal de Kelo Social pour valider l'utilisateur.
      </p>
    </div>
  );
}
