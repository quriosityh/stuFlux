'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { Route } from 'next';
import { Bell, User, Plus, Menu, Search, Moon, Sun, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchBar, ActiveTab } from '../explore/SearchBar';
import { LahoreArea, getAreaById, LAHORE_AREAS_DATA } from '@stuflux/types';

// Animation configs for slow, obvious transitions
const transitionConfig = { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

export function NavHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isExplorePage = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [selectedArea, setSelectedArea] = useState<LahoreArea | null>(null);
  const [whatSearch, setWhatSearch] = useState('');
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [activeToast, setActiveToast] = useState<any | null>(null);

  // Real-time Notification listener
  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      const notif = customEvent.detail;
      if (!notif) return;

      setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
      setUnreadCount((prev) => prev + 1);
      setActiveToast(notif);

      const timer = setTimeout(() => {
        setActiveToast((current: any) => (current === notif ? null : current));
      }, 6000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('stuflux:notification', handleNotification);
    return () => window.removeEventListener('stuflux:notification', handleNotification);
  }, []);

  // Sync search bar state with URL params (source of truth for applied filters)
  useEffect(() => {
    if (activeTab === null) {
      const urlQ = searchParams.get('q') || '';
      const urlAreaId = searchParams.get('area') || '';
      const urlStartDate = searchParams.get('start_date') || '';
      const urlEndDate = searchParams.get('end_date') || '';

      setWhatSearch(urlQ);

      if (urlAreaId) {
        const area = getAreaById(urlAreaId, LAHORE_AREAS_DATA);
        setSelectedArea(area ? (area as LahoreArea) : null);
      } else {
        setSelectedArea(null);
      }

      if (urlStartDate && urlEndDate) {
        setSelectedDates({ start: new Date(urlStartDate), end: new Date(urlEndDate) });
      } else {
        setSelectedDates({ start: null, end: null });
      }
    }
  }, [activeTab, searchParams]);

  // Theme initialization + scroll handling
  useEffect(() => {
    // Check initial theme from HTML data attribute or OS preference
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                  document.documentElement.classList.contains('dark') ||
                  (document.documentElement.getAttribute('data-theme') !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const initialTheme = isDark ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.classList.toggle('dark', isDark);
    
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Only close the search dropdown if the user ACTUALLY scrolls (e.g., > 10px) while it's open
      if (activeTab !== null && Math.abs(window.scrollY - lastScrollY) > 10) {
        setActiveTab(null);
      }
      lastScrollY = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check for isScrolled (do not call handleScroll to prevent instant collapse)
    setIsScrolled(window.scrollY > 50);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  // Expand if we are at top of explore page OR if a search tab is actively open
  const isExpanded = (isExplorePage && !isScrolled) || activeTab !== null;

  const navItems = [
    { name: 'Explore', href: '/' as const },
    { name: 'Chats', href: '/messages' as const },
    { name: 'Activity', href: '/bookings' as const },
  ];

  // Check if PDP sticky nav wants to replace us
  const [hiddenByPDP, setHiddenByPDP] = useState(false);

  useEffect(() => {
    const checkPDP = () => {
      setHiddenByPDP(document.body.hasAttribute('data-pdp-nav'));
    };
    
    // Use MutationObserver to watch body attributes
    const observer = new MutationObserver(checkPDP);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-pdp-nav'] });
    checkPDP();
    
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      data-nav-spacer="true"
      className="!fixed top-0 left-0 right-0 z-50 bg-zinc-50 dark:bg-zinc-900 border-b border-border/10 shadow-sm transition-all duration-300"
      style={{ transform: hiddenByPDP ? 'translateY(-100%)' : 'translateY(0)' }}
    >
      {/* Background Dimmer when search is forced open while scrolled */}
      <AnimatePresence>
        {activeTab !== null && isScrolled && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10 h-screen"
            onClick={() => setActiveTab(null)}
          />
        )}
      </AnimatePresence>

      <div className="w-[95%] mx-auto py-3 relative z-10">
        {/* ROW 1: Logo, Nav/Pill, Actions */}
        <div className="flex items-center justify-between min-h-[48px]">
          {/* LEFT: Logo */}
          <Link href="/" className="font-syne font-bold text-3xl tracking-tighter flex items-center hover:opacity-80 transition-opacity z-20 w-48 shrink-0">
            <span className="text-zinc-800 dark:text-gray-300 drop-shadow-sm">Stu</span>
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent drop-shadow-sm">Flux</span>
          </Link>

          {/* CENTER: Crossfading Links vs Pill */}
          <div className="flex-1 flex justify-center items-center relative h-12 z-20">
            <AnimatePresence initial={false}>
              {isExpanded ? (
                /* Expanded Links */
                <motion.div
                  key="desktop-links"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={transitionConfig}
                  className="absolute inset-0 flex items-center justify-center gap-8 font-manrope font-semibold text-sm"
                >
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href as any}
                        className={cn(
                          "relative px-1 py-2 transition-colors glitch-text",
                          isActive ? "text-[var(--accent)]" : "text-foreground/70 hover:text-foreground"
                        )}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div 
                            layoutId="nav-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full"
                          />
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              ) : (
                /* Collapsed Search Pill */
                <motion.div
                  key="collapsed-pill"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={transitionConfig}
                  className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="flex items-center chrome-card rounded-full shadow-md hover:shadow-lg cursor-pointer border border-border/20 overflow-hidden divide-x divide-border/10">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isExplorePage) setActiveTab('where');
                        else window.location.href = '/';
                      }}
                      className="px-4 py-2.5 text-sm font-semibold truncate max-w-[120px] hover:bg-surface transition-colors"
                    >
                      {selectedArea ? selectedArea.name : 'Anywhere'}
                    </span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isExplorePage) setActiveTab('when');
                        else window.location.href = '/';
                      }}
                      className="px-4 py-2.5 text-sm font-semibold truncate max-w-[120px] hover:bg-surface transition-colors"
                    >
                      {selectedDates.start && selectedDates.end ? `${selectedDates.start.toLocaleDateString()} - ${selectedDates.end.toLocaleDateString()}` : 'Anytime'}
                    </span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isExplorePage) setActiveTab('what');
                        else window.location.href = '/';
                      }}
                      className="px-4 py-2.5 text-sm text-foreground/60 truncate max-w-[120px] hover:bg-surface transition-colors"
                    >
                      {whatSearch || 'Search gear...'}
                    </span>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isExplorePage) setActiveTab('what');
                        else window.location.href = '/';
                      }}
                      className="pr-2 pl-3 py-2 hover:bg-surface transition-colors"
                    >
                      <div className="bg-[var(--accent)] text-black p-1.5 rounded-full">
                        <Search size={14} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center justify-end gap-3 w-48 z-20 shrink-0">
            {/* Action Crossfade container */}
            <div className="relative flex items-center justify-end w-32 h-10 mr-2">
              <AnimatePresence initial={false}>
                {isExpanded ? (
                  <motion.div 
                    key="actions-expanded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transitionConfig}
                    className="absolute right-0 flex items-center gap-2"
                  >
                    <button 
                      onClick={toggleTheme}
                      className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors relative"
                    >
                      {theme === 'dark' ? (
                        <Sun size={20} className="text-foreground/80" />
                      ) : (
                        <Moon size={20} className="text-foreground/80" />
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setShowNotifMenu(!showNotifMenu);
                        setUnreadCount(0);
                      }}
                      className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors relative"
                    >
                      <Bell size={20} className="text-foreground/80" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-[var(--accent)] text-black font-extrabold text-[10px] rounded-full flex items-center justify-center border border-background">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="actions-collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transitionConfig}
                    className="absolute right-0 flex items-center gap-2"
                  >
                    <button 
                      onClick={toggleTheme}
                      className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 border border-transparent transition-colors"
                    >
                      {theme === 'dark' ? (
                        <Sun size={20} className="text-foreground/80" />
                      ) : (
                        <Moon size={20} className="text-foreground/80" />
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setShowNotifMenu(!showNotifMenu);
                        setUnreadCount(0);
                      }}
                      className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 border border-border/10 transition-colors relative"
                    >
                      <Bell size={20} className="text-foreground/80" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent)] rounded-full border border-background"></span>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notification Menu Dropdown */}
              <AnimatePresence>
                {showNotifMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-12 right-0 w-80 sm:w-96 rounded-2xl bg-background border border-border/40 shadow-2xl p-4 z-50 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border/10 pb-2">
                      <h4 className="font-syne font-bold text-sm text-foreground">Notifications</h4>
                      <span className="text-xs text-foreground/50">{notifications.length} recent</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-foreground/50">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((n, idx) => (
                          <Link
                            key={idx}
                            href={
                              (n.type === 'new_message'
                                ? `/messages/${n.conversationId}`
                                : n.type === 'booking_request' || n.type === 'booking_confirmed' || n.type === 'booking_rejected'
                                ? '/bookings'
                                : '/') as Route
                            }
                            onClick={() => setShowNotifMenu(false)}
                            className="block p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors text-xs space-y-1"
                          >
                            <div className="font-semibold text-foreground flex items-center justify-between">
                              <span>
                                {n.type === 'booking_request' && '📋 Rental Request'}
                                {n.type === 'booking_confirmed' && '✅ Booking Confirmed'}
                                {n.type === 'booking_rejected' && '❌ Request Declined'}
                                {n.type === 'new_message' && '💬 New Message'}
                              </span>
                            </div>
                            <p className="text-foreground/70 leading-normal">
                              {n.type === 'booking_request' && `${n.renterName} requested to rent ${n.listingTitle}`}
                              {n.type === 'booking_confirmed' && `Your booking for ${n.listingTitle} was confirmed by ${n.lenderName}`}
                              {n.type === 'booking_rejected' && `Your request for ${n.listingTitle} was declined`}
                              {n.type === 'new_message' && `${n.senderName}: "${n.preview}"`}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Toast Popover */}
            <AnimatePresence>
              {activeToast && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="fixed top-16 right-4 z-[100] max-w-sm w-full p-4 rounded-2xl bg-zinc-950 text-white border border-white/10 shadow-2xl space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold font-syne text-[var(--accent)]">
                    <span>
                      {activeToast.type === 'booking_request' && '⚡ New Rental Request!'}
                      {activeToast.type === 'booking_confirmed' && '🎉 Booking Confirmed!'}
                      {activeToast.type === 'booking_rejected' && 'Booking Request Update'}
                      {activeToast.type === 'new_message' && '💬 Message Received'}
                    </span>
                    <button onClick={() => setActiveToast(null)} className="text-white/50 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-white/80">
                    {activeToast.type === 'booking_request' && `${activeToast.renterName} wants to rent ${activeToast.listingTitle}`}
                    {activeToast.type === 'booking_confirmed' && `Your booking for ${activeToast.listingTitle} is confirmed!`}
                    {activeToast.type === 'booking_rejected' && `Your request for ${activeToast.listingTitle} was declined.`}
                    {activeToast.type === 'new_message' && `${activeToast.senderName}: ${activeToast.preview}`}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <Link
                      href={(activeToast.type === 'new_message' ? `/messages/${activeToast.conversationId}` : '/bookings') as Route}
                      onClick={() => setActiveToast(null)}
                      className="text-[11px] font-bold underline text-[var(--accent)]"
                    >
                      View in {activeToast.type === 'new_message' ? 'Messages' : 'Bookings'} →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Link href={{ pathname: '/listings/new' }} className={cn(
              "hyper-liquid inline-flex items-center justify-center font-semibold transition-all overflow-hidden whitespace-nowrap gap-2 text-sm px-4 py-2 rounded-full relative z-10"
            )}>
              <Plus size={18} strokeWidth={2.5} />
            </Link>

            <Link
              href={{ pathname: '/profile' }}
              id="nav-profile-link"
              className="relative group z-10 w-10 h-10 rounded-full border border-border/20 overflow-hidden hover:ring-2 hover:ring-[var(--accent)] transition-all cursor-pointer bg-gradient-to-br from-background to-surface flex items-center justify-center"
            >
              <User size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </Link>

          </div>
        </div>

        {/* ROW 2: Expanded Search Bar */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="search-bar"
              initial={{ height: 0, opacity: 0, y: -20, scale: 0.95 }}
              animate={{ height: 100, opacity: 1, y: 0, scale: 1 }}
              exit={{ height: 0, opacity: 0, y: -30, scale: 0.85 }}
              transition={transitionConfig}
              className="w-full flex justify-center mt-2 relative z-10 overflow-visible"
            >
              <div className="absolute top-2 w-full flex justify-center origin-top">
                <SearchBar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  selectedArea={selectedArea}
                  setSelectedArea={setSelectedArea}
                  whatSearch={whatSearch}
                  setWhatSearch={setWhatSearch}
                  selectedDates={selectedDates}
                  setSelectedDates={setSelectedDates}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
