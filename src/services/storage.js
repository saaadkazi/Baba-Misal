/* ==========================================
   BABA MISAL - LOCAL STORAGE DATABASE SERVICE
   (SUPABASE & AUTH READY ARCHITECTURE)
   ========================================== */

// Default premium Misal Pav dishes and beverages to seed the application
const DEFAULT_DISHES = [
  {
    id: "dish-1",
    name: "Special Baba Misal Pav",
    description: "Our signature sprout curry topped with premium home-ground Farsan, fresh coriander, lemon, chopped onions, served with double buttery Pav.",
    price: 130,
    category: "Misal",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "dish-2",
    name: "Kolhapuri Spicy Misal",
    description: "Extra spicy Kat (Rassa) prepared using roasted authentic Ghati spices. Strictly for spice lovers, served with soft hot Pav.",
    price: 140,
    category: "Misal",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "dish-3",
    name: "Royal Cheese Misal Pav",
    description: "A rich combination of authentic spicy misal loaded with melting mozzarella cheese. Dampens the heat and tastes absolutely divine.",
    price: 160,
    category: "Misal",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "dish-4",
    name: "Batata Vada (2 Pcs)",
    description: "Crispy fried golden potato fritters seasoned with mustard seeds, green chillies, and garlic, served with spicy green chutney.",
    price: 60,
    category: "Snacks",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "dish-5",
    name: "Kanda Bhaji (Onion Pakoda)",
    description: "Crunchy batter-fried onions seasoned with traditional spices, perfect pairing with Masala Chai on a rainy evening.",
    price: 70,
    category: "Snacks",
    image: "https://images.unsplash.com/photo-1599307767316-776533bb941c?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "dish-6",
    name: "Spiced Solkadhi",
    description: "Traditional refreshing Konkani digestif beverage made from Kokum fruit extract and fresh coconut milk, with garlic and green chillies.",
    price: 50,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "dish-7",
    name: "Creamy Mango Lassi",
    description: "Thick yogurt beverage blended with authentic Alphonso mango pulp and topped with chopped almonds and pistachios.",
    price: 80,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "dish-8",
    name: "Baba Special Combo",
    description: "1x Special Baba Misal Pav, 1x Single Batata Vada, 1x Glass of Solkadhi. Complete traditional feast at an unbeatable value.",
    price: 210,
    category: "Combos",
    image: "https://images.unsplash.com/photo-1618040981119-e58f6bcf2cc5?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "dish-9",
    name: "Misal Pav + Mango Lassi Combo",
    description: "Get our popular Special Baba Misal Pav paired with a sweet, soothing glass of rich Alphonso Mango Lassi.",
    price: 190,
    category: "Combos",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "dish-10",
    name: "Maharashtrian Puran Poli",
    description: "Sweet, cardamom-infused yellow lentil flatbread cooked in pure homemade A2 ghee, served hot.",
    price: 90,
    category: "Special Dishes",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600"
  }
];

const DEFAULT_REVIEWS = [
  {
    id: "review-1",
    name: "Aarav Deshmukh",
    review: "Absolutely mind-blowing! The Baba Special Misal has the perfect balance of spice, texture, and buttery pav. Reminds me of authentic Kolhapuri flavors, but served in a luxury environment.",
    rating: 5,
    date: "2026-05-28"
  },
  {
    id: "review-2",
    name: "Sneha Patil",
    review: "The Cheese Misal is a game-changer! Super creamy and delicious. The QR ordering was incredibly quick and seamless, and our token was ready within 7 minutes. Highly recommended!",
    rating: 5,
    date: "2026-05-30"
  },
  {
    id: "review-3",
    name: "Vikram Joshi",
    review: "Best Solkadhi I've had in a long time. Tastes authentic and fresh. Prompt and clean POS system at the front cashier. Perfect place for family dining.",
    rating: 4.8,
    date: "2026-06-01"
  }
];

// Helper to initialize database if empty
const initDB = () => {
  if (!localStorage.getItem("dishes")) {
    localStorage.setItem("dishes", JSON.stringify(DEFAULT_DISHES));
  }
  if (!localStorage.getItem("reviews")) {
    localStorage.setItem("reviews", JSON.stringify(DEFAULT_REVIEWS));
  }
  if (!localStorage.getItem("orders")) {
    localStorage.setItem("orders", JSON.stringify([]));
  }
  if (!localStorage.getItem("last_token")) {
    localStorage.setItem("last_token", "100");
  }
};

initDB();

export const db = {
  /* ========================================================
     DISHES MANAGEMENT (MAPPED TO 'dishes' TABLE IN SUPABASE)
     ======================================================== */
  
  // Future Supabase query: const { data, error } = await supabase.from('dishes').select('*')
  getDishes: () => {
    initDB();
    return JSON.parse(localStorage.getItem("dishes"));
  },

  // Future Supabase query: const { data, error } = await supabase.from('dishes').insert([dish]) (or upsert)
  saveDish: (dish) => {
    initDB();
    const dishes = JSON.parse(localStorage.getItem("dishes"));
    
    if (dish.id) {
      // Edit mode
      const index = dishes.findIndex(d => d.id === dish.id);
      if (index !== -1) {
        dishes[index] = { ...dishes[index], ...dish };
      }
    } else {
      // Add mode
      const newDish = {
        ...dish,
        id: "dish-" + Date.now(),
        price: Number(dish.price)
      };
      dishes.push(newDish);
    }
    
    localStorage.setItem("dishes", JSON.stringify(dishes));
    return dishes;
  },

  // Future Supabase query: const { error } = await supabase.from('dishes').delete().eq('id', id)
  deleteDish: (id) => {
    initDB();
    let dishes = JSON.parse(localStorage.getItem("dishes"));
    dishes = dishes.filter(d => d.id !== id);
    localStorage.setItem("dishes", JSON.stringify(dishes));
    return dishes;
  },

  /* ========================================================
     REVIEWS SYSTEM (MAPPED TO 'reviews' TABLE IN SUPABASE)
     ======================================================== */
  
  // Future Supabase query: const { data } = await supabase.from('reviews').select('*').order('date', { ascending: false })
  getReviews: () => {
    initDB();
    return JSON.parse(localStorage.getItem("reviews"));
  },

  // Future Supabase query: const { data } = await supabase.from('reviews').insert([review])
  addReview: (review) => {
    initDB();
    const reviews = JSON.parse(localStorage.getItem("reviews"));
    const newReview = {
      ...review,
      id: "review-" + Date.now(),
      date: new Date().toISOString().split("T")[0]
    };
    reviews.unshift(newReview); // Add to beginning of reviews feed
    localStorage.setItem("reviews", JSON.stringify(reviews));
    return newReview;
  },

  /* ========================================================
     ORDERS & TOKENS (MAPPED TO 'orders' AND 'order_items')
     ======================================================== */
  
  // Future Supabase query: const { data } = await supabase.from('orders').select('*, order_items(*)')
  getOrders: () => {
    initDB();
    return JSON.parse(localStorage.getItem("orders"));
  },

  // Generates and increments tokens locally. 
  // In Supabase, this can be handled via a Postgres sequence or database trigger in SQL.
  getNextToken: () => {
    initDB();
    const lastTokenStr = localStorage.getItem("last_token");
    let lastToken = parseInt(lastTokenStr, 10);
    lastToken += 1;
    localStorage.setItem("last_token", lastToken.toString());
    return lastToken;
  },

  // Places order.
  // Future Supabase sequence:
  // 1. const { data: order } = await supabase.from('orders').insert({ customer_name, customer_phone, total, discount, final_total, token }).select()
  // 2. const itemsToInsert = items.map(i => ({ order_id: order.id, dish_id: i.id, quantity: i.quantity, subtotal: i.price * i.quantity }))
  // 3. await supabase.from('order_items').insert(itemsToInsert)
  addOrder: (customerDetails, items, total, discount, finalTotal, isPOS = false) => {
    initDB();
    const orders = JSON.parse(localStorage.getItem("orders"));
    const token = db.getNextToken();
    
    const newOrder = {
      id: "order-" + Date.now(),
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      total: total,
      discount: discount,
      finalTotal: finalTotal,
      token: token,
      source: isPOS ? "POS / Counter" : "QR Table / Self",
      date: new Date().toISOString(),
      status: "Pending" // Pending, Preparing, Completed, Cancelled
    };
    
    orders.unshift(newOrder); // Add to beginning of orders queue
    localStorage.setItem("orders", JSON.stringify(orders));
    return newOrder;
  },

  // Dashboard quick update
  updateOrderStatus: (id, status) => {
    initDB();
    const orders = JSON.parse(localStorage.getItem("orders"));
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem("orders", JSON.stringify(orders));
    }
    return orders;
  },

  // Reset database state completely
  resetToDefaults: () => {
    localStorage.removeItem("dishes");
    localStorage.removeItem("reviews");
    localStorage.removeItem("orders");
    localStorage.removeItem("last_token");
    initDB();
  }
};
