import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmationEmailPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email || ""

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary">CUBE</h1>
          </Link>
          <p className="text-muted-foreground mt-2">Confirmation email</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Vérifie ta boîte mail</CardTitle>
            <CardDescription>
              Ton compte a été créé. Il reste une dernière étape pour l&apos;activer.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-white/70 border p-4">
              <p className="text-sm text-muted-foreground">
                Nous avons envoyé un lien de confirmation{email ? " à" : ""}{" "}
                {email ? (
                  <span className="font-medium text-foreground">{email}</span>
                ) : (
                  "à ton adresse email"
                )}.
              </p>

              <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Ouvre l&apos;email et clique sur le lien de confirmation.</li>
                <li>Ensuite, reviens ici et connecte-toi.</li>
                <li>Si tu ne vois rien, vérifie les spams.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href={`/connexion?redirect=/menu${
                  email ? `&email=${encodeURIComponent(email)}` : ""
                }`}
                className="flex-1"
              >
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  J&apos;ai confirmé, me connecter
                </Button>
              </Link>

              <Link href="/inscription" className="flex-1">
                <Button variant="outline" className="w-full">
                  Modifier mon inscription
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Astuce: si tu t&apos;es inscrit avec un email incorrect, retourne sur l&apos;inscription et recommence.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}