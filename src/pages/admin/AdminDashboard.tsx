import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import {
  fetchOverview, fetchPages, fetchSources, fetchCountries, fetchDevices,
  type AnalyticsOverview, type PageData, type SourceData, type CountryData, type DeviceData,
} from '@/lib/analyticsApi';
import {
  Package, FolderTree, ArrowRight, Eye, Users, Activity,
  Clock, TrendingDown, AlertTriangle, Euro, Percent, Boxes, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, Label } from 'recharts';

// ─── Date range helpers ──────────────────────────────────────────
const DATE_RANGES = [
  { label: '7d', startDate: '7daysAgo', endDate: 'today' },
  { label: '30d', startDate: '30daysAgo', endDate: 'today' },
  { label: '90d', startDate: '90daysAgo', endDate: 'today' },
] as const;

// ─── Chart configs ───────────────────────────────────────────────
const categoryChartConfig: ChartConfig = {
  count: { label: 'Products', color: '#f59e0b' },
};

const pagesChartConfig: ChartConfig = {
  views: { label: 'Page Views', color: '#f59e0b' },
};

const countriesChartConfig: ChartConfig = {
  sessions: { label: 'Sessions', color: '#3b82f6' },
};

const priceChartConfig: ChartConfig = {
  count: { label: 'Products', color: '#f59e0b' },
};

const PIE_COLORS = ['#f59e0b', '#e11d48', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const STOCK_BUCKETS = [
  { label: 'Critical (1-5)', min: 1, max: 5, color: '#ef4444' },
  { label: 'Low (6-20)', min: 6, max: 20, color: '#f59e0b' },
  { label: 'Medium (21-50)', min: 21, max: 50, color: '#3b82f6' },
  { label: 'Good (51-100)', min: 51, max: 100, color: '#22c55e' },
  { label: 'High (100+)', min: 101, max: Infinity, color: '#10b981' },
];

const PRICE_BUCKETS = [
  { range: '0-25€', min: 0, max: 25 },
  { range: '25-50€', min: 25, max: 50 },
  { range: '50-100€', min: 50, max: 100 },
  { range: '100-250€', min: 100, max: 250 },
  { range: '250-500€', min: 250, max: 500 },
  { range: '500-1K€', min: 500, max: 1000 },
  { range: '1K+€', min: 1000, max: Infinity },
];

// ─── Component ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const { products, categories, isLoading: productsLoading } = useProducts();

  // GA4 state
  const [dateRange, setDateRange] = useState(1); // index into DATE_RANGES (default 30d)
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [gaLoading, setGaLoading] = useState(true);
  const [gaError, setGaError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (rangeIdx: number) => {
    setGaLoading(true);
    setGaError(null);
    const { startDate, endDate } = DATE_RANGES[rangeIdx];
    try {
      const [ov, pg, sr, co, dv] = await Promise.all([
        fetchOverview(startDate, endDate),
        fetchPages(startDate, endDate),
        fetchSources(startDate, endDate),
        fetchCountries(startDate, endDate),
        fetchDevices(startDate, endDate),
      ]);
      setOverview(ov);
      setPages(pg);
      setSources(sr);
      setCountries(co);
      setDevices(dv);
    } catch (err: any) {
      setGaError(err.message === 'NO_GA4' ? 'not_configured' : err.message);
    } finally {
      setGaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(dateRange);
  }, [dateRange, loadAnalytics]);

  // ─── Product analytics (client-side) ──────────────────────────
  const productStats = useMemo(() => {
    const total = products.length;
    const libertaCount = products.filter(p => p.id.startsWith('liberta-')).length;
    const otherCount = total - libertaCount;
    const inStockCount = products.filter(p => p.inStock).length;
    const lowStockCount = products.filter(p => p.inStock && p.stock > 0 && p.stock <= 5).length;
    const onSaleCount = products.filter(p => p.salePrice && p.salePrice < p.price).length;

    const prices = products.filter(p => p.price > 0).map(p => p.salePrice || p.price);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    // Category distribution (top 10)
    const catMap = new Map<string, number>();
    products.forEach(p => {
      p.categories.forEach(cat => {
        const parent = cat.includes('>') ? cat.split('>')[0].trim() : cat.trim();
        if (parent) catMap.set(parent, (catMap.get(parent) || 0) + 1);
      });
    });
    const categoryDistribution = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name: name.length > 25 ? name.slice(0, 22) + '...' : name, count }));

    // Source breakdown
    const sourceBreakdown = [
      { name: 'Liberta', value: libertaCount },
      ...(otherCount > 0 ? [{ name: 'Other', value: otherCount }] : []),
    ];

    // Price distribution
    const priceDistribution = PRICE_BUCKETS.map(b => ({
      range: b.range,
      count: products.filter(p => p.price >= b.min && p.price < b.max).length,
    }));

    // Stock buckets
    const stockBuckets = STOCK_BUCKETS.map(b => ({
      ...b,
      count: products.filter(p => p.stock >= b.min && p.stock <= (b.max === Infinity ? 999999 : b.max)).length,
    }));

    // Low stock products
    const lowStockProducts = products
      .filter(p => p.inStock && p.stock > 0 && p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 15)
      .map(p => ({
        id: p.id,
        title: p.title.length > 50 ? p.title.slice(0, 47) + '...' : p.title,
        stock: p.stock,
        price: p.salePrice || p.price,
        category: p.categories[0]?.split('>')[0]?.trim() || '-',
      }));

    return {
      total, libertaCount, otherCount, inStockCount, lowStockCount, onSaleCount, avgPrice,
      categoryDistribution, sourceBreakdown, priceDistribution, stockBuckets, lowStockProducts,
    };
  }, [products]);

  // Dynamic chart configs for pie charts
  const sourceChartConfig: ChartConfig = useMemo(() =>
    productStats.sourceBreakdown.reduce((acc, s, i) => ({
      ...acc,
      [s.name]: { label: s.name, color: PIE_COLORS[i] },
    }), {} as ChartConfig),
  [productStats.sourceBreakdown]);

  const sourcesGaConfig: ChartConfig = useMemo(() =>
    sources.reduce((acc, s, i) => ({
      ...acc,
      [s.source]: { label: s.source, color: PIE_COLORS[i % PIE_COLORS.length] },
    }), {} as ChartConfig),
  [sources]);

  const devicesGaConfig: ChartConfig = useMemo(() =>
    devices.reduce((acc, d, i) => ({
      ...acc,
      [d.device]: { label: d.device, color: PIE_COLORS[i % PIE_COLORS.length] },
    }), {} as ChartConfig),
  [devices]);

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  const gaNotConfigured = gaError === 'not_configured';

  return (
    <div className="space-y-6">
      {/* ─── Header + Date Range ────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Site analytics & product catalog overview</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {DATE_RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setDateRange(i)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                dateRange === i
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ SECTION A: Visitor KPIs (GA4) ═══════════════════════ */}
      {gaNotConfigured ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">Google Analytics not configured</p>
            <p className="text-sm text-muted-foreground mt-1">
              Set <code className="bg-muted px-1 rounded">GA4_PROPERTY_ID</code> and{' '}
              <code className="bg-muted px-1 rounded">GA4_CREDENTIALS</code> env vars in Vercel to see visitor analytics.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard icon={Eye} label="Page Views" value={overview?.pageViews} loading={gaLoading} color="text-amber-600 bg-amber-600/10" />
            <KpiCard icon={Users} label="Visitors" value={overview?.visitors} loading={gaLoading} color="text-blue-600 bg-blue-600/10" />
            <KpiCard icon={Activity} label="Sessions" value={overview?.sessions} loading={gaLoading} color="text-green-600 bg-green-600/10" />
            <KpiCard icon={Clock} label="Avg Duration" value={overview?.avgDuration} loading={gaLoading} color="text-purple-600 bg-purple-600/10" format="duration" />
            <KpiCard icon={TrendingDown} label="Bounce Rate" value={overview?.bounceRate} loading={gaLoading} color="text-rose-600 bg-rose-600/10" format="percent" />
          </div>

          {/* ─── GA Charts Row 1: Pages + Sources ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Pages */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Pages</CardTitle>
                <CardDescription>Most viewed pages</CardDescription>
              </CardHeader>
              <CardContent>
                {gaLoading ? <ChartSkeleton /> : pages.length === 0 ? <NoData /> : (
                  <ChartContainer config={pagesChartConfig} className="h-[300px]">
                    <BarChart data={pages} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="path" width={90} tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="views" fill="var(--color-views)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Traffic Sources</CardTitle>
                <CardDescription>Where visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                {gaLoading ? <ChartSkeleton /> : sources.length === 0 ? <NoData /> : (
                  <ChartContainer config={sourcesGaConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={sources}
                        dataKey="sessions"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {sources.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                              const total = sources.reduce((s, r) => s + r.sessions, 0);
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">{total.toLocaleString()}</tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-xs">sessions</tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── GA Charts Row 2: Countries + Devices ─────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Countries */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Countries</CardTitle>
                <CardDescription>Visitor locations</CardDescription>
              </CardHeader>
              <CardContent>
                {gaLoading ? <ChartSkeleton /> : countries.length === 0 ? <NoData /> : (
                  <ChartContainer config={countriesChartConfig} className="h-[300px]">
                    <BarChart data={countries} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="country" width={90} tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Devices */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Devices</CardTitle>
                <CardDescription>Mobile vs Desktop vs Tablet</CardDescription>
              </CardHeader>
              <CardContent>
                {gaLoading ? <ChartSkeleton /> : devices.length === 0 ? <NoData /> : (
                  <ChartContainer config={devicesGaConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={devices}
                        dataKey="sessions"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {devices.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                              const total = devices.reduce((s, d) => s + d.sessions, 0);
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">{total.toLocaleString()}</tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-xs">sessions</tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent nameKey="device" />} />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ═══ SECTION D: Product KPIs ═════════════════════════════ */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Product Catalog</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Package} label="Total Products" value={productStats.total.toLocaleString()} color="text-amber-600 bg-amber-600/10" />
          <StatCard icon={Boxes} label="In Stock" value={productStats.inStockCount.toLocaleString()} color="text-green-600 bg-green-600/10" />
          <StatCard icon={AlertTriangle} label="Low Stock" value={productStats.lowStockCount.toLocaleString()} color="text-red-600 bg-red-600/10" />
          <StatCard icon={Percent} label="On Sale" value={productStats.onSaleCount.toLocaleString()} color="text-rose-600 bg-rose-600/10" />
          <StatCard icon={Euro} label="Avg Price" value={`${productStats.avgPrice.toFixed(0)}€`} color="text-blue-600 bg-blue-600/10" />
          <StatCard icon={FolderTree} label="Categories" value={categories.length.toLocaleString()} color="text-purple-600 bg-purple-600/10" />
        </div>
      </div>

      {/* ═══ SECTION E: Product Charts ════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Categories */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Categories</CardTitle>
            <CardDescription>Product distribution across parent categories</CardDescription>
          </CardHeader>
          <CardContent>
            {productStats.categoryDistribution.length === 0 ? <NoData /> : (
              <ChartContainer config={categoryChartConfig} className="h-[350px]">
                <BarChart data={productStats.categoryDistribution} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Product Sources</CardTitle>
            <CardDescription>Liberta vs Other suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sourceChartConfig} className="h-[350px]">
              <PieChart>
                <Pie
                  data={productStats.sourceBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {productStats.sourceBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">{productStats.total.toLocaleString()}</tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">products</tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ═══ SECTION F: Tabbed Details ════════════════════════════ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Detailed Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lowstock">
            <TabsList className="mb-4">
              <TabsTrigger value="lowstock">Low Stock Alerts</TabsTrigger>
              <TabsTrigger value="prices">Price Distribution</TabsTrigger>
              <TabsTrigger value="stock">Stock Health</TabsTrigger>
            </TabsList>

            {/* Low Stock Table */}
            <TabsContent value="lowstock">
              {productStats.lowStockProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No low stock products.</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productStats.lowStockProducts.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium max-w-[300px] truncate">{p.title}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{p.category}</Badge></TableCell>
                          <TableCell className="text-right"><Badge variant="destructive">{p.stock}</Badge></TableCell>
                          <TableCell className="text-right">{p.price.toFixed(2)}€</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Price Distribution */}
            <TabsContent value="prices">
              <ChartContainer config={priceChartConfig} className="h-[350px]">
                <AreaChart data={productStats.priceDistribution}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="range" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="count" stroke="var(--color-count)" fill="url(#priceGradient)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </TabsContent>

            {/* Stock Health */}
            <TabsContent value="stock">
              <div className="space-y-4 max-w-xl">
                {productStats.stockBuckets.map(b => (
                  <div key={b.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{b.label}</span>
                      <span className="font-medium">
                        {b.count.toLocaleString()}
                        <span className="text-muted-foreground ml-1">
                          ({productStats.total > 0 ? Math.round((b.count / productStats.total) * 100) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${productStats.total > 0 ? (b.count / productStats.total) * 100 : 0}%`,
                          backgroundColor: b.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ═══ SECTION G: Quick Actions ═════════════════════════════ */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Other Products</h3>
            <p className="text-sm text-muted-foreground mb-4">Add, edit, or remove products from other suppliers.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/products">Manage <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Liberta Products</h3>
            <p className="text-sm text-muted-foreground mb-4">View auto-synced products and manage overrides.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/liberta">View <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, loading, color, format }: {
  icon: React.ElementType;
  label: string;
  value: number | undefined;
  loading: boolean;
  color: string;
  format?: 'duration' | 'percent';
}) {
  let display = '—';
  if (value !== undefined) {
    if (format === 'duration') {
      const mins = Math.floor(value / 60);
      const secs = Math.round(value % 60);
      display = `${mins}m ${secs}s`;
    } else if (format === 'percent') {
      display = `${(value * 100).toFixed(1)}%`;
    } else {
      display = value.toLocaleString();
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            {loading ? (
              <>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold tracking-tight">{display}</p>
                <p className="text-xs text-muted-foreground truncate">{label}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="space-y-3 w-full">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}

function NoData() {
  return (
    <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
      No data available
    </div>
  );
}
