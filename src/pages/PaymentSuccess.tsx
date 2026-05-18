import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { paymentService } from '../services/paymentService'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<any>(null)

  const sessionId = searchParams.get('session_id')
  const orderRef = searchParams.get('order_ref')

  useEffect(() => {
    if (!sessionId && !orderRef) {
      setError('Missing session reference. Please return to the payment page.')
      setVerifying(false)
      return
    }

    const verify = async () => {
      try {
        let actualId: string | null = sessionId

        if (!actualId || actualId === '{session_id}' || actualId.includes('{')) {
          const m = window.location.href.match(/session_id=([^&]+)/)
          if (m && m[1] && !m[1].includes('{')) actualId = m[1]
          else if (orderRef) actualId = orderRef
          else {
            setError('Invalid payment session. Please contact support.')
            setVerifying(false)
            return
          }
        }

        const result = await paymentService.verifyPayment(actualId!)
        if (result.success) {
          setVerified(true)
          setPaymentData(result)
        } else {
          setError(result.message || 'Payment verification failed.')
        }
      } catch (err: any) {
        console.error('Verification error:', err)
        setError(err?.message || 'Could not verify payment.')
      } finally {
        setVerifying(false)
      }
    }

    verify()
  }, [sessionId, orderRef])

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-10 max-w-2xl"
      >
        {verifying ? (
          <Card padding="xl" className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
            <h2 className="mt-5 text-xl font-bold text-ink-900">Verifying your payment</h2>
            <p className="mt-1.5 text-sm text-ink-600">
              Hang tight while we confirm everything with the payment provider.
            </p>
          </Card>
        ) : verified ? (
          <Card padding="xl" className="text-center">
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
            >
              <CheckCircle2 className="h-8 w-8" />
            </motion.div>
            <h1 className="mt-6 text-2xl font-bold text-ink-900">Payment successful</h1>
            <p className="mt-1.5 text-sm text-ink-600">
              Your subscription has been activated. You can start using Jisr right away.
            </p>

            {paymentData?.payment ? (
              <dl className="mt-6 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-ink-50/40 text-left">
                {(
                  [
                    ['Status', <Badge key="s" variant="success">{paymentData.payment.status}</Badge>],
                    ['Amount', `${paymentData.payment.amount} ${paymentData.payment.currency}`],
                    paymentData.payment.thawaniPaymentId
                      ? ['Transaction ID', paymentData.payment.thawaniPaymentId]
                      : null,
                  ].filter(Boolean) as Array<[string, React.ReactNode]>
                ).map(([k, v], i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                      {k}
                    </dt>
                    <dd className="font-mono text-xs font-medium text-ink-900 truncate">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link to="/dashboard">
                <Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Go to dashboard
                </Button>
              </Link>
              <Link to="/family">
                <Button variant="outline">Manage family</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card padding="xl" className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent-50 text-accent-600 ring-1 ring-accent-200">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-ink-900">Verification failed</h1>
            <p className="mt-1.5 text-sm text-ink-600">
              {error ||
                "We couldn't verify your payment. If you completed the checkout, please contact support."}
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link to="/payment">
                <Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Try again
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline">Contact support</Button>
              </Link>
            </div>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
