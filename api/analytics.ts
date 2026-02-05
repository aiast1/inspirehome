import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { verifyToken } from './_lib/verifyToken';

let _client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient | null {
  if (_client) return _client;
  const creds = process.env.GA4_CREDENTIALS;
  if (!creds) return null;
  try {
    _client = new BetaAnalyticsDataClient({
      credentials: JSON.parse(creds),
    });
    return _client;
  } catch {
    return null;
  }
}

type ReportType = 'overview' | 'pages' | 'sources' | 'countries' | 'devices';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!verifyToken(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    return res.status(503).json({ error: 'GA4 not configured', code: 'NO_GA4' });
  }

  const client = getClient();
  if (!client) {
    return res.status(503).json({ error: 'GA4 credentials invalid', code: 'NO_GA4' });
  }

  const { reportType, startDate, endDate } = req.body || {};
  const start = startDate || '30daysAgo';
  const end = endDate || 'today';

  try {
    const property = `properties/${propertyId}`;
    const dateRanges = [{ startDate: start, endDate: end }];

    let result: unknown;

    switch (reportType as ReportType) {
      case 'overview': {
        const [response] = await client.runReport({
          property,
          dateRanges,
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
          ],
        });
        const row = response.rows?.[0];
        result = {
          pageViews: Number(row?.metricValues?.[0]?.value || 0),
          visitors: Number(row?.metricValues?.[1]?.value || 0),
          sessions: Number(row?.metricValues?.[2]?.value || 0),
          avgDuration: Number(row?.metricValues?.[3]?.value || 0),
          bounceRate: Number(row?.metricValues?.[4]?.value || 0),
        };
        break;
      }

      case 'pages': {
        const [response] = await client.runReport({
          property,
          dateRanges,
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        });
        result = (response.rows || []).map(row => ({
          path: row.dimensionValues?.[0]?.value || '',
          views: Number(row.metricValues?.[0]?.value || 0),
          users: Number(row.metricValues?.[1]?.value || 0),
        }));
        break;
      }

      case 'sources': {
        const [response] = await client.runReport({
          property,
          dateRanges,
          dimensions: [{ name: 'sessionSource' }],
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 10,
        });
        result = (response.rows || []).map(row => ({
          source: row.dimensionValues?.[0]?.value || '',
          sessions: Number(row.metricValues?.[0]?.value || 0),
          users: Number(row.metricValues?.[1]?.value || 0),
        }));
        break;
      }

      case 'countries': {
        const [response] = await client.runReport({
          property,
          dateRanges,
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 10,
        });
        result = (response.rows || []).map(row => ({
          country: row.dimensionValues?.[0]?.value || '',
          sessions: Number(row.metricValues?.[0]?.value || 0),
          users: Number(row.metricValues?.[1]?.value || 0),
        }));
        break;
      }

      case 'devices': {
        const [response] = await client.runReport({
          property,
          dateRanges,
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        });
        result = (response.rows || []).map(row => ({
          device: row.dimensionValues?.[0]?.value || '',
          sessions: Number(row.metricValues?.[0]?.value || 0),
        }));
        break;
      }

      default:
        return res.status(400).json({ error: 'Invalid reportType' });
    }

    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('GA4 API error:', err);
    return res.status(500).json({ error: err.message || 'GA4 query failed' });
  }
}
