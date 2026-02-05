import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import {
  Package, FolderTree, ArrowRight, AlertTriangle, Euro, Percent, Boxes, ExternalLink, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, Label } from 'recharts';

// ─── Chart configs ───────────────────────────────────────────────
const categoryChartConfig: ChartConfig = {
  count: { label: 'Products', color: '#f59e0b' },
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
  const { products, categories, isLoading } = useProducts();

  const stats = useMemo(() => {
    const total = products.length;
    const libertaCount = products.filter(p => p.id.startsWith('liberta-')).length;
    const otherCount = total - libertaCount;
    const inStockCount = products.filter(p => p.inStock).length;
    const outOfStockCount = total - inStockCount;
    const lowStockCount = products.filter(p => p.inStock && p.stock > 0 && p.stock <= 5).length;
    const onSaleCount = products.filter(p => p.salePrice && p.salePrice < p.price).length;

    const prices = products.filter(p => p.price > 0).map(p => p.salePrice || p.price);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const inventoryValue = products.reduce((sum, p) => sum + (p.salePrice || p.price) * p.stock, 0);

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
      total, libertaCount, otherCount, inStockCount, outOfStockCount, lowStockCount,
      onSaleCount, avgPrice, inventoryValue, categoryDistribution, sourceBreakdown,
      priceDistribution, stockBuckets, lowStockProducts,
    };
  }, [products]);

  // Dynamic chart config for source pie
  const sourceChartConfig: ChartConfig = useMemo(() =>
    stats.sourceBreakdown.reduce((acc, s, i) => ({
      ...acc,
      [s.name]: { label: s.name, color: PIE_COLORS[i] },
    }), {} as ChartConfig),
  [stats.sourceBreakdown]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Product catalog overview</p>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Package} label="Total Products" value={stats.total.toLocaleString()} color="text-amber-600 bg-amber-600/10" />
        <StatCard icon={Boxes} label="In Stock" value={stats.inStockCount.toLocaleString()} color="text-green-600 bg-green-600/10" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={stats.lowStockCount.toLocaleString()} color="text-red-600 bg-red-600/10" />
        <StatCard icon={Percent} label="On Sale" value={stats.onSaleCount.toLocaleString()} color="text-rose-600 bg-rose-600/10" />
        <StatCard icon={Euro} label="Avg Price" value={`${stats.avgPrice.toFixed(0)}€`} color="text-blue-600 bg-blue-600/10" />
        <StatCard icon={FolderTree} label="Categories" value={categories.length.toLocaleString()} color="text-purple-600 bg-purple-600/10" />
      </div>

      {/* ─── Financial Strip ────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-6 divide-x divide-border [&>*:first-child]:pl-0 [&>*]:pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Inventory Value</p>
              <p className="text-lg font-bold">{stats.inventoryValue.toLocaleString('el-GR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Liberta</p>
              <p className="text-lg font-bold">{stats.libertaCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Other</p>
              <p className="text-lg font-bold">{stats.otherCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
              <p className="text-lg font-bold">{stats.outOfStockCount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Charts Row: Categories + Source ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Categories</CardTitle>
            <CardDescription>Product distribution across parent categories</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.categoryDistribution.length === 0 ? <NoData /> : (
              <ChartContainer config={categoryChartConfig} className="h-[350px]">
                <BarChart data={stats.categoryDistribution} layout="vertical" margin={{ left: 120 }}>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Product Sources</CardTitle>
            <CardDescription>Liberta vs Other suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sourceChartConfig} className="h-[350px]">
              <PieChart>
                <Pie
                  data={stats.sourceBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {stats.sourceBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">{stats.total.toLocaleString()}</tspan>
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

      {/* ─── Tabbed Details ──────────────────────────────────────── */}
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

            <TabsContent value="lowstock">
              {stats.lowStockProducts.length === 0 ? (
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
                      {stats.lowStockProducts.map(p => (
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

            <TabsContent value="prices">
              <ChartContainer config={priceChartConfig} className="h-[350px]">
                <AreaChart data={stats.priceDistribution}>
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

            <TabsContent value="stock">
              <div className="space-y-4 max-w-xl">
                {stats.stockBuckets.map(b => (
                  <div key={b.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{b.label}</span>
                      <span className="font-medium">
                        {b.count.toLocaleString()}
                        <span className="text-muted-foreground ml-1">
                          ({stats.total > 0 ? Math.round((b.count / stats.total) * 100) : 0}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${stats.total > 0 ? (b.count / stats.total) * 100 : 0}%`,
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

      {/* ─── Quick Actions ───────────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-4">
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">Microsoft Clarity</h3>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">View heatmaps, session recordings, and visitor analytics.</p>
            <Button asChild variant="outline" size="sm">
              <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer">
                Open Clarity <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

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

function NoData() {
  return (
    <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
      No data available
    </div>
  );
}
