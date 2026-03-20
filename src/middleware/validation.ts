import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// --- SCHEMAS ---

export const InviteUserSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  role: z.enum(['admin', 'creator', 'client']),
  display_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
});

export const FetchMetadataSchema = z.object({
  url: z.string().url("URL inválida"),
  platform: z.enum(['tiktok', 'youtube', 'instagram', 'x', 'coinmarketcap', 'twitch']),
});

export const SendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(5),
  html: z.string().min(10),
});

export const AnalyzeTwitchSchema = z.object({
  image: z.string().min(100, "La imagen es demasiado pequeña o inválida"), // Base64 check roughly
});

export const AnalyzeCreatorSchema = z.object({
  username: z.string().min(1),
  platform: z.enum(['twitch', 'youtube', 'instagram', 'tiktok']),
});

export const RefreshMetricsSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    url: z.string().url(),
    platform: z.string()
  })).min(1)
});

// --- MIDDLEWARE ---

export const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Error de validación",
        details: error.issues.map(e => ({ path: e.path, message: e.message }))
      });
    }
    next(error);
  }
};
