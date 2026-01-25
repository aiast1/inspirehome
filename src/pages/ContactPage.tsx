import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Twitter, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import categoryFurniture from '@/assets/category-furniture.jpg'; // Using this as the hero/side image

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.message) {
      toast.error('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία');
      return;
    }

    // Formspark Form ID
    const formsparkId = 'aejiJKYgP';

    setIsSubmitting(true);

    try {
      const response = await fetch(`https://submit-form.com/${formsparkId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          _gotcha: "",
        }),
      });

      if (response.ok) {
        toast.success('Το μήνυμά σας στάλθηκε επιτυχώς!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: '',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Πρόβλημα από την υπηρεσία Formspark';
        console.error('Formspark response error:', errorData);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(`Σφάλμα: ${error.message || 'Υπήρξε πρόβλημα με την αποστολή. Παρακαλώ δοκιμάστε ξανά.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container-xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
          <Link to="/" className="hover:text-foreground transition-colors">
            Αρχική
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Επικοινωνία</span>
        </nav>

        {/* 1. Header Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-end mb-16">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Θα χαρούμε να<br />
              <span className="inline-block bg-gradient-to-r from-amber-100 to-rose-100 dark:from-amber-900/40 dark:to-rose-900/40 px-3 py-1 rounded-lg transform -rotate-1">
                ακούσουμε
              </span>{' '}
              από εσάς
            </h1>
          </div>
          <div className="flex flex-col gap-6 lg:items-end text-left lg:text-right">
            <p className="text-lg text-muted-foreground max-w-md">
              Η ομάδα μας είναι εδώ για να σας βοηθήσει να βρείτε τα τέλεια έπιπλα για τον χώρο σας. Μη διστάσετε να επικοινωνήσετε μαζί μας.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-12 h-12 rounded-full bg-secondary hover:bg-gradient-to-r hover:from-amber-600 hover:to-rose-600 hover:text-white transition-all flex items-center justify-center transform hover:scale-110"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Info Cards Section (Row) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              title: "Address",
              content: "Σμύρνης 3, Σάμος, 83100",
              icon: MapPin,
            },
            {
              title: "Email",
              content: "info@inspire-home.gr",
              icon: Mail,
              href: "mailto:info@inspire-home.gr"
            },
            {
              title: "Phone",
              content: "+30 22730 27500",
              icon: Phone,
              href: "tel:+302273027500"
            },
            {
              title: "Opening Hours",
              content: "09:00 - 14:30 & 18:00 - 21:00",
              icon: Clock,
            }
          ].map((item, idx) => (
            <div key={idx} className="group p-6 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-background hover:shadow-lg hover:border-amber-200 transition-all duration-300 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className="text-lg font-medium text-amber-600/80">{item.title}</span>
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <ArrowUpRight className="h-4 w-4 text-foreground/60 group-hover:text-amber-700" />
                </div>
              </div>
              {item.href ? (
                <a href={item.href} className="text-xl font-semibold hover:underline decoration-amber-500/50 underline-offset-4 block truncate">
                  {item.content}
                </a>
              ) : (
                <p className="text-lg font-semibold leading-relaxed">
                  {item.content}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 3. Main Content Section (Image + Form) */}
        <div className="glass-strong rounded-3xl p-4 overflow-hidden border border-border/50 bg-white/50 dark:bg-black/20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-0">
            {/* Left Column - Image */}
            <div className="relative rounded-2xl overflow-hidden min-h-[400px] lg:min-h-full group">
              <img
                src={categoryFurniture}
                alt="Inspire Home Furniture"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
                <div className="glass-strong rounded-xl p-6 backdrop-blur-md bg-white/10 border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-semibold mb-2">Partnerships</h3>
                  <p className="text-white/80 text-sm mb-4">Ενδιαφέρεστε για συνεργασία; Επικοινωνήστε μαζί μας για B2B λύσεις.</p>
                  <a href="mailto:partners@inspire-home.gr" className="inline-flex items-center text-sm font-medium hover:text-amber-300 transition-colors">
                    info@inspire-home.gr <ArrowUpRight className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="p-8 lg:p-12 lg:pl-16 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold mb-2">Στείλτε μας μήνυμα</h2>
                <p className="text-muted-foreground">Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε μαζί σας σύντομα.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Όνομα</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter First Name"
                      className="h-12 rounded-xl bg-background/50 border-transparent hover:border-amber-200 focus:border-amber-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Επώνυμο</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter Last Name"
                      className="h-12 rounded-xl bg-background/50 border-transparent hover:border-amber-200 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your Email"
                      className="h-12 rounded-xl bg-background/50 border-transparent hover:border-amber-200 focus:border-amber-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Τηλέφωνο</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter Phone Number"
                      className="h-12 rounded-xl bg-background/50 border-transparent hover:border-amber-200 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium ml-1">Μήνυμα</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your Message"
                    rows={6}
                    className="rounded-xl bg-background/50 border-transparent hover:border-amber-200 focus:border-amber-500 transition-all resize-none p-4"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input type="checkbox" id="terms" className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" required />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer select-none">
                    Συμφωνώ με τους <Link to="/terms" className="text-foreground underline">Όρους Χρήσης</Link> και την <Link to="/privacy" className="text-foreground underline">Πολιτική Απορρήτου</Link>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="rounded-full px-8 py-6 bg-foreground text-background hover:bg-foreground/90 transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Αποστολή...' : 'Send your Message'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
