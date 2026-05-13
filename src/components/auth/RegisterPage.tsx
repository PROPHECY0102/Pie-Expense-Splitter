import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(40),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email')
    .max(80),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const registerUser = useStore((s) => s.registerUser)
  const users = useStore((s) => s.users)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  })

  function onSubmit(values: FormValues) {
    const normalizedEmail = values.email.trim().toLowerCase()
    if (users.some((u) => u.email === normalizedEmail)) {
      form.setError('email', {
        message: 'This email is already used by a Pie account on this device.',
      })
      return
    }
    const user = registerUser({ name: values.name, email: normalizedEmail })
    toast.success(`Welcome, ${user.name}! 🥧`)
    navigate({ to: '/app' })
  }

  return (
    <AuthLayout
      title="Create your slice"
      subtitle="Pie simulates accounts on this device — no real email is sent."
      footer={
        <span className="text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </span>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input placeholder="Alice Tan" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="alice@example.com"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Used only to identify you locally.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size="lg">
            Create account
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
