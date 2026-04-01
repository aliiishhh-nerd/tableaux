import React, { useState, useEffect } from 'react';
import { BLOG_POSTS } from '../data/seed';

const CATEGORIES = ['All', 'Supper Club Culture', 'Host Guide', 'Natural Wine', 'Recipe', 'Fermentation'];

// Blog is fully public — no login required
export default function BlogPage() {
  const [category, setCategory] = useState('All');
  const [reading, setReading] = useState(null);

  // Support direct URL sharing: /blog?post=slug
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('post');
    if (slug) {
      const post = BLOG_POSTS.find(p => p.id === slug || p.slug === slug);
      if (post) setReading(post);
    }
  }, []);

  // Update URL when reading a post (makes it shareable + crawlable)
  useEffect(() => {
    if (reading) {
      const slug = reading.slug || reading.id;
      window.history.replaceState({}, '', `/blog?post=${slug}`);
      document.title = `${reading.title} — Fork & Story by Tableaux`;
    } else {
      window.history.replaceState({}, '', '/blog');
      document.title = 'Fork & Story — Tableaux';
    }
    return () => { document.title = 'Tableaux — Social Dining'; };
  }, [reading]);

  const featured = BLOG_POSTS.find(p => p.featured);
  const rest = BLOG_POSTS.filter(p => !p.featured);
  const filtered = category === 'All' ? rest : rest.filter(p => p.category === category);

  if (reading) return (
    <BlogPost
      post={reading}
      onBack={() => setReading(null)}
    />
  );

  return (
    <main className="page-content">
      {/* Featured */}
      {featured && (
        <div className="blog-featured" onClick={() => setReading(featured)} style={{ cursor: 'pointer' }}>
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
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

      {/* Contributor CTA */}
      <ContributorCTA />
    </main>
  );
}

function ContributorCTA() {
  return (
    <div style={{
      marginTop: 48,
      padding: '32px 28px',
      background: 'linear-gradient(135deg, #1A1A2E, #2D2550)',
      borderRadius: 'var(--r-lg)',
      textAlign: 'center',
      color: 'white',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>✍️</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, color: 'white' }}>
        Write for Fork & Story
      </h2>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px' }}>
        Are you a host, chef, or food writer with a story to tell? We publish pieces on supper club culture, recipes, natural wine, and the art of hosting. Pitch us.
      </p>
      <a
        href="mailto:editorial@tableaux.app?subject=Fork %26 Story Contributor Pitch"
        className="btn btn-primary"
        style={{ display: 'inline-block', padding: '10px 24px', fontSize: 14, textDecoration: 'none', background: 'var(--indigo)', borderRadius: 8 }}
      >
        Pitch a story →
      </a>
    </div>
  );
}

function BlogCard({ post, onClick }) {
  return (
    <div className="blog-card" onClick={onClick} style={{ cursor: 'pointer' }}>
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
  const postUrl = `${window.location.origin}/blog?post=${post.slug || post.id}`;

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.excerpt, url: postUrl });
    } else {
      navigator.clipboard?.writeText(postUrl).catch(() => {});
      window.alert('Link copied to clipboard!');
    }
  }

  return (
    <main className="page-content" style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* SEO meta via document.head manipulation */}
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 20 }}>
        ← Back to Fork & Story
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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{post.author}</div>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{post.date} · {post.readTime}</div>
        </div>
        {/* Share button */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleShare}
          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
        >
          🔗 Share
        </button>
      </div>

      {/* Body */}
      <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--ink)' }}>
        <p style={{ marginBottom: 20, fontSize: 18, fontWeight: 500, color: 'var(--ink2)', lineHeight: 1.7 }}>
          {post.excerpt}
        </p>
        <p style={{ marginBottom: 20 }}>
          The dining landscape is shifting in ways that feel less like a trend and more like a cultural correction. After years of restaurant hype cycles, tasting menus that required a spreadsheet to book, and influencer-driven food content that optimized for the photo over the meal, people are returning to something older and more satisfying: the dinner table as a social arena.
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, marginTop: 28 }}>The host as creative director</h2>
        <p style={{ marginBottom: 20 }}>
          What makes the supper club format so compelling is the degree of authorship it gives the host. Unlike a restaurant, where the chef, the sommelier, the décor team, and the reservations manager are all separate roles, the home supper club collapses everything into one person's vision.
        </p>
        <p style={{ marginBottom: 20 }}>
          This is the kind of hospitality that algorithms can't replicate. It's deeply personal, often imperfect, and almost always more memorable than a three-Michelin-star experience where every variable has been engineered to within an inch of its life.
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, marginTop: 28 }}>What we're building at Tableaux</h2>
        <p style={{ marginBottom: 20 }}>
          Tableaux was built precisely for this moment. We believe the most exciting food experiences happening right now aren't in restaurant dining rooms — they're in living rooms, backyard gardens, borrowed commercial kitchens, and rooftop terraces.
        </p>
        <div style={{ background: 'var(--indigo-light)', borderLeft: '4px solid var(--indigo)', padding: '16px 20px', borderRadius: '0 10px 10px 0', marginBottom: 20, fontStyle: 'italic', fontSize: 15, color: 'var(--ink)' }}>
          "The best dinner parties feel inevitable in retrospect — like the host knew exactly what the room needed, even before the guests arrived."
        </div>
        <p style={{ marginBottom: 20 }}>
          We're just getting started. Follow along, share what you're hosting, and let us know what stories you want to read next.
        </p>
      </div>

      {/* Share footer */}
      <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--ink2)' }}>Enjoyed this story?</div>
        <button className="btn btn-primary btn-sm" onClick={handleShare}>🔗 Share this post</button>
      </div>

      {/* Contributor CTA at bottom of every post */}
      <div style={{ marginTop: 40 }}>
        <ContributorCTA />
      </div>
    </main>
  );
}


