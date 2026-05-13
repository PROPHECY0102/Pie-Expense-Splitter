import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Check } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  GROUP_ICON_OPTIONS,
  GroupIcon,
} from '@/components/groups/GroupIcon'
import { useStore } from '@/store'
import { useCurrentUserId } from '@/hooks/useCurrentUser'
import type { GroupIconKey } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  description: z.string().max(200).optional(),
  iconKey: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export function GroupNew() {
  const navigate = useNavigate()
  const createGroup = useStore((s) => s.createGroup)
  const currentUserId = useCurrentUserId()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', iconKey: 'pie' },
  })

  function onSubmit(values: FormValues) {
    if (!currentUserId) return
    const group = createGroup({
      name: values.name,
      description: values.description,
      iconKey: values.iconKey as GroupIconKey,
      createdBy: currentUserId,
    })
    toast.success(`Group “${group.name}” created`)
    navigate({ to: '/app/groups/$groupId', params: { groupId: group.id } })
  }

  const iconKey = form.watch('iconKey')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/groups">
            <ArrowLeft className="h-4 w-4" /> All groups
          </Link>
        </Button>
        <h1 className="mt-3 font-serif text-3xl font-semibold">Start a new group</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Name it, give it a slice of personality, and you’re ready to invite the table.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group name</FormLabel>
                    <FormControl>
                      <Input placeholder="Trip to Italy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What kind of expenses go in this group?"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pick a slice</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {GROUP_ICON_OPTIONS.map((opt) => {
                          const active = field.value === opt.key
                          return (
                            <button
                              type="button"
                              key={opt.key}
                              onClick={() => field.onChange(opt.key)}
                              className={`relative aspect-square rounded-xl border bg-background/60 grid place-items-center transition-colors ${
                                active
                                  ? 'border-accent ring-2 ring-accent/40 bg-accent/10'
                                  : 'border-border hover:border-accent/40'
                              }`}
                              aria-label={opt.label}
                            >
                              <GroupIcon iconKey={opt.key} className="h-5 w-5 text-cocoa" />
                              {active ? (
                                <Check className="absolute right-1 top-1 h-3.5 w-3.5 text-accent" />
                              ) : null}
                            </button>
                          )
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3">
                <div className="h-11 w-11 rounded-xl bg-primary/25 grid place-items-center text-cocoa">
                  <GroupIcon iconKey={iconKey} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {form.watch('name') || 'Your group'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {form.watch('description') || 'Add a description so members know what’s shared.'}
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Create group
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
