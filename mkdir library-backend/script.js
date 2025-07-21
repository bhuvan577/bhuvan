/* ---------------- Data Store ---------------- */
let resources = [
  {
    id: 39,
    isbn: "DL2109",
    type: "Book",
    title: "Middlemarch",
    edition: "7",
    author: "George Eliot",
    category: "Action and Adventure",
    publisher: "William Blackwood and Sons",
    language: "English",
    quantity: 15,
    available: 12,
    requested: 10,
    cover: "",
    notes: ""
  },
  {
    id: 40,
    isbn: "AB1234",
    type: "Book",
    title: "Macbeth",
    edition: "5",
    author: "William Shakespeare",
    category: "Drama",
    publisher: "Folio Press",
    language: "English",
    quantity: 9,
    available: 6,
    requested: 2,
    cover: "",
    notes: ""
  },
  {
    id: 41,
    isbn: "ZX9090",
    type: "Book",
    title: "The Moon Opera",
    edition: "6",
    author: "Bi Feiyu",
    category: "Fiction",
    publisher: "People's Literature",
    language: "Chinese",
    quantity: 6,
    available: 5,
    requested: 1,
    cover: "",
    notes: ""
  }
];

let selectedId = null;
let nextId = 100;

/* ---------------- DOM References ---------------- */
const addResourceView = document.getElementById("addResourceView");
const allResourcesView = document.getElementById("allResourcesView");
const detailsView = document.getElementById("detailsView");
const modeSwitch = document.getElementById("modeSwitch");
const searchInput = document.getElementById("searchInput");
const openBorrowBtn = document.getElementById("openBorrowDirect");
const bottomTabs = document.getElementById("bottomTabs");

/* ---------------- Rendering ---------------- */
function renderList() {
  allResourcesView.innerHTML = "";
  const query = searchInput.value.trim().toLowerCase();
  resources
    .filter(r => {
      if(!query) return true;
      return [r.title, r.author, r.category].some(v => v.toLowerCase().includes(query));
    })
    .forEach(r => {
      const card = document.createElement("div");
      card.className = "resource-card";
      card.dataset.id = r.id;
      if(r.id === selectedId) card.classList.add("selected");

      const cover = document.createElement("div");
      cover.className = "cover";
      if(r.cover) {
        cover.style.backgroundImage = `url(${r.cover})`;
        cover.style.backgroundSize = "cover";
        cover.style.backgroundPosition = "center";
        cover.textContent = "";
      } else {
        cover.textContent = "No Cover";
      }

      const meta = document.createElement("div");
      meta.className = "res-meta";
      meta.innerHTML = `
        <div class="title">${r.title}</div>
        <div class="badges">
          <span class="badge">${r.category}</span>
          <span class="badge">${r.language}</span>
        </div>
        <div style="font-size:11px;color:#667;">${r.author}</div>
      `;

      const stats = document.createElement("div");
      stats.className = "res-stats";
      const availClass = r.available === 0 ? "danger" : (r.available < Math.max(2, r.quantity*0.2) ? "warn" : "");
      stats.innerHTML = `
        <div>Qty: <strong>${r.quantity}</strong></div>
        <div>Avail: <span class="state-pill ${availClass}">${r.available}</span></div>
        <div>Req: ${r.requested ?? 0}</div>
      `;

      const menuBtn = document.createElement("button");
      menuBtn.className = "actions-trigger";
      menuBtn.type = "button";
      menuBtn.textContent = "⋮";
      menuBtn.addEventListener("click", e => {
        e.stopPropagation();
        toggleInlineMenu(card, r.id);
      });

      card.append(cover, meta, stats, menuBtn);
      card.addEventListener("click", () => selectResource(r.id));
      allResourcesView.appendChild(card);
    });

  if(resources.length === 0) {
    allResourcesView.innerHTML = `<div style="padding:30px;color:#666;">No resources yet. Add one in “Add Resource”.</div>`;
  }
}

function renderDetails(r) {
  if(!r) {
    detailsView.innerHTML = `
      <div class="placeholder">
        <h3>Select a resource</h3>
        <p>Choose an item from the list to view details.</p>
      </div>
    `;
    return;
  }
  detailsView.innerHTML = `
    <div class="details-header">
      <div class="cover">${r.cover ? "" : "No Cover"}</div>
      <div>
        <h3>${r.title}</h3>
        <div class="detail-tags">
          <span class="badge">${r.type}</span>
          <span class="badge">${r.category}</span>
          <span class="badge">${r.language}</span>
        </div>
      </div>
    </div>
    <table class="detail-table" aria-label="Resource metadata">
      <tr><th>Resource ID</th><td>${r.id}</td></tr>
      <tr><th>ISBN / Barcode</th><td>${r.isbn}</td></tr>
      <tr><th>Resource Type</th><td>${r.type}</td></tr>
      <tr><th>Category</th><td>${r.category}</td></tr>
      <tr><th>Author</th><td>${r.author}</td></tr>
      <tr><th>Publisher Name</th><td>${r.publisher}</td></tr>
      <tr><th>Edition</th><td>${r.edition || "-"}</td></tr>
      <tr><th>Language</th><td>${r.language}</td></tr>
      <tr><th>Total Quantity</th><td>${r.quantity}</td></tr>
      <tr><th>Available Quantity</th><td>${r.available}</td></tr>
      <tr><th>Request Quantity</th><td>${r.requested ?? 0}</td></tr>
      <tr><th>Notes</th><td>${r.notes || "-"}</td></tr>
    </table>
    <div class="detail-actions">
      <button class="btn primary" onclick="openBorrowModal(${r.id})">Borrow</button>
      <button class="btn" onclick="editResource(${r.id})">Edit</button>
      <button class="btn" style="color:var(--danger);border-color:var(--danger);" onclick="deleteResource(${r.id})">Delete</button>
    </div>
  `;
  if(r.cover) {
    const cov = detailsView.querySelector(".details-header .cover");
    cov.style.backgroundImage = `url(${r.cover})`;
    cov.style.backgroundSize = "cover";
    cov.style.backgroundPosition = "center";
  }
}

/* ---------------- Selection / Modes ---------------- */
function selectResource(id) {
  selectedId = id;
  renderList();
  const r = resources.find(r => r.id === id);
  renderDetails(r);
  openBorrowBtn.disabled = false;
  document.getElementById("bottomBorrow")?.removeAttribute("disabled");
}

function switchMode(mode) {
  if(mode === "add") {
    addResourceView.classList.remove("hidden");
    allResourcesView.classList.add("hidden");
    document.getElementById("viewTitle").textContent = "Add Resource";
  } else {
    addResourceView.classList.add("hidden");
    allResourcesView.classList.remove("hidden");
    document.getElementById("viewTitle").textContent = "All Resources";
  }
  [...modeSwitch.querySelectorAll("button")].forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  if(window.innerWidth <= 640) {
    // update bottom tabs
    [...bottomTabs.querySelectorAll("button")].forEach(btn => btn.classList.toggle("active", btn.dataset.tab === (mode==="add"?"add":"list")));
  }
}

modeSwitch.addEventListener("click", e => {
  if(e.target.tagName === "BUTTON") {
    switchMode(e.target.dataset.mode);
  }
});

searchInput.addEventListener("input", renderList);

/* ---------------- Add Form ---------------- */
document.getElementById("addForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const q = parseInt(data.quantity, 10) || 0;
  const resource = {
    id: nextId++,
    isbn: data.isbn.trim(),
    type: data.type,
    title: data.title.trim(),
    edition: data.edition.trim(),
    author: data.author.trim(),
    category: data.category.trim(),
    publisher: data.publisher.trim(),
    language: data.language,
    quantity: q,
    available: q,
    requested: 0,
    cover: data.cover.trim(),
    notes: data.notes.trim()
  };
  resources.unshift(resource);
  e.target.reset();
  switchMode("list");
  renderList();
  selectResource(resource.id);
});

/* ---------------- Inline Menu ---------------- */
function toggleInlineMenu(card, id) {
  const existing = card.querySelector(".inline-menu");
  if(existing) { existing.remove(); return; }
  card.querySelectorAll(".inline-menu").forEach(m => m.remove());
  const menu = document.createElement("div");
  menu.className = "inline-menu";
  menu.innerHTML = `
    <button data-act="borrow">🛒 Borrow</button>
    <button data-act="edit">✏️ Edit</button>
    <button data-act="delete" style="color:var(--danger);">🗑 Delete</button>
  `;
  menu.addEventListener("click", e => {
    if(e.target.dataset.act === "borrow") openBorrowModal(id);
    if(e.target.dataset.act === "edit") editResource(id);
    if(e.target.dataset.act === "delete") deleteResource(id);
    menu.remove();
    e.stopPropagation();
  });
  card.appendChild(menu);
  document.addEventListener("click", function outside(ev) {
    if(!menu.contains(ev.target)) {
      menu.remove();
      document.removeEventListener("click", outside);
    }
  });
}

/* ---------------- Borrow Modal ---------------- */
function openBorrowModal(id) {
  const r = resources.find(x => x.id === id);
  if(!r) return;
  const modalRoot = document.getElementById("modalRoot");
  modalRoot.innerHTML = `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal">
        <div class="modal-header">
          <h3>Borrow Resource</h3>
          <button class="btn" id="closeModal" style="padding:6px 12px;">✕</button>
        </div>
        <div class="modal-body">
          <p style="margin-top:0;font-size:13px;color:#555;">Borrowing: <strong>${r.title}</strong> by ${r.author}</p>
          <form id="borrowForm">
            <div class="borrow-grid">
              <div class="form-field">
                <label>Title</label>
                <input value="${r.title}" disabled>
              </div>
              <div class="form-field">
                <label>Edition</label>
                <input value="${r.edition || ''}" disabled>
              </div>
              <div class="form-field">
                <label>Language</label>
                <input value="${r.language}" disabled>
              </div>
              <div class="form-field">
                <label>From Date *</label>
                <input type="date" name="from" required>
              </div>
              <div class="form-field">
                <label>To Date *</label>
                <input type="date" name="to" required>
              </div>
              <div class="form-field">
                <label>No Of Days</label>
                <input name="days" disabled placeholder="0">
              </div>
              <div class="form-field" style="grid-column:1 / -1;">
                <label>Notes</label>
                <textarea name="notes" rows="2" placeholder="Optional"></textarea>
              </div>
            </div>
            <div class="info-txt">Availability: ${r.available} of ${r.quantity} remaining.</div>
            <div class="modal-footer">
              <button type="submit" class="btn primary">Confirm Borrow</button>
              <button type="button" class="btn" id="cancelBorrow">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const backdrop = modalRoot.querySelector(".modal-backdrop");
  const form = modalRoot.querySelector("#borrowForm");
  const fromInput = form.querySelector('[name="from"]');
  const toInput = form.querySelector('[name="to"]');
  const daysInput = form.querySelector('[name="days"]');

  function computeDays() {
    const f = fromInput.value;
    const t = toInput.value;
    if(f && t) {
      const d1 = new Date(f);
      const d2 = new Date(t);
      const diff = Math.round((d2 - d1)/(1000*60*60*24));
      daysInput.value = isNaN(diff) ? "" : diff;
    }
  }
  fromInput.addEventListener("change", computeDays);
  toInput.addEventListener("change", computeDays);

  form.addEventListener("submit", e => {
    e.preventDefault();
    if(r.available <= 0) {
      alert("No copies available.");
      return;
    }
    r.available -= 1;
    r.requested = (r.requested || 0) + 1;
    renderList();
    renderDetails(r);
    modalRoot.innerHTML = "";
  });

  backdrop.addEventListener("click", e => {
    if(e.target === backdrop) modalRoot.innerHTML = "";
  });
  modalRoot.querySelector("#closeModal").onclick =
    modalRoot.querySelector("#cancelBorrow").onclick = () => modalRoot.innerHTML = "";
}

openBorrowBtn.addEventListener("click", () => {
  if(selectedId != null) openBorrowModal(selectedId);
});

/* ---------------- Edit / Delete ---------------- */
function editResource(id) {
  const r = resources.find(x => x.id === id);
  if(!r) return;
  switchMode("add");
  window.scrollTo({top:0,behavior:"smooth"});
  const form = document.getElementById("addForm");
  form.isEditing = id;
  form.isEditingOriginal = { ...r };
  form.isEditingFlag = true;
  form.querySelector('[name="isbn"]').value = r.isbn;
  form.querySelector('[name="type"]').value = r.type;
  form.querySelector('[name="title"]').value = r.title;
  form.querySelector('[name="edition"]').value = r.edition;
  form.querySelector('[name="author"]').value = r.author;
  form.querySelector('[name="category"]').value = r.category;
  form.querySelector('[name="publisher"]').value = r.publisher;
  form.querySelector('[name="language"]').value = r.language;
  form.querySelector('[name="quantity"]').value = r.quantity;
  form.querySelector('[name="cover"]').value = r.cover;
  form.querySelector('[name="notes"]').value = r.notes;
  document.getElementById("viewTitle").textContent = "Edit Resource";
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = "Update";
  form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    Object.assign(r, {
      isbn: data.isbn.trim(),
      type: data.type,
      title: data.title.trim(),
      edition: data.edition.trim(),
      author: data.author.trim(),
      category: data.category.trim(),
      publisher: data.publisher.trim(),
      language: data.language,
      quantity: parseInt(data.quantity,10)||0,
      cover: data.cover.trim(),
      notes: data.notes.trim()
    });
    if(r.available > r.quantity) r.available = r.quantity;
    renderList();
    renderDetails(r);
    submitBtn.textContent = "Submit";
    form.reset();
    form.onsubmit = null;
    switchMode("list");
    document.getElementById("viewTitle").textContent = "All Resources";
  };
}

function deleteResource(id) {
  if(!confirm("Delete this resource?")) return;
  resources = resources.filter(r => r.id !== id);
  if(selectedId === id) {
    selectedId = null;
    renderDetails(null);
    openBorrowBtn.disabled = true;
    document.getElementById("bottomBorrow")?.setAttribute("disabled","true");
  }
  renderList();
}

/* ---------------- Sidebar Toggles ---------------- */
document.querySelectorAll(".nav-collapsible").forEach(c => {
  c.addEventListener("click", () => {
    c.classList.toggle("open");
    const next = c.nextElementSibling;
    next.classList.toggle("open");
  });
});

document.querySelectorAll(".nav-item[data-view]").forEach(item => {
  item.addEventListener("click", () => {
    const view = item.dataset.view;
    if(view === "add") switchMode("add");
    if(view === "all") switchMode("list");
    if(view === "borrow" && selectedId != null) openBorrowModal(selectedId);
    // highlight
    document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
    item.classList.add("active");
  });
});

/* ---------------- Hamburger (Mobile) ---------------- */
const sidebar = document.getElementById("sidebar");
document.getElementById("hamburger").addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

/* close sidebar when clicking outside on mobile */
document.addEventListener("click", e => {
  if(window.innerWidth <= 768 && sidebar.classList.contains("open")) {
    if(!sidebar.contains(e.target) && e.target.id !== "hamburger") {
      sidebar.classList.remove("open");
    }
  }
});

/* ---------------- Bottom Tabs (Mobile) ---------------- */
function handleBottomTabs() {
  if(window.innerWidth <= 640) {
    bottomTabs.style.display = "flex";
  } else {
    bottomTabs.style.display = "none";
  }
}
window.addEventListener("resize", handleBottomTabs);
handleBottomTabs();

bottomTabs.addEventListener("click", e => {
  if(e.target.closest("button")) {
    const btn = e.target.closest("button");
    const tab = btn.dataset.tab;
    [...bottomTabs.querySelectorAll("button")].forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if(tab === "add") switchMode("add");
    if(tab === "list") switchMode("list");
    if(tab === "borrow" && selectedId) openBorrowModal(selectedId);
  }
});

/* ---------------- Device Switch (Demo Only) ---------------- */
document.getElementById("deviceSwitch").addEventListener("click", e => {
  if(e.target.tagName !== "BUTTON") return;
  const size = e.target.dataset.size;
  [...e.currentTarget.children].forEach(b => b.classList.remove("active"));
  e.target.classList.add("active");
  document.documentElement.style.setProperty("--sim-width","100%");
  if(size === "tablet") document.body.style.maxWidth = "900px";
  else if(size === "mobile") document.body.style.maxWidth = "480px";
  else document.body.style.maxWidth = "";
});

/* ---------------- Initial Render ---------------- */
renderList();
switchMode("add");

/* Accessibility: esc closes modal */
document.addEventListener("keydown", e => {
  if(e.key === "Escape") {
    document.getElementById("modalRoot").innerHTML = "";
  }
});
