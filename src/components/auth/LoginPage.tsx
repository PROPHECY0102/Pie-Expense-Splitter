import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email')
    .max(80),
  password: z.string().min(1, 'Password is required').max(80),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const loginWithPassword = useStore((s) => s.loginWithPassword)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: FormValues) {
    const result = loginWithPassword(values.email, values.password)
    if (!result.ok) {
      if (result.reason === 'not_found') {
        form.setError('email', { message: 'No account found with that email.' })
      } else {
        form.setError('password', { message: 'Incorrect password.' })
      }
      return
    }
    toast.success(`Welcome back, ${result.user.name}`)
    navigate({ to: '/app' })
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with the email and password you registered on this device."
      footer={
        <span className="text-muted-foreground">
          Need a new account?{' '}
          <Link to="/register" className="text-accent hover:underline">
            Sign up
          </Link>
        </span>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Your password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size="lg">
            Sign in
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
