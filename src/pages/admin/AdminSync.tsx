import { useState, useEffect } from 'react';
import {
  RefreshCw, CheckCircle, XCircle, Clock, Plus, Minus, ArrowUpDown,
  ExternalLink, Database, CalendarDays, Package, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─── Types ─────────────────────────────────────────────────────────
interface SyncDelta {
  new: number;
  removed: number;
  changed: number;
  unchanged: number;
}

interface SyncEntry {
  timestamp: string;
  productCount: number;
  delta: SyncDelta;
  sampleNewIds?: string[];
  sampleRemovedIds?: string[];
  sampleChangedIds?: string[];
}

interface LastSync {
  lastSync: string;
  productCount: number;
  delta: SyncDelta & {
    newIds?: string[];
    removedIds?: string[];
    changedIds?: string[];
  };
}

interface WorkflowRun {
  id: number;
  status: string;
  conclusion: string | null;
  startedAt: string;
  updatedAt: string;
  url: string;
}

interface SyncData {
  lastSync: LastSync | null;
  history: SyncEntry[];
  workflowRuns: WorkflowRun[];
}

// ─── Component ─────────────────────────────────────────────────────
export default function AdminSync() {
  const [data, setData] = useState<SyncData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSyncData();
  }, []);

  async function fetchSyncData() {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/sync-history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto text-destructive mb-3" />
          <p className="font-medium">Failed to load sync data</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button onClick={fetchSyncData} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const last = data?.lastSync;
  const history = data?.history || [];
  const runs = data?.workflowRuns || [];

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Liberta Sync</h1>
          <p className="text-muted-foreground mt-1">XML feed sync history & change tracking</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSyncData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <a
              href="https://github.com/aiast1/inspirehome/actions/workflows/sync-liberta.yml"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Actions <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      </div>

      {/* ─── Current State ──────────────────────────────────────── */}
      {last ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            icon={CalendarDays}
            label="Last Sync"
            value={formatRelativeTime(last.lastSync)}
            sub={formatDate(last.lastSync)}
            color="text-blue-600 bg-blue-600/10"
          />
          <KpiCard
            icon={Package}
            label="Products"
            value={last.productCount.toLocaleString()}
            color="text-green-600 bg-green-600/10"
          />
          <KpiCard
            icon={ArrowUpDown}
            label="Last Changes"
            value={`${(last.delta.new + last.delta.removed + last.delta.changed).toLocaleString()}`}
            sub={`+${last.delta.new} / -${last.delta.removed} / ~${last.delta.changed}`}
            color="text-amber-600 bg-amber-600/10"
          />
          <KpiCard
            icon={Database}
            label="Unchanged"
            value={last.delta.unchanged.toLocaleString()}
            color="text-slate-600 bg-slate-600/10"
          />
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Database className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No sync data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              The sync will run automatically via GitHub Actions daily at 05:00 UTC
            </p>
          </CardContent>
        </Card>
      )}

      {/* ─── Last Delta Details ─────────────────────────────────── */}
      {last && (last.delta.newIds?.length || last.delta.removedIds?.length || last.delta.changedIds?.length) ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Last Sync — Changed Product IDs</CardTitle>
            <CardDescription>Up to 50 IDs per category from the most recent sync</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <IdList title="New Products" ids={last.delta.newIds || []} icon={Plus} color="text-green-600" />
              <IdList title="Removed Products" ids={last.delta.removedIds || []} icon={Minus} color="text-red-600" />
              <IdList title="Changed Products" ids={last.delta.changedIds || []} icon={ArrowUpDown} color="text-amber-600" />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* ─── Workflow Runs ──────────────────────────────────────── */}
      {runs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent GitHub Actions Runs</CardTitle>
            <CardDescription>Last {runs.length} workflow executions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map(run => (
                    <TableRow key={run.id}>
                      <TableCell>
                        <RunStatusBadge status={run.status} conclusion={run.conclusion} />
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{formatDate(run.startedAt)}</div>
                        <div className="text-xs text-muted-foreground">{formatRelativeTime(run.startedAt)}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDuration(run.startedAt, run.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <a href={run.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* ─── Sync History Timeline ──────────────────────────────── */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sync History</CardTitle>
            <CardDescription>Last {history.length} successful syncs with changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Products</TableHead>
                    <TableHead className="text-center">
                      <span className="text-green-600">+New</span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="text-red-600">-Removed</span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="text-amber-600">~Changed</span>
                    </TableHead>
                    <TableHead className="text-center">Unchanged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="text-sm">{formatDate(entry.timestamp)}</div>
                        <div className="text-xs text-muted-foreground">{formatRelativeTime(entry.timestamp)}</div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{entry.productCount.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {entry.delta.new > 0 ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            +{entry.delta.new}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.delta.removed > 0 ? (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            -{entry.delta.removed}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.delta.changed > 0 ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            ~{entry.delta.changed}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">{entry.delta.unchanged.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IdList({ title, ids, icon: Icon, color }: {
  title: string;
  ids: string[];
  icon: React.ElementType;
  color: string;
}) {
  if (ids.length === 0) return (
    <div className="text-center py-4 text-muted-foreground text-sm">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color} opacity-40`} />
      No {title.toLowerCase()}
    </div>
  );

  return (
    <div>
      <p className={`text-sm font-medium mb-2 flex items-center gap-1 ${color}`}>
        <Icon className="h-4 w-4" /> {title} ({ids.length})
      </p>
      <ScrollArea className="h-[160px]">
        <div className="space-y-1">
          {ids.map(id => (
            <div key={id} className="text-xs font-mono bg-muted/50 rounded px-2 py-1 truncate">
              {id.replace('liberta-', '')}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function RunStatusBadge({ status, conclusion }: { status: string; conclusion: string | null }) {
  if (status === 'in_progress' || status === 'queued') {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        <Clock className="h-3 w-3 mr-1" /> Running
      </Badge>
    );
  }
  if (conclusion === 'success') {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="h-3 w-3 mr-1" /> Success
      </Badge>
    );
  }
  if (conclusion === 'failure') {
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="h-3 w-3 mr-1" /> Failed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      {conclusion || status}
    </Badge>
  );
}

// ─── Formatters ─────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatDuration(start: string, end: string): string {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return `${mins}m ${remainSecs}s`;
}
