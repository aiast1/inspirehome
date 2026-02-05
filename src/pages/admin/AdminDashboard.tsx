import { Link } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import { Package, Database, FolderTree, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { products, categories } = useProducts();

  const libertaCount = products.filter(p => p.id.startsWith('liberta-')).length;
  const otherCount = products.filter(p => !p.id.startsWith('liberta-')).length;

  const stats = [
    { label: 'Liberta Products', value: libertaCount, icon: Database, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Other Products', value: otherCount, icon: Package, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Categories', value: categories.length, icon: FolderTree, color: 'text-green-500 bg-green-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your product catalog</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border rounded-xl p-6 bg-card">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border rounded-xl p-6 bg-card">
          <h3 className="font-semibold mb-2">Other Products</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add, edit, or remove products from other suppliers.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/products">
              Manage <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="border rounded-xl p-6 bg-card">
          <h3 className="font-semibold mb-2">Liberta Products</h3>
          <p className="text-sm text-muted-foreground mb-4">
            View auto-synced products and manage price/visibility overrides.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/liberta">
              View <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
