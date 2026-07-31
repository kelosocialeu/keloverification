import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const moderatorId = req.body.moderator_id;
  const isModerator = await checkModeratorRole(moderatorId);
  if (!isModerator) {
    return res.status(403).json({ error: 'Accès réservé à la modération.' });
  }

  const { request_id, decision, notes } = req.body;

  if (!request_id || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'Paramètres invalides.' });
  }

  const fn = decision === 'approve' ? 'approve_verification' : 'reject_verification';

  const { error } = await supabaseAdmin.rpc(fn, {
    request_id,
    moderator_id: moderatorId,
    notes: notes || null,
  });

  if (error) {
    console.error('Erreur modération:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: `Demande ${decision === 'approve' ? 'approuvée' : 'rejetée'}.` });
}

async function checkModeratorRole(moderatorId) {
  if (!moderatorId) return false;
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('user_id', moderatorId)
    .single();
  return data?.role === 'moderator';
}
