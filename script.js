// Lista de produtos da cantina
const products = [
  { id: 1, name: "Sanduíche da Casa", category: "Sanduíches", description: "Pão artesanal, frango grelhado, queijo e salada.", price: 1800, image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Hambúrguer Clássico", category: "Sanduíches", description: "Hambúrguer com queijo e molho especial.", price: 2500, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Salada Fresca", category: "Leves", description: "Folhas, tomate, cenoura e frango.", price: 2200, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Sumo Natural", category: "Bebidas", description: "Sumo natural preparado no momento.", price: 900, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Tosta Mista", category: "Sanduíches", description: "Pão tostado com queijo e fiambre.", price: 1300, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Iogurte com Fruta", category: "Leves", description: "Iogurte com fruta da época.", price: 1100, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Água Mineral", category: "Bebidas", description: "Água fresca.", price: 500, image: "https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Bolo do Dia", category: "Doces", description: "Fatia de bolo caseiro.", price: 800, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80" }
];

const money = value => new Intl.NumberFormat("pt-AO", {
  style: "currency", currency: "AOA", maximumFractionDigits: 0
}).format(value);

let cart = [];
let activeCategory = "Todos";
let selectedTime = "10:15";

const get = selector => document.querySelector(selector);

// Mostrar categorias
function renderFilters() {
  const categories = ["Todos", ...new Set(products.map(product => product.category))];

  get("#filters").innerHTML = categories.map(category => `
    <button class="${category === activeCategory ? "ativo" : ""}" data-category="${category}">
      ${category}
    </button>
  `).join("");
}

// Mostrar produtos do cardápio
function renderProducts() {
  const visibleProducts = activeCategory === "Todos"
    ? products
    : products.filter(product => product.category === activeCategory);

  get("#product-grid").innerHTML = visibleProducts.map(product => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <div class="product-top">
          <h3>${product.name}</h3>
          <span class="price">${money(product.price)}</span>
        </div>
        <p>${product.description}</p>
        <button class="add-btn" data-add="${product.id}">Adicionar ao pedido</button>
      </div>
    </article>
  `).join("");
}

// Adicionar um produto ao carrinho
function addToCart(item) {
  const existing = cart.find(product => product.name === item.name);

  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });

  updateCart();
  showMessage(item.name + " adicionado ao carrinho.");
}

// Atualizar a quantidade no ícone do carrinho
function updateCart() {
  const quantity = cart.reduce((total, item) => total + item.qty, 0);
  get("#bag-count").textContent = quantity;
}

// Mostrar uma mensagem simples
function showMessage(message) {
  const box = get("#toast-root");
  box.textContent = message;
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => box.textContent = "", 2500);
}

// Abrir o carrinho
function openCart() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const items = cart.length
    ? cart.map(item => `
        <div class="cart-line">
          <div><b>${item.name}</b><small>Quantidade: ${item.qty}</small></div>
          <strong>${money(item.price * item.qty)}</strong>
        </div>
      `).join("")
    : "<p>O carrinho está vazio. Escolha um produto no cardápio.</p>";

  get("#overlay-root").innerHTML = `
    <div class="modal-backdrop">
      <section class="cart-modal" role="dialog" aria-modal="true" aria-label="Carrinho">
        <div class="cart-head"><h2>O seu pedido</h2><button id="close-cart">×</button></div>
        ${items}
        <div class="cart-footer">
          <strong>Total: ${money(total)}</strong>
          <button id="checkout" ${cart.length ? "" : "disabled"}>Confirmar pedido</button>
        </div>
      </section>
    </div>
  `;

  get("#close-cart").addEventListener("click", closeCart);
  get(".modal-backdrop").addEventListener("click", event => {
    if (event.target.classList.contains("modal-backdrop")) closeCart();
  });
  get("#checkout").addEventListener("click", () => {
    showMessage("Pedido registado para as " + selectedTime + ". (Demonstração)");
    cart = [];
    updateCart();
    closeCart();
  });
}

function closeCart() {
  get("#overlay-root").innerHTML = "";
}

// Criar as opções do combo
function renderCombo() {
  const groups = [
    { id: "combo-main", title: "Prato", category: "Sanduíches" },
    { id: "combo-drink", title: "Bebida", category: "Bebidas" },
    { id: "combo-side", title: "Acompanhamento", category: "Leves" }
  ];

  get("#combo-builder").innerHTML = groups.map(group => `
    <label>${group.title}
      <select id="${group.id}">
        ${products.filter(product => product.category === group.category).map(product =>
          `<option value="${product.id}">${product.name} — ${money(product.price)}</option>`
        ).join("")}
      </select>
    </label>
  `).join("") + `
    <div class="combo-total">
      <strong id="combo-price"></strong>
      <button id="add-combo">Adicionar combo</button>
    </div>
  `;

  groups.forEach(group => get("#" + group.id).addEventListener("change", updateCombo));
  get("#add-combo").addEventListener("click", addCombo);
  updateCombo();
}

// Calcular o preço do combo com desconto
function getComboProducts() {
  return ["#combo-main", "#combo-drink", "#combo-side"].map(selector => {
    const id = Number(get(selector).value);
    return products.find(product => product.id === id);
  });
}

function updateCombo() {
  const total = getComboProducts().reduce((sum, product) => sum + product.price, 0);
  get("#combo-price").textContent = "Total com desconto: " + money(Math.round(total * 0.85));
}

// Adicionar o combo como um único item com desconto já aplicado
function addCombo() {
  const items = getComboProducts();
  const total = Math.round(items.reduce((sum, product) => sum + product.price, 0) * 0.85);
  addToCart({ name: "Combo (3 produtos)", price: total });
}

// Escolher o horário de retirada
function renderTimes() {
  const times = ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15"];

  get("#time-options").innerHTML = times.map(time => `
    <button class="${time === selectedTime ? "ativo" : ""}" data-time="${time}">${time}</button>
  `).join("");

  get("#time-options").querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      selectedTime = button.dataset.time;
      get("#selected-time").textContent = selectedTime;
      get("#pickup-time").textContent = selectedTime;
      renderTimes();
    });
  });
}

// Eventos da página
get("#filters").addEventListener("click", event => {
  if (!event.target.dataset.category) return;
  activeCategory = event.target.dataset.category;
  renderFilters();
  renderProducts();
});

get("#product-grid").addEventListener("click", event => {
  const id = Number(event.target.dataset.add);
  if (!id) return;
  addToCart(products.find(product => product.id === id));
});

get("#open-cart").addEventListener("click", openCart);
get("#menu-toggle").addEventListener("click", () => get("#nav-links").classList.toggle("aberto"));
get("#nav-links").addEventListener("click", event => {
  if (event.target.tagName === "A") get("#nav-links").classList.remove("aberto");
});

renderFilters();
renderProducts();
renderCombo();
renderTimes();
updateCart();
