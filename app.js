/**
 * Discord Message Scheduler - Web App JavaScript (v3 Overhaul)
 * Privacy-First Base64 Local Image Upload, iOS Alarm Picker, Live Discord Preview, Markdown Toolbar, and RSV1 / JSON Export
 */

(() => {
  'use strict';

  const WEEKDAYS_JP = ['月', '火', '水', '木', '金', '土', '日'];
  const WEEKDAYS_FULL_JP = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

  // --- State ---
  const state = {
    currentStep: 1,
    targetChannel: { id: '', name: '', guildId: '' },
    date: '',
    time: '',
    recurrence: {
      type: 'none',
      days: [] // 0: Mon, 1: Tue, ..., 6: Sun
    },
    messageType: 'embed', // 'embed' | 'plain'
    embed: {
      color: '#5865F2',
      author: { name: '', icon_url: '', url: '' },
      title: '',
      title_url: '',
      description: '',
      fields: [],
      thumbnail_url: '',
      image_url: '', // external URL fallback
      image_data: '', // Base64 data URL
      image_filename: '',
      image_size: 0,
      footer: { text: '', icon_url: '' }
    },
    plain: {
      content: '',
      image_url: '',
      image_data: '',
      image_filename: '',
      image_size: 0
    },
    buttons: [] // [{ id: string, label: string, url: string, emoji: string }]
  };

  // --- DOM Elements ---
  const el = {
    // Header
    themeToggle: document.getElementById('theme-toggle'),
    targetChannelBadge: document.getElementById('target-channel-badge'),
    targetChannelName: document.getElementById('target-channel-name'),
    targetChannelId: document.getElementById('target-channel-id'),
    btnOpenImport: document.getElementById('btn-open-import'),
    btnReset: document.getElementById('btn-reset'),

    // Wizard Navigation & Steps
    wizardStepBtns: document.querySelectorAll('.wizard-step-btn'),
    stepPanes: {
      1: document.getElementById('step-pane-1'),
      2: document.getElementById('step-pane-2'),
      3: document.getElementById('step-pane-3'),
    },
    btnStepNextList: document.querySelectorAll('.btn-step-next'),
    btnStepPrevList: document.querySelectorAll('.btn-step-prev'),

    // Mobile Navigation
    tabEdit: document.getElementById('tab-edit'),
    tabPreview: document.getElementById('tab-preview'),
    editorPane: document.getElementById('editor-container'),
    previewPane: document.getElementById('preview-container'),
    mobilePreviewFab: document.getElementById('mobile-preview-fab'),
    mobileFabText: document.getElementById('mobile-fab-text'),

    // Step 1: Schedule
    summaryCardMain: document.getElementById('summary-card-main'),
    summaryCardSub: document.getElementById('summary-card-sub'),
    datetimeWarning: document.getElementById('datetime-warning'),
    presetTimeChips: document.querySelectorAll('.preset-time-chip'),
    calPrevMonth: document.getElementById('cal-prev-month'),
    calNextMonth: document.getElementById('cal-next-month'),
    calMonthLabel: document.getElementById('cal-month-label'),
    calDaysGrid: document.getElementById('cal-days-grid'),
    quickDatePills: document.querySelectorAll('.date-pill-btn'),
    inputDate: document.getElementById('input-date'),

    // iOS Alarm-Style Time Picker
    timeDisplayBadge: document.getElementById('time-display-badge'),
    wheelHour: document.getElementById('wheel-hour'),
    wheelMinute: document.getElementById('wheel-minute'),
    stepperBtns: document.querySelectorAll('.picker-stepper'),
    inputTime: document.getElementById('input-time'),

    // Recurrence
    recurrenceType: document.getElementById('recurrence-type'),
    weeklyDaysContainer: document.getElementById('weekly-days-container'),
    weekdayCheckboxes: document.querySelectorAll('input[name="weekday"]'),

    // Step 2: Message Creation
    messageTypeInputs: document.querySelectorAll('input[name="message-type"]'),
    embedSettingsSection: document.getElementById('embed-settings-section'),
    plainSettingsSection: document.getElementById('plain-settings-section'),

    // Embed Form
    embedColorPicker: document.getElementById('embed-color-picker'),
    embedColorHex: document.getElementById('embed-color-hex'),
    embedTitle: document.getElementById('embed-title'),
    embedTitleUrl: document.getElementById('embed-title-url'),
    embedTitleCount: document.getElementById('embed-title-count'),
    embedDesc: document.getElementById('embed-desc'),
    embedDescCount: document.getElementById('embed-desc-count'),
    embedThumbnail: document.getElementById('embed-thumbnail'),
    embedImage: document.getElementById('embed-image'),
    authorBadge: document.getElementById('author-badge'),
    footerBadge: document.getElementById('footer-badge'),
    embedAuthorName: document.getElementById('embed-author-name'),
    embedAuthorIcon: document.getElementById('embed-author-icon'),
    embedAuthorUrl: document.getElementById('embed-author-url'),
    embedFooterText: document.getElementById('embed-footer-text'),
    embedFooterIcon: document.getElementById('embed-footer-icon'),
    fieldsList: document.getElementById('fields-list'),
    btnAddField: document.getElementById('btn-add-field'),

    // Embed Dropzone
    embedDropzone: document.getElementById('embed-dropzone'),
    embedDropzoneEmpty: document.getElementById('embed-dropzone-empty'),
    embedDropzoneLoaded: document.getElementById('embed-dropzone-loaded'),
    embedFileInput: document.getElementById('embed-file-input'),
    embedLoadedImg: document.getElementById('embed-loaded-img'),
    embedLoadedFilename: document.getElementById('embed-loaded-filename'),
    embedLoadedFilesize: document.getElementById('embed-loaded-filesize'),
    embedBtnRemoveImg: document.getElementById('embed-btn-remove-img'),

    // Plain Form
    plainContent: document.getElementById('plain-content'),
    plainContentCount: document.getElementById('plain-content-count'),
    plainImage: document.getElementById('plain-image'),

    // Plain Dropzone
    plainDropzone: document.getElementById('plain-dropzone'),
    plainDropzoneEmpty: document.getElementById('plain-dropzone-empty'),
    plainDropzoneLoaded: document.getElementById('plain-dropzone-loaded'),
    plainFileInput: document.getElementById('plain-file-input'),
    plainLoadedImg: document.getElementById('plain-loaded-img'),
    plainLoadedFilename: document.getElementById('plain-loaded-filename'),
    plainLoadedFilesize: document.getElementById('plain-loaded-filesize'),
    plainBtnRemoveImg: document.getElementById('plain-btn-remove-img'),

    // Link Buttons
    btnAddButton: document.getElementById('btn-add-button'),
    buttonsList: document.getElementById('buttons-list'),
    buttonsEmptyHint: document.getElementById('buttons-empty-hint'),

    // Step 3: Review & Actions
    reviewDatetime: document.getElementById('review-datetime'),
    reviewRecurrence: document.getElementById('review-recurrence'),
    reviewType: document.getElementById('review-type'),
    reviewImage: document.getElementById('review-image'),
    reviewButtonsCount: document.getElementById('review-buttons-count'),
    btnDownloadJson: document.getElementById('btn-download-json'),
    btnDownloadRsv: document.getElementById('btn-download-rsv'),
    downloadCompressionHint: document.getElementById('download-compression-hint'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    copyCodeWarning: document.getElementById('copy-code-warning'),

    // Live Preview
    previewChannelLabel: document.getElementById('preview-channel-label'),
    previewTimestamp: document.getElementById('preview-timestamp'),
    previewRecurrenceBadge: document.getElementById('preview-recurrence-badge'),
    previewPlainWrap: document.getElementById('preview-plain-wrap'),
    previewPlainText: document.getElementById('preview-plain-text'),
    previewPlainImageWrap: document.getElementById('preview-plain-image-wrap'),
    previewPlainImage: document.getElementById('preview-plain-image'),
    previewEmbedWrap: document.getElementById('preview-embed-wrap'),
    previewEmbedCard: document.getElementById('preview-embed-card'),
    previewEmbedPill: document.getElementById('preview-embed-pill'),
    previewEmbedAuthor: document.getElementById('preview-embed-author'),
    previewEmbedAuthorIcon: document.getElementById('preview-embed-author-icon'),
    previewEmbedAuthorLink: document.getElementById('preview-embed-author-link'),
    previewEmbedTitleWrap: document.getElementById('preview-embed-title-wrap'),
    previewEmbedTitleLink: document.getElementById('preview-embed-title-link'),
    previewEmbedDescWrap: document.getElementById('preview-embed-desc-wrap'),
    previewEmbedDesc: document.getElementById('preview-embed-desc'),
    previewEmptyHint: document.getElementById('preview-empty-hint'),
    previewEmbedFields: document.getElementById('preview-embed-fields'),
    previewEmbedThumbWrap: document.getElementById('preview-embed-thumb-wrap'),
    previewEmbedThumb: document.getElementById('preview-embed-thumb'),
    previewEmbedImageWrap: document.getElementById('preview-embed-image-wrap'),
    previewEmbedImage: document.getElementById('preview-embed-image'),
    previewEmbedFooter: document.getElementById('preview-embed-footer'),
    previewEmbedFooterIcon: document.getElementById('preview-embed-footer-icon'),
    previewEmbedFooterText: document.getElementById('preview-embed-footer-text'),
    previewEmbedFooterTime: document.getElementById('preview-embed-footer-time'),
    previewButtonsRow: document.getElementById('preview-buttons-row'),
    summaryNextTime: document.getElementById('summary-next-time'),
    summaryRecurrence: document.getElementById('summary-recurrence'),
    summaryType: document.getElementById('summary-type'),

    // Import Modal & Toast
    importModal: document.getElementById('import-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalApplyBtn: document.getElementById('modal-apply-btn'),
    modalFileInput: document.getElementById('modal-file-input'),
    modalFileStatus: document.getElementById('modal-file-status'),
    importCodeInput: document.getElementById('import-code-input'),
    importErrorMsg: document.getElementById('import-error-msg'),
    toast: document.getElementById('toast'),
    toastText: document.getElementById('toast-text'),
  };

  // --- Step Navigation ---
  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 3) return;
    state.currentStep = stepNum;

    // Update indicator buttons
    el.wizardStepBtns.forEach(btn => {
      const s = parseInt(btn.dataset.step, 10);
      btn.classList.toggle('active', s === stepNum);
      btn.classList.toggle('completed', s < stepNum);
    });

    // Update step pane visibility
    Object.keys(el.stepPanes).forEach(k => {
      const pane = el.stepPanes[k];
      if (pane) {
        pane.classList.toggle('active', parseInt(k, 10) === stepNum);
      }
    });

    if (stepNum === 3) {
      updateReviewCard();
    }

    if (el.editorPane) {
      el.editorPane.scrollTop = 0;
    }
  }

  // --- Datetime Helpers ---
  function getJSTNow() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 9 * 3600000);
  }

  function formatYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatHM(d) {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  function formatHumanReadableDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) {
      return { fullText: '', relativeText: '', isPast: false };
    }
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    const targetDt = new Date(y, m - 1, d, h, min, 0);

    const weekdayIdx = targetDt.getDay();
    const adjustedIdx = (weekdayIdx + 6) % 7; // Mon=0, Sun=6
    const weekdayStr = WEEKDAYS_JP[adjustedIdx];

    const fullText = `${y}年${m}月${d}日(${weekdayStr}) ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')} (JST)`;

    const jstNow = getJSTNow();
    const diffMs = targetDt.getTime() - jstNow.getTime();
    const isPast = diffMs < -60000; // 1 minute grace

    let relativeText = '';
    if (isPast) {
      relativeText = '⚠️ 過去の日時です';
    } else {
      const totalMinutes = Math.floor(diffMs / 60000);
      if (totalMinutes < 60) {
        relativeText = `約 ${Math.max(1, totalMinutes)}分後`;
      } else {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        if (hours < 24) {
          relativeText = `約 ${hours}時間${mins > 0 ? mins + '分' : ''}後`;
        } else {
          const days = Math.floor(hours / 24);
          const remHours = hours % 24;
          relativeText = `約 ${days}日${remHours > 0 ? remHours + '時間' : ''}後`;
        }
      }
    }

    return { fullText, relativeText, isPast, weekdayFull: WEEKDAYS_FULL_JP[adjustedIdx] };
  }

  function updateQuickDatePills() {
    if (!el.quickDatePills) return;
    const jstNow = getJSTNow();
    const todayYMD = formatYMD(jstNow);
    const tomorrow = new Date(jstNow); tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowYMD = formatYMD(tomorrow);
    const afterTomorrow = new Date(jstNow); afterTomorrow.setDate(afterTomorrow.getDate() + 2);
    const afterTomorrowYMD = formatYMD(afterTomorrow);
    const nextWeek = new Date(jstNow); nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekYMD = formatYMD(nextWeek);

    el.quickDatePills.forEach(pill => {
      const mode = pill.dataset.quickDate;
      let isMatch = false;
      if (mode === 'today' && state.date === todayYMD) isMatch = true;
      else if (mode === 'tomorrow' && state.date === tomorrowYMD) isMatch = true;
      else if (mode === 'after-tomorrow' && state.date === afterTomorrowYMD) isMatch = true;
      else if (mode === 'next-week' && state.date === nextWeekYMD) isMatch = true;
      pill.classList.toggle('active', isMatch);
    });
  }

  function updateScheduleSummaryCard() {
    const info = formatHumanReadableDateTime(state.date, state.time);
    if (!info.fullText) {
      if (el.summaryCardMain) el.summaryCardMain.textContent = '日時を選択してください';
      if (el.summaryCardSub) el.summaryCardSub.textContent = '-';
      if (el.datetimeWarning) el.datetimeWarning.style.display = 'none';
      return;
    }

    if (el.summaryCardMain) el.summaryCardMain.textContent = info.fullText;
    if (el.summaryCardSub) el.summaryCardSub.textContent = info.relativeText;

    if (el.datetimeWarning) {
      if (info.isPast) {
        if (el.summaryCardSub) el.summaryCardSub.style.color = '#ff787b';
        el.datetimeWarning.style.display = 'block';
      } else {
        if (el.summaryCardSub) el.summaryCardSub.style.color = '#8ea1e1';
        el.datetimeWarning.style.display = 'none';
      }
    }
  }

  // --- Calendar Logic ---
  let calViewYear = 2026;
  let calViewMonth = 9; // 0-indexed (9 = Oct)

  function renderCalendar() {
    if (!el.calMonthLabel || !el.calDaysGrid) return;
    el.calMonthLabel.textContent = `${calViewYear}年 ${calViewMonth + 1}月`;
    el.calDaysGrid.innerHTML = '';

    const jstNow = getJSTNow();
    const todayYMD = formatYMD(jstNow);

    const firstDayRaw = new Date(calViewYear, calViewMonth, 1).getDay();
    const firstDayMondayBased = (firstDayRaw + 6) % 7;
    const totalDays = new Date(calViewYear, calViewMonth + 1, 0).getDate();
    const prevTotalDays = new Date(calViewYear, calViewMonth, 0).getDate();

    // Previous month trailing days
    for (let i = firstDayMondayBased - 1; i >= 0; i--) {
      const dayNum = prevTotalDays - i;
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month disabled';
      cell.textContent = dayNum;
      el.calDaysGrid.appendChild(cell);
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const ymd = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.textContent = d;

      if (ymd < todayYMD) {
        cell.classList.add('disabled');
      } else {
        cell.addEventListener('click', () => {
          state.date = ymd;
          if (el.inputDate) el.inputDate.value = state.date;
          renderCalendar();
          updateQuickDatePills();
          updateScheduleSummaryCard();
          renderPreview();
        });
      }

      if (ymd === todayYMD) cell.classList.add('is-today');
      if (ymd === state.date) cell.classList.add('is-selected');

      el.calDaysGrid.appendChild(cell);
    }

    // Next month leading days (pad to full 7-column rows)
    const currentCells = firstDayMondayBased + totalDays;
    const remainingCells = (currentCells % 7 === 0) ? 0 : 7 - (currentCells % 7);
    for (let d = 1; d <= remainingCells; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month disabled';
      cell.textContent = d;
      el.calDaysGrid.appendChild(cell);
    }
  }

  function changeCalendarMonth(delta) {
    calViewMonth += delta;
    if (calViewMonth > 11) {
      calViewMonth = 0;
      calViewYear++;
    } else if (calViewMonth < 0) {
      calViewMonth = 11;
      calViewYear--;
    }
    renderCalendar();
  }

  function jumpCalendarToDate(ymd) {
    if (!ymd) return;
    const [y, m] = ymd.split('-').map(Number);
    calViewYear = y;
    calViewMonth = m - 1;
    renderCalendar();
  }

  // --- iOS Alarm-Style Wheel Picker Logic ---
  const ITEM_HEIGHT = 38;
  let hourScrollTimer = null;
  let minuteScrollTimer = null;

  function initIosWheelPicker() {
    if (!el.wheelHour || !el.wheelMinute) return;

    // Hours (00〜23)
    el.wheelHour.innerHTML = '';
    for (let h = 0; h < 24; h++) {
      const valStr = String(h).padStart(2, '0');
      const item = document.createElement('div');
      item.className = 'wheel-item';
      item.dataset.index = h;
      item.textContent = valStr;
      item.addEventListener('click', () => setHour(h, true));
      el.wheelHour.appendChild(item);
    }

    // Minutes (00〜59, default 00)
    el.wheelMinute.innerHTML = '';
    for (let m = 0; m < 60; m++) {
      const valStr = String(m).padStart(2, '0');
      const item = document.createElement('div');
      item.className = 'wheel-item';
      item.dataset.index = m;
      item.textContent = valStr;
      item.addEventListener('click', () => setMinute(m, true));
      el.wheelMinute.appendChild(item);
    }

    el.wheelHour.addEventListener('scroll', () => onWheelScroll('hour'), { passive: true });
    el.wheelMinute.addEventListener('scroll', () => onWheelScroll('minute'), { passive: true });

    if (el.stepperBtns) {
      el.stepperBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const col = btn.dataset.stepCol;
          const dir = parseInt(btn.dataset.dir, 10);
          const [curH, curM] = (state.time || '14:00').split(':').map(Number);

          if (col === 'hour') {
            const nextH = (curH + dir + 24) % 24;
            setHour(nextH, true);
          } else if (col === 'minute') {
            const nextM = (curM + dir + 60) % 60;
            setMinute(nextM, true);
          }
        });
      });
    }
  }

  function onWheelScroll(type) {
    const wheel = type === 'hour' ? el.wheelHour : el.wheelMinute;
    if (!wheel) return;

    const total = type === 'hour' ? 24 : 60;
    const rawIdx = Math.round(wheel.scrollTop / ITEM_HEIGHT);
    const activeIdx = Math.max(0, Math.min(total - 1, rawIdx));

    const items = wheel.querySelectorAll('.wheel-item');
    items.forEach((it, i) => it.classList.toggle('active', i === activeIdx));

    if (type === 'hour') {
      clearTimeout(hourScrollTimer);
      hourScrollTimer = setTimeout(() => {
        const hVal = String(activeIdx).padStart(2, '0');
        const curM = state.time ? state.time.split(':')[1] : '00';
        state.time = `${hVal}:${curM}`;
        if (el.inputTime) el.inputTime.value = state.time;
        if (el.timeDisplayBadge) el.timeDisplayBadge.textContent = state.time;
        updateScheduleSummaryCard();
        renderPreview();
      }, 70);
    } else {
      clearTimeout(minuteScrollTimer);
      minuteScrollTimer = setTimeout(() => {
        const curH = state.time ? state.time.split(':')[0] : '14';
        const mVal = String(activeIdx).padStart(2, '0');
        state.time = `${curH}:${mVal}`;
        if (el.inputTime) el.inputTime.value = state.time;
        if (el.timeDisplayBadge) el.timeDisplayBadge.textContent = state.time;
        updateScheduleSummaryCard();
        renderPreview();
      }, 70);
    }
  }

  function setHour(h, smooth = true) {
    const curM = state.time ? state.time.split(':')[1] : '00';
    state.time = `${String(h).padStart(2, '0')}:${curM}`;
    if (el.inputTime) el.inputTime.value = state.time;
    if (el.timeDisplayBadge) el.timeDisplayBadge.textContent = state.time;
    syncIosWheelPicker(state.time, smooth);
    updateScheduleSummaryCard();
    renderPreview();
  }

  function setMinute(m, smooth = true) {
    const curH = state.time ? state.time.split(':')[0] : '14';
    state.time = `${curH}:${String(m).padStart(2, '0')}`;
    if (el.inputTime) el.inputTime.value = state.time;
    if (el.timeDisplayBadge) el.timeDisplayBadge.textContent = state.time;
    syncIosWheelPicker(state.time, smooth);
    updateScheduleSummaryCard();
    renderPreview();
  }

  function syncIosWheelPicker(timeStr, smooth = false) {
    if (!timeStr) return;
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;

    if (el.timeDisplayBadge) {
      el.timeDisplayBadge.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    if (el.wheelHour) {
      el.wheelHour.scrollTo({
        top: h * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'auto'
      });
      const items = el.wheelHour.querySelectorAll('.wheel-item');
      items.forEach((it, i) => it.classList.toggle('active', i === h));
    }

    if (el.wheelMinute) {
      el.wheelMinute.scrollTo({
        top: m * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'auto'
      });
      const items = el.wheelMinute.querySelectorAll('.wheel-item');
      items.forEach((it, i) => it.classList.toggle('active', i === m));
    }
  }

  // --- Initial Defaults ---
  function initDefaults() {
    const jstNow = getJSTNow();
    const target = new Date(jstNow);
    // デフォルト: 次の正時（分は必ず '00'）
    target.setHours(target.getHours() + 1);
    target.setMinutes(0, 0, 0);

    state.date = formatYMD(target);
    state.time = formatHM(target);

    if (el.inputDate) el.inputDate.value = state.date;
    if (el.inputTime) el.inputTime.value = state.time;

    jumpCalendarToDate(state.date);
    initIosWheelPicker();
    syncIosWheelPicker(state.time, false);
    updateScheduleSummaryCard();
  }

  // --- URL Query Params Parser ---
  function parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get('cid');
    const cname = params.get('cname');
    const gid = params.get('gid');
    const code = params.get('code');

    if (cid) state.targetChannel.id = cid;
    if (cname) state.targetChannel.name = cname;
    if (gid) state.targetChannel.guildId = gid;

    if (state.targetChannel.id || state.targetChannel.name) {
      el.targetChannelBadge.style.display = 'flex';
      el.targetChannelName.textContent = state.targetChannel.name || '一般';
      el.targetChannelId.textContent = state.targetChannel.id;
      el.previewChannelLabel.textContent = '#' + (state.targetChannel.name || '一般');
    }

    if (code) {
      try {
        const decoded = decodeReservationCode(code);
        applyImportedData(decoded);
        showToast('URLから予約設定を読み込みました');
      } catch (err) {
        console.warn('URLコードの読み込みに失敗しました:', err);
      }
    }
  }

  // ==========================================================================
  // Privacy-First Base64 Image Processing (FileReader, Zero External Network)
  // ==========================================================================
  function formatFileSize(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function handleLocalImageFile(file, targetType) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ 画像ファイル（PNG, JPEG, GIF, WebP等）を選択してください');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('⚠️ ファイルサイズが25MBを超えています。Discordの添付上限にご注意ください');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const targetState = targetType === 'embed' ? state.embed : state.plain;
      targetState.image_data = dataUrl;
      targetState.image_filename = file.name || (targetType === 'embed' ? 'embed_image.png' : 'image.png');
      targetState.image_size = file.size;

      updateImageDropzoneUI(targetType);
      renderPreview();
      showToast(`✅ ${file.name} を読み込みました（高画質Base64変換完了）`);
    };

    reader.onerror = () => {
      showToast('❌ 画像ファイルの読み込みに失敗しました');
    };

    reader.readAsDataURL(file);
  }

  function removeLocalImage(targetType) {
    const targetState = targetType === 'embed' ? state.embed : state.plain;
    targetState.image_data = '';
    targetState.image_filename = '';
    targetState.image_size = 0;

    const fileInput = targetType === 'embed' ? el.embedFileInput : el.plainFileInput;
    if (fileInput) fileInput.value = '';

    updateImageDropzoneUI(targetType);
    renderPreview();
    showToast('画像を削除しました');
  }

  function updateImageDropzoneUI(targetType) {
    const isEmbed = targetType === 'embed';
    const targetState = isEmbed ? state.embed : state.plain;
    const dropzoneEmpty = isEmbed ? el.embedDropzoneEmpty : el.plainDropzoneEmpty;
    const dropzoneLoaded = isEmbed ? el.embedDropzoneLoaded : el.plainDropzoneLoaded;
    const loadedImg = isEmbed ? el.embedLoadedImg : el.plainLoadedImg;
    const loadedFilename = isEmbed ? el.embedLoadedFilename : el.plainLoadedFilename;
    const loadedFilesize = isEmbed ? el.embedLoadedFilesize : el.plainLoadedFilesize;

    if (targetState.image_data) {
      if (dropzoneEmpty) dropzoneEmpty.style.display = 'none';
      if (dropzoneLoaded) dropzoneLoaded.style.display = 'flex';
      if (loadedImg) loadedImg.src = targetState.image_data;
      if (loadedFilename) loadedFilename.textContent = targetState.image_filename || 'image.png';
      if (loadedFilesize) loadedFilesize.textContent = formatFileSize(targetState.image_size);
    } else {
      if (dropzoneEmpty) dropzoneEmpty.style.display = 'flex';
      if (dropzoneLoaded) dropzoneLoaded.style.display = 'none';
      if (loadedImg) loadedImg.src = '';
    }
  }

  function setupDropzoneEvents(dropzoneEl, fileInputEl, removeBtnEl, targetType) {
    if (!dropzoneEl || !fileInputEl) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzoneEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzoneEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.remove('dragover');
      }, false);
    });

    dropzoneEl.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt && dt.files && dt.files[0];
      if (file) {
        handleLocalImageFile(file, targetType);
      }
    });

    fileInputEl.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleLocalImageFile(file, targetType);
      }
    });

    if (removeBtnEl) {
      removeBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        removeLocalImage(targetType);
      });
    }
  }

  // --- Dynamic Embed Fields Logic ---
  function renderEmbedFieldsList() {
    if (!el.fieldsList) return;
    el.fieldsList.innerHTML = '';
    state.embed.fields.forEach((field, index) => {
      const item = document.createElement('div');
      item.className = 'field-item-card';
      item.innerHTML = `
        <div class="field-item-top">
          <span class="field-item-badge">フィールド #${index + 1}</span>
          <button type="button" class="field-delete-btn" data-id="${field.id}">削除</button>
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <input type="text" class="form-input field-name-input" placeholder="見出し (例: 日時)" value="${escapeHtml(field.name)}" maxlength="256">
          </div>
          <div class="form-group flex-1">
            <input type="text" class="form-input field-val-input" placeholder="内容 (例: 20:00〜)" value="${escapeHtml(field.value)}" maxlength="1024">
          </div>
        </div>
        <label class="field-inline-toggle">
          <input type="checkbox" class="field-inline-chk" ${field.inline ? 'checked' : ''}>
          <span>横並び表示 (インライン)</span>
        </label>
      `;

      const nameInp = item.querySelector('.field-name-input');
      const valInp = item.querySelector('.field-val-input');
      const inlineChk = item.querySelector('.field-inline-chk');
      const delBtn = item.querySelector('.field-delete-btn');

      nameInp.addEventListener('input', (e) => {
        field.name = e.target.value;
        renderPreview();
      });

      valInp.addEventListener('input', (e) => {
        field.value = e.target.value;
        renderPreview();
      });

      inlineChk.addEventListener('change', (e) => {
        field.inline = e.target.checked;
        renderPreview();
      });

      delBtn.addEventListener('click', () => {
        state.embed.fields = state.embed.fields.filter(f => f.id !== field.id);
        renderEmbedFieldsList();
        renderPreview();
      });

      el.fieldsList.appendChild(item);
    });
  }

  function addEmbedField() {
    if (state.embed.fields.length >= 25) {
      showToast('⚠️ フィールドは最大25個までです');
      return;
    }
    const newField = {
      id: 'fld_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: '',
      value: '',
      inline: false
    };
    state.embed.fields.push(newField);
    renderEmbedFieldsList();
    renderPreview();
  }

  // --- URL Link Buttons Logic ---
  function renderButtonsList() {
    if (!el.buttonsList) return;
    el.buttonsList.innerHTML = '';
    if (state.buttons.length === 0) {
      if (el.buttonsEmptyHint) el.buttonsEmptyHint.style.display = 'block';
    } else {
      if (el.buttonsEmptyHint) el.buttonsEmptyHint.style.display = 'none';
    }

    state.buttons.forEach((btn, index) => {
      const item = document.createElement('div');
      item.className = 'button-item-card';
      item.innerHTML = `
        <span class="field-item-badge">#${index + 1}</span>
        <div class="flex-1">
          <input type="text" class="form-input btn-label-input" placeholder="表示ラベル (例: 公式サイト)" value="${escapeHtml(btn.label)}" maxlength="80">
        </div>
        <div class="flex-1">
          <input type="url" class="form-input btn-url-input" placeholder="URL (https://...)" value="${escapeHtml(btn.url)}">
        </div>
        <button type="button" class="field-delete-btn btn-delete-button" data-id="${btn.id}" title="ボタン削除">削除</button>
      `;

      const labelInp = item.querySelector('.btn-label-input');
      const urlInp = item.querySelector('.btn-url-input');
      const delBtn = item.querySelector('.btn-delete-button');

      labelInp.addEventListener('input', (e) => {
        btn.label = e.target.value;
        renderPreview();
      });

      urlInp.addEventListener('input', (e) => {
        btn.url = e.target.value;
        renderPreview();
      });

      delBtn.addEventListener('click', () => {
        state.buttons = state.buttons.filter(b => b.id !== btn.id);
        renderButtonsList();
        renderPreview();
      });

      el.buttonsList.appendChild(item);
    });
  }

  function addLinkButton() {
    if (state.buttons.length >= 5) {
      showToast('⚠️ ボタンは最大5個までです');
      return;
    }
    const newBtn = {
      id: 'btn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      label: '',
      url: ''
    };
    state.buttons.push(newBtn);
    renderButtonsList();
    renderPreview();
  }

  // --- Real-time Discord Preview Rendering ---
  function renderPreview() {
    // 1. Timestamp & Channel Tag
    const dtInfo = formatHumanReadableDateTime(state.date, state.time);
    if (el.previewTimestamp) {
      if (dtInfo.fullText) {
        const [y, m, d] = state.date.split('-');
        el.previewTimestamp.textContent = `${m}/${d} ${state.time}`;
      } else {
        el.previewTimestamp.textContent = '今日 14:00';
      }
    }

    if (el.previewRecurrenceBadge) {
      let recLabel = '1回のみ';
      if (state.recurrence.type === 'daily') recLabel = '毎日';
      else if (state.recurrence.type === 'weekdays') recLabel = '平日(月〜金)';
      else if (state.recurrence.type === 'monthly') recLabel = '毎月';
      else if (state.recurrence.type === 'weekly') {
        const dNames = state.recurrence.days.map(i => WEEKDAYS_JP[i]).join(', ');
        recLabel = `毎週(${dNames || '未指定'})`;
      }
      el.previewRecurrenceBadge.textContent = recLabel;
    }

    // 2. Message Type Switch
    if (state.messageType === 'plain') {
      if (el.previewPlainWrap) el.previewPlainWrap.style.display = 'block';
      if (el.previewEmbedWrap) el.previewEmbedWrap.style.display = 'none';

      // Plain text content
      const textVal = state.plain.content.trim();
      if (el.previewPlainText) {
        if (textVal) {
          el.previewPlainText.innerHTML = renderDiscordMarkdown(textVal);
        } else {
          el.previewPlainText.innerHTML = '<span class="preview-empty-hint">メッセージ本文を入力してください</span>';
        }
      }

      // Plain image (Base64優先、次いでURL)
      const imgSrc = state.plain.image_data || (isValidUrl(state.plain.image_url) ? state.plain.image_url.trim() : '');
      if (el.previewPlainImageWrap && el.previewPlainImage) {
        if (imgSrc) {
          el.previewPlainImage.src = imgSrc;
          el.previewPlainImageWrap.style.display = 'block';
        } else {
          el.previewPlainImageWrap.style.display = 'none';
          el.previewPlainImage.src = '';
        }
      }
    } else {
      if (el.previewPlainWrap) el.previewPlainWrap.style.display = 'none';
      if (el.previewEmbedWrap) el.previewEmbedWrap.style.display = 'block';

      // Color pill
      if (el.previewEmbedPill) {
        el.previewEmbedPill.style.backgroundColor = state.embed.color || '#5865F2';
      }

      // Author
      const a = state.embed.author;
      if (el.previewEmbedAuthor) {
        if (a && a.name.trim()) {
          el.previewEmbedAuthor.style.display = 'flex';
          el.previewEmbedAuthorLink.textContent = a.name.trim();
          if (isValidUrl(a.url)) {
            el.previewEmbedAuthorLink.href = a.url.trim();
          } else {
            el.previewEmbedAuthorLink.removeAttribute('href');
          }

          if (isValidUrl(a.icon_url)) {
            el.previewEmbedAuthorIcon.src = a.icon_url.trim();
            el.previewEmbedAuthorIcon.style.display = 'block';
          } else {
            el.previewEmbedAuthorIcon.style.display = 'none';
          }
        } else {
          el.previewEmbedAuthor.style.display = 'none';
        }
      }

      // Title
      const t = state.embed.title.trim();
      if (el.previewEmbedTitleWrap && el.previewEmbedTitleLink) {
        if (t) {
          el.previewEmbedTitleWrap.style.display = 'block';
          el.previewEmbedTitleLink.textContent = t;
          if (isValidUrl(state.embed.title_url)) {
            el.previewEmbedTitleLink.href = state.embed.title_url.trim();
          } else {
            el.previewEmbedTitleLink.removeAttribute('href');
          }
        } else {
          el.previewEmbedTitleWrap.style.display = 'none';
        }
      }

      // Description
      const descVal = state.embed.description.trim();
      if (el.previewEmbedDesc && el.previewEmptyHint) {
        if (descVal) {
          el.previewEmbedDesc.innerHTML = renderDiscordMarkdown(descVal);
          el.previewEmbedDesc.style.display = 'block';
          el.previewEmptyHint.style.display = 'none';
        } else {
          el.previewEmbedDesc.style.display = 'none';
          el.previewEmptyHint.style.display = t ? 'none' : 'block';
        }
      }

      // Fields
      if (el.previewEmbedFields) {
        const validFields = state.embed.fields.filter(f => f.name.trim() || f.value.trim());
        if (validFields.length > 0) {
          el.previewEmbedFields.style.display = 'grid';
          el.previewEmbedFields.innerHTML = validFields.map(f => {
            const inlineCls = f.inline ? '' : 'full-width';
            return `
              <div class="embed-field-item ${inlineCls}">
                <div class="embed-field-name">${escapeHtml(f.name.trim() || '\u200b')}</div>
                <div class="embed-field-value">${renderDiscordMarkdown(f.value.trim() || '\u200b')}</div>
              </div>
            `;
          }).join('');
        } else {
          el.previewEmbedFields.style.display = 'none';
          el.previewEmbedFields.innerHTML = '';
        }
      }

      // Thumbnail
      const thumbUrl = state.embed.thumbnail_url.trim();
      if (el.previewEmbedThumbWrap && el.previewEmbedThumb) {
        if (isValidUrl(thumbUrl)) {
          el.previewEmbedThumb.src = thumbUrl;
          el.previewEmbedThumbWrap.style.display = 'block';
        } else {
          el.previewEmbedThumbWrap.style.display = 'none';
          el.previewEmbedThumb.src = '';
        }
      }

      // Large Image (Base64優先、次いでURL)
      const embedImgSrc = state.embed.image_data || (isValidUrl(state.embed.image_url) ? state.embed.image_url.trim() : '');
      if (el.previewEmbedImageWrap && el.previewEmbedImage) {
        if (embedImgSrc) {
          el.previewEmbedImage.src = embedImgSrc;
          el.previewEmbedImageWrap.style.display = 'block';
        } else {
          el.previewEmbedImageWrap.style.display = 'none';
          el.previewEmbedImage.src = '';
        }
      }

      // Footer
      const f = state.embed.footer;
      if (el.previewEmbedFooter) {
        if (f && f.text.trim()) {
          el.previewEmbedFooter.style.display = 'flex';
          el.previewEmbedFooterText.textContent = f.text.trim();
          if (isValidUrl(f.icon_url)) {
            el.previewEmbedFooterIcon.src = f.icon_url.trim();
            el.previewEmbedFooterIcon.style.display = 'block';
          } else {
            el.previewEmbedFooterIcon.style.display = 'none';
          }
          if (el.previewEmbedFooterTime) {
            el.previewEmbedFooterTime.textContent = dtInfo.fullText ? `${state.date} ${state.time}` : '今日 14:00';
          }
        } else {
          el.previewEmbedFooter.style.display = 'none';
        }
      }
    }

    // 3. Link Buttons Action Row
    if (el.previewButtonsRow) {
      const validBtns = state.buttons.filter(b => b.label.trim() && isValidUrl(b.url));
      if (validBtns.length > 0) {
        el.previewButtonsRow.style.display = 'flex';
        el.previewButtonsRow.innerHTML = validBtns.map(b => `
          <a class="discord-link-btn" href="${escapeHtml(b.url.trim())}" target="_blank" rel="noopener noreferrer">
            <span>${escapeHtml(b.label.trim())}</span>
            <svg class="btn-ext-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
          </a>
        `).join('');
      } else {
        el.previewButtonsRow.style.display = 'none';
        el.previewButtonsRow.innerHTML = '';
      }
    }

    // 4. Footer Summary Pills
    if (el.summaryNextTime) el.summaryNextTime.textContent = dtInfo.fullText ? `${state.date} ${state.time}` : '未設定';
    if (el.summaryRecurrence) el.summaryRecurrence.textContent = el.previewRecurrenceBadge ? el.previewRecurrenceBadge.textContent : '-';
    if (el.summaryType) el.summaryType.textContent = state.messageType === 'embed' ? 'Embed' : '通常テキスト';

    // 5. Update author/footer accordions active badge
    if (el.authorBadge) {
      el.authorBadge.style.display = (state.embed.author.name.trim() || state.embed.author.icon_url.trim()) ? 'inline' : 'none';
    }
    if (el.footerBadge) {
      el.footerBadge.style.display = (state.embed.footer.text.trim() || state.embed.footer.icon_url.trim()) ? 'inline' : 'none';
    }
  }

  // --- Step 3 Review Card Update ---
  function updateReviewCard() {
    const dtInfo = formatHumanReadableDateTime(state.date, state.time);
    if (el.reviewDatetime) el.reviewDatetime.textContent = dtInfo.fullText || '未設定';

    let recText = '1回のみ';
    if (state.recurrence.type === 'daily') recText = '毎日';
    else if (state.recurrence.type === 'weekdays') recText = '平日（月〜金）';
    else if (state.recurrence.type === 'monthly') recText = '毎月';
    else if (state.recurrence.type === 'weekly') {
      const days = state.recurrence.days.map(d => WEEKDAYS_JP[d]).join(', ');
      recText = `毎週 (${days || '曜日未指定'})`;
    }
    if (el.reviewRecurrence) el.reviewRecurrence.textContent = recText;
    if (el.reviewType) el.reviewType.textContent = state.messageType === 'embed' ? 'Embed（埋め込み）' : '通常テキスト';

    const activeImageState = state.messageType === 'embed' ? state.embed : state.plain;
    if (el.reviewImage) {
      if (activeImageState.image_data) {
        el.reviewImage.textContent = `あり (${activeImageState.image_filename || 'image.png'}, ${formatFileSize(activeImageState.image_size)})`;
      } else if (isValidUrl(activeImageState.image_url)) {
        el.reviewImage.textContent = 'あり (外部URL)';
      } else {
        el.reviewImage.textContent = 'なし';
      }
    }

    if (el.reviewButtonsCount) {
      el.reviewButtonsCount.textContent = `${state.buttons.length}個`;
    }

    // Copy code warning if image data attached
    if (el.copyCodeWarning) {
      el.copyCodeWarning.style.display = activeImageState.image_data ? 'block' : 'none';
    }

    if (el.downloadCompressionHint) {
      el.downloadCompressionHint.style.display = activeImageState.image_data ? 'block' : 'none';
    }
  }

  // --- Discord Markdown Parser ---
  function renderDiscordMarkdown(raw) {
    if (!raw) return '';
    let out = escapeHtml(raw);

    const stashed = [];
    const stash = (html) => {
      stashed.push(html);
      return `%%STASH_${stashed.length - 1}%%`;
    };

    // Multi-line code block: ```lang\ncode\n```
    out = out.replace(/```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g, (_, code) => {
      return stash(`<pre class="discord-code-block"><code>${code}</code></pre>`);
    });

    // Inline code: `code`
    out = out.replace(/`([^`\n]+)`/g, (_, code) => {
      return stash(`<code class="discord-inline-code">${code}</code>`);
    });

    // Blockquote: > text
    out = out.replace(/^(?:&gt;|>)\s?(.*)$/gm, '<div class="discord-blockquote">$1</div>');

    // Bold + Italic: ***text***
    out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');

    // Bold: **text**
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    out = out.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Strikethrough: ~~text~~
    out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Spoilers: ||text||
    out = out.replace(/\|\|([^|]+)\|\|/g, '<span class="discord-spoiler" title="クリックで表示" onclick="this.classList.toggle(\'revealed\')">$1</span>');

    // Links: [text](url)
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Mentions & Channels
    out = out.replace(/&lt;@!?(\d+)&gt;/g, '<span class="discord-mention">@user</span>');
    out = out.replace(/&lt;#(\d+)&gt;/g, '<span class="discord-mention">#channel</span>');
    out = out.replace(/&lt;@&amp;(\d+)&gt;/g, '<span class="discord-mention">@role</span>');

    // Line breaks
    out = out.replace(/\n/g, '<br>');

    // Restore stashed blocks
    out = out.replace(/%%STASH_(\d+)%%/g, (_, idx) => stashed[parseInt(idx, 10)] || '');

    return out;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isValidHex(hex) {
    return /^#([A-Fa-f0-9]{6})$/.test(hex);
  }

  function isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const u = url.trim();
    return u.startsWith('http://') || u.startsWith('https://');
  }

  // --- Payload Building & Encoding ---
  function buildPayload() {
    const payload = {
      v: 1,
      type: state.messageType,
      datetime: `${state.date}T${state.time}`,
      recurrence: {
        type: state.recurrence.type,
        ...(state.recurrence.type === 'weekly' ? { days: state.recurrence.days } : {})
      },
      content: {}
    };

    if (state.targetChannel.id) {
      payload.channel_id = state.targetChannel.id;
    }

    if (state.messageType === 'plain') {
      const c = {
        text: state.plain.content.trim()
      };
      if (state.plain.image_data) {
        c.image_data = state.plain.image_data;
        c.image_filename = state.plain.image_filename || 'image.png';
      } else if (isValidUrl(state.plain.image_url)) {
        c.image_url = state.plain.image_url.trim();
      }
      payload.content = c;
    } else {
      const c = {};
      const colorNum = parseInt(state.embed.color.replace('#', ''), 16);
      if (!isNaN(colorNum)) c.color = colorNum;

      if (state.embed.title.trim()) c.title = state.embed.title.trim();
      if (isValidUrl(state.embed.title_url)) c.title_url = state.embed.title_url.trim();
      if (state.embed.description.trim()) c.description = state.embed.description.trim();

      if (state.embed.author.name.trim()) {
        c.author = { name: state.embed.author.name.trim() };
        if (isValidUrl(state.embed.author.icon_url)) c.author.icon_url = state.embed.author.icon_url.trim();
        if (isValidUrl(state.embed.author.url)) c.author.url = state.embed.author.url.trim();
      }

      if (isValidUrl(state.embed.thumbnail_url)) c.thumbnail_url = state.embed.thumbnail_url.trim();

      // Main image: Base64 data takes priority, then fallback external URL
      if (state.embed.image_data) {
        c.image_data = state.embed.image_data;
        c.image_filename = state.embed.image_filename || 'image.png';
      } else if (isValidUrl(state.embed.image_url)) {
        c.image_url = state.embed.image_url.trim();
      }

      if (state.embed.footer.text.trim()) {
        c.footer = { text: state.embed.footer.text.trim() };
        if (isValidUrl(state.embed.footer.icon_url)) c.footer.icon_url = state.embed.footer.icon_url.trim();
      }

      if (state.embed.fields.length > 0) {
        c.fields = state.embed.fields
          .filter(f => f.name.trim() || f.value.trim())
          .map(f => ({
            name: f.name.trim() || '\u200b',
            value: f.value.trim() || '\u200b',
            inline: !!f.inline
          }));
      }

      payload.content = c;
    }

    if (state.buttons.length > 0) {
      const validBtns = state.buttons
        .filter(b => b.label.trim() && isValidUrl(b.url))
        .map(b => ({
          label: b.label.trim(),
          url: b.url.trim()
        }));
      if (validBtns.length > 0) {
        payload.buttons = validBtns;
      }
    }

    return payload;
  }

  function encodeReservationCode(data) {
    const jsonStr = JSON.stringify(data);
    if (typeof window.pako !== 'undefined') {
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      const compressed = window.pako.deflate(utf8Bytes);
      let binary = '';
      const len = compressed.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(compressed[i]);
      }
      return 'RSV1_' + btoa(binary);
    }
    return 'RSV1_' + btoa(unescape(encodeURIComponent(jsonStr)));
  }

  function decodeReservationCode(codeStr) {
    if (!codeStr || typeof codeStr !== 'string') {
      throw new Error('コードが空です');
    }
    let cleaned = codeStr.trim().replace(/^`+|`+$/g, '').trim();
    if (cleaned.includes('code=')) {
      const match = cleaned.match(/[?&]code=([^&]+)/);
      if (match) cleaned = decodeURIComponent(match[1]);
    }

    if (cleaned.startsWith('RSV1_')) {
      const base64Data = cleaned.substring(5);
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      if (typeof window.pako !== 'undefined') {
        const decompressed = window.pako.inflate(bytes);
        const jsonStr = new TextDecoder('utf-8').decode(decompressed);
        return JSON.parse(jsonStr);
      } else {
        const decodedStr = decodeURIComponent(escape(binary));
        return JSON.parse(decodedStr);
      }
    }

    return JSON.parse(cleaned);
  }

  function applyImportedData(data) {
    if (!data || typeof data !== 'object') throw new Error('データ形式が無効です');

    if (data.datetime) {
      const parts = data.datetime.split('T');
      if (parts[0]) state.date = parts[0];
      if (parts[1]) state.time = parts[1].substring(0, 5);
      if (el.inputDate) el.inputDate.value = state.date;
      if (el.inputTime) el.inputTime.value = state.time;
      jumpCalendarToDate(state.date);
      syncIosWheelPicker(state.time, false);
      updateScheduleSummaryCard();
    }

    if (data.recurrence) {
      state.recurrence.type = data.recurrence.type || 'none';
      state.recurrence.days = Array.isArray(data.recurrence.days) ? data.recurrence.days : [];
      if (el.recurrenceType) el.recurrenceType.value = state.recurrence.type;
      if (el.weeklyDaysContainer) {
        el.weeklyDaysContainer.style.display = state.recurrence.type === 'weekly' ? 'block' : 'none';
      }
      if (el.weekdayCheckboxes) {
        el.weekdayCheckboxes.forEach(cb => {
          cb.checked = state.recurrence.days.includes(parseInt(cb.value, 10));
        });
      }
    }

    if (data.type) {
      state.messageType = data.type;
      if (el.messageTypeInputs) {
        el.messageTypeInputs.forEach(r => {
          r.checked = (r.value === state.messageType);
        });
      }
      if (el.embedSettingsSection) el.embedSettingsSection.style.display = state.messageType === 'embed' ? 'block' : 'none';
      if (el.plainSettingsSection) el.plainSettingsSection.style.display = state.messageType === 'plain' ? 'block' : 'none';
    }

    const c = data.content || {};
    if (state.messageType === 'embed') {
      if (typeof c.color === 'number') {
        const hex = '#' + c.color.toString(16).padStart(6, '0');
        state.embed.color = hex;
        if (el.embedColorPicker) el.embedColorPicker.value = hex;
        if (el.embedColorHex) el.embedColorHex.value = hex;
      }
      state.embed.title = c.title || '';
      if (el.embedTitle) el.embedTitle.value = state.embed.title;
      state.embed.title_url = c.title_url || '';
      if (el.embedTitleUrl) el.embedTitleUrl.value = state.embed.title_url;
      state.embed.description = c.description || '';
      if (el.embedDesc) el.embedDesc.value = state.embed.description;

      state.embed.author = c.author || { name: '', icon_url: '', url: '' };
      if (el.embedAuthorName) el.embedAuthorName.value = state.embed.author.name || '';
      if (el.embedAuthorIcon) el.embedAuthorIcon.value = state.embed.author.icon_url || '';
      if (el.embedAuthorUrl) el.embedAuthorUrl.value = state.embed.author.url || '';

      state.embed.thumbnail_url = c.thumbnail_url || '';
      if (el.embedThumbnail) el.embedThumbnail.value = state.embed.thumbnail_url;

      state.embed.image_url = c.image_url || '';
      if (el.embedImage) el.embedImage.value = state.embed.image_url;

      // Base64 image
      state.embed.image_data = c.image_data || data.image_data || '';
      state.embed.image_filename = c.image_filename || data.image_filename || 'image.png';
      state.embed.image_size = state.embed.image_data ? Math.round(state.embed.image_data.length * 0.75) : 0;
      updateImageDropzoneUI('embed');

      state.embed.footer = c.footer || { text: '', icon_url: '' };
      if (el.embedFooterText) el.embedFooterText.value = state.embed.footer.text || '';
      if (el.embedFooterIcon) el.embedFooterIcon.value = state.embed.footer.icon_url || '';

      state.embed.fields = (c.fields || []).map((f, i) => ({
        id: 'fld_imp_' + i,
        name: f.name || '',
        value: f.value || '',
        inline: !!f.inline
      }));
      renderEmbedFieldsList();
    } else {
      state.plain.content = c.text || '';
      if (el.plainContent) el.plainContent.value = state.plain.content;

      state.plain.image_url = c.image_url || '';
      if (el.plainImage) el.plainImage.value = state.plain.image_url;

      // Base64 image
      state.plain.image_data = c.image_data || data.image_data || '';
      state.plain.image_filename = c.image_filename || data.image_filename || 'image.png';
      state.plain.image_size = state.plain.image_data ? Math.round(state.plain.image_data.length * 0.75) : 0;
      updateImageDropzoneUI('plain');
    }

    if (Array.isArray(data.buttons)) {
      state.buttons = data.buttons.map((b, i) => ({
        id: 'btn_imp_' + i,
        label: b.label || '',
        url: b.url || ''
      }));
      renderButtonsList();
    } else {
      state.buttons = [];
      renderButtonsList();
    }

    updateCharCounters();
    renderPreview();
  }

  // --- Character Counters & Text Toolbar ---
  function updateCharCounters() {
    if (el.embedTitleCount && el.embedTitle) {
      el.embedTitleCount.textContent = `${el.embedTitle.value.length} / 256`;
    }
    if (el.embedDescCount && el.embedDesc) {
      el.embedDescCount.textContent = `${el.embedDesc.value.length} / 4096`;
    }
    if (el.plainContentCount && el.plainContent) {
      el.plainContentCount.textContent = `${el.plainContent.value.length} / 2000`;
    }
  }

  function insertMarkdown(textarea, before, after) {
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + (selected || 'テキスト') + after;
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();
    const newPos = selected ? (start + replacement.length) : (start + before.length);
    textarea.setSelectionRange(newPos, newPos + (selected ? 0 : 4));
    textarea.dispatchEvent(new Event('input'));
  }

  // --- Toast Notification ---
  let toastTimer = null;
  function showToast(msg) {
    if (!el.toast || !el.toastText) return;
    if (toastTimer) clearTimeout(toastTimer);
    el.toastText.textContent = msg;
    el.toast.style.display = 'flex';
    toastTimer = setTimeout(() => {
      el.toast.style.display = 'none';
      toastTimer = null;
    }, 3800);
  }

  // --- Prevent Accidental Tab Closing ---
  function hasUnsavedChanges() {
    return !!(
      state.embed.title ||
      state.embed.description ||
      state.embed.image_data ||
      state.embed.fields.length > 0 ||
      state.plain.content ||
      state.plain.image_data ||
      state.buttons.length > 0
    );
  }

  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // ==========================================================================
  // Attach Event Handlers
  // ==========================================================================
  function attachEventHandlers() {
    // 1. Wizard Step Navigation
    el.wizardStepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        goToStep(parseInt(btn.dataset.step, 10));
      });
    });

    el.btnStepNextList.forEach(btn => {
      btn.addEventListener('click', () => {
        const nextStep = parseInt(btn.dataset.next, 10);
        if (state.currentStep === 1) {
          const info = formatHumanReadableDateTime(state.date, state.time);
          if (info.isPast) {
            showToast('⚠️ 過去の日時が選択されています');
            return;
          }
        }
        goToStep(nextStep);
      });
    });

    el.btnStepPrevList.forEach(btn => {
      btn.addEventListener('click', () => {
        goToStep(parseInt(btn.dataset.prev, 10));
      });
    });

    // 2. Mobile Tab Switcher & Floating FAB
    if (el.tabEdit && el.tabPreview) {
      el.tabEdit.addEventListener('click', () => {
        el.tabEdit.classList.add('active');
        el.tabPreview.classList.remove('active');
        el.editorPane.classList.add('active');
        el.previewPane.classList.remove('active');
        if (el.mobileFabText) el.mobileFabText.textContent = 'プレビューを見る';
      });
      el.tabPreview.addEventListener('click', () => {
        el.tabPreview.classList.add('active');
        el.tabEdit.classList.remove('active');
        el.previewPane.classList.add('active');
        el.editorPane.classList.remove('active');
        if (el.mobileFabText) el.mobileFabText.textContent = '設定フォームへ';
      });
    }

    if (el.mobilePreviewFab) {
      el.mobilePreviewFab.addEventListener('click', () => {
        const isPreviewActive = el.previewPane.classList.contains('active');
        if (isPreviewActive) {
          el.tabEdit.click();
        } else {
          el.tabPreview.click();
        }
      });
    }

    // 3. Quick Time Presets
    if (el.presetTimeChips) {
      el.presetTimeChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          const preset = chip.dataset.preset;
          const jstNow = getJSTNow();
          const target = new Date(jstNow);

          if (preset === '10m') {
            target.setMinutes(target.getMinutes() + 10);
          } else if (preset === '30m') {
            target.setMinutes(target.getMinutes() + 30);
          } else if (preset === '1h') {
            target.setHours(target.getHours() + 1);
          } else if (preset === 'tomorrow-9') {
            target.setDate(target.getDate() + 1);
            target.setHours(9, 0, 0, 0);
          } else if (preset === 'tomorrow-12') {
            target.setDate(target.getDate() + 1);
            target.setHours(12, 0, 0, 0);
          } else if (preset === 'tomorrow-20') {
            target.setDate(target.getDate() + 1);
            target.setHours(20, 0, 0, 0);
          }

          state.date = formatYMD(target);
          state.time = formatHM(target);
          if (el.inputDate) el.inputDate.value = state.date;
          if (el.inputTime) el.inputTime.value = state.time;

          jumpCalendarToDate(state.date);
          syncIosWheelPicker(state.time, true);
          updateQuickDatePills();
          updateScheduleSummaryCard();
          renderPreview();
          showToast(`⚡ 日時を ${state.date} ${state.time} に設定しました`);
        });
      });
    }

    // 4. Quick Date Selection Pills
    if (el.quickDatePills) {
      el.quickDatePills.forEach(pill => {
        pill.addEventListener('click', (e) => {
          e.preventDefault();
          const mode = pill.dataset.quickDate;
          const jstNow = getJSTNow();
          let target = new Date(jstNow);

          if (mode === 'today') {
            // keep today
          } else if (mode === 'tomorrow') {
            target.setDate(target.getDate() + 1);
          } else if (mode === 'after-tomorrow') {
            target.setDate(target.getDate() + 2);
          } else if (mode === 'next-week') {
            target.setDate(target.getDate() + 7);
          }

          state.date = formatYMD(target);
          if (el.inputDate) el.inputDate.value = state.date;
          jumpCalendarToDate(state.date);
          updateQuickDatePills();
          updateScheduleSummaryCard();
          renderPreview();
        });
      });
    }

    // 5. Calendar Prev / Next Month
    if (el.calPrevMonth) {
      el.calPrevMonth.addEventListener('click', (e) => {
        e.preventDefault();
        changeCalendarMonth(-1);
      });
    }
    if (el.calNextMonth) {
      el.calNextMonth.addEventListener('click', (e) => {
        e.preventDefault();
        changeCalendarMonth(1);
      });
    }

    // 6. Recurrence
    if (el.recurrenceType) {
      el.recurrenceType.addEventListener('change', (e) => {
        state.recurrence.type = e.target.value;
        if (el.weeklyDaysContainer) {
          el.weeklyDaysContainer.style.display = state.recurrence.type === 'weekly' ? 'block' : 'none';
        }
        renderPreview();
      });
    }

    if (el.weekdayCheckboxes) {
      el.weekdayCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
          state.recurrence.days = Array.from(el.weekdayCheckboxes)
            .filter(c => c.checked)
            .map(c => parseInt(c.value, 10));
          renderPreview();
        });
      });
    }

    // 7. Message Type Switcher
    if (el.messageTypeInputs) {
      el.messageTypeInputs.forEach(radio => {
        radio.addEventListener('change', (e) => {
          state.messageType = e.target.value;

          // 画像の引き継ぎ (未設定側へ既存画像を自動同期)
          if (state.messageType === 'plain' && !state.plain.image_data && state.embed.image_data) {
            state.plain.image_data = state.embed.image_data;
            state.plain.image_filename = state.embed.image_filename;
            state.plain.image_size = state.embed.image_size;
            updateImageDropzoneUI('plain');
          } else if (state.messageType === 'embed' && !state.embed.image_data && state.plain.image_data) {
            state.embed.image_data = state.plain.image_data;
            state.embed.image_filename = state.plain.image_filename;
            state.embed.image_size = state.plain.image_size;
            updateImageDropzoneUI('embed');
          }

          if (el.embedSettingsSection) el.embedSettingsSection.style.display = state.messageType === 'embed' ? 'block' : 'none';
          if (el.plainSettingsSection) el.plainSettingsSection.style.display = state.messageType === 'plain' ? 'block' : 'none';
          renderPreview();
        });
      });
    }

    // 8. Color Picker
    if (el.embedColorPicker) {
      el.embedColorPicker.addEventListener('input', (e) => {
        state.embed.color = e.target.value;
        if (el.embedColorHex) el.embedColorHex.value = e.target.value.toUpperCase();
        renderPreview();
      });
    }

    if (el.embedColorHex) {
      el.embedColorHex.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (isValidHex(val)) {
          state.embed.color = val;
          if (el.embedColorPicker) el.embedColorPicker.value = val;
          renderPreview();
        }
      });
    }

    document.querySelectorAll('.color-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const col = chip.dataset.color;
        state.embed.color = col;
        if (el.embedColorPicker) el.embedColorPicker.value = col;
        if (el.embedColorHex) el.embedColorHex.value = col;
        renderPreview();
      });
    });

    // 9. Embed Inputs
    if (el.embedTitle) {
      el.embedTitle.addEventListener('input', (e) => {
        state.embed.title = e.target.value;
        updateCharCounters();
        renderPreview();
      });
    }

    if (el.embedTitleUrl) {
      el.embedTitleUrl.addEventListener('input', (e) => {
        state.embed.title_url = e.target.value;
        renderPreview();
      });
    }

    if (el.embedDesc) {
      el.embedDesc.addEventListener('input', (e) => {
        state.embed.description = e.target.value;
        updateCharCounters();
        renderPreview();
      });
    }

    if (el.embedThumbnail) {
      el.embedThumbnail.addEventListener('input', (e) => {
        state.embed.thumbnail_url = e.target.value;
        renderPreview();
      });
    }

    if (el.embedImage) {
      el.embedImage.addEventListener('input', (e) => {
        state.embed.image_url = e.target.value;
        renderPreview();
      });
    }

    if (el.embedAuthorName) {
      el.embedAuthorName.addEventListener('input', (e) => {
        state.embed.author.name = e.target.value;
        renderPreview();
      });
    }

    if (el.embedAuthorIcon) {
      el.embedAuthorIcon.addEventListener('input', (e) => {
        state.embed.author.icon_url = e.target.value;
        renderPreview();
      });
    }

    if (el.embedAuthorUrl) {
      el.embedAuthorUrl.addEventListener('input', (e) => {
        state.embed.author.url = e.target.value;
        renderPreview();
      });
    }

    if (el.embedFooterText) {
      el.embedFooterText.addEventListener('input', (e) => {
        state.embed.footer.text = e.target.value;
        renderPreview();
      });
    }

    if (el.embedFooterIcon) {
      el.embedFooterIcon.addEventListener('input', (e) => {
        state.embed.footer.icon_url = e.target.value;
        renderPreview();
      });
    }

    if (el.btnAddField) {
      el.btnAddField.addEventListener('click', addEmbedField);
    }

    // 10. Plain Inputs
    if (el.plainContent) {
      el.plainContent.addEventListener('input', (e) => {
        state.plain.content = e.target.value;
        updateCharCounters();
        renderPreview();
      });
    }

    if (el.plainImage) {
      el.plainImage.addEventListener('input', (e) => {
        state.plain.image_url = e.target.value;
        renderPreview();
      });
    }

    // 11. Markdown Toolbars
    document.querySelectorAll('.markdown-toolbar').forEach(tb => {
      const targetId = tb.dataset.target;
      const targetTextarea = document.getElementById(targetId);
      if (!targetTextarea) return;

      tb.querySelectorAll('button[data-md]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const action = btn.dataset.md;
          if (action === 'bold') insertMarkdown(targetTextarea, '**', '**');
          else if (action === 'italic') insertMarkdown(targetTextarea, '*', '*');
          else if (action === 'code') insertMarkdown(targetTextarea, '`', '`');
          else if (action === 'codeblock') insertMarkdown(targetTextarea, '```\n', '\n```');
          else if (action === 'link') insertMarkdown(targetTextarea, '[', '](https://...)');
          else if (action === 'quote') insertMarkdown(targetTextarea, '> ', '');
        });
      });
    });

    // 12. Setup Base64 Dropzones
    setupDropzoneEvents(el.embedDropzone, el.embedFileInput, el.embedBtnRemoveImg, 'embed');
    setupDropzoneEvents(el.plainDropzone, el.plainFileInput, el.plainBtnRemoveImg, 'plain');

    // Clipboard Paste Listener (Ctrl+V / Paste anywhere on page)
    window.addEventListener('paste', (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleLocalImageFile(file, state.messageType);
            e.preventDefault();
            break;
          }
        }
      }
    });

    // 13. Link Buttons
    if (el.btnAddButton) {
      el.btnAddButton.addEventListener('click', addLinkButton);
    }

    // 14. Step 3 Action: Download Files (.rsv compressed & .json standard)
    const validateBeforeDownload = () => {
      const info = formatHumanReadableDateTime(state.date, state.time);
      if (info.isPast) {
        showToast('⚠️ 過去の日時は予約できません');
        goToStep(1);
        return false;
      }

      if (state.messageType === 'plain') {
        if (!state.plain.content.trim() && !state.plain.image_data && !state.plain.image_url.trim()) {
          showToast('⚠️ メッセージ本文または画像を入力してください');
          goToStep(2);
          return false;
        }
      } else {
        const hasContent = state.embed.title.trim() ||
          state.embed.description.trim() ||
          state.embed.image_data ||
          state.embed.image_url.trim() ||
          state.embed.fields.length > 0 ||
          state.embed.author.name.trim();
        if (!hasContent) {
          showToast('⚠️ タイトル、説明文、または画像を入力してください');
          goToStep(2);
          return false;
        }
      }
      return true;
    };

    if (el.btnDownloadRsv) {
      el.btnDownloadRsv.addEventListener('click', () => {
        if (!validateBeforeDownload()) return;

        const payload = buildPayload();
        const jsonStr = JSON.stringify(payload);
        const utf8Bytes = new TextEncoder().encode(jsonStr);
        let blob;
        if (typeof window.pako !== 'undefined') {
          const compressed = window.pako.deflate(utf8Bytes);
          blob = new Blob([compressed], { type: 'application/octet-stream' });
        } else {
          blob = new Blob([utf8Bytes], { type: 'application/octet-stream' });
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timeClean = (state.time || '1400').replace(':', '');
        a.download = `discord_reservation_${state.date}_${timeClean}.rsv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('🗜️ 圧縮予約ファイル (.rsv) をダウンロードしました！');
      });
    }

    if (el.btnDownloadJson) {
      el.btnDownloadJson.addEventListener('click', () => {
        if (!validateBeforeDownload()) return;

        const payload = buildPayload();
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timeClean = (state.time || '1400').replace(':', '');
        a.download = `discord_reservation_${state.date}_${timeClean}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('💾 予約ファイル (.json) をダウンロードしました！');
      });
    }

    // 15. Step 3 Action: Copy RSV1 Code (Secondary)
    if (el.btnCopyCode) {
      el.btnCopyCode.addEventListener('click', () => {
        if (!validateBeforeDownload()) return;

        const payload = buildPayload();
        const code = encodeReservationCode(payload);

        const onCopySuccess = () => {
          if (code.length > 3800) {
            showToast(`⚠️ コピー完了（約${code.length}文字）。Discordモーダルの4,000文字制限を超える恐れがあるため「予約ファイルをダウンロード」を推奨します`);
          } else {
            showToast('📋 予約コードをコピーしました！Discordで貼り付けてください');
          }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(onCopySuccess).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = code;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            onCopySuccess();
          });
        } else {
          const ta = document.createElement('textarea');
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          onCopySuccess();
        }
      });
    }

    // 16. Modal: Import Code or JSON / RSV File
    if (el.btnOpenImport) {
      el.btnOpenImport.addEventListener('click', () => {
        if (el.importCodeInput) el.importCodeInput.value = '';
        if (el.modalFileStatus) el.modalFileStatus.textContent = '';
        if (el.modalFileInput) el.modalFileInput.value = '';
        if (el.importErrorMsg) el.importErrorMsg.style.display = 'none';
        if (el.importModal) el.importModal.style.display = 'flex';
      });
    }

    if (el.modalCloseBtn) {
      el.modalCloseBtn.addEventListener('click', () => {
        el.importModal.style.display = 'none';
      });
    }

    if (el.modalCancelBtn) {
      el.modalCancelBtn.addEventListener('click', () => {
        el.importModal.style.display = 'none';
      });
    }

    if (el.modalFileInput) {
      el.modalFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (el.modalFileStatus) {
          el.modalFileStatus.textContent = `${file.name} (${formatFileSize(file.size)})`;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const buffer = evt.target.result;
            const uint8 = new Uint8Array(buffer);
            let jsonText = null;

            // 1. zlibバイナリ展開 (.rsv ファイル等)
            if (typeof window.pako !== 'undefined') {
              try {
                const decompressed = window.pako.inflate(uint8);
                jsonText = new TextDecoder('utf-8').decode(decompressed);
              } catch (_) {
                // Not zlib binary, fall through
              }
            }

            // 2. UTF-8テキストデコード (.json, .txt, RSV1_コード等)
            if (!jsonText) {
              jsonText = new TextDecoder('utf-8').decode(uint8);
            }

            if (el.importCodeInput) {
              el.importCodeInput.value = jsonText.length > 500 ? (jsonText.substring(0, 500) + '...') : jsonText;
            }
            const data = decodeReservationCode(jsonText);
            applyImportedData(data);
            el.importModal.style.display = 'none';
            showToast(`✅ ${file.name} を読み込みました！`);
          } catch (err) {
            if (el.importErrorMsg) {
              el.importErrorMsg.textContent = 'ファイルの読み込みに失敗しました: ' + err.message;
              el.importErrorMsg.style.display = 'block';
            }
          }
        };
        reader.onerror = () => {
          if (el.importErrorMsg) {
            el.importErrorMsg.textContent = 'ファイルの読み取りに失敗しました。';
            el.importErrorMsg.style.display = 'block';
          }
        };
        reader.readAsArrayBuffer(file);
      });
    }

    if (el.modalApplyBtn) {
      el.modalApplyBtn.addEventListener('click', () => {
        const codeStr = el.importCodeInput ? el.importCodeInput.value.trim() : '';
        if (!codeStr) {
          if (el.importErrorMsg) {
            el.importErrorMsg.textContent = 'コードまたはJSONを入力してください';
            el.importErrorMsg.style.display = 'block';
          }
          return;
        }
        try {
          const data = decodeReservationCode(codeStr);
          applyImportedData(data);
          el.importModal.style.display = 'none';
          showToast('予約設定を読み込みました');
        } catch (err) {
          if (el.importErrorMsg) {
            el.importErrorMsg.textContent = '無効な予約データです: ' + err.message;
            el.importErrorMsg.style.display = 'block';
          }
        }
      });
    }

    // 17. Reset Button
    if (el.btnReset) {
      el.btnReset.addEventListener('click', () => {
        if (!confirm('入力内容を初期状態にリセットしますか？')) return;
        initDefaults();
        state.embed = {
          color: '#5865F2',
          author: { name: '', icon_url: '', url: '' },
          title: '',
          title_url: '',
          description: '',
          fields: [],
          thumbnail_url: '',
          image_url: '',
          image_data: '',
          image_filename: '',
          image_size: 0,
          footer: { text: '', icon_url: '' }
        };
        state.plain = {
          content: '',
          image_url: '',
          image_data: '',
          image_filename: '',
          image_size: 0
        };
        state.buttons = [];

        if (el.embedTitle) el.embedTitle.value = '';
        if (el.embedTitleUrl) el.embedTitleUrl.value = '';
        if (el.embedDesc) el.embedDesc.value = '';
        if (el.embedThumbnail) el.embedThumbnail.value = '';
        if (el.embedImage) el.embedImage.value = '';
        if (el.embedAuthorName) el.embedAuthorName.value = '';
        if (el.embedAuthorIcon) el.embedAuthorIcon.value = '';
        if (el.embedAuthorUrl) el.embedAuthorUrl.value = '';
        if (el.embedFooterText) el.embedFooterText.value = '';
        if (el.embedFooterIcon) el.embedFooterIcon.value = '';
        if (el.plainContent) el.plainContent.value = '';
        if (el.plainImage) el.plainImage.value = '';

        updateImageDropzoneUI('embed');
        updateImageDropzoneUI('plain');
        renderEmbedFieldsList();
        renderButtonsList();
        updateCharCounters();
        renderPreview();
        goToStep(1);
        showToast('リセットしました');
      });
    }
  }

  // --- Theme Management ---
  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }

  function getEffectiveTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return getSystemTheme();
  }

  function applyTheme(isLight) {
    document.documentElement.classList.toggle('light-theme', isLight);
    document.body.classList.toggle('light-theme', isLight);
    updateThemeIcon(isLight);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isLight ? '#f2f3f5' : '#1e1f22');
    }
  }

  function initTheme() {
    const isLight = getEffectiveTheme() === 'light';
    applyTheme(isLight);
  }

  function toggleTheme() {
    const currentIsLight = document.body.classList.contains('light-theme');
    const nextIsLight = !currentIsLight;
    localStorage.setItem('theme', nextIsLight ? 'light' : 'dark');
    applyTheme(nextIsLight);
  }

  function updateThemeIcon(isLight) {
    if (!el.themeToggle) return;
    const iconSpan = el.themeToggle.querySelector('.theme-icon');
    if (iconSpan) {
      iconSpan.textContent = isLight ? '☀️' : '🌙';
    } else {
      el.themeToggle.textContent = isLight ? '☀️' : '🌙';
    }
    const tip = isLight ? 'ダークモードに切り替え' : 'ライトモードに切り替え';
    el.themeToggle.setAttribute('title', tip);
    el.themeToggle.setAttribute('aria-label', tip);
  }

  function setupThemeListeners() {
    if (el.themeToggle) {
      el.themeToggle.addEventListener('click', toggleTheme);
    }
    if (window.matchMedia) {
      try {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
          if (!localStorage.getItem('theme')) {
            applyTheme(e.matches);
          }
        });
      } catch (err) {
        console.warn('matchMedia listener error:', err);
      }
    }
  }

  // --- Initialize App ---
  function init() {
    initTheme();
    setupThemeListeners();
    initDefaults();
    parseQueryParams();
    renderEmbedFieldsList();
    renderButtonsList();
    updateCharCounters();
    attachEventHandlers();
    renderPreview();
    goToStep(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
