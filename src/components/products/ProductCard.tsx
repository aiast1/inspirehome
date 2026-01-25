import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/productParser';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = product.salePrice || product.price;
  
  return (
    <div className={cn("group", className)}>
      {/* Image container */}
      <Link 
        to={`/product/${product.slug}`}
        className="block relative aspect-square rounded-xl overflow-hidden bg-secondary mb-4"
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover img-hover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        
        {/* Badges */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded-md">
            Sale
          </span>
        )}
        
        {!product.inStock && (
          <span className="absolute top-3 right-3 bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded-md">
            Out of Stock
          </span>
        )}
        
        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
      
      {/* Product info */}
      <div>
        <Link 
          to={`/product/${product.slug}`}
          className="block"
        >
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">
            €{displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              €{product.price.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Color/Material info */}
        {product.color && (
          <p className="text-xs text-muted-foreground mt-1">{product.color}</p>
        )}
      </div>
    </div>
  );
}
