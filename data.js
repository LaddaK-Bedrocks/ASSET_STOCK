/* ============================================================
   Stock Module Mockup — data.js
   ข้อมูลตัวอย่างสมมติทั้งหมด (ไม่เชื่อม DB จริง) — เก็บใน memory
   รีเฟรชหน้าแล้วรีเซ็ตกลับค่าตั้งต้นเสมอ
   ============================================================ */

// ---------- Category (หมวดหมู่ใหญ่ — คั่นกลางเหนือ Item Type) ----------
// เพิ่ม/ลดได้จากหน้า "ตั้งค่า Item Master" — ช่วยกรอง/รายงานแยกกลุ่มใหญ่ได้ (เช่น มูลค่ารวมครุภัณฑ์สำนักงาน)
const CATEGORIES = [
  { id: 'CAT-FIELD', name: 'อุปกรณ์ IoT ภาคสนาม' },
  { id: 'CAT-OFFICE', name: 'ครุภัณฑ์สำนักงาน' },
  { id: 'CAT-OTHER', name: 'อื่นๆ' },
];

function categoryNameById(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c.name : '-';
}

// ---------- Item Master (ประเภทอุปกรณ์) ----------
// categoryId           -> อ้างอิง CATEGORIES (หมวดหมู่ใหญ่)
// trackSerial = true  -> ต้องเลือก/บันทึก Serial Number รายชิ้น
// trackSerial = false -> นับจำนวนอย่างเดียว (เช่น SIM Card)
// kit = true           -> อุปกรณ์แบบชุด มี subItems เป็น checklist
// scope                -> ใช้กรองรายการที่เลือกได้ตอน "ขอเบิก" ตามวัตถุประสงค์:
//                         'LOANABLE' = เบิกแบบยืม, 'SELLABLE' = เบิกแบบขายขาด, 'INTERNAL' = เบิกใช้งานภายใน
const ITEM_MASTER = [
  { id: 'IT-ANYWHERE01', name: 'Anywhere 01 (อุปกรณ์ห้อยคอ)', categoryId: 'CAT-FIELD', trackSerial: true, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-ANYWHERE02', name: 'Anywhere 02 (Smart Watch)', categoryId: 'CAT-FIELD', trackSerial: true, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-CAREKIT', name: 'CareKit', categoryId: 'CAT-FIELD', trackSerial: true, kit: true, scope: ['LOANABLE', 'SELLABLE'],
    subItems: ['เครื่องวัดความดัน', 'เครื่องวัดอุณหภูมิ', 'Tablet', 'เครื่องวัดน้ำตาล', 'เครื่องวัดออกซิเจน'] },
  { id: 'IT-CCTV', name: 'CCTV', categoryId: 'CAT-FIELD', trackSerial: true, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-GOPRO', name: 'Go Pro', categoryId: 'CAT-FIELD', trackSerial: true, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-HANDHELD', name: 'Handheld', categoryId: 'CAT-FIELD', trackSerial: true, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-HANDHELDBAG', name: 'Handheld Bag', categoryId: 'CAT-FIELD', trackSerial: false, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-PRINTER', name: 'Printer', categoryId: 'CAT-FIELD', trackSerial: true, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-PRINTERBAG', name: 'Printer Bag', categoryId: 'CAT-FIELD', trackSerial: false, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-SIM', name: 'SIM Card', categoryId: 'CAT-FIELD', trackSerial: false, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-TABLET', name: 'Tablet', categoryId: 'CAT-FIELD', trackSerial: true, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-TELEMETRY', name: 'โทรมาตร', categoryId: 'CAT-FIELD', trackSerial: true, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  { id: 'IT-OTHER', name: 'อื่นๆ', categoryId: 'CAT-OTHER', trackSerial: false, kit: false, scope: ['LOANABLE', 'SELLABLE'] },
  // ---- เพิ่มใหม่: ครุภัณฑ์/ทรัพย์สินภายใน Bedrock (สำหรับ "ขอเบิก" วัตถุประสงค์ "ใช้งานภายใน") ----
  { id: 'IN-DESKTOP', name: 'คอมพิวเตอร์ตั้งโต๊ะ', categoryId: 'CAT-OFFICE', trackSerial: true, kit: false, scope: ['INTERNAL'] },
  { id: 'IN-LAPTOP', name: 'โน้ตบุ๊ก', categoryId: 'CAT-OFFICE', trackSerial: true, kit: false, scope: ['INTERNAL'] },
  { id: 'IN-MONITOR', name: 'จอมอนิเตอร์', categoryId: 'CAT-OFFICE', trackSerial: true, kit: false, scope: ['INTERNAL'] },
  { id: 'IN-DESK', name: 'โต๊ะทำงาน', categoryId: 'CAT-OFFICE', trackSerial: false, kit: false, scope: ['INTERNAL'] },
  { id: 'IN-CHAIR', name: 'เก้าอี้สำนักงาน', categoryId: 'CAT-OFFICE', trackSerial: false, kit: false, scope: ['INTERNAL'] },
  { id: 'IN-OTHER', name: 'อื่นๆ (ครุภัณฑ์สำนักงาน)', categoryId: 'CAT-OTHER', trackSerial: false, kit: false, scope: ['INTERNAL'] },
];

function itemMasterByName(name) {
  return ITEM_MASTER.find((it) => it.name === name);
}
function categoryNameForItemName(name) {
  const it = itemMasterByName(name);
  return it ? categoryNameById(it.categoryId) : '-';
}

// ---------- Asset Register (ทะเบียนทรัพย์สินรวม — unified master) ----------
// classification: 'INTERNAL' | 'LOANABLE' | 'SELLABLE'
// status: 'IN_STOCK' | 'BORROWED' | 'SOLD' | 'REPAIR' | 'PENDING_WRITEOFF' | 'WRITTEN_OFF'
//   - BORROWED = เบิกแล้ว/อยู่ระหว่างใช้งาน (ยืม หรือ ใช้งานภายใน) ยังต้องติดตาม/อาจต้องคืน
//   - SOLD     = ขายขาดให้ลูกค้าแล้ว ออกจากระบบถาวร ไม่ต้องคืน (แยกจาก BORROWED ตาม feedback 30 ก.ย.)
// warrantyStart / warrantyEnd (optional, string 'YYYY-MM-DD' หรือ null) — เก็บไว้เช็คว่าหมดประกันหรือยัง
//   (ยืนยันเก็บต่อแน่นอนตามที่ user ย้ำ — ไม่เคยอยู่ในข้อเสนอให้ตัด)
// photoPath (optional, string หรือ '-') — "รูปถ่ายอุปกรณ์" เก็บเป็น path ไปยังไฟล์ใน shared folder
//   (ไม่ใช่ไฟล์ภาพที่อัปโหลดเข้าระบบจริง ตามที่ user ยืนยัน 1 ต.ค. 2569 — ตัด field "อายุการใช้งาน (ปี)"
//   ออกจาก schema ไปพร้อมกัน เพราะไม่ใช้คำนวณ depreciation แล้ว)
const ASSETS = [
  { tag: 'BED111002500004 (1/5)', type: 'Handheld', serial: 'MT9055GL2WEXEK02927', classification: 'LOANABLE', status: 'BORROWED', project: 'เทศบาลตำบลเขาพระงาม', location: 'เขาพระงาม', actualLocation: 'เขาพระงาม', cost: 18500, dueDate: '2026-10-15', warrantyStart: '2025-01-10', warrantyEnd: '2026-01-10', photoPath: '\\\\bedrock-nas\\stock-photos\\BED111002500004-1.jpg' },
  { tag: 'BED111002500004 (2/5)', type: 'Handheld', serial: 'MT9055GL2WEXEK03155', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'คลังกลาง Bedrock', cost: 18500, dueDate: null, warrantyStart: '2025-06-01', warrantyEnd: '2027-06-01', photoPath: '\\\\bedrock-nas\\stock-photos\\BED111002500004-2.jpg' },
  { tag: 'BED111002500004 (3/5)', type: 'Handheld', serial: 'MT9055GL2WEXEK03050', classification: 'LOANABLE', status: 'REPAIR', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'ศูนย์ซ่อม (รอ IT Support ตรวจ)', cost: 18500, dueDate: null },
  // ---- เพิ่ม 1 ต.ค. 2569 (Round 6): เติม IN_STOCK สำรองให้ประเภทที่ใช้บ่อยตอนจ่ายอุปกรณ์มีมากกว่า 1
  // ตัวเลือกเสมอ ตามที่ user ขอ "ให้เห็นภาพ" ว่านอกจากตัวที่ระบบแนะนำขึ้นบนสุดแล้ว ยังมีตัวเลือกอื่นให้
  // เทียบดูด้วย — ก่อนหน้านี้แทบทุกประเภทมี IN_STOCK ตรงเงื่อนไขแค่ 1 ตัว ทำให้ตารางเลือกเห็นแค่แถวเดียว
  { tag: 'BED111002500004 (4/5)', type: 'Handheld', serial: 'MT9055GL2WEXEK03201', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'เขาพระงาม', cost: 18500, dueDate: null },
  { tag: 'BED111002500004 (5/5)', type: 'Handheld', serial: 'MT9055GL2WEXEK03212', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'บางคล้า', cost: 18500, dueDate: null },
  { tag: 'BED125100001 (1/8)', type: 'Printer', serial: 'XXZHN251800316', classification: 'LOANABLE', status: 'BORROWED', project: 'เทศบาลนครเกาะสมุย', location: 'เกาะสมุย', actualLocation: 'เกาะสมุย', cost: 4500, dueDate: '2026-10-03' },
  { tag: 'BED125100001 (2/8)', type: 'Printer', serial: 'XXZHN251800322', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'คลังกลาง Bedrock', cost: 4500, dueDate: null },
  { tag: 'BED125100001 (6/8)', type: 'Printer', serial: 'XXZHN251800341', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'เทศบาลตำบลหนองแก', cost: 4500, dueDate: null },
  { tag: 'BED125100001 (3/8)', type: 'Printer', serial: 'XXZHN251800399', classification: 'SELLABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'คลังกลาง Bedrock', cost: 4500, dueDate: null },
  { tag: 'BED125100001 (4/8)', type: 'Printer', serial: 'XXZHN251800355', classification: 'SELLABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'เกาะสมุย', cost: 4500, dueDate: null },
  { tag: 'BED125100001 (5/8)', type: 'Printer', serial: 'XXZHN251800367', classification: 'SELLABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'ขอนแก่น', cost: 4500, dueDate: null },
  { tag: 'AW01B-0512', type: 'Anywhere 01 (อุปกรณ์ห้อยคอ)', serial: '861629051109027', classification: 'LOANABLE', status: 'BORROWED', project: 'เทศบาลตำบลเขาพระงาม', location: 'เขาพระงาม', actualLocation: 'เขาพระงาม', cost: 3200, dueDate: '2026-12-31' },
  { tag: 'AW01B-0513', type: 'Anywhere 01 (อุปกรณ์ห้อยคอ)', serial: '861629051109034', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'คลังกลาง Bedrock', cost: 3200, dueDate: null },
  { tag: 'AW02BR-01', type: 'Anywhere 02 (Smart Watch)', serial: '861352061446368', classification: 'LOANABLE', status: 'BORROWED', project: 'เทศบาลตำบลบางคล้า', location: 'บางคล้า', actualLocation: 'บางคล้า', cost: 5400, dueDate: '2027-02-28' },
  { tag: 'AW02BR-02', type: 'Anywhere 02 (Smart Watch)', serial: '861352061440338', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'คลังกลาง Bedrock', cost: 5400, dueDate: null },
  { tag: 'AW02BR-03', type: 'Anywhere 02 (Smart Watch)', serial: '861352061440345', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'เทศบาลตำบลบ้านกลาง', cost: 5400, dueDate: null },
  { tag: 'AW02BR-04', type: 'Anywhere 02 (Smart Watch)', serial: '861352061440352', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'เทศบาลตำบลหนองแก', cost: 5400, dueDate: null },
  { tag: 'BED111002400006 (1/7)', type: 'CareKit', serial: 'TBA9BR-06', classification: 'LOANABLE', status: 'BORROWED', project: 'ขอนแก่น', location: 'ขอนแก่น', actualLocation: 'ขอนแก่น', cost: 24900, dueDate: '2026-10-20' },
  { tag: 'BED111002400006 (5/7)', type: 'CareKit', serial: 'TB03-0026', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'คลังกลาง Bedrock', cost: 24900, dueDate: null },
  { tag: 'BED111000600012', type: 'CCTV', serial: 'CCTV-SN-0088', classification: 'LOANABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'คลังกลาง Bedrock', cost: 6200, dueDate: null },
  { tag: 'BED111000900004', type: 'Go Pro', serial: 'GP11-77452', classification: 'SELLABLE', status: 'IN_STOCK', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'คลังกลาง Bedrock', cost: 15900, dueDate: null },
  { tag: 'BED111000900005', type: 'Go Pro', serial: 'GP11-77480', classification: 'SELLABLE', status: 'SOLD', project: 'เทศบาลตำบลหนองแก — ซื้อขาด', location: 'เทศบาลตำบลหนองแก', actualLocation: 'เทศบาลตำบลหนองแก', cost: 15900, dueDate: null },
  { tag: 'BED070100011', type: 'คอมพิวเตอร์ตั้งโต๊ะ', serial: 'PC-FIN-011', classification: 'INTERNAL', status: 'IN_STOCK', project: 'แผนกบัญชี (ใช้งานภายใน)', location: 'สำนักงาน Bedrock', actualLocation: 'สำนักงาน Bedrock', cost: 22000, dueDate: null },
  { tag: 'BED070100014', type: 'จอมอนิเตอร์', serial: 'MON-014', classification: 'INTERNAL', status: 'IN_STOCK', project: 'แผนก IT (ใช้งานภายใน)', location: 'สำนักงาน Bedrock', actualLocation: 'สำนักงาน Bedrock', cost: 5500, dueDate: null },
  { tag: 'BED070100015', type: 'จอมอนิเตอร์', serial: 'MON-015', classification: 'INTERNAL', status: 'IN_STOCK', project: '-', location: 'สำนักงาน Bedrock', actualLocation: 'สำนักงาน Bedrock', cost: 5500, dueDate: null },
  { tag: 'BED070100020', type: 'โน้ตบุ๊ก', serial: 'NB-2026-020', classification: 'INTERNAL', status: 'IN_STOCK', project: '-', location: 'สำนักงาน Bedrock', actualLocation: 'สำนักงาน Bedrock', cost: 32000, dueDate: null },
  { tag: 'BED070100021', type: 'โน้ตบุ๊ก', serial: 'NB-2026-021', classification: 'INTERNAL', status: 'IN_STOCK', project: '-', location: 'สำนักงาน Bedrock', actualLocation: 'สำนักงาน Bedrock', cost: 32000, dueDate: null },
  { tag: 'ARV 11100 22 00015', type: 'โต๊ะทำงาน', serial: '-', classification: 'INTERNAL', status: 'IN_STOCK', project: 'ทรัพย์สินภายใน (รหัสเก่า)', location: 'สำนักงาน Bedrock', actualLocation: 'สำนักงาน Bedrock', cost: 4200, dueDate: null },
  { tag: 'BED125090003 (1/1)', type: 'Tablet', serial: 'TAB-SN-2231', classification: 'LOANABLE', status: 'WRITTEN_OFF', project: '-', location: '-', actualLocation: 'ตัดจำหน่ายแล้ว', cost: 9900, dueDate: null },

  // ---- เพิ่ม 2 ต.ค. 2569 (Round 10): ตัวอย่างสถานะ "กำลังซ่อม (ส่งออกแล้ว)" ให้ครบ 4 กรณีของตัวบ่งชี้
  // เกินกำหนดซ่อม — (ก) กรอกวันคาดเสร็จไว้และยังไม่เกิน, (ข) กรอกไว้แล้วเกิน, (ค) ไม่ได้กรอกและยังไม่ถึง
  // 30 วัน (ค่าตั้งต้น REPAIR_OVERDUE_DEFAULT_DAYS), (ง) ไม่ได้กรอกและเกิน 30 วันแล้ว — (ค) ยังใช้ vendor
  // แบบพิมพ์เอง ("อื่น ๆ") เพื่อ demo ป้าย "พิมพ์เอง" ของข้อ 2 ไปพร้อมกัน
  { tag: 'BED125100001 (7/8)', type: 'Printer', serial: 'XXZHN251800410', classification: 'LOANABLE', status: 'OUT_FOR_REPAIR', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'ส่งซ่อมที่ ศูนย์บริการ Zebra (ตัวแทนจำหน่ายไทย)', cost: 4500, dueDate: null,
    repairVendor: 'ศูนย์บริการ Zebra (ตัวแทนจำหน่ายไทย)', repairVendorIsOther: false, repairSentAt: '2026-09-25', repairExpectedDate: '2026-10-10', repairCostEstimate: 1200 },
  { tag: 'BED125100001 (8/8)', type: 'Printer', serial: 'XXZHN251800411', classification: 'LOANABLE', status: 'OUT_FOR_REPAIR', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'ส่งซ่อมที่ ศูนย์บริการ Zebra (ตัวแทนจำหน่ายไทย)', cost: 4500, dueDate: null,
    repairVendor: 'ศูนย์บริการ Zebra (ตัวแทนจำหน่ายไทย)', repairVendorIsOther: false, repairSentAt: '2026-09-10', repairExpectedDate: '2026-09-28', repairCostEstimate: 1500 },
  { tag: 'BED111002400006 (2/7)', type: 'CareKit', serial: 'TB03-0027', classification: 'LOANABLE', status: 'OUT_FOR_REPAIR', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'ส่งซ่อมที่ ช่างซ่อมเฉพาะกิจ (คุณสมหมาย — แนะนำโดยไซต์งาน)', cost: 24900, dueDate: null,
    repairVendor: 'ช่างซ่อมเฉพาะกิจ (คุณสมหมาย — แนะนำโดยไซต์งาน)', repairVendorIsOther: true, repairSentAt: '2026-09-20', repairExpectedDate: null, repairCostEstimate: null },
  { tag: 'AW02BR-05', type: 'Anywhere 02 (Smart Watch)', serial: '861352061440369', classification: 'LOANABLE', status: 'OUT_FOR_REPAIR', project: '-', location: 'คลังกลาง Bedrock', actualLocation: 'ส่งซ่อมที่ Anywhere Thailand (ศูนย์ซ่อม IoT)', cost: 5400, dueDate: null,
    repairVendor: 'Anywhere Thailand (ศูนย์ซ่อม IoT)', repairVendorIsOther: false, repairSentAt: '2026-08-01', repairExpectedDate: null, repairCostEstimate: 800 },
];

const STATUS_LABEL = {
  IN_STOCK: { text: 'พร้อมใช้งาน', cls: 'tag-green' },
  BORROWED: { text: 'เบิกแล้ว/อยู่ระหว่างใช้งาน', cls: 'tag-blue' },
  SOLD: { text: 'ขายแล้ว', cls: 'tag-gray' },
  REPAIR: { text: 'ไม่พร้อมใช้งาน/รอซ่อม', cls: 'tag-amber' },
  // เพิ่ม 2 ต.ค. 2569 (Round 9): แยก "รอพิจารณา" (REPAIR) ออกจาก "ส่งซ่อมจริงแล้ว รอรับกลับ"
  // (OUT_FOR_REPAIR) เพราะช่วงที่อุปกรณ์อยู่ร้านซ่อม/vendor ไม่ใช่ "พร้อมใช้งาน" แต่ก็ไม่ใช่ "อยู่ระหว่าง
  // รอให้คนตัดสินใจ" เหมือนกัน — ถ้าไม่แยก สต๊อกจะนับไม่ตรงกับของจริง (ของหายไปจากสมการช่วงอยู่ร้านซ่อม)
  OUT_FOR_REPAIR: { text: 'กำลังซ่อม (ส่งออกแล้ว)', cls: 'tag-purple' },
  PENDING_WRITEOFF: { text: 'ซ่อมไม่ได้ / รออนุมัติ Write-off', cls: 'tag-red' },
  WRITTEN_OFF: { text: 'ตัดจำหน่ายแล้ว', cls: 'tag-red' },
};
const CLASS_LABEL = {
  INTERNAL: { text: 'ทรัพย์สินภายใน', cls: 'tag-purple' },
  LOANABLE: { text: 'ให้ยืมได้', cls: 'tag-blue' },
  SELLABLE: { text: 'ให้ขายได้', cls: 'tag-gray' },
};

// ---------- ทีม (สังกัดทีม — auto-fill จาก profile) ----------
const TEAMS = ['Business Consultant', 'Data Analytics', 'Product Development', 'Program Execution', 'Pre-sales', 'Project Delivery', 'Sales', 'Sales Partnership', 'Tech Partnership', 'Other'];

// ---------- สมมติ user ปัจจุบันตามบทบาทที่เลือกใน role switcher ----------
const DEMO_USERS = {
  ASSET_HOLDER: { name: 'ลัดดา คำมูล', role: 'Asset Holder (พนักงานทั่วไป)', team: 'Project Delivery', initials: 'LK' },
  OPERATION: { name: 'สมชาย ดูแลคลัง', role: 'OPERATION (เจ้าหน้าที่ stock)', team: '-', initials: 'SC' },
  IT_SUPPORT: { name: 'พี่ต้อม', role: 'IT Support', team: '-', initials: 'PT' },
  APPROVER: { name: 'สุปราณี ผู้บริหาร', role: 'ผู้อนุมัติ (Write-off)', team: '-', initials: 'SP' },
};

// ---------- คำขอเบิกที่ค้างอยู่ (pending, ยังไม่ถูกจ่าย) ----------
// เก็บใน memory ผ่าน state.js — เริ่มต้นด้วยตัวอย่าง 3 รายการ
const SEED_BORROW_REQUESTS = [
  {
    id: 'REQ-2026-0093',
    purpose: 'ใช้งานภายใน',
    requester: 'ณัฐพล เจริญพร',
    team: 'Data Analytics',
    project: 'แผนก Data Analytics (ใช้งานภายใน)',
    neededDate: '2026-10-02',
    dueDate: null,
    items: [{ itemId: 'IN-LAPTOP', qty: 1 }, { itemId: 'IN-MONITOR', qty: 1 }],
    status: 'รอจ่ายของ',
    createdAt: '2026-09-30 08:45',
    source: 'standalone',
  },
  {
    id: 'REQ-2026-0091',
    purpose: 'ยืม',
    requester: 'กิตติ สายชล',
    team: 'Sales',
    project: 'อบต.หนองปลาไหล — เสนอราคา IoT',
    neededDate: '2026-10-03',
    dueDate: '2026-10-25',
    items: [{ itemId: 'IT-HANDHELD', qty: 1 }, { itemId: 'IT-SIM', qty: 1 }],
    status: 'รอจ่ายของ',
    createdAt: '2026-09-28 09:12',
    source: 'standalone',
  },
  {
    id: 'REQ-2026-0092',
    purpose: 'ยืม',
    requester: 'ปวีณา ทองดี',
    team: 'Project Delivery',
    project: 'เทศบาลตำบลบ้านกลาง — โครงการ Smart City',
    neededDate: '2026-10-06',
    dueDate: '2026-11-05',
    items: [{ itemId: 'IT-ANYWHERE02', qty: 2 }],
    status: 'รอจ่ายของ',
    createdAt: '2026-09-29 14:03',
    source: 'pmex', // จำลองว่าถูกสร้างมาจากหน้าบันทึกอุปกรณ์ของ PMeX
  },
  {
    id: 'REQ-2026-0090',
    purpose: 'ขายขาด',
    requester: 'อรุณี ศรีสุข',
    team: 'Business Consultant',
    project: 'เทศบาลนครเกาะสมุย — จัดซื้อตรง',
    neededDate: '2026-10-01',
    dueDate: null,
    items: [{ itemId: 'IT-PRINTER', qty: 1 }],
    status: 'รอจ่ายของ',
    createdAt: '2026-09-27 11:40',
    source: 'standalone',
  },

  // ---- เพิ่ม 2 ต.ค. 2569 (Round 10): ร่างคำขอเบิกทดแทนที่ "ระบบสร้างให้อัตโนมัติ" (gap B, Round 9)
  // ใส่ตัวอย่างให้ครบทุกสถานะ (ปกติ / ใกล้หมดอายุ / หมดอายุแล้ว / ยกเลิกแล้ว) โดยไม่ต้องไปกดจำลอง
  // ขั้นตอนรับคืนเองทีละสถานะ — อิงวันที่ปัจจุบันของ mockup นี้ที่ 2 ต.ค. 2569
  {
    id: 'REQ-2026-0080',
    purpose: 'ยืม',
    requester: 'ปวีณา ทองดี',
    team: 'Project Delivery',
    project: 'เทศบาลตำบลบ้านกลาง — โครงการ Smart City',
    neededDate: '2026-09-29',
    dueDate: null,
    items: [{ itemId: 'IT-ANYWHERE02', qty: 1 }],
    status: 'รอจ่ายของ', // ตัวอย่าง: ร่างปกติ ยังเหลือเวลาอีกหลายวัน
    createdAt: '2026-09-28 10:00',
    source: 'standalone',
    autoReplacementNote: 'สร้างอัตโนมัติจากการแจ้งคืนอุปกรณ์เสีย (คำขอคืน RET-2026-0010) — โปรดตรวจสอบก่อนจ่ายของ',
    autoReplacementExpiresAt: '2026-10-12', // createdAt + 14 วัน (ค่าตั้งต้น AUTO_REPLACEMENT_EXPIRY_DAYS)
  },
  {
    id: 'REQ-2026-0081',
    purpose: 'ยืม',
    requester: 'ธีรศักดิ์ บุญมา',
    team: 'Sales',
    project: 'เทศบาลตำบลบางคล้า',
    neededDate: '2026-09-21',
    dueDate: null,
    items: [{ itemId: 'IT-ANYWHERE02', qty: 1 }],
    status: 'รอจ่ายของ', // ตัวอย่าง: ร่างใกล้หมดอายุ (เหลืออีกไม่กี่วัน) — เพื่อ demo สีเตือน/ความเร่งด่วน
    createdAt: '2026-09-20 09:00',
    source: 'standalone',
    autoReplacementNote: 'สร้างอัตโนมัติจากการแจ้งคืนอุปกรณ์เสีย (คำขอคืน RET-2026-0002) — โปรดตรวจสอบก่อนจ่ายของ',
    autoReplacementExpiresAt: '2026-10-04', // createdAt + 14 วัน — เหลือ 2 วันนับจากวันนี้ (2 ต.ค. 2569)
  },
  {
    id: 'REQ-2026-0082',
    purpose: 'ยืม',
    requester: 'กิตติ สายชล',
    team: 'Sales',
    project: 'อบต.หนองปลาไหล — เสนอราคา IoT',
    neededDate: '2026-09-11',
    dueDate: null,
    items: [{ itemId: 'IT-HANDHELD', qty: 1 }],
    status: 'หมดอายุ', // ตัวอย่าง: หมดอายุแล้ว (เกิน 14 วันไม่มีใครมาดำเนินการ) — ไม่หายไป แค่เปลี่ยนสถานะ
    createdAt: '2026-09-10 09:00',
    source: 'standalone',
    autoReplacementNote: 'สร้างอัตโนมัติจากการแจ้งคืนอุปกรณ์เสีย (คำขอคืน RET-2026-0007) — โปรดตรวจสอบก่อนจ่ายของ',
    autoReplacementExpiresAt: '2026-09-24', // createdAt + 14 วัน — เลยมาแล้ว ระบบเปลี่ยนสถานะอัตโนมัติ
  },
  {
    id: 'REQ-2026-0083',
    purpose: 'ขายขาด',
    requester: 'อรุณี ศรีสุข',
    team: 'Business Consultant',
    project: 'เทศบาลนครเกาะสมุย — จัดซื้อตรง',
    neededDate: '2026-09-16',
    dueDate: null,
    items: [{ itemId: 'IT-PRINTER', qty: 1 }],
    status: 'ยกเลิกแล้ว', // ตัวอย่าง: ผู้ใช้กดยกเลิกร่างเอง (ระบุเหตุผลไว้ด้วย — เหตุผลเป็นช่องไม่บังคับ)
    createdAt: '2026-09-15 09:00',
    source: 'standalone',
    autoReplacementNote: 'สร้างอัตโนมัติจากการแจ้งคืนอุปกรณ์เสีย (คำขอคืน RET-2026-0004) — โปรดตรวจสอบก่อนจ่ายของ',
    autoReplacementExpiresAt: '2026-09-29',
    autoReplacementCancelledAt: '2026-09-16 10:30',
    autoReplacementCancelledBy: 'อรุณี ศรีสุข',
    autoReplacementCancelReason: 'ไม่ต้องการแล้ว ใช้เครื่องสำรองที่มีอยู่แก้ขัดไปก่อน',
  },

  // ---- เพิ่ม 2 ต.ค. 2569 (Round 8): คำขอที่ "จ่ายของไปแล้ว" ใช้ demo ฟีเจอร์ "ยืนยันรับของ" ใหม่
  // ให้เห็นภาพครบทั้ง 3 สถานะการรับของทันทีโดยไม่ต้องจ่ายของเองก่อน (รอผู้รับยืนยัน / รับของแล้ว / แจ้งปัญหา)
  {
    id: 'REQ-2026-0087',
    purpose: 'ยืม',
    requester: 'วิชัย ทองใบ',
    team: 'Field Operations',
    project: 'เทศบาลตำบลเขาพระงาม',
    neededDate: '2026-09-24',
    dueDate: '2026-10-15',
    items: [{ itemId: 'IT-HANDHELD', qty: 1 }],
    status: 'เบิกแล้ว',
    createdAt: '2026-09-23 13:20',
    source: 'standalone',
    dispatchedAssets: ['BED111002500004 (1/5)'],
    receiptStatus: 'รอผู้รับยืนยัน', // ยังไม่มีใครกดยืนยัน — ใช้ demo ปุ่ม "ยืนยันรับของ" / "บันทึกแทนผู้ขอ"
    receiptNote: null,
    receiptConfirmedBy: null,
    receiptConfirmedAt: null,
  },
  {
    id: 'REQ-2026-0086',
    purpose: 'ยืม',
    requester: 'ธีรศักดิ์ บุญมา',
    team: 'Sales',
    project: 'เทศบาลตำบลบางคล้า',
    neededDate: '2026-09-22',
    dueDate: '2027-02-28',
    items: [{ itemId: 'IT-ANYWHERE02', qty: 1 }],
    status: 'เบิกแล้ว',
    createdAt: '2026-09-20 11:00',
    source: 'standalone',
    dispatchedAssets: ['AW02BR-01'],
    receiptStatus: 'แจ้งปัญหา', // demo กรณีเช็กแล้วพบว่าไม่ครบ/มีปัญหา — OPERATION เห็นเป็น flag ต้องติดตามเอง
    receiptNote: 'ได้รับของแล้วแต่สาย charger หายไป 1 เส้น ไม่ครบตามที่คาดไว้',
    receiptConfirmedBy: 'ธีรศักดิ์ บุญมา',
    receiptConfirmedAt: '2026-09-21 16:40',
  },
  {
    id: 'REQ-2026-0085',
    purpose: 'ยืม',
    requester: 'มาลี ประเสริฐ',
    team: 'Business Consultant',
    project: 'เทศบาลนครเกาะสมุย',
    neededDate: '2026-09-21',
    dueDate: '2026-10-03',
    items: [{ itemId: 'IT-PRINTER', qty: 1 }],
    status: 'เบิกแล้ว',
    createdAt: '2026-09-19 09:30',
    source: 'standalone',
    dispatchedAssets: ['BED125100001 (1/8)'],
    receiptStatus: 'รับของแล้ว', // demo กรณีปิด loop ครบ ไม่มีปัญหา
    receiptNote: null,
    receiptConfirmedBy: 'มาลี ประเสริฐ',
    receiptConfirmedAt: '2026-09-20 14:10',
  },
];

function itemNameById(id) {
  const it = ITEM_MASTER.find((x) => x.id === id);
  return it ? it.name : id;
}

// ---------- ตัวเลือกสถานที่เก็บ (สำหรับฟอร์มรับของเข้าคลัง) ----------
const STORAGE_LOCATIONS = ['คลังกลาง Bedrock', 'สำนักงาน Bedrock'];

// ---------- เหตุผลรับคืน (ใช้ร่วมกันทั้งฝั่งผู้ขอเบิกแจ้งคืนเอง และฝั่ง OPERATION รับคืนแบบเดิม) ----------
// เพิ่ม "คืนปกติ" เข้ามาใน Round 9 (เดิมมีแต่คำที่เป็นมุมมอง OPERATION เช่น "หมดสัญญาโครงการ" ซึ่งไม่
// เหมาะกับฝั่งผู้ขอเบิกที่แค่อยากบอกว่า "ใช้เสร็จแล้ว ของสภาพดี")
const RETURN_REASONS = ['คืนปกติ', 'หมดสัญญาโครงการ', 'อุปกรณ์เสีย', 'อื่นๆ'];

// ---------- Round 10 (2 ต.ค. 2569) — ค่าตั้งต้น/ค่า config ต่าง ๆ ที่ยังรอ user confirm ----------
// ทั้ง 2 ตัวเลขนี้เป็นแค่ค่าตั้งต้นที่ Claude ใส่ไว้ก่อนเพื่อให้เห็น UX ได้ — ยังไม่ final ดู README
// หัวข้อ "คำถามที่รอ user confirm ใน Round 10"

// จำนวนวันหมดอายุของ "ร่างคำขอเบิกทดแทน" ที่ระบบสร้างอัตโนมัติตอนยืนยันรับคืนอุปกรณ์เสีย (gap B, Round 9)
// — เกินจำนวนวันนี้แล้วยังไม่มีใครมาดำเนินการ (ทั้งฝั่งผู้ขอ/OPERATION) จะเปลี่ยนสถานะเป็น "หมดอายุ" เอง
const AUTO_REPLACEMENT_EXPIRY_DAYS = 14;
// เกณฑ์ "ใกล้หมดอายุ" (ใช้แค่ไฮไลต์สีในหน้าจอ ไม่ใช่ค่าที่ต้องรอ user confirm)
const AUTO_REPLACEMENT_EXPIRING_SOON_DAYS = 3;

// จำนวนวันที่ถือว่า "เกินกำหนดซ่อม" เมื่อตอนส่งซ่อมไม่ได้กรอก "วันที่คาดว่าจะซ่อมเสร็จ" ไว้ (นับจากวันส่งซ่อม)
const REPAIR_OVERDUE_DEFAULT_DAYS = 30;

// ---------- Round 10 — รายชื่อผู้ให้บริการซ่อม (hard-code ไว้ก่อน ยังไม่มีหน้าจัดการ/CRUD) ----------
// เป็นแค่ตัวอย่างที่ Claude สมมติขึ้น ไม่ใช่รายชื่อ vendor จริงที่ Bedrock ใช้ — ดู README หัวข้อคำถามรอ
// confirm ว่ารายชื่อจริงมีกี่เจ้า/ต้องเก็บข้อมูลติดต่ออะไรบ้าง
const REPAIR_VENDORS = [
  'ศูนย์บริการ Motorola (ตัวแทนในไทย)',
  'ศูนย์บริการ Zebra (ตัวแทนจำหน่ายไทย)',
  'Anywhere Thailand (ศูนย์ซ่อม IoT)',
  'ช่างประจำสำนักงาน Bedrock',
  'ร้านซ่อมคอมพิวเตอร์ IT City (ขอนแก่น)',
];
const REPAIR_VENDOR_OTHER = 'อื่น ๆ (ระบุชื่อ)';

// ---------- Log การรับของเข้าคลังล่าสุด (ตัวอย่าง — รายการใหม่จากฟอร์มจะถูกเติมด้านบน) ----------
const RECEIVE_LOG = [
  { tag: 'BED125100001 (2/8)', type: 'Printer', serial: 'XXZHN251800322', classification: 'LOANABLE', cost: 4500, vendor: 'Zebra (ตัวแทนจำหน่ายไทย)', po: 'PO-2025-1187', receivedAt: '2025-10-01', receivedBy: 'สมชาย ดูแลคลัง' },
  { tag: 'BED111000900004', type: 'Go Pro', serial: 'GP11-77452', classification: 'SELLABLE', cost: 15900, vendor: 'Bewell Innovation', po: 'PO-2025-1201', receivedAt: '2025-11-14', receivedBy: 'สมชาย ดูแลคลัง' },
];

// ---------- คำขอ/ประวัติต่ออายุการยืม (renewal — สร้างใบใหม่ reference กลับของเดิมเป็น chain) ----------
const RENEWAL_RECORDS = [
  { id: 'REN-2026-0001', assetTag: 'AW02BR-01', oldDueDate: '2026-11-30', newDueDate: '2027-02-28', requestedBy: 'ปวีณา ทองดี', requestedAt: '2026-09-15 10:20', note: 'ลูกค้าขอขยายสัญญาต่ออีก 3 เดือน' },
];

// ---------- ประวัติรับคืนอุปกรณ์ล่าสุด (ตัวอย่าง) ----------
const RETURN_LOG = [
  { assetTag: 'BED111002500004 (3/5)', type: 'Handheld', reason: 'อุปกรณ์เสีย', note: 'จอแตก เปิดไม่ติด', returnedBy: 'สมชาย ดูแลคลัง', returnedAt: '2026-09-20 16:05' },
];

// ---------- คำขอแจ้งคืนอุปกรณ์ (self-service — เพิ่ม 2 ต.ค. 2569 Round 9 ตาม gap ที่ user ชี้ว่า
//            วงจรคืนของไม่สมมาตรกับวงจรขอเบิก: ขอเบิกมี self-service เต็มรูปแบบ แต่คืนของเดิมมีแต่
//            ฝั่ง OPERATION เปิดเองแล้วไปงมเลือกจากตาราง ไม่มีใครมาบอกว่าของชิ้นไหนกำลังจะถูกคืน) ----------
// status: 'รอ OPERATION ยืนยันรับคืน' | 'รับคืนแล้ว'
// items: [{ tag, itemName, reason }] — รอบนี้รองรับเฉพาะของที่ track Serial Number (ของนับจำนวนอย่างเดียว
//        ยังไม่มีกลไกติดตามรายชิ้นในทะเบียนทรัพย์สินอยู่แล้วตั้งแต่ต้น mockup จึงยังไม่รองรับแจ้งคืนในรอบนี้)
// wantsReplacement: true เมื่อผู้แจ้งคืนระบุว่ายังต้องใช้งานต่อเนื่อง — ถ้า OPERATION ยืนยันว่าอุปกรณ์เสีย
//        จริง ระบบจะสร้างคำขอเบิกใหม่ (ร่าง) ให้อัตโนมัติ ไม่ auto จ่ายของทันที (ยังต้องผ่าน OPERATION
//        ตรวจสอบ+จ่ายของตามขั้นตอนปกติ — ตามหลักการเดียวกับที่ user ยืนยันไว้ตอน Round 4 ว่าห้ามข้าม
//        ขั้นตอนที่ต้องมีคนยืนยัน)
const RETURN_REQUESTS = [
  {
    id: 'RET-2026-0001',
    reqId: 'REQ-2026-0085',
    requester: 'มาลี ประเสริฐ',
    team: 'Business Consultant',
    project: 'เทศบาลนครเกาะสมุย',
    items: [{ tag: 'BED125100001 (1/8)', itemName: 'Printer', reason: 'คืนปกติ' }],
    note: 'ใช้งานเสร็จตามสัญญาแล้ว ส่งคืนตามกำหนด',
    wantsReplacement: false,
    status: 'รอ OPERATION ยืนยันรับคืน',
    requestedAt: '2026-10-01 10:15',
    confirmedBy: null,
    confirmedAt: null,
  },
  {
    id: 'RET-2026-0002',
    reqId: 'REQ-2026-0086',
    requester: 'ธีรศักดิ์ บุญมา',
    team: 'Sales',
    project: 'เทศบาลตำบลบางคล้า',
    items: [{ tag: 'AW02BR-01', itemName: 'Anywhere 02 (Smart Watch)', reason: 'อุปกรณ์เสีย' }],
    note: 'จอแสดงผลค้าง เปิดไม่ติดตั้งแต่เมื่อวาน',
    wantsReplacement: true,
    status: 'รอ OPERATION ยืนยันรับคืน',
    requestedAt: '2026-10-01 15:40',
    confirmedBy: null,
    confirmedAt: null,
  },
];

// ---------- ประวัติธุรกรรมจริงต่ออุปกรณ์ (asset-level event log — เพิ่ม 1 ต.ค. 2569 ตาม feedback UX
//            หน้าจ่ายอุปกรณ์) ----------
// ทุกธุรกรรม (รับเข้า/จ่าย/ต่ออายุ/รับคืน/ซ่อม/write-off) จะ push เข้า array นี้ ใช้เป็น "ของจริง" แทน
// ประวัติที่เคยเดา/สังเคราะห์จากสถานะปัจจุบันในหน้า drawer รายละเอียดทรัพย์สิน — และใช้คำนวณ badge
// "เคยอยู่ไซต์นี้มาก่อน" ตอนเลือก Serial จ่ายของ (ดูหัวข้อ "จ่ายอุปกรณ์" ด้านล่าง)
// event: 'RECEIVE' | 'DISPATCH' | 'RENEW' | 'RETURN' | 'REPAIR_FIXED' | 'REPAIR_REJECTED' | 'WRITTEN_OFF'
const HISTORY_EVENT_LABEL = {
  RECEIVE: 'รับเข้าคลัง',
  DISPATCH: 'จ่ายอุปกรณ์',
  RENEW: 'ต่ออายุการยืม',
  RETURN: 'รับคืนอุปกรณ์',
  SENT_TO_REPAIR: 'ส่งซ่อม (ภายนอก/Vendor)',
  REPAIR_FIXED: 'ซ่อมเสร็จ — กลับเข้าสต๊อก',
  REPAIR_REJECTED: 'ซ่อมไม่ได้ — ส่งคำขอ Write-off',
  WRITTEN_OFF: 'อนุมัติ Write-off',
  RECEIPT_CONFIRM: 'ผู้รับยืนยันรับของแล้ว',
  RECEIPT_ISSUE: 'ผู้รับยืนยันรับของ — แจ้งปัญหา',
};

// ตัวอย่างประวัติเก่า (ก่อนเริ่ม mockup) ใส่ไว้ให้ demo ฟีเจอร์ "เคยอยู่ไซต์นี้มาก่อน" ได้ทันที —
// รายการที่เกิดขึ้นระหว่างใช้ mockup (จ่าย/รับคืน/ต่ออายุ ฯลฯ) จะถูก push เพิ่มเข้ามาเองที่ด้านบน
const ASSET_HISTORY = [
  { tag: 'BED111002500004 (2/5)', event: 'DISPATCH', project: 'อบต.หนองปลาไหล — เสนอราคา IoT', date: '2026-06-01', note: 'เบิก (ยืม) ครั้งก่อน', by: 'กิตติ สายชล' },
  { tag: 'BED111002500004 (2/5)', event: 'RETURN', project: 'อบต.หนองปลาไหล — เสนอราคา IoT', date: '2026-08-20', note: 'หมดสัญญาโครงการ กลับเข้าสต๊อก', by: 'สมชาย ดูแลคลัง' },
  { tag: 'AW02BR-02', event: 'DISPATCH', project: 'เทศบาลตำบลบ้านกลาง — โครงการ Smart City', date: '2026-05-10', note: 'เบิก (ยืม) ครั้งก่อน', by: 'ปวีณา ทองดี' },
  { tag: 'AW02BR-02', event: 'RETURN', project: 'เทศบาลตำบลบ้านกลาง — โครงการ Smart City', date: '2026-08-01', note: 'หมดสัญญาโครงการ กลับเข้าสต๊อก', by: 'สมชาย ดูแลคลัง' },

  // ---- เพิ่ม 2 ต.ค. 2569 (Round 8): ประวัติจ่าย/รับของ สำหรับ 3 คำขอตัวอย่างที่ "จ่ายของไปแล้ว"
  // ใช้ demo ฟีเจอร์ "ยืนยันรับของ" ใหม่ — ครบทั้ง 3 สถานะ (รอผู้รับยืนยัน / รับของแล้ว / แจ้งปัญหา)
  { tag: 'BED111002500004 (1/5)', event: 'DISPATCH', project: 'เทศบาลตำบลเขาพระงาม', date: '2026-09-23', note: 'ยืม — คำขอ REQ-2026-0087 โดย วิชัย ทองใบ (กำหนดคืน 2026-10-15)', by: 'สมชาย ดูแลคลัง' },

  { tag: 'BED125100001 (1/8)', event: 'DISPATCH', project: 'เทศบาลนครเกาะสมุย', date: '2026-09-19', note: 'ยืม — คำขอ REQ-2026-0085 โดย มาลี ประเสริฐ (กำหนดคืน 2026-10-03)', by: 'สมชาย ดูแลคลัง' },
  { tag: 'BED125100001 (1/8)', event: 'RECEIPT_CONFIRM', project: 'เทศบาลนครเกาะสมุย', date: '2026-09-20', note: 'ยืนยันรับของครบถ้วน สภาพดี', by: 'มาลี ประเสริฐ' },

  { tag: 'AW02BR-01', event: 'DISPATCH', project: 'เทศบาลตำบลบางคล้า', date: '2026-09-20', note: 'ยืม — คำขอ REQ-2026-0086 โดย ธีรศักดิ์ บุญมา (กำหนดคืน 2027-02-28)', by: 'สมชาย ดูแลคลัง' },
  { tag: 'AW02BR-01', event: 'RECEIPT_ISSUE', project: 'เทศบาลตำบลบางคล้า', date: '2026-09-21', note: 'ได้รับของแล้วแต่สาย charger หายไป 1 เส้น ไม่ครบตามที่คาดไว้', by: 'ธีรศักดิ์ บุญมา' },

  // ---- เพิ่ม 2 ต.ค. 2569 (Round 10): ประวัติ "ส่งซ่อม" สำหรับ 4 ตัวอย่างตัวบ่งชี้เกินกำหนดซ่อม (ข้อ 3)
  { tag: 'BED125100001 (7/8)', event: 'SENT_TO_REPAIR', project: '-', date: '2026-09-25', note: 'ส่งซ่อมที่ ศูนย์บริการ Zebra (ตัวแทนจำหน่ายไทย) · คาดว่าเสร็จ 2026-10-10 · ประมาณการค่าซ่อม 1,200 บาท', by: 'พี่ต้อม' },
  { tag: 'BED125100001 (8/8)', event: 'SENT_TO_REPAIR', project: '-', date: '2026-09-10', note: 'ส่งซ่อมที่ ศูนย์บริการ Zebra (ตัวแทนจำหน่ายไทย) · คาดว่าเสร็จ 2026-09-28 · ประมาณการค่าซ่อม 1,500 บาท', by: 'พี่ต้อม' },
  { tag: 'BED111002400006 (2/7)', event: 'SENT_TO_REPAIR', project: '-', date: '2026-09-20', note: 'ส่งซ่อมที่ ช่างซ่อมเฉพาะกิจ (คุณสมหมาย — แนะนำโดยไซต์งาน) (พิมพ์เอง ไม่อยู่ในรายการมาตรฐาน)', by: 'พี่ต้อม' },
  { tag: 'AW02BR-05', event: 'SENT_TO_REPAIR', project: '-', date: '2026-08-01', note: 'ส่งซ่อมที่ Anywhere Thailand (ศูนย์ซ่อม IoT) · ประมาณการค่าซ่อม 800 บาท', by: 'พี่ต้อม' },
];

// ตัดส่วนต่อท้ายหลัง "—" ออก (เช่น "เทศบาลตำบลบ้านกลาง — โครงการ Smart City" -> "เทศบาลตำบลบ้านกลาง")
// เพื่อเทียบว่า "ไซต์/ลูกค้าเดิม" หรือไม่ แม้คำขอใหม่จะมีคำต่อท้ายต่างจากครั้งก่อน
function siteCore(text) {
  if (!text) return '';
  return text.split('—')[0].trim();
}

// อุปกรณ์ตัวนี้ (tag) เคยถูกจ่ายให้ไซต์/ลูกค้าเดียวกับ project ที่ระบุมาก่อนหรือไม่ (เทียบจาก ASSET_HISTORY)
function assetUsedBySite(tag, project) {
  const core = siteCore(project);
  if (!core || core === '-') return false;
  return ASSET_HISTORY.some((h) => h.tag === tag && h.event === 'DISPATCH' && siteCore(h.project) === core);
}

// ---------- กลุ่มพื้นที่คร่าว ๆ (region) สำหรับ badge "ใกล้ไซต์นี้" ในหน้าจ่ายอุปกรณ์ ----------
// mockup ไม่มีพิกัด GPS จริง — ใช้ keyword match กับชื่อไซต์/อำเภอที่เจอในข้อมูลตัวอย่างแทน (ของจริงควร
// ใช้จังหวัด/พิกัดจริงจาก master data โครงการ)
const REGION_KEYWORDS = [
  { kw: 'เขาพระงาม', region: 'ภาคกลาง' },
  { kw: 'เกาะสมุย', region: 'ภาคใต้' },
  { kw: 'บางคล้า', region: 'ภาคตะวันออก' },
  { kw: 'ขอนแก่น', region: 'ภาคอีสาน' },
  { kw: 'หนองแก', region: 'ภาคกลาง' },
  { kw: 'หนองปลาไหล', region: 'ภาคตะวันออก' },
  { kw: 'บ้านกลาง', region: 'ภาคเหนือ' },
];
function regionOf(text) {
  if (!text) return null;
  for (const r of REGION_KEYWORDS) {
    if (text.includes(r.kw)) return r.region;
  }
  return null;
}

// ---------- คำขอ Write-off (จากเคสซ่อมไม่ได้ / ผลตรวจนับ / แจ้งสูญหาย / อื่นๆ) ----------
// status: 'รออนุมัติ' | 'อนุมัติแล้ว' | 'ไม่อนุมัติ'
// source: 'REPAIR_REJECTED' | 'ANNUAL_MISSING' | 'MANUAL' — เพิ่ม 2 ต.ค. 2569 (Round 9) พร้อม
//   previousStatus (สถานะของทรัพย์สินก่อนถูกตั้งเป็น PENDING_WRITEOFF) เพื่อให้ "ไม่อนุมัติ" ย้อนกลับไป
//   สถานะที่ถูกต้องตามที่มาจริง แทนที่จะย้อนกลับเข้าคิวพิจารณาซ่อมเสมอทุกกรณีเหมือนก่อนหน้านี้ (ซึ่งผิด
//   logic สำหรับเคสที่มาจากตรวจนับ/แจ้งสูญหาย ที่ไม่เกี่ยวกับการซ่อมเลย)
const WRITEOFF_REQUESTS = [
  { id: 'WO-2026-0001', assetTag: 'BED125090003 (1/1)', type: 'Tablet', reason: 'ซ่อมไม่ได้ (IT Support พิจารณา)', note: 'จอแตก อะไหล่เลิกผลิตแล้ว', requestedBy: 'พี่ต้อม (IT Support)', requestedAt: '2026-09-18 11:00', status: 'อนุมัติแล้ว', approvedBy: 'สุปราณี ผู้บริหาร', approvedAt: '2026-09-19 09:30', source: 'REPAIR_REJECTED', previousStatus: 'REPAIR' },
];

// ---------- ผลตรวจนับประจำปี (เก็บผลของรอบล่าสุดที่บันทึกใน mockup นี้) ----------
// key = asset tag, value = { result: 'FOUND' | 'MISSING' | 'DAMAGED', note }
let annualCheckResults = {};
let annualCheckSavedAt = null;

function nextSeqId(prefix, list, pad) {
  const n = list.length + 1;
  return `${prefix}-${String(n).padStart(pad || 4, '0')}`;
}
