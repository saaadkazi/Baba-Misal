import React, { useState, useMemo } from 'react';
import { User, Phone, ShoppingBag, Receipt, ChevronRight, CheckCircle2, Ticket, ArrowLeft, RotateCcw } from 'lucide-react';

export default function Order({ dishes, onAddOrder, navigate }) {
  // Customer info states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Cart state: mapping of dishId -> quantity
  const [cart, setCart] = useState({});
  
  // Successful order states
  const [checkedOut, setCheckedOut] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  
  // Filter category state inside ordering page
  const [activeCat, setActiveCat] = useState('All');
  const categories = ['All', 'Misal', 'Snacks', 'Beverages', 'Combos'];

  // Validation
  const validateForm = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = "Full Name is required";
    else if (name.length < 3) tempErrors.name = "Name must be at least 3 characters";

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.trim()) tempErrors.phone = "Phone number is required";
    else if (!phoneRegex.test(phone.replace(/[\s-+]/g, '').slice(-10))) {
      tempErrors.phone = "Enter a valid 10-digit Indian phone number";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Cart math
  const cartItems = useMemo(() => {
    const items = [];
    Object.keys(cart).forEach(id => {
      const q = cart[id];
      if (q > 0) {
        const d = dishes.find(dish => dish.id === id);
        if (d) {
          items.push({ ...d, quantity: q });
        }
      }
    });
    return items;
  }, [cart, dishes]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  }, [cartItems]);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cartItems]);

  // Quantity updates
  const updateQuantity = (dishId, delta) => {
    setCart(prev => {
      const currentQ = prev[dishId] || 0;
      const newQ = Math.max(0, currentQ + delta);
      return { ...prev, [dishId]: newQ };
    });
  };

  // Submit Order
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    // 1. Validate info
    if (!validateForm()) {
      // Scroll to error if possible
      document.getElementById('customer-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // 2. Validate Cart
    if (cartItems.length === 0) {
      alert("Please add at least one delicious dish to your basket before checking out!");
      return;
    }

    // 3. Dispatch order
    const orderDetails = onAddOrder({ name, phone }, cartItems, totalAmount, 0, totalAmount, false);
    
    setGeneratedToken(orderDetails.token);
    setCheckedOut(true);
    setCart({});
  };

  // Reset ordering flow
  const handleReset = () => {
    setName('');
    setPhone('');
    setCart({});
    setCheckedOut(false);
    setGeneratedToken(null);
    setErrors({});
  };

  // Filtered dishes for ordering catalog
  const filteredDishes = useMemo(() => {
    if (activeCat === 'All') return dishes;
    return dishes.filter(d => d.category === activeCat);
  }, [dishes, activeCat]);

  // SUCCESS TOKEN SCREEN VIEW
  if (checkedOut && generatedToken) {
    return (
      <div className="container" style={{ maxWidth: '600px', padding: '120px 20px 80px 20px' }}>
        <div className="glass-panel animate-fade-in-up" style={{
          padding: '40px 30px',
          textAlign: 'center',
          border: '2px solid var(--primary)',
          boxShadow: 'var(--gold-glow-strong)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Confetti Background Glimmer */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'var(--primary)',
            filter: 'blur(100px)',
            opacity: 0.1,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'var(--secondary)',
            filter: 'blur(100px)',
            opacity: 0.1,
            pointerEvents: 'none'
          }} />

          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '2px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            color: 'var(--primary)',
            animation: 'pulseGold 2s infinite'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', marginBottom: '10px' }}>
            Feast Scheduled!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '30px' }}>
            Your order has been routed directly to the kitchen hearth. Please showcase this token ticket to your server or counter cashier to retrieve your sizzling meal.
          </p>

          {/* Luxury Token Ticket Display */}
          <div style={{
            background: 'linear-gradient(135deg, #1f1d18 0%, #12110e 100%)',
            border: '2px dashed var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '30px 20px',
            marginBottom: '35px',
            position: 'relative',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
          }}>
            {/* Ticket side notches */}
            <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', background: '#0F0F0F', borderRadius: '50%', borderRight: '2px dashed var(--primary)' }} />
            <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', background: '#0F0F0F', borderRadius: '50%', borderLeft: '2px dashed var(--primary)' }} />

            <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--secondary)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              OFFICIAL SERVICE TICKET
            </span>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: 'var(--primary)',
              fontSize: '3.2rem',
              fontWeight: '800',
              lineHeight: 1,
              fontFamily: 'var(--font-heading)',
              margin: '10px 0'
            }}>
              <Ticket size={40} />
              <span>#{generatedToken}</span>
            </div>

            <div style={{ borderTop: '1px solid rgba(212,175,55,0.15)', marginTop: '20px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Dine-In Queue</span>
              <span>Status: <strong style={{ color: 'var(--primary)' }}>Preparing</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ width: '100%' }}>
              Back to Home
            </button>
            <button onClick={handleReset} className="btn btn-secondary" style={{ width: '100%' }}>
              <RotateCcw size={16} /> Place New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '120px 0 80px 0' }}>
      <div className="container">
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}
          >
            <ArrowLeft size={16} /> Return to Public Website
          </button>
        </div>

        <div className="section-header" style={{ marginBottom: '40px' }}>
          <span className="section-subtitle">Contactless Self-Service</span>
          <h2 className="section-title">QR Tableside Ordering</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '10px auto 0 auto' }}>
            Enter your credentials, tap the dishes you'd like to order, and get your service token instantly!
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'flex-start'
        }}>
          
          {/* LEFT COLUMN: REGISTRATION & MENU CATALOG */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* 1. Customer Info Form */}
            <div id="customer-form" className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <User size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>1. Customer Credentials</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                    }}
                    className="input-field"
                    style={{ borderColor: errors.name ? '#d32f2f' : 'rgba(255,255,255,0.1)' }}
                  />
                  {errors.name && <span style={{ color: '#f44336', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name}</span>}
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                    }}
                    className="input-field"
                    style={{ borderColor: errors.phone ? '#d32f2f' : 'rgba(255,255,255,0.1)' }}
                  />
                  {errors.phone && <span style={{ color: '#f44336', fontSize: '0.75rem', marginTop: '4px' }}>{errors.phone}</span>}
                </div>
              </div>
            </div>

            {/* 2. Menu Catalog */}
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>2. Select Dishes</h3>
              </div>

              {/* Category Mini Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '12px',
                marginBottom: '20px',
                scrollbarWidth: 'thin'
              }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      flexShrink: 0,
                      background: activeCat === cat ? 'var(--primary)' : '#1E1E1E',
                      color: activeCat === cat ? '#000000' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Catalog List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredDishes.map(dish => {
                  const qty = cart[dish.id] || 0;
                  return (
                    <div 
                      key={dish.id} 
                      style={{
                        display: 'flex',
                        gap: '12px',
                        background: '#161616',
                        border: '1px solid rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px',
                        alignItems: 'center',
                        position: 'relative'
                      }}
                    >
                      <img 
                        src={dish.image} 
                        alt={dish.name} 
                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }} 
                      />
                      
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{dish.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3', margin: '4px 0' }}>
                          {dish.description.slice(0, 50)}...
                        </p>
                        <span style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 'bold' }}>₹{dish.price}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#222',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <button 
                          onClick={() => updateQuantity(dish.id, -1)}
                          style={{ color: qty > 0 ? 'var(--primary)' : '#555', fontWeight: 'bold', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', minWidth: '16px', textAlign: 'center' }}>
                          {qty}
                        </span>
                        <button 
                          onClick={() => updateQuantity(dish.id, 1)}
                          style={{ color: 'var(--primary)', fontWeight: 'bold', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RECEIPT & CHECKOUT */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(212, 175, 55, 0.15)', position: 'sticky', top: '120px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <Receipt size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>3. Review Ticket</h3>
            </div>

            {cartItems.length > 0 ? (
              <div>
                {/* Thermal Invoice Ticket Style */}
                <div style={{
                  background: '#FFFFFF',
                  color: '#000000',
                  borderRadius: '6px',
                  padding: '24px',
                  fontFamily: 'monospace',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                  position: 'relative'
                }}>
                  {/* Decorative jagged paper top/bottom */}
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    left: 0,
                    width: '100%',
                    height: '8px',
                    backgroundImage: 'linear-gradient(-45deg, #1A1A1A 4px, transparent 0), linear-gradient(45deg, #1A1A1A 4px, transparent 0)',
                    backgroundSize: '8px 8px',
                    backgroundRepeat: 'repeat-x'
                  }} />

                  <div style={{ textAlign: 'center', borderBottom: '1px dashed #000000', paddingBottom: '12px', marginBottom: '15px' }}>
                    <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>BABA MISAL</h4>
                    <p style={{ fontSize: '0.75rem' }}>Tableside self-checkout receipt</p>
                    <p style={{ fontSize: '0.75rem' }}>Date: {new Date().toLocaleDateString()}</p>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px dashed #000' }}>
                        <th style={{ textAlign: 'left', paddingBottom: '6px' }}>DISH</th>
                        <th style={{ textAlign: 'center', paddingBottom: '6px' }}>QTY</th>
                        <th style={{ textAlign: 'right', paddingBottom: '6px' }}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map(item => (
                        <tr key={item.id}>
                          <td style={{ padding: '6px 0', textAlign: 'left', fontWeight: 'bold' }}>{item.name}</td>
                          <td style={{ padding: '6px 0', textAlign: 'center' }}>x{item.quantity}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ borderTop: '1px dashed #000000', marginTop: '15px', paddingTop: '15px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>SUBTOTAL</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>GST (5%)</span>
                      <span style={{ color: '#555' }}>INCLUDED</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <span>NET AMOUNT</span>
                      <span>₹{totalAmount}</span>
                    </div>
                  </div>

                  {name && (
                    <div style={{ borderTop: '1px dashed #000000', marginTop: '15px', paddingTop: '12px', fontSize: '0.75rem', color: '#333' }}>
                      <p>GUEST: {name.toUpperCase()}</p>
                      {phone && <p>PHONE: {phone}</p>}
                    </div>
                  )}

                  {/* Decorative receipt bottom */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: 0,
                    width: '100%',
                    height: '8px',
                    backgroundImage: 'linear-gradient(-45deg, #1A1A1A 4px, transparent 0), linear-gradient(45deg, #1A1A1A 4px, transparent 0)',
                    backgroundSize: '8px 8px',
                    backgroundRepeat: 'repeat-x',
                    transform: 'rotate(180deg)'
                  }} />
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button 
                    onClick={handlePlaceOrder}
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                  >
                    Confirm & Place Order <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)'
              }}>
                <ShoppingBag size={32} style={{ color: '#444', marginBottom: '15px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your ticket is currently empty.</p>
                <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '6px' }}>Increase quantities on any catalog item on the left to add items to your bill.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
