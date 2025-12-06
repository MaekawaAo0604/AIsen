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
    console.log('✅ Webhook event received:', event.type, 'ID:', event.id)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        console.log('📦 Checkout session completed:', {
          sessionId: session.id,
          userId,
          customerId: session.customer,
          subscriptionId: session.subscription,
        })

        if (!userId) {
          console.error('❌ No userId in session metadata')
          break
        }

        const subscription = (await stripe.subscriptions.retrieve(
          session.subscription as string
        )) as any

        console.log('💳 Subscription retrieved:', {
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
        })

        // Firestoreのユーザー情報を更新
        await updateDoc(doc(db, 'users', userId), {
          plan: 'pro',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : new Date(),
          updatedAt: serverTimestamp(),
        })

        console.log(`✅ User ${userId} upgraded to Pro in Firestore`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          break
        }

        // サブスクリプションステータスを更新
        await updateDoc(doc(db, 'users', userId), {
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : new Date(),
          updatedAt: serverTimestamp(),
        })

        console.log(`✅ Subscription updated for user ${userId}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          break
        }

        // Freeプランにダウングレード
        await updateDoc(doc(db, 'users', userId), {
          plan: 'free',
          subscriptionStatus: 'canceled',
          subscriptionCurrentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : new Date(),
          updatedAt: serverTimestamp(),
        })

        console.log(`✅ User ${userId} downgraded to Free`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const subscription = (await stripe.subscriptions.retrieve(
          invoice.subscription as string
        )) as any
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
