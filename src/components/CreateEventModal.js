import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';

const STEPS = {
  DETAILS: 1,
  INVITES: 2,
  REVIEW: 3
};

export default function CreateEventModal({ onClose, event: editEvent }) {
  const { friends, createEvent, updateEvent, addToast } = useApp();
  const isEditing = !!editEvent;
  const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);

  function normalizeType(t) {
    if (!t) return 'dinnerParty';
    const map = { 'Dinner Party': 'dinnerParty', 'Potluck': 'potluck', 'Restaurant': 'restaurant', 'Supper Club': 'supperClub', 'Tasting': 'tasting', 'Other': 'other' };
    return map[t] || t;
  }

  // Step 1: Event Details — pre-filled from editEvent if editing
  const [coverType, setCoverType] = useState(editEvent?.cover?.type || 'gradient');
  const [selectedGradient, setSelectedGradient] = useState('midnight');
  const [selectedEmoji, setSelectedEmoji] = useState(editEvent?.cover?.emoji || '🍷');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(editEvent?.cover?.value || null);
  const [title, setTitle] = useState(editEvent?.title || '');
  const [eventType, setEventType] = useState(normalizeType(editEvent?.type));
  const [visibility, setVisibility] = useState(editEvent?.vis || editEvent?.visibility || 'inviteOnly');
  const [date, setDate] = useState(editEvent?.date || '');
  const [time, setTime] = useState(editEvent?.time || '19:00');
  const [isTBD, setIsTBD] = useState(editEvent?.isTBD || false);
  const [location, setLocation] = useState(editEvent?.loc || editEvent?.location || '');
  const [maxGuests, setMaxGuests] = useState(editEvent?.cap || editEvent?.maxGuests || 10);
  const [description, setDescription] = useState(editEvent?.desc || editEvent?.description || '');
  const [menu, setMenu] = useState(editEvent?.menu || '');
  const [dietaryNotes, setDietaryNotes] = useState(editEvent?.dietaryNotes || '');
  const [bringAnything, setBringAnything] = useState(editEvent?.bringAnything || '');
  const [dressCode, setDressCode] = useState(editEvent?.dressCode || 'No dress code');

  // Step 2: Invites
  const [personalMessage, setPersonalMessage] = useState('');
  const [potluckItems, setPotluckItems] = useState(editEvent?.potluck?.items || []);
  const [seriesName, setSeriesName] = useState(editEvent?.supperClub?.seriesName || editEvent?.seriesName || '');
  const [hostNote, setHostNote] = useState(editEvent?.supperClub?.hostNote || '');
  const [courses, setCourses] = useState(editEvent?.supperClub?.courses || [{ num: 1, name: '', wine: '', desc: '', highlight: false }]);
  const [seriesVolume, setSeriesVolume] = useState(editEvent?.supperClub?.seriesVolume || editEvent?.seriesVolume || 1);
  const [tastingItems, setTastingItems] = useState(editEvent?.tasting?.items || []);
  const [useDatePoll, setUseDatePoll] = useState(false);
  const [pollDates, setPollDates] = useState([{ date: '', time: '19:00' }, { date: '', time: '19:00' }]);
  const [playlistUrl, setPlaylistUrl] = useState(editEvent?.playlist?.url || '');
  const [playlistPlatform, setPlaylistPlatform] = useState(editEvent?.playlist?.platform || 'spotify');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [emailInvites, setEmailInvites] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get available friends (with safe checks)
  const availableFriends = (friends || [])
    .filter(f => f && f.name && f.status === 'accepted');

  // Filter friends by search
  const filteredFriends = searchQuery
    ? availableFriends.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.handle || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableFriends;

  function toggleFriend(userId) {
    setSelectedFriends(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }

  function addEmail() {
    if (!newEmail || !newEmail.includes('@')) {
      addToast('Please enter a valid email', 'error');
      return;
    }
    if (emailInvites.includes(newEmail)) {
      addToast('Email already added', 'error');
      return;
    }
    setEmailInvites(prev => [...prev, newEmail]);
    setNewEmail('');
  }

  function removeEmail(email) {
    setEmailInvites(prev => prev.filter(e => e !== email));
  }

  function handleNext() {
    if (currentStep === STEPS.DETAILS) {
      if (!title.trim()) {
        addToast('Please enter an event title', 'error');
        return;
      }
      if (!isTBD && !useDatePoll && !date) {
        addToast('Please select a date or choose TBD / Let guests vote', 'error');
        return;
      }
      if (!location.trim()) {
        addToast('Please enter a location', 'error');
        return;
      }
      setCurrentStep(STEPS.INVITES);
    } else if (currentStep === STEPS.INVITES) {
      setCurrentStep(STEPS.REVIEW);
    }
  }

  function handleBack() {
    if (currentStep === STEPS.INVITES) {
      setCurrentStep(STEPS.DETAILS);
    } else if (currentStep === STEPS.REVIEW) {
      setCurrentStep(STEPS.INVITES);
    }
  }

  function handlePublish() {
    const eventData = {
      title,
      type: eventType,
      visibility,
      date: isTBD ? null : date,
      time: isTBD ? null : time,
      isTBD,
      datePoll: useDatePoll ? pollDates.filter(d => d.date?.trim()) : null,
      location,
      loc: location,
      dressCode,
      maxGuests,
      description,
      menu,
      dietaryNotes,
      bringAnything,
      coverType,
      cover: coverType === 'gradient'
        ? { type: 'gradient', value: gradients.find(g => g.id === selectedGradient)?.colors ? `linear-gradient(135deg, ${gradients.find(g => g.id === selectedGradient).colors[0]}, ${gradients.find(g => g.id === selectedGradient).colors[1]})` : selectedGradient }
        : coverType === 'emoji'
        ? { type: 'emoji', emoji: selectedEmoji, bg: '#2e3440' }
        : { type: 'image', value: photoFile ? URL.createObjectURL(photoFile) : '' },
      playlist: playlistUrl.trim() ? { url: playlistUrl.trim(), platform: playlistPlatform } : null,
      potluck: eventType === 'potluck' ? { items: potluckItems } : null,
      supperClub: eventType === 'supperClub' ? { seriesName, seriesVolume, hostNote, courses } : null,
      tasting: eventType === 'tasting' ? { items: tastingItems } : null,
      personalMessage,
      invites: [
        ...selectedFriends.map(userId => {
          const friend = (friends || []).find(f => f.userId === userId);
          return { userId, name: friend?.name || 'Friend' };
        }),
        ...emailInvites.map(email => ({ email, name: email.split('@')[0] }))
      ]
    };

    if (isEditing) {
      updateEvent(editEvent.id, eventData);
      addToast('Event updated! ✓', 'success');
    } else {
      createEvent(eventData);
      addToast('Event created! 🎉', 'success');
    }
    onClose();
  }

  const gradients = [
    { id: 'midnight', colors: ['#2e3440', '#4c566a'] },
    { id: 'sunset', colors: ['#ee6c4d', '#ffb347'] },
    { id: 'ocean', colors: ['#38b6ff', '#7dd3fc'] },
    { id: 'forest', colors: ['#52796f', '#87bba2'] },
    { id: 'lavender', colors: ['#9d84b7', '#c8b6ff'] },
    { id: 'coral', colors: ['#ff6b9d', '#ffc2d1'] },
    { id: 'sky', colors: ['#56cfe1', '#90e0ef'] },
    { id: 'grape', colors: ['#7209b7', '#9d4edd'] }
  ];

  const POTLUCK_FOOD     = ['Main dish','Side dish','Salad','Dessert','Bread','Cheese board','Charcuterie','Fruit platter'];
  const POTLUCK_OTHER    = ['Flowers','Candles','Music speaker','Extra chairs'];
  const TASTING_OPTIONS  = ['Wine','Champagne','Cognac','Whiskey','Cocktails','Mocktails','Beer & Cider','Sake','Tequila'];

  function toggleItem(item, list, setList) {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: 600,
          background: 'var(--white, #fff)',
          borderRadius: 'var(--r-lg, 20px)',
          boxShadow: 'var(--shadow-lg, 0 8px 40px rgba(0,0,0,0.13))',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--border, #e5e7eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Create Event</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 28,
              color: 'var(--ink3, #9ca3af)',
              cursor: 'pointer',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--page, #f8f7ff)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ×
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          padding: '16px 24px',
          justifyContent: 'center',
          borderBottom: '1px solid var(--border, #e5e7eb)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            background: currentStep === STEPS.DETAILS ? 'var(--indigo, #6c5dd3)' : 'var(--border, #e5e7eb)',
            color: currentStep === STEPS.DETAILS ? 'white' : 'var(--ink3, #9ca3af)',
            whiteSpace: 'nowrap'
          }}>
            1. Details
          </div>
          <div style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            background: currentStep === STEPS.INVITES ? 'var(--indigo, #6c5dd3)' : 'var(--border, #e5e7eb)',
            color: currentStep === STEPS.INVITES ? 'white' : 'var(--ink3, #9ca3af)',
            whiteSpace: 'nowrap'
          }}>
            2. Invite
          </div>
          <div style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            background: currentStep === STEPS.REVIEW ? 'var(--indigo, #6c5dd3)' : 'var(--border, #e5e7eb)',
            color: currentStep === STEPS.REVIEW ? 'white' : 'var(--ink3, #9ca3af)',
            whiteSpace: 'nowrap'
          }}>
            3. Publish
          </div>
        </div>

        {/* Body - Scrollable */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: 24,
          WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
        }}>
          
          {/* STEP 1: EVENT DETAILS */}
          {currentStep === STEPS.DETAILS && (
            <div>
              {/* Cover Selection */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Cover</label>
                {/* Live Preview */}
                <div style={{ width: '100%', height: 120, borderRadius: 12, marginBottom: 12, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: coverType === 'gradient'
                    ? (() => { const g = gradients.find(g => g.id === selectedGradient); return g ? `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` : 'var(--indigo)'; })()
                    : coverType === 'emoji' ? '#1a1a2e' : 'var(--border, #e5e7eb)' }}>
                  {coverType === 'emoji' && <span style={{ fontSize: 48 }}>{selectedEmoji}</span>}
                  {coverType === 'photo' && photoPreview && <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />}
                  {coverType === 'photo' && !photoFile && <span style={{ fontSize: 13, color: 'var(--ink3, #9ca3af)' }}>No photo selected</span>}
                  {title && <div style={{ position: 'absolute', bottom: 10, left: 14, fontSize: 15, fontWeight: 600, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>{title}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {[{id:'gradient',label:'🎨 Gradient'},{id:'emoji',label:'✨ Emoji'},{id:'photo',label:'📷 Photo'}].map(t => (
                    <button key={t.id} onClick={() => setCoverType(t.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: coverType === t.id ? 'var(--indigo-light, #f0eeff)' : 'transparent', border: coverType === t.id ? '2px solid var(--indigo, #6c5dd3)' : '1px solid var(--border, #e5e7eb)' }}>{t.label}</button>
                  ))}
                </div>
                {coverType === 'gradient' && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {gradients.map(grad => (
                      <button key={grad.id} onClick={() => setSelectedGradient(grad.id)} style={{ width: 48, height: 48, borderRadius: 12, border: selectedGradient === grad.id ? '3px solid var(--indigo, #6c5dd3)' : '2px solid var(--border, #e5e7eb)', background: `linear-gradient(135deg, ${grad.colors[0]}, ${grad.colors[1]})`, cursor: 'pointer', transition: 'all 0.15s' }} />
                    ))}
                  </div>
                )}
                {coverType === 'emoji' && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['🍷','🥂','🍽️','🥘','🍕','🍝','🥞','🎂','🍾','☕','🍜','🥗'].map(em => (
                      <button key={em} onClick={() => setSelectedEmoji(em)} style={{ width: 48, height: 48, borderRadius: 12, fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page, #f8f7ff)', border: selectedEmoji === em ? '3px solid var(--indigo, #6c5dd3)' : '2px solid var(--border, #e5e7eb)' }}>{em}</button>
                    ))}
                  </div>
                )}
                {coverType === 'photo' && (
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setPhotoFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setPhotoPreview(reader.result);
                    reader.readAsDataURL(file);
                  }} style={{ width: '100%', padding: 12, border: '2px dashed var(--border, #e5e7eb)', borderRadius: 12, fontSize: 14, cursor: 'pointer' }} />
                )}
              </div>

              {/* Title */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  fontSize: 11, 
                  fontWeight: 600, 
                  color: 'var(--ink2, #6b7280)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: 10
                }}>
                  Event Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. An Evening of Provençal Cuisine"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border, #e5e7eb)',
                    borderRadius: 12,
                    fontSize: 16, // Prevents zoom on iOS
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Event Type */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  fontSize: 11, 
                  fontWeight: 600, 
                  color: 'var(--ink2, #6b7280)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: 10
                }}>
                  Event Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                  {[
                    { id: 'dinnerParty', label: 'Dinner Party', emoji: '🍷' },
                    { id: 'potluck',     label: 'Potluck',      emoji: '🥘' },
                    { id: 'restaurant', label: 'Restaurant',   emoji: '🍽️' },
                    { id: 'supperClub', label: 'Supper Club',  emoji: '🕯️' },
                    { id: 'tasting',    label: 'Tasting',      emoji: '🍾' },
                    { id: 'other',      label: 'Other',        emoji: '🎉' },
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setEventType(type.id)}
                      style={{
                        padding: '12px 16px',
                        border: eventType === type.id ? '2px solid var(--indigo, #6c5dd3)' : '1px solid var(--border, #e5e7eb)',
                        borderRadius: 12,
                        background: eventType === type.id ? 'var(--indigo-light, #f0eeff)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        transition: 'all 0.15s',
                        minHeight: 44 // Touch-friendly on mobile
                      }}
                    >
                      {type.emoji} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Potluck section */}
              {eventType === 'potluck' && (
                <div style={{ background: 'var(--page, #f8f7ff)', border: '1px solid var(--indigo-light, #e0d9ff)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--indigo, #6c5dd3)', marginBottom: 12 }}>🥘 Potluck Items</div>
                  {[
                    { key: 'food', label: 'Food & Dishes', emoji: '🍽️', presets: POTLUCK_FOOD },
                    { key: 'drinks', label: 'Drinks', emoji: '🥂', presets: ['Wine (2 bottles)', 'Beer (6-pack)', 'Sparkling water', 'Juice', 'Cocktail mixer'] },
                    { key: 'other', label: 'Other', emoji: '🧺', presets: POTLUCK_OTHER },
                  ].map(cat => {
                    const catItems = potluckItems.filter(it => it.cat === cat.key);
                    return (
                      <div key={cat.key} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{cat.emoji} {cat.label}</div>
                        {catItems.map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'white', borderRadius: 8, marginBottom: 4, border: '1px solid var(--border, #e5e7eb)' }}>
                            <span style={{ fontSize: 16 }}>{item.emoji}</span>
                            <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
                            <button onClick={() => setPotluckItems(prev => prev.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3, #9ca3af)', fontSize: 14, minWidth: 24, minHeight: 24 }}>✕</button>
                          </div>
                        ))}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                          {cat.presets.filter(p => !catItems.find(i => i.name === p)).slice(0, 6).map(preset => (
                            <button key={preset} onClick={() => setPotluckItems(prev => [...prev, { id: Date.now() + Math.random(), name: preset, emoji: cat.emoji, cat: cat.key }])} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px dashed var(--border, #e5e7eb)', background: 'transparent', color: 'var(--ink2, #6b7280)', minHeight: 30 }}>+ {preset}</button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input type="text" placeholder={`Add custom ${cat.label.toLowerCase()}...`} id={`custom-pot-${cat.key}`} style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', minWidth: 0 }} onKeyDown={e => { if (e.key === 'Enter') { const val = e.target.value.trim(); if (val) { setPotluckItems(prev => [...prev, { id: Date.now(), name: val, emoji: cat.emoji, cat: cat.key }]); e.target.value = ''; } }}} />
                          <button onClick={() => { const inp = document.getElementById(`custom-pot-${cat.key}`); const val = inp?.value?.trim(); if (val) { setPotluckItems(prev => [...prev, { id: Date.now(), name: val, emoji: cat.emoji, cat: cat.key }]); inp.value = ''; }}} style={{ padding: '7px 14px', background: 'var(--indigo-light, #f0eeff)', border: '1px solid var(--indigo, #6c5dd3)', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: 'var(--indigo, #6c5dd3)', whiteSpace: 'nowrap', minHeight: 36 }}>+ Add</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Supper Club series section */}
              {eventType === 'supperClub' && (
                <div style={{ background: 'var(--page, #f8f7ff)', border: '1px solid var(--indigo-light, #e0d9ff)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--indigo, #6c5dd3)', marginBottom: 12 }}>🕯️ Supper Club Series</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>Series Name</label>
                      <input type="text" value={seriesName} onChange={e => setSeriesName(e.target.value)} placeholder="e.g. The Long Table" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>Volume #</label>
                      <input type="number" value={seriesVolume} onChange={e => setSeriesVolume(parseInt(e.target.value) || 1)} min="1" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>Host Note (shown to guests)</label>
                    <textarea value={hostNote} onChange={e => setHostNote(e.target.value)} placeholder="Share your inspiration, a personal note, or what guests should expect..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', resize: 'vertical', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Menu Courses</div>
                  {courses.map((course, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 8, border: '1px solid var(--border, #e5e7eb)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: course.highlight ? '#fef3c7' : 'var(--indigo-light, #f0eeff)', color: course.highlight ? '#92400e' : 'var(--indigo, #6c5dd3)', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{course.num}</div>
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Course {course.num}</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', color: course.highlight ? '#92400e' : 'var(--ink3, #9ca3af)' }}>
                          <input type="checkbox" checked={course.highlight} onChange={() => setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, highlight: !c.highlight } : c))} style={{ width: 14, height: 14 }} />
                          ⭐ Signature
                        </label>
                        {courses.length > 1 && <button onClick={() => setCourses(prev => prev.filter((_, idx) => idx !== i).map((c, idx) => ({ ...c, num: idx + 1 })))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral, #ff6b6b)', fontSize: 16, minWidth: 24, minHeight: 24 }}>✕</button>}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <input type="text" value={course.name} onChange={e => setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c))} placeholder="Dish name" style={{ padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }} />
                        <input type="text" value={course.wine} onChange={e => setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, wine: e.target.value } : c))} placeholder="Wine pairing (optional)" style={{ padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }} />
                      </div>
                      <input type="text" value={course.desc} onChange={e => setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, desc: e.target.value } : c))} placeholder="Short description..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <button onClick={() => setCourses(prev => [...prev, { num: prev.length + 1, name: '', wine: '', desc: '', highlight: false }])} style={{ width: '100%', padding: '9px 16px', background: 'transparent', border: '1px dashed var(--border, #e5e7eb)', borderRadius: 10, fontSize: 13, cursor: 'pointer', color: 'var(--indigo, #6c5dd3)', minHeight: 40 }}>+ Add Course</button>
                </div>
              )}

              {/* Tasting section */}
              {eventType === 'tasting' && (
                <div style={{ background: 'var(--page, #f8f7ff)', border: '1px solid var(--indigo-light, #e0d9ff)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--indigo, #6c5dd3)', marginBottom: 12 }}>🍾 What are we tasting?</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TASTING_OPTIONS.map(item => (
                      <button key={item} onClick={() => toggleItem(item, tastingItems, setTastingItems)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: tastingItems.includes(item) ? '1.5px solid var(--indigo, #6c5dd3)' : '1px solid var(--border, #e5e7eb)', background: tastingItems.includes(item) ? 'var(--indigo-light, #f0eeff)' : 'transparent', color: tastingItems.includes(item) ? 'var(--indigo, #6c5dd3)' : 'inherit', minHeight: 36 }}>{item}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Date & Time</label>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="dateMode" checked={!isTBD && !useDatePoll} onChange={() => { setIsTBD(false); setUseDatePoll(false); }} style={{ width: 16, height: 16 }} />
                    Set a date
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="dateMode" checked={isTBD} onChange={() => { setIsTBD(true); setUseDatePoll(false); }} style={{ width: 16, height: 16 }} />
                    Date TBD
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="dateMode" checked={useDatePoll} onChange={() => { setIsTBD(false); setUseDatePoll(true); }} style={{ width: 16, height: 16 }} />
                    Let guests vote
                  </label>
                </div>
                {!isTBD && !useDatePoll && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                )}
                {useDatePoll && (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--ink2, #6b7280)', marginBottom: 8 }}>Add date + time options for guests to vote on:</div>
                    {pollDates.map((d, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input type="date" value={d.date || ''} onChange={e => { const next = [...pollDates]; next[i] = { ...next[i], date: e.target.value }; setPollDates(next); }} style={{ flex: '1 1 140px', padding: '10px 14px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', minWidth: 0 }} />
                        <input type="time" value={d.time || '19:00'} onChange={e => { const next = [...pollDates]; next[i] = { ...next[i], time: e.target.value }; setPollDates(next); }} style={{ flex: '1 1 100px', padding: '10px 14px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', minWidth: 0 }} />
                        {pollDates.length > 2 && <button onClick={() => setPollDates(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink3, #9ca3af)', minWidth: 32, minHeight: 32 }}>×</button>}
                      </div>
                    ))}
                    <button onClick={() => setPollDates(prev => [...prev, { date: '', time: '19:00' }])} style={{ background: 'transparent', border: '1px dashed var(--border, #e5e7eb)', borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: 'var(--indigo, #6c5dd3)', width: '100%', minHeight: 40 }}>+ Add another option</button>
                  </div>
                )}
              </div>
              {/* Location */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Venue or neighborhood" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit' }} />
              </div>

              {/* Visibility */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Visibility</label>
                <select value={visibility} onChange={e => setVisibility(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="inviteOnly">🔒 Invite Only</option>
                  <option value="public">🌍 Public</option>
                </select>
              </div>

              {/* Max Guests */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Max Guests</label>
                <input type="number" value={maxGuests} onChange={e => setMaxGuests(parseInt(e.target.value) || 10)} min="1" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit' }} />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Description (Optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell guests what to expect..." rows={3} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', resize: 'vertical' }} />
              </div>

              {/* Menu */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Menu (Optional)</label>
                <textarea value={menu} onChange={e => setMenu(e.target.value)} placeholder="What's on the menu?" rows={3} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', resize: 'vertical' }} />
              </div>

              {/* Dietary Notes */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Dietary Accommodations (Optional)</label>
                <input type="text" value={dietaryNotes} onChange={e => setDietaryNotes(e.target.value)} placeholder="e.g. Vegetarian options available" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit' }} />
              </div>

              {/* Bring Anything */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Should Guests Bring Anything? (Optional)</label>
                <input type="text" value={bringAnything} onChange={e => setBringAnything(e.target.value)} placeholder="e.g. Bring a bottle of wine" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit' }} />
              </div>

              {/* Dress Code */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Dress Code</label>
                <select value={dressCode} onChange={e => setDressCode(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="No dress code">No dress code</option>
                  <option value="Casual">Casual</option>
                  <option value="Smart Casual">Smart Casual</option>
                  <option value="Business Casual">Business Casual</option>
                  <option value="Cocktail Attire">Cocktail Attire</option>
                  <option value="Black Tie Optional">Black Tie Optional</option>
                  <option value="Black Tie">Black Tie</option>
                  <option value="Themed">Themed (specify in description)</option>
                </select>
              </div>

              {/* Playlist */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Playlist (Optional)</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {[{id:'spotify',label:'Spotify'},{id:'apple',label:'Apple Music'},{id:'youtube',label:'YouTube'}].map(p => (
                    <button key={p.id} onClick={() => setPlaylistPlatform(p.id)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: playlistPlatform === p.id ? '1.5px solid var(--indigo, #6c5dd3)' : '1px solid var(--border, #e5e7eb)', background: playlistPlatform === p.id ? 'var(--indigo-light, #f0eeff)' : 'transparent', color: playlistPlatform === p.id ? 'var(--indigo, #6c5dd3)' : 'inherit', minHeight: 36 }}>{p.label}</button>
                  ))}
                </div>
                <input type="url" value={playlistUrl} onChange={e => setPlaylistUrl(e.target.value)} placeholder="Paste playlist link..." style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit' }} />
              </div>
            </div>
          )}

          {/* STEP 2: INVITES */}
          {currentStep === STEPS.INVITES && (
            <div>
              {/* Personal Message */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Personal Message (Optional)</label>
                <textarea value={personalMessage} onChange={e => setPersonalMessage(e.target.value)} placeholder="Looking forward to seeing you! 🍷" rows={3} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', resize: 'vertical' }} />
              </div>

              {/* Friends List */}
              {availableFriends.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ 
                    fontSize: 11, 
                    fontWeight: 600, 
                    color: 'var(--ink2, #6b7280)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: 10
                  }}>
                    Your Friends (Optional)
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="🔍 Search friends..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid var(--border, #e5e7eb)',
                      borderRadius: 12,
                      fontSize: 16,
                      marginBottom: 12,
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{ 
                    display: 'grid', 
                    gap: 8, 
                    maxHeight: 240, 
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}>
                    {filteredFriends.map(friend => (
                      <label
                        key={friend.userId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          border: selectedFriends.includes(friend.userId) ? '2px solid var(--indigo, #6c5dd3)' : '1.5px solid var(--border, #e5e7eb)',
                          borderRadius: 12,
                          cursor: 'pointer',
                          background: selectedFriends.includes(friend.userId) ? 'var(--indigo-light, #f0eeff)' : 'transparent',
                          transition: 'all 0.15s',
                          minHeight: 56 // Touch-friendly
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend.userId)}
                          onChange={() => toggleFriend(friend.userId)}
                          style={{ display: 'none' }}
                        />
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'var(--indigo-light, #f0eeff)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          color: 'var(--indigo, #6c5dd3)',
                          fontSize: 14,
                          flexShrink: 0
                        }}>
                          {friend.initials || friend.name?.[0] || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{friend.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink3, #9ca3af)' }}>
                            {friend.handle || '@' + (friend.name || 'user').toLowerCase().replace(/\s/g, '')}
                          </div>
                        </div>
                        <div style={{
                          width: 22,
                          height: 22,
                          border: selectedFriends.includes(friend.userId) ? 'none' : '2px solid var(--border, #e5e7eb)',
                          borderRadius: 4,
                          background: selectedFriends.includes(friend.userId) ? 'var(--indigo, #6c5dd3)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 12,
                          flexShrink: 0
                        }}>
                          {selectedFriends.includes(friend.userId) && '✓'}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Invites */}
              <div>
                <label style={{ 
                  fontSize: 11, 
                  fontWeight: 600, 
                  color: 'var(--ink2, #6b7280)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: 10
                }}>
                  Invite by Email
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addEmail()}
                    placeholder="friend@email.com"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid var(--border, #e5e7eb)',
                      borderRadius: 12,
                      fontSize: 16,
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    onClick={addEmail}
                    style={{
                      padding: '12px 20px',
                      background: 'transparent',
                      border: '1px solid var(--border, #e5e7eb)',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: 44
                    }}
                  >
                    + Add
                  </button>
                </div>
                {emailInvites.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {emailInvites.map(email => (
                      <span
                        key={email}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--indigo-light, #f0eeff)',
                          border: '1px solid var(--indigo, #6c5dd3)',
                          borderRadius: 20,
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        {email}
                        <button
                          onClick={() => removeEmail(email)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 16,
                            color: 'var(--indigo, #6c5dd3)',
                            padding: 0,
                            minWidth: 20,
                            minHeight: 20
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {currentStep === STEPS.REVIEW && (
            <div>
              <div style={{ 
                background: 'var(--page, #f8f7ff)', 
                padding: 20, 
                borderRadius: 12,
                marginBottom: 20
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{title}</h3>
                <div style={{ fontSize: 14, color: 'var(--ink2, #6b7280)', lineHeight: 1.6 }}>
                  {isTBD && <div style={{ marginBottom: 8 }}>📅 Date TBD</div>}
                  {useDatePoll && <div style={{ marginBottom: 8 }}>📅 Letting guests vote on date</div>}
                  {!isTBD && !useDatePoll && date && <div style={{ marginBottom: 8 }}>📅 {date} at {time}</div>}
                  {location && <div style={{ marginBottom: 8 }}>📍 {location}</div>}
                  <div style={{ marginBottom: 8 }}>🎉 {eventType.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()}</div>
                  {dressCode && dressCode !== 'No dress code' && <div style={{ marginBottom: 8 }}>👗 {dressCode}</div>}
                  <div>👥 Max {maxGuests} guests</div>
                </div>
              </div>

              {(selectedFriends.length > 0 || emailInvites.length > 0) && (
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                    Inviting {selectedFriends.length + emailInvites.length} guest{selectedFriends.length + emailInvites.length !== 1 ? 's' : ''}
                  </h4>
                  <div style={{ fontSize: 13, color: 'var(--ink2, #6b7280)' }}>
                    {selectedFriends.map(id => {
                      const friend = friends.find(f => f.userId === id);
                      return friend?.name;
                    }).filter(Boolean).join(', ')}
                    {selectedFriends.length > 0 && emailInvites.length > 0 && ', '}
                    {emailInvites.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 24px',
          borderTop: '1px solid var(--border, #e5e7eb)',
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          {currentStep > STEPS.DETAILS && (
            <button
              onClick={handleBack}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid var(--border, #e5e7eb)',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                minHeight: 44,
                minWidth: 80
              }}
            >
              ← Back
            </button>
          )}
          
          {currentStep === STEPS.INVITES && (
            <button
              onClick={() => setCurrentStep(STEPS.REVIEW)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid var(--border, #e5e7eb)',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                minHeight: 44,
                flex: window.innerWidth < 640 ? 1 : 'none'
              }}
            >
              Skip
            </button>
          )}

          {currentStep < STEPS.REVIEW ? (
            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                background: 'var(--indigo, #6c5dd3)',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
                minHeight: 44,
                minWidth: 100,
                flex: window.innerWidth < 640 ? 1 : 'none'
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handlePublish}
              style={{
                padding: '12px 24px',
                background: 'var(--indigo, #6c5dd3)',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                color: 'white',
                cursor: 'pointer',
                minHeight: 44,
                minWidth: 140,
                flex: window.innerWidth < 640 ? 1 : 'none'
              }}
            >
              {isEditing ? '✓ Save Changes' : '🎉 Publish Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
