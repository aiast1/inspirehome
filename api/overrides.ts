import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from './_lib/verifyToken';
import { readFile, writeFile } from './_lib/github';

const FILE_PATH = 'public/data/liberta-overrides.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!verifyToken(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const file = await readFile(FILE_PATH);
      const overrides = JSON.parse(file.content);
      return res.status(200).json({ overrides, sha: file.sha });
    }

    if (req.method === 'PUT') {
      const { overrides, sha } = req.body;
      if (!overrides || typeof overrides !== 'object' || !sha) {
        return res.status(400).json({ error: 'Missing overrides object or sha' });
      }
      const content = JSON.stringify(overrides, null, 2);
      await writeFile(FILE_PATH, content, sha, 'chore: update liberta-overrides.json [admin]');
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
