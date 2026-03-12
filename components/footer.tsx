import Link from "next/link"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-3xl font-bold text-primary">
              CUBE
            </Link>
            <p className="text-background/70">
              Votre restaurant moderne avec des plats personnalisés selon vos goûts et votre budget.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/menu" className="text-background/70 hover:text-primary transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/personnaliser" className="text-background/70 hover:text-primary transition-colors">
                  Personnaliser
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="text-background/70 hover:text-primary transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-background/70 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-4">Mon compte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/connexion" className="text-background/70 hover:text-primary transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="text-background/70 hover:text-primary transition-colors">
                  Inscription
                </Link>
              </li>
              <li>
                <Link href="/profil" className="text-background/70 hover:text-primary transition-colors">
                  Mon profil
                </Link>
              </li>
              <li>
                <Link href="/panier" className="text-background/70 hover:text-primary transition-colors">
                  Mon panier
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-background/70">123 Rue de la Gastronomie, Libreville</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-background/70">+241 XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="text-background/70">contact@cube-restaurant.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span className="text-background/70">Lun-Dim: 11h - 23h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-background/50">
          <p>&copy; {new Date().getFullYear()} CUBE Restaurant. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
