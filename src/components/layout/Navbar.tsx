
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { totalItems, setIsOpen: setCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();

    // Light effect uses full range
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    headerRef.current.style.setProperty('--mouse-x', `${x}%`);
    headerRef.current.style.setProperty('--mouse-y', `${y}%`);

    // TILT PROTECTION: 
    // Clamp coordinates to [0-100] so movement into menus doesn't amplify tilt.
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    const tiltX = (clampedY - 50) / 40;
    const tiltY = (clampedX - 50) / -60;
    headerRef.current.style.transform = `perspective(2000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${isScrolled ? 0.98 : 1})`;
  };

  const handleMouseLeaveContainer = () => {
    if (!headerRef.current) return;
    headerRef.current.style.setProperty('--mouse-x', '50%');
    headerRef.current.style.setProperty('--mouse-y', '50%');
    headerRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(${isScrolled ? 0.98 : 1})`;
  };

  const handleMouseEnter = (id: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navigationItems = [
    {
      label: 'Furniture',
      id: 'furniture',
      type: 'mega',
      columns: [
        {
          title: 'Living Room',
          path: '/category/καθιστικό',
          items: [
            { label: 'Sofas', path: '/category/καναπέδες' },
            { label: 'Corner Sofas', path: '/search?q=γωνιακοί' },
            { label: 'Armchairs', path: '/category/πολυθρόνες' },
            { label: 'Coffee Tables', path: '/category/τραπεζάκια-σαλονιού' },
            { label: 'Side Tables', path: '/search?q=βοηθητικά τραπεζάκια' },
            { label: 'TV Units', path: '/category/έπιπλα-τηλεόρασης' },
            { label: 'Poufs & Ottomans', path: '/category/πουφ-σκαμπό' },
          ]
        },
        {
          title: 'Dining Room',
          path: '/category/τραπεζαρία',
          items: [
            { label: 'Dining Tables', path: '/category/τραπέζια' },
            { label: 'Dining Chairs', path: '/category/καρέκλες' },
            { label: 'Sideboards', path: '/category/μπουφέδες' },
            { label: 'Display Cabinets', path: '/category/βιτρίνες' },
          ]
        },
        {
          title: 'Bedroom',
          path: '/category/υπνοδωμάτιο',
          items: [
            { label: 'Beds', path: '/category/κρεβάτια' },
            { label: 'Nightstands', path: '/category/κομοδίνα' },
            { label: 'Dressers', path: '/category/συρταριέρες' },
            { label: 'Wardrobes', path: '/category/ντουλάπες' },
            { label: 'Mattresses', path: '/category/στρώματα' },
          ]
        },
        {
          title: 'Office',
          path: '/category/έπιπλα-γραφείου',
          items: [
            { label: 'Desks', path: '/category/γραφεία' },
            { label: 'Office Chairs', path: '/category/καρέκλες-γραφείου' },
            { label: 'Bookcases', path: '/category/βιβλιοθήκες' },
          ]
        },
        {
          title: 'Storage',
          path: '/search?q=αποθήκευση',
          items: [
            { label: 'Shoe Racks', path: '/category/παπουτσοθήκες' },
            { label: 'Storage Benches', path: '/category/μπαούλα' },
          ]
        },
        {
          title: 'Outdoor',
          path: '/category/έπιπλα-εξωτερικού-χώρου',
          items: [
            { label: 'Outdoor Sofas', path: '/search?q=καναπέδες κήπου' },
            { label: 'Outdoor Chairs', path: '/category/καρέκλες-κήπου' },
            { label: 'Outdoor Tables', path: '/category/τραπέζια-κήπου' },
            { label: 'Sunbeds', path: '/category/ξαπλώστρες' },
          ]
        }
      ]
    },
    {
      label: 'Home Decor',
      id: 'decor',
      type: 'mega',
      columns: [
        {
          title: 'Lighting',
          path: '/category/φωτιστικά',
          items: [
            { label: 'Floor Lamps', path: '/search?q=δαπέδου' },
            { label: 'Table Lamps', path: '/search?q=επιτραπέζια' },
            { label: 'Ceiling Lights', path: '/search?q=οροφής' },
          ]
        },
        {
          title: 'Decoration',
          path: '/category/διακόσμηση',
          items: [
            { label: 'Decorative Objects', path: '/category/διακοσμητικά' },
            { label: 'Vases', path: '/category/βάζα' },
            { label: 'Trays', path: '/category/δίσκοι' },
            { label: 'Candles & Diffusers', path: '/category/κηροπήγια' },
            { label: 'Wall Decor', path: '/search?q=διακόσμηση τοίχου' },
          ]
        },
        {
          title: 'Mirrors',
          path: '/category/καθρέπτες',
          items: []
        },
        {
          title: 'Rugs',
          path: '/category/χαλιά',
          items: []
        }
      ]
    },
    {
      label: 'Shop by Room',
      id: 'rooms',
      type: 'dropdown',
      items: [
        { label: 'Living Room', path: '/category/καθιστικό' },
        { label: 'Bedroom', path: '/category/υπνοδωμάτιο' },
        { label: 'Dining Room', path: '/category/τραπεζαρία' },
        { label: 'Office', path: '/category/έπιπλα-γραφείου' },
        { label: 'Outdoor', path: '/category/έπιπλα-εξωτερικού-χώρου' },
      ]
    },
    {
      label: 'Collections',
      id: 'collections',
      type: 'dropdown',
      items: [
        { label: 'Modern', path: '/search?q=modern' },
        { label: 'Minimal', path: '/search?q=minimal' },
        { label: 'Scandinavian', path: '/search?q=scandi' },
        { label: 'Industrial', path: '/search?q=industrial' },
        { label: 'Luxury', path: '/search?q=luxury' },
        { label: 'Dark Collection', path: '/search?q=dark' },
      ]
    },
    { label: 'About', path: '/about', type: 'link' },
    { label: 'Contact', path: '/contact', type: 'link' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-500 pt-4 px-4 sm:px-6 lg:px-8">
      <header
        ref={headerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveContainer}
        style={{ transition: 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1), max-width 0.5s ease-out, padding 0.5s ease-out' }}
        className={cn(
          'relative flex items-center justify-between w-full max-w-[1400px] h-16 pointer-events-auto rounded-[2.5rem] glass-liquid glass-interactive glass-specular px-8',
          isScrolled ? 'max-w-[1200px]' : ''
        )}
      >
        {/* MacOS Traffic Lights Decor - REMOVED */}

        {/* Logo */}
        <Link to="/" className="flex items-end gap-3 group pb-1 flex-shrink-0">
          <img src={logo} alt="Logo" className="h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-110" />
          <span className="text-xl font-bold tracking-tighter flex items-baseline gap-1.5 overflow-hidden">
            <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">inspire<span className="font-light">home</span></span>
            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Καμπλατζης</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 mx-8 h-full">
          {navigationItems.map((item) => {
            if (item.type === 'link') {
              return (
                <Link
                  key={item.label}
                  to={item.path!}
                  className="px-4 py-1.5 text-sm font-semibold text-foreground/70 hover:text-foreground transition-all duration-300 rounded-full hover:bg-white/10"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="relative h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(item.id!)}
                onMouseLeave={handleMouseLeave}
              >
                <button className={cn(
                  "px-4 py-1.5 text-sm font-semibold text-foreground/70 hover:text-foreground transition-all duration-300 flex items-center gap-1 rounded-full",
                  activeDropdown === item.id ? "bg-white/15 text-foreground shadow-sm" : "hover:bg-white/10"
                )}>
                  {item.label}
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 transition-transform duration-500",
                    activeDropdown === item.id && "rotate-180"
                  )} />
                </button>

                {/* Apple Style Menu Dropdown */}
                {activeDropdown === item.id && (
                  <div className={cn(
                    "absolute top-[calc(100%-8px)] left-0 pt-4 animate-in fade-in slide-in-from-top-4 duration-300 z-50",
                    item.type === 'mega' ? "w-max" : "min-w-[200px]"
                  )}>
                    <div className={cn(
                      "glass-liquid glass-specular rounded-[2rem] border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.15)] pointer-events-auto",
                      item.type === 'mega' ? "p-10" : "p-2"
                    )}>
                      {item.type === 'mega' ? (
                        <div className="flex gap-16">
                          {item.columns!.map((col) => (
                            <div key={col.title} className="space-y-4">
                              <Link to={col.path} className="font-bold text-base hover:text-amber-600 transition-colors block pb-1 border-b border-foreground/5 whitespace-nowrap">{col.title}</Link>
                              {col.items.length > 0 && (
                                <div className="space-y-2">
                                  {col.items.map((sub) => (
                                    <Link key={sub.label} to={sub.path} className="block text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 duration-300 whitespace-nowrap">{sub.label}</Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {item.items!.map((sub) => (
                            <Link
                              key={sub.label}
                              to={sub.path}
                              className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-white/15 transition-all duration-300 flex justify-between items-center group/item"
                            >
                              {sub.label}
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 scale-0 group-hover/item:scale-100 transition-transform duration-300" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative flex items-center">
            {isSearchOpen && (
              <form onSubmit={handleSearch} className="absolute right-full mr-4 flex items-center animate-in slide-in-from-right-4 duration-500">
                <Input
                  ref={searchInputRef}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-64 bg-white/10 backdrop-blur-md rounded-full border-white/20 px-6 focus-visible:ring-amber-500 transition-all shadow-lg"
                />
              </form>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)} className="h-10 w-10 rounded-full hover:bg-white/15 transition-all text-foreground/80 hover:text-foreground">
              {isSearchOpen ? <X className="h-4.5 w-4.5" /> : <Search className="h-4.5 w-4.5" />}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(true)}
            className="h-10 w-10 rounded-full hover:bg-white/15 transition-all relative text-foreground/80 hover:text-foreground"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-background/10">
                {totalItems}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden h-10 w-10 rounded-full hover:bg-white/15 transition-all">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 glass-liquid glass-specular border border-white/20 rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden shadow-2xl lg:hidden pointer-events-auto">
            <div className="grid grid-cols-2 gap-4">
              {navigationItems.map(item => (
                <Link
                  key={item.label}
                  to={item.path || '#'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all font-bold text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
