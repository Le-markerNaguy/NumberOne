import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div className={cn("text-center", className)}>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  )
}
