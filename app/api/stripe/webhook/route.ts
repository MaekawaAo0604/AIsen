import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Firestoreのユーザー情報を更新
        await updateDoc(doc(db, 'users', userId), {
          plan: 'pro',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
          updatedAt: serverTimestamp(),
        })

        console.log(`✅ User ${userId} upgraded to Pro`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          break
        }

        // サブスクリプションステータスを更新
        await updateDoc(doc(db, 'users', userId), {
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
          updatedAt: serverTimestamp(),
        })

        console.log(`✅ Subscription updated for user ${userId}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          break
        }

        // Freeプランにダウングレード
        await updateDoc(doc(db, 'users', userId), {
          plan: 'free',
          subscriptionStatus: 'canceled',
          subscriptionCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
          updatedAt: serverTimestamp(),
        })

        console.log(`✅ User ${userId} downgraded to Free`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        )
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          break
        }

        // 支払い失敗を記録
        await updateDoc(doc(db, 'users', userId), {
          subscriptionStatus: 'past_due',
          updatedAt: serverTimestamp(),
        })

        console.log(`⚠️ Payment failed for user ${userId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
