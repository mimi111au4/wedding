/**
 * 喜帖 RSVP → Google 試算表
 *
 * 使用方式：
 * 1. 建立一份新的 Google 試算表
 * 2. 選單「擴充功能」→「Apps Script」，把這整段程式碼貼上（取代原本內容）並儲存
 * 3. 右上角「部署」→「新增部署作業」→ 類型選「網頁應用程式」
 *      執行身分：我
 *      誰可以存取：所有人
 * 4. 第一次部署會要求授權，照畫面允許即可
 * 5. 複製「網頁應用程式網址」（結尾是 /exec），貼到 index.html 最下方的
 *      window.RSVP_ENDPOINT = "這裡";
 *
 * 之後如果修改了這份程式碼，要重新「部署」→「管理部署作業」→ 編輯 → 新版本，才會生效。
 */

const SHEET_NAME = 'RSVP';
const HEADERS = ['送出時間', '姓名', '出席', '人數', '餐點', '祝福'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const p = JSON.parse(e.postData.contents);

    // 防機器人欄位：真人不會填，有值就直接忽略
    if (p.website) return reply_({ ok: true });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      safe_(p.name),
      safe_(p.status),
      safe_(p.count),
      safe_(p.diet),
      safe_(p.note)
    ]);
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 瀏覽器直接開網址時的測試畫面
function doGet() {
  return reply_({ ok: true, message: 'RSVP endpoint is running' });
}

// 避免賓客輸入「=」「+」「-」「@」開頭的文字被試算表當成公式執行
function safe_(v) {
  const s = String(v == null ? '' : v).slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
