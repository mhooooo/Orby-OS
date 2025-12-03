'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatProvider } from '@/context/ChatContext';
import { ToastProvider } from '@/context/ToastContext';
import { ItineraryProvider } from '@/context/ItineraryContext';

// UI Primitives
import { Skeleton, SkeletonGroup, CourseCardSkeleton, CourseDetailSkeleton } from '@/components/ui/Skeleton';
import { Spinner, LoadingOverlay, InlineLoading } from '@/components/ui/Spinner';
import { Toast, ToastContainer, ToastData } from '@/components/ui/Toast';
import { ErrorState, InlineError, OfflineState } from '@/components/ui/ErrorState';
import { EmptyState, NoCoursesFound, NoSavedCourses, NoMessages } from '@/components/ui/EmptyState';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

// Tool Widgets
import { CourseCard } from '@/components/generative-ui/CourseCard';
import { CourseCarousel } from '@/components/generative-ui/CourseCarousel';
import { FleetCard } from '@/components/generative-ui/FleetCard';
import { AboutCard } from '@/components/generative-ui/AboutCard';
import { ServiceBento } from '@/components/generative-ui/ServiceBento';
import InquiryForm from '@/components/generative-ui/InquiryForm';
import AuthGateModal from '@/components/generative-ui/AuthGateModal';

// NEW STANDALONE CARDS (Tier 3)
import { TacticalMap } from '@/components/TacticalMap';
import { DatesCard } from '@/components/generative-ui/DatesCard';
import { GroupCard } from '@/components/generative-ui/GroupCard';
import { LogisticsCard } from '@/components/LogisticsCard';
import { ComparisonTable } from '@/components/ComparisonTable';
import { QuoteCard } from '@/components/QuoteCard';
import { InteractiveTimelinePreview } from '@/components/InteractiveTimeline.preview';

// NEW SERVICE CARDS (Tier 4)
import { ClubRentalCard } from '@/components/ClubRentalCard';
import { AirportFastTrackCard } from '@/components/generative-ui/AirportFastTrackCard';
import { GolfInsuranceCard } from '@/components/generative-ui/GolfInsuranceCard';
import { DiningCard } from '@/components/generative-ui/DiningCard';
import { AccommodationCard } from '@/components/generative-ui/AccommodationCard';

// Proactive UI Components
import { DateIntentModal, DateIntentToast } from '@/components/DateIntentModal';
import { AvailabilityBadge, AvailabilityDot, AvailabilityBadgeWithInfo } from '@/components/AvailabilityBadge';
import {
  ProactiveUIProvider,
  ProactiveUIDemo,
  useProactiveUI,
  ProactiveDateIntentModal,
  GroupSizeNudge,
  TripBuilderPrompt,
  GroupSizeNudgeStandalone,
  TripBuilderPromptStandalone,
} from '@/components/proactive';

// Sticky Components
import { TripContextBar } from '@/components/generative-ui/TripContextBar';
import { StickySidebar } from '@/components/layout/StickySidebar';
import { InteractiveTimeline, Day } from '@/components/InteractiveTimeline';

// Types
import { Course } from '@/types/course';
import { ItineraryDraft } from '@/types/itinerary';
import { cn } from '@/lib/utils';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_COURSES: Course[] = [
  {
    id: 'alpine-golf',
    name: 'Alpine Golf Resort',
    region: 'bangkok',
    location: 'Pathum Thani',
    par: 72,
    yardage: 7100,
    holes: 18,
    tags: ['championship', 'night_golf'],
    heroImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
    description: 'A stunning championship course with immaculate fairways and challenging water hazards. Known for its excellent night golf facilities.',
    greenFee: {
      weekday: { guest: 2800, member: 1800 },
      weekend: { guest: 3500, member: 2200 },
    },
  },
  {
    id: 'blue-canyon',
    name: 'Blue Canyon Country Club',
    region: 'phuket',
    location: 'Thalang, Phuket',
    par: 72,
    yardage: 6900,
    holes: 18,
    tags: ['championship', 'scenic'],
    heroImage: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
    description: 'World-famous course carved through a former tin mine. Host of multiple Johnnie Walker Classic tournaments.',
    greenFee: {
      weekday: { guest: 5500, member: 3500 },
      weekend: { guest: 6500, member: 4200 },
    },
  },
  {
    id: 'banyan-golf',
    name: 'Banyan Golf Club',
    region: 'hua_hin',
    location: 'Hua Hin',
    par: 72,
    yardage: 7200,
    holes: 18,
    tags: ['scenic', 'award_winning'],
    heroImage: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80',
    description: 'Award-winning course with breathtaking mountain views. Consistently ranked among Asia top courses.',
    greenFee: {
      weekday: { guest: 4200, member: 2800 },
      weekend: { guest: 4800, member: 3200 },
    },
  },
];

const MOCK_FLEET_DATA = {
  vehicles: [
    {
      id: 'sedan-1',
      type: 'Sedan',
      model: 'Toyota Camry',
      capacity: 3,
      luggage: 3,
      amenities: ['WiFi', 'Water', 'Charging Ports'],
      pricePerDay: 2500,
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80',
    },
    {
      id: 'vip-van-1',
      type: 'VIP Van',
      model: 'Toyota Alphard',
      capacity: 6,
      luggage: 8,
      amenities: ['WiFi', 'Water', 'Massage Seats', 'TV', 'Mini Bar'],
      pricePerDay: 4500,
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
    },
  ],
  notes: 'All vehicles come with professional English-speaking drivers.',
};

const MOCK_ABOUT_DATA = {
  company: 'Golf Okay',
  tagline: 'Your Thailand Golf Concierge',
  founded: 2018,
  yearsExperience: 6,
  founders: [
    { name: 'Tanyawit', role: 'CEO', expertise: 'Golf Tourism' },
    { name: 'Sarah', role: 'Operations Lead', expertise: 'Hospitality' },
  ],
  certifications: ['TAT Licensed', 'IAGTO Member', 'Golf Digest Partner'],
  stats: {
    coursesPartner: 50,
    happyGolfers: 5000,
    averageRating: 4.9,
  },
  description: 'We specialize in crafting unforgettable golf experiences across Thailand. From championship courses to hidden gems, our team handles every detail of your trip.',
};

const MOCK_TEAM = [
  {
    id: 'tanyawit',
    name: 'Tanyawit',
    role: 'CEO',
    expertise: 'Golf Tourism',
    avatar: 'https://placehold.co/100x100/1E1F20/ffffff?text=TW',
    portrait: 'https://placehold.co/400x500/1E1F20/ffffff?text=Tanyawit',
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Operations Lead',
    expertise: 'Hospitality',
    avatar: 'https://placehold.co/100x100/1E1F20/ffffff?text=SC',
    portrait: 'https://placehold.co/400x500/1E1F20/ffffff?text=Sarah',
  },
  {
    id: 'james',
    name: 'James',
    role: 'Course Relations',
    expertise: 'Partnerships',
    avatar: 'https://placehold.co/100x100/1E1F20/ffffff?text=JW',
    portrait: 'https://placehold.co/400x500/1E1F20/ffffff?text=James',
  },
  {
    id: 'mei',
    name: 'Mei',
    role: 'Customer Experience',
    expertise: 'Support',
    avatar: 'https://placehold.co/100x100/1E1F20/ffffff?text=ML',
    portrait: 'https://placehold.co/400x500/1E1F20/ffffff?text=Mei',
  },
];

const MOCK_ITINERARY_DRAFT: ItineraryDraft = {
  id: 'draft-1',
  region: ['phuket'],
  startDate: '2025-03-15',
  endDate: '2025-03-18',
  numberOfDays: 4,
  groupSize: 8,
  nonGolferCount: 0,
  vibe: 'championship',
  days: [],
  transfers: {
    enabled: true,
    vehicleType: 'vip-van',
    includesAirportPickup: true,
  },
  includeCaddieTips: true,
  totalEstimate: 156000,
  status: 'draft',
};

const MOCK_QUOTE_ITEMS = [
  { id: '1', description: 'Green Fees - Alpine Golf (4 rounds)', quantity: 4, unitPrice: 2800, subtotal: 11200 },
  { id: '2', description: 'VIP Van Transfer (3 days)', quantity: 3, unitPrice: 4500, subtotal: 13500 },
  { id: '3', description: 'Airport Pickup & Drop-off', quantity: 2, unitPrice: 1500, subtotal: 3000 },
  { id: '4', description: 'Caddie Tips (prepaid)', quantity: 4, unitPrice: 400, subtotal: 1600 },
];

// Mock data for sticky components
const MOCK_STICKY_TIMELINE_DAYS: Day[] = [
  {
    id: 'day-1',
    date: '2025-03-15',
    activities: [
      { id: 'act-1', title: 'Airport Pickup', type: 'arrival', time: '10:00', duration: '1.5h', status: 'confirmed' },
      { id: 'act-2', title: 'Alpine Golf Resort', type: 'golf', time: '13:00', duration: '5h', price: 2800, status: 'confirmed' },
      { id: 'act-3', title: 'Dinner at Thai Pavilion', type: 'dining', time: '19:00', duration: '2h', price: 800 },
    ],
  },
  {
    id: 'day-2',
    date: '2025-03-16',
    activities: [
      { id: 'act-4', title: 'Blue Canyon CC', type: 'golf', time: '08:00', duration: '5h', price: 5500, status: 'confirmed' },
      { id: 'act-5', title: 'Transfer to Phuket Town', type: 'transport', time: '14:00', duration: '1h', travelTimeToNext: 60 },
      { id: 'act-6', title: 'Night Market', type: 'other', time: '18:00', duration: '3h' },
    ],
  },
  {
    id: 'day-3',
    date: '2025-03-17',
    activities: [
      { id: 'act-7', title: 'Red Mountain Golf', type: 'golf', time: '07:00', duration: '5h', price: 4800, status: 'pending' },
      { id: 'act-8', title: 'Spa & Relaxation', type: 'other', time: '14:00', duration: '3h', price: 2000 },
    ],
  },
  {
    id: 'day-4',
    date: '2025-03-18',
    activities: [
      { id: 'act-9', title: 'Checkout & Departure', type: 'departure', time: '11:00', duration: '2h' },
    ],
  },
];

const MOCK_TRIP_CONTEXT = {
  dates: { start: new Date('2025-03-15'), end: new Date('2025-03-18') },
  duration: 4,
  golfers: 6,
  nonGolfers: 2,
  regions: ['phuket'],
  coursesCount: 3,
};

const MOCK_STICKY_QUOTE = {
  lineItems: MOCK_QUOTE_ITEMS,
  total: 26370,
  discount: { label: 'Group Discount (8+ golfers)', amount: 2930 },
  notes: 'Price includes green fees, transfers, and caddie tips.',
};

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================

const SECTIONS = [
  { id: 'primitives', label: 'UI Primitives', shortLabel: '1' },
  { id: 'chat-widgets', label: 'Chat Widgets', shortLabel: '2' },
  { id: 'standalone', label: 'Standalone', shortLabel: '3' },
  { id: 'services', label: 'Services', shortLabel: '4' },
  { id: 'proactive', label: 'Proactive UI', shortLabel: '5' },
  { id: 'sticky', label: 'Sticky Components', shortLabel: '6' },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  return (
    <div id={id} className="mb-8 pb-4 border-b border-white/10 scroll-mt-20">
      <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ComponentLabel({ label }: { label: string }) {
  return (
    <div className="text-xs font-mono text-gray-500 mb-2 px-2 py-1 bg-white/5 rounded inline-block">
      {label}
    </div>
  );
}

function WidgetWrapper({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="mb-8">
      {label && <ComponentLabel label={label} />}
      <div className="mt-2">{children}</div>
    </div>
  );
}

// Navigation sidebar
function SectionNav({ activeSection }: { activeSection: string }) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      <div className="flex flex-col gap-2 p-2 bg-surface-glass backdrop-blur-xl border border-white/10 rounded-2xl">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all',
              activeSection === section.id
                ? 'bg-accent-coral text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary'
            )}
            title={section.label}
          >
            {section.shortLabel}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

function AuditPageContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeSection, setActiveSection] = useState('primitives');
  const [showDateIntent, setShowDateIntent] = useState(false);
  const [showDateIntentToast, setShowDateIntentToast] = useState(false);
  const [showGroupSizeNudge, setShowGroupSizeNudge] = useState(false);
  const [showTripBuilderPrompt, setShowTripBuilderPrompt] = useState(false);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTIONS.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToast = (type: ToastData['type'], message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#131314] text-white">
      {/* Page Header */}
      <header className="sticky top-0 z-50 bg-[#131314]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Component Audit</h1>
            <p className="text-xs text-gray-500">Kitchen Sink Preview</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowOverlay(true)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              Test Overlay
            </button>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <SectionNav activeSection={activeSection} />

      <main className="max-w-5xl mx-auto px-6 py-12 lg:pl-20">
        {/* ================================================================ */}
        {/* SECTION 1: UI PRIMITIVES */}
        {/* ================================================================ */}
        <section className="mb-20">
          <SectionHeader
            id="primitives"
            title="1. UI Primitives"
            subtitle="Core building blocks from src/components/ui"
          />

          <SubSection title="Skeleton">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <ComponentLabel label="variant='text'" />
                <Skeleton variant="text" className="w-full" />
                <Skeleton variant="text" className="w-3/4 mt-2" />
                <Skeleton variant="text" className="w-1/2 mt-2" />
              </div>
              <div>
                <ComponentLabel label="variant='card'" />
                <Skeleton variant="card" />
              </div>
              <div>
                <ComponentLabel label="variant='image'" />
                <Skeleton variant="image" />
              </div>
              <div>
                <ComponentLabel label="variant='circle'" />
                <Skeleton variant="circle" width="64px" height="64px" />
              </div>
            </div>
          </SubSection>

          <SubSection title="Spinner">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <ComponentLabel label="size='sm'" />
                <div className="mt-2"><Spinner size="sm" /></div>
              </div>
              <div className="text-center">
                <ComponentLabel label="size='md'" />
                <div className="mt-2"><Spinner size="md" /></div>
              </div>
              <div className="text-center">
                <ComponentLabel label="size='lg'" />
                <div className="mt-2"><Spinner size="lg" /></div>
              </div>
            </div>
            <div className="mt-6">
              <ComponentLabel label="<InlineLoading />" />
              <InlineLoading message="Loading courses..." />
            </div>
          </SubSection>

          <SubSection title="Toast">
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => addToast('success', 'Course saved successfully!')}
                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors"
              >
                Success
              </button>
              <button
                onClick={() => addToast('error', 'Failed to load courses.')}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
              >
                Error
              </button>
              <button
                onClick={() => addToast('warning', 'Session expires in 5 min.')}
                className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm hover:bg-yellow-500/30 transition-colors"
              >
                Warning
              </button>
              <button
                onClick={() => addToast('info', 'New courses added.')}
                className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors"
              >
                Info
              </button>
            </div>
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
          </SubSection>

          <SubSection title="ErrorState">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ComponentLabel label="compact={true}" />
                <ErrorState
                  compact
                  title="Connection failed"
                  message="Unable to reach server"
                  onRetry={() => alert('Retry clicked')}
                />
              </div>
              <div>
                <ComponentLabel label="compact={false}" />
                <ErrorState
                  title="Something went wrong"
                  message="We couldn&apos;t load the courses."
                  onRetry={() => alert('Retry clicked')}
                  onGoHome={() => alert('Go home clicked')}
                />
              </div>
            </div>
          </SubSection>

          <SubSection title="EmptyState">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ComponentLabel label="<NoCoursesFound />" />
                <NoCoursesFound onReset={() => alert('Reset clicked')} />
              </div>
              <div>
                <ComponentLabel label="<NoSavedCourses />" />
                <NoSavedCourses onBrowse={() => alert('Browse clicked')} />
              </div>
            </div>
          </SubSection>
        </section>

        {/* ================================================================ */}
        {/* SECTION 2: CHAT TOOL WIDGETS */}
        {/* ================================================================ */}
        <section className="mb-20">
          <SectionHeader
            id="chat-widgets"
            title="2. Chat Tool Widgets"
            subtitle="Generative UI components rendered by AI tool calls"
          />

          <SubSection title="CourseCard">
            <div className="flex flex-wrap gap-6">
              <div>
                <ComponentLabel label="default" />
                <CourseCard course={MOCK_COURSES[0]} />
              </div>
              <div>
                <ComponentLabel label="compact={true}" />
                <CourseCard course={MOCK_COURSES[1]} compact />
              </div>
            </div>
          </SubSection>

          <SubSection title="CourseCarousel">
            <WidgetWrapper label="<CourseCarousel />">
              <CourseCarousel courses={MOCK_COURSES} />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="CourseCard States">
            <div className="space-y-8">
              <div>
                <ComponentLabel label="defaultExpanded={true}" />
                <CourseCard course={MOCK_COURSES[0]} defaultExpanded={true} />
              </div>
              <div>
                <ComponentLabel label="With Availability" />
                <CourseCard
                  course={MOCK_COURSES[1]}
                  defaultExpanded={true}
                  availability={{
                    status: 'available',
                    date: '2025-03-15',
                    slots: ['7:00 AM', '7:30 AM', '8:00 AM', '10:30 AM'],
                  }}
                />
              </div>
              <div>
                <ComponentLabel label="Trip Building Mode (with tripDays)" />
                <CourseCard
                  course={MOCK_COURSES[2]}
                  defaultExpanded={true}
                  tripDays={[
                    { id: 'day-1', number: 1, date: '2025-03-15' },
                    { id: 'day-2', number: 2, date: '2025-03-16' },
                    { id: 'day-3', number: 3, date: '2025-03-17' },
                  ]}
                  onAddToDay={(dayId) => console.log('Add to day:', dayId)}
                />
              </div>
              <div>
                <ComponentLabel label="Loading Skeleton" />
                <CourseDetailSkeleton />
              </div>
            </div>
          </SubSection>

          <SubSection title="FleetCard">
            <WidgetWrapper label="<FleetCard />">
              <FleetCard />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="AboutCard">
            <WidgetWrapper label="<AboutCard /> - Interactive Team Showcase">
              <AboutCard data={MOCK_ABOUT_DATA} team={MOCK_TEAM} />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="ServiceBento">
            <WidgetWrapper label="<ServiceBento />">
              <ServiceBento />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="InquiryForm">
            <WidgetWrapper label="<InquiryForm demoMode />">
              <div className="max-w-md">
                <InquiryForm demoMode />
              </div>
            </WidgetWrapper>
          </SubSection>

          <SubSection title="AuthGateModal">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
            >
              Open AuthGateModal
            </button>
          </SubSection>
        </section>

        {/* ================================================================ */}
        {/* SECTION 3: STANDALONE TOOLS */}
        {/* ================================================================ */}
        <section className="mb-20">
          <SectionHeader
            id="standalone"
            title="3. Standalone Cards"
            subtitle="Independent cards for AI tool calls"
          />

          <SubSection title="TacticalMap">
            <WidgetWrapper label="<TacticalMap /> - Interactive SVG Map">
              <TacticalMap
                selectedRegions={['bangkok']}
                onSelect={(regions) => console.log('Selected regions:', regions)}
                multiSelect
                onRegionHover={(region) => console.log('Hovered:', region)}
                onCourseClick={(courseId) => console.log('Course clicked:', courseId)}
              />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="DatesCard">
            <WidgetWrapper label="<DatesCard /> - Dates only">
              <DatesCard
                startDate={new Date('2025-03-15')}
                duration={4}
                onDateChange={(date) => console.log('Start date:', date)}
                onDurationChange={(days) => console.log('Duration:', days)}
                onAction={(prompt) => console.log('Action:', prompt)}
              />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="GroupCard">
            <WidgetWrapper label="<GroupCard /> - Group size only">
              <GroupCard
                golfers={4}
                nonGolfers={2}
                onGolfersChange={(count) => console.log('Golfers:', count)}
                onNonGolfersChange={(count) => console.log('Non-golfers:', count)}
                onAction={(prompt) => console.log('Action:', prompt)}
              />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="LogisticsCard">
            <WidgetWrapper label="<LogisticsCard />">
              <LogisticsCard
                airportTransfers={true}
                vehicleType="vip-van"
                onTransfersChange={(enabled) => console.log('Transfers:', enabled)}
                onVehicleChange={(type) => console.log('Vehicle:', type)}
              />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="ComparisonTable">
            <WidgetWrapper label="<ComparisonTable />">
              <ComparisonTable
                courses={MOCK_COURSES.slice(0, 3)}
                title="Compare Courses"
              />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="QuoteCard">
            <WidgetWrapper label="<QuoteCard />">
              <div className="max-w-xl">
                <QuoteCard
                  lineItems={MOCK_QUOTE_ITEMS}
                  total={29300}
                  discount={{ label: 'Group Discount (8+ golfers)', amount: 2930 }}
                  notes="Price includes green fees, transfers, and caddie tips."
                  onBook={() => alert('Book clicked!')}
                />
              </div>
            </WidgetWrapper>
          </SubSection>

          <SubSection title="InteractiveTimeline">
            <WidgetWrapper label="<InteractiveTimeline />">
              <InteractiveTimelinePreview />
            </WidgetWrapper>
          </SubSection>
        </section>

        {/* ================================================================ */}
        {/* SECTION 4: SERVICE CARDS */}
        {/* ================================================================ */}
        <section className="mb-20">
          <SectionHeader
            id="services"
            title="4. Service Cards"
            subtitle="Specialized booking components for add-on services"
          />

          <SubSection title="ClubRentalCard">
            <WidgetWrapper label="<ClubRentalCard />">
              <ClubRentalCard
                onComplete={(selection) => console.log('Club rental:', selection)}
              />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="AirportFastTrackCard">
            <WidgetWrapper label="<AirportFastTrackCard />">
              <AirportFastTrackCard />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="GolfInsuranceCard">
            <WidgetWrapper label="<GolfInsuranceCard />">
              <GolfInsuranceCard />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="DiningCard">
            <WidgetWrapper label="<DiningCard />">
              <DiningCard />
            </WidgetWrapper>
          </SubSection>

          <SubSection title="AccommodationCard">
            <WidgetWrapper label="<AccommodationCard />">
              <AccommodationCard />
            </WidgetWrapper>
          </SubSection>
        </section>

        {/* ================================================================ */}
        {/* SECTION 5: PROACTIVE UI */}
        {/* ================================================================ */}
        <section className="mb-20">
          <SectionHeader
            id="proactive"
            title="5. Proactive UI"
            subtitle="Intent capture and availability feedback components with orchestrator"
          />

          <SubSection title="ProactiveUIManager Demo">
            <p className="text-sm text-text-muted mb-4">
              Central orchestrator that manages which proactive components can show, enforcing
              rate limits, cooldowns, and priority queues. Click buttons to test each component.
            </p>
            <ProactiveUIProvider>
              <ProactiveUIDemo>
                {/* These render based on orchestrator state */}
                <ProactiveDateIntentModal
                  onSubmit={(data) => console.log('DateIntent submitted:', data)}
                />
                <GroupSizeNudge
                  onSelect={(size) => console.log('Group size selected:', size)}
                />
                <TripBuilderPrompt
                  onStartBuilder={() => console.log('Start builder clicked')}
                />
              </ProactiveUIDemo>
            </ProactiveUIProvider>
          </SubSection>

          <SubSection title="DateIntentModal (Standalone)">
            <p className="text-sm text-text-muted mb-4">
              Captures user&apos;s date/time intent while browsing. Triggered by AI based on browse activity.
              Allows backend to check availability in parallel.
            </p>
            <button
              onClick={() => setShowDateIntent(true)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
            >
              Open DateIntentModal
            </button>
          </SubSection>

          <SubSection title="GroupSizeNudge (Standalone)">
            <p className="text-sm text-text-muted mb-4">
              Quick capture of group size for pricing calculations. Less intrusive than DateIntentModal.
            </p>
            <button
              onClick={() => setShowGroupSizeNudge(true)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
            >
              Open GroupSizeNudge
            </button>
          </SubSection>

          <SubSection title="TripBuilderPrompt (Standalone)">
            <p className="text-sm text-text-muted mb-4">
              Floating pill that appears after viewing 3+ courses. Offers to start trip planning.
            </p>
            <button
              onClick={() => setShowTripBuilderPrompt(true)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
            >
              Open TripBuilderPrompt
            </button>
          </SubSection>

          <SubSection title="DateIntentToast">
            <p className="text-sm text-text-muted mb-4">
              Confirmation toast shown after user submits their date preference.
            </p>
            <button
              onClick={() => setShowDateIntentToast(true)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
            >
              Show Toast
            </button>
          </SubSection>

          <SubSection title="AvailabilityBadge">
            <p className="text-sm text-text-muted mb-4">
              Shows live availability status on course cards after DateIntentModal submission.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="text-center">
                <ComponentLabel label="checking" />
                <AvailabilityBadge status="checking" />
              </div>
              <div className="text-center">
                <ComponentLabel label="available" />
                <AvailabilityBadge status="available" date="Dec 15" />
              </div>
              <div className="text-center">
                <ComponentLabel label="limited" />
                <AvailabilityBadge status="limited" date="Dec 15" />
              </div>
              <div className="text-center">
                <ComponentLabel label="unavailable" />
                <AvailabilityBadge status="unavailable" date="Dec 15" />
              </div>
            </div>

            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">Size Variants</h4>
            <div className="flex items-center gap-4 mb-6">
              <div>
                <ComponentLabel label="size='sm'" />
                <AvailabilityBadge status="available" date="Dec 15" size="sm" />
              </div>
              <div>
                <ComponentLabel label="size='md'" />
                <AvailabilityBadge status="available" date="Dec 15" size="md" />
              </div>
            </div>

            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">AvailabilityDot (Compact)</h4>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <AvailabilityDot status="checking" />
                <span className="text-xs text-text-muted">Checking</span>
              </div>
              <div className="flex items-center gap-2">
                <AvailabilityDot status="available" />
                <span className="text-xs text-text-muted">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <AvailabilityDot status="limited" />
                <span className="text-xs text-text-muted">Limited</span>
              </div>
              <div className="flex items-center gap-2">
                <AvailabilityDot status="unavailable" />
                <span className="text-xs text-text-muted">Unavailable</span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">With Tooltip</h4>
            <div className="flex items-center gap-4">
              <AvailabilityBadgeWithInfo status="available" date="Dec 15" slots={8} />
              <AvailabilityBadgeWithInfo status="limited" date="Dec 15" slots={2} />
            </div>
          </SubSection>
        </section>

        {/* ================================================================ */}
        {/* SECTION 6: STICKY COMPONENTS */}
        {/* ================================================================ */}
        <section className="mb-20">
          <SectionHeader
            id="sticky"
            title="6. Sticky Components"
            subtitle="Persistent sidebar components for trip building context"
          />

          <SubSection title="TripContextBar">
            <p className="text-sm text-text-muted mb-4">
              Compact context bar showing current trip details at a glance.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ComponentLabel label="variant='horizontal'" />
                <TripContextBar {...MOCK_TRIP_CONTEXT} variant="horizontal" />
              </div>
              <div>
                <ComponentLabel label="variant='vertical'" />
                <TripContextBar {...MOCK_TRIP_CONTEXT} variant="vertical" />
              </div>
            </div>
          </SubSection>

          <SubSection title="InteractiveTimeline (Sticky Variant)">
            <p className="text-sm text-text-muted mb-4">
              Compact timeline for sidebar. Shows days with activity count and running totals.
            </p>
            <WidgetWrapper label="<InteractiveTimeline variant='sticky' />">
              <div className="max-w-sm rounded-xl bg-surface-glass border border-white/10 overflow-hidden">
                <InteractiveTimeline
                  days={MOCK_STICKY_TIMELINE_DAYS}
                  onReorder={() => {}}
                  variant="sticky"
                  editable={false}
                  onExpandDay={(dayId) => console.log('Expand day:', dayId)}
                />
              </div>
            </WidgetWrapper>
          </SubSection>

          <SubSection title="QuoteCard (Sticky Variant)">
            <p className="text-sm text-text-muted mb-4">
              Compact quote bar for sidebar bottom. Shows total with optional discount.
            </p>
            <WidgetWrapper label="<QuoteCard variant='sticky' />">
              <div className="max-w-sm">
                <QuoteCard
                  {...MOCK_STICKY_QUOTE}
                  variant="sticky"
                  onBook={() => console.log('Book clicked')}
                  onExpand={() => console.log('Expand quote')}
                />
              </div>
            </WidgetWrapper>
          </SubSection>

          <SubSection title="StickySidebar (Desktop)">
            <p className="text-sm text-text-muted mb-4">
              Full sidebar container combining all sticky components. Appears when building a trip.
              On mobile, becomes a collapsible bottom sheet.
            </p>
            <WidgetWrapper label="<StickySidebar />">
              <div className="relative h-[600px] rounded-xl border border-white/10 overflow-hidden bg-background-base flex">
                {/* Mock chat area */}
                <div className="flex-1 p-6 bg-surface-glass/50">
                  <div className="space-y-4">
                    <div className="h-12 w-3/4 rounded-lg bg-white/5" />
                    <div className="h-8 w-1/2 rounded-lg bg-white/5" />
                    <div className="h-32 rounded-xl bg-white/10 flex items-center justify-center text-text-muted text-sm">
                      Chat Area
                    </div>
                    <div className="h-8 w-2/3 rounded-lg bg-white/5" />
                  </div>
                </div>

                {/* Sticky Sidebar */}
                <StickySidebar
                  tripContext={MOCK_TRIP_CONTEXT}
                  timelineDays={MOCK_STICKY_TIMELINE_DAYS}
                  quote={MOCK_STICKY_QUOTE}
                  isVisible={true}
                  onClose={() => console.log('Close sidebar')}
                  onBookClick={() => console.log('Book clicked')}
                  onExpandDay={(dayId) => console.log('Expand day:', dayId)}
                  onExpandQuote={() => console.log('Expand quote')}
                />
              </div>
            </WidgetWrapper>
            <p className="text-xs text-text-muted mt-3">
              Note: On mobile (below lg breakpoint), this renders as a bottom sheet instead.
            </p>
          </SubSection>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/5">
          <p className="text-xs text-gray-500">
            Golf Okay Component Audit • {new Date().toLocaleDateString()}
          </p>
        </footer>
      </main>

      {/* Modals & Overlays */}
      <AuthGateModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerReason="save_course"
      />

      <DateIntentModal
        isOpen={showDateIntent}
        onClose={() => setShowDateIntent(false)}
        onSubmit={(data) => {
          console.log('DateIntent submitted:', data);
          setShowDateIntent(false);
          setShowDateIntentToast(true);
          // Auto-dismiss toast after 4 seconds
          setTimeout(() => setShowDateIntentToast(false), 4000);
        }}
      />

      {showDateIntentToast && (
        <DateIntentToast onDismiss={() => setShowDateIntentToast(false)} />
      )}

      <GroupSizeNudgeStandalone
        isOpen={showGroupSizeNudge}
        onClose={() => setShowGroupSizeNudge(false)}
        onSelect={(size) => {
          console.log('Group size selected:', size);
          setShowGroupSizeNudge(false);
        }}
      />

      <TripBuilderPromptStandalone
        isOpen={showTripBuilderPrompt}
        onClose={() => setShowTripBuilderPrompt(false)}
        onStartBuilder={() => {
          console.log('Start builder clicked');
          setShowTripBuilderPrompt(false);
        }}
        coursesViewed={3}
      />

      {showOverlay && (
        <div onClick={() => setShowOverlay(false)}>
          <LoadingOverlay message="Loading your golf trip..." />
        </div>
      )}
    </div>
  );
}

// Wrap with required providers
export default function AuditPage() {
  return (
    <ToastProvider>
      <ChatProvider>
        <AuditPageContent />
      </ChatProvider>
    </ToastProvider>
  );
}
