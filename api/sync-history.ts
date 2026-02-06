import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from './_lib/verifyToken';

const REPO_OWNER = 'aiast1';
const REPO_NAME = 'inspirehome';

async function ghFetch(path: string) {
  const pat = process.env.GITHUB_PAT;
  if (!pat) throw new Error('GITHUB_PAT not configured');

  const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/${path}`, {
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

async function readRepoFile(filePath: string): Promise<any | null> {
  try {
    const data = await ghFetch(`contents/${filePath}?ref=main`);
    return JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!verifyToken(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch all data in parallel
    const [lastSync, history, workflowRuns] = await Promise.all([
      readRepoFile('sync/data/last-sync.json'),
      readRepoFile('public/data/sync-history.json'),
      ghFetch('actions/workflows/sync-liberta.yml/runs?per_page=15').catch(() => null),
    ]);

    // Extract workflow run summaries
    const runs = workflowRuns?.workflow_runs?.map((r: any) => ({
      id: r.id,
      status: r.status,
      conclusion: r.conclusion,
      startedAt: r.run_started_at,
      updatedAt: r.updated_at,
      url: r.html_url,
    })) || [];

    return res.status(200).json({
      lastSync,
      history: history || [],
      workflowRuns: runs,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
