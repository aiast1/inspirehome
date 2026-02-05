const REPO_OWNER = 'aiast1';
const REPO_NAME = 'inspirehome';
const BRANCH = 'main';

interface GitHubFile {
  content: string;
  sha: string;
}

export async function readFile(filePath: string): Promise<GitHubFile> {
  const pat = process.env.GITHUB_PAT;
  if (!pat) throw new Error('GITHUB_PAT not configured');

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${BRANCH}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API read error: ${response.status}`);
  }

  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

export async function writeFile(
  filePath: string,
  content: string,
  sha: string,
  message: string
): Promise<void> {
  const pat = process.env.GITHUB_PAT;
  if (!pat) throw new Error('GITHUB_PAT not configured');

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: BRANCH,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub API write error: ${response.status} - ${JSON.stringify(error)}`);
  }
}
