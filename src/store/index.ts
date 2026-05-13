import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type {
  ID,
  User,
  Group,
  GroupInvite,
  Expense,
  ExpenseSplit,
  Settlement,
  Preferences,
  SplitMethod,
  ExpenseCategory,
  GroupIconKey,
} from '@/types'
import { colorFromString } from '@/lib/utils'
import { resolveSplit } from '@/lib/split'

interface AppState {
  currentUserId: ID | null
  users: User[]
  groups: Group[]
  invites: GroupInvite[]
  expenses: Expense[]
  settlements: Settlement[]
  preferences: Preferences

  // Session
  registerUser: (input: { name: string; email: string }) => User
  loginAs: (userId: ID) => void
  logout: () => void
  updateProfile: (userId: ID, patch: Partial<Pick<User, 'name' | 'email'>>) => void

  // Groups
  createGroup: (input: {
    name: string
    description?: string
    iconKey?: GroupIconKey
    createdBy: ID
  }) => Group
  updateGroup: (groupId: ID, patch: Partial<Pick<Group, 'name' | 'description' | 'iconKey'>>) => void
  deleteGroup: (groupId: ID) => void
  removeMember: (groupId: ID, userId: ID) => void

  // Invites
  sendInvite: (input: { groupId: ID; fromUserId: ID; toUserId: ID }) => GroupInvite | null
  acceptInvite: (inviteId: ID) => void
  declineInvite: (inviteId: ID) => void
  cancelInvite: (inviteId: ID) => void

  // Expenses
  addExpense: (input: ExpenseInput) => Expense
  updateExpense: (expenseId: ID, input: ExpenseInput) => void
  deleteExpense: (expenseId: ID) => void

  // Settlements
  recordSettlement: (input: {
    groupId: ID
    fromUserId: ID
    toUserId: ID
    amountCents: number
    note?: string
    recordedBy: ID
  }) => Settlement
  deleteSettlement: (settlementId: ID) => void

  // Preferences
  setCurrency: (currency: string) => void
  setLocale: (locale: string) => void

  // Import / Reset
  importSnapshot: (data: Snapshot) => void
  resetAll: () => void
}

export interface ExpenseInput {
  id?: ID
  groupId: ID
  title: string
  amountCents: number
  category: ExpenseCategory
  date: number
  notes?: string
  paidBy: ID
  splitMethod: SplitMethod
  /** Map of userId → raw input value matching the split method. */
  inputs: Record<ID, number>
  createdBy: ID
}

export interface Snapshot {
  version: number
  currentUserId: ID | null
  users: User[]
  groups: Group[]
  invites: GroupInvite[]
  expenses: Expense[]
  settlements: Settlement[]
  preferences: Preferences
}

const defaultPreferences: Preferences = {
  currency: 'USD',
  locale: typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US',
}

const emptyState = {
  currentUserId: null as ID | null,
  users: [] as User[],
  groups: [] as Group[],
  invites: [] as GroupInvite[],
  expenses: [] as Expense[],
  settlements: [] as Settlement[],
  preferences: defaultPreferences,
}

function buildSplits(
  method: SplitMethod,
  inputs: Record<ID, number>,
  totalCents: number,
): ExpenseSplit[] {
  return resolveSplit(method, inputs, totalCents)
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyState,

      registerUser: ({ name, email }) => {
        const user: User = {
          id: nanoid(10),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          avatarColor: colorFromString(name + email),
          createdAt: Date.now(),
        }
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }))
        return user
      },

      loginAs: (userId) => set({ currentUserId: userId }),
      logout: () => set({ currentUserId: null }),
      updateProfile: (userId, patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
        })),

      createGroup: ({ name, description, iconKey, createdBy }) => {
        const group: Group = {
          id: nanoid(10),
          name: name.trim(),
          description: description?.trim() || undefined,
          iconKey,
          createdBy,
          memberIds: [createdBy],
          createdAt: Date.now(),
        }
        set((s) => ({ groups: [...s.groups, group] }))
        return group
      },

      updateGroup: (groupId, patch) =>
        set((s) => ({
          groups: s.groups.map((g) => (g.id === groupId ? { ...g, ...patch } : g)),
        })),

      deleteGroup: (groupId) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== groupId),
          invites: s.invites.filter((i) => i.groupId !== groupId),
          expenses: s.expenses.filter((e) => e.groupId !== groupId),
          settlements: s.settlements.filter((st) => st.groupId !== groupId),
        })),

      removeMember: (groupId, userId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, memberIds: g.memberIds.filter((id) => id !== userId) } : g,
          ),
        })),

      sendInvite: ({ groupId, fromUserId, toUserId }) => {
        const state = get()
        // Reject if user is already a member or has a pending invite
        const group = state.groups.find((g) => g.id === groupId)
        if (!group || group.memberIds.includes(toUserId)) return null
        const existing = state.invites.find(
          (i) => i.groupId === groupId && i.toUserId === toUserId && i.status === 'pending',
        )
        if (existing) return null
        const invite: GroupInvite = {
          id: nanoid(10),
          groupId,
          fromUserId,
          toUserId,
          status: 'pending',
          createdAt: Date.now(),
        }
        set((s) => ({ invites: [...s.invites, invite] }))
        return invite
      },

      acceptInvite: (inviteId) =>
        set((s) => {
          const inv = s.invites.find((i) => i.id === inviteId)
          if (!inv || inv.status !== 'pending') return s
          const groups = s.groups.map((g) =>
            g.id === inv.groupId && !g.memberIds.includes(inv.toUserId)
              ? { ...g, memberIds: [...g.memberIds, inv.toUserId] }
              : g,
          )
          const invites = s.invites.map((i) =>
            i.id === inviteId
              ? { ...i, status: 'accepted' as const, respondedAt: Date.now() }
              : i,
          )
          return { ...s, groups, invites }
        }),

      declineInvite: (inviteId) =>
        set((s) => ({
          invites: s.invites.map((i) =>
            i.id === inviteId
              ? { ...i, status: 'declined' as const, respondedAt: Date.now() }
              : i,
          ),
        })),

      cancelInvite: (inviteId) =>
        set((s) => ({ invites: s.invites.filter((i) => i.id !== inviteId) })),

      addExpense: (input) => {
        const splits = buildSplits(input.splitMethod, input.inputs, input.amountCents)
        const now = Date.now()
        const expense: Expense = {
          id: input.id ?? nanoid(10),
          groupId: input.groupId,
          title: input.title.trim(),
          amountCents: input.amountCents,
          category: input.category,
          date: input.date,
          notes: input.notes?.trim() || undefined,
          paidBy: input.paidBy,
          splitMethod: input.splitMethod,
          splits,
          createdBy: input.createdBy,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ expenses: [...s.expenses, expense] }))
        return expense
      },

      updateExpense: (expenseId, input) => {
        const splits = buildSplits(input.splitMethod, input.inputs, input.amountCents)
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === expenseId
              ? {
                  ...e,
                  groupId: input.groupId,
                  title: input.title.trim(),
                  amountCents: input.amountCents,
                  category: input.category,
                  date: input.date,
                  notes: input.notes?.trim() || undefined,
                  paidBy: input.paidBy,
                  splitMethod: input.splitMethod,
                  splits,
                  updatedAt: Date.now(),
                }
              : e,
          ),
        }))
      },

      deleteExpense: (expenseId) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== expenseId) })),

      recordSettlement: ({ groupId, fromUserId, toUserId, amountCents, note, recordedBy }) => {
        const settlement: Settlement = {
          id: nanoid(10),
          groupId,
          fromUserId,
          toUserId,
          amountCents,
          note: note?.trim() || undefined,
          createdAt: Date.now(),
          recordedBy,
        }
        set((s) => ({ settlements: [...s.settlements, settlement] }))
        return settlement
      },

      deleteSettlement: (settlementId) =>
        set((s) => ({
          settlements: s.settlements.filter((st) => st.id !== settlementId),
        })),

      setCurrency: (currency) =>
        set((s) => ({ preferences: { ...s.preferences, currency } })),
      setLocale: (locale) => set((s) => ({ preferences: { ...s.preferences, locale } })),

      importSnapshot: (data) =>
        set(() => ({
          currentUserId: data.currentUserId,
          users: data.users ?? [],
          groups: data.groups ?? [],
          invites: data.invites ?? [],
          expenses: data.expenses ?? [],
          settlements: data.settlements ?? [],
          preferences: data.preferences ?? defaultPreferences,
        })),

      resetAll: () => set(() => ({ ...emptyState })),
    }),
    {
      name: 'pie:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        users: state.users,
        groups: state.groups,
        invites: state.invites,
        expenses: state.expenses,
        settlements: state.settlements,
        preferences: state.preferences,
      }),
      migrate: (persisted, _version) => {
        // Stub for future migrations.
        return persisted as AppState
      },
    },
  ),
)

/** Build a JSON snapshot of the persisted state — used by Settings → Export. */
export function getSnapshot(): Snapshot {
  const s = useStore.getState()
  return {
    version: 1,
    currentUserId: s.currentUserId,
    users: s.users,
    groups: s.groups,
    invites: s.invites,
    expenses: s.expenses,
    settlements: s.settlements,
    preferences: s.preferences,
  }
}
