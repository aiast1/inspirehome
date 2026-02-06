import { useParams, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/contexts/ProductContext';
import { filterProductsByCategory } from '@/lib/productParser';
import { PriceRangeFilter } from '@/components/filters/PriceRangeFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroLiving from '@/assets/hero-living-room.jpg';
import categoryFurniture from '@/assets/category-furniture.jpg';
import categoryDecor from '@/assets/category-decor.jpg';
import heroBedroom from '@/assets/hero_bedroom_1769276651303.png';
import heroOffice from '@/assets/hero_office_1769276666301.png';
import heroDining from '@/assets/hero_dining_1769276678590.png';
import heroStorage from '@/assets/hero_storage_1769277145645.png';
import heroOutdoor from '@/assets/hero_outdoor_1769277161279.png';
import heroKids from '@/assets/hero_kids_1769277174967.png';

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Checkbox } from '@/components/ui/checkbox';
import { SEO, collectionPageSchema, breadcrumbSchema } from '@/components/SEO';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { inStockProducts, categories, isLoading, priceRange: globalPriceRange } = useProducts();
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([globalPriceRange.min, globalPriceRange.max]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { recentProducts } = useRecentlyViewed();

  // Update price range when global range changes
  useMemo(() => {
    setPriceRange([globalPriceRange.min, globalPriceRange.max]);
  }, [globalPriceRange]);

  // Find category info
  const category = useMemo(() => {
    if (!slug) return undefined;
    const decodedSlug = decodeURIComponent(slug);
    return categories.find(cat =>
      cat.slug === decodedSlug ||
      cat.name.toLowerCase() === decodedSlug.toLowerCase() ||
      cat.subcategories.some(sub => sub.slug === decodedSlug || sub.name.toLowerCase() === decodedSlug.toLowerCase())
    );
  }, [categories, slug]);

  // Helper to extract unique values
  const getUniqueValues = (products: any[], key: string) => {
    const values = new Set<string>();
    products.forEach(p => {
      if (p[key]) {
        // Handle comma-separated values
        p[key].split(',').forEach((v: string) => values.add(v.trim()));
      }
    });
    return Array.from(values).sort();
  };

  // Get products for current category to determine available filters
  const categoryProducts = useMemo(() => {
    if (!slug) return inStockProducts;
    const decodedSlug = decodeURIComponent(slug);
    return filterProductsByCategory(inStockProducts, decodedSlug);
  }, [inStockProducts, slug]);

  const availableColors = useMemo(() => getUniqueValues(categoryProducts, 'color'), [categoryProducts]);
  const availableMaterials = useMemo(() => getUniqueValues(categoryProducts, 'material'), [categoryProducts]);
  const availableDimensions = useMemo(() => getUniqueValues(categoryProducts, 'dimensions'), [categoryProducts]);

  // Filter products by category AND filters
  const filteredProducts = useMemo(() => {
    let filtered = categoryProducts;

    // Apply price filter
    filtered = filtered.filter(p => {
      const price = p.salePrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply Color Filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        p.color && selectedColors.some(c => p.color?.includes(c))
      );
    }

    // Apply Material Filter
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(p =>
        p.material && selectedMaterials.some(m => p.material?.includes(m))
      );
    }

    // Apply Dimensions Filter
    if (selectedDimensions.length > 0) {
      filtered = filtered.filter(p =>
        p.dimensions && selectedDimensions.some(d => p.dimensions?.includes(d))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'el'));
        break;
      default:
        break;
    }

    return filtered;
  }, [categoryProducts, sortBy, priceRange, selectedColors, selectedMaterials, selectedDimensions]);

  // Reset pagination when filters, sort or limit change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, priceRange, selectedColors, selectedMaterials, selectedDimensions, slug, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Get category display name
  const categoryName = useMemo(() => {
    if (!slug) return 'All Products';

    // Check main categories
    const mainCat = categories.find(cat => cat.slug === slug);
    if (mainCat) return mainCat.name;

    // Check subcategories
    for (const cat of categories) {
      const subCat = cat.subcategories.find(sub => sub.slug === slug);
      if (subCat) return subCat.name;
    }

    return slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
  }, [categories, slug]);

  // Determine Category Hero Details
  const heroDetails = useMemo(() => {
    const s = decodeURIComponent(slug || '').toLowerCase();

    if (s.includes('καθιστικό') || s.includes('living')) {
      return {
        image: heroLiving,
        subtitle: 'For Urban Living',
        description: 'Δημιουργήστε τον ιδανικό χώρο χαλάρωσης με μοντέρνα και άνετα έπιπλα.',
        accent: 'amber'
      };
    }
    if (s.includes('υπνοδωμάτιο') || s.includes('bedroom')) {
      return {
        image: heroBedroom,
        subtitle: 'Dreamy Comfort',
        description: 'Ηρεμία και στυλ για τον πιο προσωπικό χώρο του σπιτιού σας.',
        accent: 'purple'
      };
    }
    if (s.includes('τραπεζαρία') || s.includes('dining')) {
      return {
        image: heroDining,
        subtitle: 'Gather Together',
        description: 'Μοναδικές στιγμές με την οικογένεια και φίλους γύρω από το τραπέζι.',
        accent: 'amber'
      };
    }
    if (s.includes('γραφείο') || s.includes('office')) {
      return {
        image: heroOffice,
        subtitle: 'Productive Spaces',
        description: 'Εργονομία και design για τον επαγγελματικό σας χώρο.',
        accent: 'blue'
      };
    }
    if (s.includes('αποθήκευση') || s.includes('storage') || s.includes('ντουλάπες')) {
      return {
        image: heroStorage,
        subtitle: 'Organized Living',
        description: 'Έξυπνες λύσεις αποθήκευσης για κάθε δωμάτιο.',
        accent: 'amber'
      };
    }
    if (s.includes('εξωτερικού') || s.includes('outdoor') || s.includes('κήπος')) {
      return {
        image: heroOutdoor,
        subtitle: 'Outdoor Oasis',
        description: 'Απολαύστε τον κήπο ή τη βεράντα σας με στυλ.',
        accent: 'green'
      };
    }
    if (s.includes('παιδικό') || s.includes('kids') || s.includes('paidiko')) {
      return {
        image: heroKids,
        subtitle: 'Playful & Safe',
        description: 'Ονειρεμένα έπιπλα για το παιδικό δωμάτιο.',
        accent: 'rose'
      };
    }
    if (s.includes('διακόσμηση') || s.includes('decor')) {
      return {
        image: categoryDecor,
        subtitle: 'Finishing Touches',
        description: 'Οι λεπτομέρειες που κάνουν τη διαφορά. Φωτιστικά, χαλιά και διακοσμητικά.',
        accent: 'rose'
      };
    }
    // Default / Furniture
    return {
      image: categoryFurniture,
      subtitle: 'Premium Collection',
      description: 'Ποιότητα και design που αντέχει στο χρόνο. Ανακαλύψτε τη συλλογή μας.',
      accent: 'amber'
    };
  }, [slug]);

  const accentColor = heroDetails.accent === 'amber' ? 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' :
    heroDetails.accent === 'rose' ? 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30' :
      heroDetails.accent === 'green' ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
        'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';

  const gradientColor = heroDetails.accent === 'amber' ? 'from-amber-500/10' :
    heroDetails.accent === 'rose' ? 'from-rose-500/10' :
      heroDetails.accent === 'green' ? 'from-green-500/10' :
        'from-blue-500/10';

  // Filter Widget Component
  const FilterWidget = () => (
    <div className="space-y-8">
      {/* Categories */}
      {category && (
        <div>
          <h3 className="font-semibold mb-4">Κατηγορίες</h3>
          <div className="space-y-2">
            <Link
              to={`/category/${category.slug}`}
              className="block py-1 text-sm font-medium text-foreground"
            >
              {category.name} ({categoryProducts.length})
            </Link>
            {category.subcategories.map(sub => (
              <Link
                key={sub.slug}
                to={`/category/${sub.slug}`}
                className="block py-1 text-sm text-muted-foreground hover:text-foreground transition-colors pl-4"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="border-t border-border pt-6">
        <PriceRangeFilter
          minPrice={globalPriceRange.min}
          maxPrice={globalPriceRange.max}
          value={priceRange}
          onChange={setPriceRange}
        />
      </div>

      {/* Colors */}
      {availableColors.length > 0 && (
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold mb-4">Χρώμα</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {availableColors.map(color => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={selectedColors.includes(color)}
                  onCheckedChange={(checked) => {
                    setSelectedColors(prev => checked ? [...prev, color] : prev.filter(c => c !== color));
                  }}
                />
                <label htmlFor={`color-${color}`} className="text-sm cursor-pointer select-none leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {color}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materials */}
      {availableMaterials.length > 0 && (
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold mb-4">Υλικό</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {availableMaterials.map(material => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={`mat-${material}`}
                  checked={selectedMaterials.includes(material)}
                  onCheckedChange={(checked) => {
                    setSelectedMaterials(prev => checked ? [...prev, material] : prev.filter(m => m !== material));
                  }}
                />
                <label htmlFor={`mat-${material}`} className="text-sm cursor-pointer select-none leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {material}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dimensions */}
      {availableDimensions.length > 0 && (
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold mb-4">Διαστάσεις</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {availableDimensions.map(dim => (
              <div key={dim} className="flex items-center space-x-2">
                <Checkbox
                  id={`dim-${dim}`}
                  checked={selectedDimensions.includes(dim)}
                  onCheckedChange={(checked) => {
                    setSelectedDimensions(prev => checked ? [...prev, dim] : prev.filter(d => d !== dim));
                  }}
                />
                <label htmlFor={`dim-${dim}`} className="text-sm cursor-pointer select-none leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {dim}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-4 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          setPriceRange([globalPriceRange.min, globalPriceRange.max]);
          setSelectedColors([]);
          setSelectedMaterials([]);
          setSelectedDimensions([]);
        }}
      >
        Καθαρισμός Φίλτρων
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO
        title={`${categoryName} - Έπιπλα & Διακόσμηση`}
        description={`${heroDetails.description} Βρείτε ${filteredProducts.length} προϊόντα στην κατηγορία ${categoryName} στο InspireHome.`}
        canonical={`/category/${slug}`}
        jsonLd={[
          collectionPageSchema(categoryName, `/category/${slug}`, heroDetails.description, filteredProducts.length),
          breadcrumbSchema([
            { name: 'Αρχική', url: '/' },
            { name: categoryName },
          ]),
        ]}
      />
      <div className="container-xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Αρχική
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{categoryName}</span>
        </nav>

        {/* Category Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-secondary/20 mb-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="p-8 md:p-12 lg:p-16 order-2 lg:order-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 animate-fade-up ${accentColor}`}>
                {heroDetails.subtitle}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
                {categoryName}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
                {heroDetails.description}
              </p>

              <div className="flex items-center gap-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
                <div>
                  <p className="text-3xl font-bold">{filteredProducts.length}</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Products</p>
                </div>
                <div className="w-px h-10 bg-border"></div>
                <div>
                  <p className="text-3xl font-bold">24h</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Shipping</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-[300px] lg:h-[500px] order-1 lg:order-2 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-tr ${gradientColor} to-transparent z-10`} />
              <img
                src={heroDetails.image}
                alt={categoryName}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Decorative "New" Badge */}
              <div className="absolute bottom-6 left-6 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-white/20 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                    <p className="font-bold text-sm">New Collection Stocked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Header (Mobile Toggle + Sort) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} results for <span className="font-medium text-foreground">{categoryName}</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Φίλτρα
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">Ανά σελίδα:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(parseInt(v))}>
                <SelectTrigger className="w-20 bg-background">
                  <SelectValue placeholder="50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Ταξινόμηση" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Δημοφιλή</SelectItem>
                <SelectItem value="price-asc">Τιμή: Χαμηλή → Υψηλή</SelectItem>
                <SelectItem value="price-desc">Τιμή: Υψηλή → Χαμηλή</SelectItem>
                <SelectItem value="name">Όνομα Α-Ω</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="space-y-8">
              <div className="glass-subtle rounded-xl p-6">
                <FilterWidget />
              </div>

              {/* Recently Viewed */}
              {recentProducts.length > 0 && (
                <div className="glass-subtle rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Recently Viewed
                  </h3>
                  <div className="space-y-4">
                    {recentProducts.map(p => (
                      <Link key={p.id} to={`/product/${p.slug}`} className="flex gap-3 group">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate group-hover:text-amber-600 transition-colors">{p.title}</p>
                          <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis">€{(p.salePrice || p.price).toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 h-full w-80 glass-strong p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Φίλτρα</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <FilterWidget />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <ProductGrid products={paginatedProducts} isLoading={isLoading} columns={3} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-10 rounded-xl ${currentPage === page ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <span key={page} className="px-1 text-muted-foreground transition-all duration-300">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="rounded-xl"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing {paginatedProducts.length} of {filteredProducts.length} items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
