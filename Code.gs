// Script Properties needed: BOT (Telegram bot token), CHAT (group chat id), TOKEN (your secret password)
const P = PropertiesService.getScriptProperties();
const COLS = ['id','created','name','phone','address','suburb','service','bins','plan','day','notes','tier','status'];
const sh = () => SpreadsheetApp.getActive().getSheetByName('Bookings') || SpreadsheetApp.getActive().insertSheet('Bookings');
const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const rows = () => { const v = sh().getDataRange().getValues(); return v.slice(1).map(r => { const o = {}; COLS.forEach((c, i) => o[c] = r[i]); return o; }); };
function tg(text, kb) {
  UrlFetchApp.fetch('https://api.telegram.org/bot' + P.getProperty('BOT') + '/sendMessage', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ chat_id: P.getProperty('CHAT'), text: text, reply_markup: kb })
  });
}
function setStatus(id, status) {
  const s = sh(), v = s.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]) === String(id)) { s.getRange(i + 1, 13).setValue(status); return rows()[i - 1]; }
}
function doGet(e) {
  const a = e.parameter.action;
  if (a === 'prices') return out(JSON.parse(P.getProperty('PRICES') || '{}'));
  if (a === 'list' && e.parameter.token === P.getProperty('TOKEN')) return out(rows());
  return out({ error: 'denied' });
}
function doPost(e) {
  const b = JSON.parse(e.postData.contents);
  if (b.callback_query) {                                   // owner tapped a Telegram button
    const [k, id] = b.callback_query.data.split(':');
    const r = setStatus(id, k === 'a' ? 'Confirmed' : 'Declined');
    if (r && k === 'a') {
      let ph = String(r.phone).replace(/\D/g, ''); if (ph[0] === '0') ph = '27' + ph.slice(1);
      const msg = 'Hi ' + r.name + ', BlinkBin here. Your ' + r.service + ' booking (' + r.day + ') is confirmed. We will message the exact time shortly.';
      tg('Confirmed #' + id + '. Tap to message ' + r.name + ':\nhttps://wa.me/' + ph + '?text=' + encodeURIComponent(msg));
    } else if (r) tg('Declined #' + id + ' (' + r.name + '). Please let them know.');
    return out({ ok: 1 });
  }
  if (b.action === 'book') {
    const c = CacheService.getScriptCache(), key = 'rl' + String(b.phone).replace(/\D/g, '');
    if (b.hp || !b.consent || !b.name || String(b.phone).replace(/\D/g, '').length < 10 || c.get(key)) return out({ ok: false });
    c.put(key, '1', 60);
    const id = Date.now();
    sh().appendRow([id, new Date(), b.name, b.phone, b.address, b.suburb, b.service, b.bins, b.plan, b.day, b.notes || '', b.tier, 'New']);
    const near = rows().filter(r => r.suburb === b.suburb && r.id !== id && (r.status === 'New' || r.status === 'Confirmed')).length;
    tg('New booking #' + id + '\n' + b.name + ' · ' + b.phone + '\n' + b.service + ' · ' + b.bins + ' bin(s) · ' + b.plan +
       '\n' + b.address + ', ' + b.suburb + '\nPrefers: ' + b.day + '\nRoute fit: ' + near + ' other open booking(s) in ' + b.suburb,
       { inline_keyboard: [[{ text: 'Accept', callback_data: 'a:' + id }, { text: 'Decline', callback_data: 'd:' + id }]] });
    return out({ ok: true });
  }
  if (b.token !== P.getProperty('TOKEN')) return out({ error: 'denied' });   // owner-only actions below
  if (b.action === 'prices') P.setProperty('PRICES', JSON.stringify({ prices: b.prices, plans: b.plans, tiers: b.tiers, terms: b.terms }));
  if (b.action === 'status') setStatus(b.id, b.status);
  return out({ ok: true });
}
