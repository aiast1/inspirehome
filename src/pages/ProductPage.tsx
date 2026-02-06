import { useParams, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Minus, Plus, ShoppingCart, Truck, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/contexts/ProductContext';
import { useCart } from '@/contexts/CartContext';
import { getSimilarProducts } from '@/lib/productParser';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { SEO, productSchema, breadcrumbSchema } from '@/components/SEO';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, isLoading } = useProducts();
  const { addItem } = useCart();
  const { addToHistory } = useRecentlyViewed();

  // Reset state and scroll to top when slug changes
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setSelectedImage(0);
  }, [slug]);

  // Find current product
  const product = useMemo(() => {
    return products.find(p => p.slug === slug);
  }, [products, slug]);

  // Track view
  useEffect(() => {
    if (product) {
      addToHistory(product);
    }
  }, [product]);

  // Get similar products
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return getSimilarProducts(products, product, 4);
  }, [products, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/">Go back home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = product.salePrice || product.price;
  const mainCategory = product.categories[0]?.split('>')[0]?.trim() || 'Products';

  const seoDescription = product.description
    ? product.description.slice(0, 160)
    : `${product.title} - Αγοράστε online στο InspireHome. €${displayPrice.toFixed(2)}. Δωρεάν αποστολή σε παραγγελίες άνω των €100.`;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO
        title={product.title}
        description={seoDescription}
        canonical={`/product/${product.slug}`}
        image={product.images[0] || undefined}
        type="product"
        jsonLd={[
          productSchema(product),
          breadcrumbSchema([
            { name: 'Αρχική', url: '/' },
            { name: mainCategory, url: `/category/${mainCategory.toLowerCase()}` },
            { name: product.title },
          ]),
        ]}
      />
      <div className="container-xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/category/${mainCategory.toLowerCase()}`} className="hover:text-foreground transition-colors">
            {mainCategory}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground line-clamp-1">{product.title}</span>
        </nav>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary mb-4">
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.slice(0, 6).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {hasDiscount && (
              <span className="inline-block bg-destructive text-destructive-foreground text-sm font-medium px-3 py-1 rounded-md mb-4">
                Sale
              </span>
            )}

            <h1 className="text-3xl font-semibold mb-4">{product.title}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-semibold">€{displayPrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  €{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <p className={`mb-6 ${product.inStock ? 'text-green-600' : 'text-destructive'}`}>
              {product.inStock ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </p>

            {/* Description */}
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {product.description || product.excerpt}
            </p>

            {/* Product Details */}
            <div className="glass-subtle rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <dl className="space-y-3">
                {product.dimensions && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Dimensions</dt>
                    <dd>{product.dimensions}</dd>
                  </div>
                )}
                {product.color && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Color</dt>
                    <dd>{product.color}</dd>
                  </div>
                )}
                {product.material && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Material</dt>
                    <dd>{product.material}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-input rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.inStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.inStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                onClick={() => addItem(product, quantity)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 glass-subtle rounded-lg">
                <Truck className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center p-4 glass-subtle rounded-lg">
                <RefreshCw className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
              <div className="text-center p-4 glass-subtle rounded-lg">
                <Shield className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">2 Year Warranty</p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-8">You Might Also Like</h2>
            <ProductGrid products={similarProducts} columns={4} />
          </section>
        )}
      </div>
    </div>
  );
}
