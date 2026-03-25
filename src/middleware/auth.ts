import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase Auth Middleware: Falta configuración (URL o Key)');
}

// We need a service role client to check roles and perform admin actions
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Falta encabezado de autorización' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Attach user to request
  (req as any).user = user;
  
  // Fetch user profile to get the role
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role, email')
    .eq('id', user.id)
    .single();

  (req as any).userProfile = profile;
  next();
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const profile = (req as any).userProfile;
    if (!profile || !roles.includes(profile.role)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
};

export const isSuperadmin = (req: Request, res: Response, next: NextFunction) => {
  const profile = (req as any).userProfile;
  if (!profile || profile.email !== 'cabscryptocontacto@gmail.com') {
    return res.status(403).json({ error: 'Acceso restringido: Solo el Superadmin puede realizar esta acción' });
  }
  next();
};
