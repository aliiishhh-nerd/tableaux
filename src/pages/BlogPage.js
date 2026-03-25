import React, { useState } from 'react';
import { BLOG_POSTS } from '../data/seed';

const CATEGORIES = ['All', 'Supper Club Culture', 'Host Guide', 'Natural Wine', 'Recipe', 'Fermentation'];

export default function BlogPage() {
  const [category, setCategory] = useState('All');
  const [reading, setReading] = useState(null);

  const featured = BLOG_POSTS.find(p => p.featured);
  const rest = BLOG_POSTS.filter(p => !p.featured);
  const filtered = (category === 'All' ? rest : rest.filter(p => p.category === category));

  if (reading) return <BlogPost post={reading} onBack={() => setReading(null)} />;

  return (
    <main className="page-content">
      {/* Featured */}
      {featured && (
        <div className="blog-featured" onClick={() => setReading(featured)}>
          <img className="blog-featured-img" src={featured.coverImg} alt={featured.title} loading="lazy" />
          <div className="blog-featured-content">
            <span className="blog-featured-tag">{featured.category}</span>
            <div className="blog-featured-title">{featured.title}</div>
            <div className="blog-featured-meta">
              By {featured.author} · {featured.date} · {featured.readTime}
            </div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', overflowX: 'auto' }}>
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="feed-grid">
        {filtered.map(post => (
          <BlogCard key={post.id} post={post} onClick={() => setReading(post)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <div className="empty-title">No posts in this category yet</div>
          <div className="empty-sub">More stories are coming soon.</div>
        </div>
      )}
    </main>
  );
}

function BlogCard({ post, onClick }) {
  return (
    <div className="blog-card" onClick={onClick}>
      <div className="blog-card-cover">
        <img src={post.coverImg} alt={post.title} loading="lazy" />
      </div>
      <div className="blog-card-body">
        <div className="blog-card-category">{post.category}</div>
        <div className="blog-card-title">{post.title}</div>
        <div className="blog-card-excerpt">{post.excerpt}</div>
      </div>
      <div className="blog-card-foot">
        <div className="blog-author">
          <div className={`av av-sm av-${post.authorColor}`}>{post.authorInitials}</div>
          <div>
            <div className="blog-author-name">{post.author}</div>
            <div className="blog-author-date">{post.date}</div>
          </div>
        </div>
        <div className="blog-read-time">{post.readTime}</div>
      </div>
    </div>
  );
}

function BlogPost({ post, onBack }) {
  return (
    <main className="page-content" style={{ maxWidth: 680, margin: '0 auto' }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 20 }}>
        ← Back to The Table
      </button>

      {/* Cover */}
      <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 24, height: 280 }}>
        <img src={post.coverImg} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Meta */}
      <div style={{ marginBottom: 6 }}>
        <span className="chip chip-indigo">{post.category}</span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.25, marginBottom: 12, letterSpacing: -0.5 }}>
        {post.title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <div className={`av av-sm av-${post.authorColor}`}>{post.authorInitials}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{post.author}</div>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{post.date} · {post.readTime}</div>
        </div>
      </div>

      {/* Body (mock article content) */}
      <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--ink)', }}>
        <p style={{ marginBottom: 20, fontSize: 18, fontWeight: 500, color: 'var(--ink2)', lineHeight: 1.7 }}>
          {post.excerpt}
        </p>

        <p style={{ marginBottom: 20 }}>
          The dining landscape is shifting in ways that feel less like a trend and more like a cultural correction. After years of restaurant hype cycles, tasting menus that required a spreadsheet to book, and influencer-driven food content that optimized for the photo over the meal, people are returning to something older and more satisfying: the dinner table as a social arena.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, marginTop: 28 }}>The Host as Creative Director</h2>
        <p style={{ marginBottom: 20 }}>
          What makes the supper club format so compelling is the degree of authorship it gives the host. Unlike a restaurant, where the chef, the sommelier, the décor team, and the reservations manager are all separate roles, the home supper club collapses everything into one person's vision. The host chooses the music, sets the table, designs the menu, curates the guest list, and creates the emotional arc of the evening.
        </p>
        <p style={{ marginBottom: 20 }}>
          This is the kind of hospitality that algorithms can't replicate. It's deeply personal, often imperfect, and almost always more memorable than a three-Michelin-star experience where every variable has been engineered to within an inch of its life.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, marginTop: 28 }}>What We're Building at Tableaux</h2>
        <p style={{ marginBottom: 20 }}>
          Tableaux was built precisely for this moment. We believe the most exciting food experiences happening in 2026 aren't in restaurant dining rooms — they're in living rooms, backyard gardens, borrowed commercial kitchens, and rooftop terraces. Our platform is the infrastructure for these experiences: event creation, guest coordination, potluck management, photo sharing, and the community layer that lets you discover what your friends are hosting next.
        </p>
        <p style={{ marginBottom: 20 }}>
          The Table is where we'll share what we're learning — from food culture, emerging hosting trends, recipe deep dives, and the stories of the hosts and communities building something special through shared meals.
        </p>

        <div style={{ background: 'var(--indigo-light)', borderLeft: '4px solid var(--indigo)', padding: '16px 20px', borderRadius: '0 10px 10px 0', marginBottom: 20, fontStyle: 'italic', fontSize: 15, color: 'var(--ink)' }}>
          "The best dinner parties feel inevitable in retrospect — like the host knew exactly what the room needed, even before the guests arrived."
        </div>

        <p style={{ marginBottom: 20 }}>
          We're just getting started. Follow along, share what you're hosting, and let us know what stories you want to read next.
        </p>
      </div>
    </main>
  );
}
