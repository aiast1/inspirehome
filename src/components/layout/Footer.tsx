import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/50 pt-16 pb-8">
      <div className="container-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="text-2xl font-semibold tracking-tight mb-4 inline-flex items-baseline gap-2">
              <span>inspire<span className="font-light">home</span></span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Καμπλατζης</span>
            </Link>
            <p className="text-muted-foreground mb-6">
              Μετατρέπουμε τους χώρους σας σε μοναδικές εμπειρίες με ποιοτικά έπιπλα και διακοσμητικά.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/inspire.home.kaplantzis/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Αρχική
              </Link>
              <Link to="/category/καθιστικό" className="text-muted-foreground hover:text-foreground transition-colors">
                Καθιστικό
              </Link>
              <Link to="/category/υπνοδωμάτιο" className="text-muted-foreground hover:text-foreground transition-colors">
                Υπνοδωμάτιο
              </Link>
              <Link to="/category/τραπεζαρία" className="text-muted-foreground hover:text-foreground transition-colors">
                Τραπεζαρία
              </Link>
              <Link to="/category/διακόσμηση" className="text-muted-foreground hover:text-foreground transition-colors">
                Διακόσμηση
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <div className="flex flex-col gap-3">
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                Σχετικά με εμάς
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Επικοινωνία
              </Link>
              <Link to="/info?tab=shipping" className="text-muted-foreground hover:text-foreground transition-colors">
                Αποστολή & Παράδοση
              </Link>
              <Link to="/info?tab=returns" className="text-muted-foreground hover:text-foreground transition-colors">
                Επιστροφές
              </Link>
              <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                Συχνές Ερωτήσεις
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="flex flex-col gap-4">
              <a
                href="tel:+302273027500"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>+30 22730 27500</span>
              </a>
              <a
                href="mailto:info@inspire-home.gr"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>info@inspire-home.gr</span>
              </a>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 mt-0.5" />
                <span>
                  Σμύρνης 3, Σάμος<br />
                  ΤΚ 83100
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
            © {currentYear} inspire<span className="font-light">home</span>
            <span className="text-[10px] uppercase font-bold tracking-widest pl-1">Καπλαντζης</span>
            . All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/info?tab=privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/info?tab=terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
