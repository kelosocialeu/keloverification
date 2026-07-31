import { createClient } from '@supabase/supabase-js';

// Initialisation de la connexion à la base de données
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // On n'accepte que les requêtes POST provenant du formulaire
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { username, consent } = req.body;

  if (!username || !consent) {
    return res.status(400).json({ error: 'Le nom d\'utilisateur et le consentement sont requis.' });
  }

  try {
    // Enregistrement dans une table (qu'il faudra nommer "verification_requests" dans ta base)
    const { error } = await supabase
      .from('verification_requests')
      .insert([
        {
          wsocial_username: username,
          status: 'pending', // Statut en attente de modération
          consent_given: consent,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Demande enregistrée.' });
  } catch (error) {
    console.error('Erreur DB:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la demande.' });
  }
}
