import { db } from '@/mocks/db';
import { uid } from '@/mocks/helpers';
import type {
  Address,
  AppNotification,
  ChatMessage,
  ChatThread,
  Faq,
  PromoCode,
  Provider,
  Review,
  Service,
  SupportTicket,
  TicketMessage,
  WalletTransaction,
} from '@/types/models';
import { ApiError, mock, notFound, requireUser } from '../http';
import { adminIds, notify, providerUserId } from './notify';

/* ───────────── Addresses ───────────── */

export type AddressInput = Omit<Address, 'id' | 'userId'>;

export const addressesApi = {
  list: () =>
    mock<Address[]>(() => {
      const me = requireUser();
      return db.addresses.filter((a) => a.userId === me.id).sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    }),

  save: (input: AddressInput, id?: string) =>
    mock<Address>(() => {
      const me = requireUser();
      let target: Address;
      if (id) {
        target = db.addresses.find((x) => x.id === id && x.userId === me.id) ?? notFound('Address');
        Object.assign(target, input);
      } else {
        target = { ...input, id: uid('addr'), userId: me.id };
        db.addresses.push(target);
      }
      const mine = db.addresses.filter((a) => a.userId === me.id);
      if (target.isDefault) mine.forEach((a) => (a.isDefault = a.id === target.id));
      if (!mine.some((a) => a.isDefault)) target.isDefault = true;
      return target;
    }),

  remove: (id: string) =>
    mock(() => {
      const me = requireUser();
      const idx = db.addresses.findIndex((a) => a.id === id && a.userId === me.id);
      if (idx < 0) notFound('Address');
      const [removed] = db.addresses.splice(idx, 1);
      if (removed.isDefault) {
        const next = db.addresses.find((a) => a.userId === me.id);
        if (next) next.isDefault = true;
      }
      return { ok: true };
    }),

  setDefault: (id: string) =>
    mock(() => {
      const me = requireUser();
      db.addresses.filter((a) => a.userId === me.id).forEach((a) => (a.isDefault = a.id === id));
      return { ok: true };
    }),
};

/* ───────────── Notifications ───────────── */

export const notificationsApi = {
  list: () =>
    mock<AppNotification[]>(() => {
      const me = requireUser();
      return db.notifications.filter((n) => n.userId === me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, 300),
  markRead: (id: string) =>
    mock(() => {
      const n = db.notifications.find((x) => x.id === id);
      if (n) n.read = true;
      return { ok: true };
    }, 100),
  markAllRead: () =>
    mock(() => {
      const me = requireUser();
      db.notifications.filter((n) => n.userId === me.id).forEach((n) => (n.read = true));
      return { ok: true };
    }, 200),
  clear: () =>
    mock(() => {
      const me = requireUser();
      db.notifications = db.notifications.filter((n) => n.userId !== me.id);
      return { ok: true };
    }, 200),
};

/* ───────────── Wallet ───────────── */

export const walletApi = {
  get: () =>
    mock<{ balance: number; transactions: WalletTransaction[] }>(() => {
      const me = requireUser();
      const transactions = db.walletTxns.filter((t) => t.userId === me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const balance = transactions.reduce((s, t) => s + (t.type === 'credit' ? t.amount : -t.amount), 0);
      return { balance, transactions };
    }),
  addMoney: (amount: number, method: string) =>
    mock(() => {
      const me = requireUser();
      if (amount < 10 || amount > 50000) throw new ApiError('Enter an amount between ₹10 and ₹50,000.');
      db.walletTxns.unshift({ id: uid('wt'), userId: me.id, type: 'credit', amount, title: `Added via ${method}`, createdAt: new Date().toISOString() });
      return { ok: true };
    }, 1000),
};

/* ───────────── Favorites ───────────── */

export const favoritesApi = {
  ids: () => mock<string[]>(() => db.favorites[requireUser().id] ?? [], 150),
  list: () =>
    mock<{ services: Service[]; providers: Provider[] }>(() => {
      const ids = db.favorites[requireUser().id] ?? [];
      return {
        services: db.services.filter((s) => ids.includes(s.id)),
        providers: db.providers.filter((p) => ids.includes(p.id)),
      };
    }),
  toggle: (id: string) =>
    mock<string[]>(() => {
      const me = requireUser();
      const list = db.favorites[me.id] ?? [];
      db.favorites[me.id] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return db.favorites[me.id];
    }, 150),
};

/* ───────────── Reviews ───────────── */

export const reviewsApi = {
  create: (input: { bookingId: string; rating: number; comment: string }) =>
    mock<Review>(() => {
      const me = requireUser();
      const b = db.bookings.find((x) => x.id === input.bookingId) ?? notFound('Booking');
      if (b.status !== 'completed') throw new ApiError('You can review only completed bookings.');
      if (b.reviewId) throw new ApiError('You have already reviewed this booking.');
      if (input.rating < 1 || input.rating > 5) throw new ApiError('Choose a rating between 1 and 5.');
      const review: Review = {
        id: uid('rv'),
        bookingId: b.id,
        serviceId: b.items[0].serviceId,
        providerId: b.providerId,
        customerId: me.id,
        customerName: me.name,
        customerAvatar: me.avatar,
        rating: input.rating,
        comment: input.comment.trim(),
        createdAt: new Date().toISOString(),
      };
      db.reviews.unshift(review);
      b.reviewId = review.id;
      const provider = db.providers.find((p) => p.id === b.providerId)!;
      provider.rating = Math.round(((provider.rating * provider.reviewCount + input.rating) / (provider.reviewCount + 1)) * 10) / 10;
      provider.reviewCount += 1;
      const puid = providerUserId(provider.id);
      if (puid) notify(puid, { type: 'review', title: `New ${input.rating}★ review`, body: `${me.name}: “${review.comment.slice(0, 80)}”`, href: '/provider/reviews' });
      return review;
    }),
  get: (id: string) => mock<Review>(() => db.reviews.find((r) => r.id === id) ?? notFound('Review')),
  forProvider: (providerId: string) =>
    mock<Review[]>(() => db.reviews.filter((r) => r.providerId === providerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  reply: (id: string, text: string) =>
    mock<Review>(() => {
      const r = db.reviews.find((x) => x.id === id) ?? notFound('Review');
      r.reply = { text: text.trim(), at: new Date().toISOString() };
      return r;
    }),
  all: () => mock<Review[]>(() => [...db.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  remove: (id: string) =>
    mock(() => {
      db.reviews = db.reviews.filter((r) => r.id !== id);
      return { ok: true };
    }),
};

/* ───────────── Promotions ───────────── */

export const offersApi = {
  /** Public, currently valid offers (optionally for one provider). */
  list: (providerId?: string) =>
    mock<PromoCode[]>(() =>
      db.promoCodes.filter(
        (p) => p.active && new Date(p.expiresAt).getTime() > Date.now() && (!providerId || !p.providerId || p.providerId === providerId),
      ),
    ),
};

/* ───────────── Support ───────────── */

export const supportApi = {
  faqs: (audience: Faq['audience']) => mock<Faq[]>(() => db.faqs.filter((f) => f.audience === audience || f.audience === 'all'), 200),
  myTickets: () =>
    mock<SupportTicket[]>(() => {
      const me = requireUser();
      return db.tickets.filter((t) => t.userId === me.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }),
  allTickets: () => mock<SupportTicket[]>(() => [...db.tickets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))),
  get: (id: string) => mock<SupportTicket>(() => db.tickets.find((t) => t.id === id) ?? notFound('Ticket')),
  create: (input: { subject: string; category: SupportTicket['category']; message: string; bookingId?: string }) =>
    mock<SupportTicket>(() => {
      const me = requireUser();
      const now = new Date().toISOString();
      const ticket: SupportTicket = {
        id: uid('tk'),
        userId: me.id,
        userName: me.name,
        userRole: me.role,
        subject: input.subject.trim(),
        category: input.category,
        priority: input.category === 'payment' ? 'high' : 'medium',
        status: 'open',
        bookingId: input.bookingId || undefined,
        messages: [{ id: uid('m'), from: 'user', text: input.message.trim(), at: now }],
        createdAt: now,
        updatedAt: now,
      };
      db.tickets.unshift(ticket);
      adminIds().forEach((a) => notify(a, { type: 'system', title: 'New support ticket', body: `${me.name}: ${ticket.subject}`, href: `/admin/ticket/${ticket.id}` }));
      return ticket;
    }),
  reply: (id: string, text: string) =>
    mock<SupportTicket>(() => {
      const me = requireUser();
      const t = db.tickets.find((x) => x.id === id) ?? notFound('Ticket');
      const fromSupport = me.role === 'admin';
      const msg: TicketMessage = { id: uid('m'), from: fromSupport ? 'support' : 'user', text: text.trim(), at: new Date().toISOString() };
      t.messages.push(msg);
      t.updatedAt = msg.at;
      if (fromSupport) {
        if (t.status === 'open') t.status = 'in_progress';
        notify(t.userId, { type: 'system', title: 'Support replied', body: text.slice(0, 90), href: `/${t.userRole}/ticket/${t.id}` });
      } else if (t.status === 'resolved' || t.status === 'closed') {
        t.status = 'open';
      }
      return t;
    }, 350),
  setStatus: (id: string, status: SupportTicket['status']) =>
    mock<SupportTicket>(() => {
      const t = db.tickets.find((x) => x.id === id) ?? notFound('Ticket');
      t.status = status;
      t.updatedAt = new Date().toISOString();
      return t;
    }),
};

/* ───────────── Chat ───────────── */

export const chatApi = {
  threads: () =>
    mock<ChatThread[]>(() => {
      const me = requireUser();
      const list =
        me.role === 'provider'
          ? db.chatThreads
              .filter((t) => t.providerId === me.profileId)
              .map((t) => {
                const c = db.users.find((u) => u.id === t.customerId);
                return { ...t, title: c?.name ?? 'Customer', avatar: c?.avatar ?? '' };
              })
          : db.chatThreads.filter((t) => t.customerId === me.id);
      return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }),
  messages: (threadId: string) =>
    mock<{ thread: ChatThread; messages: ChatMessage[] }>(() => {
      const thread = db.chatThreads.find((t) => t.id === threadId) ?? notFound('Conversation');
      thread.unread = 0;
      return { thread, messages: db.chatMessages.filter((m) => m.threadId === threadId) };
    }, 250),
  /** Find or create the thread for a booking / provider. */
  open: (providerId: string, bookingId?: string) =>
    mock<ChatThread>(() => {
      const me = requireUser();
      const existing = db.chatThreads.find((t) => t.customerId === me.id && t.providerId === providerId && (!bookingId || t.bookingId === bookingId));
      if (existing) return existing;
      const provider = db.providers.find((p) => p.id === providerId) ?? notFound('Provider');
      const thread: ChatThread = {
        id: uid('ch'),
        bookingId,
        customerId: me.id,
        providerId,
        title: provider.businessName,
        avatar: provider.avatar,
        lastMessage: '',
        updatedAt: new Date().toISOString(),
        unread: 0,
      };
      db.chatThreads.unshift(thread);
      return thread;
    }, 200),
  send: (threadId: string, text: string) =>
    mock<ChatMessage>(() => {
      const me = requireUser();
      const thread = db.chatThreads.find((t) => t.id === threadId) ?? notFound('Conversation');
      const senderId = me.role === 'provider' ? me.profileId! : me.id;
      const msg: ChatMessage = { id: uid('cm'), threadId, senderId, text: text.trim(), at: new Date().toISOString() };
      db.chatMessages.push(msg);
      thread.lastMessage = msg.text;
      thread.updatedAt = msg.at;
      // Simulated auto-reply so the conversation feels alive.
      if (me.role === 'customer') {
        setTimeout(() => {
          db.chatMessages.push({
            id: uid('cm'),
            threadId,
            senderId: thread.providerId,
            text: 'Thanks for your message! We will get back to you shortly.',
            at: new Date().toISOString(),
          });
          thread.lastMessage = 'Thanks for your message! We will get back to you shortly.';
        }, 1500);
      }
      return msg;
    }, 200),
};
