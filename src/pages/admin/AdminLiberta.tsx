import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { apiGetOverrides, apiSaveOverrides, type LibertaOverrides } from '@/lib/adminApi';
import { ProductTable } from '@/components/admin/ProductTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import type { Product } from '@/lib/productParser';

export default function AdminLiberta() {
  const { products } = useProducts();
  const [overrides, setOverrides] = useState<LibertaOverrides>({});
  const [sha, setSha] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const libertaProducts = useMemo(
    () => products.filter(p => p.id.startsWith('liberta-')),
    [products]
  );

  const hiddenIds = useMemo(
    () => new Set(Object.entries(overrides).filter(([, v]) => v.hidden).map(([id]) => id)),
    [overrides]
  );

  const overrideCount = Object.keys(overrides).length;

  useEffect(() => {
    loadOverrides();
  }, []);

  async function loadOverrides() {
    try {
      const data = await apiGetOverrides();
      setOverrides(data.overrides);
      setSha(data.sha);
      setHasChanges(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // Clean empty overrides before saving
      const cleaned: LibertaOverrides = {};
      for (const [id, override] of Object.entries(overrides)) {
        const hasContent = override.price !== undefined || override.salePrice !== undefined ||
          override.categories !== undefined || override.hidden;
        if (hasContent) cleaned[id] = override;
      }
      await apiSaveOverrides(cleaned, sha);
      setOverrides(cleaned);
      toast.success('Overrides saved! Changes will be live in ~1 minute.');
      setHasChanges(false);
      await loadOverrides();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  function toggleHidden(product: Product) {
    setOverrides(prev => {
      const existing = prev[product.id] || {};
      return { ...prev, [product.id]: { ...existing, hidden: !existing.hidden } };
    });
    setHasChanges(true);
  }

  function handleOverrideSave(product: Product) {
    const override = overrides[product.id] || {};
    // Only keep fields that differ from original
    const priceInput = (document.getElementById(`override-price-${product.id}`) as HTMLInputElement)?.value;
    const salePriceInput = (document.getElementById(`override-saleprice-${product.id}`) as HTMLInputElement)?.value;

    const newOverride = { ...override };

    if (priceInput && parseFloat(priceInput) !== product.price) {
      newOverride.price = parseFloat(priceInput);
    } else {
      delete newOverride.price;
    }

    if (salePriceInput && parseFloat(salePriceInput) > 0) {
      newOverride.salePrice = parseFloat(salePriceInput);
    } else {
      delete newOverride.salePrice;
    }

    setOverrides(prev => ({ ...prev, [product.id]: newOverride }));
    setEditingProduct(null);
    setHasChanges(true);
    toast.success('Override set. Don\'t forget to save!');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Liberta Products</h1>
          <p className="text-muted-foreground mt-1">
            {libertaProducts.length.toLocaleString()} products (auto-synced)
            {overrideCount > 0 && ` \u00b7 ${overrideCount} overrides active`}
          </p>
        </div>
        {hasChanges && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white"
          >
            <Save className="h-4 w-4 mr-1" /> {isSaving ? 'Saving...' : 'Save Overrides'}
          </Button>
        )}
      </div>

      <ProductTable
        products={libertaProducts}
        readOnly
        onEdit={setEditingProduct}
        onToggleHidden={toggleHidden}
        hiddenIds={hiddenIds}
      />

      {/* Override Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Override Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <p className="text-sm font-medium truncate">{editingProduct.title}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Price Override</label>
                  <Input
                    id={`override-price-${editingProduct.id}`}
                    type="number"
                    step="0.01"
                    defaultValue={overrides[editingProduct.id]?.price ?? editingProduct.price}
                    placeholder={String(editingProduct.price)}
                  />
                  <p className="text-xs text-muted-foreground">Original: {editingProduct.price.toFixed(2)}&euro;</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Sale Price Override</label>
                  <Input
                    id={`override-saleprice-${editingProduct.id}`}
                    type="number"
                    step="0.01"
                    defaultValue={overrides[editingProduct.id]?.salePrice ?? editingProduct.salePrice ?? ''}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={overrides[editingProduct.id]?.hidden || false}
                  onCheckedChange={(hidden) => {
                    setOverrides(prev => ({
                      ...prev,
                      [editingProduct.id]: { ...(prev[editingProduct.id] || {}), hidden },
                    }));
                    setHasChanges(true);
                  }}
                />
                <label className="text-sm">Hidden from storefront</label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                <Button
                  onClick={() => handleOverrideSave(editingProduct)}
                  className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white"
                >
                  Apply Override
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
