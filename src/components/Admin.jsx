import React, { useState, useMemo } from 'react';
import { 
  Lock, LayoutDashboard, Utensils, ReceiptText, LogOut, 
  TrendingUp, ShoppingBag, Plus, Edit2, Trash2, Search, 
  Check, X, FileSpreadsheet, DollarSign, Calendar, RefreshCw,
  History, Eye
} from 'lucide-react';
import { db } from '../services/storage';

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

  // Active view: 'dashboard', 'menu', 'billing', 'history'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Token History States
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [viewingOrder, setViewingOrder] = useState(null);

  // Date and Time Helper Functions for Token History pipeline
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const isYesterday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.getDate() === yesterday.getDate() &&
           d.getMonth() === yesterday.getMonth() &&
           d.getFullYear() === yesterday.getFullYear();
  };

  const isThisWeek = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const isThisMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN');
  };

  const formatOrderTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Memoized KPI calculations for Token History top dashboard
  const historyStats = useMemo(() => {
    let todayTokens = 0;
    let pendingCount = 0;
    let completedCount = 0;
    let todayRev = 0;

    orders.forEach(o => {
      const orderIsToday = isToday(o.date);
      if (orderIsToday) {
        todayTokens += 1;
        if (o.status !== 'Cancelled') {
          todayRev += o.finalTotal;
        }
      }
      if (o.status === 'Pending' || o.status === 'Preparing') {
        pendingCount += 1;
      }
      if (o.status === 'Completed') {
        completedCount += 1;
      }
    });

    return { todayTokens, pendingCount, completedCount, todayRev };
  }, [orders]);

  // Memoized filter sorting pipeline for history list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Search match (Token number, Customer Name, or Phone number)
      const searchVal = historySearch.toLowerCase().trim();
      const matchesSearch = searchVal === '' || 
        o.token.toString().includes(searchVal) ||
        o.customerName.toLowerCase().includes(searchVal) ||
        o.customerPhone.includes(searchVal);

      // Status match (Pending matches both Pending and Preparing)
      let matchesStatus = true;
      if (historyStatusFilter !== 'all') {
        if (historyStatusFilter === 'Pending') {
          matchesStatus = o.status === 'Pending' || o.status === 'Preparing';
        } else {
          matchesStatus = o.status === historyStatusFilter;
        }
      }

      // Date window match
      let matchesDate = true;
      if (historyDateFilter === 'today') matchesDate = isToday(o.date);
      else if (historyDateFilter === 'yesterday') matchesDate = isYesterday(o.date);
      else if (historyDateFilter === 'week') matchesDate = isThisWeek(o.date);
      else if (historyDateFilter === 'month') matchesDate = isThisMonth(o.date);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, historySearch, historyStatusFilter, historyDateFilter]);

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

  // ================= DASHBOARD CORE MATH & SELECTORS =================
  // Selected interval state: 'today', 'week', 'month', 'all'
  const [revenueView, setRevenueView] = useState('all');

  const filteredStatsOrders = useMemo(() => {
    return orders.filter(o => {
      if (revenueView === 'today') return isToday(o.date);
      if (revenueView === 'week') return isThisWeek(o.date);
      if (revenueView === 'month') return isThisMonth(o.date);
      return true; // 'all'
    });
  }, [orders, revenueView]);

  const stats = useMemo(() => {
    const totalD = dishes.length;
    const totalO = filteredStatsOrders.length;
    const rev = filteredStatsOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, curr) => acc + curr.finalTotal, 0);
    const pendingTokens = filteredStatsOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
    return { totalD, totalO, rev, pendingTokens };
  }, [dishes, filteredStatsOrders]);

  // Dynamic SVG Chart Coordinates & Details Map
  const chartDetails = useMemo(() => {
    if (revenueView === 'today') {
      return {
        path: "M 40,170 Q 120,160 200,100 T 360,95 T 480,80",
        glow: "M 40,170 Q 120,160 200,100 T 360,95 T 480,80 L 480,170 L 40,170 Z",
        dots: [
          { cx: 40, cy: 170 },
          { cx: 150, cy: 140 },
          { cx: 260, cy: 100 },
          { cx: 370, cy: 90 },
          { cx: 480, cy: 80 }
        ],
        labels: ["8 AM", "12 PM", "4 PM", "8 PM", "10 PM"],
        title: "Daily Sales Revenue Trend (Today)"
      };
    }
    if (revenueView === 'week') {
      return {
        path: "M 40,160 Q 110,120 180,130 T 320,80 T 480,50",
        glow: "M 40,160 Q 110,120 180,130 T 320,80 T 480,50 L 480,170 L 40,170 Z",
        dots: [
          { cx: 40, cy: 160 },
          { cx: 150, cy: 125 },
          { cx: 260, cy: 105 },
          { cx: 370, cy: 70 },
          { cx: 480, cy: 50 }
        ],
        labels: ["Mon", "Wed", "Fri", "Sat", "Sun"],
        title: "Weekly Sales Revenue Trend (7 Days)"
      };
    }
    if (revenueView === 'month') {
      return {
        path: "M 40,140 Q 110,95 180,105 T 320,65 T 480,30",
        glow: "M 40,140 Q 110,95 180,105 T 320,65 T 480,30 L 480,170 L 40,170 Z",
        dots: [
          { cx: 40, cy: 140 },
          { cx: 150, cy: 100 },
          { cx: 260, cy: 80 },
          { cx: 370, cy: 50 },
          { cx: 480, cy: 30 }
        ],
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
        title: "Monthly Sales Revenue Trend (30 Days)"
      };
    }
    // Cumulative / All-Time
    return {
      path: "M 40,170 Q 110,130 180,90 T 320,60 T 480,40",
      glow: "M 40,170 Q 110,130 180,90 T 320,60 T 480,40 L 480,170 L 40,170 Z",
      dots: [
        { cx: 40, cy: 170 },
        { cx: 150, cy: 110 },
        { cx: 260, cy: 75 },
        { cx: 370, cy: 55 },
        { cx: 480, cy: 40 }
      ],
      labels: ["Q1 2026", "Q2 2026", "May", "June", "Today"],
      title: "Cumulative Sales Revenue Trend (All-Time)"
    };
  }, [revenueView]);


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
            { id: 'billing', label: 'Cashier POS Terminal', icon: <ReceiptText size={18} /> },
            { id: 'history', label: 'Token History', icon: <History size={18} /> }
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
            style={{ fontSize: '0.85rem', color: 'var(--primary)', textAlign: 'left', fontWeight: 'bold', padding: '0 10px' }}
          >
            ← View Home Page
          </button>
          
          <button 
            onClick={() => {
              if (window.confirm("Are you absolutely sure you want to reset all dishes, reviews, and orders to their default seed states? This will clear browser localStorage cache and reload the application.")) {
                db.resetToDefaults();
                window.location.reload();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.2)',
              color: 'var(--secondary)',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            <RefreshCw size={16} />
            <span>Reset Demo DB</span>
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

            {/* Revenue View Time Segment Selector */}
            <div className="glass-panel" style={{
              padding: '12px 20px',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '15px',
              border: '1px solid rgba(212,175,55,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Revenue Analytics Filter:
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  (Showing dynamic charts & ledger history)
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'today', label: 'Daily (Today)' },
                  { id: 'week', label: 'Weekly (7 Days)' },
                  { id: 'month', label: 'Monthly (30 Days)' },
                  { id: 'all', label: 'Cumulative (All-Time)' }
                ].map(view => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setRevenueView(view.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 'bold',
                      transition: 'var(--transition)',
                      background: revenueView === view.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                      color: revenueView === view.id ? '#000000' : 'var(--text-muted)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {view.label}
                  </button>
                ))}
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
                { 
                  label: revenueView === 'today' ? 'Orders Placed (Today)' : 
                         revenueView === 'week' ? 'Orders Placed (7 Days)' : 
                         revenueView === 'month' ? 'Orders Placed (30 Days)' : 'All Orders Placed', 
                  val: stats.totalO, 
                  desc: 'QR Table & Cashier POS', 
                  color: 'var(--secondary)', 
                  icon: <ShoppingBag /> 
                },
                { 
                  label: revenueView === 'today' ? 'Revenue (Today)' : 
                         revenueView === 'week' ? 'Revenue (7 Days)' : 
                         revenueView === 'month' ? 'Revenue (30 Days)' : 'Cumulative Revenue', 
                  val: `₹${stats.rev.toLocaleString()}`, 
                  desc: 'Excludes cancelled queues', 
                  color: '#4caf50', 
                  icon: <DollarSign /> 
                },
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
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', marginBottom: '15px' }}>{chartDetails.title}</h3>
                
                {/* SVG Graph Drawing */}
                <div style={{ width: '100%', height: '200px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <svg viewBox="0 0 500 170" style={{ width: '100%', height: '150px' }}>
                    {/* Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                    <line x1="40" y1="60" x2="480" y2="60" stroke="rgba(255,255,255,0.05)" />
                    <line x1="40" y1="100" x2="480" y2="100" stroke="rgba(255,255,255,0.05)" />
                    <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.1)" />

                    {/* Gradient Area under line */}
                    <defs>
                      <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={chartDetails.glow} fill="url(#chart-glow)" style={{ transition: 'all 0.5s ease-in-out' }} />

                    {/* Main Trend Line */}
                    <path d={chartDetails.path} fill="none" stroke="var(--primary)" strokeWidth="3" style={{ transition: 'all 0.5s ease-in-out' }} />

                    {/* Interactive dots */}
                    {chartDetails.dots.map((dot, dIdx) => (
                      <circle key={dIdx} cx={dot.cx} cy={dot.cy} r="5" fill="#000" stroke="var(--primary)" strokeWidth="2" style={{ transition: 'all 0.5s ease-in-out' }} />
                    ))}
                  </svg>
                  
                  {/* Custom axis keys */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', fontSize: '0.7rem', color: 'var(--text-dark)', marginTop: '8px' }}>
                    {chartDetails.labels.map((lbl, lIdx) => (
                      <span key={lIdx}>{lbl}</span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '25px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
                          background: qty > 0 ? '#222222' : '#151515',
                          borderRadius: '8px',
                          padding: '10px',
                          border: qty > 0 ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.03)',
                          boxShadow: qty > 0 ? '0 0 15px rgba(212, 175, 55, 0.22), 0 0 5px rgba(255, 107, 0, 0.12)' : 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          textAlign: 'center',
                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
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

        {/* ========================================================
            VIEW D: TOKEN HISTORY SYSTEM
            ======================================================== */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)' }}>Token History Pipeline</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>View, track, and manage all cash tokens and self QR table tickets</p>
              </div>
              
              <button 
                onClick={() => { setHistorySearch(''); setHistoryDateFilter('all'); setHistoryStatusFilter('all'); }} 
                className="btn btn-secondary" 
                style={{ padding: '8px 18px', fontSize: '0.75rem' }}
              >
                <RefreshCw size={14} /> Reset Filters
              </button>
            </div>

            {/* KPI Metrics Dashboard Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {[
                { label: "Today's Tokens", val: historyStats.todayTokens, desc: "Total orders booked today", color: "var(--secondary)", icon: <ShoppingBag /> },
                { label: "Pending Orders", val: historyStats.pendingCount, desc: "Pending & Preparing kitchen queue", color: "var(--primary)", icon: <RefreshCw /> },
                { label: "Completed Orders", val: historyStats.completedCount, desc: "Retrieved & served feasts", color: "#4caf50", icon: <Check /> },
                { label: "Today's Revenue", val: `₹${historyStats.todayRev.toLocaleString()}`, desc: "Active sales generated today", color: "#4caf50", icon: <DollarSign /> }
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

            {/* Filter controls and Search Grid */}
            <div className="glass-panel" style={{
              padding: '20px',
              marginBottom: '30px',
              border: '1px solid rgba(212,175,55,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {/* Search Inputs */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                  <input
                    type="text"
                    placeholder="Search by Token, Name, or Mobile..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', paddingLeft: '40px', height: '40px', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Dropdown selectors */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  
                  {/* Date Filter selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Time window:</span>
                    <select
                      value={historyDateFilter}
                      onChange={(e) => setHistoryDateFilter(e.target.value)}
                      className="input-field"
                      style={{ height: '36px', padding: '0 12px', fontSize: '0.8rem', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="all">All History</option>
                      <option value="today">Today Only</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">This Week (7 Days)</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  {/* Status Filter selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Status:</span>
                    <select
                      value={historyStatusFilter}
                      onChange={(e) => setHistoryStatusFilter(e.target.value)}
                      className="input-field"
                      style={{ height: '36px', padding: '0 12px', fontSize: '0.8rem', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="all">All Orders</option>
                      <option value="Pending">Pending / Queue</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>

            {/* Token History Table */}
            <div className="glass-panel" style={{ overflowX: 'auto', border: '1px solid rgba(212,175,55,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '16px' }}>Token No</th>
                    <th style={{ padding: '16px' }}>Customer</th>
                    <th style={{ padding: '16px' }}>Mobile</th>
                    <th style={{ padding: '16px' }}>Ordered Items</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '16px' }}>Date</th>
                    <th style={{ padding: '16px' }}>Time</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'var(--transition)' }} 
                        className="table-row-hover"
                      >
                        <td style={{ padding: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                          #{order.token}
                        </td>
                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{order.customerName}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{order.customerPhone}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                          ₹{order.finalTotal}
                        </td>
                        <td style={{ padding: '16px', fontSize: '0.8rem' }}>{formatOrderDate(order.date)}</td>
                        <td style={{ padding: '16px', fontSize: '0.8rem' }}>{formatOrderTime(order.date)}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span 
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              background: order.status === 'Completed' ? 'rgba(76, 175, 80, 0.15)' : 
                                          order.status === 'Cancelled' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                              color: order.status === 'Completed' ? '#4caf50' : 
                                     order.status === 'Cancelled' ? '#f44336' : 'var(--primary)',
                              border: order.status === 'Completed' ? '1px solid #4caf50' : 
                                      order.status === 'Cancelled' ? '1px solid #f44336' : '1px solid var(--primary)'
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button 
                            onClick={() => setViewingOrder(order)}
                            style={{
                              color: 'var(--primary)',
                              padding: '6px 12px',
                              background: '#222',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        No token history matches found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Token Detail Modal Drawer */}
            {viewingOrder && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '20px',
                backdropFilter: 'blur(4px)'
              }}>
                <div className="glass-panel animate-fade-in-up" style={{
                  width: '100%',
                  maxWidth: '650px',
                  padding: '30px',
                  border: '1px solid var(--primary)',
                  boxShadow: 'var(--gold-glow-strong)'
                }}>
                  {/* Modal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(212,175,55,0.2)', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--secondary)', fontWeight: 'bold' }}>TICKET DETAILS PANEL</span>
                      <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                        Token #{viewingOrder.token}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setViewingOrder(null)} 
                      style={{ color: 'var(--text-muted)', background: '#222', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Modal Grid content */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '25px' }}>
                    {/* Left Col: Customer details */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Guest Account</h4>
                      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Name</td>
                            <td style={{ padding: '6px 0', fontWeight: 'bold', textAlign: 'right' }}>{viewingOrder.customerName}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Mobile Phone</td>
                            <td style={{ padding: '6px 0', fontWeight: 'bold', textAlign: 'right' }}>{viewingOrder.customerPhone}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Order Source</td>
                            <td style={{ padding: '6px 0', fontWeight: 'bold', textAlign: 'right', color: 'var(--secondary)' }}>{viewingOrder.source}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Book Date</td>
                            <td style={{ padding: '6px 0', fontWeight: 'bold', textAlign: 'right' }}>{formatOrderDate(viewingOrder.date)}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Book Time</td>
                            <td style={{ padding: '6px 0', fontWeight: 'bold', textAlign: 'right' }}>{formatOrderTime(viewingOrder.date)}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 0', color: 'var(--text-muted)' }}>Queue Status</td>
                            <td style={{ padding: '6px 0', fontWeight: 'bold', textAlign: 'right' }}>
                              <span style={{
                                color: viewingOrder.status === 'Completed' ? '#4caf50' : 
                                       viewingOrder.status === 'Cancelled' ? '#f44336' : 'var(--primary)'
                              }}>
                                {viewingOrder.status}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Right Col: Items ledger */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Order Ledger</h4>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px', background: 'rgba(0,0,0,0.2)' }}>
                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                              <th style={{ paddingBottom: '6px' }}>Item</th>
                              <th style={{ paddingBottom: '6px', textAlign: 'center' }}>Qty</th>
                              <th style={{ paddingBottom: '6px', textAlign: 'right' }}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingOrder.items.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '6px 0', fontWeight: 'bold' }}>{item.name}</td>
                                <td style={{ padding: '6px 0', textAlign: 'center' }}>x{item.quantity}</td>
                                <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Calculations summary */}
                      <div style={{ marginTop: '15px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '10px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Original Subtotal</span>
                          <span>₹{viewingOrder.total}</span>
                        </div>
                        {viewingOrder.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--secondary)' }}>
                            <span>Applied Discount</span>
                            <span>- ₹{viewingOrder.discount}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', color: 'var(--primary)' }}>
                          <span>Net Invoiced Total</span>
                          <span>₹{viewingOrder.finalTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                    <button 
                      onClick={() => {
                        onUpdateOrderStatus(viewingOrder.id, 'Completed');
                        setViewingOrder(prev => ({ ...prev, status: 'Completed' }));
                      }}
                      className="btn btn-primary" 
                      style={{ 
                        flexGrow: 1, 
                        background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', 
                        color: '#FFFFFF',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(76,175,80,0.2)' 
                      }}
                    >
                      <Check size={14} /> Mark Completed
                    </button>
                    <button 
                      onClick={() => {
                        onUpdateOrderStatus(viewingOrder.id, 'Cancelled');
                        setViewingOrder(prev => ({ ...prev, status: 'Cancelled' }));
                      }}
                      className="btn btn-danger" 
                      style={{ flexGrow: 1 }}
                    >
                      <X size={14} /> Mark Cancelled
                    </button>
                    <button 
                      onClick={() => setViewingOrder(null)} 
                      className="btn btn-secondary" 
                      style={{ flexGrow: 1 }}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
