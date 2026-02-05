import { useState, useEffect, useRef } from 'react';
import type { Product } from '@/lib/productParser';
import { apiGetProducts, apiSaveProducts } from '@/lib/adminApi';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductForm } from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Upload, Save } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sha, setSha] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Dialog state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await apiGetProducts();
      setProducts(data.products);
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
      await apiSaveProducts(products, sha);
      toast.success('Products saved! Changes will be live in ~1 minute.');
      setHasChanges(false);
      // Reload to get fresh SHA
      await loadProducts();
    } catch (err: any) {
      if (err.message.includes('409')) {
        toast.error('File was modified by someone else. Please reload.');
      } else {
        toast.error(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddProduct(product: Product) {
    setProducts(prev => [...prev, product]);
    setShowAddDialog(false);
    setHasChanges(true);
    toast.success('Product added. Don\'t forget to save!');
  }

  function handleEditProduct(product: Product) {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
    setHasChanges(true);
    toast.success('Product updated. Don\'t forget to save!');
  }

  function handleDeleteProduct() {
    if (!deletingProduct) return;
    setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
    setDeletingProduct(null);
    setHasChanges(true);
    toast.success('Product removed. Don\'t forget to save!');
  }

  function handleJsonUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) throw new Error('JSON must be an array');
        setProducts(data);
        setHasChanges(true);
        toast.success(`Loaded ${data.length} products from file. Don't forget to save!`);
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          <h1 className="text-2xl font-bold">Other Products</h1>
          <p className="text-muted-foreground mt-1">Manage products from non-Liberta suppliers</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleJsonUpload}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Upload JSON
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
          {hasChanges && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white"
            >
              <Save className="h-4 w-4 mr-1" /> {isSaving ? 'Saving...' : 'Save All'}
            </Button>
          )}
        </div>
      </div>

      <ProductTable
        products={products}
        onEdit={setEditingProduct}
        onDelete={setDeletingProduct}
      />

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          <ProductForm onSave={handleAddProduct} onCancel={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm product={editingProduct} onSave={handleEditProduct} onCancel={() => setEditingProduct(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{deletingProduct?.title}" from the list. You still need to save for the change to take effect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
