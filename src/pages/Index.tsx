import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ArrowRight, Truck, Shield, Headphones, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/contexts/ProductContext';
import heroImage from '@/assets/hero-living-room.jpg';
import categoryFurniture from '@/assets/category-furniture.jpg';
import categoryDecor from '@/assets/category-decor.jpg';

export default function Index() {
  const { inStockProducts, isLoading } = useProducts();

  // Get trending products (first 4 + some later items to diversify the second row)
  const trendingProducts = useMemo(() => {
    if (inStockProducts.length < 10) return inStockProducts.slice(0, 8);
    return [
      ...inStockProducts.slice(0, 4),
      ...inStockProducts.slice(8, 12)
    ];
  }, [inStockProducts]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Modern living room"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
          {/* Color accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-rose-500/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-xl pt-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up border border-amber-500/30">
              New Collection 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-semibold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Transform Your
              <br />
              <span className="font-light bg-gradient-to-r from-amber-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">Living Space</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Ανακαλύψτε μοναδικά έπιπλα και διακοσμητικά που θα μετατρέψουν το σπίτι σας σε έναν χώρο έμπνευσης.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button asChild variant="hero" size="xl" className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 border-0 text-white">
                <Link to="/category/καθιστικό">
                  Explore Collection
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-foreground/30 rounded-full" />
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-24 bg-gradient-to-b from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4">Our Collections</h2>
            <p className="text-muted-foreground text-lg">Εξερευνήστε τις συλλογές μας</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Furniture Card */}
            <Link
              to="/category/καθιστικό"
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden hover-lift"
            >
              <img
                src={categoryFurniture}
                alt="Furniture collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 via-amber-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-amber-100 text-sm font-medium mb-2 block">Collection</span>
                <h3 className="text-3xl font-semibold text-white mb-4">Furniture</h3>
                <p className="text-amber-100/80 mb-6">Καναπέδες, Πολυθρόνες & Τραπέζια</p>
                <span className="inline-flex items-center text-amber-200 font-medium">
                  Explore <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Home Decor Card - Changed from Rose to Emerald/Sage */}
            <Link
              to="/category/διακόσμηση"
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden hover-lift"
            >
              <img
                src={categoryDecor}
                alt="Home decor collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-emerald-100 text-sm font-medium mb-2 block">Premium</span>
                <h3 className="text-3xl font-semibold text-white mb-4">Home Decor</h3>
                <p className="text-emerald-100/80 mb-6">Φωτιστικά & Διακοσμητικά</p>
                <span className="inline-flex items-center text-emerald-200 font-medium">
                  Explore <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Shop by Room Card - NEW Integrated Card */}
            <Link
              to="/category/καθιστικό"
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden hover-lift"
            >
              <div className="absolute inset-0 bg-[#f8f5f0]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-10 w-10 text-orange-600" />
                </div>
                <span className="text-orange-600 text-sm font-bold tracking-[0.2em] uppercase mb-2">Inspiration</span>
                <h3 className="text-3xl font-bold mb-4">Shop by Room</h3>
                <p className="text-muted-foreground mb-8">Οργανώστε τον χώρο σας ανά δωμάτιο</p>

                <div className="grid grid-cols-2 gap-2 w-full max-w-[200px]">
                  {['Living', 'Bedroom', 'Dining', 'Office'].map(room => (
                    <div key={room} className="text-[10px] uppercase tracking-tighter font-bold border border-orange-200 py-1.5 rounded-lg text-orange-800">
                      {room}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center text-orange-600 font-medium">
                  View All Rooms <ArrowRight className="h-4 w-4 ml-2" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-24 bg-secondary/10">
        <div className="container-xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-semibold mb-2">Trending Now</h2>
              <p className="text-muted-foreground">Τα πιο δημοφιλή προϊόντα μας</p>
            </div>
            <Button asChild variant="outline" className="border-amber-500/30 hover:bg-amber-500/10">
              <Link to="/category/καθιστικό">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <ProductGrid products={trendingProducts} isLoading={isLoading} />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-b from-amber-50/30 to-rose-50/20 dark:from-amber-950/10 dark:to-rose-950/5">
        <div className="container-xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 mx-auto mb-6 flex items-center justify-center">
                <Truck className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Δωρεάν Αποστολή</h3>
              <p className="text-muted-foreground text-sm">Σε παραγγελίες άνω των €100</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-7 w-7 text-rose-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Εγγύηση Ποιότητας</h3>
              <p className="text-muted-foreground text-sm">2 χρόνια εγγύηση σε όλα τα προϊόντα</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 mx-auto mb-6 flex items-center justify-center">
                <RefreshCw className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Εύκολες Επιστροφές</h3>
              <p className="text-muted-foreground text-sm">14 ημέρες δωρεάν επιστροφή</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 mx-auto mb-6 flex items-center justify-center">
                <Headphones className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Υποστήριξη 24/7</h3>
              <p className="text-muted-foreground text-sm">Είμαστε εδώ για εσάς</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
        <div className="container-xl">
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto border border-amber-500/20">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Μείνετε Ενημερωμένοι
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Εγγραφείτε στο newsletter μας και μάθετε πρώτοι για νέες αφίξεις και αποκλειστικές προσφορές.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 h-12 px-4 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <Button variant="hero" size="lg" className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 border-0 text-white">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
