import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { kelo_user_id, w_social_username, consent_given } = req.body;

  if (!kelo_user_id || !w_social_username || consent_given !== true) {
    return res.status(400).json({
      error: 'Pseudo W Social et consentement explicite requis.',
    });
  }

  const cleanUsername = String(w_social_username).trim().replace(/^@/, '');

  if (cleanUsername.length < 1 || cleanUsername.length > 50) {
    return res.status(400).json({ error: 'Pseudo invalide.' });
  }

  const { data, error } = await supabaseAdmin
    .from('verification_requests')
    .insert({
      kelo_user_id,
      w_social_username: cleanUsername,
      consent_given: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Une demande de vérification est déjà en cours pour ce compte.',
      });
    }
    console.error('Erreur soumission vérification:', error);
    return res.status(500).json({ error: 'Erreur serveur, réessaie plus tard.' });
  }

  return res.status(201).json({
    message: 'Demande soumise. Un modérateur la traitera sous 24h.',
    request: data,
  });
}
