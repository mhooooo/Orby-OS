'use client';

import React, { useState } from 'react';
import { ChatProvider } from '@/context/ChatContext';
import { ItineraryProvider } from '@/context/ItineraryContext';
import { CourseCard } from '@/components/generative-ui/CourseCard';
import { AboutCard } from '@/components/generative-ui/AboutCard';
import { FleetCard } from '@/components/generative-ui/FleetCard';
import { CourseDetailCard } from '@/components/generative-ui/CourseDetailCard';
import { ServiceBento } from '@/components/generative-ui/ServiceBento';
import { TourShowcase } from '@/components/generative-ui/TourShowcase';
import AuthGateModal from '@/components/generative-ui/AuthGateModal';
import { CourseCarousel } from '@/components/generative-ui/CourseCarousel';
import InquiryForm from '@/components/generative-ui/InquiryForm';
import { ItinerarySummary } from '@/components/generative-ui/ItinerarySummary';
import { RegionStep } from '@/components/generative-ui/ItineraryBuilder/RegionStep';
import { VibeStep } from '@/components/generative-ui/ItineraryBuilder/VibeStep';
import { DateGroupStep } from '@/components/generative-ui/ItineraryBuilder/DateGroupStep';
import { LogisticsStep } from '@/components/generative-ui/ItineraryBuilder/LogisticsStep';
import { ProgressIndicator } from '@/components/generative-ui/ItineraryBuilder/ProgressIndicator';
import { WizardNavigation } from '@/components/generative-ui/ItineraryBuilder/WizardNavigation';
import { Course } from '@/types/course';
import { ItineraryDraft } from '@/types/itinerary';

// Mock Data
const MOCK_COURSE: Course = {
    id: '1',
    name: 'Alpine Golf Resort',
    region: 'chiang_mai',
    location: 'San Kamphaeng, Chiang Mai',
    par: 72,
    yardage: 7541,
    holes: 18,
    tags: ['Championship', 'Mountain View'],
    heroImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
    description: 'One of the best golf courses in Chiang Mai, nestled in a valley between mountain ranges.',
    greenFee: {
        weekday: { guest: 3500, member: 2500 },
        weekend: { guest: 4500, member: 3500 },
    }
};

const MOCK_DRAFT: ItineraryDraft = {
    id: 'mock-draft-1',
    region: 'chiang_mai',
    vibe: 'scenic',
    startDate: '2024-12-01',
    endDate: '2024-12-05',
    numberOfDays: 5,
    groupSize: 4,
    days: [], // Empty days for mock
    transfers: {
        enabled: true,
        vehicleType: 'vip-van',
        includesAirportPickup: true,
    },
    includeCaddieTips: true,
    totalEstimate: 45000,
    status: 'draft',
};

const MOCK_ABOUT_DATA = {
    company: 'Golf Okay',
    tagline: 'Your Personal Golf Concierge',
    founded: 2023,
    yearsExperience: 15,
    founders: [
        { name: 'John Smith', role: 'CEO & Founder', expertise: 'PGA Professional' },
        { name: 'Sarah Johnson', role: 'Head of Operations', expertise: 'Luxury Travel Expert' },
    ],
    certifications: ['SHA Plus+', 'IAGTO Member', 'TAT License'],
    stats: {
        coursesPartner: 50,
        happyGolfers: 10000,
        averageRating: 4.9,
    },
    description: 'We specialize in crafting unforgettable golf experiences in Thailand. From tee times to luxury transport, we handle every detail so you can focus on your game.',
};

const MOCK_FLEET_DATA = {
    vehicles: [
        {
            id: 'v1',
            type: 'Luxury Van',
            model: 'Toyota Alphard',
            capacity: 4,
            luggage: 4,
            amenities: ['Leather Seats', 'WiFi', 'Refreshments'],
            pricePerDay: 5000,
            image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2070&auto=format&fit=crop',
        },
        {
            id: 'v2',
            type: 'Standard Van',
            model: 'Toyota Commuter',
            capacity: 9,
            luggage: 8,
            amenities: ['AC', 'Spacious Interior'],
            pricePerDay: 3500,
            image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=2070&auto=format&fit=crop',
        },
    ],
    notes: 'All rentals include a professional driver, fuel, and insurance. Prices are per day (10 hours).',
};

export default function CardDemoPage() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <ChatProvider>
            <ItineraryProvider>
                <div className="min-h-screen bg-black p-8 space-y-12">
                    <h1 className="text-4xl font-bold text-white mb-8">Glassmorphic Component Library</h1>

                    {/* Section 1: Standard Cards */}
                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold text-white/80 border-b border-white/10 pb-4">Standard Cards</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider">Course Card</h3>
                                <CourseCard course={MOCK_COURSE} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider">About Card</h3>
                                <AboutCard data={MOCK_ABOUT_DATA} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider">Fleet Card</h3>
                                <FleetCard data={MOCK_FLEET_DATA} />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Large Feature Cards */}
                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold text-white/80 border-b border-white/10 pb-4">Feature Showcases</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider">Course Detail</h3>
                                <CourseDetailCard course={MOCK_COURSE} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider">Service Bento</h3>
                                <ServiceBento />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-white/60 text-sm uppercase tracking-wider">Tour Showcase</h3>
                            <TourShowcase />
                        </div>
                    </section>

                    {/* Section 3: Itinerary Builder Components */}
                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold text-white/80 border-b border-white/10 pb-4">Itinerary Builder</h2>

                        <div className="max-w-2xl mx-auto space-y-12 bg-[#111] p-8 rounded-[3rem] border border-white/5">
                            <ProgressIndicator
                                steps={['region', 'vibe', 'dates', 'logistics', 'summary']}
                                currentStep="region"
                            />

                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider text-center">Region Step</h3>
                                <RegionStep />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider text-center">Vibe Step</h3>
                                <VibeStep />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider text-center">Date & Group Step</h3>
                                <DateGroupStep />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider text-center">Logistics Step</h3>
                                <LogisticsStep />
                            </div>

                            <WizardNavigation />
                        </div>
                    </section>

                    {/* Section 4: Interactive Components */}
                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold text-white/80 border-b border-white/10 pb-4">Interactive Components</h2>
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider">Course Carousel</h3>
                                <CourseCarousel />
                            </div>
                            <div className="space-y-4 max-w-2xl mx-auto">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider text-center">Inquiry Form</h3>
                                <InquiryForm demoMode={true} />
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Summary & Modals */}
                    <section className="space-y-8 pb-20">
                        <h2 className="text-2xl font-bold text-white/80 border-b border-white/10 pb-4">Summary & Modals</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider">Itinerary Summary</h3>
                                <ItinerarySummary draft={MOCK_DRAFT} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-white/60 text-sm uppercase tracking-wider">Auth Gate Modal</h3>
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                                    <p className="text-gray-400">Click to preview modal</p>
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Open Auth Modal
                                    </button>
                                </div>
                                <AuthGateModal
                                    isOpen={isAuthModalOpen}
                                    onClose={() => setIsAuthModalOpen(false)}
                                    triggerReason="save_itinerary"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </ItineraryProvider>
        </ChatProvider>
    );
}
