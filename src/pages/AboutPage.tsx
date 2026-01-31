import { Link } from 'react-router-dom';
import { ChevronRight, Award, Users, Heart, Truck, Sparkles, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-living-room.jpg';
import furnitureImage from '@/assets/category-furniture.jpg';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background overflow-hidden">

      {/* Background Blobs for specific vibrancy */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/20 blur-[100px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-200/20 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container-xl relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-12 animate-fade-in">
          <Link to="/" className="hover:text-foreground transition-colors">
            Αρχική
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Σχετικά με εμάς</span>
        </nav>

        {/* 1. Hero Section (Clean but Vibrant) */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 border border-amber-200/50 backdrop-blur-sm mb-8 animate-fade-up shadow-sm hover:shadow-md transition-all cursor-default">
            <Sparkles className="h-4 w-4 text-amber-500 animate-spin-slow" />
            <span className="text-sm font-medium bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-2">
              inspirehome <span className="text-[10px] uppercase font-bold tracking-widest pl-1">Καπλαντζής</span>
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] animate-fade-up" style={{ animationDelay: '100ms' }}>
            Driven by Passion, <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                Designing Your Life
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-amber-200/30 rounded-full blur-sm -z-0"></span>
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
            Από τη Σάμο σε όλη την Ελλάδα. Συνδυάζουμε την αγάπη για το ποιοτικό έπιπλο με τη σύγχρονη αισθητική, δημιουργώντας χώρους που αφηγούνται τη δική σας ιστορία.
          </p>
        </div>

        {/* 2. Main Story with "Milestones" Card (The "Reference" Look) */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 mb-24 items-center">
          {/* Left: Image with Floating Elements */}
          <div className="relative group animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 to-rose-500/20 rounded-[2.5rem] transform rotate-2 group-hover:rotate-1 transition-transform duration-700 blur-xl" />
            <img
              src={heroImage}
              alt="Inspire Home Showroom"
              className="relative rounded-[2rem] w-full h-[600px] object-cover shadow-2xl transform transition-transform duration-700 group-hover:scale-[1.02]"
            />

            {/* Floating Milestones Card (Like "Genie" Reference) */}
            <div className="absolute -bottom-8 -right-8 md:-right-12 bg-white/90 dark:bg-black/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-sm border border-white/20 animate-float">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg">Ορόσημα</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="pt-1.5 flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <div className="w-0.5 h-8 bg-border mt-1"></div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">2000</span>
                    <p className="text-sm font-medium mt-1">Ίδρυση στη Σάμο</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="pt-1.5 flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                    <div className="w-0.5 h-8 bg-border mt-1"></div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">2015</span>
                    <p className="text-sm font-medium mt-1">Επέκταση 2ου καταστήματος</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="pt-1.5 flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Σήμερα</span>
                    <p className="text-sm font-medium mt-1">Πανελλαδική κάλυψη</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="flex flex-col justify-center space-y-8 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Μια Διαδρομή <span className="text-amber-600">Εξέλιξης</span> & <span className="text-rose-600">Έμπνευσης</span></h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                Το <strong>inspirehome <small className="text-[10px] ml-1 uppercase font-bold">Καπλαντζής</small></strong> δημιουργήθηκε από ένα όραμα: να φέρουμε το ποιοτικό, καλοσχεδιασμένο έπιπλο σε κάθε ελληνικό σπίτι, ξεκινώντας από την ακριτική Σάμο.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Υπό τη διεύθυνση του Βαγγέλη Καπλαντζής, εξελιχθήκαμε από ένα τοπικό κατάστημα σε έναν προορισμό design. Πιστεύουμε ότι το σπίτι σας δεν είναι απλά τοίχοι, αλλά το σκηνικό της ζωής σας.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-amber-50/50 dark:from-white/5 dark:to-white/0 border border-amber-100 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <ShieldCheck className="h-8 w-8 text-amber-600 mb-3" />
                <h3 className="font-bold text-lg mb-1">Κορυφαία Ποιότητα</h3>
                <p className="text-sm text-muted-foreground">Επιλογή άριστων υλικών</p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-rose-50/50 dark:from-white/5 dark:to-white/0 border border-rose-100 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <Users className="h-8 w-8 text-rose-600 mb-3" />
                <h3 className="font-bold text-lg mb-1">Ανθρωποκεντρικά</h3>
                <p className="text-sm text-muted-foreground">Προσωπική εξυπηρέτηση</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Values Grid (Gradient Cards) */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            {
              title: "Καινοτομία",
              desc: "Συνεχής αναζήτηση νέων τάσεων και υλικών.",
              icon: Sparkles,
              color: "amber"
            },
            {
              title: "Εμπειρία",
              desc: "Δεκαετίες εμπειρίας στο χώρο του επίπλου.",
              icon: Award,
              color: "rose"
            },
            {
              title: "Εμπιστοσύνη",
              desc: "Χτίζουμε σχέσεις εμπιστοσύνης με κάθε πελάτη.",
              icon: Heart,
              color: "purple"
            }
          ].map((item, i) => (
            <div key={i} className="group relative p-1 rounded-[2rem] bg-gradient-to-br from-white/20 to-white/0 hover:scale-105 transition-transform duration-500 animate-fade-up" style={{ animationDelay: `${500 + i * 100}ms` }}>
              <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br from-${item.color}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative h-full bg-white/50 dark:bg-black/40 backdrop-blur-md border border-white/20 rounded-[1.8rem] p-8 flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-full bg-${item.color}-100 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`h-7 w-7 text-${item.color}-600`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 4. FAQ Section */}
        <div className="max-w-4xl mx-auto mb-24 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Συχνές Ερωτήσεις</h2>
          <div className="grid gap-6">
            {[
              { q: "Ποιο είναι το κόστος μεταφορικών;", a: "Τα μεταφορικά υπολογίζονται βάσει του όγκου και του βάρους της παραγγελίας, καθώς και της περιοχής παράδοσης. Για αγορές άνω των 100€, η αποστολή είναι δωρεάν εντός Ελλάδας." },
              { q: "Πόσο χρόνο κάνει να παραδοθεί η παραγγελία;", a: "Συνήθως οι παραγγελίες παραδίδονται εντός 3-5 εργάσιμων ημερών. Για νησιωτικές ή δυσπρόσιτες περιοχές, ενδέχεται να χρειαστούν 1-2 επιπλέον ημέρες." },
              { q: "Μπορώ να επιστρέψω ένα προϊόν;", a: "Δέχεστε επιστροφές εντός 14 ημερών από την παραλαβή, εφόσον το προϊόν είναι στην αρχική του κατάσταση. Τα έξοδα επιστροφής βαραίνουν τον πελάτη." }
            ].map((faq, i) => (
              <div key={i} className="glass-subtle rounded-2xl p-6 border border-border/50 hover:border-amber-500/30 transition-colors">
                <h3 className="font-semibold text-lg mb-2 text-foreground/90">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1 transition-colors">
              Δείτε όλες τις ερωτήσεις <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 5. Large Call to Action */}
        <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-amber-600 to-rose-600 text-white text-center py-24 px-6 shadow-2xl animate-fade-up" style={{ animationDelay: '800ms' }}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Ready to create your dream home?
            </h2>
            <p className="text-xl text-white/90 mb-10 font-medium">
              Εξερευνήστε τη συλλογή μας και βρείτε κομμάτια που θα λατρέψετε για πάντα.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shop">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg bg-white text-rose-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold border-0">
                  Shop Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg border-2 border-white/30 hover:bg-white/10 text-white bg-transparent hover:border-white font-semibold transition-all">
                  Contact Us <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
