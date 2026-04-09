import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';

const STEPS = {
  DETAILS: 1,
  INVITES: 2,
  REVIEW: 3
};

export default function CreateEventModal({ onClose }) {
  const { friends, createEvent, addToast } = useApp();
  const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);
  
  // Step 1: Event Details
  const [coverType, setCoverType] = useState('gradient');
  const [selectedGradient, setSelectedGradient] = useState('midnight');
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('dinnerParty');
  const [visibility] = useState('inviteOnly');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [maxGuests] = useState(10);
  const [description] = useState('');
  
  // Step 2: Invites
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
      if (!date) {
        addToast('Please select a date', 'error');
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

  function handleSkipInvites() {
    setCurrentStep(STEPS.REVIEW);
  }

  function handlePublish() {
    const eventData = {
      title,
      type: eventType,
      visibility,
      date,
      time,
      location,
      maxGuests,
      description,
      coverType,
      selectedGradient,
      invites: [
        ...selectedFriends.map(userId => {
          const friend = friends.find(f => f.userId === userId);
          return { userId, name: friend?.name || 'Friend' };
        }),
        ...emailInvites.map(email => ({ email, name: email.split('@')[0] }))
      ]
    };

    createEvent(eventData);
    addToast('Event created! 🎉', 'success');
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
                <label style={{ 
                  fontSize: 11, 
                  fontWeight: 600, 
                  color: 'var(--ink2, #6b7280)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: 10
                }}>
                  Cover
                </label>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  {gradients.map(grad => (
                    <button
                      key={grad.id}
                      onClick={() => {
                        setCoverType('gradient');
                        setSelectedGradient(grad.id);
                      }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        border: selectedGradient === grad.id ? '3px solid var(--indigo, #6c5dd3)' : '2px solid var(--border, #e5e7eb)',
                        background: `linear-gradient(135deg, ${grad.colors[0]}, ${grad.colors[1]})`,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    />
                  ))}
                </div>
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
                    { id: 'brunch', label: 'Brunch', emoji: '🥞' },
                    { id: 'dinnerParty', label: 'Dinner Party', emoji: '🍷' },
                    { id: 'potluck', label: 'Potluck', emoji: '🥘' },
                    { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
                    { id: 'supperClub', label: 'Supper Club', emoji: '✨' },
                    { id: 'tasting', label: 'Tasting', emoji: '🍾' }
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

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
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
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid var(--border, #e5e7eb)',
                      borderRadius: 12,
                      fontSize: 16,
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
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
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid var(--border, #e5e7eb)',
                      borderRadius: 12,
                      fontSize: 16,
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Location */}
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
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Venue or neighborhood"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border, #e5e7eb)',
                    borderRadius: 12,
                    fontSize: 16,
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: INVITES */}
          {currentStep === STEPS.INVITES && (
            <div>
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
                  <div style={{ marginBottom: 8 }}>📅 {date} at {time}</div>
                  <div style={{ marginBottom: 8 }}>📍 {location}</div>
                  <div>🎉 {eventType.replace(/([A-Z])/g, ' $1').trim()}</div>
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
              onClick={handleSkipInvites}
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
              🎉 Publish Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
