import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};

  const validUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const jwtSecret = process.env.JWT_SECRET;

  if (!validUsername || !passwordHash || !jwtSecret) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (username !== validUsername) {
    return res.status(401).json({ error: 'Invalid credentials', debug: 'username mismatch', got: username, expected: validUsername });
  }

  const passwordValid = await bcrypt.compare(password || '', passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid credentials', debug: 'password mismatch', hashPrefix: passwordHash.substring(0, 7) });
  }

  const token = jwt.sign(
    { sub: username, role: 'admin' },
    jwtSecret,
    { expiresIn: '24h' }
  );

  return res.status(200).json({ token, expiresIn: 86400 });
}
