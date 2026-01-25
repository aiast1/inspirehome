import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Το καλάθι σας είναι άδειο');
      return;
    }

    // Validate form
    if (!formData.email || !formData.firstName || !formData.lastName || 
        !formData.address || !formData.city || !formData.postalCode) {
      toast.error('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία');
      return;
    }

    setIsProcessing(true);
    
    // TODO: Integrate with Stripe checkout when backend is enabled
    // For now, simulate a successful order
    setTimeout(() => {
      clearCart();
      toast.success('Η παραγγελία σας ολοκληρώθηκε!');
      navigate('/order-confirmation');
      setIsProcessing(false);
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container-xl">
          <div className="text-center py-20">
            <h1 className="text-3xl font-semibold mb-4">Το καλάθι σας είναι άδειο</h1>
            <p className="text-muted-foreground mb-8">
              Προσθέστε προϊόντα στο καλάθι σας για να συνεχίσετε
            </p>
            <Button asChild variant="hero">
              <Link to="/">Επιστροφή στην Αρχική</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Αρχική
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Ολοκλήρωση Παραγγελίας</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Πίσω
                </Link>
              </Button>
            </div>
            
            <h1 className="text-3xl font-semibold mb-8">Ολοκλήρωση Παραγγελίας</h1>
            
            <form onSubmit={handleCheckout} className="space-y-6">
              <div>
                <h2 className="text-xl font-medium mb-4">Στοιχεία Επικοινωνίας</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email *</label>
                    <Input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com" 
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Όνομα *</label>
                      <Input 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Όνομα" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Επώνυμο *</label>
                      <Input 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Επώνυμο" 
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Τηλέφωνο</label>
                    <Input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+30 6900 000 000" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4">Διεύθυνση Αποστολής</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Διεύθυνση *</label>
                    <Input 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Οδός και αριθμός" 
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Πόλη *</label>
                      <Input 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Πόλη" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Τ.Κ. *</label>
                      <Input 
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="12345" 
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-subtle rounded-xl p-4 flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Τα στοιχεία σας είναι ασφαλή και κρυπτογραφημένα
                </p>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  'Επεξεργασία...'
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Πληρωμή €{totalPrice.toFixed(2)}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="glass-strong rounded-2xl p-6 lg:p-8 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Σύνοψη Παραγγελίας</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">{product.title}</h3>
                      <p className="text-muted-foreground text-sm">Ποσότητα: {quantity}</p>
                    </div>
                    <p className="font-medium">
                      €{((product.salePrice || product.price) * quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Υποσύνολο</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Αποστολή</span>
                  <span className="text-primary">Δωρεάν</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span>Σύνολο</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
