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
        padding: '200px 0 160px 0',
        background: '#000000',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
      }}>
        {/* Background Video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            opacity: 1.0, /* Set to 100% full clarity as requested */
            pointerEvents: 'none'
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '850px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid var(--secondary)',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '25px',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: 'var(--secondary)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(5px)'
            }}>
              <Flame size={14} style={{ color: 'var(--secondary)' }} />
              <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>The Pride of Maharashtra</span>
            </div>
            
            <h1 
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                lineHeight: '1.25',
                marginBottom: '25px',
                textAlign: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: '#FFFFFF',
                textShadow: '0 4px 15px rgba(0,0,0,0.95), 0 0 10px rgba(212,175,55,0.1)'
              }}
            >
              परंपरेचा मान, <span className="hero-heading-premium" style={{ display: 'inline-block' }}>तिखट चवीची शान</span>
            </h1>
            
            <p 
              className="hero-subheading-premium"
              style={{
                fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
                marginBottom: '40px',
                textAlign: 'center',
                maxWidth: '700px'
              }}
            >
              अस्सल मिसळ, ताजे साहित्य आणि अविस्मरणीय चव यांचा अनोखा संगम. प्रत्येक घासात परंपरा, गुणवत्ता आणि महाराष्ट्राचा खरा स्वाद.
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '15px', 
              justifyContent: 'center'
            }}>
              <a href="#menu" className="btn btn-primary" onClick={(e) => {
                e.preventDefault();
                document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                View Full Menu
              </a>
              <button onClick={() => navigate('/order')} className="btn btn-secondary" style={{ background: 'rgba(0,0,0,0.65)', border: '2px solid var(--primary)', color: 'var(--primary)' }}>
                Order At Table (QR)
              </button>
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
      <section id="featured" style={{ padding: '100px 0', borderBottom: '1px solid rgba(212, 175, 55, 0.05)' }}>
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
      <section id="about" style={{ padding: '100px 0', borderBottom: '1px solid rgba(212, 175, 55, 0.05)' }}>
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
      <section id="reviews" style={{ padding: '100px 0', background: '#090909', borderBottom: '1px solid rgba(212, 175, 55, 0.05)' }}>
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
      <section id="contact" style={{ padding: '100px 0', borderBottom: '1px solid rgba(212, 175, 55, 0.05)' }}>
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

      {/* ================= VISIT US SECTION ================= */}
      <section id="visit" style={{ 
        padding: '100px 0', 
        background: '#070707', 
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background luxury glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-header">
            <span className="section-subtitle">Find Our Spot</span>
            <h2 className="section-title">Visit Our Flagship Haven</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '50px',
            alignItems: 'stretch'
          }} className="visit-grid">
            
            {/* 1. Brand Information Card */}
            <div className="luxury-card glass-panel" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '40px',
              border: '1px solid rgba(212, 175, 55, 0.18)',
              background: 'rgba(15, 15, 15, 0.9)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8), var(--gold-glow)'
            }}>
              <div>
                {/* Header branding with logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    padding: '3px',
                    background: '#000',
                    boxShadow: 'var(--gold-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src="/favicon.ico" 
                      alt="Baba Misal Logo" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                  <div>
                    <h3 style={{ 
                      fontFamily: 'var(--font-heading)', 
                      fontSize: '1.8rem', 
                      color: 'var(--primary)', 
                      lineHeight: '1.1',
                      fontWeight: '700'
                    }}>
                      Baba Misal
                    </h3>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      letterSpacing: '0.15em', 
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: '600'
                    }}>
                      Thane Flagship Location
                    </span>
                  </div>
                </div>

                <div className="divider" style={{ margin: '0 0 25px 0' }} />

                {/* Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Address */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <MapPin style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '3px' }} size={20} />
                    <div>
                      <h5 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        Address
                      </h5>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        ST Depot, Akruti SMC Gate No. 1,<br />
                        Opposite Royal Treat Wine and Dine,<br />
                        near Khopat, Khopat,<br />
                        Thane, Maharashtra 400601
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Phone style={{ color: 'var(--primary)', flexShrink: 0 }} size={20} />
                    <div>
                      <h5 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                        Phone Number
                      </h5>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>+91 22 4455 8899</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Mail style={{ color: 'var(--primary)', flexShrink: 0 }} size={20} />
                    <div>
                      <h5 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                        Email Address
                      </h5>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hello@babamisal.com</p>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Clock style={{ color: 'var(--primary)', flexShrink: 0 }} size={20} />
                    <div>
                      <h5 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                        Opening Hours
                      </h5>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Daily: 08:30 AM - 10:30 PM (All Days)</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--primary)" style={{ flexShrink: 0 }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <div>
                      <h5 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                        WhatsApp Contact
                      </h5>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>+91 98765 43210</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '40px' }}>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=ST+Depot,+Akruti+SMC+Gate+No.+1,+Opposite+Royal+Treat+Wine+and+Dine,+near+Khopat,+Khopat,+Thane,+Maharashtra+400601" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary" 
                  style={{ width: '100%', textTransform: 'uppercase', fontSize: '0.85rem' }}
                >
                  Open in Google Maps
                </a>
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary" 
                  style={{ 
                    width: '100%', 
                    textTransform: 'uppercase', 
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    borderColor: '#25D366',
                    color: '#25D366',
                    background: 'rgba(37, 211, 102, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(37, 211, 102, 0.15)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(37, 211, 102, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(37, 211, 102, 0.05)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* 2. Full Width Dark Google Maps Embed */}
            <div className="map-wrapper" style={{
              position: 'relative',
              borderRadius: '20px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
              minHeight: '450px',
              transition: 'var(--transition)'
            }}>
              {/* Google Maps Frame */}
              <iframe
                title="Baba Misal Location Map"
                src="https://maps.google.com/maps?q=ST%20Depot,%20Akruti%20SMC%20Gate%20No.%201,%20Opposite%20Royal%20Treat%20Wine%20and%20Dine,%20near%20Khopat,%20Khopat,%20Thane,%20Maharashtra%20400601&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  filter: 'invert(90%) hue-rotate(180deg) grayscale(100%) contrast(90%)',
                  opacity: 0.85
                }}
                allowFullScreen=""
                loading="lazy"
              />

              {/* Floating location pin marker with custom pulse gold brand logo */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -100%)',
                zIndex: 10,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* Logo wrapper */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '3px solid var(--primary)',
                  background: '#000',
                  padding: '2px',
                  boxShadow: '0 0 20px var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulseGold 2s infinite ease-in-out'
                }}>
                  <img 
                    src="/favicon.ico" 
                    alt="Map Pin Logo" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                </div>
                {/* Pointer tip */}
                <div style={{
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: '15px solid var(--primary)',
                  marginTop: '-2px',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                }} />
                {/* Pulse ring indicator underneath */}
                <div style={{
                  width: '20px',
                  height: '8px',
                  background: 'rgba(212, 175, 55, 0.4)',
                  borderRadius: '50%',
                  marginTop: '4px',
                  animation: 'spinSlow 10s linear infinite',
                  filter: 'blur(2px)'
                }} />
              </div>

              {/* Quick overlay styling */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(7,7,7,0.4) 0%, transparent 15%, transparent 85%, rgba(7,7,7,0.7) 100%)',
                pointerEvents: 'none',
                zIndex: 2
              }} />
            </div>

          </div>
        </div>

        {/* CSS Hover styling inside section */}
        <style>{`
          .map-wrapper:hover {
            border-color: var(--primary) !important;
            box-shadow: 0 20px 45px rgba(0,0,0,0.8), var(--gold-glow-strong) !important;
          }
          .map-wrapper:hover iframe {
            opacity: 0.95 !important;
          }
          @media (max-width: 768px) {
            .visit-grid {
              grid-template-columns: 1fr !important;
            }
            .map-wrapper {
              min-height: 350px !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
}
