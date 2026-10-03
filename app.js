/* ============================================================
   Stock Module Mockup — app.js
   ตรรกะคลิก/สลับหน้า/ฟอร์ม — ทั้งหมดทำงานฝั่ง client ล้วน ๆ
   ไม่มีการเรียก API ใด ๆ ในไฟล์นี้ (ตามที่ตกลง "ยังไม่ต้องเชื่อม DB")
   ============================================================ */

let currentRole = 'ASSET_HOLDER';
let borrowRequests = JSON.parse(JSON.stringify(SEED_BORROW_REQUESTS)); // clone seed
let itemRowCounter = 0;

// ---------------- Sidebar navigation ----------------
function toggleGroup(el) {
  el.parentElement.classList.toggle('closed');
}

document.querySelectorAll('#nav a[data-screen]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('#nav a[data-screen]').forEach((x) => x.classList.remove('active'));
    a.classList.add('active');

    const target = a.dataset.screen;
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    document.getElementById('screen-' + target).classList.add('active');
    document.getElementById('pageTitle').textContent = a.textContent.trim();
    refreshScreen(target);
  });
});

// เรียก render ล่าสุดทุกครั้งที่เปิดหน้าจอ (ข้อมูลอาจถูกแก้จากหน้าจออื่นมาก่อน)
function refreshScreen(target) {
  if (target === 'dashboard') renderDashboard();
  else if (target === 'asset-register') renderAssetTable();
  else if (target === 'receive') renderReceiveLog();
  else if (target === 'dispatch') { renderDispatchQueue(); renderDispatchReceiptQueue(); }
  else if (target === 'renewal') { renderRenewalQueue(); renderRenewalHistory(); }
  else if (target === 'return') { renderSelfReturnQueue(); renderReturnQueue(); renderReturnLog(); }
  else if (target === 'repair') { renderRepairQueue(); renderOutForRepairQueue(); }
  else if (target === 'writeoff') renderWriteoffList();
  else if (target === 'annual-check') renderAnnualCheck();
  else if (target === 'item-master') { renderCategoryList(); renderItemMaster(); }
}

function currentActiveScreenTarget() {
  const el = document.querySelector('.screen.active');
  return el ? el.id.replace('screen-', '') : null;
}

// ---------------- Role switch (mockup only) ----------------
function onRoleChange() {
  currentRole = document.getElementById('roleSwitch').value;
  const u = DEMO_USERS[currentRole];
  document.getElementById('userLabel').textContent = `${u.name} · ${u.role}`;
  document.getElementById('avatarInit').textContent = u.initials;
  document.getElementById('reqName').value = u.name;
  document.getElementById('reqTeam').value = u.team === '-' ? '(ไม่มีสังกัดทีม)' : u.team;
  if (document.getElementById('rcvResponsible')) document.getElementById('rcvResponsible').value = u.name;
  renderDashboard();
  const active = currentActiveScreenTarget();
  if (active && active !== 'dashboard' && active !== 'borrow-request') refreshScreen(active);
  toast(`สวมบทบาทเป็น "${u.role}" แล้ว (mockup เท่านั้น ไม่ใช่การ login จริง)`);
}

// ---------------- Toast ----------------
let toastTimer = null;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = '✅ ' + msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ================================================================
// DASHBOARD
// ================================================================
function renderDashboard() {
  autoReplacementExpiryCheck(); // Round 10 ข้อ 1 — ให้ตัวนับ "คำขอค้างดำเนินการ" ไม่รวมร่างที่หมดอายุแล้ว
  const total = ASSETS.length;
  const inStock = ASSETS.filter((a) => a.status === 'IN_STOCK').length;
  const borrowed = ASSETS.filter((a) => a.status === 'BORROWED').length;
  const sold = ASSETS.filter((a) => a.status === 'SOLD').length;
  const repair = ASSETS.filter((a) => a.status === 'REPAIR').length;
  const writtenOff = ASSETS.filter((a) => a.status === 'WRITTEN_OFF').length;
  const pendingRequests = borrowRequests.filter((r) => r.status === 'รอจ่ายของ').length;
  const pendingWriteoff = ASSETS.filter((a) => a.status === 'PENDING_WRITEOFF').length;
  const writeoffAwaitingApproval = WRITEOFF_REQUESTS.filter((w) => w.status === 'รออนุมัติ').length;
  const writeoffApproved = WRITEOFF_REQUESTS.filter((w) => w.status === 'อนุมัติแล้ว').length;
  const awaitingReceipt = borrowRequests.filter((r) => r.receiptStatus === 'รอผู้รับยืนยัน').length;
  const receiptIssues = borrowRequests.filter((r) => r.receiptStatus === 'แจ้งปัญหา').length;
  // เพิ่ม 2 ต.ค. 2569 (Round 9)
  const outForRepair = ASSETS.filter((a) => a.status === 'OUT_FOR_REPAIR').length;
  const selfReturnPending = RETURN_REQUESTS.filter((rr) => rr.status === 'รอ OPERATION ยืนยันรับคืน').length;

  let cards = [];
  if (currentRole === 'ASSET_HOLDER') {
    cards = [
      { lbl: 'คำขอของฉันที่รออยู่', val: pendingRequests, sub: 'สถานะ: รอจ่ายของ', cls: '' },
      { lbl: 'รอฉันยืนยันรับของ', val: awaitingReceipt, sub: 'เช็กของจริงกับที่จ่ายไป', cls: awaitingReceipt ? 'warn' : '' },
      { lbl: 'คำขอแจ้งคืนที่รอดำเนินการ', val: selfReturnPending, sub: 'รอ OPERATION ยืนยันรับคืน (ตัวอย่าง)', cls: '' },
      { lbl: 'อุปกรณ์ที่ฉันเบิกอยู่', val: borrowed, sub: 'ทั้งหมดในระบบ (ตัวอย่าง)', cls: '' },
      { lbl: 'ใกล้ครบกำหนดคืน (30 วัน)', val: ASSETS.filter((a) => a.dueDate).length, sub: 'ดูรายการด้านล่าง', cls: 'warn' },
      { lbl: 'ทรัพย์สินพร้อมให้เบิก', val: inStock, sub: 'อยู่ในคลังตอนนี้', cls: 'ok' },
    ];
  } else if (currentRole === 'OPERATION') {
    cards = [
      { lbl: 'ทรัพย์สินทั้งหมด', val: total, sub: 'ทุก flag รวมกัน', cls: '' },
      { lbl: 'พร้อมใช้งานในคลัง', val: inStock, sub: 'IN_STOCK', cls: 'ok' },
      { lbl: 'คำขอเบิกรอจ่ายของ', val: pendingRequests, sub: 'ต้องเลือก S/N และส่งมอบ', cls: 'warn' },
      { lbl: 'รอผู้รับยืนยันการรับของ', val: awaitingReceipt, sub: 'จ่ายของแล้ว รอปิดรายการ', cls: awaitingReceipt ? 'warn' : '' },
      { lbl: 'แจ้งปัญหาการรับของ', val: receiptIssues, sub: 'ของไม่ครบ/ชำรุด — ต้องติดตาม', cls: receiptIssues ? 'danger' : '' },
      { lbl: 'คำขอแจ้งคืนรอดำเนินการ', val: selfReturnPending, sub: 'ผู้ขอเบิกแจ้งคืนผ่านระบบ', cls: selfReturnPending ? 'warn' : '' },
      { lbl: 'รอซ่อม/ไม่พร้อมใช้งาน', val: repair, sub: 'ส่งต่อ IT Support', cls: 'danger' },
      { lbl: 'กำลังซ่อม (ส่งออกแล้ว)', val: outForRepair, sub: 'รอรับเครื่องกลับจาก vendor', cls: '' },
      { lbl: 'ขายแล้ว (สะสม)', val: sold, sub: 'ขายขาดออกจากคลัง', cls: '' },
      { lbl: 'ตัดจำหน่ายแล้ว (สะสม)', val: writtenOff, sub: 'Write-off', cls: '' },
    ];
  } else if (currentRole === 'IT_SUPPORT') {
    cards = [
      { lbl: 'รอพิจารณาซ่อม', val: repair, sub: 'ต้องตัดสินใจ ซ่อมได้/ไม่ได้', cls: 'danger' },
      { lbl: 'กำลังซ่อม (ส่งออกแล้ว)', val: outForRepair, sub: 'รอรับเครื่องกลับ', cls: '' },
      { lbl: 'ซ่อมไม่ได้ รอ Write-off', val: pendingWriteoff, sub: 'ส่งต่อผู้อนุมัติแล้ว', cls: 'warn' },
    ];
  } else {
    cards = [
      { lbl: 'รออนุมัติ Write-off', val: writeoffAwaitingApproval, sub: 'คลิกเมนู Write-off เพื่ออนุมัติ', cls: 'danger' },
      { lbl: 'อนุมัติแล้วสะสม', val: writeoffApproved, sub: '-', cls: '' },
      { lbl: 'ทรัพย์สินตัดจำหน่ายสะสม', val: writtenOff, sub: '-', cls: '' },
    ];
  }

  document.getElementById('statGrid').innerHTML = cards
    .map(
      (c) => `<div class="stat-card ${c.cls}">
        <div class="lbl">${c.lbl}</div>
        <div class="val">${c.val}</div>
        <div class="sub">${c.sub}</div>
      </div>`,
    )
    .join('');

  const dueSoon = ASSETS.filter((a) => a.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  document.querySelector('#dueSoonTable tbody').innerHTML = dueSoon
    .map(
      (a) => `<tr>
        <td>${a.tag}</td><td>${a.type}</td><td>${a.project}</td><td>${a.dueDate}</td>
        <td><span class="tag ${STATUS_LABEL[a.status].cls}">${STATUS_LABEL[a.status].text}</span></td>
      </tr>`,
    )
    .join('') || `<tr><td colspan="5" class="empty-hint">ไม่มีรายการใกล้ครบกำหนดคืน</td></tr>`;
}

// ================================================================
// ASSET REGISTER
// ================================================================
function populateAssetFilters() {
  const types = [...new Set(ASSETS.map((a) => a.type))].sort();
  const sel = document.getElementById('arType');
  types.forEach((t) => {
    const o = document.createElement('option');
    o.value = t;
    o.textContent = t;
    sel.appendChild(o);
  });

  const catSel = document.getElementById('arCategory');
  if (catSel) {
    const prev = catSel.value;
    catSel.innerHTML = '<option value="">ทุกหมวดหมู่</option>' + CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
    if (CATEGORIES.some((c) => c.id === prev)) catSel.value = prev;
  }
}

function renderAssetTable() {
  const q = document.getElementById('arSearch').value.trim().toLowerCase();
  const type = document.getElementById('arType').value;
  const cls = document.getElementById('arClass').value;
  const status = document.getElementById('arStatus').value;
  const category = document.getElementById('arCategory') ? document.getElementById('arCategory').value : '';

  const rows = ASSETS.filter((a) => {
    if (type && a.type !== type) return false;
    if (cls && a.classification !== cls) return false;
    if (status && a.status !== status) return false;
    if (category) {
      const it = itemMasterByName(a.type);
      if (!it || it.categoryId !== category) return false;
    }
    if (q && !(a.tag.toLowerCase().includes(q) || a.serial.toLowerCase().includes(q))) return false;
    return true;
  });

  document.getElementById('arCount').textContent = `แสดง ${rows.length} จาก ${ASSETS.length} รายการ`;

  document.getElementById('arBody').innerHTML = rows
    .map(
      (a, i) => `<tr onclick="openAssetDrawer('${a.tag.replace(/'/g, "\\'")}')">
        <td><b>${a.tag}</b></td>
        <td>${a.type}</td>
        <td>${a.serial}</td>
        <td><span class="tag ${CLASS_LABEL[a.classification].cls}">${CLASS_LABEL[a.classification].text}</span></td>
        <td><span class="tag ${STATUS_LABEL[a.status].cls}">${STATUS_LABEL[a.status].text}</span></td>
        <td>${a.project}</td>
        <td>${a.location}</td>
        <td>${a.actualLocation}</td>
        <td>${a.cost.toLocaleString('th-TH')}</td>
      </tr>`,
    )
    .join('') || `<tr><td colspan="9" class="empty-hint">ไม่พบรายการที่ตรงกับเงื่อนไข</td></tr>`;
}

function warrantyDisplay(a) {
  if (!a.warrantyEnd) return '-';
  const expired = new Date(a.warrantyEnd) < new Date();
  const cls = expired ? 'tag-red' : 'tag-green';
  const text = expired ? 'หมดประกันแล้ว' : 'อยู่ในประกัน';
  return `${a.warrantyEnd} <span class="tag ${cls}" style="margin-left:6px;">${text}</span>`;
}

// สร้าง timeline ประวัติของ asset หนึ่งตัว — ใช้ของจริงจาก ASSET_HISTORY ถ้ามี (เพิ่มเข้ามาทุกครั้งที่มี
// ธุรกรรมเกิดขึ้นในหน้าต่าง ๆ ตั้งแต่ 1 ต.ค. 2569 เป็นต้นมา) ถ้ายังไม่เคยมีธุรกรรมใด ๆ เกิดใน mockup นี้
// (asset เก่าที่มากับ seed data) จะ fallback ไปเดาจากสถานะปัจจุบันเหมือนเดิม
function historyForAsset(a) {
  const rl = RECEIVE_LOG.find((r) => r.tag === a.tag);
  const receiveEntry = { t: 'รับเข้าคลัง', d: `${rl ? rl.receivedAt : '2025-10-01'} — โดย ${rl ? rl.receivedBy : 'OPERATION'}` };

  const real = ASSET_HISTORY.filter((h) => h.tag === a.tag).slice().sort((x, y) => x.date.localeCompare(y.date));
  if (real.length) {
    return [
      receiveEntry,
      ...real.map((h) => ({
        t: HISTORY_EVENT_LABEL[h.event] + (h.project && h.project !== '-' ? ` — "${h.project}"` : ''),
        d: `${h.date}${h.note ? ' · ' + h.note : ''}${h.by ? ' · โดย ' + h.by : ''}`,
      })),
    ];
  }

  // fallback: เดาจากสถานะปัจจุบัน (asset ที่ยังไม่มีธุรกรรมจริงเกิดขึ้นใน mockup รอบนี้)
  return [
    receiveEntry,
    a.status === 'BORROWED' ? { t: `เบิกโดยโครงการ "${a.project}"`, d: `กำหนดคืน ${a.dueDate ?? '-'}` } : null,
    a.status === 'SOLD' ? { t: `ขายขาดให้ "${a.project}"`, d: 'ออกจากทะเบียนทรัพย์สินถาวร ไม่ต้องติดตามคืน' } : null,
    a.status === 'REPAIR' ? { t: 'รับคืน — แจ้งอุปกรณ์เสีย', d: 'รอ IT Support พิจารณาซ่อม' } : null,
    a.status === 'OUT_FOR_REPAIR' ? { t: 'ส่งซ่อมภายนอก', d: `ที่ ${a.repairVendor || '-'}` } : null,
    a.status === 'PENDING_WRITEOFF' ? { t: 'ซ่อมไม่ได้ — ส่งคำขอ Write-off', d: 'รอผู้มีสิทธิ์อนุมัติ' } : null,
    a.status === 'WRITTEN_OFF' ? { t: 'อนุมัติ Write-off', d: 'ตัดออกจากทะเบียนถาวร' } : null,
  ].filter(Boolean);
}

function openAssetDrawer(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const history = historyForAsset(a);

  document.getElementById('assetDrawerBody').innerHTML = `
    <div class="kv"><div class="k">Asset Tag</div><div class="v">${a.tag}</div></div>
    <div class="kv"><div class="k">ประเภท</div><div class="v">${a.type}</div></div>
    <div class="kv"><div class="k">หมวดหมู่</div><div class="v">${categoryNameForItemName(a.type)}</div></div>
    <div class="kv"><div class="k">Serial Number</div><div class="v">${a.serial}</div></div>
    <div class="kv"><div class="k">Flag</div><div class="v"><span class="tag ${CLASS_LABEL[a.classification].cls}">${CLASS_LABEL[a.classification].text}</span></div></div>
    <div class="kv"><div class="k">สถานะ</div><div class="v"><span class="tag ${STATUS_LABEL[a.status].cls}">${STATUS_LABEL[a.status].text}</span></div></div>
    <div class="kv"><div class="k">โครงการ/ลูกค้า</div><div class="v">${a.project}</div></div>
    <div class="kv"><div class="k">Location</div><div class="v">${a.location}</div></div>
    <div class="kv"><div class="k">Actual Location</div><div class="v">${a.actualLocation}</div></div>
    <div class="kv"><div class="k">Cost</div><div class="v">${a.cost.toLocaleString('th-TH')} บาท</div></div>
    <div class="kv"><div class="k">วันสิ้นสุดรับประกัน</div><div class="v">${warrantyDisplay(a)}</div></div>
    <div class="kv"><div class="k">รูปถ่ายอุปกรณ์</div><div class="v" style="word-break:break-all;">${a.photoPath || '-'}</div></div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
    <h3 style="font-size:14px;margin:0 0 8px;">ประวัติธุรกรรม</h3>
    <div class="timeline">
      ${history.map((h) => `<div class="tl-item"><div class="tl-dot"></div><div><div class="tl-t">${h.t}</div><div class="tl-d">${h.d}</div></div></div>`).join('')}
    </div>
  `;
  document.getElementById('assetDrawerOverlay').classList.add('show');
}
function closeAssetDrawer(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('assetDrawerOverlay').classList.remove('show');
}

// ================================================================
// BORROW REQUEST (ขอเบิก)
// ================================================================
// scope ของ item master ที่เลือกได้ต่อวัตถุประสงค์
const PURPOSE_SCOPE = { 'ยืม': 'LOANABLE', 'ขายขาด': 'SELLABLE', 'ใช้งานภายใน': 'INTERNAL' };

// label/placeholder ของฟิลด์ "โครงการ/ลูกค้า" ที่เปลี่ยนความหมายไปตามวัตถุประสงค์
const PROJECT_FIELD_TEXT = {
  'ยืม': { label: 'โครงการ / ลูกค้า', placeholder: 'เช่น เทศบาลตำบลบางหญ้าแพรก — โครงการ Smart City' },
  'ขายขาด': { label: 'โครงการ / ลูกค้า', placeholder: 'เช่น เทศบาลตำบลบางหญ้าแพรก — โครงการ Smart City' },
  'ใช้งานภายใน': { label: 'แผนก / วัตถุประสงค์การใช้งาน', placeholder: 'เช่น แผนก Data Analytics (ใช้งานภายใน)' },
};

function currentPurpose() {
  return document.querySelector('input[name=purpose]:checked').value;
}

function onPurposeChange() {
  const purpose = currentPurpose();

  document.getElementById('purposeCardLoan').classList.toggle('sel', purpose === 'ยืม');
  document.getElementById('purposeCardSale').classList.toggle('sel', purpose === 'ขายขาด');
  document.getElementById('purposeCardInternal').classList.toggle('sel', purpose === 'ใช้งานภายใน');

  // วันที่คาดว่าจะคืน: บังคับตอน "ยืม", เป็นทางเลือกตอน "ใช้งานภายใน" (เช่น ยืมของใช้ชั่วคราว), ไม่ต้องกรอกตอน "ขายขาด"
  const dueRow = document.getElementById('dueDateRow');
  if (purpose === 'ขายขาด') {
    dueRow.style.display = 'none';
  } else {
    dueRow.style.display = 'block';
    document.getElementById('dueDateLabel').firstChild.textContent =
      purpose === 'ใช้งานภายใน' ? 'วันที่คาดว่าจะคืน (ถ้ามี — กรณียืมใช้ชั่วคราว) ' : 'วันที่คาดว่าจะคืน ';
    document.getElementById('dueDateReq').style.display = purpose === 'ใช้งานภายใน' ? 'none' : 'inline';
  }

  // ฟิลด์โครงการ/ลูกค้า เปลี่ยนความหมายเป็น "แผนก/วัตถุประสงค์การใช้งาน" ตอนเบิกใช้งานภายใน
  const t = PROJECT_FIELD_TEXT[purpose];
  document.getElementById('projectLabel').innerHTML = `${t.label} <span class="req">*</span>`;
  document.getElementById('reqProject').placeholder = t.placeholder;

  // รายการอุปกรณ์ที่เลือกได้ต้องตรง scope ของวัตถุประสงค์ที่เลือก — เริ่มแถวใหม่ให้ตรงชุดที่เลือกได้
  document.getElementById('itemRows').querySelectorAll('.item-row:not(.head)').forEach((r) => r.remove());
  addItemRow();
}

function itemOptionsHtml(selected) {
  const scope = PURPOSE_SCOPE[currentPurpose()];
  return ITEM_MASTER.filter((it) => it.scope.includes(scope))
    .map(
      (it) => `<option value="${it.id}" ${it.id === selected ? 'selected' : ''}>${it.name}${it.trackSerial ? '' : ' (นับจำนวน)'}</option>`,
    )
    .join('');
}

function addItemRow(itemId, qty) {
  itemRowCounter++;
  const rowId = 'row' + itemRowCounter;
  const row = document.createElement('div');
  row.className = 'item-row';
  row.id = rowId;
  row.innerHTML = `
    <select onchange="">${itemOptionsHtml(itemId)}</select>
    <input type="number" min="1" value="${qty || 1}" />
    <span style="color:#64748b;font-size:13px;">ชิ้น</span>
    <button class="icon-btn" onclick="document.getElementById('${rowId}').remove()" title="ลบรายการ">✕</button>
  `;
  document.getElementById('itemRows').appendChild(row);
}

function resetBorrowForm() {
  document.getElementById('itemRows').querySelectorAll('.item-row:not(.head)').forEach((r) => r.remove());
  document.getElementById('reqProject').value = '';
  document.getElementById('reqNote').value = '';
  document.getElementById('reqNeedDate').value = '';
  document.getElementById('reqDueDate').value = '';
  document.querySelector('input[name=purpose][value="ยืม"]').checked = true;
  onPurposeChange();
}

function submitBorrowRequest() {
  const purpose = currentPurpose();
  const project = document.getElementById('reqProject').value.trim();
  const neededDate = document.getElementById('reqNeedDate').value;
  const dueDate = document.getElementById('reqDueDate').value;
  const rows = [...document.getElementById('itemRows').querySelectorAll('.item-row:not(.head)')];
  const fieldLabel = PROJECT_FIELD_TEXT[purpose].label;

  if (!project) { toast(`⚠️ กรุณาระบุ${fieldLabel}`); return; }
  if (!neededDate) { toast('⚠️ กรุณาระบุวันที่ต้องการเริ่มใช้อุปกรณ์'); return; }
  if (rows.length === 0) { toast('⚠️ กรุณาเพิ่มรายการอุปกรณ์อย่างน้อย 1 รายการ'); return; }
  if (purpose === 'ยืม' && !dueDate) { toast('⚠️ กรุณาระบุวันที่คาดว่าจะคืน'); return; }

  const items = rows.map((r) => ({
    itemId: r.querySelector('select').value,
    qty: Number(r.querySelector('input').value) || 1,
  }));

  const newReq = {
    id: 'REQ-2026-' + String(90 + borrowRequests.length + 1).padStart(4, '0'),
    purpose,
    requester: document.getElementById('reqName').value,
    team: document.getElementById('reqTeam').value,
    project,
    neededDate: neededDate || null,
    dueDate: purpose === 'ขายขาด' ? null : (dueDate || null),
    items,
    status: 'รอจ่ายของ',
    // "วันที่ขอเบิก" ไม่ให้ผู้ใช้กรอกเอง — ระบบบันทึกอัตโนมัติจากวันเวลาที่กดส่งคำขอจริง (ตามที่ user ขอ)
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    source: 'standalone',
  };
  borrowRequests.unshift(newReq);

  toast(`ส่งคำขอเบิก ${newReq.id} เรียบร้อย — สถานะ "รอจ่ายของ" (OPERATION จะเป็นคนเลือก Serial Number จริงตอนจ่ายของ)`);
  resetBorrowForm();
  renderPendingRequests();
  renderDashboard();
  document.querySelector('.pill-tabs .pt[data-tab="pending"]').click();
}

const PURPOSE_TAG_CLASS = { 'ยืม': 'tag-blue', 'ขายขาด': 'tag-gray', 'ใช้งานภายใน': 'tag-purple' };
const REQUEST_STATUS_CLASS = {
  'รอจ่ายของ': 'tag-amber', 'เบิกแล้ว': 'tag-green',
  // เพิ่ม 2 ต.ค. 2569 (Round 10) — สถานะปลายทางของ "ร่างคำขอเบิกทดแทน" ที่ระบบสร้างอัตโนมัติ (ข้อ 1)
  'หมดอายุ': 'tag-gray', 'ยกเลิกแล้ว': 'tag-gray',
};

// ผลต่างจำนวนวันเต็มระหว่าง 2 วันที่ (string 'YYYY-MM-DD' หรือ datetime ก็ได้ ตัดเอาแค่ส่วนวันที่) —
// b - a : ใช้ร่วมกันทั้งนับวันหมดอายุร่างทดแทน (Round 10 ข้อ 1) และนับวันเกินกำหนดซ่อม (Round 10 ข้อ 3)
function daysBetween(a, b) {
  const d1 = new Date(String(a).slice(0, 10));
  const d2 = new Date(String(b).slice(0, 10));
  return Math.round((d2 - d1) / 86400000);
}

// ไล่เช็ค "ร่างคำขอเบิกทดแทน" ที่ระบบสร้างอัตโนมัติ (Round 9 gap B) ว่าหมดอายุหรือยัง ตามค่าตั้งต้น
// AUTO_REPLACEMENT_EXPIRY_DAYS วัน (Round 10 ข้อ 1 — ตัวเลขนี้รอ user confirm ดู README) — ร่างที่หมดอายุ
// ไม่หายไปจากระบบ แค่เปลี่ยนสถานะเป็น "หมดอายุ" ให้อัตโนมัติ ซึ่งทำให้หลุดออกจากตัวกรอง status==='รอจ่ายของ'
// ที่ทุกจุดในระบบใช้นับ "คำขอค้างดำเนินการ" อยู่แล้ว โดยไม่ต้องแก้ตัวนับแยกต่างหาก — เรียกจากทุกจุดที่
// render/นับจำนวนคำขอ เพื่อให้ผลลัพธ์สอดคล้องกันเสมอไม่ว่าจะเข้าหน้าไหนก่อน
function autoReplacementExpiryCheck() {
  const todayStr = new Date().toISOString().slice(0, 10);
  borrowRequests.forEach((r) => {
    if (r.autoReplacementNote && r.status === 'รอจ่ายของ' && r.autoReplacementExpiresAt) {
      if (daysBetween(todayStr, r.autoReplacementExpiresAt) < 0) r.status = 'หมดอายุ';
    }
  });
}

// เซลล์ "สถานะการรับของ" ในตารางคำขอ — ยังไม่ถึงขั้นตอนจ่ายของเลยไม่ต้องโชว์อะไร, จ่ายแล้วแต่ยังไม่
// ยืนยันโชว์ป้าย + ปุ่มให้กดยืนยันรับได้เอง (self-service), ยืนยัน/แจ้งปัญหาแล้วโชว์ป้ายผลพร้อม hover
// รายละเอียดจาก title attribute (ชื่อผู้ยืนยัน/วันที่/หมายเหตุ)
function receiptCellHtml(r) {
  if (!r.receiptStatus) return '<span style="color:#cbd5e1;">—</span>';
  const cls = RECEIPT_STATUS_CLASS[r.receiptStatus] || 'tag-gray';
  const detail = r.receiptConfirmedBy
    ? `โดย ${r.receiptConfirmedBy} · ${r.receiptConfirmedAt || ''}${r.receiptNote ? ' · ' + r.receiptNote : ''}`
    : '';
  const badge = `<span class="tag ${cls}" ${detail ? `title="${detail.replace(/"/g, '&quot;')}"` : ''}>${r.receiptStatus}</span>`;
  const btn = r.receiptStatus === 'รอผู้รับยืนยัน'
    ? `<div style="margin-top:4px;"><button class="btn btn-sm" onclick="openReceiptDrawer('${r.id}', false)">ยืนยันรับของ</button></div>`
    : '';
  return badge + btn;
}

// เซลล์ "การคืน" — รวมสถานะคำขอแจ้งคืนที่เคยส่งของคำขอนี้ (ถ้ามี) + ปุ่ม "แจ้งคืนอุปกรณ์" เมื่อยังมีของ
// ที่เบิกอยู่และยังไม่เคยแจ้งคืนค้างไว้ (เพิ่ม 2 ต.ค. 2569 Round 9 — gap A ที่ user ชี้ว่าวงจรคืนของ
// ไม่สมมาตรกับวงจรขอเบิก)
function returnCellHtml(r) {
  const myReturns = RETURN_REQUESTS.filter((rr) => rr.reqId === r.id);
  const pending = myReturns.find((rr) => rr.status === 'รอ OPERATION ยืนยันรับคืน');
  const done = myReturns.filter((rr) => rr.status === 'รับคืนแล้ว');
  const canRequestMore = r.status === 'เบิกแล้ว' && returnableRowsForRequest(r).length > 0;

  let html = '';
  if (pending) html += `<span class="tag tag-amber">รอ OPERATION ยืนยันรับคืน</span>`;
  if (done.length) {
    const count = done.reduce((n, rr) => n + rr.items.length, 0);
    html += `${pending ? '<br/>' : ''}<span class="tag tag-green">คืนแล้ว ${count} ชิ้น</span>`;
  }
  if (canRequestMore) {
    html += `<div style="margin-top:4px;"><button class="btn btn-sm" onclick="openSelfReturnDrawer('${r.id}')">แจ้งคืนอุปกรณ์</button></div>`;
  }
  return html || '<span style="color:#cbd5e1;">—</span>';
}

// ป้าย/ข้อความ/ปุ่มสำหรับ "ร่างคำขอเบิกทดแทน" ที่ระบบสร้างให้เองตอนยืนยันรับคืนอุปกรณ์เสียแล้วผู้ใช้
// ต้องการเครื่องทดแทนทันที (ดู confirmFulfillReturn — Round 9 gap B) — ช่วยให้เห็นชัดว่าคำขอนี้ไม่ได้มา
// จากการกรอกฟอร์มเองของผู้ใช้ ต้องตรวจสอบก่อนจ่ายของ
// เพิ่ม 2 ต.ค. 2569 (Round 10 ข้อ 1): วันหมดอายุ + ปุ่มยกเลิกร่างได้เอง (opts.withCancelButton — ใช้เฉพาะ
// ในตาราง "รายการคำขอที่ส่งแล้ว" 9.4 ที่เป็นมุมมองของผู้ขอเบิกเอง ไม่ใส่ในคิวจ่ายของฝั่ง OPERATION)
function autoReplacementBadge(r, opts) {
  if (!r.autoReplacementNote) return '';
  opts = opts || {};
  const title = r.autoReplacementNote.replace(/"/g, '&quot;');

  if (r.status === 'ยกเลิกแล้ว') {
    const detail = `ยกเลิกโดย ${r.autoReplacementCancelledBy || '-'} · ${r.autoReplacementCancelledAt || ''}${r.autoReplacementCancelReason ? ' · เหตุผล: ' + r.autoReplacementCancelReason : ''}`;
    return `<br/><span class="tag tag-gray" title="${detail.replace(/"/g, '&quot;')}">ระบบสร้างให้อัตโนมัติ — ยกเลิกแล้ว</span>`;
  }
  if (r.status === 'หมดอายุ') {
    return `<br/><span class="tag tag-gray" title="${title}">ระบบสร้างให้อัตโนมัติ — หมดอายุแล้ว</span>`;
  }

  // ยังปกติ (รอจ่ายของ) — โชว์ป้าย + นับถอยหลังวันหมดอายุ + ปุ่มยกเลิก (ถ้า opts.withCancelButton)
  let html = `<br/><span class="tag tag-blue" title="${title}">🔁 ระบบสร้างให้อัตโนมัติ</span>`;
  if (r.autoReplacementExpiresAt) {
    const daysLeft = Math.max(0, daysBetween(new Date().toISOString().slice(0, 10), r.autoReplacementExpiresAt));
    const soon = daysLeft <= AUTO_REPLACEMENT_EXPIRING_SOON_DAYS;
    html += `<br/><span class="tag ${soon ? 'tag-amber' : 'tag-gray'}">ร่างนี้จะหมดอายุใน ${daysLeft} วัน</span>`;
  }
  if (opts.withCancelButton) {
    html += `<div style="margin-top:4px;"><button class="btn btn-sm" onclick="openCancelAutoReplacementDrawer('${r.id}')">ยกเลิกร่าง</button></div>`;
  }
  return html;
}

function openCancelAutoReplacementDrawer(reqId) {
  const r = borrowRequests.find((x) => x.id === reqId);
  if (!r) return;
  const body = `
    <div class="kv"><div class="k">คำขอ</div><div class="v"><b>${r.id}</b></div></div>
    <div class="kv"><div class="k">รายการ</div><div class="v">${r.items.map((it) => `${itemNameById(it.itemId)} ×${it.qty}`).join(', ')}</div></div>
    <p style="color:#64748b;font-size:12.5px;margin-top:10px;">ยืนยันยกเลิกร่างคำขอเบิกทดแทนนี้ — ยกเลิกแล้วจะไม่หายไปจากระบบ แต่จะเปลี่ยนเป็นสถานะ "ยกเลิกแล้ว" และแก้ไขต่อไม่ได้</p>
    <div class="form-row">
      <label>เหตุผล (ไม่บังคับ)</label>
      <textarea id="cancelAutoReplacementReason" placeholder="เช่น ไม่ต้องการแล้ว / ใช้เครื่องสำรองที่มีอยู่แก้ขัดไปก่อน"></textarea>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ปิด (ไม่ยกเลิก)</button>
      <button class="btn btn-danger" onclick="confirmCancelAutoReplacement('${reqId}')">ยืนยันยกเลิกร่าง</button>
    </div>
  `;
  openActionDrawer('ยกเลิกร่างคำขอเบิกทดแทน — ' + r.id, body);
}

function confirmCancelAutoReplacement(reqId) {
  const r = borrowRequests.find((x) => x.id === reqId);
  if (!r) return;
  const reason = document.getElementById('cancelAutoReplacementReason').value.trim() || null;
  r.status = 'ยกเลิกแล้ว';
  r.autoReplacementCancelledAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  r.autoReplacementCancelledBy = DEMO_USERS[currentRole].name;
  r.autoReplacementCancelReason = reason;
  toast(`ยกเลิกร่าง ${r.id} แล้ว`);
  closeActionDrawer();
  renderPendingRequests();
  renderDispatchQueue();
  renderDashboard();
}

// เพิ่ม 2 ต.ค. 2569: ช่องค้นหา + filter ในตาราง "รายการคำขอที่ส่งแล้ว" (ตามที่ user ขอ) — ค้นหาแบบ live
// (พิมพ์แล้วกรองทันที แบบเดียวกับ filterPickerRows ของหน้าอื่น) ครอบคลุมเลขคำขอ/ชื่อผู้ขอ/ทีม/
// โครงการ-ลูกค้า/รายการอุปกรณ์ — หมายเหตุ: ยังไม่มีฟิลด์ "จังหวัด" แยกต่างหากในข้อมูลคำขอ (โครงการ/ลูกค้า
// เป็น free-text ที่มักมีชื่ออำเภอ/เขต/เกาะปนอยู่ เช่น "ขอนแก่น"/"เกาะสมุย" — ถ้าพิมพ์ชื่อสถานที่ที่ปรากฏ
// อยู่ในข้อความนี้จะเจอ แต่ไม่ใช่ filter จังหวัดที่แม่นยำจริง) ส่วนเลขนับในชื่อแท็บ (pendingCount) ยังคง
// นับรวมคำขอทั้งหมดเหมือนเดิมไม่ว่าจะกรองอยู่หรือไม่ (ตามแนวทางเดียวกับตัวกรอง "เฉพาะที่เกินกำหนด" ของ
// Round 10 ข้อ 3) — เพิ่ม dropdown กรองวัตถุประสงค์และสถานะเป็นตัวกรองเสริม
function renderPendingRequests() {
  autoReplacementExpiryCheck(); // Round 10 ข้อ 1 — เช็คร่างทดแทนหมดอายุก่อนแสดงผลทุกครั้ง
  const all = borrowRequests;
  document.getElementById('pendingCount').textContent = `(${all.length})`;

  const qEl = document.getElementById('pendingSearch');
  const q = qEl ? qEl.value.trim().toLowerCase() : '';
  const purposeEl = document.getElementById('pendingPurposeFilter');
  const purposeFilter = purposeEl ? purposeEl.value : '';
  const statusEl = document.getElementById('pendingStatusFilter');
  const statusFilter = statusEl ? statusEl.value : '';

  const pending = all
    .filter((r) => !purposeFilter || r.purpose === purposeFilter)
    .filter((r) => !statusFilter || r.status === statusFilter)
    .filter((r) => {
      if (!q) return true;
      const haystack = [
        r.id, r.requester, r.team, r.project,
        ...r.items.map((it) => itemNameById(it.itemId)),
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });

  const countEl = document.getElementById('pendingFilteredCount');
  if (countEl) countEl.textContent = (q || purposeFilter || statusFilter) ? `แสดง ${pending.length} จาก ${all.length} รายการ` : '';

  document.getElementById('pendingBody').innerHTML = pending
    .map(
      (r) => `<tr>
        <td><b>${r.id}</b>${autoReplacementBadge(r, { withCancelButton: true })}</td>
        <td><span class="tag ${PURPOSE_TAG_CLASS[r.purpose] || 'tag-gray'}">${r.purpose}</span></td>
        <td>${r.requester}<br/><span style="color:#94a3b8;font-size:11.5px;">${r.team}</span></td>
        <td>${r.project}</td>
        <td>${r.items.map((it) => `${itemNameById(it.itemId)} ×${it.qty}`).join(', ')}</td>
        <td>${r.neededDate || '-'}</td>
        <td>${r.dueDate || '-'}</td>
        <td style="color:#94a3b8;">${r.createdAt}</td>
        <td><span class="tag ${REQUEST_STATUS_CLASS[r.status] || 'tag-gray'}">${r.status}</span></td>
        <td>${receiptCellHtml(r)}</td>
        <td>${returnCellHtml(r)}</td>
        <td>${r.source === 'pmex' ? '<span class="tag tag-purple">จาก PMeX</span>' : '<span class="tag tag-gray">ยื่นเอง</span>'}</td>
      </tr>`,
    )
    .join('') || `<tr><td colspan="12" class="empty-hint">${q || purposeFilter || statusFilter ? 'ไม่พบคำขอที่ตรงกับเงื่อนไขค้นหา' : 'ยังไม่มีคำขอ'}</td></tr>`;
}

function switchBorrowTab(el) {
  document.querySelectorAll('.pill-tabs .pt').forEach((p) => p.classList.remove('active'));
  el.classList.add('active');
  const tab = el.dataset.tab;
  document.getElementById('borrowTabNew').style.display = tab === 'new' ? 'block' : 'none';
  document.getElementById('borrowTabPending').style.display = tab === 'pending' ? 'block' : 'none';
}

// ================================================================
// GENERIC ACTION DRAWER (ใช้ร่วมกันหลายหน้าจอ: dispatch/renew/return/repair/write-off/item master)
// ================================================================
function openActionDrawer(title, bodyHtml, opts) {
  document.getElementById('actionDrawerTitle').textContent = title;
  document.getElementById('actionDrawerBody').innerHTML = bodyHtml;
  const drawerEl = document.querySelector('#actionDrawerOverlay .drawer');
  if (drawerEl) drawerEl.classList.toggle('drawer-wide', !!(opts && opts.wide));
  document.getElementById('actionDrawerOverlay').classList.add('show');
}
function closeActionDrawer(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('actionDrawerOverlay').classList.remove('show');
}
function baseLocationFor(classification) {
  return classification === 'INTERNAL' ? 'สำนักงาน Bedrock' : 'คลังกลาง Bedrock';
}
function purposeToClassification(purpose) {
  return purpose === 'ขายขาด' ? 'SELLABLE' : purpose === 'ใช้งานภายใน' ? 'INTERNAL' : 'LOANABLE';
}

// ================================================================
// RECEIVE (รับของเข้าคลัง)
// ================================================================
function populateReceiveSelects() {
  const typeSel = document.getElementById('rcvType');
  if (!typeSel) return;
  const prev = typeSel.value;
  typeSel.innerHTML = CATEGORIES
    .map((c) => {
      const items = ITEM_MASTER.filter((it) => it.categoryId === c.id);
      if (items.length === 0) return '';
      return `<optgroup label="${c.name}">${items.map((it) => `<option value="${it.id}">${it.name}</option>`).join('')}</optgroup>`;
    })
    .join('');
  const uncategorized = ITEM_MASTER.filter((it) => !CATEGORIES.some((c) => c.id === it.categoryId));
  if (uncategorized.length) {
    typeSel.innerHTML += `<optgroup label="อื่นๆ (ไม่มีหมวดหมู่)">${uncategorized.map((it) => `<option value="${it.id}">${it.name}</option>`).join('')}</optgroup>`;
  }
  if (ITEM_MASTER.some((it) => it.id === prev)) typeSel.value = prev;

  const locSel = document.getElementById('rcvLocation');
  locSel.innerHTML = STORAGE_LOCATIONS.map((l) => `<option value="${l}">${l}</option>`).join('');

  onReceiveTypeChange();
  document.getElementById('rcvResponsible').value = DEMO_USERS[currentRole].name;
}

function onReceiveTypeChange() {
  const it = ITEM_MASTER.find((x) => x.id === document.getElementById('rcvType').value);
  document.getElementById('rcvSerialRow').style.display = it && it.trackSerial ? 'block' : 'none';
}

function switchDispatchTab(el) {
  document.querySelectorAll('#screen-dispatch .pill-tabs .pt').forEach((p) => p.classList.remove('active'));
  el.classList.add('active');
  const tab = el.dataset.tab;
  document.getElementById('dispatchTabQueue').style.display = tab === 'queue' ? 'block' : 'none';
  document.getElementById('dispatchTabReceipt').style.display = tab === 'receipt' ? 'block' : 'none';
}

function switchReceiveTab(el) {
  document.querySelectorAll('#screen-receive .pill-tabs .pt').forEach((p) => p.classList.remove('active'));
  el.classList.add('active');
  const tab = el.dataset.tab;
  document.getElementById('receiveTabSingle').style.display = tab === 'single' ? 'block' : 'none';
  document.getElementById('receiveTabBulk').style.display = tab === 'bulk' ? 'block' : 'none';
}

function resetReceiveForm() {
  document.getElementById('rcvTag').value = '';
  document.getElementById('rcvSerial').value = '';
  document.getElementById('rcvCost').value = '';
  document.getElementById('rcvVendor').value = '';
  document.getElementById('rcvPo').value = '';
  document.getElementById('rcvWarrantyStart').value = '';
  document.getElementById('rcvWarrantyEnd').value = '';
  document.getElementById('rcvPhotoPath').value = '';
  document.getElementById('rcvClass').value = 'LOANABLE';
  onReceiveTypeChange();
}

function submitReceive() {
  const tag = document.getElementById('rcvTag').value.trim();
  const itemId = document.getElementById('rcvType').value;
  const it = ITEM_MASTER.find((x) => x.id === itemId);
  const serial = document.getElementById('rcvSerial').value.trim();
  const classification = document.getElementById('rcvClass').value;
  const cost = Number(document.getElementById('rcvCost').value) || 0;
  const vendor = document.getElementById('rcvVendor').value.trim() || '-';
  const po = document.getElementById('rcvPo').value.trim() || '-';
  const location = document.getElementById('rcvLocation').value;
  const warrantyStart = document.getElementById('rcvWarrantyStart').value || null;
  const warrantyEnd = document.getElementById('rcvWarrantyEnd').value || null;
  const photoPath = document.getElementById('rcvPhotoPath').value.trim() || '-';

  if (!tag) { toast('⚠️ กรุณาระบุ BEDROCK ID / Asset Tag'); return; }
  if (it.trackSerial && !serial) { toast('⚠️ กรุณาระบุ Serial Number'); return; }
  if (!cost) { toast('⚠️ กรุณาระบุราคาสินทรัพย์'); return; }
  if (ASSETS.some((a) => a.tag === tag)) { toast('⚠️ Asset Tag นี้มีอยู่ในทะเบียนแล้ว'); return; }

  const newAsset = {
    tag, type: it.name, serial: it.trackSerial ? serial : '-', classification,
    status: 'IN_STOCK', project: '-', location, actualLocation: location, cost, dueDate: null,
    warrantyStart, warrantyEnd, photoPath,
  };
  ASSETS.unshift(newAsset);
  RECEIVE_LOG.unshift({
    tag, type: it.name, serial: newAsset.serial, classification, cost, vendor, po,
    receivedAt: new Date().toISOString().slice(0, 10), receivedBy: DEMO_USERS[currentRole].name,
  });
  ASSET_HISTORY.unshift({
    tag, event: 'RECEIVE', project: '-', date: new Date().toISOString().slice(0, 10),
    note: `Vendor: ${vendor} · PO: ${po}`, by: DEMO_USERS[currentRole].name,
  });

  toast(`รับเข้าคลัง ${tag} เรียบร้อย — สถานะ "พร้อมใช้งาน"`);
  resetReceiveForm();
  renderReceiveLog();
  renderAssetTable();
  populateAssetFilters();
  renderDashboard();
}

function demoBulkImport() {
  const samples = [
    { tag: 'BED125100050', itemId: 'IT-PRINTER', serial: 'XXZHN251800900', classification: 'LOANABLE', cost: 4500, vendor: 'Zebra (ตัวแทนจำหน่ายไทย)', po: 'PO-2026-0500' },
    { tag: 'BED125100051', itemId: 'IT-PRINTER', serial: 'XXZHN251800901', classification: 'LOANABLE', cost: 4500, vendor: 'Zebra (ตัวแทนจำหน่ายไทย)', po: 'PO-2026-0500' },
    { tag: 'AW01B-0600', itemId: 'IT-ANYWHERE01', serial: '861629051100600', classification: 'LOANABLE', cost: 3200, vendor: 'Anywhere Thailand', po: 'PO-2026-0501' },
  ];
  let added = 0;
  samples.forEach((s) => {
    if (ASSETS.some((a) => a.tag === s.tag)) return;
    const it = ITEM_MASTER.find((x) => x.id === s.itemId);
    const loc = 'คลังกลาง Bedrock';
    ASSETS.unshift({ tag: s.tag, type: it.name, serial: s.serial, classification: s.classification, status: 'IN_STOCK', project: '-', location: loc, actualLocation: loc, cost: s.cost, dueDate: null });
    RECEIVE_LOG.unshift({ tag: s.tag, type: it.name, serial: s.serial, classification: s.classification, cost: s.cost, vendor: s.vendor, po: s.po, receivedAt: new Date().toISOString().slice(0, 10), receivedBy: DEMO_USERS[currentRole].name });
    ASSET_HISTORY.unshift({ tag: s.tag, event: 'RECEIVE', project: '-', date: new Date().toISOString().slice(0, 10), note: `Vendor: ${s.vendor} · PO: ${s.po} (นำเข้าแบบชุด)`, by: DEMO_USERS[currentRole].name });
    added++;
  });
  toast(`นำเข้าแบบชุดสำเร็จ ${added} รายการ (จำลอง)`);
  renderReceiveLog();
  renderAssetTable();
  renderDashboard();
}

function renderReceiveLog() {
  document.getElementById('receiveLogBody').innerHTML = RECEIVE_LOG
    .map((r) => `<tr>
      <td><b>${r.tag}</b></td><td>${r.type}</td><td>${r.serial}</td>
      <td><span class="tag ${CLASS_LABEL[r.classification].cls}">${CLASS_LABEL[r.classification].text}</span></td>
      <td>${r.cost.toLocaleString('th-TH')}</td><td>${r.vendor}</td><td>${r.po}</td><td>${r.receivedAt}</td><td>${r.receivedBy}</td>
    </tr>`)
    .join('') || `<tr><td colspan="9" class="empty-hint">ยังไม่มีรายการ</td></tr>`;
}

// ================================================================
// DISPATCH (จ่ายอุปกรณ์)
// ================================================================
function renderDispatchQueue() {
  autoReplacementExpiryCheck(); // Round 10 ข้อ 1 — ร่างที่หมดอายุแล้วต้องหลุดจากคิวรอจ่ายของนี้ด้วย
  const queue = borrowRequests.filter((r) => r.status === 'รอจ่ายของ');
  document.getElementById('dispatchQueueBody').innerHTML = queue
    .map((r) => `<tr>
      <td><b>${r.id}</b>${autoReplacementBadge(r)}</td>
      <td><span class="tag ${PURPOSE_TAG_CLASS[r.purpose] || 'tag-gray'}">${r.purpose}</span></td>
      <td>${r.requester}</td><td>${r.project}</td>
      <td>${r.items.map((it) => `${itemNameById(it.itemId)} ×${it.qty}`).join(', ')}</td>
      <td>${r.dueDate || '-'}</td>
      <td><button class="btn btn-sm btn-primary" onclick="openDispatchDrawer('${r.id}')">จ่ายของ</button></td>
    </tr>`)
    .join('') || `<tr><td colspan="7" class="empty-hint">ไม่มีคำขอรอจ่ายของ</td></tr>`;
}

// คิวที่จ่ายของไปแล้วแต่ผู้รับยังไม่ได้กดยืนยันรับในระบบ — OPERATION ใช้บันทึกแทนได้ (เช่น ได้รับแจ้ง
// ทางโทรศัพท์จากไซต์ที่ไม่สะดวกเข้าระบบเอง) ดูหัวข้อ "รับของ" ด้านล่างสำหรับรายละเอียดการออกแบบ
function renderDispatchReceiptQueue() {
  const tbody = document.getElementById('dispatchReceiptBody');
  if (!tbody) return;
  const queue = borrowRequests.filter((r) => r.status === 'เบิกแล้ว' && r.receiptStatus === 'รอผู้รับยืนยัน');
  tbody.innerHTML = queue
    .map((r) => `<tr>
      <td><b>${r.id}</b></td>
      <td><span class="tag ${PURPOSE_TAG_CLASS[r.purpose] || 'tag-gray'}">${r.purpose}</span></td>
      <td>${r.requester}</td><td>${r.project}</td>
      <td>${r.items.map((it) => `${itemNameById(it.itemId)} ×${it.qty}`).join(', ')}</td>
      <td>${r.createdAt}</td>
      <td><button class="btn btn-sm" onclick="openReceiptDrawer('${r.id}', true)">บันทึกการรับของแทนผู้ขอ</button></td>
    </tr>`)
    .join('') || `<tr><td colspan="7" class="empty-hint">ไม่มีคำขอที่จ่ายของแล้วรอผู้รับยืนยัน</td></tr>`;
  const tab = document.getElementById('dispatchAwaitingCount');
  if (tab) tab.textContent = `(${queue.length})`;
}

// วันนี้ (ใช้คำนวณ "ใกล้ครบกำหนดคืน") กี่วันข้างหน้านับเป็น "ใกล้" — ปรับได้ตามที่ OPERATION ต้องการ
const DUE_SOON_DAYS = 14;

// ค้นหาแบบ live ในตารางเลือกทรัพย์สิน (picker table) ที่อยู่ใน action drawer — ใช้ร่วมกันทั้งตารางเลือก
// Serial Number ตอนจ่ายอุปกรณ์ (9.5) และตารางเลือกทรัพย์สินตอนสร้างคำขอ Write-off เอง (9.9) เพื่อให้ UX
// การค้นหาเป็นแนวทางเดียวกันทั้ง 2 จุด — ซ่อน/โชว์แถวด้วย CSS เท่านั้น ไม่ rebuild DOM จึงไม่เสีย state
// ตัวเลือก (radio) ที่ผู้ใช้เลือกไว้อยู่
function filterPickerRows(inputId, tbodyId) {
  const input = document.getElementById(inputId);
  const tbody = document.getElementById(tbodyId);
  if (!input || !tbody) return;
  const q = input.value.trim().toLowerCase();
  tbody.querySelectorAll('tr').forEach((tr) => {
    if (!tr.dataset.pf) return; // แถวข้อความว่าง/info ไม่มี data-pf ให้ข้าม ไม่ซ่อน
    tr.style.display = !q || tr.dataset.pf.includes(q) ? '' : 'none';
  });
}

// สร้างตารางเลือก Serial Number สำหรับ 1 รายการอุปกรณ์ในคำขอ (track S/N) — แสดงข้อมูลประกอบการตัดสินใจ:
// ที่ตั้งปัจจุบัน + badge "เคยอยู่ไซต์นี้มาก่อน" / "ใกล้ไซต์นี้" เรียงของที่แนะนำไว้บนสุด
// พร้อมกล่องแจ้งเตือนแยกต่างหากถ้ามีของประเภทเดียวกันใกล้ครบกำหนดคืนจากไซต์อื่น (ชี้เป้าให้ไปตามรับคืน
// ก่อน — mockup นี้ "ไม่" อนุญาตให้โอนย้ายตรงข้ามคำขอ ตามที่ user ยืนยัน ต้องผ่านขั้นตอนรับคืน+เช็คสภาพจริงก่อนเสมอ)
function buildDispatchPickerHtml(idx, item, qty, cls, r) {
  const reqRegion = regionOf(r.project);

  let candidates = ASSETS.filter((a) => a.type === item.name && a.status === 'IN_STOCK' && a.classification === cls);
  candidates = candidates
    .map((a) => {
      const usedBefore = assetUsedBySite(a.tag, r.project);
      const aRegion = regionOf(a.actualLocation) || regionOf(a.location);
      const nearby = !!(reqRegion && aRegion && aRegion === reqRegion);
      return { a, usedBefore, nearby, score: (usedBefore ? 2 : 0) + (nearby ? 1 : 0) };
    })
    .sort((x, y) => y.score - x.score || x.a.tag.localeCompare(y.a.tag));

  const searchId = `dispatchPickerSearch${idx}`;
  const tbodyId = `dispatchPickerBody${idx}`;

  const rowsHtml = candidates.length
    ? candidates
        .map(({ a, usedBefore, nearby }, i) => {
          const pf = [a.tag, a.serial, a.actualLocation, a.location].join(' ').toLowerCase();
          return `
          <tr data-pf="${pf}">
            <td style="width:26px;text-align:center;"><input type="radio" name="dispatchPick${idx}" value="${a.tag}" ${i === 0 ? 'checked' : ''} /></td>
            <td><b>${a.tag}</b><br/><span style="color:#94a3b8;font-size:11.5px;">S/N: ${a.serial}</span></td>
            <td>${a.actualLocation}</td>
            <td>
              ${usedBefore ? '<span class="tag tag-green" style="margin-right:4px;white-space:nowrap;">✓ เคยอยู่ไซต์นี้มาก่อน</span>' : ''}
              ${nearby ? `<span class="tag tag-blue" style="white-space:nowrap;">📍 ใกล้ไซต์นี้ (${regionOf(a.actualLocation) || regionOf(a.location)})</span>` : ''}
              ${!usedBefore && !nearby ? '<span style="color:#cbd5e1;">—</span>' : ''}
            </td>
          </tr>`;
        })
        .join('')
    : `<tr><td colspan="4" class="empty-hint">— ไม่มีของว่างในสต๊อกตรงประเภทนี้ —</td></tr>`;

  const searchHtml = candidates.length > 4
    ? `<input type="text" id="${searchId}" placeholder="ค้นหา Asset Tag / Serial / สถานที่..." style="margin-bottom:6px;" oninput="filterPickerRows('${searchId}', '${tbodyId}')" />`
    : '';

  const today = new Date();
  const soonLimit = new Date();
  soonLimit.setDate(soonLimit.getDate() + DUE_SOON_DAYS);
  let nearDue = ASSETS.filter((a) => a.type === item.name && a.status === 'BORROWED' && a.classification === cls && a.dueDate);
  nearDue = nearDue
    .filter((a) => { const d = new Date(a.dueDate); return d >= today && d <= soonLimit; })
    .map((a) => ({ a, nearby: !!(reqRegion && regionOf(a.actualLocation) === reqRegion) }))
    .sort((x, y) => x.a.dueDate.localeCompare(y.a.dueDate));

  const nearDueHtml = nearDue.length
    ? `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 12px;margin-top:8px;">
      <div style="font-weight:600;font-size:12.5px;color:#92400e;margin-bottom:6px;">
        🔔 ${item.name} ที่กำลังเบิกอยู่ที่อื่นและใกล้ครบกำหนดคืน (ภายใน ${DUE_SOON_DAYS} วัน) มี ${nearDue.length} รายการ —
        ยังเลือกจ่ายจากตรงนี้ไม่ได้ ต้องให้ OPERATION ไปกดรับคืนจริง (เช็คสภาพ) จากไซต์เดิมก่อน
      </div>
      ${nearDue
        .map(({ a, nearby }) => `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;padding:5px 0;border-top:1px solid #fde68a;">
            <div><b>${a.tag}</b> — ${a.project} (${a.actualLocation})${nearby ? ' <span class="tag tag-blue" style="margin-left:4px;">📍 ใกล้ไซต์นี้</span>' : ''}</div>
            <div style="white-space:nowrap;">กำหนดคืน ${a.dueDate}</div>
          </div>`)
        .join('')}
      <div style="margin-top:8px;"><button class="btn btn-sm" onclick="goToReturnScreen()">ไปหน้ารับคืนอุปกรณ์ →</button></div>
    </div>`
    : '';

  return `
    <div class="form-row">
      <label>${item.name} ×${qty} — เลือก Serial Number ที่จะจ่าย</label>
      ${searchHtml}
      <table class="dt" style="margin-top:6px;">
        <thead><tr><th></th><th>Asset Tag / Serial</th><th>ที่ตั้งปัจจุบัน</th><th>คำแนะนำ</th></tr></thead>
        <tbody id="${tbodyId}">${rowsHtml}</tbody>
      </table>
    </div>
    ${nearDueHtml}
  `;
}

function goToReturnScreen() {
  closeActionDrawer();
  const link = document.querySelector('a[data-screen="return"]');
  if (link) link.click();
}

function openDispatchDrawer(reqId) {
  const r = borrowRequests.find((x) => x.id === reqId);
  if (!r) return;
  const cls = purposeToClassification(r.purpose);
  let hasSerialItems = false;

  const rowsHtml = r.items.map((it, idx) => {
    const item = ITEM_MASTER.find((x) => x.id === it.itemId);
    if (item.trackSerial) {
      hasSerialItems = true;
      return buildDispatchPickerHtml(idx, item, it.qty, cls, r);
    }
    return `<div class="kv"><div class="k">${item.name} ×${it.qty}</div><div class="v" style="color:#64748b;">ตัดจากคลังตามจำนวน (ไม่ track S/N)</div></div>`;
  }).join('');

  const body = `
    <div class="kv"><div class="k">เลขคำขอ</div><div class="v"><b>${r.id}</b></div></div>
    <div class="kv"><div class="k">วัตถุประสงค์</div><div class="v">${r.purpose}</div></div>
    <div class="kv"><div class="k">ผู้ขอ</div><div class="v">${r.requester} (${r.team})</div></div>
    <div class="kv"><div class="k">โครงการ/แผนก</div><div class="v">${r.project}</div></div>
    <div class="kv"><div class="k">กำหนดคืน</div><div class="v">${r.dueDate || '-'}</div></div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
    <h3 style="font-size:14px;margin:0 0 8px;">เลือก Serial Number ที่จะจ่าย</h3>
    ${rowsHtml}
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="confirmDispatch('${reqId}')">ยืนยันจ่ายของ</button>
    </div>
  `;
  openActionDrawer('จ่ายอุปกรณ์ — ' + r.id, body, { wide: hasSerialItems });
}

function confirmDispatch(reqId) {
  const r = borrowRequests.find((x) => x.id === reqId);
  if (!r) return;

  let ok = true;
  const dispatchedTags = [];
  r.items.forEach((it, idx) => {
    const item = ITEM_MASTER.find((x) => x.id === it.itemId);
    if (item.trackSerial) {
      const picked = document.querySelector(`input[name="dispatchPick${idx}"]:checked`);
      const tag = picked ? picked.value : '';
      if (!tag) { ok = false; return; }
      const asset = ASSETS.find((a) => a.tag === tag);
      if (asset) {
        asset.status = r.purpose === 'ขายขาด' ? 'SOLD' : 'BORROWED';
        asset.project = r.project;
        asset.location = r.project;
        asset.actualLocation = r.project;
        asset.dueDate = r.purpose === 'ขายขาด' ? null : r.dueDate;
        dispatchedTags.push(tag);
      }
    }
  });
  if (!ok) { toast('⚠️ มีรายการที่ไม่มี Serial ว่างให้เลือก กรุณารับของเข้าคลังเพิ่มก่อน'); return; }

  const today = new Date().toISOString().slice(0, 10);
  dispatchedTags.forEach((tag) => {
    ASSET_HISTORY.unshift({
      tag, event: 'DISPATCH', project: r.project, date: today,
      note: `${r.purpose} — คำขอ ${r.id} โดย ${r.requester}${r.dueDate ? ` (กำหนดคืน ${r.dueDate})` : ''}`,
      by: DEMO_USERS[currentRole].name,
    });
  });

  r.status = 'เบิกแล้ว';
  // เก็บว่าจ่ายทรัพย์สินตัวไหนไปบ้าง (ใช้เทียบตอนผู้รับมายืนยันรับของภายหลัง) + ตั้งสถานะรอยืนยันรับ
  r.dispatchedAssets = dispatchedTags;
  r.receiptStatus = 'รอผู้รับยืนยัน';
  r.receiptNote = null;
  r.receiptConfirmedBy = null;
  r.receiptConfirmedAt = null;

  toast(`จ่ายของสำหรับ ${r.id} เรียบร้อย — ผู้ขอสามารถมารับได้ (รอผู้รับยืนยันรับของในระบบ)`);
  closeActionDrawer();
  renderDispatchQueue();
  renderDispatchReceiptQueue();
  renderPendingRequests();
  renderAssetTable();
  renderDashboard();
}

// ================================================================
// รับของ — ผู้ขอเบิกยืนยันว่าได้รับของจริงตรงกับที่จ่ายไปหรือไม่ (เพิ่ม Round 8)
// กดได้ 2 ทาง: (1) ผู้ขอเบิกเองที่หน้า "ขอเบิก" แท็บ "รายการคำขอที่ส่งแล้ว" หรือ (2) OPERATION กดบันทึก
// แทนที่หน้า "จ่ายอุปกรณ์" แท็บ "รอยืนยันรับของ" (เช่น กรณีได้รับแจ้งทางโทรศัพท์จากไซต์ที่ไม่สะดวกเข้าระบบ)
// หมายเหตุการออกแบบที่คุยกับ user แล้ว (2 ต.ค. 2569):
//  - สถานะ "เบิกแล้ว" ของทรัพย์สินยังคงเปลี่ยนตอนจ่ายของเหมือนเดิม (ไม่รอผู้รับยืนยันก่อน) — ไม่กระทบ
//    logic เดิมของหน้าต่ออายุ/คำนวณวันครบกำหนดคืนที่อิงสถานะ "เบิกแล้ว" อยู่แล้ว
//  - การยืนยันรับของเป็นชั้นข้อมูลเพิ่มเติมต่างหาก (receiptStatus) ไม่ใช่ gate การเปลี่ยนสถานะ
//  - ถ้าพบว่าจำนวน/สภาพไม่ตรง แค่บันทึกเป็น "แจ้งปัญหา" ให้ OPERATION เห็นเป็น flag ไปติดตามเอง
//    (ยังไม่ auto สร้างเคสเข้าคิวซ่อม/write-off ใด ๆ ในรอบนี้)
const RECEIPT_STATUS_CLASS = { 'รอผู้รับยืนยัน': 'tag-amber', 'รับของแล้ว': 'tag-green', 'แจ้งปัญหา': 'tag-red' };

// รายการที่ต้องเช็ก 1 แถวต่อ 1 "หน่วยที่จับต้องได้" ของคำขอนี้ — ของที่ track S/N แยกเป็นแถวต่อ 1 ชิ้น
// (อิงจาก dispatchedAssets ที่บันทึกไว้ตอนจ่ายของจริง) ส่วนของที่นับจำนวนอย่างเดียวรวมเป็น 1 แถวต่อ 1
// รายการ — ฟังก์ชันนี้ใช้ร่วมกันทั้งตอนสร้าง HTML ของ checklist และตอนอ่านผลตอนกดบันทึก เพื่อให้ rowId
// ตรงกันเป๊ะทั้ง 2 ฝั่งโดยไม่ต้องเก็บ state แยก
function receiptRowsForRequest(r) {
  const rows = [];
  r.items.forEach((it, idx) => {
    const item = ITEM_MASTER.find((x) => x.id === it.itemId);
    if (!item) return;
    if (item.trackSerial) {
      const tags = (r.dispatchedAssets || []).filter((tag) => {
        const a = ASSETS.find((x) => x.tag === tag);
        return a && a.type === item.name;
      });
      tags.forEach((tag) => {
        const a = ASSETS.find((x) => x.tag === tag);
        rows.push({ rowId: 'a_' + tag.replace(/[^a-zA-Z0-9]/g, '_'), label: `${item.name} — <b>${tag}</b> (S/N: ${a ? a.serial : '-'})`, tag });
      });
    } else {
      rows.push({ rowId: 'c_' + idx, label: `${item.name} ×${it.qty} <span style="color:#94a3b8;">(นับจำนวน ไม่ track S/N)</span>`, tag: null });
    }
  });
  return rows;
}

function buildReceiptChecklistHtml(r) {
  const rows = receiptRowsForRequest(r);
  if (!rows.length) {
    return '<div class="empty-hint">ไม่พบรายการที่จ่ายไปให้เช็ก (อาจเป็นข้อมูลเก่าก่อนมีฟีเจอร์นี้)</div>';
  }
  return rows
    .map(
      (row) => `
    <div class="kv" style="align-items:flex-start;">
      <div class="k">${row.label}</div>
      <div class="v">
        <label style="margin-right:16px;white-space:nowrap;"><input type="radio" name="rc_${row.rowId}" value="ok" checked /> ✅ ครบ/สภาพดี</label>
        <label style="white-space:nowrap;"><input type="radio" name="rc_${row.rowId}" value="issue" /> ⚠️ มีปัญหา</label>
      </div>
    </div>`,
    )
    .join('');
}

function openReceiptDrawer(reqId, byOperation) {
  const r = borrowRequests.find((x) => x.id === reqId);
  if (!r) return;
  const body = `
    <div class="kv"><div class="k">เลขคำขอ</div><div class="v"><b>${r.id}</b></div></div>
    <div class="kv"><div class="k">ผู้ขอเบิก</div><div class="v">${r.requester} (${r.team})</div></div>
    <div class="kv"><div class="k">โครงการ/แผนก</div><div class="v">${r.project}</div></div>
    ${
      byOperation
        ? '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 12px;font-size:12.5px;color:#1e40af;margin-top:10px;">กำลังบันทึกแทนผู้ขอเบิก เช่น กรณีได้รับแจ้งทางโทรศัพท์หรือเซ็นใบรับที่หน้างานแล้วนำมาคีย์เข้าระบบ</div>'
        : ''
    }
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
    <h3 style="font-size:14px;margin:0 0 10px;">เช็กรายการที่ได้รับจริง เทียบกับรายการที่จ่ายไป</h3>
    <div id="receiptChecklist">${buildReceiptChecklistHtml(r)}</div>
    <div class="form-row" style="margin-top:14px;">
      <label>รายละเอียดปัญหา (ถ้ามีรายการที่ติ๊ก "มีปัญหา" กรุณาระบุ)</label>
      <textarea id="receiptNote" placeholder="เช่น จำนวนไม่ครบ / มีรอยขีดข่วน / อุปกรณ์เสีย / อุปกรณ์เสริมหาย"></textarea>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="submitReceiptConfirm('${reqId}', ${byOperation ? 'true' : 'false'})">บันทึกผลการรับของ</button>
    </div>
  `;
  openActionDrawer('ยืนยันรับของ — ' + r.id, body, { wide: true });
}

function submitReceiptConfirm(reqId, byOperation) {
  const r = borrowRequests.find((x) => x.id === reqId);
  if (!r) return;

  const rows = receiptRowsForRequest(r);
  let hasIssue = false;
  rows.forEach((row) => {
    const picked = document.querySelector(`input[name="rc_${row.rowId}"]:checked`);
    if (picked && picked.value === 'issue') hasIssue = true;
  });

  const note = document.getElementById('receiptNote').value.trim();
  if (hasIssue && !note) { toast('⚠️ พบรายการที่ติ๊ก "มีปัญหา" กรุณาระบุรายละเอียดปัญหาก่อนบันทึก'); return; }

  const confirmedBy = byOperation ? `${DEMO_USERS[currentRole].name} (บันทึกแทนผู้ขอเบิก)` : r.requester;
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

  r.receiptStatus = hasIssue ? 'แจ้งปัญหา' : 'รับของแล้ว';
  r.receiptNote = note || null;
  r.receiptConfirmedBy = confirmedBy;
  r.receiptConfirmedAt = now;

  const eventType = hasIssue ? 'RECEIPT_ISSUE' : 'RECEIPT_CONFIRM';
  (r.dispatchedAssets || []).forEach((tag) => {
    ASSET_HISTORY.unshift({
      tag,
      event: eventType,
      project: r.project,
      date: now.slice(0, 10),
      note: note || 'ยืนยันรับของครบถ้วน สภาพดี',
      by: confirmedBy,
    });
  });

  toast(
    hasIssue
      ? `บันทึกผลการรับของสำหรับ ${r.id} แล้ว — มีการแจ้งปัญหา OPERATION จะติดตามต่อ`
      : `ยืนยันรับของสำหรับ ${r.id} เรียบร้อย — ปิดรายการสมบูรณ์`,
  );
  closeActionDrawer();
  renderPendingRequests();
  renderDispatchReceiptQueue();
  renderDashboard();
}

// ================================================================
// RENEWAL (ต่ออายุการยืม)
// ================================================================
function renderRenewalQueue() {
  const qEl = document.getElementById('renewalSearch');
  const q = qEl ? qEl.value.trim().toLowerCase() : '';
  const rows = ASSETS.filter((a) => a.status === 'BORROWED' && a.dueDate)
    .filter((a) => !q || [a.tag, a.serial, a.type, a.project].join(' ').toLowerCase().includes(q));
  document.getElementById('renewalQueueBody').innerHTML = rows
    .map((a) => `<tr>
      <td><b>${a.tag}</b></td><td>${a.type}</td><td>${a.project}</td><td>${a.dueDate}</td>
      <td><button class="btn btn-sm" onclick="openRenewDrawer('${a.tag.replace(/'/g, "\\'")}')">ต่ออายุ</button></td>
    </tr>`)
    .join('') || `<tr><td colspan="5" class="empty-hint">${q ? 'ไม่พบรายการที่ตรงกับคำค้นหา' : 'ไม่มีรายการที่ยืมอยู่ตอนนี้'}</td></tr>`;
}

function renderRenewalHistory() {
  document.getElementById('renewalHistoryBody').innerHTML = RENEWAL_RECORDS
    .map((r) => `<tr>
      <td><b>${r.id}</b></td><td>${r.assetTag}</td><td>${r.oldDueDate}</td><td>${r.newDueDate}</td>
      <td>${r.requestedBy}</td><td>${r.requestedAt}</td><td>${r.note || '-'}</td>
    </tr>`)
    .join('') || `<tr><td colspan="7" class="empty-hint">ยังไม่มีประวัติการต่ออายุ</td></tr>`;
}

function openRenewDrawer(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const body = `
    <div class="kv"><div class="k">Asset Tag</div><div class="v"><b>${a.tag}</b></div></div>
    <div class="kv"><div class="k">โครงการ/ลูกค้า</div><div class="v">${a.project}</div></div>
    <div class="kv"><div class="k">กำหนดคืนปัจจุบัน</div><div class="v">${a.dueDate}</div></div>
    <div class="form-row" style="margin-top:14px;">
      <label>วันที่คืนใหม่ <span class="req">*</span></label>
      <input type="date" id="renewNewDate" value="${a.dueDate}" />
    </div>
    <div class="form-row">
      <label>หมายเหตุ</label>
      <textarea id="renewNote" placeholder="เหตุผลการต่ออายุ (ถ้ามี)"></textarea>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="confirmRenew('${tag.replace(/'/g, "\\'")}')">ยืนยันต่ออายุ</button>
    </div>
  `;
  openActionDrawer('ต่ออายุการยืม — ' + a.tag, body);
}

function confirmRenew(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const newDate = document.getElementById('renewNewDate').value;
  const note = document.getElementById('renewNote').value.trim();
  if (!newDate) { toast('⚠️ กรุณาระบุวันที่คืนใหม่'); return; }
  const oldDate = a.dueDate;
  a.dueDate = newDate;
  RENEWAL_RECORDS.unshift({
    id: nextSeqId('REN-2026', RENEWAL_RECORDS, 4), assetTag: tag, oldDueDate: oldDate, newDueDate: newDate,
    requestedBy: DEMO_USERS[currentRole].name, requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '), note,
  });
  ASSET_HISTORY.unshift({
    tag, event: 'RENEW', project: a.project, date: new Date().toISOString().slice(0, 10),
    note: `ต่ออายุจาก ${oldDate} เป็น ${newDate}${note ? ' · ' + note : ''}`, by: DEMO_USERS[currentRole].name,
  });
  toast(`ต่ออายุ ${tag} เป็น ${newDate} เรียบร้อย`);
  closeActionDrawer();
  renderRenewalQueue();
  renderRenewalHistory();
  renderAssetTable();
  renderDashboard();
}

// ================================================================
// RETURN (รับคืนอุปกรณ์)
// ================================================================
// เพิ่ม 2 ต.ค. 2569 (Round 9 — gap A/B ที่ user ชี้): ทางเข้าคืนของตอนนี้มี 2 ทาง
//  (1) ผู้ขอเบิก "แจ้งคืน" เองผ่านระบบ (self-service) จากหน้าขอเบิก แท็บ "รายการคำขอที่ส่งแล้ว" —
//      สร้างเป็น RETURN_REQUESTS รอ OPERATION มาตรวจสอบ+ยืนยันรับจริงอีกที (ของยังไม่ถูกตัดสถานะจน
//      กว่า OPERATION จะยืนยัน) — แท็บ "คำขอแจ้งคืนจากผู้ขอเบิก" ด้านล่าง
//  (2) OPERATION เปิดเองแล้วเลือกจากตาราง (เคส "ของมาก่อนใบคืน" ที่ทำไว้ Round 5) — แท็บ "คืนของเอง"
//      ยังคงอยู่เหมือนเดิมทุกประการ ไม่ตัดออก เพราะยังมีประโยชน์เมื่อไม่มีการแจ้งล่วงหน้าผ่านระบบ

// รายการที่ "แจ้งคืนได้" ของคำขอหนึ่ง ๆ — ใช้ receiptRowsForRequest ร่วม (โครงสร้างแถวเดียวกับตอนเช็ก
// รับของ) แต่กรองเฉพาะของที่ (ก) track Serial Number (ของนับจำนวนอย่างเดียวยังไม่รองรับในรอบนี้ เพราะ
// ทั้งระบบไม่เคยมีกลไกติดตามรายชิ้นของของประเภทนี้อยู่แล้วตั้งแต่ต้น) (ข) ยังมีสถานะ BORROWED จริง
// (ค) ยังไม่มีคำขอแจ้งคืนค้างอยู่ของคำขอเดียวกัน (กันแจ้งคืนซ้ำซ้อนก่อน OPERATION จะมายืนยันรายการเดิม)
function returnableRowsForRequest(r) {
  const alreadyRequested = new Set();
  RETURN_REQUESTS.forEach((rr) => {
    if (rr.reqId === r.id && rr.status === 'รอ OPERATION ยืนยันรับคืน') {
      rr.items.forEach((it) => { if (it.tag) alreadyRequested.add(it.tag); });
    }
  });
  return receiptRowsForRequest(r).filter((row) => {
    if (!row.tag || alreadyRequested.has(row.tag)) return false;
    const a = ASSETS.find((x) => x.tag === row.tag);
    return a && a.status === 'BORROWED';
  });
}

function buildSelfReturnChecklistHtml(rows) {
  if (!rows.length) return '<div class="empty-hint">ไม่มีรายการที่สามารถแจ้งคืนได้ในขณะนี้</div>';
  return rows
    .map(
      (row) => `
    <div class="kv" style="align-items:flex-start;">
      <div class="k">${row.label}</div>
      <div class="v">
        <select id="ret_${row.rowId}">${RETURN_REASONS.map((rr) => `<option value="${rr}">${rr}</option>`).join('')}</select>
      </div>
    </div>`,
    )
    .join('');
}

function openSelfReturnDrawer(reqId) {
  const r = borrowRequests.find((x) => x.id === reqId);
  if (!r) return;
  const rows = returnableRowsForRequest(r);
  const body = `
    <div class="kv"><div class="k">เลขคำขอ</div><div class="v"><b>${r.id}</b></div></div>
    <div class="kv"><div class="k">โครงการ/แผนก</div><div class="v">${r.project}</div></div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
    <h3 style="font-size:14px;margin:0 0 10px;">เลือกรายการที่จะคืน และระบุสภาพของแต่ละชิ้น</h3>
    <div id="selfReturnChecklist">${buildSelfReturnChecklistHtml(rows)}</div>
    <div class="form-row" style="margin-top:14px;">
      <label>หมายเหตุ</label>
      <textarea id="selfReturnNote" placeholder="เช่น อาการที่พบ / เหตุผลเพิ่มเติม"></textarea>
    </div>
    <div class="form-row">
      <label style="display:flex;align-items:center;gap:6px;font-weight:400;">
        <input type="checkbox" id="selfReturnWantsReplacement" style="width:auto;" />
        ยังต้องใช้งานต่อเนื่อง — ถ้ามีรายการชำรุด ต้องการอุปกรณ์ทดแทนทันที
      </label>
    </div>
    <p style="color:#64748b;font-size:12.5px;">คำขอนี้จะเข้าคิวให้ OPERATION ตรวจสอบและยืนยันรับคืนจริงอีกครั้ง — ของยังไม่ถูกตัดออกจากที่คุณถืออยู่จนกว่า OPERATION จะยืนยัน</p>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="submitSelfReturn('${reqId}')">ส่งคำขอแจ้งคืน</button>
    </div>
  `;
  openActionDrawer('แจ้งคืนอุปกรณ์ — ' + r.id, body, { wide: true });
}

function submitSelfReturn(reqId) {
  const r = borrowRequests.find((x) => x.id === reqId);
  if (!r) return;
  const rows = returnableRowsForRequest(r);
  if (!rows.length) { toast('⚠️ ไม่มีรายการที่สามารถแจ้งคืนได้'); return; }

  const note = document.getElementById('selfReturnNote').value.trim();
  const wantsReplacement = document.getElementById('selfReturnWantsReplacement').checked;
  const items = rows.map((row) => {
    const sel = document.getElementById(`ret_${row.rowId}`);
    const asset = ASSETS.find((a) => a.tag === row.tag);
    return { tag: row.tag, itemName: asset ? asset.type : '-', reason: sel ? sel.value : 'คืนปกติ' };
  });

  RETURN_REQUESTS.unshift({
    id: nextSeqId('RET-2026', RETURN_REQUESTS, 4),
    reqId: r.id,
    requester: r.requester,
    team: r.team,
    project: r.project,
    items,
    note: note || null,
    wantsReplacement,
    status: 'รอ OPERATION ยืนยันรับคืน',
    requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    confirmedBy: null,
    confirmedAt: null,
  });

  toast(`แจ้งคืนอุปกรณ์สำหรับ ${r.id} เรียบร้อย — รอ OPERATION ยืนยันรับคืนจริง`);
  closeActionDrawer();
  renderPendingRequests();
  renderDashboard();
}

// คิวคำขอแจ้งคืน (self-service) ที่ OPERATION ต้องมาดำเนินการต่อ
function renderSelfReturnQueue() {
  const tbody = document.getElementById('selfReturnQueueBody');
  if (!tbody) return;
  const queue = RETURN_REQUESTS.filter((rr) => rr.status === 'รอ OPERATION ยืนยันรับคืน');
  tbody.innerHTML = queue
    .map(
      (rr) => `<tr>
      <td><b>${rr.id}</b></td>
      <td>${rr.requester}<br/><span style="color:#94a3b8;font-size:11.5px;">${rr.team}</span></td>
      <td>${rr.project}</td>
      <td>${rr.items
        .map((it) => `${it.itemName} (${it.tag})<br/><span class="tag ${it.reason === 'อุปกรณ์เสีย' ? 'tag-red' : 'tag-gray'}">${it.reason}</span>`)
        .join('<hr style="border:none;border-top:1px dashed #e2e8f0;margin:4px 0;" />')}</td>
      <td>${rr.requestedAt}</td>
      <td><button class="btn btn-sm btn-primary" onclick="openFulfillReturnDrawer('${rr.id}')">ดำเนินการรับคืน</button></td>
    </tr>`,
    )
    .join('') || `<tr><td colspan="6" class="empty-hint">ไม่มีคำขอแจ้งคืนค้างอยู่</td></tr>`;
  const tab = document.getElementById('selfReturnCount');
  if (tab) tab.textContent = `(${queue.length})`;
}

function openFulfillReturnDrawer(retId) {
  const rr = RETURN_REQUESTS.find((x) => x.id === retId);
  if (!rr) return;
  const rowsHtml = rr.items
    .map(
      (it, idx) => `
    <div class="kv" style="align-items:flex-start;">
      <div class="k">${it.itemName} — <b>${it.tag}</b></div>
      <div class="v">
        <select id="fret_${idx}">${RETURN_REASONS.map((r) => `<option value="${r}" ${r === it.reason ? 'selected' : ''}>${r}</option>`).join('')}</select>
      </div>
    </div>`,
    )
    .join('');
  const body = `
    <div class="kv"><div class="k">คำขอแจ้งคืน</div><div class="v"><b>${rr.id}</b></div></div>
    <div class="kv"><div class="k">ผู้แจ้งคืน</div><div class="v">${rr.requester} (${rr.team})</div></div>
    <div class="kv"><div class="k">โครงการ/แผนก</div><div class="v">${rr.project}</div></div>
    ${rr.note ? `<div class="kv"><div class="k">หมายเหตุจากผู้แจ้งคืน</div><div class="v">${rr.note}</div></div>` : ''}
    ${
      rr.wantsReplacement
        ? '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 12px;font-size:12.5px;color:#1e40af;margin-top:10px;">ผู้แจ้งคืนระบุว่ายังต้องใช้งานต่อเนื่อง — ถ้ายืนยันว่า "อุปกรณ์เสีย" ระบบจะสร้างคำขอเบิกใหม่ (ทดแทน) ให้อัตโนมัติ รอ OPERATION ตรวจสอบและจ่ายของตามปกติ</div>'
        : ''
    }
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
    <h3 style="font-size:14px;margin:0 0 10px;">ยืนยัน/ปรับเหตุผลรับคืนจริงต่อรายการ</h3>
    ${rowsHtml}
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="confirmFulfillReturn('${retId}')">ยืนยันรับคืน</button>
    </div>
  `;
  openActionDrawer('ดำเนินการรับคืน — ' + rr.id, body, { wide: true });
}

function confirmFulfillReturn(retId) {
  const rr = RETURN_REQUESTS.find((x) => x.id === retId);
  if (!rr) return;
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const confirmedBy = DEMO_USERS[currentRole].name;
  let anyBroken = false;

  rr.items.forEach((it, idx) => {
    const sel = document.getElementById(`fret_${idx}`);
    const reason = sel ? sel.value : it.reason;
    it.reason = reason; // บันทึกเหตุผลที่ OPERATION ยืนยันจริง (อาจต่างจากที่ผู้แจ้งคืนระบุไว้ตอนแรก)
    const a = ASSETS.find((x) => x.tag === it.tag);
    if (!a) return;
    const broken = reason === 'อุปกรณ์เสีย';
    if (broken) anyBroken = true;

    RETURN_LOG.unshift({ assetTag: it.tag, type: a.type, reason, note: rr.note || '', returnedBy: confirmedBy, returnedAt: now });
    ASSET_HISTORY.unshift({
      tag: it.tag, event: 'RETURN', project: a.project, date: now.slice(0, 10),
      note: `${reason}${rr.note ? ' · ' + rr.note : ''} (แจ้งคืนเองผ่านระบบ — คำขอ ${rr.id})`, by: confirmedBy,
    });

    a.status = broken ? 'REPAIR' : 'IN_STOCK';
    a.actualLocation = broken ? 'ศูนย์ซ่อม (รอ IT Support ตรวจ)' : baseLocationFor(a.classification);
    a.location = broken ? a.location : baseLocationFor(a.classification);
    a.project = '-';
    a.dueDate = null;
  });

  rr.status = 'รับคืนแล้ว';
  rr.confirmedBy = confirmedBy;
  rr.confirmedAt = now;

  // Gap B: ถ้าผู้แจ้งคืนบอกว่ายังต้องใช้ต่อ และมีรายการเสียจริง สร้างคำขอเบิกทดแทนแบบร่างให้อัตโนมัติ
  // (ไม่ auto จ่ายของทันที — ยังต้องผ่าน OPERATION ตรวจสอบ+จ่ายของตามขั้นตอนปกติเหมือนคำขออื่น ๆ)
  let replacementMsg = '';
  if (rr.wantsReplacement && anyBroken) {
    const originalReq = borrowRequests.find((x) => x.id === rr.reqId);
    const replacementItems = rr.items
      .filter((it) => it.reason === 'อุปกรณ์เสีย')
      .map((it) => {
        const master = itemMasterByName(it.itemName);
        return master ? { itemId: master.id, qty: 1 } : null;
      })
      .filter(Boolean);
    if (replacementItems.length) {
      const draftReq = {
        id: 'REQ-2026-' + String(90 + borrowRequests.length + 1).padStart(4, '0'),
        purpose: originalReq ? originalReq.purpose : 'ยืม',
        requester: rr.requester,
        team: rr.team,
        project: rr.project,
        neededDate: now.slice(0, 10),
        dueDate: null,
        items: replacementItems,
        status: 'รอจ่ายของ',
        createdAt: now,
        source: 'standalone',
        autoReplacementNote: `สร้างอัตโนมัติจากการแจ้งคืนอุปกรณ์เสีย (คำขอคืน ${rr.id}) — โปรดตรวจสอบก่อนจ่ายของ`,
      };
      borrowRequests.unshift(draftReq);
      replacementMsg = ` — สร้างคำขอเบิกทดแทนอัตโนมัติ ${draftReq.id} แล้ว (รอ OPERATION ตรวจสอบและจ่ายของ)`;
    }
  }

  toast(`ยืนยันรับคืน ${rr.id} เรียบร้อย${anyBroken ? ' — รายการที่เสียถูกส่งเข้าคิวพิจารณาซ่อมแล้ว' : ''}${replacementMsg}`);
  closeActionDrawer();
  renderSelfReturnQueue();
  renderReturnQueue();
  renderReturnLog();
  renderPendingRequests();
  renderDispatchQueue();
  renderAssetTable();
  renderRepairQueue();
  renderDashboard();
}

function switchReturnTab(el) {
  document.querySelectorAll('#screen-return .pill-tabs .pt').forEach((p) => p.classList.remove('active'));
  el.classList.add('active');
  const tab = el.dataset.tab;
  document.getElementById('returnTabRequests').style.display = tab === 'requests' ? 'block' : 'none';
  document.getElementById('returnTabWalkin').style.display = tab === 'walkin' ? 'block' : 'none';
}

function renderReturnQueue() {
  const qEl = document.getElementById('returnSearch');
  const q = qEl ? qEl.value.trim().toLowerCase() : '';
  const rows = ASSETS.filter((a) => a.status === 'BORROWED')
    .filter((a) => !q || [a.tag, a.serial, a.type, a.project].join(' ').toLowerCase().includes(q));
  document.getElementById('returnQueueBody').innerHTML = rows
    .map((a) => `<tr>
      <td><b>${a.tag}</b></td><td>${a.type}</td><td>${a.project}</td><td>${a.dueDate || '-'}</td>
      <td><button class="btn btn-sm" onclick="openReturnDrawer('${a.tag.replace(/'/g, "\\'")}')">รับคืน</button></td>
    </tr>`)
    .join('') || `<tr><td colspan="5" class="empty-hint">${q ? 'ไม่พบรายการที่ตรงกับคำค้นหา' : 'ไม่มีรายการที่เบิกอยู่ตอนนี้'}</td></tr>`;
}

function renderReturnLog() {
  document.getElementById('returnLogBody').innerHTML = RETURN_LOG
    .map((r) => `<tr>
      <td><b>${r.assetTag}</b></td><td>${r.type}</td><td>${r.reason}</td><td>${r.note || '-'}</td>
      <td>${r.returnedBy}</td><td>${r.returnedAt}</td>
    </tr>`)
    .join('') || `<tr><td colspan="6" class="empty-hint">ยังไม่มีประวัติการรับคืน</td></tr>`;
}

function openReturnDrawer(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const body = `
    <div class="kv"><div class="k">Asset Tag</div><div class="v"><b>${a.tag}</b></div></div>
    <div class="kv"><div class="k">ประเภท</div><div class="v">${a.type}</div></div>
    <div class="kv"><div class="k">โครงการ/ลูกค้า</div><div class="v">${a.project}</div></div>
    <div class="form-row" style="margin-top:14px;">
      <label>เหตุผลรับคืน <span class="req">*</span></label>
      <select id="returnReason">${RETURN_REASONS.map((r) => `<option value="${r}">${r}</option>`).join('')}</select>
    </div>
    <div class="form-row">
      <label>หมายเหตุ</label>
      <textarea id="returnNote" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"></textarea>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="confirmReturn('${tag.replace(/'/g, "\\'")}')">ยืนยันรับคืน</button>
    </div>
  `;
  openActionDrawer('รับคืนอุปกรณ์ — ' + a.tag, body);
}

function confirmReturn(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const reason = document.getElementById('returnReason').value;
  const note = document.getElementById('returnNote').value.trim();
  const broken = reason === 'อุปกรณ์เสีย';
  const fromProject = a.project;

  RETURN_LOG.unshift({
    assetTag: tag, type: a.type, reason, note,
    returnedBy: DEMO_USERS[currentRole].name, returnedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  });
  ASSET_HISTORY.unshift({
    tag, event: 'RETURN', project: fromProject, date: new Date().toISOString().slice(0, 10),
    note: `${reason}${note ? ' · ' + note : ''}`, by: DEMO_USERS[currentRole].name,
  });

  a.status = broken ? 'REPAIR' : 'IN_STOCK';
  a.actualLocation = broken ? 'ศูนย์ซ่อม (รอ IT Support ตรวจ)' : baseLocationFor(a.classification);
  a.location = broken ? a.location : baseLocationFor(a.classification);
  a.project = '-';
  a.dueDate = null;

  toast(`รับคืน ${tag} เรียบร้อย — ${broken ? 'ส่งเข้าคิวพิจารณาซ่อม' : 'กลับเข้าสต๊อกพร้อมใช้งาน'}`);
  closeActionDrawer();
  renderReturnQueue();
  renderReturnLog();
  renderAssetTable();
  renderDashboard();
}

// ================================================================
// REPAIR QUEUE (คิวพิจารณาซ่อม)
// ================================================================
// เพิ่ม 2 ต.ค. 2569 (Round 9 — gap C ที่ user ถาม "ซ่อมเสร็จแล้วทำไงต่อ"): เดิมกดปุ่ม "ซ่อมได้" ครั้งเดียว
// = กลับเข้าสต๊อกทันที เหมือนสมมติว่าซ่อมเสร็จในพริบตา ทั้งที่จริงมีช่วงเวลาที่อุปกรณ์ไปอยู่ร้าน/vendor
// (ไม่อยู่ในสต๊อก ไม่อยู่กับใคร) ถ้าไม่มีสถานะนี้ นับสต๊อกจริงจะไม่ตรงกับระบบ — แยกเป็น 2 ขั้นตอนแล้ว:
//  แท็บ "รอพิจารณา" (สถานะ REPAIR) → กด "ซ่อมได้" เปิด drawer กรอก vendor/วันที่คาดว่าเสร็จ/ค่าประมาณ
//    → สถานะเปลี่ยนเป็น OUT_FOR_REPAIR ย้ายไปแท็บ "กำลังซ่อม"
//  แท็บ "กำลังซ่อม" (สถานะ OUT_FOR_REPAIR) → กด "ยืนยันซ่อมเสร็จ" เมื่อได้เครื่องกลับมาจริง (กรอกค่าใช้
//    จ่ายจริง) → กลับเข้าสต๊อก — หรือกด "ซ่อมไม่ได้" ได้เช่นกัน (กรณี vendor ตรวจแล้วพบว่าซ่อมไม่ได้จริง)
function renderRepairQueue() {
  const qEl = document.getElementById('repairSearch');
  const q = qEl ? qEl.value.trim().toLowerCase() : '';
  const rows = ASSETS.filter((a) => a.status === 'REPAIR')
    .filter((a) => !q || [a.tag, a.serial, a.type].join(' ').toLowerCase().includes(q));
  document.getElementById('repairQueueBody').innerHTML = rows
    .map((a) => `<tr>
      <td><b>${a.tag}</b></td><td>${a.type}</td><td>${a.serial}</td><td>${a.actualLocation}</td>
      <td style="display:flex;gap:6px;">
        <button class="btn btn-sm" style="border-color:#16a34a;color:#16a34a;" onclick="openSendToRepairDrawer('${a.tag.replace(/'/g, "\\'")}')">ซ่อมได้</button>
        <button class="btn btn-sm btn-danger" onclick="openRepairRejectDrawer('${a.tag.replace(/'/g, "\\'")}')">ซ่อมไม่ได้</button>
      </td>
    </tr>`)
    .join('') || `<tr><td colspan="5" class="empty-hint">${q ? 'ไม่พบรายการที่ตรงกับคำค้นหา' : 'ไม่มีรายการรอพิจารณาซ่อม'}</td></tr>`;
}

function switchRepairTab(el) {
  document.querySelectorAll('#screen-repair .pill-tabs .pt').forEach((p) => p.classList.remove('active'));
  el.classList.add('active');
  const tab = el.dataset.tab;
  document.getElementById('repairTabPending').style.display = tab === 'pending' ? 'block' : 'none';
  document.getElementById('repairTabOut').style.display = tab === 'out' ? 'block' : 'none';
}

// เพิ่ม 2 ต.ค. 2569 (Round 10 ข้อ 2): เปลี่ยนช่อง "ส่งซ่อมที่" จากพิมพ์อิสระ เป็นเลือกจากรายการ
// (REPAIR_VENDORS ใน data.js — hard-code ไว้ก่อน ยังไม่มีหน้าจัดการ/CRUD รอบนี้) + ตัวเลือก "อื่น ๆ
// (ระบุชื่อ)" ไว้ไม่ให้บล็อกงานหน้างานถ้า vendor ที่ใช้จริงไม่อยู่ในรายการ
function openSendToRepairDrawer(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const vendorOptions = REPAIR_VENDORS.map((v) => `<option value="${v}">${v}</option>`).join('');
  const body = `
    <div class="kv"><div class="k">Asset Tag</div><div class="v"><b>${a.tag}</b></div></div>
    <div class="kv"><div class="k">ประเภท</div><div class="v">${a.type}</div></div>
    <div class="form-row" style="margin-top:14px;">
      <label>ส่งซ่อมที่ <span class="req">*</span></label>
      <select id="repairVendorSelect" onchange="document.getElementById('repairVendorOtherRow').style.display = this.value === '__OTHER__' ? 'block' : 'none';">
        <option value="">— เลือกผู้ให้บริการซ่อม —</option>
        ${vendorOptions}
        <option value="__OTHER__">${REPAIR_VENDOR_OTHER}</option>
      </select>
    </div>
    <div class="form-row" id="repairVendorOtherRow" style="display:none;">
      <label>ระบุชื่อผู้ให้บริการซ่อม <span class="req">*</span></label>
      <input type="text" id="repairVendorOther" placeholder="เช่น ช่างซ่อมเฉพาะกิจประจำไซต์" />
    </div>
    <div class="form-grid">
      <div class="form-row">
        <label>วันที่คาดว่าจะซ่อมเสร็จ</label>
        <input type="date" id="repairExpectedDate" />
      </div>
      <div class="form-row">
        <label>ค่าใช้จ่ายโดยประมาณ (บาท)</label>
        <input type="number" min="0" id="repairCostEstimate" placeholder="0" />
      </div>
    </div>
    <p style="color:#64748b;font-size:12.5px;">อุปกรณ์จะเปลี่ยนสถานะเป็น "กำลังซ่อม (ส่งออกแล้ว)" และย้ายไปแท็บ "กำลังซ่อม" — เมื่อได้เครื่องกลับมาจริง ให้มายืนยัน "ซ่อมเสร็จ" อีกครั้งที่แท็บนั้น ไม่กรอกวันที่คาดว่าจะเสร็จก็ได้ (ไม่บังคับ) — ถ้าไม่กรอก ระบบจะเตือน "เกินกำหนดซ่อม" โดยนับจากวันส่งซ่อมแทน</p>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="confirmSendToRepair('${tag.replace(/'/g, "\\'")}')">ยืนยันส่งซ่อม</button>
    </div>
  `;
  openActionDrawer('ส่งซ่อม — ' + a.tag, body);
}

function confirmSendToRepair(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const vendorSel = document.getElementById('repairVendorSelect').value;
  let vendor = '';
  let isOther = false;
  if (vendorSel === '__OTHER__') {
    vendor = document.getElementById('repairVendorOther').value.trim();
    isOther = true;
  } else {
    vendor = vendorSel;
  }
  if (!vendor) { toast('⚠️ กรุณาเลือกหรือระบุผู้ให้บริการซ่อม'); return; }
  const expectedDate = document.getElementById('repairExpectedDate').value || null;
  const costEstimate = document.getElementById('repairCostEstimate').value || null;

  a.status = 'OUT_FOR_REPAIR';
  a.repairVendor = vendor;
  a.repairVendorIsOther = isOther; // Round 10 ข้อ 2 — ใช้ขึ้นป้าย "พิมพ์เอง" ในตารางงานซ่อม
  a.repairSentAt = new Date().toISOString().slice(0, 10);
  a.repairExpectedDate = expectedDate;
  a.repairCostEstimate = costEstimate;
  a.actualLocation = `ส่งซ่อมที่ ${vendor}`;

  ASSET_HISTORY.unshift({
    tag, event: 'SENT_TO_REPAIR', project: '-', date: a.repairSentAt,
    note: `ส่งซ่อมที่ ${vendor}${isOther ? ' (พิมพ์เอง ไม่อยู่ในรายการมาตรฐาน)' : ''}${expectedDate ? ` · คาดว่าเสร็จ ${expectedDate}` : ''}${costEstimate ? ` · ประมาณการค่าซ่อม ${Number(costEstimate).toLocaleString()} บาท` : ''}`,
    by: DEMO_USERS[currentRole].name,
  });

  toast(`ส่งซ่อม ${tag} ไปที่ ${vendor} แล้ว — ติดตามได้ที่แท็บ "กำลังซ่อม"`);
  closeActionDrawer();
  renderRepairQueue();
  renderOutForRepairQueue();
  renderAssetTable();
  renderDashboard();
}

// เพิ่ม 2 ต.ค. 2569 (Round 10 ข้อ 3): คำนวณ "อยู่ระหว่างซ่อมกี่วัน" และว่าเกินกำหนดซ่อมหรือยัง — ถ้ามี
// วันที่คาดว่าจะเสร็จ (repairExpectedDate) ใช้วันนั้นเป็นเส้นตัดสิน ถ้าไม่มีใช้ค่าตั้งต้น
// REPAIR_OVERDUE_DEFAULT_DAYS วันนับจากวันส่งซ่อมแทน (ค่าตั้งต้น — รอ user confirm ดู README)
function repairDurationInfo(a) {
  if (!a.repairSentAt) return { daysInRepair: 0, overdue: false, overdueDays: 0 };
  const todayStr = new Date().toISOString().slice(0, 10);
  const daysInRepair = daysBetween(a.repairSentAt, todayStr);
  let overdue = false;
  let overdueDays = 0;
  if (a.repairExpectedDate) {
    const diff = daysBetween(a.repairExpectedDate, todayStr);
    if (diff > 0) { overdue = true; overdueDays = diff; }
  } else if (daysInRepair > REPAIR_OVERDUE_DEFAULT_DAYS) {
    overdue = true;
    overdueDays = daysInRepair - REPAIR_OVERDUE_DEFAULT_DAYS;
  }
  return { daysInRepair, overdue, overdueDays };
}

// รายการที่ส่งซ่อมไปแล้ว รอรับเครื่องกลับจริง
function renderOutForRepairQueue() {
  const tbody = document.getElementById('outForRepairBody');
  if (!tbody) return;
  const overdueOnlyEl = document.getElementById('outForRepairOverdueOnly');
  const overdueOnly = overdueOnlyEl ? overdueOnlyEl.checked : false;
  const allRows = ASSETS.filter((a) => a.status === 'OUT_FOR_REPAIR');
  let rows = allRows.map((a) => ({ a, info: repairDurationInfo(a) }));
  if (overdueOnly) rows = rows.filter((x) => x.info.overdue);
  tbody.innerHTML = rows
    .map(({ a, info }) => `<tr>
      <td><b>${a.tag}</b></td><td>${a.type}</td>
      <td>${a.repairVendor || '-'}${a.repairVendorIsOther ? ' <span class="tag tag-gray" style="font-size:10px;">พิมพ์เอง</span>' : ''}</td>
      <td>${a.repairExpectedDate || '-'}</td>
      <td>${a.repairCostEstimate ? Number(a.repairCostEstimate).toLocaleString() + ' บาท' : '-'}</td>
      <td>
        <div>อยู่ระหว่างซ่อม ${info.daysInRepair} วัน</div>
        ${info.overdue ? `<span class="tag tag-red" style="white-space:nowrap;">⏰ เกินกำหนดซ่อม (เกิน ${info.overdueDays} วัน)</span>` : ''}
      </td>
      <td style="display:flex;gap:6px;">
        <button class="btn btn-sm" style="border-color:#16a34a;color:#16a34a;" onclick="openRepairCompleteDrawer('${a.tag.replace(/'/g, "\\'")}')">ยืนยันซ่อมเสร็จ</button>
        <button class="btn btn-sm btn-danger" onclick="openRepairRejectDrawer('${a.tag.replace(/'/g, "\\'")}')">ซ่อมไม่ได้</button>
      </td>
    </tr>`)
    .join('') || `<tr><td colspan="7" class="empty-hint">${overdueOnly ? 'ไม่มีรายการที่เกินกำหนด' : 'ไม่มีรายการที่กำลังซ่อมอยู่ตอนนี้'}</td></tr>`;
  const tab = document.getElementById('outForRepairCount');
  if (tab) tab.textContent = `(${allRows.length})`;
}

function openRepairCompleteDrawer(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const body = `
    <div class="kv"><div class="k">Asset Tag</div><div class="v"><b>${a.tag}</b></div></div>
    <div class="kv"><div class="k">ส่งซ่อมที่</div><div class="v">${a.repairVendor || '-'}</div></div>
    <div class="form-row" style="margin-top:14px;">
      <label>ค่าใช้จ่ายจริง (บาท)</label>
      <input type="number" min="0" id="repairCostActual" value="${a.repairCostEstimate || ''}" />
    </div>
    <div class="form-row">
      <label>หมายเหตุ</label>
      <textarea id="repairCompleteNote" placeholder="เช่น เปลี่ยนจอใหม่ / เปลี่ยนแบตเตอรี่"></textarea>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="confirmRepairComplete('${tag.replace(/'/g, "\\'")}')">ยืนยันซ่อมเสร็จ — กลับเข้าสต๊อก</button>
    </div>
  `;
  openActionDrawer('ยืนยันซ่อมเสร็จ — ' + a.tag, body);
}

function confirmRepairComplete(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const costActual = document.getElementById('repairCostActual').value || null;
  const note = document.getElementById('repairCompleteNote').value.trim();
  const vendor = a.repairVendor;

  a.status = 'IN_STOCK';
  a.actualLocation = baseLocationFor(a.classification);
  a.location = baseLocationFor(a.classification);
  a.repairVendor = null;
  a.repairVendorIsOther = false;
  a.repairSentAt = null;
  a.repairExpectedDate = null;
  a.repairCostEstimate = null;

  ASSET_HISTORY.unshift({
    tag, event: 'REPAIR_FIXED', project: '-', date: new Date().toISOString().slice(0, 10),
    note: `ซ่อมเสร็จจาก ${vendor || '-'}${costActual ? ` · ค่าซ่อมจริง ${Number(costActual).toLocaleString()} บาท` : ''}${note ? ' · ' + note : ''} — กลับเข้าสต๊อกพร้อมใช้งาน`,
    by: DEMO_USERS[currentRole].name,
  });

  toast(`${tag} ซ่อมเสร็จแล้ว — กลับเข้าสต๊อกพร้อมใช้งาน`);
  closeActionDrawer();
  renderOutForRepairQueue();
  renderRepairQueue();
  renderAssetTable();
  renderDashboard();
}

function openRepairRejectDrawer(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const body = `
    <div class="kv"><div class="k">Asset Tag</div><div class="v"><b>${a.tag}</b></div></div>
    <div class="kv"><div class="k">ประเภท</div><div class="v">${a.type}</div></div>
    <div class="form-row" style="margin-top:14px;">
      <label>เหตุผลที่ซ่อมไม่ได้ <span class="req">*</span></label>
      <textarea id="repairRejectNote" placeholder="เช่น อะไหล่เลิกผลิต / เสียหายทั้งตัว"></textarea>
    </div>
    <p style="color:#64748b;font-size:12.5px;">ระบบจะสร้างคำขอ Write-off ให้อัตโนมัติ รอผู้มีสิทธิ์อนุมัติต่อไป</p>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-danger" onclick="confirmRepairReject('${tag.replace(/'/g, "\\'")}')">ยืนยันซ่อมไม่ได้ &amp; ส่ง Write-off</button>
    </div>
  `;
  openActionDrawer('ซ่อมไม่ได้ — ' + a.tag, body);
}

function confirmRepairReject(tag) {
  const a = ASSETS.find((x) => x.tag === tag);
  if (!a) return;
  const note = document.getElementById('repairRejectNote').value.trim();
  a.status = 'PENDING_WRITEOFF';
  WRITEOFF_REQUESTS.unshift({
    id: nextSeqId('WO-2026', WRITEOFF_REQUESTS, 4), assetTag: tag, type: a.type,
    reason: 'ซ่อมไม่ได้ (IT Support พิจารณา)', note: note || '-',
    requestedBy: DEMO_USERS[currentRole].name, requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: 'รออนุมัติ', approvedBy: null, approvedAt: null,
    // source/previousStatus เพิ่ม 2 ต.ค. 2569 (Round 9 gap D) — ไม่ว่าจะกดจากแท็บ "รอพิจารณา" (REPAIR)
    // หรือแท็บ "กำลังซ่อม" (OUT_FOR_REPAIR) ก็ตาม ถ้าถูก "ไม่อนุมัติ" ให้ย้อนกลับเข้าคิวพิจารณาซ่อม
    // (REPAIR) เสมอ เพราะที่มาเดียวกันคือ "มีคนบอกว่าซ่อมไม่ได้" ต้องพิจารณาใหม่
    source: 'REPAIR_REJECTED', previousStatus: 'REPAIR',
  });
  ASSET_HISTORY.unshift({
    tag, event: 'REPAIR_REJECTED', project: '-', date: new Date().toISOString().slice(0, 10),
    note: `ซ่อมไม่ได้ · ${note || '-'} · สร้างคำขอ Write-off ${WRITEOFF_REQUESTS[0].id}`, by: DEMO_USERS[currentRole].name,
  });
  toast(`${tag} ซ่อมไม่ได้ — สร้างคำขอ Write-off ${WRITEOFF_REQUESTS[0].id} แล้ว`);
  closeActionDrawer();
  renderRepairQueue();
  renderOutForRepairQueue();
  renderAssetTable();
  renderDashboard();
}

// ================================================================
// WRITE-OFF (คำขอ/อนุมัติ)
// ================================================================
const WRITEOFF_STATUS_CLASS = { 'รออนุมัติ': 'tag-amber', 'อนุมัติแล้ว': 'tag-red', 'ไม่อนุมัติ': 'tag-gray' };

function renderWriteoffList() {
  document.getElementById('writeoffBody').innerHTML = WRITEOFF_REQUESTS
    .map((w) => {
      const canAct = w.status === 'รออนุมัติ';
      const isApprover = currentRole === 'APPROVER';
      const actionsHtml = !canAct ? '-' : isApprover
        ? `<div style="display:flex;gap:6px;">
             <button class="btn btn-sm" style="border-color:#16a34a;color:#16a34a;" onclick="approveWriteoff('${w.id}')">อนุมัติ</button>
             <button class="btn btn-sm btn-danger" onclick="rejectWriteoff('${w.id}')">ไม่อนุมัติ</button>
           </div>`
        : `<span style="color:#94a3b8;font-size:12px;">เฉพาะผู้อนุมัติ</span>`;
      return `<tr>
        <td><b>${w.id}</b></td><td>${w.assetTag}</td><td>${w.type}</td><td>${w.reason}</td>
        <td>${w.requestedBy}</td><td>${w.requestedAt}</td>
        <td><span class="tag ${WRITEOFF_STATUS_CLASS[w.status] || 'tag-gray'}">${w.status}</span></td>
        <td>${actionsHtml}</td>
      </tr>`;
    })
    .join('') || `<tr><td colspan="8" class="empty-hint">ยังไม่มีคำขอ Write-off</td></tr>`;
}

function approveWriteoff(id) {
  const w = WRITEOFF_REQUESTS.find((x) => x.id === id);
  if (!w) return;
  w.status = 'อนุมัติแล้ว';
  w.approvedBy = DEMO_USERS[currentRole].name;
  w.approvedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const a = ASSETS.find((x) => x.tag === w.assetTag);
  if (a) { a.status = 'WRITTEN_OFF'; a.actualLocation = 'ตัดจำหน่ายแล้ว'; a.location = '-'; }
  ASSET_HISTORY.unshift({
    tag: w.assetTag, event: 'WRITTEN_OFF', project: '-', date: new Date().toISOString().slice(0, 10),
    note: `เหตุผล: ${w.reason} · อนุมัติโดย ${w.approvedBy}`, by: w.approvedBy,
  });
  toast(`อนุมัติ Write-off ${id} แล้ว — ${w.assetTag} ถูกตัดออกจากทะเบียนถาวร`);
  renderWriteoffList();
  renderAssetTable();
  renderRepairQueue();
  renderDashboard();
}

function rejectWriteoff(id) {
  const w = WRITEOFF_REQUESTS.find((x) => x.id === id);
  if (!w) return;
  w.status = 'ไม่อนุมัติ';
  const a = ASSETS.find((x) => x.tag === w.assetTag);
  // เพิ่ม 2 ต.ค. 2569 (Round 9 gap D) — แยกตามที่มาของคำขอแทนที่จะย้อนกลับเข้าคิวพิจารณาซ่อมเสมอทุก
  // กรณี: มาจากซ่อมไม่ได้ (REPAIR_REJECTED) → กลับเข้าคิวซ่อมจริง เพราะยังต้องพิจารณาใหม่ ส่วนมาจาก
  // ตรวจนับ/แจ้งสูญหาย/สร้างเอง (ANNUAL_MISSING / MANUAL) → ย้อนกลับไปสถานะก่อนถูกตั้งเป็นรอ write-off
  // (เก็บไว้ใน previousStatus ตอนสร้างคำขอ) เพราะสถานะเหล่านั้นไม่เกี่ยวกับการซ่อมเลย
  let backTo = null;
  if (a && a.status === 'PENDING_WRITEOFF') {
    backTo = w.source === 'REPAIR_REJECTED' ? 'REPAIR' : (w.previousStatus || 'IN_STOCK');
    a.status = backTo;
    if (backTo === 'IN_STOCK') {
      a.actualLocation = baseLocationFor(a.classification);
      a.location = baseLocationFor(a.classification);
    }
  }
  const backToLabel = backTo && STATUS_LABEL[backTo] ? STATUS_LABEL[backTo].text : 'สถานะเดิม';
  toast(`ไม่อนุมัติ Write-off ${id} — ${w.assetTag} ย้อนกลับเป็นสถานะ "${backToLabel}"`);
  renderWriteoffList();
  renderAssetTable();
  renderRepairQueue();
  renderOutForRepairQueue();
  renderDashboard();
}

// ตารางเลือกทรัพย์สินสำหรับสร้างคำขอ Write-off เอง — ใช้ UX แนวทางเดียวกับตารางเลือก Serial Number
// ตอนจ่ายอุปกรณ์ (9.5): ตาราง radio เรียงลำดับแนะนำขึ้นบนสุด + ค้นหาได้ (ใช้ filterPickerRows ร่วมกัน)
// — เงื่อนไขแนะนำคนละแบบตามบริบทของหน้าจอนี้ (ของจ่ายอุปกรณ์แนะนำจากประวัติ/ที่ตั้ง ส่วนอันนี้แนะนำจาก
// สถานะปัจจุบันที่เป็นข้อบ่งชี้ว่าอาจต้องพิจารณาตัดจำหน่าย เช่น อยู่ระหว่างรอซ่อม หรือเบิกไปแล้วเลย
// กำหนดคืนมานาน — แต่หน้าตา/การโต้ตอบเป็นแนวทางเดียวกันทั้งคู่)
function buildWriteoffPickerHtml() {
  const today = new Date();
  const eligible = ASSETS.filter((a) => a.status !== 'WRITTEN_OFF' && a.status !== 'PENDING_WRITEOFF');

  const candidates = eligible
    .map((a) => {
      const overdue = a.status === 'BORROWED' && !!a.dueDate && new Date(a.dueDate) < today;
      const inRepair = a.status === 'REPAIR' || a.status === 'OUT_FOR_REPAIR';
      const warrantyExpired = !!a.warrantyEnd && new Date(a.warrantyEnd) < today;
      return { a, overdue, inRepair, warrantyExpired, score: (inRepair ? 2 : 0) + (overdue ? 2 : 0) + (warrantyExpired ? 1 : 0) };
    })
    .sort((x, y) => y.score - x.score || x.a.tag.localeCompare(y.a.tag));

  const searchId = 'woPickerSearch';
  const tbodyId = 'woPickerBody';

  const rowsHtml = candidates.length
    ? candidates
        .map(({ a, overdue, inRepair, warrantyExpired }, i) => {
          const pf = [a.tag, a.serial, a.type, a.project, a.location, a.actualLocation].join(' ').toLowerCase();
          const holder = a.status === 'BORROWED' || a.status === 'SOLD' ? a.project : a.actualLocation;
          return `
          <tr data-pf="${pf}">
            <td style="width:26px;text-align:center;"><input type="radio" name="woAsset" value="${a.tag}" ${i === 0 ? 'checked' : ''} /></td>
            <td><b>${a.tag}</b><br/><span style="color:#94a3b8;font-size:11.5px;">${a.type} · S/N: ${a.serial}</span></td>
            <td><span class="tag ${STATUS_LABEL[a.status].cls}">${STATUS_LABEL[a.status].text}</span></td>
            <td>${holder || '-'}</td>
            <td>
              ${inRepair ? '<span class="tag tag-amber" style="margin-right:4px;white-space:nowrap;">🔧 อยู่ระหว่างรอซ่อม</span>' : ''}
              ${overdue ? '<span class="tag tag-red" style="margin-right:4px;white-space:nowrap;">⏰ เลยกำหนดคืนแล้ว</span>' : ''}
              ${warrantyExpired ? '<span class="tag tag-gray" style="white-space:nowrap;">หมดประกันแล้ว</span>' : ''}
              ${!inRepair && !overdue && !warrantyExpired ? '<span style="color:#cbd5e1;">—</span>' : ''}
            </td>
          </tr>`;
        })
        .join('')
    : `<tr><td colspan="5" class="empty-hint">— ไม่มีทรัพย์สินให้เลือก —</td></tr>`;

  const searchHtml = candidates.length > 4
    ? `<input type="text" id="${searchId}" placeholder="ค้นหา Asset Tag / Serial / ประเภท / โครงการ..." style="margin-bottom:6px;" oninput="filterPickerRows('${searchId}', '${tbodyId}')" />`
    : '';

  return `
    <div class="form-row">
      <label>เลือกทรัพย์สิน <span class="req">*</span></label>
      ${searchHtml}
      <table class="dt" style="margin-top:6px;">
        <thead><tr><th></th><th>Asset Tag</th><th>สถานะปัจจุบัน</th><th>ที่ตั้ง/ผู้ถือครอง</th><th>คำแนะนำ</th></tr></thead>
        <tbody id="${tbodyId}">${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function openNewWriteoffForm() {
  const body = `
    ${buildWriteoffPickerHtml()}
    <div class="form-row">
      <label>เหตุผล <span class="req">*</span></label>
      <select id="woReason">
        <option value="ผลตรวจนับประจำปี - ไม่พบ">ผลตรวจนับประจำปี - ไม่พบ</option>
        <option value="แจ้งสูญหาย">แจ้งสูญหาย</option>
        <option value="อื่นๆ">อื่นๆ</option>
      </select>
    </div>
    <div class="form-row">
      <label>หมายเหตุ</label>
      <textarea id="woNote" placeholder="รายละเอียดเพิ่มเติม"></textarea>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="submitNewWriteoff()">ส่งคำขอ</button>
    </div>
  `;
  openActionDrawer('สร้างคำขอ Write-off ใหม่', body, { wide: true });
}

function submitNewWriteoff() {
  const picked = document.querySelector('input[name="woAsset"]:checked');
  const tag = picked ? picked.value : null;
  const reason = document.getElementById('woReason').value;
  const note = document.getElementById('woNote').value.trim();
  const a = tag ? ASSETS.find((x) => x.tag === tag) : null;
  if (!a) { toast('⚠️ กรุณาเลือกทรัพย์สิน'); return; }

  const previousStatus = a.status; // เก็บไว้ใช้ตอน "ไม่อนุมัติ" ย้อนกลับสถานะที่ถูกต้อง (Round 9 gap D)
  WRITEOFF_REQUESTS.unshift({
    id: nextSeqId('WO-2026', WRITEOFF_REQUESTS, 4), assetTag: tag, type: a.type, reason, note: note || '-',
    requestedBy: DEMO_USERS[currentRole].name, requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: 'รออนุมัติ', approvedBy: null, approvedAt: null,
    source: 'MANUAL', previousStatus,
  });
  a.status = 'PENDING_WRITEOFF';
  toast(`สร้างคำขอ Write-off ${WRITEOFF_REQUESTS[0].id} เรียบร้อย — รอผู้มีสิทธิ์อนุมัติ`);
  closeActionDrawer();
  renderWriteoffList();
  renderAssetTable();
  renderDashboard();
}

// ================================================================
// ANNUAL CHECK (ตรวจนับประจำปี)
// ================================================================
function annualCheckEligibleAssets() {
  // SOLD = ขายขาดออกจากคลังถาวรแล้ว ไม่ต้องตรวจนับซ้ำ เช่นเดียวกับที่ตัดจำหน่ายแล้ว/รอตัดจำหน่าย
  return ASSETS.filter((a) => a.status !== 'WRITTEN_OFF' && a.status !== 'PENDING_WRITEOFF' && a.status !== 'SOLD');
}

function renderAnnualCheck() {
  const rows = annualCheckEligibleAssets();
  document.getElementById('annualCheckBody').innerHTML = rows
    .map((a) => {
      const r = annualCheckResults[a.tag] || {};
      return `<tr>
        <td><b>${a.tag}</b></td><td>${a.type}</td><td>${a.location}</td><td>${a.actualLocation}</td>
        <td><span class="tag ${STATUS_LABEL[a.status].cls}">${STATUS_LABEL[a.status].text}</span></td>
        <td>
          <select onchange="setAnnualResult('${a.tag.replace(/'/g, "\\'")}', this.value)">
            <option value="" ${!r.result ? 'selected' : ''}>ยังไม่ตรวจ</option>
            <option value="FOUND" ${r.result === 'FOUND' ? 'selected' : ''}>พบปกติ</option>
            <option value="MISSING" ${r.result === 'MISSING' ? 'selected' : ''}>ไม่พบ</option>
            <option value="DAMAGED" ${r.result === 'DAMAGED' ? 'selected' : ''}>ชำรุด</option>
          </select>
        </td>
        <td><input type="text" value="${r.note || ''}" placeholder="หมายเหตุ" oninput="setAnnualNote('${a.tag.replace(/'/g, "\\'")}', this.value)" /></td>
      </tr>`;
    })
    .join('') || `<tr><td colspan="7" class="empty-hint">ไม่มีรายการต้องตรวจนับ</td></tr>`;
  renderAnnualStats();
}

function setAnnualResult(tag, value) {
  if (!annualCheckResults[tag]) annualCheckResults[tag] = {};
  if (value) annualCheckResults[tag].result = value; else delete annualCheckResults[tag].result;
  renderAnnualStats();
}
function setAnnualNote(tag, value) {
  if (!annualCheckResults[tag]) annualCheckResults[tag] = {};
  annualCheckResults[tag].note = value;
}

function renderAnnualStats() {
  const rows = annualCheckEligibleAssets();
  const total = rows.length;
  let found = 0, missing = 0, damaged = 0, unchecked = 0;
  rows.forEach((a) => {
    const r = annualCheckResults[a.tag];
    if (!r || !r.result) unchecked++;
    else if (r.result === 'FOUND') found++;
    else if (r.result === 'MISSING') missing++;
    else if (r.result === 'DAMAGED') damaged++;
  });
  const cards = [
    { lbl: 'ทั้งหมดที่ต้องตรวจ', val: total, sub: 'ไม่รวมที่ตัดจำหน่ายแล้ว', cls: '' },
    { lbl: 'พบปกติ', val: found, sub: '-', cls: 'ok' },
    { lbl: 'ไม่พบ', val: missing, sub: 'จะสร้างคำขอ Write-off', cls: 'danger' },
    { lbl: 'ชำรุด', val: damaged, sub: 'จะส่งเข้าคิวพิจารณาซ่อม', cls: 'warn' },
    { lbl: 'ยังไม่ตรวจ', val: unchecked, sub: '-', cls: '' },
  ];
  document.getElementById('annualStatGrid').innerHTML = cards
    .map((c) => `<div class="stat-card ${c.cls}"><div class="lbl">${c.lbl}</div><div class="val">${c.val}</div><div class="sub">${c.sub}</div></div>`)
    .join('');
}

function exportAnnualCheckCsv() {
  const rows = annualCheckEligibleAssets();
  const header = ['Asset Tag', 'ประเภท', 'Serial', 'Location', 'Actual Location', 'สถานะในระบบ'];
  const lines = [header.join(',')].concat(
    rows.map((a) => [a.tag, a.type, a.serial, a.location, a.actualLocation, STATUS_LABEL[a.status].text]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')),
  );
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `annual-check-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast(`Export รายการตรวจนับ ${rows.length} รายการเรียบร้อย`);
}

function saveAnnualCheck() {
  const rows = annualCheckEligibleAssets();
  let missingCount = 0, damagedCount = 0;
  rows.forEach((a) => {
    const r = annualCheckResults[a.tag];
    if (!r || !r.result) return;
    if (r.result === 'MISSING') {
      missingCount++;
      const previousStatus = a.status; // Round 9 gap D — ย้อนกลับถูกสถานะถ้า write-off นี้ถูกไม่อนุมัติ
      WRITEOFF_REQUESTS.unshift({
        id: nextSeqId('WO-2026', WRITEOFF_REQUESTS, 4), assetTag: a.tag, type: a.type,
        reason: 'ผลตรวจนับประจำปี - ไม่พบ', note: r.note || '-',
        requestedBy: DEMO_USERS[currentRole].name, requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'รออนุมัติ', approvedBy: null, approvedAt: null,
        source: 'ANNUAL_MISSING', previousStatus,
      });
      a.status = 'PENDING_WRITEOFF';
    } else if (r.result === 'DAMAGED') {
      damagedCount++;
      a.status = 'REPAIR';
      a.actualLocation = 'ศูนย์ซ่อม (รอ IT Support ตรวจ)';
    }
  });
  annualCheckSavedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  toast(`บันทึกผลตรวจนับเรียบร้อย — พบต่าง ${missingCount} รายการ (สร้างคำขอ Write-off แล้ว), ชำรุด ${damagedCount} รายการ (ส่งเข้าคิวซ่อมแล้ว)`);
  renderAnnualCheck();
  renderAssetTable();
  renderRepairQueue();
  renderWriteoffList();
  renderDashboard();
}

// ================================================================
// ITEM MASTER SETTINGS
// ================================================================
const SCOPE_LABEL = { LOANABLE: 'ให้ยืมได้', SELLABLE: 'ให้ขายได้', INTERNAL: 'ใช้งานภายใน' };

function renderItemMaster() {
  document.getElementById('itemMasterBody').innerHTML = ITEM_MASTER
    .map((it) => `<tr>
      <td><code>${it.id}</code></td>
      <td><b>${it.name}</b>${it.kit && it.subItems ? `<br/><span style="color:#94a3b8;font-size:11.5px;">Checklist: ${it.subItems.join(', ')}</span>` : ''}</td>
      <td><span class="tag tag-gray">${categoryNameById(it.categoryId)}</span></td>
      <td><span class="tag ${it.trackSerial ? 'tag-blue' : 'tag-gray'}">${it.trackSerial ? 'Track S/N' : 'นับจำนวน'}</span></td>
      <td><span class="tag ${it.kit ? 'tag-purple' : 'tag-gray'}">${it.kit ? 'ใช่' : 'ไม่ใช่'}</span></td>
      <td>${it.scope.map((s) => `<span class="tag tag-gray" style="margin-right:4px;">${SCOPE_LABEL[s]}</span>`).join('')}</td>
      <td style="display:flex;gap:6px;">
        <button class="btn btn-sm" onclick="openItemMasterForm('${it.id}')">แก้ไข</button>
        <button class="btn btn-sm btn-danger" onclick="confirmDeleteItemMaster('${it.id}')">ลบ</button>
      </td>
    </tr>`)
    .join('') || `<tr><td colspan="7" class="empty-hint">ยังไม่มีประเภทอุปกรณ์</td></tr>`;
}

// ---------------- Category (หมวดหมู่) CRUD ----------------
function renderCategoryList() {
  const body = document.getElementById('categoryBody');
  if (!body) return;
  body.innerHTML = CATEGORIES
    .map((c) => {
      const count = ITEM_MASTER.filter((it) => it.categoryId === c.id).length;
      return `<tr>
        <td><code>${c.id}</code></td>
        <td><b>${c.name}</b></td>
        <td>${count} ประเภท</td>
        <td style="display:flex;gap:6px;">
          <button class="btn btn-sm" onclick="openCategoryForm('${c.id}')">แก้ไข</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDeleteCategory('${c.id}')">ลบ</button>
        </td>
      </tr>`;
    })
    .join('') || `<tr><td colspan="4" class="empty-hint">ยังไม่มีหมวดหมู่</td></tr>`;
}

function openCategoryForm(categoryId) {
  const c = categoryId ? CATEGORIES.find((x) => x.id === categoryId) : null;
  const body = `
    <div class="form-row">
      <label>ชื่อหมวดหมู่ <span class="req">*</span></label>
      <input type="text" id="catName" value="${c ? c.name : ''}" placeholder="เช่น อุปกรณ์ IoT ภาคสนาม" />
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="submitCategory(${c ? `'${c.id}'` : 'null'})">บันทึก</button>
    </div>
  `;
  openActionDrawer(c ? 'แก้ไขหมวดหมู่ — ' + c.name : 'เพิ่มหมวดหมู่ใหม่', body);
}

function submitCategory(categoryId) {
  const name = document.getElementById('catName').value.trim();
  if (!name) { toast('⚠️ กรุณาระบุชื่อหมวดหมู่'); return; }

  if (categoryId) {
    const c = CATEGORIES.find((x) => x.id === categoryId);
    c.name = name;
    toast(`แก้ไขหมวดหมู่ "${name}" เรียบร้อย`);
  } else {
    const newId = 'CAT-' + name.toUpperCase().replace(/[^A-Z0-9ก-๙]+/gi, '').slice(0, 12) + '-' + (CATEGORIES.length + 1);
    CATEGORIES.push({ id: newId, name });
    toast(`เพิ่มหมวดหมู่ "${name}" เรียบร้อย`);
  }
  closeActionDrawer();
  renderCategoryList();
  renderItemMaster();
  populateAssetFilters();
  populateReceiveSelects();
}

function confirmDeleteCategory(categoryId) {
  const c = CATEGORIES.find((x) => x.id === categoryId);
  if (!c) return;
  const usedCount = ITEM_MASTER.filter((it) => it.categoryId === categoryId).length;
  if (usedCount > 0) {
    const body = `
      <p>ไม่สามารถลบหมวดหมู่ <b>${c.name}</b> ได้</p>
      <p style="color:#dc2626;font-size:12.5px;">ยังมีประเภทอุปกรณ์ ${usedCount} รายการผูกอยู่กับหมวดหมู่นี้ — กรุณาย้ายไปหมวดหมู่อื่นก่อน (แก้ไขที่ตาราง Item Master ด้านล่าง)</p>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px;">
        <button class="btn btn-primary" onclick="closeActionDrawer()">รับทราบ</button>
      </div>
    `;
    openActionDrawer('ลบหมวดหมู่ไม่ได้', body);
    return;
  }
  const body = `
    <p>ยืนยันลบหมวดหมู่ <b>${c.name}</b>?</p>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-danger" onclick="deleteCategory('${categoryId}')">ยืนยันลบ</button>
    </div>
  `;
  openActionDrawer('ลบหมวดหมู่', body);
}

function deleteCategory(categoryId) {
  const idx = CATEGORIES.findIndex((x) => x.id === categoryId);
  if (idx === -1) return;
  const [removed] = CATEGORIES.splice(idx, 1);
  toast(`ลบหมวดหมู่ "${removed.name}" เรียบร้อย`);
  closeActionDrawer();
  renderCategoryList();
  renderItemMaster();
  populateAssetFilters();
  populateReceiveSelects();
}

function openItemMasterForm(itemId) {
  const it = itemId ? ITEM_MASTER.find((x) => x.id === itemId) : null;
  const body = `
    <div class="form-row">
      <label>ชื่อประเภทอุปกรณ์ <span class="req">*</span></label>
      <input type="text" id="imName" value="${it ? it.name : ''}" placeholder="เช่น เครื่องพิมพ์ป้าย" />
    </div>
    <div class="form-row">
      <label>หมวดหมู่ (Category) <span class="req">*</span></label>
      <select id="imCategory">
        ${CATEGORIES.map((c) => `<option value="${c.id}" ${it && it.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <label><input type="checkbox" id="imTrackSerial" ${!it || it.trackSerial ? 'checked' : ''} style="width:auto;margin-right:6px;" /> ต้อง track Serial Number รายชิ้น</label>
    </div>
    <div class="form-row">
      <label><input type="checkbox" id="imKit" onchange="document.getElementById('imSubItemsRow').style.display=this.checked?'block':'none'" ${it && it.kit ? 'checked' : ''} style="width:auto;margin-right:6px;" /> เป็นอุปกรณ์แบบชุด (Kit / มี checklist อุปกรณ์ย่อย)</label>
    </div>
    <div class="form-row" id="imSubItemsRow" style="display:${it && it.kit ? 'block' : 'none'};">
      <label>รายการอุปกรณ์ย่อย (คั่นด้วยจุลภาค ,)</label>
      <textarea id="imSubItems" placeholder="เช่น เครื่องวัดความดัน, Tablet">${it && it.subItems ? it.subItems.join(', ') : ''}</textarea>
    </div>
    <div class="form-row">
      <label>Scope การใช้งาน <span class="req">*</span></label>
      <label style="display:block;font-weight:400;font-size:13px;margin-bottom:4px;"><input type="checkbox" class="imScope" value="LOANABLE" ${!it || it.scope.includes('LOANABLE') ? 'checked' : ''} style="width:auto;margin-right:6px;" /> ให้ยืมได้</label>
      <label style="display:block;font-weight:400;font-size:13px;margin-bottom:4px;"><input type="checkbox" class="imScope" value="SELLABLE" ${it && it.scope.includes('SELLABLE') ? 'checked' : ''} style="width:auto;margin-right:6px;" /> ให้ขายได้</label>
      <label style="display:block;font-weight:400;font-size:13px;"><input type="checkbox" class="imScope" value="INTERNAL" ${it && it.scope.includes('INTERNAL') ? 'checked' : ''} style="width:auto;margin-right:6px;" /> ใช้งานภายใน</label>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-primary" onclick="submitItemMaster(${it ? `'${it.id}'` : 'null'})">บันทึก</button>
    </div>
  `;
  openActionDrawer(it ? 'แก้ไขประเภทอุปกรณ์ — ' + it.name : 'เพิ่มประเภทอุปกรณ์ใหม่', body);
}

function submitItemMaster(itemId) {
  const name = document.getElementById('imName').value.trim();
  const categoryId = document.getElementById('imCategory').value;
  const trackSerial = document.getElementById('imTrackSerial').checked;
  const kit = document.getElementById('imKit').checked;
  const subItems = kit ? document.getElementById('imSubItems').value.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
  const scope = [...document.querySelectorAll('.imScope:checked')].map((c) => c.value);

  if (!name) { toast('⚠️ กรุณาระบุชื่อประเภทอุปกรณ์'); return; }
  if (!categoryId) { toast('⚠️ กรุณาเลือกหมวดหมู่'); return; }
  if (scope.length === 0) { toast('⚠️ กรุณาเลือก Scope การใช้งานอย่างน้อย 1 ข้อ'); return; }

  if (itemId) {
    const it = ITEM_MASTER.find((x) => x.id === itemId);
    Object.assign(it, { name, categoryId, trackSerial, kit, scope });
    if (kit) it.subItems = subItems; else delete it.subItems;
    toast(`แก้ไขประเภทอุปกรณ์ "${name}" เรียบร้อย`);
  } else {
    const newId = 'IT-' + name.toUpperCase().replace(/[^A-Z0-9ก-๙]+/gi, '').slice(0, 12) + '-' + (ITEM_MASTER.length + 1);
    const newItem = { id: newId, name, categoryId, trackSerial, kit, scope };
    if (kit) newItem.subItems = subItems;
    ITEM_MASTER.push(newItem);
    toast(`เพิ่มประเภทอุปกรณ์ "${name}" เรียบร้อย`);
  }
  closeActionDrawer();
  renderCategoryList();
  renderItemMaster();
  populateReceiveSelects();
}

function confirmDeleteItemMaster(itemId) {
  const it = ITEM_MASTER.find((x) => x.id === itemId);
  if (!it) return;
  const body = `
    <p>ยืนยันลบประเภทอุปกรณ์ <b>${it.name}</b> ออกจาก Item Master?</p>
    <p style="color:#dc2626;font-size:12.5px;">การลบจะไม่กระทบทรัพย์สินที่รับเข้าคลังไปแล้ว (mockup)</p>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px;">
      <button class="btn" onclick="closeActionDrawer()">ยกเลิก</button>
      <button class="btn btn-danger" onclick="deleteItemMaster('${itemId}')">ยืนยันลบ</button>
    </div>
  `;
  openActionDrawer('ลบประเภทอุปกรณ์', body);
}

function deleteItemMaster(itemId) {
  const idx = ITEM_MASTER.findIndex((x) => x.id === itemId);
  if (idx === -1) return;
  const [removed] = ITEM_MASTER.splice(idx, 1);
  toast(`ลบประเภทอุปกรณ์ "${removed.name}" เรียบร้อย`);
  closeActionDrawer();
  renderCategoryList();
  renderItemMaster();
  populateReceiveSelects();
}

// ================================================================
// INIT
// ================================================================
populateAssetFilters();
renderAssetTable();
populateReceiveSelects();
onPurposeChange(); // ตั้งค่าเริ่มต้น + สร้างแถวรายการอุปกรณ์แถวแรกให้ตรง scope ของวัตถุประสงค์เริ่มต้น
renderPendingRequests();
renderDashboard();
