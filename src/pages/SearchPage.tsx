import { useSearchParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/contexts/ProductContext';
import { searchProducts } from '@/lib/productParser';
import { PriceRangeFilter } from '@/components/filters/PriceRangeFilter';
import { SEO } from '@/components/SEO';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { inStockProducts, isLoading, priceRange: globalPriceRange } = useProducts();
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([globalPriceRange.min, globalPriceRange.max]);
  const [showFilters, setShowFilters] = useState(false);

  // Update price range when global range changes
  useMemo(() => {
    setPriceRange([globalPriceRange.min, globalPriceRange.max]);
  }, [globalPriceRange]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    let results = searchProducts(inStockProducts, query);
    
    // Apply price filter
    results = results.filter(p => {
      const price = p.salePrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        results.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name':
        results.sort((a, b) => a.title.localeCompare(b.title, 'el'));
        break;
      default:
        break;
    }
    
    return results;
  }, [inStockProducts, query, sortBy, priceRange]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO
        title={query ? `Αναζήτηση: ${query}` : 'Αναζήτηση'}
        description={`Αποτελέσματα αναζήτησης${query ? ` για "${query}"` : ''} στο InspireHome.`}
        noindex
      />
      <div className="container-xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Αρχική
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Αποτελέσματα Αναζήτησης</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Search className="h-8 w-8 text-muted-foreground" />
              <h1 className="text-4xl font-semibold">
                {query ? `"${query}"` : 'Αναζήτηση Προϊόντων'}
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {searchResults.length} προϊόντα βρέθηκαν
            </p>
          </div>
          
          {query && (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Φίλτρα
              </Button>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-background">
                  <SelectValue placeholder="Ταξινόμηση" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Προεπιλογή</SelectItem>
                  <SelectItem value="price-asc">Τιμή: Χαμηλή → Υψηλή</SelectItem>
                  <SelectItem value="price-desc">Τιμή: Υψηλή → Χαμηλή</SelectItem>
                  <SelectItem value="name">Όνομα Α-Ω</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Results */}
        {query ? (
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="glass-subtle rounded-xl p-6 sticky top-28">
                <PriceRangeFilter
                  minPrice={globalPriceRange.min}
                  maxPrice={globalPriceRange.max}
                  value={priceRange}
                  onChange={setPriceRange}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4 text-muted-foreground"
                  onClick={() => setPriceRange([globalPriceRange.min, globalPriceRange.max])}
                >
                  Καθαρισμός Φίλτρων
                </Button>
              </div>
            </aside>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-0 h-full w-80 glass-strong p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Φίλτρα</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <PriceRangeFilter
                    minPrice={globalPriceRange.min}
                    maxPrice={globalPriceRange.max}
                    value={priceRange}
                    onChange={setPriceRange}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      setPriceRange([globalPriceRange.min, globalPriceRange.max]);
                      setShowFilters(false);
                    }}
                  >
                    Καθαρισμός Φίλτρων
                  </Button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid products={searchResults} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg">
              Εισάγετε έναν όρο αναζήτησης για να βρείτε προϊόντα
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
