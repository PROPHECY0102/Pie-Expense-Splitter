import {
  Bus,
  Building,
  CircleDollarSign,
  Film,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Sofa,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import type { ExpenseCategory } from '@/types'

export const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: LucideIcon; tint: string }
> = {
  food: { label: 'Food & Dining', icon: Utensils, tint: 'bg-[hsl(22_70%_70%)]' },
  travel: { label: 'Travel', icon: Plane, tint: 'bg-[hsl(200_60%_70%)]' },
  lodging: { label: 'Lodging', icon: Building, tint: 'bg-[hsl(280_40%_72%)]' },
  transport: { label: 'Transport', icon: Bus, tint: 'bg-[hsl(150_45%_65%)]' },
  entertainment: { label: 'Entertainment', icon: Film, tint: 'bg-[hsl(340_60%_72%)]' },
  groceries: { label: 'Groceries', icon: ShoppingCart, tint: 'bg-[hsl(95_45%_65%)]' },
  utilities: { label: 'Utilities', icon: Sofa, tint: 'bg-[hsl(45_70%_70%)]' },
  shopping: { label: 'Shopping', icon: ShoppingBag, tint: 'bg-[hsl(15_70%_70%)]' },
  other: { label: 'Other', icon: CircleDollarSign, tint: 'bg-[hsl(0_0%_70%)]' },
}

export const CATEGORY_ORDER: ExpenseCategory[] = [
  'food',
  'groceries',
  'travel',
  'lodging',
  'transport',
  'entertainment',
  'utilities',
  'shopping',
  'other',
]
