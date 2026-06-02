import React, { useState, useEffect } from 'react';
import { db } from './services/storage';
import Home from './components/Home';
import Order from './components/Order';
import Admin from './components/Admin';
import { Flame, Menu, X, ArrowUpRight, Shield, Award } from 'lucide-react';

export default function App() {
  // Client-side lightweight routing state
  const [route, setRoute] = useState(window.location.pathname || '/');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Global cache states loaded from storage
  const [dishes, setDishes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fetch initial data on mount
  useEffect(() => {
    setDishes(db.getDishes());
    setReviews(db.getReviews());
    setOrders(db.getOrders());

    // Listen to browser forward/backward buttons
    const handlePopState = () => {
      setRoute(window.location.pathname);
      window.scrollTo(0, 0);
    };

    // Listen to scroll events for header styling
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Custom Router navigation function
  const navigate = (path) => {
    window.history.pushState(null, '', path);
    setRoute(path);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // State Event Bridge Functions (updates local state + storage instantly)
  const handleSaveDish = (dish) => {
    const updated = db.saveDish(dish);
    setDishes(updated);
  };

  const handleDeleteDish = (id) => {
    const updated = db.deleteDish(id);
    setDishes(updated);
  };

  const handleCreateOrder = (customerDetails, items, total, discount, finalTotal, isPOS = false) => {
    const newOrder = db.addOrder(customerDetails, items, total, discount, finalTotal, isPOS);
    setOrders(db.getOrders());
    return newOrder;
  };

  const handleUpdateOrderStatus = (id, status) => {
    db.updateOrderStatus(id, status);
    setOrders(db.getOrders());
  };

  const handleAddReview = (review) => {
    db.addReview(review);
    setReviews(db.getReviews());
  };

  // Render the current route view
  const renderView = () => {
    if (route === '/order') {
      return (
        <Order 
          dishes={dishes} 
          onAddOrder={handleCreateOrder} 
          navigate={navigate} 
        />
      );
    }
    
    if (route.startsWith('/admin')) {
      return (
        <Admin 
          dishes={dishes} 
          reviews={reviews} 
          orders={orders} 
          onSaveDish={handleSaveDish} 
          onDeleteDish={handleDeleteDish} 
          onAddOrder={handleCreateOrder}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          navigate={navigate} 
        />
      );
    }
    
    // Default fallback: '/' Public Home Page
    return (
      <Home 
        dishes={dishes} 
        reviews={reviews} 
        onAddReview={handleAddReview} 
        navigate={navigate} 
      />
    );
  };

  // Sections on the home page for navigation anchors
  const navAnchors = [
    { label: 'Featured', targetId: 'featured', offset: 120 },
    { label: 'Menu Catalog', targetId: 'menu', offset: 90 },
    { label: 'Our Story', targetId: 'about', offset: 100 },
    { label: 'Reviews', targetId: 'reviews', offset: 100 },
    { label: 'Inquiries', targetId: 'contact', offset: 100 },
  ];

  const handleAnchorClick = (targetId) => {
    setMobileMenuOpen(false);
    if (route !== '/') {
      navigate('/');
      // Wait for navigation render before scrolling
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ================= STICKY HEADER ================= */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'var(--transition)',
        background: scrolled ? 'rgba(15, 15, 15, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(212, 175, 55, 0.15)' : '1px solid transparent',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
        height: '80px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          
          {/* Logo Branding */}
          <div 
            onClick={() => navigate('/')} 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              background: 'var(--gradient-gold-orange)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              boxShadow: 'var(--orange-glow)'
            }}>
              <Flame size={20} fill="#000" />
            </div>
            <div>
              <h1 style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.45rem', 
                lineHeight: '1', 
                color: 'var(--primary)',
                letterSpacing: '0.02em',
                fontWeight: '800'
              }}>
                BABA MISAL
              </h1>
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Traditional Gold Standard
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <span 
              onClick={() => navigate('/')} 
              style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                cursor: 'pointer', 
                color: route === '/' ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'var(--transition)'
              }}
            >
              Home
            </span>

            {/* Anchors on Home Page */}
            {navAnchors.map(anchor => (
              <span
                key={anchor.targetId}
                onClick={() => handleAnchorClick(anchor.targetId)}
                style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)' }}
                className="nav-link-hover"
              >
                {anchor.label}
              </span>
            ))}
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Admin shortcut badge */}
            <button 
              onClick={() => navigate('/admin')} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: route.startsWith('/admin') ? 'var(--primary)' : 'var(--text-muted)',
                background: 'rgba(255,255,255,0.03)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
                fontWeight: '600'
              }}
              className="admin-badge-btn"
            >
              <Shield size={14} style={{ color: route.startsWith('/admin') ? 'var(--primary)' : '#777' }} />
              <span className="admin-badge-txt">Admin</span>
            </button>

            {/* Floating QR Order button */}
            <button 
              onClick={() => navigate('/order')} 
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.78rem', display: 'inline-flex' }}
            >
              Order Online <ArrowUpRight size={14} />
            </button>

            {/* Mobile Menu Burger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none', color: 'var(--text)', cursor: 'pointer' }}
              className="mobile-toggle-btn"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE NAVIGATION MENU ================= */}
      {mobileMenuOpen && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 15, 15, 0.98)',
          backdropFilter: 'blur(20px)',
          zIndex: 49,
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 30px',
          gap: '25px',
          borderTop: '1px solid rgba(212, 175, 55, 0.1)'
        }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ fontSize: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: route === '/' ? 'var(--primary)' : 'var(--text)' }}
          >
            Home
          </button>
          
          {navAnchors.map(anchor => (
            <button
              key={anchor.targetId}
              onClick={() => handleAnchorClick(anchor.targetId)}
              style={{ fontSize: '1.2rem', textAlign: 'left', color: 'var(--text-muted)' }}
            >
              {anchor.label}
            </button>
          ))}
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              onClick={() => navigate('/admin')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: 'var(--text-muted)' }}
            >
              <Shield size={18} /> Admin Dashboard Terminal
            </button>
            
            <button 
              onClick={() => navigate('/order')} 
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Order Online (QR At Table)
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN APPLICATION ROUTER WINDOW ================= */}
      <main style={{ flexGrow: 1 }}>
        {renderView()}
      </main>

      {/* ================= PUBLIC FOOTER (ONLY ON HOME PAGE) ================= */}
      {route === '/' && (
        <footer style={{
          background: '#070707',
          borderTop: '1px solid rgba(212, 175, 55, 0.1)',
          padding: '60px 0 30px 0',
          fontSize: '0.9rem'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '45px',
              marginBottom: '40px'
            }}>
              {/* Brand Col */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <Flame size={22} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', fontSize: '1.3rem' }}>
                    BABA MISAL
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                  Bringing the timeless, bold, spicy, and buttery textures of rural Maharashtra straight onto a premium dining canvas.
                </p>
              </div>

              {/* Quick Links Col */}
              <div>
                <h4 style={{ color: 'var(--text)', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  Quick Navigation
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
                  <li>
                    <span onClick={() => navigate('/')} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} className="footer-link">
                      Home Page
                    </span>
                  </li>
                  <li>
                    <span onClick={() => navigate('/order')} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} className="footer-link">
                      Tableside QR Ordering
                    </span>
                  </li>
                  <li>
                    <span onClick={() => navigate('/admin')} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} className="footer-link">
                      Admin Portal
                    </span>
                  </li>
                </ul>
              </div>

              {/* Contact Col */}
              <div>
                <h4 style={{ color: 'var(--text)', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  Contact Information
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
                  FC Road, Shivaji Nagar, Pune, MH, IN
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
                  Phone: +91 20 4455 6677
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Email: hello@babamisal.com
                </p>
              </div>

              {/* Accolades Col */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(212,175,55,0.05)',
                  border: '1px solid rgba(212,175,55,0.12)',
                  padding: '10px 14px',
                  borderRadius: '10px'
                }}>
                  <Award size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ISO 22000 Certified</h5>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Highest Gold Grade Food Hygiene standards</p>
                  </div>
                </div>
              </div>

            </div>

            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '20px',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-dark)'
            }}>
              &copy; {new Date().getFullYear()} Baba Misal Premium Restaurant Systems. Developed as a High-End frontend demonstration. All rights reserved.
            </div>
          </div>
        </footer>
      )}

      {/* Styled helper CSS rules specifically for App component header and responsive styling */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: block !important;
          }
          .admin-sidebar {
            width: 70px !important;
            padding: 20px 8px !important;
          }
          .admin-sidebar button span, 
          .admin-sidebar div h3, 
          .admin-sidebar div span, 
          .admin-sidebar button {
            text-align: center;
          }
          .admin-sidebar button span, 
          .admin-sidebar div h3, 
          .admin-sidebar div span {
            display: none !important;
          }
          .admin-content-area {
            padding-left: 90px !important;
          }
          .admin-badge-txt {
            display: none !important;
          }
          .admin-badge-btn {
            padding: 6px !important;
          }
        }
        
        .nav-link-hover:hover, .footer-link:hover {
          color: var(--primary) !important;
        }
        .table-row-hover:hover {
          background: rgba(255,255,255,0.02) !important;
        }
      `}</style>
    </div>
  );
}
