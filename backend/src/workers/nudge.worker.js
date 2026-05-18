/**
 * Nudge Engine – daily reminder cron job.
 *
 * Runs every day at 09:00 server time and sends payment reminder emails for
 * PENDING orders based on their dueDate:
 *
 *   T-2  → "Payment due in 2 days"   (dueDate == today + 2)
 *   T-1  → "Payment due tomorrow"    (dueDate == today + 1)
 *   T+1  → "Payment overdue"         (dueDate == yesterday)
 *           Orders are also marked FAILED to prevent further nudges.
 */

const cron = require('node-cron');
const prisma = require('../config/db');
const emailService = require('../services/email.service');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns { start, end } for the beginning and end of a given UTC date */
function dayWindow(date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

/** Returns a Date offset by `days` from today */
function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ─── Query helpers ────────────────────────────────────────────────────────────

async function fetchPendingOrdersForDay(targetDate) {
  const { start, end } = dayWindow(targetDate);

  return prisma.order.findMany({
    where: {
      status: 'PENDING',
      dueDate: { gte: start, lte: end },
    },
    include: {
      plan: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });
}

// ─── Nudge handlers ───────────────────────────────────────────────────────────

async function runTwoDayReminders() {
  const orders = await fetchPendingOrdersForDay(daysFromNow(2));
  console.log(`[Nudge T-2] Found ${orders.length} order(s)`);

  for (const order of orders) {
    try {
      await emailService.sendReminderTwoDays({
        email: order.user.email,
        name: order.user.name,
        planName: order.plan.name,
        amount: order.amount,
        dueDate: order.dueDate,
        orderId: order.id,
      });
    } catch (err) {
      console.error(`[Nudge T-2] Email failed for order ${order.id}:`, err.message);
    }
  }
}

async function runOneDayReminders() {
  const orders = await fetchPendingOrdersForDay(daysFromNow(1));
  console.log(`[Nudge T-1] Found ${orders.length} order(s)`);

  for (const order of orders) {
    try {
      await emailService.sendReminderOneDay({
        email: order.user.email,
        name: order.user.name,
        planName: order.plan.name,
        amount: order.amount,
        dueDate: order.dueDate,
        orderId: order.id,
      });
    } catch (err) {
      console.error(`[Nudge T-1] Email failed for order ${order.id}:`, err.message);
    }
  }
}

async function runOverdueReminders() {
  const orders = await fetchPendingOrdersForDay(daysFromNow(-1));
  console.log(`[Nudge Overdue] Found ${orders.length} order(s)`);

  for (const order of orders) {
    try {
      await emailService.sendReminderOverdue({
        email: order.user.email,
        name: order.user.name,
        planName: order.plan.name,
        amount: order.amount,
        dueDate: order.dueDate,
        orderId: order.id,
      });

      // Mark overdue orders as FAILED so they don't surface again
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      });
    } catch (err) {
      console.error(`[Nudge Overdue] Error for order ${order.id}:`, err.message);
    }
  }
}

// ─── Main job ─────────────────────────────────────────────────────────────────

async function runNudgeJob() {
  console.log('[Nudge] Starting daily nudge run at', new Date().toISOString());

  await Promise.allSettled([
    runTwoDayReminders(),
    runOneDayReminders(),
    runOverdueReminders(),
  ]);

  console.log('[Nudge] Daily nudge run complete');
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

function startNudgeWorker() {
  // Run daily at 09:00 (server local time)
  cron.schedule('0 9 * * *', async () => {
    try {
      await runNudgeJob();
    } catch (err) {
      // Never let cron crash the process
      console.error('[Nudge] Unhandled error in nudge job:', err.message);
    }
  });

  console.log('[Nudge] Worker scheduled — runs daily at 09:00');
}

module.exports = { startNudgeWorker, runNudgeJob };
