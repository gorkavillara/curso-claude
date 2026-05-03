import { Router, Request, Response } from 'express';
import { UserModel } from '../models/user';

export const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = (req.body ?? {}) as { email?: string; password?: string };

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = UserModel.findByEmail(email);
  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  if (user.password_hash !== `hash::${password}`) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.json({ id: user.id, email: user.email });
});
