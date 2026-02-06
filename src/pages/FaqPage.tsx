import { Link } from 'react-router-dom';
import { ChevronRight, HelpCircle } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { SEO, faqSchema, breadcrumbSchema } from '@/components/SEO';

export default function FaqPage() {
    const faqs = [
        {
            category: "Παραγγελίες & Λογαριασμός",
            items: [
                { q: "Πώς μπορώ να κάνω μια παραγγελία;", a: "Η διαδικασία είναι απλή: Επιλέξτε τα προϊόντα που επιθυμείτε, προσθέστε τα στο καλάθι και ακολουθήστε τα βήματα στο ταμείο. Μπορείτε να παραγγείλετε ως επισκέπτης ή να δημιουργήσετε λογαριασμό." },
                { q: "Μπορώ να ακυρώσω την παραγγελία μου;", a: "Ναι, μπορείτε να ακυρώσετε την παραγγελία σας εφόσον δεν έχει αποσταλεί ακόμα. Επικοινωνήστε άμεσα μαζί μας τηλεφωνικά ή μέσω email." },
                { q: "Χρειάζεται να δημιουργήσω λογαριασμό;", a: "Όχι, δεν είναι υποχρεωτικό. Ωστόσο, η δημιουργία λογαριασμού σάς επιτρέπει να παρακολουθείτε το ιστορικό των παραγγελιών σας και να αποθηκεύετε τα στοιχεία σας για μελλοντικές αγορές." }
            ]
        },
        {
            category: "Αποστολή & Παράδοση",
            items: [
                { q: "Ποιο είναι το κόστος μεταφορικών;", a: "Τα μεταφορικά υπολογίζονται βάσει του όγκου και του βάρους της παραγγελίας, καθώς και της περιοχής παράδοσης. Για αγορές άνω των 100€, η αποστολή είναι δωρεάν εντός Ελλάδας." },
                { q: "Πόσο χρόνο κάνει να παραδοθεί η παραγγελία;", a: "Συνήθως οι παραγγελίες παραδίδονται εντός 3-5 εργάσιμων ημερών. Για νησιωτικές ή δυσπρόσιτες περιοχές, ενδέχεται να χρειαστούν 1-2 επιπλέον ημέρες." },
                { q: "Συνεργάζεστε με μεταφορικές εταιρείες;", a: "Ναι, συνεργαζόμαστε με αξιόπιστες εταιρείες courier και μεταφορικές για την ασφαλή και έγκαιρη παράδοση των επίπλων σας." }
            ]
        },
        {
            category: "Επιστροφές & Εγγύηση",
            items: [
                { q: "Μπορώ να επιστρέψω ένα προϊόν;", a: "Δέχεστε επιστροφές εντός 14 ημερών από την παραλαβή, εφόσον το προϊόν είναι στην αρχική του κατάσταση και συσκευασία. Τα έξοδα επιστροφής βαραίνουν τον πελάτη, εκτός αν το προϊόν είναι ελαττωματικό." },
                { q: "Τι εγγύηση έχουν τα έπιπλα;", a: "Όλα μας τα έπιπλα συνοδεύονται από εγγύηση 2 ετών που καλύπτει κατασκευαστικά ελαττώματα." },
                { q: "Τι γίνεται αν παραλάβω χτυπημένο προϊόν;", a: "Σε περίπτωση που παραλάβετε ελαττωματικό ή χτυπημένο προϊόν, επικοινωνήστε άμεσα μαζί μας στέλνοντας φωτογραφίες. Θα φροντίσουμε για την άμεση αντικατάστασή του χωρίς καμία επιβάρυνση." }
            ]
        }
    ];

    const allFaqItems = faqs.flatMap(s => s.items.map(i => ({ question: i.q, answer: i.a })));

    return (
        <div className="min-h-screen pt-24 pb-16 bg-background">
            <SEO
                title="Συχνές Ερωτήσεις (FAQ)"
                description="Απαντήσεις στις πιο συχνές ερωτήσεις για παραγγελίες, αποστολή, επιστροφές και εγγύηση στο InspireHome. Μάθετε τα πάντα πριν αγοράσετε."
                canonical="/faq"
                jsonLd={[
                    faqSchema(allFaqItems),
                    breadcrumbSchema([
                        { name: 'Αρχική', url: '/' },
                        { name: 'Συχνές Ερωτήσεις' },
                    ]),
                ]}
            />
            <div className="container-xl">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
                    <Link to="/" className="hover:text-foreground transition-colors">
                        Αρχική
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">Συχνές Ερωτήσεις</span>
                </nav>

                {/* Header Section (Matching Contact Page Style) */}
                <div className="grid lg:grid-cols-2 gap-12 items-end mb-16">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Συχνές<br />
                            <span className="inline-block bg-gradient-to-r from-amber-100 to-rose-100 dark:from-amber-900/40 dark:to-rose-900/40 px-3 py-1 rounded-lg transform -rotate-1">
                                Ερωτήσεις
                            </span>
                        </h1>
                    </div>
                    <div className="flex flex-col gap-6 lg:items-end text-left lg:text-right">
                        <p className="text-lg text-muted-foreground max-w-md">
                            Έχετε απορίες; Συγκεντρώσαμε τις πιο συχνές ερωτήσεις για να σας βοηθήσουμε να βρείτε άμεσα τις απαντήσεις που ψάχνετε.
                        </p>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Side Navigation / Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-strong rounded-2xl p-8 border border-border/50 sticky top-24">
                            <div className="flex items-center gap-3 mb-4 text-amber-600">
                                <HelpCircle className="h-6 w-6" />
                                <h3 className="font-semibold text-lg">Χρειάζεστε βοήθεια;</h3>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                Δεν βρήκατε αυτό που ψάχνετε; Η ομάδα μας είναι εδώ για να σας εξυπηρετήσει προσωπικά.
                            </p>
                            <Link to="/contact">
                                <button className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-3 rounded-xl transition-all">
                                    Επικοινωνήστε μαζί μας
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Accordion Sections */}
                    <div className="lg:col-span-8 space-y-12">
                        {faqs.map((section, idx) => (
                            <div key={idx} className="glass-subtle rounded-3xl p-8 md:p-10 border border-border/50">
                                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                                    <span className="w-8 h-1 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full block"></span>
                                    {section.category}
                                </h2>
                                <Accordion type="single" collapsible className="w-full">
                                    {section.items.map((item, itemIdx) => (
                                        <AccordionItem key={itemIdx} value={`item-${idx}-${itemIdx}`} className="border-b-border/50">
                                            <AccordionTrigger className="text-left text-lg font-medium py-4 hover:text-amber-600 transition-colors">
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
