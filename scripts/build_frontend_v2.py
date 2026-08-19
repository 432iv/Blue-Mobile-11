#!/usr/bin/env python3
"""Blue Mobile POS v2 — frontend HTML modifications (combobox, manual items,
type-specific product fields, purchase batches modal, daily notes)."""
p = '/home/user/Blue-Mobile/frontend/index.html'
s = open(p, encoding='utf-8').read()

# ---------- 1. Sales form: replace product select + cost field ----------
old_sale_form = '''                  <div class="field full">
                    <label data-i18n="field_product">Product</label>
                    <select id="sale-product" required></select>
                  </div>
                  <div class="field">
                    <label data-i18n="field_qty">Quantity</label>
                    <input type="number" id="sale-qty" inputmode="numeric" min="1" max="10000" value="1" required>
                  </div>
                  <div class="field">
                    <label data-i18n="field_cost">Cost Price</label>
                    <input type="number" id="sale-cost" inputmode="decimal" min="0" max="10000" step="0.01" placeholder="0.00" required>
                  </div>'''
new_sale_form = '''                  <div class="field full">
                    <label data-i18n="search_product">Product or Service</label>
                    <div class="combobox" id="sale-combobox">
                      <input type="text" id="sale-search" autocomplete="off" data-i18n-placeholder="search_product_ph" placeholder="Search product or type a service...">
                      <input type="hidden" id="sale-product-id">
                      <div class="combobox-list" id="sale-search-list"></div>
                    </div>
                    <div class="sale-selected" id="sale-selected-info" style="display:none;"></div>
                  </div>
                  <div class="field">
                    <label data-i18n="field_qty">Quantity</label>
                    <input type="number" id="sale-qty" inputmode="numeric" min="1" max="10000" value="1" required>
                  </div>'''
assert old_sale_form in s, "sale form block not found"
s = s.replace(old_sale_form, new_sale_form)

# ---------- 2. Daily Notes panel (after two-col grid, before sales table) ----------
old_table = '''          <div class="glass-card panel">
            <h3 data-i18n="sales_table_title">Today's Sales</h3>'''
new_notes = '''          <div class="glass-card panel" id="daily-notes-panel">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/><path d="M9 12h6M9 16h6"/></svg>
              <span data-i18n="daily_notes">Daily Notes</span>
            </h3>
            <div id="daily-notes-list"></div>
            <div style="display:flex; gap:10px; margin-top:12px;">
              <input type="text" id="note-input" data-i18n-placeholder="note_placeholder" placeholder="e.g. Gave my brother 100 LYD" style="flex:1; padding:11px 14px; border-radius:12px; border:1px solid var(--border-glass); background:var(--surface-strong); color:var(--text-primary);">
              <button class="btn btn-primary" id="note-add-btn" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 5v14M5 12h14"/></svg>
                <span data-i18n="add_note">Add Note</span>
              </button>
            </div>
          </div>

          <div class="glass-card panel">
            <h3 data-i18n="sales_table_title">Today's Sales</h3>'''
assert old_table in s, "sales table panel not found"
s = s.replace(old_table, new_notes, 1)

# ---------- 3. Product modal: new type options + new fields ----------
old_cat = '''          <select id="product-category-input">
            <option value="Phones">Phones</option>
            <option value="Phone Covers">Phone Covers</option>
            <option value="Chargers">Chargers</option>
            <option value="Cables">Cables</option>
            <option value="Earphones">Earphones</option>
            <option value="Accessories" selected>Accessories</option>
          </select>'''
new_cat = '''          <select id="product-category-input">
            <option value="Chargers">Chargers</option>
            <option value="Cables">Cables</option>
            <option value="Phone Cases">Phone Cases</option>
            <option value="Screen Protectors">Screen Protectors</option>
            <option value="Bluetooth Earphones">Bluetooth Earphones</option>
            <option value="Wired Earphones">Wired Earphones</option>
            <option value="AUX Cables">AUX Cables</option>
            <option value="Adapters & Connectors">Adapters & Connectors</option>
            <option value="Power Banks">Power Banks</option>
            <option value="Phones">Phones</option>
            <option value="Other Accessories" selected>Other Accessories</option>
          </select>'''
assert old_cat in s, "category select not found"
s = s.replace(old_cat, new_cat)

# add description field after brand field
old_brand = '''        <div class="field">
          <label data-i18n="field_brand">Brand</label>
          <input type="text" id="product-brand-input" data-i18n-placeholder="ph_brand" placeholder="e.g. Samsung">
        </div>'''
new_brand = '''        <div class="field" id="field-product-brand">
          <label data-i18n="field_brand">Brand</label>
          <input type="text" id="product-brand-input" data-i18n-placeholder="ph_brand" placeholder="e.g. Samsung">
        </div>
        <div class="field" id="field-product-wattage" style="display:none;">
          <label data-i18n="field_wattage">Wattage</label>
          <input type="text" id="product-wattage-input" placeholder="e.g. 30W">
        </div>
        <div class="field" id="field-product-connector" style="display:none;">
          <label data-i18n="field_connector">Connector / Type</label>
          <input type="text" id="product-connector-input" placeholder="e.g. Type-C → Lightning">
        </div>
        <div class="field full" id="field-product-model" style="display:none;">
          <label data-i18n="field_model">Compatible Phone Model</label>
          <div class="combobox">
            <input type="text" id="product-model-search" autocomplete="off" data-i18n-placeholder="model_ph" placeholder="Search phone model (Apple, Samsung, ...)">
            <input type="hidden" id="product-model-id">
            <div class="combobox-list" id="product-model-list"></div>
          </div>
          <div id="product-model-add-row" style="display:none; margin-top:10px; gap:8px; flex-wrap:wrap;">
            <select id="product-model-brand" style="flex:1; min-width:120px; padding:10px 12px; border-radius:12px; border:1px solid var(--border-glass); background:var(--surface-strong); color:var(--text-primary);">
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Redmi">Redmi</option>
              <option value="Honor">Honor</option>
              <option value="Infinix">Infinix</option>
              <option value="Tecno">Tecno</option>
              <option value="Other">Other</option>
            </select>
            <input type="text" id="product-model-name" style="flex:2; min-width:140px; padding:10px 12px; border-radius:12px; border:1px solid var(--border-glass); background:var(--surface-strong); color:var(--text-primary);" placeholder="Model name, e.g. iPhone 15">
            <button type="button" class="btn btn-primary" id="product-model-save" style="padding:10px 16px;">Add</button>
          </div>
        </div>
        <div class="field full">
          <label data-i18n="field_description">Description / Specifications</label>
          <input type="text" id="product-description-input" data-i18n-placeholder="ph_description" placeholder="e.g. Type-C → iPhone, fast charging">
        </div>'''
assert old_brand in s, "brand field not found"
s = s.replace(old_brand, new_brand)

# ---------- 4. Purchase modal (after product modal) ----------
purchase_modal = '''<!-- Purchase / restock modal -->
<div class="modal-overlay" id="modal-purchase">
  <div class="modal glass-card">
    <div class="modal-head">
      <h3 data-i18n="purchase_title">New Purchase</h3>
      <button class="modal-close" data-close="modal-purchase"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
    <div class="warn-box" style="margin-bottom:16px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
      <p><strong id="purchase-product-name"></strong><br><span data-i18n="purchase_hint">Add stock to this product. A new purchase batch is created internally — no duplicate product.</span></p>
    </div>
    <form id="purchase-form">
      <div class="form-grid">
        <div class="field">
          <label data-i18n="field_qty">Quantity</label>
          <input type="number" id="purchase-qty" inputmode="numeric" min="1" max="100000" value="1" required>
        </div>
        <div class="field">
          <label data-i18n="purchase_price">Purchase Price</label>
          <input type="number" id="purchase-cost" inputmode="decimal" min="0" step="0.01" placeholder="0.00" required>
        </div>
      </div>
      <input type="hidden" id="purchase-product-id">
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-close="modal-purchase" data-i18n="cancel">Cancel</button>
        <button type="submit" class="btn btn-primary" data-i18n="save">Save</button>
      </div>
    </form>
  </div>
</div>

<!-- Start new day modal -->'''
s = s.replace('<!-- Start new day modal -->', purchase_modal, 1)

# ---------- 5. Report detail modal: notes container ----------
old_report = '''    <div id="report-detail-summary" style="margin-bottom:16px;"></div>
    <div class="table-wrap">'''
new_report = '''    <div id="report-detail-summary" style="margin-bottom:16px;"></div>
    <div id="report-detail-notes" style="margin-bottom:16px; display:none;">
      <h4 style="margin-bottom:8px; font-size:.9rem; color:var(--text-muted);" data-i18n="daily_notes">Daily Notes</h4>
      <div id="report-detail-notes-list"></div>
    </div>
    <div class="table-wrap">'''
assert old_report in s, "report detail summary not found"
s = s.replace(old_report, new_report, 1)

# ---------- 6. CSS ----------
css = '''
/* ---------- Combobox / autocomplete ---------- */
.combobox{ position:relative; }
.combobox > input[type="text"]{
  width:100%; padding:12px 14px; border-radius:12px; border:1px solid var(--border-glass);
  background:var(--surface-strong); color:var(--text-primary); font-size:.95rem;
}
.combobox > input:focus{ outline:none; border-color:var(--accent-cyan); box-shadow:0 0 0 4px rgba(47,216,198,0.15); }
.combobox-list{
  position:absolute; top:calc(100% + 6px); left:0; right:0; z-index:120;
  max-height:300px; overflow-y:auto; border-radius:14px;
  background:var(--surface-solid); border:1px solid var(--border-glass);
  box-shadow:var(--shadow-soft); display:none;
}
.combobox-list.open{ display:block; }
.combobox-item{
  padding:11px 14px; cursor:pointer; border-bottom:1px dashed var(--border-glass);
  transition:background .15s ease;
}
.combobox-item:last-child{ border-bottom:none; }
.combobox-item:hover, .combobox-item.highlight{ background:var(--surface-strong); }
.combobox-item .ci-name{ font-weight:700; font-size:.9rem; display:flex; align-items:center; gap:8px; }
.combobox-item .ci-desc{ font-size:.76rem; color:var(--text-muted); margin-top:2px; }
.combobox-item .ci-meta{ display:flex; gap:14px; margin-top:5px; font-family:var(--font-mono); font-size:.75rem; }
.combobox-item .ci-stock{ color:var(--accent-amber); }
.combobox-item .ci-price{ color:var(--accent-cyan); font-weight:700; }
.combobox-item.manual .ci-name{ color:var(--accent-violet); }
.combobox-item .ci-tag{
  font-size:.62rem; font-weight:700; padding:2px 7px; border-radius:8px; letter-spacing:.4px;
  background:rgba(167,139,250,0.16); color:var(--accent-violet); text-transform:uppercase;
}
.sale-selected{
  margin-top:10px; padding:12px 14px; border-radius:12px;
  background:linear-gradient(135deg,rgba(47,216,198,0.12),rgba(167,139,250,0.08));
  border:1px solid var(--border-glass); display:flex; align-items:center; gap:10px;
}
.sale-selected .ss-name{ font-weight:700; font-size:.92rem; flex:1; }
.sale-selected .ss-desc{ font-size:.76rem; color:var(--text-muted); }
.sale-selected .ss-meta{ font-family:var(--font-mono); font-size:.8rem; color:var(--accent-cyan); font-weight:700; }
.sale-selected .ss-clear{
  width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center;
  background:var(--surface-strong); color:var(--text-muted); font-size:.85rem;
}
.sale-selected .ss-clear:hover{ color:var(--accent-rose); }
/* small description line under product name in tables/cards */
.p-desc, .td-desc{
  display:block; font-size:.72rem; color:var(--text-muted); font-weight:500; margin-top:2px;
}
.pill.manual{ background:rgba(167,139,250,0.16); color:var(--accent-violet); }
/* daily notes */
.note-row{
  display:flex; align-items:center; gap:10px; padding:10px 4px;
  border-bottom:1px dashed var(--border-glass); font-size:.87rem;
}
.note-row:last-child{ border-bottom:none; }
.note-row .note-time{ font-family:var(--font-mono); font-size:.76rem; color:var(--text-faint); min-width:58px; }
.note-row .note-text{ flex:1; }
.note-row .note-del{
  width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center;
  background:var(--surface-strong); color:var(--text-faint);
}
.note-row .note-del:hover{ color:var(--accent-rose); }
#daily-notes-panel{ margin-bottom:20px; }
'''
s = s.replace('</style>', css + '\n</style>', 1)

open(p, 'w', encoding='utf-8').write(s)
print("index.html updated:", len(s), "bytes")
