import React, { useState, useMemo } from 'react';
import { Star, MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Sparkles, Flame, Search } from 'lucide-react';

export default function Home({ dishes, reviews, onAddReview, navigate }) {
  // Menu selection & search states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Contact form states
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Filtered categories derived from data
  const categories = ['All', 'Misal', 'Snacks', 'Beverages', 'Combos', 'Special Dishes'];

  // Filter dishes based on search query and category
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            dish.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dishes, selectedCategory, searchQuery]);

  // Featured popular dishes (limit to 3)
  const featuredDishes = useMemo(() => {
    return dishes.slice(0, 3);
  }, [dishes]);

  // Handle Review Submission
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) return;

    onAddReview({
      name: reviewName,
      review: reviewText,
      rating: reviewRating
    });

    setReviewName('');
    setReviewText('');
    setReviewRating(5);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 5000);
  };

  // Handle Contact Submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) return;
    
    // Demo submission logic
    setContactSubmitted(true);
    setContactName('');
    setContactPhone('');
    setContactMessage('');
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  return (
    <div className="animate-fade-in">
      {/* ================= HERO SECTION ================= */}
      <section className="hero-section" style={{
        position: 'relative',
        padding: '160px 0 100px 0',
        background: 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.08) 0%, rgba(15, 15, 15, 0) 70%)',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(212, 175, 55, 0.05)'
      }}>
        {/* Floating background glowing amber balls */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'var(--gradient-gold-orange)',
          filter: 'blur(150px)',
          opacity: 0.1,
          top: '20%',
          right: '5%',
          pointerEvents: 'none'
        }} />
        
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div style={{ maxWidth: '580px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 107, 0, 0.1)',
                border: '1px solid rgba(255, 107, 0, 0.2)',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                marginBottom: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--secondary)'
              }}>
                <Flame size={14} style={{ color: 'var(--secondary)' }} />
                <span>The Pride of Maharashtra</span>
              </div>
              
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                lineHeight: '1.1',
                marginBottom: '20px',
                fontFamily: 'var(--font-heading)'
              }}>
                Where <span className="text-gradient">Heritage</span> Meets <span className="text-gradient">Spicy Elegance</span>
              </h1>
              
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                color: 'var(--text-muted)',
                marginBottom: '35px',
                fontWeight: '300'
              }}>
                Step into a premium culinary journey with Baba Misal. Savor the crisp textures of artisanal sprouts, roasted indigenous spice blends, and melted buttery Pav served in a high-end, contemporary ambiance.
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                <a href="#menu" className="btn btn-primary" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  View Full Menu
                </a>
                <button onClick={() => navigate('/order')} className="btn btn-secondary">
                  Order At Table (QR)
                </button>
              </div>
            </div>

            {/* Custom Premium Food Mockup (supports future 3D assets) */}
            <div style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* Spinning decorative gold background ring */}
              <div style={{
                position: 'absolute',
                width: '100%',
                maxWidth: '420px',
                aspectRatio: '1',
                border: '2px dashed rgba(212, 175, 55, 0.12)',
                borderRadius: '50%',
                animation: 'spinSlow 40s linear infinite',
                pointerEvents: 'none'
              }} />
              
              {/* Golden Outer Glow */}
              <div style={{
                position: 'absolute',
                width: '80%',
                maxWidth: '340px',
                aspectRatio: '1',
                borderRadius: '50%',
                boxShadow: 'var(--gold-glow-strong)',
                opacity: 0.35,
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              {/* Main Food Image with premium border frame */}
              <div style={{
                position: 'relative',
                width: '85%',
                maxWidth: '360px',
                aspectRatio: '1',
                borderRadius: '50%',
                border: '4px solid rgba(212, 175, 55, 0.25)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                overflow: 'hidden',
                transition: 'var(--transition)'
              }} className="hero-img-container">
                <img 
                  src="https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600" 
                  alt="Premium Baba Misal" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scale(1.05)',
                    transition: 'transform 0.8s ease'
                  }}
                />
                
                {/* Floating Heat Gradient overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,15,15,0.7) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }} />
              </div>

              {/* Floating review tag */}
              <div className="glass-panel" style={{
                position: 'absolute',
                bottom: '10%',
                left: '-5%',
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid rgba(212,175,55,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                maxWidth: '220px'
              }}>
                <div style={{
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000',
                  fontWeight: 'bold'
                }}>★</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>4.9 Stars Rating</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Over 2000+ local reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BRAND HIGHLIGHTS ================= */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid rgba(212, 175, 55, 0.05)', background: '#090909' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              { icon: <Sparkles size={24} />, title: "Premium Quality", desc: "Crafted with 100% natural, premium oils and freshly selected raw sprouts." },
              { icon: <Flame size={24} />, title: "Authentic Ghati Spices", desc: "Sourced directly from farmers in Kolhapur and dry roasted in-house." },
              { icon: <ShieldCheck size={24} />, title: "Hyper-Hygienic POS", desc: "Pure marble counters, automated contactless QR menus, and clean kitchens." }
            ].map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '15px',
                padding: '15px',
              }}>
                <div style={{
                  color: 'var(--primary)',
                  background: 'rgba(212, 175, 55, 0.07)',
                  borderRadius: '12px',
                  width: '50px',
                  height: '50px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(212, 175, 55, 0.15)'
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', fontWeight: '600' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED DISHES ================= */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid rgba(212, 175, 55, 0.05)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Exquisite Creations</span>
            <h2 className="section-title">Our Chef's Masterpieces</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {featuredDishes.map((dish) => (
              <div key={dish.id} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  position: 'relative'
                }}>
                  <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="badge badge-gold" style={{ position: 'absolute', top: '15px', right: '15px', backdropFilter: 'blur(5px)' }}>
                    {dish.category}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', fontFamily: 'var(--font-heading)' }}>{dish.name}</h3>
                  <span style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: '700' }}>₹{dish.price}</span>
                </div>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flexGrow: 1 }}>
                  {dish.description}
                </p>

                <button 
                  onClick={() => navigate('/order')}
                  className="btn btn-secondary" 
                  style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}
                >
                  Order Online
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FULL MENU SECTION ================= */}
      <section id="menu" style={{ padding: '100px 0', background: '#090909', borderBottom: '1px solid rgba(212, 175, 55, 0.05)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Exquisite Flavors</span>
            <h2 className="section-title">The Complete Culinary Catalog</h2>
          </div>

          {/* Filtering and Search Controls */}
          <div className="glass-panel" style={{
            padding: '20px',
            marginBottom: '40px',
            border: '1px solid rgba(212, 175, 55, 0.1)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Category Tabs */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'var(--transition)',
                    background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedCategory === cat ? '#000000' : 'var(--text-muted)',
                    border: selectedCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '320px',
            }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#555'
              }} />
              <input
                type="text"
                placeholder="Search premium dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{
                  width: '100%',
                  paddingLeft: '44px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.9rem',
                  height: '42px'
                }}
              />
            </div>
          </div>

          {/* Menu Grid */}
          {filteredDishes.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '30px'
            }}>
              {filteredDishes.map((dish) => (
                <div key={dish.id} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    marginBottom: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    position: 'relative'
                  }}>
                    <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="badge badge-orange" style={{ position: 'absolute', top: '15px', right: '15px' }}>
                      {dish.category}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>{dish.name}</h3>
                    <span style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: '700' }}>₹{dish.price}</span>
                  </div>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', flexGrow: 1 }}>
                    {dish.description}
                  </p>

                  <button 
                    onClick={() => navigate('/order')}
                    className="btn btn-secondary" 
                    style={{ width: '100%', fontSize: '0.75rem', padding: '8px' }}
                  >
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              border: '1px dashed rgba(212, 175, 55, 0.2)',
              borderRadius: 'var(--radius-md)'
            }}>
              <p style={{ color: 'var(--text-muted)' }}>No items found matching your filters.</p>
              <button 
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                style={{ color: 'var(--primary)', fontWeight: 'bold', marginTop: '10px', textDecoration: 'underline' }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= ABOUT US ================= */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid rgba(212, 175, 55, 0.05)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '60px',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                border: '2px solid var(--primary)',
                top: '-20px',
                left: '-20px',
                width: '100%',
                height: '100%',
                borderRadius: 'var(--radius-lg)',
                pointerEvents: 'none'
              }} />
              <img 
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800" 
                alt="Cooking spices" 
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.6)',
                  position: 'relative',
                  zIndex: 1,
                  display: 'block'
                }}
              />
            </div>
            
            <div>
              <span className="section-subtitle" style={{ textAlign: 'left', display: 'block' }}>Our Legacy</span>
              <h2 className="section-title" style={{ textAlign: 'left', display: 'block', paddingBottom: '12px' }}>A Tradition of Spice & Splendor</h2>
              
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontWeight: '300' }}>
                For generations, the art of perfecting the perfect spicy gravy - the <strong>Kat</strong> - has been a closely guarded secret. At Baba Misal, we have refined this historic Maharashtrian culinary gem to offer a fine dining experience that values heritage without compromising on sophistication.
              </p>
              
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontWeight: '300' }}>
                We dry roast our indigenous spices over cast-iron pans and crush them slowly using custom pestles. This slow-release heat infuses our lentils with a deep, rich smokiness. Cooked in pristine settings and presented elegantly, we aim to bring the legendary flavors of rural Maharashtra onto a luxurious global platform.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <h4 style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 'bold' }}>100%</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pure cold-pressed peanut oil used</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 'bold' }}>18+</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Secret ingredients in our custom Ghati Masala</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CUSTOMER REVIEWS ================= */}
      <section style={{ padding: '100px 0', background: '#090909', borderBottom: '1px solid rgba(212, 175, 55, 0.05)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Gastronome Feedback</span>
            <h2 className="section-title">Endorsements from Food Lovers</h2>
          </div>

          {/* Testimonial Feed */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginBottom: '60px'
          }}>
            {reviews.map((rev) => (
              <div key={rev.id} className="luxury-card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.01)'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '2px', color: 'var(--primary)', marginBottom: '15px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < Math.round(rev.rating) ? 'var(--primary)' : 'none'} 
                        style={{ color: 'var(--primary)' }}
                      />
                    ))}
                  </div>
                  <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    "{rev.review}"
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text)' }}>{rev.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Review Submission Form */}
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '30px 40px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                Share Your Experience
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '25px' }}>
                Your insights shape our commitment to culinary excellence.
              </p>

              {reviewSubmitted && (
                <div style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  Thank you! Your testimonial has been posted locally in our reviews queue.
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. Rahul Deshpande"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Rating Score</span>
                    <span style={{ color: 'var(--secondary)' }}>{reviewRating} Stars</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', padding: '6px 0' }}>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const ratingValue = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(ratingValue)}
                          onMouseEnter={() => setHoverRating(ratingValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Star
                            size={28}
                            fill={ratingValue <= (hoverRating || reviewRating) ? 'var(--primary)' : 'none'}
                            style={{ transition: 'var(--transition)' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Review Testimony</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe the spice depth, Pav texture, speed of service..."
                    className="input-field"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Submit Testimony
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT US ================= */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid rgba(212, 175, 55, 0.05)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Connect With Us</span>
            <h2 className="section-title">Inquiries & Reservations</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '50px'
          }}>
            {/* Contact Details & Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                Reach Out Directly
              </h3>
              <p style={{ color: 'var(--text-muted)', fontWeight: '300' }}>
                Planning a corporate feast, a large family gather, or want to import our authentic spices? Get in touch with the management team.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <MapPin style={{ color: 'var(--primary)' }} />
                  <div>
                    <h5 style={{ fontWeight: '600' }}>Location Address</h5>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      101 Golden Accent Arcade, FC Road, Shivaji Nagar, Pune - 411004
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <Phone style={{ color: 'var(--primary)' }} />
                  <div>
                    <h5 style={{ fontWeight: '600' }}>Phone Hotline</h5>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>+91 20 4455 6677 / +91 98765 43210</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <Mail style={{ color: 'var(--primary)' }} />
                  <div>
                    <h5 style={{ fontWeight: '600' }}>Electronic Mail</h5>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>royalfeast@babamisal.com</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <Clock style={{ color: 'var(--primary)' }} />
                  <div>
                    <h5 style={{ fontWeight: '600' }}>Opening Hours</h5>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Daily: 08:30 AM - 10:30 PM (All Days)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="luxury-card">
              {contactSubmitted && (
                <div style={{
                  background: 'rgba(255, 107, 0, 0.15)',
                  border: '1px solid var(--secondary)',
                  color: 'var(--secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  Message dispatched successfully! Our manager will ring you shortly.
                </div>
              )}

              <form onSubmit={handleContactSubmit}>
                <div className="input-group">
                  <label className="input-label">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your name"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 98230 45678"
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Message Content</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your requirement (catering order, franchise query...)"
                    className="input-field"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
