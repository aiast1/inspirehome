import { useState, useMemo } from 'react';
import type { Product } from '@/lib/productParser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleHidden?: (product: Product) => void;
  hiddenIds?: Set<string>;
  readOnly?: boolean;
}

export function ProductTable({ products, onEdit, onDelete, onToggleHidden, hiddenIds, readOnly }: ProductTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.categories.some(c => c.toLowerCase().includes(q))
    );
  }, [products, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, ID, or category..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10"
        />
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} products</p>

      {/* Table */}
      <div className="border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Image</th>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Stock</th>
              <th className="text-left p-3 font-medium">Categories</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((product) => {
              const isHidden = hiddenIds?.has(product.id);
              return (
                <tr key={product.id} className={`border-t hover:bg-muted/30 ${isHidden ? 'opacity-50' : ''}`}>
                  <td className="p-3">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt="" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium truncate max-w-[300px]">{product.title}</div>
                    <div className="text-xs text-muted-foreground">{product.id}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div>{product.price.toFixed(2)}&euro;</div>
                    {product.salePrice && (
                      <div className="text-xs text-red-500">{product.salePrice.toFixed(2)}&euro;</div>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant={product.inStock ? 'default' : 'destructive'} className="text-xs">
                      {product.inStock ? product.stock : 'Out'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {product.categories.slice(0, 2).map((cat, i) => (
                        <Badge key={i} variant="outline" className="text-xs truncate max-w-[150px]">
                          {cat}
                        </Badge>
                      ))}
                      {product.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{product.categories.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {onToggleHidden && (
                      <Button variant="ghost" size="icon" onClick={() => onToggleHidden(product)} title={isHidden ? 'Show' : 'Hide'}>
                        {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {!readOnly && onDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(product)} className="hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
