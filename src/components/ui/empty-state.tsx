import { ReactNode } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <Card className={`bg-card border-border/50 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        {icon && (
          <div className="mb-4 text-muted-foreground">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {description}
        </p>
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
