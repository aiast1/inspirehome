import { useState, useEffect } from 'react';
import type { Product } from '@/lib/productParser';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03ff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const isEdit = !!product;

  const [form, setForm] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    excerpt: product?.excerpt || '',
    price: product?.price || 0,
    salePrice: product?.salePrice || 0,
    images: product?.images || [''],
    categories: product?.categories?.join(', ') || '',
    color: product?.color || '',
    dimensions: product?.dimensions || '',
    material: product?.material || '',
    inStock: product?.inStock ?? true,
    stock: product?.stock || 0,
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit) {
      setForm(prev => ({ ...prev, slug: createSlug(prev.title) }));
    }
  }, [form.title, isEdit]);

  // Auto-generate excerpt from description
  useEffect(() => {
    if (!isEdit || !form.excerpt) {
      const excerpt = form.description.substring(0, 200) + (form.description.length > 200 ? '...' : '');
      setForm(prev => ({ ...prev, excerpt }));
    }
  }, [form.description, isEdit]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addImageField = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const updateImage = (index: number, value: string) => {
    setForm(prev => {
      const images = [...prev.images];
      images[index] = value;
      return { ...prev, images };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || form.price <= 0) return;

    const newProduct: Product = {
      id: product?.id || `other-${Date.now()}`,
      title: form.title,
      slug: form.slug || createSlug(form.title),
      description: form.description,
      excerpt: form.excerpt,
      price: Number(form.price),
      salePrice: form.salePrice > 0 ? Number(form.salePrice) : undefined,
      images: form.images.filter(url => url.trim()),
      categories: form.categories.split(',').map(c => c.trim()).filter(Boolean),
      color: form.color || undefined,
      dimensions: form.dimensions || undefined,
      material: form.material || undefined,
      inStock: form.inStock,
      stock: Number(form.stock),
    };

    onSave(newProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Title */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Title *</label>
        <Input value={form.title} onChange={(e) => handleChange('title', e.target.value)} required />
      </div>

      {/* Slug */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Slug</label>
        <Input value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} className="text-muted-foreground" />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Price *</label>
          <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Sale Price</label>
          <Input type="number" step="0.01" min="0" value={form.salePrice || ''} onChange={(e) => handleChange('salePrice', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} />
      </div>

      {/* Categories */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Categories (comma-separated)</label>
        <Input value={form.categories} onChange={(e) => handleChange('categories', e.target.value)} placeholder="e.g. Καθιστικό > Καναπέδες, Προσφορές" />
      </div>

      {/* Images */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Images</label>
        {form.images.map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input value={url} onChange={(e) => updateImage(i, e.target.value)} placeholder="https://..." className="flex-1" />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeImageField(i)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addImageField}>
          <Plus className="h-4 w-4 mr-1" /> Add Image
        </Button>
      </div>

      {/* Attributes row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Color</label>
          <Input value={form.color} onChange={(e) => handleChange('color', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Dimensions</label>
          <Input value={form.dimensions} onChange={(e) => handleChange('dimensions', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Material</label>
          <Input value={form.material} onChange={(e) => handleChange('material', e.target.value)} />
        </div>
      </div>

      {/* Stock row */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.inStock} onCheckedChange={(checked) => handleChange('inStock', checked)} />
          <label className="text-sm">In Stock</label>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Stock Quantity</label>
          <Input type="number" min="0" value={form.stock} onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)} className="w-24" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white">
          {isEdit ? 'Update' : 'Add'} Product
        </Button>
      </div>
    </form>
  );
}
