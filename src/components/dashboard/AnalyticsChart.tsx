"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const data = [
  { name: "Mon", sent: 45, replies: 12 },
  { name: "Tue", sent: 52, replies: 18 },
  { name: "Wed", sent: 38, replies: 8 },
  { name: "Thu", sent: 61, replies: 22 },
  { name: "Fri", sent: 55, replies: 15 },
  { name: "Sat", sent: 28, replies: 6 },
  { name: "Sun", sent: 33, replies: 9 },
]

export function AnalyticsChart() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-card-foreground">Campaign Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Bar 
              dataKey="sent" 
              fill="url(#purpleGradient)" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="replies" 
              fill="#22C55E" 
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#9333EA" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
