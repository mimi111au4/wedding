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
      heroSection.classList.add("is-closing");

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

      }, 600);

    });
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
    if (openBtn) {
      openBtn.addEventListener("click", function () {
        toggle.hidden = false;
        // 使用者剛點擊，瀏覽器允許播放
        bgm.play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
      });
    }
    // 離開頁面（切到別的 App、鎖螢幕、切換分頁）就暫停音樂，回來時自動接著播
    let resumeAfterReturn = false;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        resumeAfterReturn = !bgm.paused;
        bgm.pause();
        setPlaying(false);
      } else if (resumeAfterReturn) {
        resumeAfterReturn = false;
        bgm.play().then(function () { setPlaying(true); }).catch(function () {});
      }
    });
    window.addEventListener("pagehide", function () { bgm.pause(); });

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
