import { BookingCard } from '@/components/domain';
import { Card, PageHeader, SectionHeader, StatCard } from '@/components/ui';
import { MenuSection, ProfileHeaderCard, SignOutButton } from '@/features/account';
import { useFavoriteIds, useMyBookings, useWallet } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatMoney } from '@/utils/format';

export default function AccountHome() {
  usePageMeta({ title: 'My account', noindex: true });
  const wallet = useWallet();
  const done = useMyBookings('past');
  const upcoming = useMyBookings('upcoming');
  const favs = useFavoriteIds();
  const next = upcoming.data?.[0];

  return (
    <>
      <PageHeader title="Account" />
      <ProfileHeaderCard />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Wallet balance" value={wallet.data ? formatMoney(wallet.data.balance) : '—'} icon="wallet" to="/account/wallet" />
        <StatCard label="Services completed" value={done.data ? String(done.data.length) : '—'} icon="check-double" tone="success" to="/bookings?tab=past" />
        <StatCard label="Upcoming bookings" value={upcoming.data ? String(upcoming.data.length) : '—'} icon="calendar" tone="accent" to="/bookings" className="max-lg:hidden" />
        <StatCard label="Saved favourites" value={favs.data ? String(favs.data.length) : '—'} icon="heart" tone="danger" to="/account/favorites" className="max-lg:hidden" />
      </div>

      {next ? (
        <section className="mb-6 hidden lg:block">
          <SectionHeader title="Your next booking" action="All bookings" to="/bookings" />
          <BookingCard booking={next} to={`/bookings/${next.id}`} />
        </section>
      ) : null}

      <div className="lg:hidden">
        <MenuSection
          title="My account"
          items={[
            { icon: 'calendar', title: 'My bookings', subtitle: 'Upcoming, completed & cancelled', to: '/bookings' },
            { icon: 'pin', title: 'Saved addresses', subtitle: 'Home, work & more', to: '/account/addresses' },
            { icon: 'heart', title: 'Favourites', subtitle: 'Saved services & providers', to: '/account/favorites' },
            { icon: 'wallet', title: 'Wallet & payments', to: '/account/wallet' },
            { icon: 'tags', title: 'Offers & coupons', to: '/offers' },
            { icon: 'gift', title: 'Refer & earn', subtitle: 'Get ₹150 for every friend', to: '/account/refer' },
          ]}
        />
        <MenuSection
          title="Activity"
          items={[
            { icon: 'chats', title: 'Messages', to: '/account/messages' },
            { icon: 'bell', title: 'Notifications', to: '/account/notifications' },
          ]}
        />
        <MenuSection
          title="Support & settings"
          items={[
            { icon: 'help', title: 'Help & support', to: '/account/support' },
            { icon: 'settings', title: 'Settings', to: '/account/settings' },
          ]}
        />
        <SignOutButton />
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-3">
        <MenuSection
          title="Quick actions"
          className="col-span-1"
          items={[
            { icon: 'search', title: 'Book a service', to: '/explore' },
            { icon: 'tags', title: 'Offers & coupons', to: '/offers' },
            { icon: 'gift', title: 'Refer a friend', to: '/account/refer' },
          ]}
        />
        <Card className="col-span-2 flex flex-col justify-center bg-gradient-to-br from-primary-50 to-white">
          <p className="text-title font-semibold">Give ₹100, get ₹150</p>
          <p className="mt-1 text-body-sm text-ink-secondary">Friends get ₹100 off their first booking; you get ₹150 in your wallet after their service is completed.</p>
        </Card>
      </div>
    </>
  );
}
