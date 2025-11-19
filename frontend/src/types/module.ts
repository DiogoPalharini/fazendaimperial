import type { LucideIcon } from 'lucide-react'

export type ModuleCategory = 'estrategico' | 'operacional' | 'financeiro' | 'suporte'

export interface ModuleDefinition {
  key: string
  path: string
  name: string
  description: string
  category: ModuleCategory
  icon: LucideIcon
  tags?: string[]
}



