import { Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const orderNumber = `INS-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-xl">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              Ευχαριστούμε για την παραγγελία σας!
            </h1>
            <p className="text-muted-foreground text-lg">
              Η παραγγελία σας καταχωρήθηκε επιτυχώς
            </p>
          </div>

          {/* Order Details */}
          <div className="glass-strong rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">Αριθμός Παραγγελίας</p>
              <p className="text-2xl font-semibold text-primary">{orderNumber}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Email Επιβεβαίωσης</h3>
                  <p className="text-sm text-muted-foreground">
                    Θα λάβετε email με τις λεπτομέρειες της παραγγελίας σας
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Αποστολή</h3>
                  <p className="text-sm text-muted-foreground">
                    Η παραγγελία σας θα αποσταλεί εντός 2-5 εργάσιμων ημερών
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/">
                <Home className="h-5 w-5 mr-2" />
                Επιστροφή στην Αρχική
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/category/καθιστικό">
                Συνεχίστε τις Αγορές
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
