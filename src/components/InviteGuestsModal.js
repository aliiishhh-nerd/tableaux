import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';

export default function InviteGuestsModal({ event, onClose }) {
  const { friends, inviteGuests, addToast } = useApp();
  const [selected, setSelected] = useState([]);
  const [emailInvites, setEmailInvites] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get friends who aren't already guests or invited - safety check for friends AND required properties
  const availableFriends = (friends || [])
    .filter(f => f && f.name && f.status === 'accepted')
    .filter(f => !event.guests?.find(g => g.id === f.userId))
    .filter(f => !event.invites?.find(i => i.recipientId === f.userId));

  // Filter by search - now safe because we know f.name exists
  const filteredFriends = searchQuery
    ? availableFriends.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.handle || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableFriends;

  function toggleFriend(userId) {
    setSelected(s => s.includes(userId) 
      ? s.filter(id => id !== userId) 
      : [...s, userId]
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
    setEmailInvites(e => [...e, newEmail]);
    setNewEmail('');
  }

  function removeEmail(email) {
    setEmailInvites(e => e.filter(em => em !== email));
  }

  function sendInvites() {
    const friendInvites = selected.map(userId => {
      const friend = friends.find(f => f.userId === userId);
      return { userId, name: friend?.name || 'Friend', message };
    });
    const emailInvitesList = emailInvites.map(email => ({
      email, name: email.split('@')[0], message
    }));
    
    inviteGuests(event.id, [...friendInvites, ...emailInvitesList]);
    const total = selected.length + emailInvites.length;
    addToast(`Sent ${total} invite${total !== 1 ? 's' : ''}! 🎉`, 'success');
    onClose();
  }

  const totalSelected = selected.length + emailInvites.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Guests</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Search friends */}
          {availableFriends.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🔍 Search friends..."
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  borderRadius: 10, 
                  border: '1px solid var(--border)',
                  fontSize: 14,
                  background: 'var(--surface)'
                }}
              />
            </div>
          )}

          {/* Friends list */}
          {availableFriends.length > 0 ? (
            <>
              <div style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                color: 'var(--ink2)', 
                marginBottom: 10, 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px' 
              }}>
                Your Friends ({filteredFriends.length})
              </div>
              <div style={{ marginBottom: 20, maxHeight: 220, overflowY: 'auto' }}>
                {filteredFriends.map(friend => (
                  <label key={friend.userId} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '10px 8px', 
                    cursor: 'pointer',
                    borderRadius: 8,
                    background: selected.includes(friend.userId) ? 'var(--indigo-light)' : 'transparent',
                    transition: 'background 0.15s'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={selected.includes(friend.userId)}
                      onChange={() => toggleFriend(friend.userId)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className={`av av-sm av-${friend.color || 'indigo'}`}>{friend.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{friend.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{friend.handle || '@' + (friend.name || 'user').toLowerCase().replace(/\s/g, '')}</div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 500 }}>✓ On Tableaux</span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink3)', fontSize: 13, marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
              No friends available to invite
            </div>
          )}

          {/* Add by email */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: 'var(--ink2)', 
              marginBottom: 10, 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px' 
            }}>
              Add by Email
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEmail()}
                placeholder="friend@email.com"
                style={{ 
                  flex: 1, 
                  padding: '10px 14px', 
                  borderRadius: 10, 
                  border: '1px solid var(--border)',
                  fontSize: 14,
                  background: 'var(--surface)'
                }}
              />
              <button className="btn btn-ghost btn-sm" onClick={addEmail}>+ Add</button>
            </div>
            {emailInvites.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {emailInvites.map(email => (
                  <span key={email} style={{ 
                    padding: '6px 12px', 
                    background: 'var(--indigo-light)', 
                    border: '1px solid var(--indigo-mid)', 
                    borderRadius: 20, 
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--indigo)'
                  }}>
                    {email}
                    <button 
                      onClick={() => removeEmail(email)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: 16,
                        color: 'var(--indigo)',
                        lineHeight: 1,
                        padding: 0
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Personal message */}
          <div>
            <div style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: 'var(--ink2)', 
              marginBottom: 10, 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px' 
            }}>
              Personal Message (Optional)
            </div>
            <textarea 
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Looking forward to seeing you! 🍷"
              style={{ 
                width: '100%', 
                minHeight: 70, 
                padding: '10px 14px', 
                borderRadius: 10, 
                border: '1px solid var(--border)',
                fontSize: 14,
                background: 'var(--surface)',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={sendInvites}
            disabled={totalSelected === 0}
          >
            Send Invite{totalSelected !== 1 ? 's' : ''} ({totalSelected})
          </button>
        </div>
      </div>
    </div>
  );
}
