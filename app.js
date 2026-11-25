// --- APPLICATION DATA & BACKEND API SYNC (MySQL + Express + Offline/Local Fallback) ---
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000/api' : '/api';
let backendAvailable = false;

let orders = [
  { id: '#1048', room: 'Room 304', guest: 'Emma Wilson · 2 guests', items: 'Grilled salmon, Caesar salad', status: 'New', elapsed: '2 min', total: '£36.00', allergy: 'No nuts', station: 'Hot kitchen - Chef Marco' },
  { id: '#1047', room: 'Table 12', guest: 'Walk-in · 2 guests', items: 'Truffle mushroom risotto', status: 'Preparing', elapsed: '8 min', total: '£19.00', allergy: 'Vegetarian', station: 'Cold kitchen - Chef Priya' },
  { id: '#1046', room: 'Room 218', guest: 'Liam Patel · 1 guest', items: 'Club sandwich, fresh juice', status: 'Ready', elapsed: '12 min', total: '£16.00', allergy: 'None', station: 'Pastry & cold - Chef Elena' },
  { id: '#1045', room: 'Table 06', guest: 'Sofia Rossi · 3 guests', items: 'Burrata, margherita pizza', status: 'Preparing', elapsed: '14 min', total: '£29.00', allergy: 'None', station: 'Hot kitchen - Chef Marco' },
  { id: '#1044', room: 'Room 512', guest: 'James Chen · 2 guests', items: 'Seared sea bass, fries', status: 'Delayed', elapsed: '24 min', total: '£26.00', allergy: 'Gluten-free', station: 'Hot kitchen - Chef Marco' },
  { id: '#1043', room: 'Table 08', guest: 'Oliver Brown · 1 guest', items: 'Lemon tart, herbal tea', status: 'Preparing', elapsed: '11 min', total: '£12.50', allergy: 'Contains dairy', station: 'Pastry - Chef Elena' },
  { id: '#1042', room: 'Room 406', guest: 'Amalia Patel · 1 guest', items: 'Caesar salad, fresh juice', status: 'Ready', elapsed: '9 min', total: '£15.00', allergy: 'None', station: 'Cold kitchen - Chef Priya' }
];

let selectedOrderId = '#1048';
let currentOrderFilter = 'All';

let menuItems = [
  { id: 1, name: 'Grilled salmon', category: 'Main course · Seafood', price: '£24', stock: 'Limited · 6 portions left', available: true, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Truffle mushroom risotto', category: 'Main course · Vegetarian', price: '£19', stock: 'Available · 24 portions', available: true, img: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Seared sea bass', category: 'Main course · Seafood', price: '£26', stock: 'Unavailable · Restock needed', available: false, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Caesar salad', category: 'Starter · Salad', price: '£12', stock: 'Available · 32 portions', available: true, img: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Club sandwich', category: 'Light bites · Sandwich', price: '£16', stock: 'Available · 18 portions', available: true, img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'Margherita pizza', category: 'Main course · Vegetarian', price: '£17', stock: 'Available · 20 portions', available: true, img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80' }
];

let inventoryItems = [
  { sku: 'ST-001', barcode: '89012345001', name: 'Atlantic salmon', category: 'Seafood · Chilled', qty: '1.2 kg', expiry: '2026-11-16', supplier: 'Coast & Catch', status: 'Low · Expiring soon' },
  { sku: 'ST-002', barcode: '89012345002', name: 'Sea bass fillets', category: 'Seafood · Chilled', qty: '1.2 kg', expiry: '2026-11-15', supplier: 'Coast & Catch', status: 'Low · Expiring soon' },
  { sku: 'ST-003', barcode: '89012345003', name: 'Arborio rice', category: 'Dry goods · Pantry', qty: '18 kg', expiry: '2027-04-10', supplier: 'Pantry Partners', status: 'Healthy' },
  { sku: 'ST-004', barcode: '89012345004', name: 'Romaine lettuce', category: 'Produce · Chilled', qty: '24 heads', expiry: '2026-11-16', supplier: 'Fresh & Co.', status: 'Healthy' },
  { sku: 'ST-005', barcode: '89012345005', name: 'Fresh cream', category: 'Dairy · Chilled', qty: '2 litres', expiry: '2026-11-15', supplier: 'Fresh & Co.', status: 'Low · Reorder' },
  { sku: 'ST-006', barcode: '89012345006', name: 'Truffle oil', category: 'Dry goods · Pantry', qty: '6 bottles', expiry: '2027-08-20', supplier: 'Pantry Partners', status: 'Healthy' }
];

let roomsData = [
  { num: 'Room 301', status: 'Available', guest: 'Ready for check-in' },
  { num: 'Room 302', status: 'Occupied', guest: 'Amalia Patel' },
  { num: 'Room 303', status: 'Occupied', guest: 'Emma Wilson' },
  { num: 'Room 304', status: 'Occupied', guest: 'James Chen' },
  { num: 'Room 305', status: 'Maintenance', guest: 'AC inspection' },
  { num: 'Room 306', status: 'Occupied', guest: 'Sofia Rossi' },
  { num: 'Room 307', status: 'Occupied', guest: 'Oliver Brown' },
  { num: 'Room 308', status: 'Occupied', guest: 'Lucas Martin' },
  { num: 'Room 309', status: 'Available', guest: 'Ready for check-in' },
  { num: 'Room 310', status: 'Occupied', guest: 'Liam Patel' },
  { num: 'Room 311', status: 'Occupied', guest: 'Amalia Patel' },
  { num: 'Room 312', status: 'Occupied', guest: 'Emma Wilson' },
  { num: 'Room 313', status: 'Available', guest: 'Ready for check-in' },
  { num: 'Room 314', status: 'Occupied', guest: 'Amalia Patel' },
  { num: 'Room 315', status: 'Occupied', guest: 'Emma Wilson' }
];

function saveLocalState() {
  try {
    localStorage.setItem('marlow_orders', JSON.stringify(orders));
    localStorage.setItem('marlow_menu', JSON.stringify(menuItems));
    localStorage.setItem('marlow_inventory', JSON.stringify(inventoryItems));
  } catch (_) {}
}

function loadLocalState() {
  try {
    const o = localStorage.getItem('marlow_orders');
    const m = localStorage.getItem('marlow_menu');
    const inv = localStorage.getItem('marlow_inventory');
    if (o) orders = JSON.parse(o);
    if (m) menuItems = JSON.parse(m);
    if (inv) inventoryItems = JSON.parse(inv);
  } catch (_) {}
}

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('marlow_token');
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, Object.assign({}, options, { headers }));
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function syncFromBackend() {
  try {
    const health = await apiRequest('/health');
    if (health.database !== 'connected') {
      backendAvailable = false;
      return;
    }
    backendAvailable = true;

    const [dbOrders, dbMenu, dbInv] = await Promise.all([
      apiRequest('/orders').catch(() => null),
      apiRequest('/menu').catch(() => null),
      apiRequest('/inventory').catch(() => null)
    ]);

    if (Array.isArray(dbOrders) && dbOrders.length) {
      orders = dbOrders.map((r) => ({
        id: r.order_id,
        room: r.room_or_table,
        guest: r.guest_name,
        items: r.items_summary,
        status: r.status,
        elapsed: 'Live',
        total: `£${Number(r.total_amount || 0).toFixed(2)}`,
        allergy: r.allergy_alert || 'None',
        station: r.station || 'Hot kitchen'
      }));
      selectedOrderId = orders[0].id;
    }

    if (Array.isArray(dbMenu) && dbMenu.length) {
      menuItems = dbMenu.map((m) => ({
        id: m.item_id,
        name: m.name,
        category: `${m.category}${m.dietary_tag ? ' · ' + m.dietary_tag : ''}`,
        price: `£${Number(m.price).toFixed(0)}`,
        stock: m.portions_left > 0 ? `Available · ${m.portions_left} portions` : 'Unavailable · Restock needed',
        available: Boolean(m.is_available),
        img: m.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
      }));
    }

    if (Array.isArray(dbInv) && dbInv.length) {
      inventoryItems = dbInv.map((i) => {
        const qtyNum = Number(i.quantity_on_hand);
        const reorderNum = Number(i.reorder_level);
        const expDate = String(i.expiry_date || '').slice(0, 10);
        const isLow = qtyNum <= reorderNum || expDate <= '2026-11-17';
        return {
          sku: i.sku,
          barcode: i.barcode || 'N/A',
          name: i.ingredient_name,
          category: i.category_storage,
          qty: `${qtyNum} ${i.unit}`,
          expiry: expDate,
          supplier: i.supplier,
          status: isLow ? 'Low · Expiring soon' : 'Healthy'
        };
      });
    }

    saveLocalState();
    renderOrders();
    renderMenu();
    renderInventory();
  } catch (_) {
    backendAvailable = false;
  }
}

// --- MOBILE NAVIGATION ---
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar || !backdrop) return;
  sidebar.classList.toggle('open');
  backdrop.classList.toggle('open');
}

function closeMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar || !backdrop) return;
  sidebar.classList.remove('open');
  backdrop.classList.remove('open');
}

// --- AUTH HANDLERS ---
function applyUserBadge(fullName, propertyName) {
  const chipSpan = document.querySelector('.user-chip span');
  const avatar = document.querySelector('.user-chip .avatar');
  if (chipSpan && fullName) {
    chipSpan.textContent = `${propertyName || 'Marlow - Mayfair'} | ${fullName} · Manager`;
  }
  if (avatar && fullName) {
    const initials = fullName.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
    avatar.textContent = initials || 'AC';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const fullName = document.getElementById('regFullName').value.trim();
  const property = document.getElementById('regProperty').value.trim() || 'Marlow - Mayfair';
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, property_name: property, email, password })
    });
    if (data.token) localStorage.setItem('marlow_token', data.token);
    applyUserBadge(fullName, property);
    alert('Account saved to database! Redirecting to Hotel Overview...');
  } catch (err) {
    applyUserBadge(fullName, property);
    alert('Account created locally (' + err.message + '). Redirecting to Hotel Overview...');
  }
  switchView('hotel-overview');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) localStorage.setItem('marlow_token', data.token);
    if (data.user) applyUserBadge(data.user.full_name, data.user.property_name);
    await syncFromBackend();
    alert('Logged in! Synced with database.');
  } catch (err) {
    alert('Logged in locally (' + err.message + ').');
  }
  switchView('hotel-overview');
}

// --- NAVIGATION ---
function switchView(viewId, el) {
  document.querySelectorAll('.view-section').forEach((sec) => sec.classList.remove('active'));
  const target = document.getElementById('view-' + viewId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item, .sub-nav li').forEach((item) => {
    item.classList.remove('active', 'active-sub');
  });

  if (el) {
    if (el.parentElement && el.parentElement.classList.contains('sub-nav')) {
      el.classList.add('active-sub');
    } else {
      el.classList.add('active');
    }
  }

  const breadcrumbs = {
    'create-account': 'Authentication / Create account',
    'login': 'Authentication / Log in',
    'hotel-overview': 'Operations / Hotel overview',
    'reservations': 'Operations / Reservations',
    'rooms-guests': 'Operations / Rooms & guests',
    'kitchen-overview': 'Food management / Kitchen overview',
    'meal-orders': 'Food management / Meal orders',
    'menu-management': 'Food management / Menu management',
    'meal-planning': 'Food management / Meal planning',
    'inventory': 'Food management / Inventory & waste',
    'housekeeping': 'Operations / Housekeeping',
    'team-shifts': 'Operations / Team & shifts',
    'reports': 'Operations / Reports',
    'settings': 'Workspace / Settings',
    'help-support': 'Workspace / Help & support'
  };
  const bc = document.getElementById('breadcrumb-current');
  if (bc) bc.textContent = breadcrumbs[viewId] || 'Operations';
  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- ORDERS & KITCHEN QUEUE ---
function getStatusBadgeClass(status) {
  if (status === 'New') return 'badge-new';
  if (status === 'Preparing') return 'badge-prep';
  if (status === 'Ready') return 'badge-ready';
  return 'badge-delayed';
}

function getNextActionLabel(status) {
  if (status === 'New') return 'Accept order';
  if (status === 'Preparing') return 'Mark ready';
  if (status === 'Ready') return 'Dispatch';
  return 'Resolve delay';
}

function renderOrders(searchQuery = '') {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const filtered = orders.filter((o) => {
    const matchesFilter = currentOrderFilter === 'All' || o.status === currentOrderFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery) ||
      o.room.toLowerCase().includes(searchQuery) ||
      o.items.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  filtered.forEach((order) => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = () => selectOrder(order.id);
    tr.innerHTML = `
      <td><strong>${order.id}</strong></td>
      <td>${order.room}</td>
      <td>${order.items}</td>
      <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
      <td>${order.elapsed}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); advanceOrder('${order.id}')">
          ${getNextActionLabel(order.status)}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const activeStat = document.getElementById('ordersActiveStat');
  const kitchenStat = document.getElementById('kitchenActiveCount');
  if (activeStat) activeStat.textContent = orders.length;
  if (kitchenStat) kitchenStat.textContent = orders.length;
  renderSelectedOrderDetail();
}

function selectOrder(id) {
  selectedOrderId = id;
  renderSelectedOrderDetail();
}

function renderSelectedOrderDetail() {
  const order = orders.find((o) => o.id === selectedOrderId) || orders[0];
  if (!order) return;

  document.getElementById('detailOrderId').textContent = 'Order ' + order.id;
  const badge = document.getElementById('detailOrderBadge');
  badge.textContent = order.status;
  badge.className = 'badge ' + getStatusBadgeClass(order.status);

  document.getElementById('detailRoom').textContent = order.room;
  document.getElementById('detailGuest').textContent = order.guest;
  document.getElementById('detailAllergy').innerHTML = `<strong>Allergy alert: ${order.allergy}</strong><br/>Use a clean preparation area and confirm ingredients before sending.`;
  document.getElementById('detailItemsList').innerHTML = order.items.split(',').map((i) => `• 1 × ${i.trim()}`).join('<br/>');
  document.getElementById('detailTotal').textContent = order.total;
  document.getElementById('detailStation').textContent = order.station;
  document.getElementById('detailActionBtn').textContent = getNextActionLabel(order.status);
}

async function advanceOrder(id) {
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return;

  const current = orders[idx].status;
  let nextStatus = current;
  let removeOrder = false;

  if (current === 'New' || current === 'Delayed') {
    nextStatus = 'Preparing';
    orders[idx].status = nextStatus;
  } else if (current === 'Preparing') {
    nextStatus = 'Ready';
    orders[idx].status = nextStatus;
  } else if (current === 'Ready') {
    nextStatus = 'Completed';
    removeOrder = true;
    orders.splice(idx, 1);
    if (orders.length > 0) selectedOrderId = orders[0].id;
  }

  saveLocalState();
  renderOrders((document.getElementById('globalSearch')?.value || '').toLowerCase());

  if (backendAvailable) {
    apiRequest(`/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus })
    }).catch(() => {});
  }
}

function advanceSelectedOrder() { advanceOrder(selectedOrderId); }

function filterOrders(status) {
  currentOrderFilter = status;
  renderOrders((document.getElementById('globalSearch')?.value || '').toLowerCase());
}

async function createNewOrder(e) {
  e.preventDefault();
  const room = document.getElementById('newOrderRoom').value.trim();
  const guest = document.getElementById('newOrderGuest').value.trim();
  const [items, price] = document.getElementById('newOrderDish').value.split('|');
  const allergy = document.getElementById('newOrderAllergy').value.trim() || 'None';
  const nextNum = '#10' + (49 + orders.length);

  const newOrderObj = {
    id: nextNum,
    room: room,
    guest: guest,
    items: items,
    status: 'New',
    elapsed: '1 min',
    total: '£' + price,
    allergy: allergy,
    station: 'Hot kitchen - Chef Marco'
  };

  orders.unshift(newOrderObj);
  selectedOrderId = nextNum;
  saveLocalState();
  closeModal('newOrderModal');
  e.target.reset();
  renderOrders();
  switchView('meal-orders');

  if (backendAvailable) {
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        order_id: nextNum,
        room_or_table: room,
        guest_name: guest,
        items_summary: items,
        allergy_alert: allergy,
        station: 'Hot kitchen',
        status: 'New',
        total_amount: Number(price) || 0
      })
    }).catch(() => {});
  }
}

// --- MENU MANAGEMENT ---
function renderMenu(searchQuery = '') {
  const grid = document.getElementById('menuGalleryGrid');
  if (!grid) return;
  grid.innerHTML = '';
  let availableCount = 0;

  menuItems.filter((m) => m.name.toLowerCase().includes(searchQuery)).forEach((dish) => {
    if (dish.available) availableCount++;
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.innerHTML = `
      <img class="dish-img" src="${dish.img}" alt="${dish.name}" />
      <div class="dish-body">
        <div>
          <div class="dish-top">
            <span class="dish-title">${dish.name}</span>
            <span class="dish-price">${dish.price}</span>
          </div>
          <div class="dish-meta">${dish.category}<br/>${dish.available ? dish.stock : 'Sold out · Restock needed'}</div>
        </div>
        <div class="dish-footer">
          <span class="badge ${dish.available ? 'badge-ready' : 'badge-delayed'}">${dish.available ? 'Available' : 'Sold out'}</span>
          <label class="switch">
            <input type="checkbox" ${dish.available ? 'checked' : ''} onchange="toggleDish(${dish.id})" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  const availEl = document.getElementById('menuAvailCount');
  if (availEl) availEl.textContent = availableCount;
}

function toggleDish(id) {
  const dish = menuItems.find((d) => d.id === id);
  if (!dish) return;
  dish.available = !dish.available;
  saveLocalState();
  renderMenu((document.getElementById('globalSearch')?.value || '').toLowerCase());

  if (backendAvailable) {
    apiRequest(`/menu/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ is_available: dish.available })
    }).catch(() => {});
  }
}

// --- INVENTORY & BARCODE EXPIRY ---
function renderInventory(searchQuery = '') {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  let lowCount = 0;

  inventoryItems
    .filter((i) => i.name.toLowerCase().includes(searchQuery) || i.sku.toLowerCase().includes(searchQuery))
    .forEach((item, index) => {
      const isAlert = item.status !== 'Healthy';
      if (isAlert) lowCount++;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.sku}</strong><br/><span style="font-size:11px; color:var(--text-muted)">${item.barcode}</span></td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.qty}</td>
        <td>${item.expiry}</td>
        <td>${item.supplier}</td>
        <td><span class="badge ${isAlert ? 'badge-delayed' : 'badge-ready'}">${item.status}</span></td>
        <td><button class="btn btn-outline btn-sm" onclick="restockItem(${index})">Restock</button></td>
      `;
      tbody.appendChild(tr);
    });

  const lowEl = document.getElementById('lowStockCount');
  if (lowEl) lowEl.textContent = lowCount;
}

function restockItem(index) {
  const item = inventoryItems[index];
  if (!item) return;
  item.status = 'Healthy';
  item.qty = '12 kg / units';
  saveLocalState();
  renderInventory();

  if (backendAvailable) {
    apiRequest(`/inventory/${encodeURIComponent(item.sku)}/restock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity_on_hand: 12 })
    }).catch(() => {});
  }
}

function addInventoryItem(e) {
  e.preventDefault();
  const sku = document.getElementById('stockSku').value.trim();
  const barcode = document.getElementById('stockBarcode').value.trim();
  const name = document.getElementById('stockName').value.trim();
  const category = document.getElementById('stockCategory').value;
  const qty = document.getElementById('stockQty').value.trim();
  const expiry = document.getElementById('stockExpiry').value;
  const supplier = document.getElementById('stockSupplier').value.trim();

  const newItem = {
    sku,
    barcode,
    name,
    category,
    qty,
    expiry,
    supplier,
    status: 'Healthy'
  };

  inventoryItems.unshift(newItem);
  saveLocalState();
  closeModal('addStockModal');
  e.target.reset();
  renderInventory();

  if (backendAvailable) {
    const numMatch = parseFloat(qty) || 10;
    const unitMatch = qty.replace(/^[0-9.]+\s*/, '') || 'units';
    apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify({
        sku,
        barcode,
        ingredient_name: name,
        category_storage: category,
        quantity_on_hand: numMatch,
        unit: unitMatch,
        reorder_level: 3,
        expiry_date: expiry,
        supplier
      })
    }).catch(() => {});
  }
}

// --- ROOMS & GUESTS ---
function renderRooms() {
  const grid = document.getElementById('roomsGrid');
  if (!grid) return;
  grid.innerHTML = roomsData
    .map(
      (r) => `
    <div class="room-tile ${r.status.toLowerCase()}">
      <strong style="font-size:14px; display:block; margin-bottom:4px;">${r.num}</strong>
      <span style="font-size:11.5px; color:var(--text-secondary); display:block;">${r.status}</span>
      <span style="font-size:11.5px; color:var(--text-muted);">${r.guest}</span>
    </div>
  `
    )
    .join('');
}

// --- SEARCH & MODALS ---
function handleGlobalSearch() {
  const q = (document.getElementById('globalSearch')?.value || '').toLowerCase();
  renderOrders(q);
  renderMenu(q);
  renderInventory(q);
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Initialize Views & Sync Backend
document.addEventListener('DOMContentLoaded', () => {
  loadLocalState();
  renderOrders();
  renderMenu();
  renderInventory();
  renderRooms();
  syncFromBackend();
});
