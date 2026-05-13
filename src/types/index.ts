export type ID = string

export interface User {
  id: ID
  name: string
  email: string
  avatarColor: string
  createdAt: number
}

export interface Group {
  id: ID
  name: string
  description?: string
  iconKey?: string
  createdBy: ID
  memberIds: ID[]
  createdAt: number
}

export type InviteStatus = 'pending' | 'accepted' | 'declined'

export interface GroupInvite {
  id: ID
  groupId: ID
  fromUserId: ID
  toUserId: ID
  status: InviteStatus
  createdAt: number
  respondedAt?: number
}

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares'

export interface ExpenseSplit {
  userId: ID
  /**
   * Raw input value:
   *   'equal'      → 1 if included, 0 if excluded
   *   'exact'      → integer cents
   *   'percentage' → basis points (10000 = 100%)
   *   'shares'     → integer count
   */
  input: number
  /** Resolved share in cents (integer). Always sums exactly to expense.amountCents. */
  amountCents: number
}

export type ExpenseCategory =
  | 'food'
  | 'travel'
  | 'lodging'
  | 'transport'
  | 'entertainment'
  | 'groceries'
  | 'utilities'
  | 'shopping'
  | 'other'

export interface Expense {
  id: ID
  groupId: ID
  title: string
  amountCents: number
  category: ExpenseCategory
  date: number
  notes?: string
  paidBy: ID
  splitMethod: SplitMethod
  splits: ExpenseSplit[]
  createdBy: ID
  createdAt: number
  updatedAt: number
}

export interface Settlement {
  id: ID
  groupId: ID
  fromUserId: ID
  toUserId: ID
  amountCents: number
  note?: string
  createdAt: number
  recordedBy: ID
}

export interface Preferences {
  currency: string
  locale: string
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  travel: 'Travel',
  lodging: 'Lodging',
  transport: 'Transport',
  entertainment: 'Entertainment',
  groceries: 'Groceries',
  utilities: 'Utilities',
  shopping: 'Shopping',
  other: 'Other',
}

export const GROUP_ICONS = [
  'pie', 'cake', 'cookie', 'donut', 'ice-cream', 'coffee', 'plane', 'home',
] as const
export type GroupIconKey = (typeof GROUP_ICONS)[number]
