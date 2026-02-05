import { useState, useEffect } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import {
  ShoppingCart, Euro, CreditCard, TrendingUp, Package, Clock,
  CheckCircle, XCircle, AlertTriangle, ExternalLink, Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Types for when Stripe is connected ──────────────────────────
interface Order {
  id: string;
  date: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: 'completed' | 'pending' | 'refunded' | 'failed';
}

interface ShopStats {
  revenue: number;
  orders: number;
  avgOrderValue: number;
  pendingOrders: number;
}

const STATUS_CONFIG = {
  completed: { label: 'Completed', icon: CheckCircle, class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  pending: { label: 'Pending', icon: Clock, class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  refunded: { label: 'Refunded', icon: AlertTriangle, class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  failed: { label: 'Failed', icon: XCircle, class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
} as const;

// ─── Component ───────────────────────────────────────────────────
export default function AdminShop() {
  const { products } = useProducts();
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStripeConnection();
  }, []);

  async function checkStripeConnection() {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/shop/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStripeConnected(true);
        setStats(data.stats);
        setOrders(data.recentOrders || []);
      }
    } catch {
      // Stripe not configured yet — that's fine
    } finally {
      setIsLoading(false);
    }
  }

  // Product catalog summary
  const catalogValue = products.reduce((sum, p) => sum + (p.salePrice || p.price) * p.stock, 0);
  const inStockCount = products.filter(p => p.inStock).length;

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Shop</h1>
          <p className="text-muted-foreground mt-1">Orders, revenue & payment management</p>
        </div>
        {stripeConnected && (
          <Button asChild variant="outline" size="sm">
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
              Stripe Dashboard <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
        )}
      </div>

      {/* ─── Stripe Connection Status ───────────────────────────── */}
      {!stripeConnected ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Stripe to Start Selling</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Once Stripe is connected, you'll see live orders, revenue, and payment data here.
              Your product catalog is ready with {inStockCount.toLocaleString()} products in stock.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-[#635bff] hover:bg-[#5851db] text-white">
                <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer">
                  <CreditCard className="h-4 w-4 mr-2" /> Create Stripe Account
                </a>
              </Button>
              <Button variant="outline" disabled>
                <Settings className="h-4 w-4 mr-2" /> Configure API Keys
              </Button>
            </div>

            <div className="mt-8 border-t pt-6">
              <p className="text-xs text-muted-foreground mb-3">Setup checklist:</p>
              <div className="flex flex-col gap-2 text-sm max-w-xs mx-auto text-left">
                <SetupStep done={true} label="Product catalog loaded" detail={`${inStockCount} products`} />
                <SetupStep done={true} label="Checkout page built" detail="Form ready" />
                <SetupStep done={false} label="Stripe API keys" detail="STRIPE_SECRET_KEY env var" />
                <SetupStep done={false} label="Stripe webhook" detail="/api/stripe-webhook endpoint" />
                <SetupStep done={false} label="Payment processing" detail="Checkout integration" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ─── Revenue KPIs ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard icon={Euro} label="Revenue" value={formatCurrency(stats?.revenue || 0)} color="text-green-600 bg-green-600/10" />
            <KpiCard icon={ShoppingCart} label="Orders" value={(stats?.orders || 0).toLocaleString()} color="text-blue-600 bg-blue-600/10" />
            <KpiCard icon={TrendingUp} label="Avg Order" value={formatCurrency(stats?.avgOrderValue || 0)} color="text-amber-600 bg-amber-600/10" />
            <KpiCard icon={Clock} label="Pending" value={(stats?.pendingOrders || 0).toLocaleString()} color="text-orange-600 bg-orange-600/10" />
          </div>

          {/* ─── Orders Table ─────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                  <CardDescription>Latest transactions from your shop</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer">
                    View All <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No orders yet. They'll appear here once customers start purchasing.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map(order => {
                        const statusCfg = STATUS_CONFIG[order.status];
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{order.customer}</p>
                                <p className="text-xs text-muted-foreground">{order.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
                            <TableCell className="text-center">{order.items}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className={`text-xs ${statusCfg.class}`}>
                                {statusCfg.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── Catalog Summary (always visible) ─────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Catalog Summary</CardTitle>
          <CardDescription>Your product inventory at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 divide-x divide-border [&>*:first-child]:pl-0 [&>*]:pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Products</p>
              <p className="text-lg font-bold">{products.length.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Stock</p>
              <p className="text-lg font-bold">{inStockCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Catalog Value</p>
              <p className="text-lg font-bold">{formatCurrency(catalogValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Price</p>
              <p className="text-lg font-bold">
                {products.length > 0
                  ? formatCurrency(products.reduce((s, p) => s + (p.salePrice || p.price), 0) / products.length)
                  : '€0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, color }: {
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

function SetupStep({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
      )}
      <span className={done ? 'text-muted-foreground line-through' : ''}>{label}</span>
      <span className="text-xs text-muted-foreground ml-auto">{detail}</span>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('el-GR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}
