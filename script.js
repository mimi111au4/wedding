document.addEventListener("DOMContentLoaded", function () {

  /* =================================
     01. 首頁開啟喜帖
  ================================= */

  const openButton = document.getElementById("openInvitation");
  const heroSection = document.getElementById("home");
  const invitationContent = document.getElementById("invitationContent");

  if (openButton && heroSection && invitationContent) {
    openButton.addEventListener("click", function () {

      if (openButton.disabled) return;

      openButton.disabled = true;
      openButton.classList.add("is-open");          // 拆信封動畫（約 1.5 秒）
      if (window.v2Petals) {
        const r = openButton.getBoundingClientRect();
        window.v2Petals(r.left + r.width / 2, r.top + r.height / 2, 22);
      }
      setTimeout(function () { heroSection.classList.add("is-closing"); }, 1500);

      setTimeout(function () {

        heroSection.style.display = "none";
        invitationContent.style.display = "block";

        requestAnimationFrame(function () {
          invitationContent.classList.add("active");

          window.scrollTo({
            top: 0,
            behavior: "instant"
          });
        });

      }, 2200);

    });
  }


  // 沒有「開啟喜帖」按鈕時：封面與內容連續呈現，直接顯示內容
  if (!openButton && heroSection && invitationContent) {
    invitationContent.style.display = "block";
    requestAnimationFrame(function () { invitationContent.classList.add("active"); });
  }


  /* =================================
     02. 婚禮倒數
  ================================= */

  const weddingDate = new Date(2026, 10, 30, 12, 0, 0).getTime();

  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");

  function updateCountdown() {

    if (
      !daysElement ||
      !hoursElement ||
      !minutesElement ||
      !secondsElement
    ) return;

    const now = new Date().getTime();
    const difference = weddingDate - now;

    if (difference <= 0) {
      daysElement.textContent = "000";
      hoursElement.textContent = "00";
      minutesElement.textContent = "00";
      secondsElement.textContent = "00";
      return;
    }

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) /
      (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) /
      (1000 * 60)
    );

    const seconds = Math.floor(
      (difference % (1000 * 60)) / 1000
    );

    daysElement.textContent = String(days).padStart(2, "0");
    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");
  }

  if (
    daysElement &&
    hoursElement &&
    minutesElement &&
    secondsElement
  ) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }


  /* =================================
     03. 翻書相本
  ================================= */

  const book = document.getElementById("book");
  const bookStage = document.getElementById("bookStage");
  const leaves = book ? Array.from(book.querySelectorAll(".leaf")) : [];
  const photos = book ? Array.from(book.querySelectorAll("img.photo")) : [];
  const albumPrev = document.getElementById("albumPrev");
  const albumNext = document.getElementById("albumNext");
  const albumCounter = document.getElementById("albumCounter");
  const albumProgress = document.getElementById("albumProgress");
  const total = leaves.length;
  let state = 0;

  function renderBook() {
    if (!book) return;
    leaves.forEach(function (leaf, i) {
      const flipped = i < state;
      leaf.classList.toggle("flipped", flipped);
      leaf.style.zIndex = flipped ? i + 1 : total - i;
    });
    book.classList.toggle("is-start", state === 0);
    book.classList.toggle("is-end", state === total);
    if (albumCounter) {
      albumCounter.textContent =
       
        String(state).padStart(2, "0") + " / " + String(total - 1).padStart(2, "0");
    }
    if (albumProgress) albumProgress.style.width = (state / total * 100) + "%";
  }
  // 初始化：一載入就先設定每一頁的層級，否則最後一頁會蓋在封面上面
  renderBook();

  function turnNext() { if (state < total) { state++; renderBook(); } }
  function turnPrev() { if (state > 0) { state--; renderBook(); } }

  if (albumNext) albumNext.addEventListener("click", turnNext);
  if (albumPrev) albumPrev.addEventListener("click", turnPrev);

  // 滑動 / 拖曳翻頁（手機與滑鼠）
  let dragStartX = null;
  let dragged = false;
  if (bookStage) {
    bookStage.addEventListener("pointerdown", function (e) {
      dragStartX = e.clientX; dragged = false;
    });
    bookStage.addEventListener("pointerup", function (e) {
      if (dragStartX === null) return;
      const dx = e.clientX - dragStartX;
      dragStartX = null;
      if (Math.abs(dx) > 40) {
        dragged = true;
        if (dx < 0) turnNext(); else turnPrev();
      }
    });
    bookStage.addEventListener("pointercancel", function () { dragStartX = null; });

        // 點擊：封面翻開、結尾頁回封面、頁面兩側翻頁（電腦）、點照片放大
    bookStage.addEventListener("click", function (e) {
      if (dragged) { dragged = false; return; }
      if (e.target.closest(".cover")) { turnNext(); return; }
      if (e.target.closest(".end-page")) { state = 0; renderBook(); return; }
      const zone = e.target.closest(".turn-zone");
      if (zone) {
        // 以點擊位置判斷方向：點書的左半邊往前翻，右半邊往後翻
        const r = book.getBoundingClientRect();
        if (e.clientX < r.left + r.width / 2) turnPrev(); else turnNext();
        return;
      }
      const photo = e.target.closest("img.photo");
      if (photo) openViewer(photos.indexOf(photo));
    });
  }

  // 電腦版：每頁外側加一條可點擊翻頁的區域
  if (book) {
    book.querySelectorAll(".face.page").forEach(function (face) {
      const zone = document.createElement("span");
      zone.className = "turn-zone";
      zone.setAttribute("aria-hidden", "true");
      face.appendChild(zone);
    });
  }

  // 電腦版：鍵盤左右鍵翻頁（放大視窗開著時不處理）
  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const viewer = document.getElementById("albumViewer");
    if (viewer && viewer.classList.contains("open")) return;
    if (!bookStage) return;
    const r = bookStage.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;      // 相本不在畫面內就不翻
    if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) return;
    if (e.key === "ArrowRight") turnNext(); else turnPrev();
  });


  /* =================================
     04. 全螢幕照片檢視
  ================================= */

  const albumViewer = document.getElementById("albumViewer");
  const viewerImage = document.getElementById("viewerImage");
  const viewerCounter = document.getElementById("viewerCounter");
  let viewerIndex = 0;

  function showViewer() {
    if (!viewerImage || photos.length === 0) return;
    viewerImage.src = photos[viewerIndex].src;
    if (viewerCounter) {
      viewerCounter.textContent =
        String(viewerIndex + 1).padStart(2, "0") + " / " + String(photos.length).padStart(2, "0");
    }
  }
  function openViewer(i) {
    if (!albumViewer || i < 0) return;
    viewerIndex = i; showViewer();
    albumViewer.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeViewer() {
    if (!albumViewer) return;
    albumViewer.classList.remove("open");
    document.body.style.overflow = "";
  }
  function viewerStep(d) {
    viewerIndex = (viewerIndex + d + photos.length) % photos.length;
    showViewer();
  }

  const vClose = document.getElementById("viewerClose");
  const vPrev = document.getElementById("viewerPrev");
  const vNext = document.getElementById("viewerNext");
  if (vClose) vClose.addEventListener("click", closeViewer);
  if (vPrev) vPrev.addEventListener("click", function () { viewerStep(-1); });
  if (vNext) vNext.addEventListener("click", function () { viewerStep(1); });
  if (albumViewer) {
    albumViewer.addEventListener("click", function (e) { if (e.target === albumViewer) closeViewer(); });
    let vx = 0;
    albumViewer.addEventListener("touchstart", function (e) { vx = e.changedTouches[0].screenX; }, { passive: true });
    albumViewer.addEventListener("touchend", function (e) {
      const d = e.changedTouches[0].screenX - vx;
      if (Math.abs(d) < 50) return;
      viewerStep(d < 0 ? 1 : -1);
    }, { passive: true });
  }
  document.addEventListener("keydown", function (e) {
    if (!albumViewer || !albumViewer.classList.contains("open")) return;
    if (e.key === "Escape") closeViewer();
    else if (e.key === "ArrowRight") viewerStep(1);
    else if (e.key === "ArrowLeft") viewerStep(-1);
  });


  /* =================================
     05. RSVP 出席互動
     固定畫面 Modal 版本
  ================================= */

  const attendButton = document.getElementById("attendButton");
  const declineButton = document.getElementById("declineButton");

  const rsvpButtonArea = document.getElementById("rsvpButtonArea");
  const rsvpMessage = document.getElementById("rsvpMessage");

  const attendFormWrapper = document.getElementById("attendFormWrapper");
  const declineFormWrapper = document.getElementById("declineFormWrapper");
  const declineModal = document.getElementById("declineModal");

  const reconsiderButton = document.getElementById("reconsiderButton");
  const confirmDeclineButton = document.getElementById("confirmDeclineButton");

  const attendForm = document.getElementById("attendForm");
  const declineForm = document.getElementById("declineForm");

  const closeButtons = document.querySelectorAll("[data-close]");

  // 開啟視窗
  function openModal(modal) {

    if (!modal) return;

    modal.classList.add("show");
  }

  // 關閉視窗
  function closeModal(modal) {

    if (!modal) return;

    modal.classList.remove("show");
  }

  // 關閉叉叉
  closeButtons.forEach(function (button) {

    button.addEventListener("click", function () {

      const modal = document.getElementById(button.dataset.close);
      closeModal(modal);

    });

  });

  // 點擊黑色背景關閉
  [attendFormWrapper, declineModal, declineFormWrapper]
    .forEach(function (modal) {

      if (!modal) return;

      modal.addEventListener("click", function (event) {

        if (event.target === modal) {
          closeModal(modal);
        }

      });

    });

  // 欣然赴約
  if (attendButton) {

    attendButton.addEventListener("click", function () {

      if (rsvpMessage) {
        rsvpMessage.textContent = "";
      }

      openModal(attendFormWrapper);

    });

  }

  // 不克參加：提示文字
  let dodgeCount = 0;

  const messages = [
    "等等！你是不是按錯了？！😱",
    "什麼？！你真的要拒絕我們嗎！😭",
    "這可是我們人生的大日子欸！！🥺",
    "不行！我不能接受這個事實！！💔",
    "好吧……看來我們必須面對現實了……🥀"
  ];

  // 按鈕躲避
  function moveDeclineButton() {

    if (!declineButton || !rsvpButtonArea) return;

    const section = rsvpButtonArea.parentElement;

    if (!section) return;

    const sectionRect = section.getBoundingClientRect();
    const buttonRect = declineButton.getBoundingClientRect();

    const padding = 10;

    const minX = -rsvpButtonArea.offsetLeft + padding;

    const maxX =
      sectionRect.width -
      rsvpButtonArea.offsetLeft -
      buttonRect.width -
      padding;

    const minY = -rsvpButtonArea.offsetTop + padding;

    const maxY =
      sectionRect.height -
      rsvpButtonArea.offsetTop -
      buttonRect.height -
      padding;

    const randomX =
      minX + Math.random() * Math.max(0, maxX - minX);

    const randomY =
      minY + Math.random() * Math.max(0, maxY - minY);

    declineButton.style.position = "absolute";
    declineButton.style.left = randomX + "px";
    declineButton.style.top = randomY + "px";
  }

  // 點擊不克參加
  if (declineButton) {

    declineButton.addEventListener("click", function () {

      if (dodgeCount >= 5) { openModal(declineModal); return; }

      dodgeCount++;

      if (dodgeCount < 5) {

        if (rsvpMessage) {
          rsvpMessage.textContent = messages[dodgeCount - 1];
        }

        moveDeclineButton();

      } else {

        if (rsvpMessage) {
          rsvpMessage.textContent = "";
        }

        declineButton.style.position = "static";
        declineButton.style.left = "";
        declineButton.style.top = "";

        // 直接在目前畫面顯示提示
        openModal(declineModal);
      }

    });

  }

  // 再考慮一下
  if (reconsiderButton) {

    reconsiderButton.addEventListener("click", function () {

      closeModal(declineModal);

      dodgeCount = 0;

      if (declineButton) {
        declineButton.textContent = "不克參加";
        declineButton.style.position = "static";
        declineButton.style.left = "";
        declineButton.style.top = "";
      }

      if (rsvpMessage) {
        rsvpMessage.textContent = "感謝你願意再考慮一下 ♡";
      }

    });

  }

  // 確定不克參加
  if (confirmDeclineButton) {

    confirmDeclineButton.addEventListener("click", function () {

      closeModal(declineModal);
      openModal(declineFormWrapper);

    });

  }

  // ===== 回覆資料送出（Google 試算表）=====
  // 網址在 index.html 最下方的 window.RSVP_ENDPOINT 設定
  const RSVP_ENDPOINT = window.RSVP_ENDPOINT || "";

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 500);
  }

  function setFormStatus(form, text) {
    let el = form.querySelector(".form-status");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-status";
      el.setAttribute("aria-live", "polite");
      form.appendChild(el);
    }
    el.textContent = text;
  }

  async function sendRsvp(form, status, successText) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const data = new FormData(form);

    const payload = {
      status: status,                       // 出席 / 不克出席
      name: clean(data.get("name")),
      count: clean(data.get("count")),
      diet: clean(data.get("diet")),
      note: clean(data.get("note")),
      website: clean(data.get("website"))   // 防機器人欄位，真人不會填
    };

    if (!payload.name) {
      setFormStatus(form, "請填寫姓名");
      return;
    }

    // 尚未設定網址：練習模式，明確告知資料沒有被儲存
    if (!RSVP_ENDPOINT) {
      console.warn("[RSVP] 尚未設定 window.RSVP_ENDPOINT，資料不會被儲存：", payload);
      finishRsvp(form, "（練習模式）已收到，但資料尚未儲存，請先設定回覆網址。");
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.label = submitBtn.textContent; submitBtn.textContent = "送出中…"; }
    setFormStatus(form, "");

    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 15000);

    try {
      // text/plain + no-cors：不會觸發 CORS 預檢，Apps Script 可直接接收
      await fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      finishRsvp(form, successText);
    } catch (err) {
      setFormStatus(form, "送出失敗，請檢查網路後再試一次。");
    } finally {
      clearTimeout(timer);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label || "送出回覆"; }
    }
  }

  function finishRsvp(form, message) {
    form.reset();
    setFormStatus(form, "");
    closeModal(attendFormWrapper);
    closeModal(declineFormWrapper);
    if (rsvpMessage) rsvpMessage.textContent = message;
  }

  // 出席表單送出
  if (attendForm) {
    attendForm.addEventListener("submit", function (event) {
      event.preventDefault();
      sendRsvp(attendForm, "出席", "已收到你的回覆，我們等你來！♡");
    });
  }

  // 婉拒表單送出
  if (declineForm) {
    declineForm.addEventListener("submit", function (event) {
      event.preventDefault();
      sendRsvp(declineForm, "不克出席", "謝謝你的回覆，我們會想念你 ♡");
    });
  }

  // ESC 關閉
  document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
      closeModal(attendFormWrapper);
      closeModal(declineModal);
      closeModal(declineFormWrapper);
    }

  });


  /* =================================
     06. 婚禮資訊滑動動畫
  ================================= */

  const detailsSection = document.querySelector(".wedding-details");

  if (
    detailsSection &&
    "IntersectionObserver" in window
  ) {

    const observer = new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {

          if (entry.isIntersecting) {

            detailsSection.classList.add("show-animation");

            observer.unobserve(detailsSection);
          }

        });

      },
      {
        threshold: 0.15
      }
    );

    observer.observe(detailsSection);
  }

});


/* 07. 全頁捲動淡入 */
document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  items.forEach(function (el) { io.observe(el); });
});


/* 08. 背景音樂 + 加入行事曆 */
document.addEventListener("DOMContentLoaded", function () {
  const bgm = document.getElementById("bgm");
  const toggle = document.getElementById("musicToggle");
  const openBtn = document.getElementById("openInvitation");

  function setPlaying(on) {
    if (!toggle) return;
    toggle.classList.toggle("playing", on);
  }
  if (bgm && toggle) {
    bgm.volume = 0.35;   // 預設小聲一點，賓客在公共場所打開才不會尷尬
    bgm.addEventListener("error", function () { toggle.hidden = true; });   // 沒有音樂檔就不顯示按鈕
    if (!openBtn) {
      // 沒有開啟按鈕：賓客第一次點擊／觸碰畫面時開始播放（瀏覽器規定需要使用者操作）
      toggle.hidden = false;
      const startOnGesture = function () {
        bgm.play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
        ["click", "touchend", "keydown"].forEach(function (t) { document.removeEventListener(t, startOnGesture); });
      };
      ["click", "touchend", "keydown"].forEach(function (t) { document.addEventListener(t, startOnGesture); });
    }
    if (openBtn) {
      openBtn.addEventListener("click", function () {
        toggle.hidden = false;
        // 使用者剛點擊，瀏覽器允許播放
        bgm.play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
      });
    }
    // 離開頁面（切到別的 App、鎖螢幕、切換分頁、關閉）就暫停音樂，回來時自動接著播
    let resumeAfterReturn = false;

    function pauseForLeave() {
      if (!bgm.paused) resumeAfterReturn = true;
      bgm.pause();
      setPlaying(false);
    }
    function resumeOnReturn() {
      if (!resumeAfterReturn) return;
      resumeAfterReturn = false;
      bgm.play().then(function () { setPlaying(true); }).catch(function () {});
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pauseForLeave(); else resumeOnReturn();
    });
    window.addEventListener("pagehide", pauseForLeave);
    window.addEventListener("pageshow", function (e) { if (e.persisted) resumeOnReturn(); });
    document.addEventListener("freeze", pauseForLeave);

    // 保險：有些瀏覽器（含 LINE）不會可靠地發出事件，改用定時檢查
    setInterval(function () {
      if (document.visibilityState === "hidden" && !bgm.paused) pauseForLeave();
    }, 500);

    toggle.addEventListener("click", function () {
      if (bgm.paused) {
        bgm.play().then(function () { setPlaying(true); }).catch(function () {});
      } else {
        bgm.pause(); setPlaying(false);
      }
    });
  }

  // 偵測 LINE 內建瀏覽器：無法下載檔案，提示賓客改用預設瀏覽器
  const lineHint = document.getElementById("lineHint");
  if (lineHint && /Line\//i.test(navigator.userAgent)) lineHint.hidden = false;

  const calBtn = document.getElementById("addCalendar");
  if (calBtn) {
    const d = calBtn.dataset;
    // 台灣時間 (+08:00) 轉成 UTC，格式 20261130T033000Z，各種行事曆都能正確讀取
    const toUtc = function (s) {
      return new Date(s + ":00+08:00").toISOString().replace(/[-:]|\.\d{3}/g, "");
    };

    // 備案：Google 日曆連結（LINE 內建瀏覽器無法下載檔案時使用）
    const gcal = document.getElementById("addGoogleCalendar");
    if (gcal) {
      gcal.href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent(d.title) +
        "&dates=" + toUtc(d.start) + "/" + toUtc(d.end) +
        "&location=" + encodeURIComponent(d.location);
    }

    calBtn.addEventListener("click", function () {
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//ZH",
        "BEGIN:VEVENT",
        "UID:wedding-" + toUtc(d.start) + "@invitation",
        "DTSTAMP:" + new Date().toISOString().replace(/[-:]|\.\d{3}/g, ""),
        "DTSTART:" + toUtc(d.start),
        "DTEND:" + toUtc(d.end),
        "SUMMARY:" + d.title,
        "LOCATION:" + d.location,
        "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:明天是婚禮喜宴", "END:VALARM",
        "END:VEVENT", "END:VCALENDAR"
      ].join("\r\n");
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = "wedding.ics";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }
});
/* =================================
   09. 分享與複製婚禮喜帖
================================= */

document.addEventListener("DOMContentLoaded", function () {

  const shareButton = document.getElementById("shareInvitation");
  const copyButton = document.getElementById("copyInvitation");
  const shareMessage = document.getElementById("shareMessage");

  // 取得目前喜帖網址
  // 固定乾淨網址，並加上 openExternalBrowser=1：在 LINE 點開時會自動改用手機預設瀏覽器
  const invitationUrl = window.location.origin + window.location.pathname + "?openExternalBrowser=1";

  // 分享喜帖
  if (shareButton) {

    shareButton.addEventListener("click", async function () {

      const shareData = {
        title: document.title,
        text: "誠摯邀請您參加我們的婚禮，一起分享這份幸福！",
        url: invitationUrl
      };

      if (navigator.share) {

        try {

          await navigator.share(shareData);

          if (shareMessage) {
            shareMessage.textContent = "感謝您分享我們的喜帖 ♡";
          }

        } catch (error) {

          // 使用者取消分享時，不顯示錯誤
          if (error.name !== "AbortError" && shareMessage) {
            shareMessage.textContent = "分享功能暫時無法使用，請改用複製網址。";
          }

        }

      } else {

        // 電腦瀏覽器不支援系統分享時
        copyInvitationUrl();

      }

    });

  }

  // 複製網址
  async function copyInvitationUrl() {

    try {

      await navigator.clipboard.writeText(invitationUrl);

      if (shareMessage) {
        shareMessage.textContent = "喜帖網址已複製，快分享給親友吧！♡";
      }

    } catch (error) {

      // 備用複製方式
      const textarea = document.createElement("textarea");

      textarea.value = invitationUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.select();

      const success = document.execCommand("copy");

      textarea.remove();

      if (shareMessage) {
        shareMessage.textContent = success
          ? "喜帖網址已複製，快分享給親友吧！♡"
          : "複製失敗，請手動複製網址。";
      }

    }

  }

  if (copyButton) {
    copyButton.addEventListener("click", copyInvitationUrl);
  }

});

/* =================================
   10. 信封：翻蓋打開、照片升起
================================= */
document.addEventListener("DOMContentLoaded", function () {
  const scene = document.querySelector(".envelope-scene");
  if (!scene) return;

  scene.classList.add("env-ready");   // 有 JS 才進入「先隱藏、再動畫」的狀態

  if (!("IntersectionObserver" in window)) {
    scene.classList.add("is-in");
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { scene.classList.add("is-in"); io.disconnect(); }
    });
  }, { threshold: 0.35 });
  io.observe(scene);
});


/* =========================================================
   視覺改版互動：花瓣、滑動揭示
========================================================= */
(function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const colors = ["#8c3a3a", "#a84d4d", "#c0675d", "#e4cfb4", "#f3e6d3", "#d9bb7e"];

  // 花瓣從 (x, y) 往四周飄散
  window.v2Petals = function (x, y, n) {
    if (reduce) return;
    n = n || 14;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      const ang = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 130;
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist * 0.7 + 60 + Math.random() * 80 + "px");
      p.style.setProperty("--rot", (Math.random() * 540 - 270) + "deg");
      p.style.setProperty("--t", (1.4 + Math.random() * 0.9) + "s");
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, 2600);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    // 點囍字、點「欣然赴約」撒花
    document.addEventListener("click", function (e) {
      const t = e.target.closest(".footer-xi, .invite-parents i, .xi-hint, #attendButton");
      if (t) window.v2Petals(e.clientX, e.clientY, 16);
    });

    // 滑動揭示：捲動到才依序淡入
    const sel = ".couple-photo-heading,.envelope-scene,.invite-parents,.details-heading,.detail-card,.schedule-actions,.countdown-heading,.countdown,.album-heading,.rsvp-heading,.rsvp-choice,.share-section h2,.share-description,.share-actions";
    const items = Array.prototype.slice.call(document.querySelectorAll(sel));

    // 邀請文：一行一行浮現
    const lineEls = [];
    const it = document.querySelector(".invite-text");
    if (it) {
      const lines = it.innerHTML.split(/<br\s*\/?>/i).map(function (t) { return t.trim(); }).filter(Boolean);
      it.innerHTML = lines.map(function (t) { return '<span class="v2-line">' + t + "</span>"; }).join("");
      it.querySelectorAll(".v2-line").forEach(function (el) { lineEls.push(el); });
    }

    // 倒數：秒、分數字變動時跳一下
    ["seconds", "minutes", "hours"].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el || reduce) return;
      let last = el.textContent;
      new MutationObserver(function () {
        if (el.textContent === last) return;
        last = el.textContent;
        el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });

    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("v2-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el, i) {
      el.classList.add("v2-rev");
      el.style.transitionDelay = (i % 3) * 0.12 + "s";
      io.observe(el);
    });
    lineEls.forEach(function (el, i) {
      el.classList.add("v2-rev");
      el.style.transitionDelay = i * 0.3 + "s";
      io.observe(el);
    });
  });
})();


/* =========================================================
   新互動：彩蛋（連點囍字三次）、倒數歸零、相本愛心
========================================================= */
(function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 愛心從 (x, y) 飄起 ----
  function hearts(x, y, n) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const h = document.createElement("span");
      h.className = "heart";
      h.textContent = "♥";
      h.style.left = x + (Math.random() * 30 - 15) + "px";
      h.style.top = y + "px";
      h.style.fontSize = 16 + Math.random() * 14 + "px";
      h.style.color = ["#c0575a", "#d9787a", "#a84d4d", "#e8a0a0"][i % 4];
      h.style.setProperty("--dx", Math.random() * 90 - 45 + "px");
      h.style.setProperty("--dy", -(90 + Math.random() * 110) + "px");
      h.style.setProperty("--rot", Math.random() * 60 - 30 + "deg");
      h.style.setProperty("--t", 1.2 + Math.random() * 0.8 + "s");
      document.body.appendChild(h);
      setTimeout(function () { h.remove(); }, 2300);
    }
  }

  window.v2Hearts = hearts;

  // ---- 花瓣雨（從畫面上方落下）----
  function rain(times) {
    if (reduce || !window.v2Petals) return;
    const colors = ["#8c3a3a", "#a84d4d", "#c0675d", "#e4cfb4", "#d9bb7e"];
    let k = 0;
    const timer = setInterval(function () {
      for (let i = 0; i < 6; i++) {
        const p = document.createElement("span");
        p.className = "petal fall";
        p.style.left = Math.random() * 100 + "vw";
        p.style.background = colors[(k + i) % colors.length];
        p.style.setProperty("--dx", Math.random() * 120 - 60 + "px");
        p.style.setProperty("--rot", Math.random() * 720 - 360 + "deg");
        p.style.setProperty("--t", 3.5 + Math.random() * 2 + "s");
        document.body.appendChild(p);
        setTimeout(function () { p.remove(); }, 6000);
      }
      if (++k >= times) clearInterval(timer);
    }, 260);
  }

  document.addEventListener("DOMContentLoaded", function () {

    // ---- 相本：點照片飄愛心（滑動翻頁時不觸發）----
    let downX = 0, downY = 0;
    document.addEventListener("pointerdown", function (e) { downX = e.clientX; downY = e.clientY; }, true);
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest("#book img.photo")) return;
      if (Math.abs(e.clientX - downX) > 10 || Math.abs(e.clientY - downY) > 10) return;
      hearts(e.clientX, e.clientY, 7);
    }, true);
    // 放大檢視時：連點兩下送一大串愛心
    const vImg = document.getElementById("viewerImage");
    if (vImg) vImg.addEventListener("dblclick", function (e) { hearts(e.clientX, e.clientY, 14); });

    // ---- 彩蛋：連點囍字三次（含提示鈕進度）----
    let taps = [];
    const xiBtn = document.getElementById("xiHint");
    const xiTxt = xiBtn && xiBtn.querySelector(".xi-hint-text");
    const xiDots = xiBtn ? xiBtn.querySelectorAll(".xi-dots i") : [];
    const xiEl = document.querySelector(".footer-xi");
    const xiDefault = xiTxt ? xiTxt.textContent : "";
    let xiTimer = 0;
    function xiUpdate(n) {
      if (!xiBtn) return;
      xiBtn.setAttribute("data-n", n);
      xiDots.forEach(function (d, i) { d.classList.toggle("on", i < n); });
      xiTxt.textContent = n === 1 ? "再按 2 下" : n === 2 ? "再 1 下就好！" : n === 3 ? "彩蛋解鎖 ♡" : xiDefault;
      clearTimeout(xiTimer);
      if (n > 0) xiTimer = setTimeout(function () { xiUpdate(0); }, n === 3 ? 2600 : 1300);
    }
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest(".footer-xi, .invite-parents i, .xi-hint")) return;
      const now = Date.now();
      taps = taps.filter(function (t) { return now - t < 1200; });
      taps.push(now);
      if (xiEl && e.target.closest(".footer-xi, .xi-hint")) {
        xiEl.classList.remove("xi-bump"); void xiEl.offsetWidth; xiEl.classList.add("xi-bump");
        xiUpdate(Math.min(taps.length, 3));
      }
      if (navigator.vibrate) navigator.vibrate(taps.length >= 3 ? [30, 40, 60] : 12);
      if (taps.length < 3) return;
      taps = [];
      if (document.querySelector(".egg")) return;
      const d = document.createElement("div");
      d.className = "egg";
      d.innerHTML = '<div class="egg-card"><em>囍</em><p>被你發現了！</p><span>謝謝你把喜帖看到這裡<br>願你也被滿滿的幸福包圍 ♡</span></div>';
      d.addEventListener("click", function () { d.remove(); });
      document.body.appendChild(d);
      if (window.v2Petals) window.v2Petals(window.innerWidth / 2, window.innerHeight / 2, 30);
      rain(10);
      setTimeout(function () { d.remove(); }, 5000);
    });

    // ---- 倒數歸零：婚禮當天變成慶祝畫面 ----
    const section = document.getElementById("countdown");
    const heading = section && section.querySelector(".countdown-heading");
    if (section && heading) {
      const target = new Date(2026, 10, 30, 12, 0, 0).getTime();
      let state = "";
      let rained = false;
      const note = document.createElement("p");
      note.className = "countdown-note";
      section.appendChild(note);

      const io = "IntersectionObserver" in window ? new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && state === "day" && !rained) { rained = true; rain(16); }
      }, { threshold: 0.3 }) : null;
      if (io) io.observe(section);

      function check() {
        const now = Date.now();
        const st = now < target ? "before" : (now < target + 864e5 ? "day" : "after");
        if (st === state) return;
        state = st;
        if (st === "before") return;
        section.classList.add("is-day");
        if (st === "day") {
          heading.innerHTML = "就是今天<br><span>Today Is The Day</span>";
          note.textContent = "今天，我們結婚了 ♡ 期待與你相見";
        } else {
          heading.innerHTML = "感謝你的祝福<br><span>Thank You For Celebrating</span>";
          note.textContent = "婚禮圓滿完成，謝謝你一路的陪伴 ♡";
        }
      }
      check();
      setInterval(check, 1000);
    }
  });
})();


/* =========================================================
   v5 互動：首頁信封 3D 傾斜、內頁信封點擊、分享愛心、閱讀進度線
========================================================= */
(function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  document.addEventListener("DOMContentLoaded", function () {

    // ---- 首頁信封：滑鼠／手指／手機傾斜時，信封跟著轉動 ----
    const env = document.getElementById("openInvitation");
    const hero = document.getElementById("home");
    if (env && hero && !reduce) {
      let raf = 0, lastPtr = 0;
      const setTilt = function (nx, ny) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          env.style.setProperty("--rx", (-ny * 9).toFixed(2) + "deg");
          env.style.setProperty("--ry", (nx * 12).toFixed(2) + "deg");
          env.style.setProperty("--sx", (-nx * 14).toFixed(1) + "px");
        });
      };
      const fromPointer = function (e) {
        if (env.classList.contains("is-open")) return;
        lastPtr = Date.now();
        const r = hero.getBoundingClientRect();
        setTilt(clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1),
                clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1));
      };
      hero.addEventListener("pointermove", fromPointer);
      hero.addEventListener("pointerdown", fromPointer);
      hero.addEventListener("pointerleave", function () { setTilt(0, 0); });
      hero.addEventListener("pointerup", function (e) {
        if (e.pointerType === "touch") setTimeout(function () { setTilt(0, 0); }, 500);
      });
      // 手機傾斜感應（iOS 需授權的就略過，不跳出詢問）
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function") {
        window.addEventListener("deviceorientation", function (e) {
          if (e.gamma == null || e.beta == null) return;
          if (env.classList.contains("is-open") || Date.now() - lastPtr < 1500) return;
          setTilt(clamp(e.gamma / 25, -1, 1), clamp((e.beta - 45) / 25, -1, 1));
        });
      }
    }

    // ---- 內頁信封：點照片或封泥 → 彈一下＋飄愛心 ----
    const scene = document.querySelector(".envelope-scene");
    if (scene) {
      scene.addEventListener("click", function (e) {
        const photo = e.target.closest(".couple-photo");
        const seal = e.target.closest(".envelope-seal");
        const t = photo || seal;
        if (!t) return;
        t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop");
        if (window.v2Hearts) window.v2Hearts(e.clientX, e.clientY, photo ? 8 : 12);
        if (navigator.vibrate) navigator.vibrate(10);
      });
    }

    // ---- 分享／複製：成功時從按鈕飄出愛心 ----
    ["shareInvitation", "copyInvitation"].forEach(function (id) {
      const b = document.getElementById(id);
      if (!b) return;
      b.addEventListener("click", function () {
        const r = b.getBoundingClientRect();
        if (window.v2Hearts) window.v2Hearts(r.left + r.width / 2, r.top + 6, 6);
      });
    });

    // ---- 頁面頂端閱讀進度金線（只在喜帖內頁出現）----
    const content = document.getElementById("invitationContent");
    if (content) {
      const bar = document.createElement("div");
      bar.className = "scroll-progress";
      bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);
      let ticking = false;
      const update = function () {
        ticking = false;
        const shown = getComputedStyle(content).display !== "none";
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (!shown || max <= 0) { bar.classList.remove("on"); return; }
        bar.style.setProperty("--p", clamp(window.scrollY / max, 0, 1).toFixed(4));
        bar.classList.add("on");
      };
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      window.addEventListener("resize", update);
    }
  });
})();
