import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Truck, CreditCard, RotateCcw, Shield, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function InfoPage() {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || "shipping";
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen pt-24 pb-16 bg-background">
            <div className="container-xl">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
                    <Link to="/" className="hover:text-foreground transition-colors">
                        Αρχική
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">Χρήσιμες Πληροφορίες</span>
                </nav>

                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                        Χρήσιμες<br />
                        <span className="inline-block bg-gradient-to-r from-amber-100 to-rose-100 dark:from-amber-900/40 dark:to-rose-900/40 px-3 py-1 rounded-lg transform -rotate-1">
                            Πληροφορίες
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Εδώ θα βρείτε όλες τις απαραίτητες πληροφορίες για τις αποστολές, τις πληρωμές και την πολιτική του καταστήματός μας.
                    </p>
                </div>

                <Tabs defaultValue="shipping" value={activeTab} onValueChange={setActiveTab} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="glass-strong rounded-2xl p-4 border border-border/50">
                                <TabsList className="flex flex-col h-auto bg-transparent gap-2 w-full p-0">
                                    <TabsTrigger
                                        value="shipping"
                                        className="w-full justify-start px-4 py-3 h-auto text-base font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl transition-all"
                                    >
                                        <Truck className="h-5 w-5 mr-3" />
                                        Τρόποι Αποστολής
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="payment"
                                        className="w-full justify-start px-4 py-3 h-auto text-base font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl transition-all"
                                    >
                                        <CreditCard className="h-5 w-5 mr-3" />
                                        Τρόποι Πληρωμής
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="returns"
                                        className="w-full justify-start px-4 py-3 h-auto text-base font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl transition-all"
                                    >
                                        <RotateCcw className="h-5 w-5 mr-3" />
                                        Ακύρωση – Επιστροφή
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="terms"
                                        className="w-full justify-start px-4 py-3 h-auto text-base font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl transition-all"
                                    >
                                        <FileText className="h-5 w-5 mr-3" />
                                        Όροι Χρήσης
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="privacy"
                                        className="w-full justify-start px-4 py-3 h-auto text-base font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl transition-all"
                                    >
                                        <Shield className="h-5 w-5 mr-3" />
                                        Πολιτική Απορρήτου
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-h-[500px]">
                        <div className="glass-subtle rounded-3xl p-8 md:p-12 border border-border/50">
                            <ScrollArea className="h-full">

                                {/* Shipping Content */}
                                <TabsContent value="shipping" className="mt-0 space-y-6 animate-fade-in">
                                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
                                        <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <Truck className="h-5 w-5 text-amber-600" />
                                        </span>
                                        Τρόποι Αποστολής
                                    </h2>
                                    <div className="prose prose-stone dark:prose-invert max-w-none space-y-4 text-muted-foreground/90 leading-relaxed">
                                        <p>Οι παραγγελίες σας αποστέλλονται με ιδιωτική ταχυμεταφορική (Courier) ή μεταφορική εταιρεία (για ογκώδη αντικείμενα) σε όλη την Ελλάδα.</p>
                                        <h3 className="text-foreground font-medium text-lg mt-6">Κόστος Μεταφορικών</h3>
                                        <p>Το κόστος των μεταφορικών υπολογίζεται βάσει του όγκου και του βάρους της παραγγελίας, καθώς και της περιοχής παράδοσης (Αττική, Χερσαία Ελλάδα, Νησιωτική Ελλάδα, Δυσπρόσιτες Περιοχές).</p>
                                        <p>Για αγορές συγκεκριμένης αξίας και άνω, ενδέχεται να παρέχεται δωρεάν αποστολή. Το ακριβές κόστος θα υπολογιστεί αυτόματα στο καλάθι αγορών σας πριν την ολοκλήρωση της παραγγελίας.</p>
                                        <h3 className="text-foreground font-medium text-lg mt-6">Χρόνος Παράδοσης</h3>
                                        <p>Ο συνήθης χρόνος παράδοσης είναι:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong>Αττική & Μεγάλα Αστικά Κέντρα:</strong> 1-3 εργάσιμες ημέρες</li>
                                            <li><strong>Υπόλοιπη Ελλάδα:</strong> 2-4 εργάσιμες ημέρες</li>
                                            <li><strong>Δυσπρόσιτες Περιοχές:</strong> 3-5 εργάσιμες ημέρες</li>
                                        </ul>
                                        <p className="text-sm italic mt-4">*Οι χρόνοι ενδέχεται να διαφοροποιηθούν σε περιόδους αιχμής ή λόγω ανωτέρας βίας.</p>
                                    </div>
                                </TabsContent>

                                {/* Payment Content */}
                                <TabsContent value="payment" className="mt-0 space-y-6 animate-fade-in">
                                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
                                        <span className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-rose-600" />
                                        </span>
                                        Τρόποι Πληρωμής
                                    </h2>
                                    <div className="prose prose-stone dark:prose-invert max-w-none space-y-4 text-muted-foreground/90 leading-relaxed">
                                        <p>Στο Inspire Home μπορείτε να ολοκληρώσετε τις αγορές σας με διάφορους τρόπους, επιλέγοντας αυτόν που σας εξυπηρετεί καλύτερα:</p>

                                        <div className="grid md:grid-cols-2 gap-6 mt-6 not-prose">
                                            <div className="p-6 rounded-xl bg-background/50 border border-border/50">
                                                <h4 className="font-semibold mb-2">Πιστωτική / Χρεωστική Κάρτα</h4>
                                                <p className="text-sm text-muted-foreground">Δεκτές όλες οι κάρτες Visa, Mastercard, Maestro. 100% ασφαλές περιβάλλον πληρωμών μέσω Τράπεζας.</p>
                                            </div>
                                            <div className="p-6 rounded-xl bg-background/50 border border-border/50">
                                                <h4 className="font-semibold mb-2">Τραπεζική Κατάθεση</h4>
                                                <p className="text-sm text-muted-foreground">Μπορείτε να εξοφλήσετε την παραγγελία σας μέσω e-banking ή σε τραπεζικό κατάστημα στους συνεργαζόμενους λογαριασμούς.</p>
                                            </div>
                                            <div className="p-6 rounded-xl bg-background/50 border border-border/50">
                                                <h4 className="font-semibold mb-2">Αντικαταβολή</h4>
                                                <p className="text-sm text-muted-foreground">Πληρωμή μετρητοίς κατά την παράδοση της παραγγελίας σας στο χώρο σας. Ενδέχεται να υπάρχει επιπλέον χρέωση για την υπηρεσία.</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Returns Content (Placeholder) */}
                                <TabsContent value="returns" className="mt-0 space-y-6 animate-fade-in">
                                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
                                        <span className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <RotateCcw className="h-5 w-5 text-purple-600" />
                                        </span>
                                        Ακύρωση – Επιστροφή
                                    </h2>
                                    <div className="prose prose-stone dark:prose-invert max-w-none space-y-4 text-muted-foreground/90 leading-relaxed">
                                        <p>Στόχος μας είναι η πλήρης ικανοποίησή σας. Αν δεν είστε ευχαριστημένοι με το προϊόν που παραλάβατε, έχετε το δικαίωμα επιστροφής.</p>
                                        <h3 className="text-foreground font-medium text-lg mt-6">Πολιτική Επιστροφών</h3>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Οι επιστροφές γίνονται δεκτές εντός <strong>14 ημερολογιακών ημερών</strong> από την ημερομηνία παραλαβής.</li>
                                            <li>Το προϊόν πρέπει να βρίσκεται στην αρχική του κατάσταση, χωρίς φθορές και στην αρχική του συσκευασία.</li>
                                            <li>Απαραίτητη είναι η απόδειξη αγοράς ή τιμολόγιο.</li>
                                        </ul>
                                        <h3 className="text-foreground font-medium text-lg mt-6">Διαδικασία Ακύρωσης</h3>
                                        <p>Για να ακυρώσετε μια παραγγελία, επικοινωνήστε μαζί μας τηλεφωνικά στο +30 22730 27500 ή μέσω email στο info@inspire-home.gr το συντομότερο δυνατό. Εάν η παραγγελία έχει ήδη αποσταλεί, δεν μπορεί να γίνει ακύρωση αλλά θα πρέπει να ακολουθηθεί η διαδικασία επιστροφής.</p>
                                    </div>
                                </TabsContent>

                                {/* Terms Content (Placeholder) */}
                                <TabsContent value="terms" className="mt-0 space-y-6 animate-fade-in">
                                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
                                        <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </span>
                                        Όροι Χρήσης
                                    </h2>
                                    <div className="prose prose-stone dark:prose-invert max-w-none space-y-4 text-muted-foreground/90 leading-relaxed">
                                        <p>Καλώς ήρθατε στο ηλεκτρονικό κατάστημα της Inspire Home. Η χρήση του παρόντος διαδικτυακού τόπου υπόκειται στους παρακάτω όρους και προϋποθέσεις.</p>
                                        <h3 className="text-foreground font-medium text-lg mt-6">Γενικοί Όροι</h3>
                                        <p>Η εταιρεία διατηρεί το δικαίωμα να τροποποιεί ή να ανανεώνει τους όρους και τις προϋποθέσεις συναλλαγών. Αναλαμβάνει δε την υποχρέωση να ενημερώνει το παρόν κείμενο για οποιαδήποτε αλλαγή ή προσθήκη στους όρους.</p>
                                        <h3 className="text-foreground font-medium text-lg mt-6">Πνευματική Ιδιοκτησία</h3>
                                        <p>Όλο το περιεχόμενο της ιστοσελίδας, συμπεριλαμβανομένων εικόνων, γραφικών, φωτογραφιών, σχεδίων, κειμένων, παρεχόμενων υπηρεσιών και προϊόντων αποτελούν πνευματική ιδιοκτησία της Inspire Home προστατεύονται κατά τις σχετικές διατάξεις του ελληνικού δικαίου.</p>
                                    </div>
                                </TabsContent>

                                {/* Privacy Content (Placeholder) */}
                                <TabsContent value="privacy" className="mt-0 space-y-6 animate-fade-in">
                                    <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
                                        <span className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-green-600" />
                                        </span>
                                        Πολιτική Απορρήτου
                                    </h2>
                                    <div className="prose prose-stone dark:prose-invert max-w-none space-y-4 text-muted-foreground/90 leading-relaxed">
                                        <p>Η προστασία των προσωπικών σας δεδομένων είναι σημαντική για εμάς. Η παρούσα Δήλωση Προστασίας Προσωπικών Δεδομένων περιγράφει πώς συλλέγουμε και χρησιμοποιούμε τις πληροφορίες σας.</p>
                                        <h3 className="text-foreground font-medium text-lg mt-6">Συλλογή Δεδομένων</h3>
                                        <p>Κατά την επίσκεψή σας στις σελίδες του καταστήματός μας και προκειμένου να παραγγείλετε προϊόντα, αλλά και για να διασφαλισθεί η δυνατότητα επικοινωνίας μαζί σας, είναι πιθανό να σας ζητηθεί να δηλώσετε στοιχεία που σας αφορούν (όνομα, επάγγελμα, ηλεκτρονική διεύθυνση, κλπ.).</p>
                                        <h3 className="text-foreground font-medium text-lg mt-6">Ασφάλεια</h3>
                                        <p>Το Inspire Home αναγνωρίζει τη σημασία του θέματος της ασφαλείας των Προσωπικών σας Δεδομένων καθώς και των ηλεκτρονικών σας συναλλαγών και λαμβάνει όλα τα απαραίτητα μέτρα για την εξασφάλιση της μέγιστης δυνατής ασφάλειας.</p>
                                    </div>
                                </TabsContent>

                            </ScrollArea>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
