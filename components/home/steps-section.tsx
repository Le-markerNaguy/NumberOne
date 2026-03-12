import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface Step {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

interface StepsSectionProps {
  title: string
  subtitle?: string
  steps: Step[]
  ctaLabel?: string
  ctaHref?: string
}

export function StepsSection({
  title,
  subtitle,
  steps,
  ctaLabel,
  ctaHref,
}: StepsSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-primary/20" />
              )}
              
              <div className="text-center relative z-10">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                  <step.icon className="w-10 h-10 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {ctaLabel && ctaHref && (
          <div className="text-center mt-12">
            <Link href={ctaHref}>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                {ctaLabel}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
