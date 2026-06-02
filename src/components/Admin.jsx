import React, { useState, useMemo } from 'react';
import { 
  Lock, LayoutDashboard, Utensils, ReceiptText, LogOut, 
  TrendingUp, ShoppingBag, Plus, Edit2, Trash2, Search, 
  Check, X, FileSpreadsheet, DollarSign, Calendar, RefreshCw 
} from 'lucide-react';

export default function Admin({ 
  dishes, 
  reviews, 
  orders, 
  onSaveDish, 
  onDeleteDish, 
  onAddOrder, 
  onUpdateOrderStatus, 
  navigate 
}) {
  // Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active view: 'dashboard', 'menu', 'billing'
  const [activeTab, setActiveTab] = useState('dashboard');

  // ================= ADMIN LOGIN SYSTEM =================
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password credentials.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  // ================= MENU MANAGEMENT STATES =================
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCat, setMenuFilterCat] = useState('All');
  
  // Add/Edit forms
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Misal');
  const [dishImage, setDishImage] = useState('');

  // Delete modal confirmation
  const [deletingDishId, setDeletingDishId] = useState(null);

  // Filter categories
  const categories = ['Misal', 'Snacks', 'Beverages', 'Combos', 'Special Dishes'];

  const filteredDishes = useMemo(() => {
    return dishes.filter(d => {
      const matchCat = menuFilterCat === 'All' || d.category === menuFilterCat;
      const matchQuery = d.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          d.description.toLowerCase().includes(menuSearch.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [dishes, menuFilterCat, menuSearch]);

  const openAddForm = () => {
    setEditingDish(null);
    setDishName('');
    setDishDesc('');
    setDishPrice('');
    setDishCategory('Misal');
    setDishImage('');
    setShowDishForm(true);
  };

  const openEditForm = (dish) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishDesc(dish.description);
    setDishPrice(dish.price);
    setDishCategory(dish.category);
    setDishImage(dish.image);
    setShowDishForm(true);
  };

  const handleSaveDishSubmit = (e) => {
    e.preventDefault();
    if (!dishName.trim() || !dishPrice) return;

    onSaveDish({
      id: editingDish?.id || null,
      name: dishName,
      description: dishDesc,
      price: parseFloat(dishPrice),
      category: dishCategory,
      image: dishImage.trim() || 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600'
    });

    setShowDishForm(false);
    setEditingDish(null);
  };

  const confirmDeleteDish = (id) => {
    setDeletingDishId(id);
  };

  const handleDeleteExecute = () => {
    if (deletingDishId) {
      onDeleteDish(deletingDishId);
      setDeletingDishId(null);
    }
  };

  // ================= BILLING (POS) SYSTEM STATES =================
  const [billingCart, setBillingCart] = useState({});
  const [billingDiscount, setBillingDiscount] = useState('');
  const [billingCustomerName, setBillingCustomerName] = useState('Walk-In Guest');
  const [billingCustomerPhone, setBillingCustomerPhone] = useState('9999999999');
  const [billingSearch, setBillingSearch] = useState('');
  const [billingActiveCat, setBillingActiveCat] = useState('All');
  const [billingSuccessDetails, setBillingSuccessDetails] = useState(null);

  const billingFilteredDishes = useMemo(() => {
    return dishes.filter(d => {
      const matchCat = billingActiveCat === 'All' || d.category === billingActiveCat;
      const matchSearch = d.name.toLowerCase().includes(billingSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [dishes, billingActiveCat, billingSearch]);

  const updateBillingCartQty = (dishId, delta) => {
    setBillingCart(prev => {
      const current = prev[dishId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [dishId]: next };
    });
  };

  const activeBillingItems = useMemo(() => {
    const items = [];
    Object.keys(billingCart).forEach(id => {
      const q = billingCart[id];
      if (q > 0) {
        const d = dishes.find(dish => dish.id === id);
        if (d) items.push({ ...d, quantity: q });
      }
    });
    return items;
  }, [billingCart, dishes]);

  const billingTotalAmount = useMemo(() => {
    return activeBillingItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  }, [activeBillingItems]);

  const discountAmount = useMemo(() => {
    const val = parseFloat(billingDiscount);
    return isNaN(val) ? 0 : val;
  }, [billingDiscount]);

  const billingFinalAmount = useMemo(() => {
    return Math.max(0, billingTotalAmount - discountAmount);
  }, [billingTotalAmount, discountAmount]);

  const handleGeneratePOSBill = (e) => {
    e.preventDefault();
    if (activeBillingItems.length === 0) {
      alert("Billing items list is empty. Add dishes to POS!");
      return;
    }

    const orderObj = onAddOrder(
      { name: billingCustomerName, phone: billingCustomerPhone },
      activeBillingItems,
      billingTotalAmount,
      discountAmount,
      billingFinalAmount,
      true // Mark as POS Cashier Order
    );

    setBillingSuccessDetails(orderObj);
    setBillingCart({});
    setBillingDiscount('');
    setBillingCustomerName('Walk-In Guest');
    setBillingCustomerPhone('9999999999');
    
    setTimeout(() => {
      setBillingSuccessDetails(null);
    }, 6000);
  };

  // ================= DASHBOARD CORE MATH =================
  const stats = useMemo(() => {
    const totalD = dishes.length;
    const totalO = orders.length;
    const rev = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, curr) => acc + curr.finalTotal, 0);
    const pendingTokens = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
    return { totalD, totalO, rev, pendingTokens };
  }, [dishes, orders]);

  // LOGIN SCREEN VIEW
  if (!isLoggedIn) {
    return (
      <div className="container" style={{ maxWidth: '460px', padding: '150px 20px 80px 20px' }}>
        <div className="glass-panel animate-fade-in-up" style={{
          padding: '40px 30px',
          border: '1px solid rgba(212,175,55,0.2)',
          boxShadow: 'var(--gold-glow-strong)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              marginBottom: '15px'
            }}>
              <Lock size={26} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>Admin Console</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
              Requires authentication to access billing and menu services
            </p>
          </div>

          {loginError && (
            <div style={{
              background: 'rgba(211, 47, 47, 0.15)',
              border: '1px solid #d32f2f',
              color: '#f44336',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password Code</label>
              <input
                type="password"
                required
                placeholder="e.g. admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
              Authenticate Guard
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
            >
              Back to Public Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN INTERFACE
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A', padding: '90px 0 60px 0' }}>
      
      {/* SIDEBAR CONSOLE NAVIGATION */}
      <div style={{
        width: '260px',
        background: '#111111',
        borderRight: '1px solid rgba(212,175,55,0.1)',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'fixed',
        top: '80px',
        bottom: 0,
        zIndex: 10
      }} className="admin-sidebar">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '0 10px 20px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>Console Workspace</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role: Active Super Administrator</span>
          </div>

          {[
            { id: 'dashboard', label: 'Dashboard Control', icon: <LayoutDashboard size={18} /> },
            { id: 'menu', label: 'Menu Catalog Manager', icon: <Utensils size={18} /> },
            { id: 'billing', label: 'Cashier POS Terminal', icon: <ReceiptText size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'var(--transition)',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#000000' : 'var(--text-muted)',
                textAlign: 'left'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ fontSize: '0.85rem', color: 'var(--primary)', textAlign: 'left', fontWeight: 'bold' }}
          >
            ← View Home Page
          </button>
          
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(211, 47, 47, 0.1)',
              border: '1px solid rgba(211,47,47,0.2)',
              color: '#f44336',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            <LogOut size={16} />
            <span>Lock Terminal</span>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE WORKSPACE PANELS */}
      <div style={{ flexGrow: 1, padding: '0 40px 0 300px' }} className="admin-content-area">
        
        {/* ========================================================
            VIEW A: ADMIN DASHBOARD CONTROL
            ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)' }}>Dashboard Control Center</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Real-time POS logs and order pipelines</p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={openAddForm} 
                  className="btn btn-primary" 
                  style={{ padding: '10px 20px', fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> Add New Dish
                </button>
                <button 
                  onClick={() => setActiveTab('billing')} 
                  className="btn btn-secondary" 
                  style={{ padding: '10px 20px', fontSize: '0.8rem' }}
                >
                  Launch POS
                </button>
              </div>
            </div>

            {/* KPI Metrics Dashboard Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {[
                { label: 'Total Catalog Dishes', val: stats.totalD, desc: 'Loaded menu elements', color: 'var(--primary)', icon: <Utensils /> },
                { label: 'All Orders Placed', val: stats.totalO, desc: 'QR Table & Cashier POS', color: 'var(--secondary)', icon: <ShoppingBag /> },
                { label: 'Cumulative Revenue', val: `₹${stats.rev.toLocaleString()}`, desc: 'Excludes cancelled queues', color: '#4caf50', icon: <DollarSign /> },
                { label: 'Active Token Pipeline', val: stats.pendingTokens, desc: 'Queue kitchen pipeline', color: '#ffeb3b', icon: <TrendingUp /> }
              ].map((kpi, idx) => (
                <div key={idx} className="luxury-card" style={{ padding: '20px', borderLeft: `4px solid ${kpi.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      {kpi.label}
                    </span>
                    <div style={{ color: kpi.color }}>{kpi.icon}</div>
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '5px 0' }}>{kpi.val}</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>{kpi.desc}</span>
                </div>
              ))}
            </div>

            {/* Analytics Graph Widget & Recent Tokens Queue */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px'
            }}>
              
              {/* Custom SVG Line Chart representation */}
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(212,175,55,0.15)' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '15px' }}>Daily Sales Revenue Trend (Demo)</h3>
                
                {/* SVG Graph Drawing */}
                <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <svg viewBox="0 0 500 200" style={{ width: '100%', height: '180px' }}>
                    {/* Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

                    {/* Gradient Area under line */}
                    <defs>
                      <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 40,170 Q 110,130 180,90 T 320,60 T 480,40 L 480,170 Z" fill="url(#chart-glow)" />

                    {/* Main Trend Line */}
                    <path d="M 40,170 Q 110,130 180,90 T 320,60 T 480,40" fill="none" stroke="var(--primary)" strokeWidth="3" />

                    {/* Interactive dots */}
                    <circle cx="40" cy="170" r="5" fill="#000" stroke="var(--primary)" strokeWidth="2" />
                    <circle cx="150" cy="110" r="5" fill="#000" stroke="var(--primary)" strokeWidth="2" />
                    <circle cx="260" cy="75" r="5" fill="#000" stroke="var(--primary)" strokeWidth="2" />
                    <circle cx="370" cy="55" r="5" fill="#000" stroke="var(--primary)" strokeWidth="2" />
                    <circle cx="480" cy="40" r="5" fill="#000" stroke="var(--primary)" strokeWidth="2" />
                  </svg>
                  
                  {/* Custom axis keys */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '0.7rem', color: 'var(--text-dark)', marginTop: '8px' }}>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri (Today)</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '15px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Aggregated POS Counter: ₹{Math.round(stats.rev * 0.7)}</span>
                  <span>QR Table Orders: ₹{Math.round(stats.rev * 0.3)}</span>
                </div>
              </div>

              {/* Active Tokens Queue Section */}
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(212,175,55,0.15)' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '15px' }}>Active Order Queue</h3>
                
                {orders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '300px', overflowY: 'auto' }}>
                    {orders.slice(0, 10).map((order) => (
                      <div key={order.id} style={{
                        background: '#151515',
                        border: '1px solid rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1rem' }}>
                              Token #{order.token}
                            </span>
                            <span style={{ fontSize: '0.7rem', background: '#222', padding: '2px 8px', borderRadius: '4px', color: '#888' }}>
                              {order.source}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '4px 0 0 0' }}>{order.customerName}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                          </p>
                          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>₹{order.finalTotal}</span>
                        </div>

                        {/* Status Select Controller */}
                        <div>
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                            style={{
                              background: '#222',
                              color: order.status === 'Completed' ? '#4caf50' : 
                                     order.status === 'Cancelled' ? '#f44336' : 
                                     order.status === 'Preparing' ? '#ff9800' : '#2196f3',
                              border: '1px solid rgba(255,255,255,0.05)',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders booked today yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW B: MENU CATALOG CRUD MANAGER
            ======================================================== */}
        {activeTab === 'menu' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)' }}>Menu Catalog Manager</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Update recipes, prices, and photo visuals</p>
              </div>
              <button onClick={openAddForm} className="btn btn-primary">
                <Plus size={16} /> Add New Dish
              </button>
            </div>

            {/* Catalog Filter Controls */}
            <div className="glass-panel" style={{
              padding: '16px 20px',
              marginBottom: '30px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '15px',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', ...categories].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setMenuFilterCat(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: menuFilterCat === cat ? 'var(--primary)' : '#222',
                      color: menuFilterCat === cat ? '#000' : 'var(--text-muted)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input
                  type="text"
                  placeholder="Search catalog items..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '38px', height: '36px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Menu Items CRUD Table */}
            <div className="glass-panel" style={{ overflowX: 'auto', border: '1px solid rgba(212,175,55,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '16px' }}>Photo</th>
                    <th style={{ padding: '16px' }}>Dish Name</th>
                    <th style={{ padding: '16px' }}>Category</th>
                    <th style={{ padding: '16px' }}>Price</th>
                    <th style={{ padding: '16px' }}>Description</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDishes.map((dish) => (
                    <tr key={dish.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'var(--transition)' }} className="table-row-hover">
                      <td style={{ padding: '12px 16px' }}>
                        <img 
                          src={dish.image} 
                          alt={dish.name} 
                          style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }} 
                        />
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{dish.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{dish.category}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--primary)' }}>₹{dish.price}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dish.description}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => openEditForm(dish)} 
                            style={{ color: 'var(--primary)', padding: '6px', background: '#222', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => confirmDeleteDish(dish.id)} 
                            style={{ color: '#f44336', padding: '6px', background: '#222', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dynamic Add / Edit Modal Overlay */}
            {showDishForm && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '20px'
              }}>
                <div className="glass-panel animate-fade-in-up" style={{
                  width: '100%',
                  maxWidth: '500px',
                  padding: '30px',
                  border: '1px solid var(--primary)',
                  boxShadow: 'var(--gold-glow-strong)'
                }}>
                  <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                    {editingDish ? 'Edit Catalog Dish' : 'Add New Catalog Dish'}
                  </h3>

                  <form onSubmit={handleSaveDishSubmit}>
                    <div className="input-group">
                      <label className="input-label">Dish Name</label>
                      <input
                        type="text"
                        required
                        value={dishName}
                        onChange={(e) => setDishName(e.target.value)}
                        placeholder="e.g. Kolhapuri Special Misal"
                        className="input-field"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="input-group">
                        <label className="input-label">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={dishPrice}
                          onChange={(e) => setDishPrice(e.target.value)}
                          placeholder="e.g. 120"
                          className="input-field"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">Category</label>
                        <select
                          value={dishCategory}
                          onChange={(e) => setDishCategory(e.target.value)}
                          className="input-field"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Image Visual URL</label>
                      <input
                        type="url"
                        value={dishImage}
                        onChange={(e) => setDishImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="input-field"
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Description Brief</label>
                      <textarea
                        rows={3}
                        required
                        value={dishDesc}
                        onChange={(e) => setDishDesc(e.target.value)}
                        placeholder="Describe the spice depth and accompaniments..."
                        className="input-field"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                        Save Record
                      </button>
                      <button type="button" onClick={() => setShowDishForm(false)} className="btn btn-secondary" style={{ flexGrow: 1 }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Dedicated Confirmation Delete Modal */}
            {deletingDishId && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '20px'
              }}>
                <div className="glass-panel" style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '30px',
                  border: '1px solid #d32f2f',
                  boxShadow: '0 0 30px rgba(211, 47, 47, 0.3)'
                }}>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#f44336', marginBottom: '15px' }}>
                    Confirm Deletion Action!
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '25px', lineHeight: '1.5' }}>
                    Are you absolutely sure you wish to delete this dish record? This will instantly remove it from the public menu and the cashier POS terminal catalog.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleDeleteExecute} className="btn btn-danger" style={{ flexGrow: 1, padding: '10px' }}>
                      Yes, Delete Record
                    </button>
                    <button onClick={() => setDeletingDishId(null)} className="btn btn-secondary" style={{ flexGrow: 1, padding: '10px' }}>
                      No, Keep It
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            VIEW C: COUNTER POS & BILLING TERMINAL
            ======================================================== */}
        {activeTab === 'billing' && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)' }}>Counter POS Cashier Terminal</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Direct offline customer invoicing and instant token routing</p>
            </div>

            {billingSuccessDetails && (
              <div style={{
                background: 'rgba(76, 175, 80, 0.15)',
                border: '1px solid #4caf50',
                color: '#4caf50',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>Bill Processed Successfully!</h4>
                  <p style={{ fontSize: '0.8rem' }}>Order registered locally and kitchen token **Token #{billingSuccessDetails.token}** has been generated.</p>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', background: 'rgba(76,175,80,0.1)', padding: '4px 14px', borderRadius: '6px' }}>
                  #{billingSuccessDetails.token}
                </div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '35px',
              alignItems: 'flex-start'
            }}>
              
              {/* POS LEFT COLUMN: Quick Search Dish Catalog */}
              <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(212,175,55,0.15)' }}>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '15px' }}>
                  POS Catalog Catalog Selector
                </h3>

                {/* Filter categories */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '10px',
                  marginBottom: '15px'
                }}>
                  {['All', ...categories].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setBillingActiveCat(cat)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: 'var(--radius-full)',
                        background: billingActiveCat === cat ? 'var(--primary)' : '#222',
                        color: billingActiveCat === cat ? '#000' : 'var(--text-muted)'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={billingSearch}
                    onChange={(e) => setBillingSearch(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
                  />
                </div>

                {/* Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {billingFilteredDishes.map((dish) => {
                    const qty = billingCart[dish.id] || 0;
                    return (
                      <div 
                        key={dish.id} 
                        onClick={() => updateBillingCartQty(dish.id, 1)}
                        style={{
                          background: '#151515',
                          borderRadius: '8px',
                          padding: '10px',
                          border: '1px solid rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          position: 'relative',
                          textAlign: 'center'
                        }}
                      >
                        {qty > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: 'var(--secondary)',
                            color: '#fff',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {qty}
                          </span>
                        )}
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{dish.name}</h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '4px' }}>₹{dish.price}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* POS RIGHT COLUMN: Bill Calculations Table */}
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(212,175,55,0.15)' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '15px' }}>
                  Invoice Ledger Calculator
                </h3>

                <form onSubmit={handleGeneratePOSBill}>
                  {/* Guest Info inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label" style={{ fontSize: '0.75rem' }}>Guest Name</label>
                      <input
                        type="text"
                        value={billingCustomerName}
                        onChange={(e) => setBillingCustomerName(e.target.value)}
                        className="input-field"
                        style={{ height: '34px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label" style={{ fontSize: '0.75rem' }}>Phone</label>
                      <input
                        type="tel"
                        value={billingCustomerPhone}
                        onChange={(e) => setBillingCustomerPhone(e.target.value)}
                        className="input-field"
                        style={{ height: '34px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Calculations Table */}
                  {activeBillingItems.length > 0 ? (
                    <div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', marginBottom: '20px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '8px 0' }}>Dish</th>
                            <th style={{ padding: '8px 0', textAlign: 'center' }}>Price</th>
                            <th style={{ padding: '8px 0', textAlign: 'center' }}>Qty</th>
                            <th style={{ padding: '8px 0', textAlign: 'right' }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeBillingItems.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '8px 0' }}>{item.name}</td>
                              <td style={{ padding: '8px 0', textAlign: 'center' }}>₹{item.price}</td>
                              <td style={{ padding: '8px 0' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                  <button type="button" onClick={() => updateBillingCartQty(item.id, -1)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>-</button>
                                  <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                                  <button type="button" onClick={() => updateBillingCartQty(item.id, 1)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>+</button>
                                </div>
                              </td>
                              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>₹{item.price * item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Calculations breakdown */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span>Bill Subtotal</span>
                          <span>₹{billingTotalAmount}</span>
                        </div>

                        {/* Discount system input */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem' }}>Apply Discount Code / Cash (₹)</span>
                          <input
                            type="number"
                            min="0"
                            max={billingTotalAmount}
                            placeholder="e.g. 20"
                            value={billingDiscount}
                            onChange={(e) => setBillingDiscount(e.target.value)}
                            className="input-field"
                            style={{ width: '80px', height: '30px', padding: '4px 8px', fontSize: '0.85rem', textAlign: 'right', borderRadius: '4px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', borderTop: '2px solid rgba(212,175,55,0.2)', paddingTop: '10px', color: 'var(--primary)' }}>
                          <span>Net Invoiced Amount</span>
                          <span>₹{billingFinalAmount}</span>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '25px' }}>
                        Submit Bill & Cash Token
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No POS items aggregated. Tap items on the left catalog grid.</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
