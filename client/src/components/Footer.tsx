import { Link } from "wouter";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl">EduRenfort</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              La plateforme de cours de renforcement pour tous les niveaux. Apprenez avec des enseignants qualifiés.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Niveaux</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses?level=primaire" className="text-muted-foreground hover:text-foreground transition-colors">
                  Primaire
                </Link>
              </li>
              <li>
                <Link href="/courses?level=college" className="text-muted-foreground hover:text-foreground transition-colors">
                  Collège
                </Link>
              </li>
              <li>
                <Link href="/courses?level=lycee" className="text-muted-foreground hover:text-foreground transition-colors">
                  Lycée
                </Link>
              </li>
              <li>
                <Link href="/courses?level=siem" className="text-muted-foreground hover:text-foreground transition-colors">
                  SIEM
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Liens utiles</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tous les cours
                </Link>
              </li>
              <li>
                <Link href="/lives" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cours en direct
                </Link>
              </li>
              <li>
                <Link href="/become-teacher" className="text-muted-foreground hover:text-foreground transition-colors">
                  Devenir enseignant
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                contact@edurenfort.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                +221 77 123 45 67
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Dakar, Sénégal
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EduRenfort. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
