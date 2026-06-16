import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'

export default function PaymentCancel() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-10 max-w-2xl"
      >
        <Card padding="xl" className="text-center">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sunny-50 text-sunny-700 ring-1 ring-sunny-200"
          >
            <XCircle className="h-8 w-8" />
          </motion.div>

          <h1 className="mt-6 text-2xl font-bold text-ink-900">Checkout cancelled</h1>
          <p className="mt-1.5 text-sm text-ink-600">
            No worries — no charges were made to your account.
          </p>

          <div className="mt-6 rounded-2xl border border-ink-100 bg-ink-50/40 p-5 text-left text-sm text-ink-700">
            <h3 className="text-sm font-semibold text-ink-900">What happens next?</h3>
            <ul className="mt-2 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary-500" />
                Your account stays on its current plan.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary-500" />
                You can retry the checkout any time.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary-500" />
                Need help? Reach our team via support.
              </li>
            </ul>
          </div>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/payment">
              <Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Try again
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}
