const regions = [
  { name: "Nuwara Eliya", alt: 1868, note: "Highest gardens: pale, floral, delicate." },
  { name: "Uva", alt: 1100, note: "Misty slopes: bold with a hint of mint." },
  { name: "Dimbula", alt: 1250, note: "West-facing gardens: bright and brisk." },
  { name: "Kandy", alt: 600, note: "Mid-country: round, mellow, easy to drink." },
  { name: "Ruhuna", alt: 100, note: "Low country: dark, rich and malty." }
].sort((a, b) => b.alt - a.alt);

const products = [
  { id: "pedro-bop", name: "Pedro Silver Tips", category: "White", region: "Nuwara Eliya", price: 4800, notes: "Honey, apricot and a clean finish.", color: "#8a9bae", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=850&q=82" },
  { id: "lover-op", name: "Lovers Leap OP", category: "Black", region: "Nuwara Eliya", price: 2600, notes: "Light and floral, good without milk.", color: "#2f5d62", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=850&q=82" },
  { id: "dimbula-bop", name: "Dimbula Morning BOP", category: "Black", region: "Dimbula", price: 2200, notes: "Bright, brisk and citrusy.", color: "#a0522d", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=850&q=82" },
  { id: "uva-pekoe", name: "Uva Pekoe", category: "Black", region: "Uva", price: 2400, notes: "Full-bodied with a hint of mint.", color: "#6b3f5e", image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=850&q=82" },
  { id: "kandy-green", name: "Kandy Green Leaf", category: "Green", region: "Kandy", price: 2000, notes: "Fresh, grassy and gently sweet.", color: "#4c7a43", image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=850&q=82" },
  { id: "kandy-ft", name: "Kandy Afternoon FBOP", category: "Black", region: "Kandy", price: 1900, notes: "Smooth, round and mellow.", color: "#8b6a2f", image: "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?auto=format&fit=crop&w=850&q=82" },
  { id: "ruhuna-ctc", name: "Ruhuna Strong CTC", category: "Black", region: "Ruhuna", price: 1600, notes: "Dark and malty. Built for milk tea.", color: "#4a2d22", image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=850&q=82" },
  { id: "pot", name: "Stoneware Teapot", category: "Teaware", region: "", price: 7500, notes: "600 ml. Holds heat, pours cleanly.", color: "#3e5568", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=850&q=82" }
];

const categories = ["All", ...new Set(products.map(p => p.category))];
const $ = s => document.querySelector(s);
const grid = $("#product-grid"), search = $("#product-search"), sortSel = $("#sort-products");
const drawer = $("#cart-drawer"), scrim = $("#scrim");
const fmt = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 });
let activeCat = "All", activeRegion = "";
let cart = load("cl-cart"), orders = load("cl-orders");

function load(k) { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch { return []; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const money = n => `LKR ${fmt.format(n)}`;
const prod = id => products.find(p => p.id === id);

function renderLadder() {
  $("#ladder").innerHTML = regions.map(r => `<button class="rung${r.name === activeRegion ? " on" : ""}" data-region="${r.name}" type="button" aria-pressed="${r.name === activeRegion}"><b>${r.name}</b><span class="bar-bg"><i style="width:${Math.max(r.alt / 19, 5)}%"></i></span><span>${fmt.format(r.alt)} m</span></button>`).join("");
  document.querySelectorAll(".rung").forEach(b => b.addEventListener("click", () => {
    activeRegion = activeRegion === b.dataset.region ? "" : b.dataset.region;
    if (activeRegion) activeCat = "All";
    renderLadder(); renderChips(); renderProducts();
    if (activeRegion) document.getElementById("shop").scrollIntoView();
  }));
}

function renderChips() {
  $("#category-list").innerHTML = categories.map(c => `<button class="chip${c === activeCat ? " on" : ""}" data-cat="${c}" type="button" aria-pressed="${c === activeCat}">${c}</button>`).join("");
  document.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => { activeCat = b.dataset.cat; renderChips(); renderProducts(); }));
}

function renderProducts() {
  const q = search.value.trim().toLowerCase();
  const list = products.filter(p => (activeCat === "All" || p.category === activeCat) && (!activeRegion || p.region === activeRegion) && `${p.name} ${p.category} ${p.region} ${p.notes}`.toLowerCase().includes(q));
  const s = sortSel.value;
  if (s === "price-low") list.sort((a, b) => a.price - b.price);
  if (s === "price-high") list.sort((a, b) => b.price - a.price);
  if (s === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  $("#results-count").textContent = `${list.length} ${list.length === 1 ? "product" : "products"}`;
  $("#empty-state").hidden = list.length > 0;
  grid.hidden = list.length === 0;
  const note = $("#region-note"), r = regions.find(x => x.name === activeRegion);
  note.hidden = !r;
  if (r) { note.innerHTML = `<span><b>${r.name}, ${fmt.format(r.alt)} m.</b> ${r.note}</span><button id="reset-region" type="button">Show all regions</button>`; $("#reset-region").addEventListener("click", () => { activeRegion = ""; renderLadder(); renderProducts(); }); }
  grid.innerHTML = list.map(p => `<article class="item"><div class="tile" style="--c:${p.color}"><img src="${p.image}" alt="" loading="lazy" decoding="async"><em aria-hidden="true">${p.name[0]}</em><span>${p.category}</span></div><div class="info"><h3>${p.name}</h3><p class="meta">${p.region || "Sri Lanka"}</p><p class="notes">${p.notes}</p><div class="buy"><strong>${money(p.price)}</strong><button class="add" data-add="${p.id}" type="button" aria-label="Add ${p.name} to bag">Add to bag</button></div></div></article>`).join("");
  grid.querySelectorAll(".tile img").forEach(img => img.addEventListener("error", () => { img.style.display = "none"; }, { once: true }));
  grid.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => addToCart(b.dataset.add)));
}

function addToCart(id) {
  const l = cart.find(x => x.id === id);
  l ? l.quantity++ : cart.push({ id, quantity: 1 });
  commit(); openCart();
}
function commit() { cart = cart.filter(l => prod(l.id) && l.quantity > 0); save("cl-cart", cart); renderCart(); }
const cartTotal = () => cart.reduce((t, l) => t + prod(l.id).price * l.quantity, 0);

function renderCart() {
  const count = cart.reduce((t, l) => t + l.quantity, 0);
  $("#cart-count").textContent = count;
  $("#drawer-count").textContent = `(${count})`;
  $("#cart-subtotal").textContent = money(cartTotal());
  $("#cart-empty").hidden = count > 0;
  $("#cart-summary").hidden = $("#cart-items").hidden = count === 0;
  $("#cart-items").innerHTML = cart.map(l => { const p = prod(l.id); return `<article class="line"><img class="sw" src="${p.image}" alt="" style="--c:${p.color}"><div><h3>${p.name}</h3><p>${money(p.price)}</p><div class="qty"><button type="button" data-q="${p.id}" data-d="-1" aria-label="Decrease quantity">−</button><span>${l.quantity}</span><button type="button" data-q="${p.id}" data-d="1" aria-label="Increase quantity">+</button></div></div><div class="end"><strong>${money(p.price * l.quantity)}</strong><button type="button" data-rm="${p.id}">Remove</button></div></article>`; }).join("");
  document.querySelectorAll("#cart-items .sw").forEach(img => img.addEventListener("error", () => { img.style.display = "none"; }, { once: true }));
  document.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => { cart.find(x => x.id === b.dataset.q).quantity += +b.dataset.d; commit(); }));
  document.querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => { cart = cart.filter(x => x.id !== b.dataset.rm); commit(); }));
}

let cartOpener = null;
function openCart() {
  cartOpener = document.activeElement;
  drawer.classList.add("open"); drawer.inert = false; drawer.setAttribute("aria-hidden", "false");
  scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("show"));
  document.body.classList.add("lock"); $("#cart-close").focus();
}
function closeCart() {
  drawer.classList.remove("open"); drawer.inert = true; drawer.setAttribute("aria-hidden", "true");
  scrim.classList.remove("show"); document.body.classList.remove("lock");
  if (cartOpener instanceof HTMLElement) cartOpener.focus();
  setTimeout(() => { if (!drawer.classList.contains("open")) scrim.hidden = true; }, 260);
}

function renderOrders() {
  const h = $("#order-history");
  if (!orders.length) { h.innerHTML = '<p class="order">No orders yet.</p>'; return; }
  h.innerHTML = [...orders].reverse().map(o => `<article class="order"><div class="row"><strong>Order ${o.id}</strong><span>${o.date}</span></div><p>${o.items.map(i => `${i.name} × ${i.quantity}`).join(", ")}</p><div class="row"><span class="tag">${o.status}</span><strong>${money(o.total)}</strong></div></article>`).join("");
}

$("#cart-open").addEventListener("click", openCart);
$("#cart-close").addEventListener("click", closeCart);
$("#continue-shopping").addEventListener("click", closeCart);
scrim.addEventListener("click", closeCart);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
  const t = e.target, typing = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement;
  if (e.key === "/" && !typing) { e.preventDefault(); search.focus(); }
});
search.addEventListener("input", renderProducts);
sortSel.addEventListener("change", renderProducts);
$("#clear-filters").addEventListener("click", () => { activeCat = "All"; activeRegion = ""; search.value = ""; sortSel.value = "featured"; renderLadder(); renderChips(); renderProducts(); });

$("#checkout-open").addEventListener("click", () => {
  $("#checkout-summary").innerHTML = cart.map(l => `<div class="row"><span>${prod(l.id).name} × ${l.quantity}</span><strong>${money(prod(l.id).price * l.quantity)}</strong></div>`).join("");
  $("#checkout-total").textContent = money(cartTotal());
  closeCart(); $("#checkout-modal").showModal();
});
document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => document.getElementById(b.dataset.close).close()));
document.querySelectorAll(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.close(); }));

$("#checkout-form").addEventListener("submit", e => {
  e.preventDefault();
  if (!cart.length) return;
  const f = e.currentTarget, d = new FormData(f);
  const items = cart.map(l => ({ name: prod(l.id).name, price: prod(l.id).price, quantity: l.quantity }));
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const order = { id: `CL-${Date.now().toString().slice(-7)}`, date: new Intl.DateTimeFormat("en-LK", { dateStyle: "medium" }).format(new Date()), customer: String(d.get("name")).trim(), items, total, status: "Demo order placed" };
  orders.push(order); save("cl-orders", orders);
  cart = []; commit(); f.reset(); $("#checkout-modal").close();
  $("#success-message").textContent = `Thanks, ${order.customer}. Your demo order is saved in this browser.`;
  $("#success-order").innerHTML = `<strong>${order.id}</strong><br>${items.map(i => `${i.name} × ${i.quantity}`).join("<br>")}<br><strong>Total: ${money(total)}</strong>`;
  $("#success-modal").showModal();
});
$("#orders-open").addEventListener("click", () => { renderOrders(); $("#orders-modal").showModal(); });
$("#success-orders").addEventListener("click", () => { $("#success-modal").close(); renderOrders(); $("#orders-modal").showModal(); });
$("#newsletter-form").addEventListener("submit", e => { e.preventDefault(); $("#newsletter-message").textContent = "Thanks. This is a demo, so your email wasn't saved."; e.currentTarget.reset(); });

$("#year").textContent = new Date().getFullYear();
renderLadder(); renderChips(); renderProducts(); renderCart();
