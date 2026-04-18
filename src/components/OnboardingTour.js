import React, { useState, useEffect } from 'react';

// Detect user's city and time of day for personalized copy
function useLocalContext() {
  const [city, setCity] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    // Time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    // Geolocation → city name
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
              );
              const data = await res.json();
              const c = data?.address?.city || data?.address?.town || data?.address?.village || '';
              if (c) setCity(c);
            } catch { /* fail silently */ }
          },
          () => { /* denied */ },
          { timeout: 5000 }
        );
      }
    } catch { /* unavailable */ }
  }, []);

  return { city, timeOfDay };
}

function getSteps(city, timeOfDay) {
  // Dynamic location string
  const locationStr = city ? `in ${city}` : 'near you';

  // Time-aware greeting
  const timeGreeting = timeOfDay === 'morning'
    ? 'Good morning'
    : timeOfDay === 'afternoon'
    ? 'Good afternoon'
    : 'Good evening';

  // Time-aware meal suggestion
  const mealSuggestion = timeOfDay === 'morning'
    ? 'a weekend brunch'
    : timeOfDay === 'afternoon'
    ? 'a supper club'
    : 'a dinner party';

  return [
    {
      icon: '🏠',
      title: `${timeGreeting}! Welcome to TableFolk`,
      body: `Discover intimate dining experiences ${locationStr} — supper clubs, potlucks, dinner parties, brunches, and more. Your next great meal is waiting.`,
      cta: 'Let\'s go',
    },
    {
      icon: '🗓️',
      title: 'Host your own table',
      body: 'Create an event in minutes. Set your guest list, menu style, and cover art. TableFolk handles the invites and RSVPs.',
      cta: 'Got it',
    },
    {
      icon: '✉️',
      title: 'Get invited to tables',
      body: 'When a host wants you at their table, you\'ll get an invitation here. Accept, decline, or claim your potluck dish all in one place.',
      cta: 'Nice',
    },
    {
      icon: '🥂',
      title: 'You\'re all set!',
      body: `Explore what's happening ${locationStr} or host ${mealSuggestion} of your own. Good food is better shared.`,
      cta: 'Start exploring →',
      final: true,
    },
  ];
}

export default function OnboardingTour({ onDone }) {
  const [step, setStep] = useState(0);
  const { city, timeOfDay } = useLocalContext();
  const steps = getSteps(city, timeOfDay);
  const current = steps[step];

  function advance() {
    if (current.final) {
      onDone();
    } else {
      setStep(s => s + 1);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,8,26,.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000, padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          background: 'white', borderRadius: 24, padding: '36px 32px 28px',
          maxWidth: 400, width: '100%', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,.28)',
          animation: 'slideUp 0.24s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 22 : 7, height: 7, borderRadius: 4,
                background: i === step ? 'var(--indigo)' : 'var(--border)',
                transition: 'all 0.22s',
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div style={{ fontSize: 56, marginBottom: 18, lineHeight: 1 }}>{current.icon}</div>

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
          {current.title}
        </div>

        {/* Body */}
        <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7, marginBottom: 28, maxWidth: 300, margin: '0 auto 28px' }}>
          {current.body}
        </div>

        {/* CTA */}
        <button
          className="btn btn-primary btn-full"
          style={{ fontSize: 15, padding: '13px 20px' }}
          onClick={advance}
        >
          {current.cta}
        </button>

        {/* Skip */}
        {!current.final && (
          <button
            onClick={onDone}
            style={{
              marginTop: 14, background: 'none', border: 'none',
              color: 'var(--ink3)', fontSize: 13, cursor: 'pointer',
              font: 'inherit',
            }}
          >
            Skip tour
          </button>
        )}
      </div>
    </div>
  );
}
