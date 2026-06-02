import React, { useState, useMemo, useEffect } from 'react';
import { User, Phone, ShoppingBag, Receipt, ChevronRight, CheckCircle2, Ticket, ArrowLeft, RotateCcw, X, Flame, Clock } from 'lucide-react';

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
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  
  // Dish details popup overlay state
  const [selectedDish, setSelectedDish] = useState(null);

  // Dismiss details modal on pressing ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedDish(null);
      }
    };
    if (selectedDish) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDish]);
  
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
    
    setLastCreatedOrder(orderDetails);
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
    setLastCreatedOrder(null);
    setErrors({});
    setPdfSuccess(false);
    setPdfError(null);
  };

  const loadJsPDF = () => {
    return new Promise((resolve, reject) => {
      console.log("[PDF DEBUG] Checking jsPDF library presence on window...");
      if (window.jspdf) {
        console.log("[PDF DEBUG] jsPDF found on window.jspdf");
        resolve(window.jspdf);
        return;
      }
      if (window.jsPDF) {
        console.log("[PDF DEBUG] jsPDF found on window.jsPDF");
        resolve({ jsPDF: window.jsPDF });
        return;
      }
      console.log("[PDF DEBUG] Loading jsPDF from CDN dynamically...");
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      script.onload = () => {
        console.log("[PDF DEBUG] CDN script onload completed. window.jspdf:", window.jspdf, "window.jsPDF:", window.jsPDF);
        resolve(window.jspdf || { jsPDF: window.jsPDF });
      };
      script.onerror = (err) => {
        console.error("[PDF DEBUG] CDN script loading failed:", err);
        reject(err);
      };
      document.body.appendChild(script);
    });
  };

  const getBase64ImageFromUrl = (url) => {
    return new Promise((resolve, reject) => {
      console.log("[PDF DEBUG] Attempting to convert asset to base64 canvas:", url);
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          console.log("[PDF DEBUG] Base64 image conversion successful.");
          resolve(dataURL);
        } catch (e) {
          console.error("[PDF DEBUG] Canvas draw/base64 conversion threw exception:", e);
          reject(e);
        }
      };
      img.onerror = (err) => {
        console.warn("[PDF DEBUG] Image onload failed to fire for asset:", err);
        reject(err);
      };
      img.src = url;
    });
  };

  const loadFonts = async (doc) => {
    try {
      console.log("[PDF DEBUG] Fetching Roboto regular and bold TTFs from cdnjs...");
      const [regRes, boldRes] = await Promise.all([
        fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf'),
        fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Bold.ttf')
      ]);

      console.log("[PDF DEBUG] Fetch completed. Verifying response statuses...");
      if (!regRes.ok || !boldRes.ok) {
        throw new Error(`Font server returned invalid status code: Regular(${regRes.status}), Bold(${boldRes.status})`);
      }

      console.log("[PDF DEBUG] Font resources verified ok. Extracting binary content blobs...");
      const [regBlob, boldBlob] = await Promise.all([regRes.blob(), boldRes.blob()]);

      console.log("[PDF DEBUG] Converting regular font binary to base64...");
      const regBase64 = await new Promise((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result.split(',')[1]);
        r.readAsDataURL(regBlob);
      });

      console.log("[PDF DEBUG] Converting bold font binary to base64...");
      const boldBase64 = await new Promise((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result.split(',')[1]);
        r.readAsDataURL(boldBlob);
      });

      console.log("[PDF DEBUG] Adding fonts to virtual file system...");
      doc.addFileToVFS('Roboto-Regular.ttf', regBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

      doc.addFileToVFS('Roboto-Bold.ttf', boldBase64);
      doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

      console.log("[PDF DEBUG] Roboto fonts injected successfully.");
      return true;
    } catch (err) {
      console.error("[PDF DEBUG] Font loader failed, reverting to Helvetica standard:", err);
      return false;
    }
  };

  const drawVectorLogo = (doc, x, y) => {
    console.log("[PDF DEBUG] Drawing vector logo fallback emblem...");
    try {
      if (doc.saveGraphicsState && typeof doc.saveGraphicsState === 'function') {
        doc.saveGraphicsState();
      }
    } catch (e) {
      console.warn("[PDF DEBUG] saveGraphicsState is not supported in this jsPDF build.");
    }

    doc.setDrawColor(212, 175, 55);
    doc.setFillColor(15, 15, 15);
    doc.setLineWidth(0.6);
    doc.circle(x, y, 9, 'FD');
    doc.setLineWidth(0.2);
    doc.circle(x, y, 7.5, 'S');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(9);
    doc.text('BM', x, y + 3, { align: 'center' });

    try {
      if (doc.restoreGraphicsState && typeof doc.restoreGraphicsState === 'function') {
        doc.restoreGraphicsState();
      }
    } catch (e) {
      console.warn("[PDF DEBUG] restoreGraphicsState is not supported in this jsPDF build.");
    }
  };

  const handleDownloadPDF = async () => {
    console.log("[PDF DEBUG] Triggered handleDownloadPDF.");
    if (!lastCreatedOrder) {
      console.error("[PDF DEBUG] lastCreatedOrder state is empty! Aborting ticket download.");
      return;
    }
    console.log("[PDF DEBUG] Target Order Object:", lastCreatedOrder);
    console.log("[PDF DEBUG] Ticket Number:", lastCreatedOrder.token);
    console.log("[PDF DEBUG] Guest Name:", lastCreatedOrder.customerName);
    console.log("[PDF DEBUG] Guest Mobile:", lastCreatedOrder.customerPhone);

    setPdfLoading(true);
    setPdfError(null);
    setPdfSuccess(false);

    try {
      const jspdfModule = await loadJsPDF();
      console.log("[PDF DEBUG] Resolving jsPDF constructor function...");
      
      let jsPDFConstructor = null;
      if (typeof window.jsPDF === 'function') {
        jsPDFConstructor = window.jsPDF;
        console.log("[PDF DEBUG] Resolved class constructor from window.jsPDF");
      } else if (jspdfModule && typeof jspdfModule.jsPDF === 'function') {
        jsPDFConstructor = jspdfModule.jsPDF;
        console.log("[PDF DEBUG] Resolved class constructor from jspdfModule.jsPDF");
      } else if (typeof jspdfModule === 'function') {
        jsPDFConstructor = jspdfModule;
        console.log("[PDF DEBUG] Resolved class constructor from jspdfModule direct function");
      }

      if (!jsPDFConstructor) {
        throw new Error("jsPDF constructor class is missing! Check CDN script loading.");
      }

      console.log("[PDF DEBUG] Instantiating jsPDF document class...");
      const doc = new jsPDFConstructor({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      console.log("[PDF DEBUG] jsPDF document successfully instantiated.");

      let useFont = 'helvetica';
      let currencySymbol = 'Rs. ';
      
      const fontsLoaded = await loadFonts(doc);
      if (fontsLoaded) {
        useFont = 'Roboto';
        currencySymbol = '₹';
      }

      console.log("[PDF DEBUG] PDF Typography settings: FontFamily=" + useFont + ", CurrencySymbol=" + currencySymbol);

      // Draw premium black background
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 297, 'F');

      // Draw luxury double gold borders
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.8);
      doc.rect(4, 4, 202, 289, 'S');

      doc.setLineWidth(0.25);
      doc.rect(5.5, 5.5, 199, 286, 'S');

      const centerX = 105;

      // Centered Logo
      try {
        console.log("[PDF DEBUG] Fetching logo favicon path...");
        const logoBase64 = await getBase64ImageFromUrl('/favicon.ico');
        console.log("[PDF DEBUG] Rendering favicon PNG image data to document...");
        doc.addImage(logoBase64, 'PNG', centerX - 8, 14, 16, 16);
      } catch (err) {
        console.warn("[PDF DEBUG] Favicon loading failed. Drawing fallback gold seal emblem:", err);
        drawVectorLogo(doc, centerX, 22);
      }

      // Restaurant Branding
      doc.setTextColor(212, 175, 55);
      doc.setFont(useFont, 'bold');
      doc.setFontSize(22);
      doc.text('BABA MISAL', centerX, 41, { align: 'center' });

      doc.setTextColor(184, 184, 184);
      doc.setFont(useFont, 'normal');
      doc.setFontSize(9);
      doc.text('TRADITIONAL GOLD STANDARD', centerX, 46, { align: 'center' });

      // Centered Divider Line with Gold Diamond details
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.4);
      doc.line(20, 52, 190, 52);
      
      // Draw premium centered circle dot (100% compatible shape)
      doc.setFillColor(212, 175, 55);
      doc.circle(centerX, 52, 1.2, 'F');

      // Receipt Information
      const order = lastCreatedOrder;
      const items = order.items || [];
      
      const dateObj = new Date(order.date);
      const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      // Token Number Card on the right side
      doc.setFillColor(20, 20, 20);
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.rect(130, 60, 60, 22, 'FD');

      doc.setTextColor(184, 184, 184);
      doc.setFont(useFont, 'bold');
      doc.setFontSize(8);
      doc.text('TICKET TOKEN', 160, 66, { align: 'center' });

      doc.setTextColor(212, 175, 55);
      doc.setFont(useFont, 'bold');
      doc.setFontSize(20);
      doc.text(`#${order.token}`, 160, 76, { align: 'center' });

      // Metadata info on the left side
      doc.setTextColor(212, 175, 55);
      doc.setFont(useFont, 'bold');
      doc.setFontSize(9);
      doc.text('RECEIPT INFORMATION', 20, 64);

      doc.setTextColor(255, 255, 255);
      doc.setFont(useFont, 'normal');
      doc.setFontSize(8.5);
      doc.text(`Date: ${formattedDate}`, 20, 70);
      doc.text(`Time: ${formattedTime}`, 20, 75);
      
      const orderStatus = order.status ? order.status.toUpperCase() : 'PREPARING';
      doc.text('Status: ', 20, 80);
      doc.setTextColor(212, 175, 55);
      doc.setFont(useFont, 'bold');
      doc.text(orderStatus, 31, 80);

      // Customer Information Section
      doc.setFillColor(20, 20, 20);
      doc.rect(20, 88, 170, 15, 'F');
      
      doc.setDrawColor(40, 40, 40);
      doc.setLineWidth(0.2);
      doc.rect(20, 88, 170, 15, 'S');

      doc.setTextColor(212, 175, 55);
      doc.setFont(useFont, 'bold');
      doc.setFontSize(8.5);
      doc.text('GUEST:', 24, 97.5);

      doc.setTextColor(255, 255, 255);
      doc.setFont(useFont, 'normal');
      doc.text(order.customerName.toUpperCase(), 37, 97.5);

      doc.setTextColor(212, 175, 55);
      doc.setFont(useFont, 'bold');
      doc.text('MOBILE PHONE:', 122, 97.5);

      doc.setTextColor(255, 255, 255);
      doc.setFont(useFont, 'normal');
      doc.text(order.customerPhone, 149, 97.5);

      // Ordered Items Table Section
      doc.setTextColor(212, 175, 55);
      doc.setFont(useFont, 'bold');
      doc.setFontSize(9);
      doc.text('ITEM DESCRIPTION', 20, 113);
      doc.text('QTY', 115, 113, { align: 'center' });
      doc.text('UNIT PRICE', 150, 113, { align: 'right' });
      doc.text('TOTAL', 190, 113, { align: 'right' });

      // Solid Table Header Line
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.4);
      doc.line(20, 116, 190, 116);

      // Table Rows
      let currentY = 123;
      doc.setFont(useFont, 'normal');
      doc.setFontSize(8.5);
      
      items.forEach((item) => {
        doc.setTextColor(255, 255, 255);
        doc.text(item.name, 20, currentY);
        doc.text(item.quantity.toString(), 115, currentY, { align: 'center' });
        doc.text(`${currencySymbol}${item.price}`, 150, currentY, { align: 'right' });
        
        doc.setTextColor(212, 175, 55);
        doc.setFont(useFont, 'bold');
        doc.text(`${currencySymbol}${item.subtotal || item.price * item.quantity}`, 190, currentY, { align: 'right' });
        doc.setFont(useFont, 'normal');

        // Row Separator Line
        doc.setDrawColor(40, 40, 40);
        doc.setLineWidth(0.15);
        doc.line(20, currentY + 3, 190, currentY + 3);

        currentY += 8;
      });

      // Billing Calculations Summary
      const totalVal = order.finalTotal;
      const subtotalVal = Math.round((totalVal / 1.05) * 100) / 100;
      const gstVal = Math.round((totalVal - subtotalVal) * 100) / 100;

      // Summary Divider Line
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(110, currentY + 1, 190, currentY + 1);

      doc.setTextColor(184, 184, 184);
      doc.setFont(useFont, 'normal');
      doc.setFontSize(8.5);
      doc.text('Subtotal (Excl. Tax)', 110, currentY + 7);
      doc.text(`${currencySymbol}${subtotalVal}`, 190, currentY + 7, { align: 'right' });

      doc.text('GST (5% Included)', 110, currentY + 13);
      doc.text(`${currencySymbol}${gstVal}`, 190, currentY + 13, { align: 'right' });

      // Highlighted Grand Total Box Card
      doc.setFillColor(212, 175, 55);
      doc.rect(110, currentY + 17, 80, 11, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFont(useFont, 'bold');
      doc.setFontSize(10);
      doc.text('GRAND TOTAL', 114, currentY + 24.5);
      doc.text(`${currencySymbol}${order.finalTotal}`, 186, currentY + 24.5, { align: 'right' });

      // Footer Section
      const footerY = Math.max(265, currentY + 50);

      // Gold Footer Divider
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.4);
      doc.line(20, footerY - 5, 190, footerY - 5);

      // Thank You Messages
      doc.setTextColor(184, 184, 184);
      doc.setFont(useFont, 'italic');
      doc.setFontSize(8.5);
      doc.text('Thank you for dining with us!', centerX, footerY, { align: 'center' });
      doc.text('Savor the spice, honor the heritage.', centerX, footerY + 5, { align: 'center' });

      doc.setFont(useFont, 'normal');
      doc.setFontSize(7.5);
      doc.text('BABA MISAL PREMIUM RESTAURANT SYSTEMS', centerX, footerY + 12, { align: 'center' });

      console.log("[PDF DEBUG] Saving PDF document to browser cache...");
      doc.save(`BabaMisal_Ticket_${order.token}.pdf`);
      console.log("[PDF DEBUG] Save transaction success.");
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error("[PDF DEBUG] Final caught exception during PDF generation flow:", err);
      setPdfError("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
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

          {pdfError && (
            <p style={{ color: '#f44336', fontSize: '0.85rem', marginTop: '10px', marginBottom: '10px', textAlign: 'center' }}>
              {pdfError}
            </p>
          )}

          <div className="success-buttons-container">
            <button 
              onClick={handleDownloadPDF} 
              className="btn btn-primary btn-download-pdf" 
              style={{ width: '100%' }}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Generating PDF...' : pdfSuccess ? 'Ticket Downloaded! ✓' : 'Download PDF Ticket'}
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-secondary btn-back-home" 
              style={{ width: '100%' }}
            >
              Back to Home
            </button>
            <button 
              onClick={handleReset} 
              className="btn btn-secondary btn-new-order" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
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
              <div className="category-tabs-container" style={{
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
                      {/* Left Side: Photo + Name + Price (Clickable to view details) */}
                      <div 
                        style={{ display: 'flex', gap: '12px', flexGrow: 1, cursor: 'pointer', alignItems: 'center' }}
                        onClick={() => setSelectedDish(dish)}
                      >
                        <img 
                          src={dish.image} 
                          alt={dish.name} 
                          style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }} 
                        />
                        
                        <div style={{ flexGrow: 1 }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF' }}>{dish.name}</h4>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.3', margin: '4px 0 6px 0' }}>
                            {dish.description.slice(0, 48)}...
                          </p>
                          <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>₹{dish.price}</span>
                        </div>
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

      {/* ================= DISH DETAILS POPUP OVERLAY ================= */}
      {selectedDish && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedDish(null)} // Dismiss by clicking backdrop
        >
          <div 
            className="glass-panel animate-fade-in-up"
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'rgba(22, 22, 22, 0.95)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: 'var(--gold-glow-strong), 0 20px 50px rgba(0,0,0,0.9)'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside from dismissing
          >
            {/* Close Button ("Wrong" Button) */}
            <button 
              onClick={() => setSelectedDish(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--primary)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <X size={18} />
            </button>

            {/* Visual Section: Large Image */}
            <div style={{ width: '100%', height: '240px', position: 'relative' }}>
              <img 
                src={selectedDish.image} 
                alt={selectedDish.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(22,22,22,1) 0%, rgba(22,22,22,0) 100%)',
                height: '80px'
              }} />
              <span className="badge badge-gold" style={{ position: 'absolute', top: '20px', left: '20px', backdropFilter: 'blur(5px)', fontSize: '0.75rem', padding: '5px 12px' }}>
                {selectedDish.category}
              </span>
            </div>

            {/* Content Section */}
            <div style={{ padding: '25px 30px 30px 30px', marginTop: '-15px', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}>{selectedDish.name}</h2>
                <span style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: '800' }}>₹{selectedDish.price}</span>
              </div>

              {/* Spicy rating & Prep time row */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 107, 0, 0.1)',
                  border: '1px solid rgba(255, 107, 0, 0.25)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--secondary)'
                }}>
                  <Flame size={12} fill="var(--secondary)" />
                  <span style={{ fontWeight: '700' }}>
                    {selectedDish.category === 'Beverages' ? 'Refreshing Digestif' : 
                     selectedDish.name.toLowerCase().includes('spicy') ? 'Extra Hot (5/5 Spice)' : 'Medium Heat (3/5 Spice)'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--primary)'
                }}>
                  <Clock size={12} />
                  <span style={{ fontWeight: '700' }}>Prep: {selectedDish.category === 'Beverages' ? '2 Mins' : '8 Mins'}</span>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '10px' }}>
                {selectedDish.description}
              </p>

              {/* Interactive Quantity Controls directly in details overlay */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                margin: '20px 0 15px 0'
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-muted)' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button 
                    type="button"
                    onClick={() => updateQuantity(selectedDish.id, -1)}
                    className="btn btn-secondary"
                    style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', minWidth: '32px', fontSize: '1rem' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                    {cart[selectedDish.id] || 0}
                  </span>
                  <button 
                    type="button"
                    onClick={() => updateQuantity(selectedDish.id, 1)}
                    className="btn btn-primary"
                    style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', minWidth: '32px', fontSize: '1rem' }}
                  >
                    +
                  </button>
                </div>
                {cart[selectedDish.id] > 0 && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', marginLeft: 'auto' }}>
                    Subtotal: ₹{selectedDish.price * cart[selectedDish.id]}
                  </span>
                )}
              </div>

              {/* Allergen & Ingredients notes */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.78rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Dietary Highlights & Allergens
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#777', lineHeight: '1.4' }}>
                  * Prepared using cold-pressed peanut oil. <br />
                  {selectedDish.category === 'Beverages' ? '* Natural fresh coconut milk base / premium curd and nuts.' : 
                   selectedDish.category === 'Misal' ? '* Sprouts contain natural mustard seeds, dairy ghee and home-ground farsan.' : 
                   '* Locally sourced high-quality ingredients.'}
                </p>
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => setSelectedDish(null)} 
                  className="btn btn-primary" 
                  style={{ flexGrow: 1, padding: '12px', fontSize: '0.85rem' }}
                >
                  Return to Order Grid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
