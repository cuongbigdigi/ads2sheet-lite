// ============================================================
// ADS2SHEET LITE - by Ho Ngoc Cuong
// Luu tru cau hinh an toan qua PropertiesService (khong can sheet ht_taikhoan)
// ============================================================

function gDN(planName) {
    const p = (planName || 'Free').toLowerCase();
    if (p === 'free') return 'Eco';
    if (p === 'basic') return 'Vip';
    return planName;
}

const C2 = { SHEET_NAME: 'datamaster' };
const METRICS = [
    { apiName: 'spend', displayName: 'Spend (VND)' },
    { apiName: 'impressions', displayName: 'Impressions' },
    { apiName: 'reach', displayName: 'Reach' },
    { apiName: 'clicks', displayName: 'Clicks (All)' },
    { apiName: 'calculated:cpc', displayName: 'CPC (VND)' },
    { apiName: 'cpm', displayName: 'CPM (VND)' },
    { apiName: 'ctr', displayName: 'CTR (%)' },
    { apiName: 'actions:comment', displayName: 'Comments' },
    { apiName: 'actions:onsite_conversion.messaging_conversation_started_7d', displayName: 'Messaging Conversation Started' },
    { apiName: 'calculated:cost_per_comment', displayName: 'Chi phi binh luan' },
    { apiName: 'calculated:cost_per_messaging', displayName: 'Chi phi mess' },
    { apiName: 'actions:post_reaction', displayName: 'Post Reactions' },
    { apiName: 'actions:post_engagement', displayName: 'Post Engagement' },
    { apiName: 'actions:link_click', displayName: 'Link Clicks' },
    { apiName: 'actions:page_like', displayName: 'Page Likes' },
    { apiName: 'actions:post', displayName: 'Post Shares' },
    { apiName: 'actions:photo_view', displayName: 'Photo Views' },
    { apiName: 'calculated:cost_per_photo_view', displayName: 'Chi phi xem anh' },
    { apiName: 'video_thruplay_watched_actions', displayName: 'Luot xem ThruPlay' },
    { apiName: 'cost_per_thruplay', displayName: 'Chi phi/ThruPlay' },
    { apiName: 'video_p25_watched_actions', displayName: 'Xem video 25%' },
    { apiName: 'video_p50_watched_actions', displayName: 'Xem video 50%' },
    { apiName: 'video_p100_watched_actions', displayName: 'Xem video 100%' },
    { apiName: 'actions:landing_page_view', displayName: 'Landing Page Views' },
    { apiName: 'actions:lead', displayName: 'Leads (All)' },
    { apiName: 'actions:initiate_checkout', displayName: 'Initiate Checkouts' },
    { apiName: 'calculated:total_purchases', displayName: 'Purchases (All)' },
    { apiName: 'calculated:total_purchase_value', displayName: 'Purchase Value' },
    { apiName: 'actions:purchase', displayName: 'Purchases (Generic)' },
    { apiName: 'actions:offsite_conversion.fb_pixel_purchase', displayName: 'Website Purchases' },
    { apiName: 'actions:onsite_conversion.purchase', displayName: 'Facebook/Instagram Purchases' },
    { apiName: 'action_values:purchase', displayName: 'Purchase Value (Generic)' },
    { apiName: 'action_values:offsite_conversion.fb_pixel_purchase', displayName: 'Website Purchase Value' },
    { apiName: 'action_values:onsite_conversion.purchase', displayName: 'Facebook/Instagram Purchase Value' }
];

function sL(k, p) {}
function gL() { return { key: 'nokey', plan: 'Vip' }; }
function cL() {}
function gP() { return 'Vip'; }
function vK(k) { return { isValid: true, plan: 'Vip' }; }
function cK(m) { return true; }

// ======================= PROPERTIES SERVICE =======================
const PROPS_KEY_TOKEN = 'ADS2SHEET_TOKEN';
const PROPS_KEY_ACCOUNTS = 'ADS2SHEET_ACCOUNTS';

function _getProps() { return PropertiesService.getDocumentProperties(); }

function _getSavedToken() {
    const token = _getProps().getProperty(PROPS_KEY_TOKEN);
    if (!token) throw new Error('Chua thiet lap Token. Vui long chay "Bat dau & Cai dat" truoc.');
    return token;
}

function _getSavedAccounts() {
    const raw = _getProps().getProperty(PROPS_KEY_ACCOUNTS);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; }
}

// ======================= ACCOUNT FUNCTIONS =======================
function getAcc() {
    const token = _getSavedToken();
    const accounts = _getSavedAccounts();
    if (accounts.length === 0) throw new Error('Chua co tai khoan nao. Vui long chay "Bat dau & Cai dat".');
    return accounts.map(function(acc) {
        return { name: acc.name, access_token: token, ad_account_id: 'act_' + acc.id.toString().replace(/[^0-9]/g, ''), active: true };
    });
}

function getSingleAccountByName(name) {
    const token = _getSavedToken();
    const accounts = _getSavedAccounts();
    const found = accounts.find(function(acc) { return acc.name.trim() === name.trim(); });
    if (!found) return null;
    const cleanId = found.id.toString().replace(/[^0-9]/g, '');
    if (!cleanId) throw new Error('Tai khoan "' + name + '" co account_id khong hop le.');
    return { name: found.name, access_token: token, ad_account_id: 'act_' + cleanId, active: true };
}

function fmtD(d) {
    if (!d) return null;
    if (typeof d === 'string' && d.match(/^\d{4}-\d{2}-\d{2}$/)) return d;
    if (d instanceof Date) return Utilities.formatDate(d, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
    try { const p = new Date(d); if (isNaN(p.getTime())) return d.toString(); return Utilities.formatDate(p, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd'); } catch (e) { return d.toString(); }
}

function getTD() { return Utilities.formatDate(new Date(), SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), "yyyy-MM-dd"); }
function getF() { return METRICS; }

function fetchD(dr, fs) {
    try {
        const a = getAcc();
        if (!a || a.length === 0) { console.log("Khong co tai khoan."); return null; }
        return fetchAndProcessData(a, dr, getF(), fs);
    } catch (e) { console.error("Loi lay du lieu: " + e.message); throw e; }
}

// ======================= DATA PROCESSING =======================
function prepD(ad, ef) {
    const SEPARATOR = '|';
    const TARGET_FIELD = 'ad_name';
    const MAX_TAGS = 3;
    const tagHeaders = [];
    for (let i = 1; i <= MAX_TAGS; i++) tagHeaders.push('Tag ' + i);
    let customHeaders = [];
    if (ad.length > 0 && ad[0].account && ad[0].account.customData) {
        customHeaders = Object.keys(ad[0].account.customData);
    }
    const h = ['Ngay', 'Cap nhat luc', 'Ten Tai Khoan', 'Account ID']
        .concat(customHeaders)
        .concat(['Campaign Name', 'Campaign ID', 'Trang thai chien dich', 'Adset Name', 'Adset ID', 'Trang thai nhom', 'Ngan sach Ngay', 'Ngan sach Da tieu (%)', 'Ad Name', 'Ad ID', 'Trang thai quang cao'])
        .concat(ef.map(function(f) { return f.displayName; }))
        .concat(['Link Bai Viet', 'Page ID'])
        .concat(tagHeaders);
    const ar = [];
    const u = new Date().toLocaleString('vi-VN');
    ad.forEach(function(accD) {
        const accCustomData = accD.account.customData || {};
        accD.data.forEach(function(item) {
            const rd = new Map();
            const sp = (item.daily_budget > 0) ? (item.spend / item.daily_budget) : 0;
            rd.set('Ngay', item.date); rd.set('Cap nhat luc', u); rd.set('Ten Tai Khoan', item.account_name);
            rd.set('Account ID', item.account_id); rd.set('Page ID', item.page_id);
            rd.set('Campaign Name', item.campaign_name); rd.set('Campaign ID', item.campaign_id);
            rd.set('Trang thai chien dich', item.campaign_status); rd.set('Adset Name', item.adset_name);
            rd.set('Adset ID', item.adset_id); rd.set('Trang thai nhom', item.adset_status);
            rd.set('Ngan sach Ngay', item.daily_budget); rd.set('Ngan sach Da tieu (%)', sp);
            rd.set('Ad Name', item.ad_name); rd.set('Ad ID', item.ad_id);
            rd.set('Trang thai quang cao', item.ad_status); rd.set('Link Bai Viet', item.post_link || '');
            customHeaders.forEach(function(k) { rd.set(k, accCustomData[k] || ''); });
            ef.forEach(function(f) { rd.set(f.displayName, item[f.apiName] || 0); });
            if (item[TARGET_FIELD]) {
                const parts = String(item[TARGET_FIELD]).split(SEPARATOR);
                for (let i = 0; i < parts.length && i < MAX_TAGS; i++) rd.set('Tag ' + (i + 1), parts[i].trim());
            }
            ar.push(h.map(function(k) { return rd.has(k) ? rd.get(k) : ''; }));
        });
    });
    return { headers: h, rows: ar };
}

function fmtS(s, rc, h) {
    try {
        if (rc <= 1) return;
        s.getRange(1, 1, 1, h.length).setFontWeight('bold').setBackground('#cfe2f3');
        const fn = function(cn, f) { const ci = h.indexOf(cn); if (ci > -1) s.getRange(2, ci + 1, rc - 1, 1).setNumberFormat(f); };
        fn('Impressions', '#,##0'); fn('Reach', '#,##0'); fn('Spend (VND)', '#,##0');
        fn('CPC (VND)', '#,##0.00'); fn('Purchase Value', '#,##0');
        fn('Ngan sach Ngay', '#,##0'); fn('Ngan sach Da tieu (%)', '0.00"%"');
        fn('CPM (VND)', '#,##0.00'); fn('CTR (%)', '0.00"%"');
        ['Chi phi binh luan', 'Chi phi mess', 'Chi phi xem anh', 'Chi phi/ThruPlay'].forEach(function(f) { fn(f, '#,##0.00'); });
        ['Luot xem ThruPlay', 'Xem video 25%', 'Xem video 50%', 'Xem video 100%'].forEach(function(f) { fn(f, '#,##0'); });
        const sc = ['Trang thai chien dich', 'Trang thai nhom', 'Trang thai quang cao'];
        const ar = [];
        sc.forEach(function(cn) {
            const ci = h.indexOf(cn);
            if (ci > -1) {
                const r = s.getRange(2, ci + 1, rc - 1, 1);
                ar.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('Dang hoat dong').setBackground('#d4edda').setRanges([r]).build());
                ar.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('Da tam dung').setBackground('#fff3cd').setRanges([r]).build());
                ar.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('Bi tu choi').setBackground('#f8d7da').setRanges([r]).build());
            }
        });
        s.setConditionalFormatRules(ar);
    } catch (e) { console.warn("Loi fmtS: " + e.message); }
}

function cDM() {
    const s = SpreadsheetApp.getActiveSpreadsheet();
    let h = s.getSheetByName(C2.SHEET_NAME);
    if (!h) h = s.insertSheet(C2.SHEET_NAME, 0);
    return h;
}

function uDM(ad, ss, es, ef) {
    try {
        if (!ss || !es) throw new Error("uDM thieu ngay thang.");
        const ds = cDM();
        const startTime = new Date(ss).setHours(0, 0, 0, 0);
        const endTime = new Date(es).setHours(23, 59, 59, 999);
        const result = prepD(ad, ef);
        const nh = result.headers; const nr = result.rows;
        const newAccIdIdx = nh.indexOf('Account ID');
        const targetAccountIds = new Set(nr.map(function(row) { return String(row[newAccIdIdx]); }));
        const lastRow = ds.getLastRow();
        const aed = lastRow > 1 ? ds.getDataRange().getValues() : [];
        const oh = aed.length > 0 ? aed.shift() : [];
        const oldDateIdx = oh.indexOf('Ngay'); const oldAccIdx = oh.indexOf('Account ID');
        const dataToKeep = [];
        if (oldDateIdx !== -1 && oldAccIdx !== -1) {
            const colMap = nh.map(function(header) { return oh.indexOf(header); });
            for (let i = 0; i < aed.length; i++) {
                const row = aed[i]; const rowDateVal = row[oldDateIdx]; if (!rowDateVal) continue;
                const rowTime = new Date(rowDateVal).setHours(0, 0, 0, 0);
                if (rowTime >= startTime && rowTime <= endTime && targetAccountIds.has(String(row[oldAccIdx]))) continue;
                dataToKeep.push(colMap.map(function(oldIdx) { return oldIdx !== -1 ? row[oldIdx] : ''; }));
            }
        }
        const combinedData = dataToKeep.concat(nr);
        const dm = new Map();
        const kD = nh.indexOf('Ngay'); const kA = nh.indexOf('Account ID'); const kAd = nh.indexOf('Ad ID');
        combinedData.forEach(function(r) {
            const dStr = fmtD(r[kD]); if (!dStr) return; r[kD] = dStr;
            dm.set(dStr + '|' + r[kA] + '|' + r[kAd], r);
        });
        const finalRows = Array.from(dm.values());
        finalRows.sort(function(a, b) { const dc = String(b[kD]).localeCompare(String(a[kD])); return dc !== 0 ? dc : String(a[kA]).localeCompare(String(b[kA])); });
        const finalData = [nh].concat(finalRows);
        if (finalData.length > 0) {
            const curMax = ds.getMaxRows();
            if (finalData.length > curMax) ds.insertRowsAfter(curMax, finalData.length - curMax);
            ds.getRange(1, 1, finalData.length, finalData[0].length).setValues(finalData);
            const oldLast = ds.getLastRow();
            if (oldLast > finalData.length) ds.getRange(finalData.length + 1, 1, oldLast - finalData.length, ds.getLastColumn()).clearContent();
            fmtS(ds, finalData.length, nh);
        }
        SpreadsheetApp.flush();
        console.log('Cap nhat thanh cong. Tong: ' + finalRows.length + ' dong.');
        return true;
    } catch (error) { console.error('Loi uDM: ' + error.stack); throw error; }
}

function runT(e) {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) { console.warn('Script dang ban.'); return; }
    const it = Boolean(e);
    try {
        if (!cK(!it)) return;
        const t = getTD();
        console.log('=== Bat dau cap nhat ngay: ' + t + ' ===');
        const res = fetchD({ startDate: t, endDate: t }, true);
        if (res && res.allData && res.allData.length > 0) {
            uDM(res.allData, t, t, res.enabledFields);
            if (!it) SpreadsheetApp.getUi().alert('✅ Thành công!', 'Đã cập nhật dữ liệu ngày ' + t + '.', SpreadsheetApp.getUi().ButtonSet.OK);
        } else {
            if (!it) SpreadsheetApp.getUi().alert('📢 Thông báo', 'Không có dữ liệu mới.', SpreadsheetApp.getUi().ButtonSet.OK);
        }
    } catch (error) {
        console.error('Loi nghiem trong: ' + error.stack);
        if (!it) SpreadsheetApp.getUi().alert('❌ Lỗi cập nhật', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    } finally { lock.releaseLock(); }
}

// ======================= CHỐT SỔ CUỐI NGÀY (3H SÁNG) =======================
// Chạy lúc 3h sáng để lấy lại toàn bộ data ngày hôm qua
// Đảm bảo data từ 23:00-23:59 không bị thiếu
function runDailyReconcile() {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) { console.warn('runDailyReconcile: Script đang bận.'); return; }
    try {
        // Lấy ngày hôm qua
        const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = Utilities.formatDate(yesterday, tz, 'yyyy-MM-dd');
        console.log('=== [CHỐT SỔ] Bắt đầu lấy lại data ngày: ' + yStr + ' ===');
        const res = fetchD({ startDate: yStr, endDate: yStr }, true);
        if (res && res.allData && res.allData.length > 0) {
            uDM(res.allData, yStr, yStr, res.enabledFields);
            console.log('[CHỐT SỔ] Hoàn tất! Đã chốt data ngày ' + yStr);
        } else {
            console.log('[CHỐT SỔ] Không có data nào cho ngày ' + yStr);
        }
    } catch (error) {
        console.error('[CHỐT SỔ] Lỗi: ' + error.stack);
    } finally {
        lock.releaseLock();
    }
}

function runSingleAccountReport(s, e, accName, createNewSheet) {
    try {
        const selectedAccount = getSingleAccountByName(accName);
        if (!selectedAccount) throw new Error('Khong tim thay tai khoan "' + accName + '".');
        const enabledFields = getF();
        const result = fetchAndProcessData([selectedAccount], { startDate: s, endDate: e }, enabledFields, true);
        if (result && result.allData && result.allData.length > 0) {
            let msg = "";
            if (createNewSheet) {
                const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
                const cleanAccName = accName.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
                const sn = 'BC_' + cleanAccName + '_' + s + '_' + e;
                let rs = spreadsheet.getSheetByName(sn);
                if (rs) rs.clear(); else rs = spreadsheet.insertSheet(sn, 1);
                const r2 = prepD(result.allData, enabledFields);
                if (r2.rows.length > 0) {
                    const fd = [r2.headers].concat(r2.rows);
                    rs.getRange(1, 1, fd.length, r2.headers.length).setValues(fd);
                    fmtS(rs, fd.length, r2.headers);
                }
                rs.activate();
                msg = 'Thanh cong! Da tao sheet: "' + sn + '".';
            } else {
                uDM(result.allData, s, e, enabledFields);
                msg = 'Thanh cong! Da cap nhat tai khoan "' + accName + '" vao Datamaster.';
            }
            return msg;
        } else { throw new Error('Facebook khong tra ve du lieu nao.'); }
    } catch (error) { console.error("Loi runSingleAccountReport: " + error.stack); throw new Error(error.message); }
}

function uBOE(e) {
    const r = e.range, s = r.getSheet(), ro = r.getRow(), c = r.getColumn(), ui = SpreadsheetApp.getUi();
    if (s.getName() === 'datamaster' && ro > 1) {
        const h = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
        const b = h.indexOf('Ngan sach Ngay'), a = h.indexOf('Adset ID'), n = h.indexOf('Ten Tai Khoan');
        if (c !== (b + 1) || a === -1 || n === -1) return;
        const d = s.getRange(ro, 1, 1, s.getLastColumn()).getValues()[0]; const v = r.getValue();
        if (typeof v !== 'number' || v <= 0) { ui.alert('❌ Lỗi', 'Giá trị ngân sách không hợp lệ.', ui.ButtonSet.OK); r.setValue(e.oldValue); return; }
        try { ui.alert('💰 Cập nhật Ngân sách', pBU(d[a], v, d[n]), ui.ButtonSet.OK); }
        catch (err) { ui.alert('❌ Thất bại', 'Lỗi: ' + err.message, SpreadsheetApp.getUi().ButtonSet.OK); r.setValue(e.oldValue); }
    }
}

function pBU(adsetId, newBudget, accountName) {
    return performBudgetUpdate(adsetId, newBudget, _getSavedToken());
}

// ======================= MENU =======================
function onOpen() {
    try {
        const ui = SpreadsheetApp.getUi();
        const m = ui.createMenu('📊 Ads2Sheet Lite');
        m.addItem('🚀 Bắt đầu & Cài đặt', 'showInitDialog');
        m.addSeparator();
        m.addItem('📊 Cập nhật dữ liệu hôm nay', 'runT');
        m.addItem('📅 Cập nhật dữ liệu trước đây', 'rCRWD');
        m.addSeparator();
        const im = ui.createMenu('⭐ By Hồ Ngọc Cương');
        im.addItem('ℹ️ Thông tin & Góp ý', 'showInfo');
        m.addSubMenu(im);
        m.addToUi();
    } catch (e) {
        SpreadsheetApp.getUi().createMenu('📊 Ads2Sheet Lite (Tải lại)').addItem('🔄 Đang tải lại...', 'onOpen').addToUi();
    }
}

function showInfo() {
    const info = '<div style="font-family:Segoe UI,sans-serif;padding:20px;color:#333;">' +
        '<h3 style="color:#1a73e8;text-align:center;margin-bottom:5px;">Ads2Sheet Lite</h3>' +
        '<p style="text-align:center;font-weight:bold;color:#555;margin-top:0;margin-bottom:20px;">By Ho Ngoc Cuong</p>' +
        '<div style="background:#f8f9fa;border-radius:8px;padding:15px;margin-bottom:15px;border:1px solid #e0e0e0;">' +
        '<h4 style="color:#d93025;margin-top:0;font-size:14px;">✨ Tính năng nổi bật</h4>' +
        '<ul style="list-style:none;padding-left:5px;font-size:13px;line-height:1.8;margin:0;">' +
        '<li>🟢 Real-time: Đồng bộ dữ liệu FB Ads về Sheet chính xác, tức thì.</li>' +
        '<li>📊 Đa chiều dữ liệu: Theo dõi hơn 34+ chỉ số hiệu suất quảng cáo.</li>' +
        '<li>📋 Báo cáo thông minh: Hỗ trợ làm báo cáo và xây dựng Dashboard.</li>' +
        '<li>🔒 Auto Backup: Lấy toàn bộ lịch sử. Tài khoản bị khóa vẫn KHÔNG MẤT DATA.</li>' +
        '<li>🚀 Giải phóng Ads thủ: Chấm dứt báo cáo thủ công, tập trung phân tích & tối ưu.</li>' +
        '</ul></div>' +
        '<div style="background:#e8f0fe;padding:12px;border-radius:6px;border-left:4px solid #1a73e8;">' +
        '<p style="font-size:13px;margin:3px 0;">Web: cuongbig.com</p>' +
        '<p style="font-size:13px;margin:3px 0;">Facebook: /cuongbigdigi</p>' +
        '<p style="font-size:13px;margin:3px 0;">Email: cuongbig.info@gmail.com</p>' +
        '</div><div style="text-align:center;margin-top:20px;">' +
        '<button onclick="google.script.host.close()" style="background:#1a73e8;color:white;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-weight:bold;">❌ Đóng</button>' +
        '</div></div>';
    SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(info).setWidth(440).setHeight(440), 'Ads2Sheet Lite - Thông tin');
}

function rCRWD() {
    const ui = SpreadsheetApp.getUi();
    try {
        const savedAccounts = _getSavedAccounts();
        if (savedAccounts.length === 0) {
            ui.alert('⚠️ Chưa cấu hình', 'Chưa có tài khoản nào. Vui lòng chạy "Bat dau & Cai dat" truoc.', ui.ButtonSet.OK);
            return;
        }
        const accountNames = savedAccounts.map(function(acc) { return acc.name; });
        let optHtml = accountNames.map(function(n) { return '<option value="' + n + '">' + n + '</option>'; }).join('');
        const today = new Date().toISOString().split('T')[0];
        const html = '<style>body{font-family:Segoe UI,sans-serif;padding:20px;color:#333}' +
            '.hidden{display:none}label{display:block;margin-top:15px;font-weight:600;font-size:13px}' +
            'select,input[type=date]{width:100%;padding:10px;margin-top:5px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box}' +
            'button{background:#4285f4;color:white;padding:12px;border:none;border-radius:4px;cursor:pointer;width:100%;margin-top:20px;font-weight:bold;font-size:14px}' +
            '.cb-box{margin-top:15px;background:#fff8e1;padding:12px;border-radius:4px;border:1px solid #ffe0b2;font-size:13px}' +
            '.spin{border:4px solid #f3f3f3;border-top:4px solid #4285f4;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 15px}' +
            '.lbox{text-align:center;padding-top:20px}' +
            '@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>' +
            '<div id="fv"><h3 style="margin-top:0">📅 Cập nhật dữ liệu cũ</h3>' +
            '<label>Chọn tài khoản:</label><select id="acc">' + optHtml + '</select>' +
            '<label>Ngày bắt đầu:</label><input type="date" id="sd" value="' + today + '">' +
            '<label>Ngày kết thúc:</label><input type="date" id="ed" value="' + today + '">' +
            '<div class="cb-box"><input type="checkbox" id="cs" style="margin-right:8px;">' +
            '<label for="cs" style="display:inline;font-weight:normal;color:#e65100;">Tạo sheet báo cáo riêng (không ghi vào Datamaster)</label></div>' +
            '<button onclick="go()">🚀 Bắt đầu lấy dữ liệu</button></div>' +
            '<div id="lv" class="hidden lbox"><div class="spin"></div>' +
            '<p style="color:#4285f4;font-weight:bold">🔄 Đang kết nối Facebook API...</p>' +
            '<p style="color:#d93025;font-size:12px">Vui lòng KHÔNG tắt cửa sổ này. Có thể mất 1-3 phút.</p></div>' +
            '<div id="sv" class="hidden" style="text-align:center;padding-top:20px;">' +
            '<h2 style="color:#0f9d58">✅ Hoàn tất!</h2><p id="rm" style="font-size:13px"></p>' +
            '<button onclick="google.script.host.close()">❌ Đóng cửa sổ</button></div>' +
            '<script>function go(){' +
            'var acc=document.getElementById("acc").value,' +
            'sd=document.getElementById("sd").value,' +
            'ed=document.getElementById("ed").value,' +
            'cs=document.getElementById("cs").checked;' +
            'if(!acc||!sd||!ed){alert("Vui lòng nhập đủ thông tin");return;}' +
            'if(new Date(sd)>new Date(ed)){alert("Ngày không hợp lệ");return;}' +
            'document.getElementById("fv").className="hidden";' +
            'document.getElementById("lv").className="lbox";' +
            'google.script.run' +
            '.withSuccessHandler(function(m){document.getElementById("lv").className="hidden lbox";document.getElementById("sv").className="";document.getElementById("rm").innerText=m;})' +
            '.withFailureHandler(function(e){alert("Loi: "+e.message);document.getElementById("lv").className="hidden lbox";document.getElementById("fv").className="";})' +
            '.runSingleAccountReport(sd,ed,acc,cs);' +
            '}<\/script>';
        ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(420).setHeight(520), 'Công cụ lấy dữ liệu cũ');
    } catch (e) { ui.alert('Loi', e.message, ui.ButtonSet.OK); }
}

// ======================= INIT DIALOG =======================
function showInitDialog() {
    const css = '<style>*{box-sizing:border-box}body{font-family:Segoe UI,sans-serif;padding:20px;background:#f8f9fa;color:#333;margin:0}' +
        'h2{color:#1a73e8;font-size:18px;text-align:center;margin-bottom:5px}.sub{text-align:center;font-size:12px;color:#888;margin-bottom:18px}' +
        '.fg{margin-bottom:12px}label{display:block;font-weight:500;margin-bottom:5px;font-size:13px}' +
        'input[type=password]{width:100%;padding:10px;border:1px solid #dadce0;border-radius:6px;font-size:13px}' +
        '.note{margin-top:8px;font-size:11px;color:#5f6368;background:#fff;border:1px solid #e0e0e0;border-radius:4px;padding:8px 10px;line-height:1.5}' +
        '.btn{width:100%;padding:12px;background:#1a73e8;color:white;border:none;border-radius:6px;font-size:15px;font-weight:500;cursor:pointer;margin-top:10px}' +
        '.btn:hover{background:#1557b0}.btn:disabled{background:#a0c1f2;cursor:not-allowed}' +
        '.btn-g{background:#0f9d58}.btn-g:hover{background:#0b7a45}' +
        '.log{margin-top:12px;padding:10px;border-radius:6px;font-size:12px;font-family:monospace;background:#fff;border:1px solid #e0e0e0;min-height:65px;white-space:pre-wrap;word-wrap:break-word}' +
        '.hidden{display:none}.sh{font-size:13px;font-weight:600;color:#1a73e8;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #e8f0fe}' +
        '.al{max-height:210px;overflow-y:auto;border:1px solid #dadce0;border-radius:6px;background:#fff}' +
        '.ai{display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid #f0f0f0;cursor:pointer}' +
        '.ai:last-child{border-bottom:none}.ai:hover{background:#f8f9fa}' +
        '.ai input{width:16px;height:16px;margin-right:10px;cursor:pointer;flex-shrink:0}' +
        '.ai label{margin:0;font-size:13px;cursor:pointer;font-weight:normal}' +
        '.ai label small{display:block;color:#888;font-size:11px}' +
        '.ln{font-size:11px;color:#e65100;margin-top:6px;font-style:italic}' +
        '.cnt{font-size:12px;font-weight:bold;color:#1a73e8;margin-bottom:6px}' +
        '@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>';

    const js = '<script>var MAX=3,tok="",accs=[];' +
        'function logTo(id,msg,h){var b=document.getElementById(id);b.classList.remove("hidden");if(h)b.innerHTML+="<div>"+msg+"</div>";else b.innerHTML+="<div>> "+msg+"</div>";b.scrollTop=b.scrollHeight;}' +
        'function checkToken(){' +
        'var t=document.getElementById("token").value.trim();' +
        'if(!t){alert("Vui lòng nhập Token!");return;}tok=t;' +
        'document.getElementById("btnCheck").disabled=true;' +
        'document.getElementById("log1").innerHTML="";' +
        'logTo("log1","🔄 Đang kết nối Facebook API...");' +
        'google.script.run' +
        '.withSuccessHandler(function(list){accs=list;' +
        'logTo("log1","<b style=color:#0d652d>✅ Token hợp lệ! Tìm thấy "+list.length+" tài khoản.</b>",true);' +
        'renderList(list);' +
        'document.getElementById("s1").classList.add("hidden");' +
        'document.getElementById("s2").classList.remove("hidden");})' +
        '.withFailureHandler(function(e){logTo("log1","<b style=color:#d93025>Loi: "+e.message+"</b>",true);document.getElementById("btnCheck").disabled=false;})' +
        '.init_fetchAccountList(t);}' +
        'function renderList(list){var el=document.getElementById("al");el.innerHTML="";' +
        'list.forEach(function(acc,i){var d=document.createElement("div");d.className="ai";' +
        'd.innerHTML="<input type=checkbox id=a"+i+" value="+i+" onchange=chg()><label for=a"+i+">"+acc.name+"<small>ID: "+acc.id+"</small></label>";' +
        'el.appendChild(d);});}' +
        'function chg(){var c=document.querySelectorAll(".ai input:checked");' +
        'document.getElementById("cnt").innerText="Da chon: "+c.length+" / "+MAX;' +
        'document.querySelectorAll(".ai input").forEach(function(cb){cb.disabled=c.length>=MAX&&!cb.checked;});}' +
        'function save(){var c=document.querySelectorAll(".ai input:checked");' +
        'if(c.length===0){alert("Vui lòng chọn ít nhất 1 tài khoản.");return;}' +
        'var sel=[];c.forEach(function(cb){sel.push(accs[parseInt(cb.value)]);});' +
        'document.getElementById("btnSave").disabled=true;' +
        'logTo("log2","Đang lưu cấu hình...");' +
        'google.script.run' +
        '.withSuccessHandler(function(msg){logTo("log2","<b style=color:#0d652d>"+msg+"</b>",true);logTo("log2","✅ Hoàn tất! Nhấn nút bên dưới để đóng.");var b=document.getElementById("btnSave");b.disabled=false;b.style.background="#1a73e8";b.innerText="✅ Đóng cửa sổ";b.onclick=function(){google.script.host.close();};})' +
        '.withFailureHandler(function(e){logTo("log2","<b style=color:#d93025>Loi: "+e.message+"</b>",true);document.getElementById("btnSave").disabled=false;})' +
        '.init_saveConfiguration(tok,sel);}' +
        '<\/script>';

    const body = '<h2>Cài Đặt Ads2Sheet Lite</h2>' +
        '<p class="sub">Thiết lập một lần, dữ liệu chạy mỗi giờ</p>' +
        '<div id="s1"><div class="fg">' +
        '<label for="token">Facebook Access Token:</label>' +
        '<input type="password" id="token" placeholder="Dán token vào đây (EAA...)" autocomplete="off">' +
        '<div class="note">Bảo mật: Token chỉ lưu trên Google Sheet này, không truyền đến bất kỳ máy chủ nào khác. Mã nguồn 100% công khai.</div>' +
        '</div><button id="btnCheck" class="btn" onclick="checkToken()">Kiểm tra Token & Tải tài khoản</button>' +
        '<div id="log1" class="log hidden"></div></div>' +
        '<div id="s2" class="hidden"><div class="sh">Token hợp lệ ✔️ - Chọn tài khoản (tối đa 3)</div>' +
        '<div class="cnt" id="cnt">Đã chọn: 0 / 3</div>' +
        '<div class="al" id="al"></div>' +
        '<div class="ln">Phiên bản Lite hỗ trợ tối đa 3 tài khoản đồng thời.</div>' +
        '<button id="btnSave" class="btn btn-g" onclick="save()" style="margin-top:12px">Lưu cấu hình & Kích hoạt</button>' +
        '<div id="log2" class="log hidden"></div></div>';

    const html = '<!DOCTYPE html><html><head><base target="_top">' + css + '</head><body>' + body + js + '</body></html>';
    SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(480).setHeight(580), 'Cài Đặt Ads2Sheet Lite');
}

function init_fetchAccountList(token) {
    if (!token) throw new Error("Token khong duoc de trong.");
    const accounts = fetchAdAccounts(token);
    if (!accounts || accounts.length === 0) throw new Error("Token hop le nhung khong tim thay tai khoan nao.");
    return accounts;
}

function init_saveConfiguration(token, selectedAccounts) {
    if (!token) throw new Error("Token trong.");
    if (!selectedAccounts || selectedAccounts.length === 0) throw new Error("Chua chon tai khoan nao.");
    if (selectedAccounts.length > 3) throw new Error("Phien ban Lite chi ho tro toi da 3 tai khoan.");
    const props = _getProps();
    props.setProperty(PROPS_KEY_TOKEN, token);
    props.setProperty(PROPS_KEY_ACCOUNTS, JSON.stringify(selectedAccounts));
    // Xóa tất cả trigger cũ của tool này
    const fnNames = ['runT', 'runDailyReconcile'];
    ScriptApp.getProjectTriggers().forEach(function(t) {
        if (fnNames.indexOf(t.getHandlerFunction()) > -1) ScriptApp.deleteTrigger(t);
    });
    // Trigger 1: Cập nhật mỗi 1 giờ (real-time)
    ScriptApp.newTrigger('runT').timeBased().everyHours(1).create();
    // Trigger 2: Chốt sổ 3h sáng hàng ngày (bù data 23h-23h59)
    ScriptApp.newTrigger('runDailyReconcile').timeBased().atHour(3).everyDays(1).create();
    cDM();
    return '✅ Đã lưu ' + selectedAccounts.length + ' tài khoản. Đã cài: cập nhật 1h/lần + chốt sổ 3h sáng hàng ngày!';
}

// ======================= FACEBOOK API =======================
const CONFIG = { FB_API_BASE: 'https://graph.facebook.com/v22.0/' };

function getActionValue(actions, actionTypes) {
    if (!actions || !Array.isArray(actions)) return 0;
    let total = 0; actions.forEach(function(a) { if (actionTypes.includes(a.action_type)) total += parseInt(a.value || 0); });
    return total;
}
function getActionValuesValue(av, actionTypes) {
    if (!av || !Array.isArray(av)) return 0;
    let total = 0; av.forEach(function(a) { if (actionTypes.includes(a.action_type)) total += parseFloat(a.value || 0); });
    return total;
}
function getComplexValue(data, actionType) {
    if (!data || !Array.isArray(data)) return 0;
    const found = data.find(function(item) { return item.action_type === actionType; });
    return found ? parseFloat(found.value || 0) : 0;
}
function parseStandardValue(value) { if (value === undefined || value === null) return 0; const n = parseFloat(value); return isNaN(n) ? 0 : n; }
function translateDeliveryStatus(status) {
    const m = { 'ACTIVE': 'Dang hoat dong', 'PAUSED': 'Da tam dung', 'DELETED': 'Da xoa', 'ARCHIVED': 'Da luu tru', 'PENDING_REVIEW': 'Cho duyet', 'DISAPPROVED': 'Bi tu choi', 'CAMPAIGN_PAUSED': 'Chien dich tam dung', 'IN_PROCESS': 'Dang xu ly', 'WITH_ISSUES': 'Co van de', 'ERROR': 'Loi' };
    return m[status] || status || 'Khong xac dinh';
}

function makeApiCall(url, params, accountName) {
    const ps = Object.keys(params).filter(function(k) { return params[k] !== undefined; }).map(function(k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    const resp = UrlFetchApp.fetch(url + '?' + ps, { method: 'GET', headers: { 'Authorization': 'Bearer ' + params.access_token }, muteHttpExceptions: true });
    const data = JSON.parse(resp.getContentText());
    if (data.error) throw new Error('Facebook API Error (' + (accountName || '') + '): ' + data.error.message);
    return data;
}

function getObjectsInfo(account, objectIds, fields) {
    if (!objectIds || objectIds.length === 0) return {};
    const infoMap = {};
    const batchSize = 50;
    for (let i = 0; i < objectIds.length; i += batchSize) {
        const batch = objectIds.slice(i, i + batchSize);
        try {
            const resp = makeApiCall(CONFIG.FB_API_BASE, { access_token: account.access_token, ids: batch.join(','), fields: fields.join(',') }, account.name);
            Object.keys(resp).forEach(function(id) { infoMap[id] = resp[id]; });
        } catch (err) { batch.forEach(function(id) { infoMap[id] = { error: 'Batch Failed' }; }); }
    }
    return infoMap;
}

function getAccountInsights(account, dateRange, enabledFields, shouldFetchStatus) {
    const url = CONFIG.FB_API_BASE + account.ad_account_id + '/insights';
    const timeRange = JSON.stringify({ since: dateRange.startDate, until: dateRange.endDate });
    const apiFields = new Set(['date_start', 'account_name', 'campaign_id', 'campaign_name', 'adset_id', 'adset_name', 'ad_id', 'ad_name']);
    enabledFields.forEach(function(f) {
        if (f.apiName.startsWith('calculated:')) return;
        if (f.apiName.startsWith('actions:')) apiFields.add('actions');
        else if (f.apiName.startsWith('action_values:')) apiFields.add('action_values');
        else apiFields.add(f.apiName);
    });
    const params = { access_token: account.access_token, fields: Array.from(apiFields).join(','), time_increment: 1, level: 'ad', action_breakdowns: ['action_type'], time_range: timeRange, limit: 1000 };
    const response = makeApiCall(url, params, account.name);
    const data = response.data || [];
    if (data.length === 0) return [];
    let cMap = {}, aMap = {}, adMap = {};
    if (shouldFetchStatus) {
        const cIds = [...new Set(data.map(function(i) { return i.campaign_id; }).filter(Boolean))];
        const aIds = [...new Set(data.map(function(i) { return i.adset_id; }).filter(Boolean))];
        const adIds = [...new Set(data.map(function(i) { return i.ad_id; }).filter(Boolean))];
        cMap = getObjectsInfo(account, cIds, ['effective_status']);
        aMap = getObjectsInfo(account, aIds, ['effective_status', 'daily_budget']);
        adMap = getObjectsInfo(account, adIds, ['effective_status', 'creative{actor_id,effective_object_story_id}']);
    }
    return data.map(function(item) {
        let cSt = 'Khong ap dung', aSt = 'Khong ap dung', adSt = 'Khong ap dung', dBudget = 0, postUrl = '', pageId = '';
        if (shouldFetchStatus && adMap[item.ad_id]) {
            if (adMap[item.ad_id].creative) {
                pageId = adMap[item.ad_id].creative.actor_id || '';
                const pid = adMap[item.ad_id].creative.effective_object_story_id;
                if (pid) postUrl = 'https://www.facebook.com/' + pid;
            }
            const cs = translateDeliveryStatus(cMap[item.campaign_id] && cMap[item.campaign_id].effective_status);
            const as2 = translateDeliveryStatus(aMap[item.adset_id] && aMap[item.adset_id].effective_status);
            const ads = translateDeliveryStatus(adMap[item.ad_id].effective_status);
            dBudget = parseStandardValue(aMap[item.adset_id] && aMap[item.adset_id].daily_budget);
            cSt = cs;
            if (cs !== 'Dang hoat dong') { aSt = cs; adSt = cs; }
            else { aSt = as2; adSt = (as2 !== 'Dang hoat dong') ? as2 : ads; }
        }
        const ri = { date: item.date_start, account_name: item.account_name || account.name, account_id: account.ad_account_id, campaign_name: item.campaign_name || '', campaign_id: item.campaign_id || '', adset_name: item.adset_name || '', adset_id: item.adset_id || '', ad_name: item.ad_name || '', ad_id: item.ad_id || '', daily_budget: dBudget, campaign_status: cSt, adset_status: aSt, ad_status: adSt, post_link: postUrl, page_id: pageId };
        enabledFields.forEach(function(field) {
            let v = 0;
            if (field.apiName.startsWith('actions:')) v = getActionValue(item.actions, [field.apiName.substring(8)]);
            else if (field.apiName.startsWith('action_values:')) v = getActionValuesValue(item.action_values, [field.apiName.substring(14)]);
            else if (field.apiName.startsWith('video_p')) v = getComplexValue(item[field.apiName], 'video_view');
            else if (field.apiName === 'video_thruplay_watched_actions') v = getComplexValue(item[field.apiName], 'thruplay');
            else if (!field.apiName.startsWith('calculated:')) v = parseStandardValue(item[field.apiName] || 0);
            ri[field.apiName] = v;
        });
        const spend = ri['spend'] || 0; const clicks = ri['clicks'] || 0;
        ri['calculated:cpc'] = clicks > 0 ? spend / clicks : 0;
        ri['calculated:cost_per_comment'] = ri['actions:comment'] > 0 ? spend / ri['actions:comment'] : 0;
        ri['calculated:cost_per_photo_view'] = ri['actions:photo_view'] > 0 ? spend / ri['actions:photo_view'] : 0;
        ri['calculated:cost_per_messaging'] = ri['actions:onsite_conversion.messaging_conversation_started_7d'] > 0 ? spend / ri['actions:onsite_conversion.messaging_conversation_started_7d'] : 0;
        ri['calculated:total_purchases'] = (ri['actions:purchase'] || 0) + (ri['actions:offsite_conversion.fb_pixel_purchase'] || 0) + (ri['actions:onsite_conversion.purchase'] || 0);
        ri['calculated:total_purchase_value'] = (ri['action_values:purchase'] || 0) + (ri['action_values:offsite_conversion.fb_pixel_purchase'] || 0) + (ri['action_values:onsite_conversion.purchase'] || 0);
        return ri;
    });
}

function fetchAndProcessData(accounts, dateRange, enabledFields, shouldFetchStatus) {
    try {
        const active = accounts.filter(function(acc) { return acc.active; });
        if (active.length === 0) { console.warn("Khong co tai khoan nao."); return null; }
        const allData = [];
        active.forEach(function(acc) {
            try { const data = getAccountInsights(acc, dateRange, enabledFields, shouldFetchStatus); if (data && data.length > 0) allData.push({ account: acc, data: data }); }
            catch (e) { throw new Error('Loi tai khoan ' + acc.name + ': ' + e.message); }
        });
        if (allData.length === 0) return null;
        return { allData: allData, enabledFields: enabledFields };
    } catch (error) { throw error; }
}

function fetchAdAccounts(userToken) {
    const url = CONFIG.FB_API_BASE + 'me/adaccounts?fields=name,account_id&limit=500&access_token=' + encodeURIComponent(userToken);
    const result = JSON.parse(UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true }).getContentText());
    if (result.error) throw new Error('Loi API Facebook: ' + result.error.message);
    return result.data ? result.data.map(function(acc) { return { name: acc.name, id: acc.account_id }; }) : [];
}

function fetchAndProcessComments(postId, userToken) {
    let allComments = [];
    let nextUrl = CONFIG.FB_API_BASE + postId + '/comments?fields=message,from,created_time&limit=100&access_token=' + encodeURIComponent(userToken);
    try {
        while (nextUrl) {
            const resp = UrlFetchApp.fetch(nextUrl, { muteHttpExceptions: true });
            const result = JSON.parse(resp.getContentText());
            if (result.error) throw new Error('Loi API: ' + result.error.message);
            if (result.data) allComments = allComments.concat(result.data);
            nextUrl = result.paging ? result.paging.next : null;
        }
        return allComments;
    } catch (e) { throw e; }
}

function performBudgetUpdate(adsetId, newBudget, token) {
    const budgetInt = parseInt(newBudget, 10);
    if (isNaN(budgetInt)) throw new Error("Gia tri ngan sach khong hop le.");
    const result = JSON.parse(UrlFetchApp.fetch(CONFIG.FB_API_BASE + adsetId, { method: 'post', payload: { daily_budget: budgetInt, access_token: token }, muteHttpExceptions: true }).getContentText());
    if (result.success === true) return 'Cap nhat ngan sach thanh cong.';
    else if (result.error) throw new Error('Loi API: ' + result.error.message);
    throw new Error("Phan hoi khong xac dinh.");
}

function doGet(e) {
    const params = e.parameter; const account = params.account || "";
    let fromDate, toDate;
    if (params.from && params.to) { fromDate = parseVNDate(params.from); toDate = parseVNDate(params.to); }
    else if (params.date) { fromDate = toDate = parseVNDate(params.date); }
    else { fromDate = toDate = parseVNDate(getTodayVN()); }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("datamaster");
    const data = sheet.getDataRange().getValues(); const headers = data[0];
    const filtered = data.slice(1).filter(function(row) {
        if (!row[0]) return false; const rd = new Date(row[0]); rd.setHours(0,0,0,0);
        return rd >= fromDate && rd <= toDate && (account === "" || row[2].toString().toLowerCase().includes(account.toLowerCase()));
    });
    const result = filtered.map(function(row) { const obj = {}; headers.forEach(function(h, i) { obj[h] = row[i]; }); return obj; });
    return ContentService.createTextOutput(JSON.stringify({ from: params.from || params.date, to: params.to || params.date, account: account || "all", total_rows: result.length, data: result })).setMimeType(ContentService.MimeType.JSON);
}

function parseVNDate(str) {
    const parts = str.split("/");
    const date = new Date(parts[2] + '-' + parts[1] + '-' + parts[0] + 'T00:00:00+07:00');
    date.setHours(0,0,0,0); return date;
}

function getTodayVN() {
    const now = new Date(); const vn = new Date(now.getTime() + 7 * 3600000);
    return String(vn.getUTCDate()).padStart(2,"0") + "/" + String(vn.getUTCMonth()+1).padStart(2,"0") + "/" + vn.getUTCFullYear();
}
