import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Vérification basique pour s'assurer que seul un admin peut utiliser cette route
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  // action doit être soit 'approved', soit 'rejected'
  const { requestId, action } = req.body; 

  if (!requestId || !['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  try {
    // Mise à jour du statut de la demande dans la base de données
    const { error } = await supabase
      .from('verification_requests')
      .update({ 
        status: action, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', requestId);

    if (error) throw error;

    // Si 'approved', tu peux déclencher ici l'attribution du badge sur Kelo Social

    return res.status(200).json({ success: true, message: `Demande modifiée en : ${action}` });
  } catch (error) {
    console.error('Erreur DB:', error);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
}
