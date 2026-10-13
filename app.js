/**
 * Discord Message Scheduler - Web App JavaScript
 * 3-Step Wizard, Real-time Discord Preview, Datetime validation, Recurrence, URL Buttons, and RSV1 Code Generator/Decoder
 */

(() => {
  'use strict';

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
      image_url: '',
      footer: { text: '', icon_url: '' }
    },
    plain: {
      content: '',
      image_url: ''
    },
    buttons: [] // [{ id: string, label: string, url: string, emoji: string }]
  };

  // --- DOM Elements ---
  const el = {
    // Header
    targetChannelBadge: document.getElementById('target-channel-badge'),
    targetChannelName: document.getElementById('target-channel-name'),
    targetChannelId: document.getElementById('target-channel-id'),
    btnOpenImport: document.getElementById('btn-open-import'),
    btnReset: document.getElementById('btn-reset'),

    // Wizard navigation & Steps
    wizardStepBtns: document.querySelectorAll('.wizard-step-btn'),
    stepPanes: {
      1: document.getElementById('step-pane-1'),
      2: document.getElementById('step-pane-2'),
      3: document.getElementById('step-pane-3'),
    },
    btnStepNextList: document.querySelectorAll('.btn-step-next'),
    btnStepPrevList: document.querySelectorAll('.btn-step-prev'),

    // Mobile tabs
    tabEdit: document.getElementById('tab-edit'),
    tabPreview: document.getElementById('tab-preview'),
    editorPane: document.getElementById('editor-container'),
    previewPane: document.getElementById('preview-container'),

    // Schedule Summary Card & Presets
    summaryCardMain: document.getElementById('summary-card-main'),
    summaryCardSub: document.getElementById('summary-card-sub'),
    datetimeWarning: document.getElementById('datetime-warning'),
    presetPills: document.querySelectorAll('.preset-pill-btn'),

    // Calendar
    calPrevMonth: document.getElementById('cal-prev-month'),
    calNextMonth: document.getElementById('cal-next-month'),
    calMonthLabel: document.getElementById('cal-month-label'),
    calDaysGrid: document.getElementById('cal-days-grid'),
    quickDatePills: document.querySelectorAll('.date-pill-btn'),
    inputDate: document.getElementById('input-date'),

    // Digital Clock & Time Picker
    timeDisplayBadge: document.getElementById('time-display-badge'),
    clockNumHour: document.getElementById('clock-num-hour'),
    clockNumMinute: document.getElementById('clock-num-minute'),
    hourStepUp: document.getElementById('hour-step-up'),
    hourStepDown: document.getElementById('hour-step-down'),
    minuteStepUp: document.getElementById('minute-step-up'),
    minuteStepDown: document.getElementById('minute-step-down'),
    btnPeriodPm: document.getElementById('btn-period-pm'),
    btnPeriodAm: document.getElementById('btn-period-am'),
    hourChipsGrid: document.getElementById('hour-chips-grid'),
    minuteChipsGrid: document.getElementById('minute-chips-grid'),
    inputTime: document.getElementById('input-time'),
    selectHour: document.getElementById('select-hour'),
    selectMinute: document.getElementById('select-minute'),

    // Recurrence
    recurrenceType: document.getElementById('recurrence-type'),
    weeklyDaysContainer: document.getElementById('weekly-days-container'),
    weekdayCheckboxes: document.querySelectorAll('input[name="weekday"]'),

    // Message type
    messageTypeInputs: document.querySelectorAll('input[name="message-type"]'),
    embedSettingsSection: document.getElementById('embed-settings-section'),
    plainSettingsSection: document.getElementById('plain-settings-section'),

    // Embed fields
    embedColorPicker: document.getElementById('embed-color-picker'),
    embedColorHex: document.getElementById('embed-color-hex'),
    embedAuthorName: document.getElementById('embed-author-name'),
    embedAuthorIcon: document.getElementById('embed-author-icon'),
    embedAuthorUrl: document.getElementById('embed-author-url'),
    embedTitle: document.getElementById('embed-title'),
    embedTitleUrl: document.getElementById('embed-title-url'),
    embedDesc: document.getElementById('embed-desc'),
    embedThumbnail: document.getElementById('embed-thumbnail'),
    embedImage: document.getElementById('embed-image'),
    embedImageFile: document.getElementById('embed-image-file'),
    embedUploadStatus: document.getElementById('embed-upload-status'),
    embedFooterText: document.getElementById('embed-footer-text'),
    embedFooterIcon: document.getElementById('embed-footer-icon'),
    fieldsList: document.getElementById('fields-list'),
    btnAddField: document.getElementById('btn-add-field'),

    // Plain fields
    plainContent: document.getElementById('plain-content'),
    plainImage: document.getElementById('plain-image'),
    plainImageFile: document.getElementById('plain-image-file'),
    plainUploadStatus: document.getElementById('plain-upload-status'),

    // URL Link Buttons
    btnAddButton: document.getElementById('btn-add-button'),
    buttonsList: document.getElementById('buttons-list'),
    buttonsEmptyHint: document.getElementById('buttons-empty-hint'),

    // Review & Actions
    reviewDatetime: document.getElementById('review-datetime'),
    reviewRecurrence: document.getElementById('review-recurrence'),
    reviewType: document.getElementById('review-type'),
    reviewButtonsCount: document.getElementById('review-buttons-count'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    btnDownloadJson: document.getElementById('btn-download-json'),

    // Preview Elements
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
    previewEmbedDesc: document.getElementById('preview-embed-desc'),
    previewEmptyHint: document.getElementById('preview-empty-hint'),
    previewEmbedThumbWrap: document.getElementById('preview-embed-thumb-wrap'),
    previewEmbedThumb: document.getElementById('preview-embed-thumb'),
    previewEmbedImageWrap: document.getElementById('preview-embed-image-wrap'),
    previewEmbedImage: document.getElementById('preview-embed-image'),
    previewEmbedFooter: document.getElementById('preview-embed-footer'),
    previewEmbedFooterIcon: document.getElementById('preview-embed-footer-icon'),
    previewEmbedFooterText: document.getElementById('preview-embed-footer-text'),
    previewEmbedFooterTime: document.getElementById('preview-embed-footer-time'),
    previewEmbedFields: document.getElementById('preview-embed-fields'),
    previewButtonsRow: document.getElementById('preview-buttons-row'),

    // Schedule summary
    summaryNextTime: document.getElementById('summary-next-time'),
    summaryRecurrence: document.getElementById('summary-recurrence'),
    summaryType: document.getElementById('summary-type'),

    // Modal
    importModal: document.getElementById('import-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalApplyBtn: document.getElementById('modal-apply-btn'),
    modalFileInput: document.getElementById('modal-file-input'),
    modalFileStatus: document.getElementById('modal-file-status'),
    importCodeInput: document.getElementById('import-code-input'),
    importErrorMsg: document.getElementById('import-error-msg'),

    // Toast
    toast: document.getElementById('toast'),
    toastText: document.getElementById('toast-text'),
  };

  // --- Weekday Names in Japanese ---
  const WEEKDAYS_JP = ['月', '火', '水', '木', '金', '土', '日'];
  const WEEKDAYS_FULL_JP = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

  // --- Step Wizard Logic ---
  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 3) return;
    state.currentStep = stepNum;

    // Update wizard buttons
    el.wizardStepBtns.forEach(btn => {
      const s = parseInt(btn.dataset.step, 10);
      btn.classList.toggle('active', s === stepNum);
      btn.classList.toggle('completed', s < stepNum);
    });

    // Update step panes
    Object.keys(el.stepPanes).forEach(k => {
      const pane = el.stepPanes[k];
      if (pane) {
        pane.classList.toggle('active', parseInt(k, 10) === stepNum);
      }
    });

    // If step 3, update review card
    if (stepNum === 3) {
      updateReviewCard();
    }

    // Scroll to top of editor pane
    if (el.editorPane) {
      el.editorPane.scrollTop = 0;
    }
  }

  function updateReviewCard() {
    const dtInfo = formatHumanReadableDateTime(state.date, state.time);
    el.reviewDatetime.textContent = dtInfo.fullText || '未設定';

    let recText = '1回のみ';
    if (state.recurrence.type === 'daily') recText = '毎日';
    else if (state.recurrence.type === 'weekdays') recText = '平日（月〜金）';
    else if (state.recurrence.type === 'monthly') recText = '毎月';
    else if (state.recurrence.type === 'weekly') {
      const days = state.recurrence.days.map(d => WEEKDAYS_JP[d]).join(', ');
      recText = `毎週 (${days || '曜日未指定'})`;
    }
    el.reviewRecurrence.textContent = recText;
    el.reviewType.textContent = state.messageType === 'embed' ? 'Embed（埋め込み）' : '通常テキスト';
    el.reviewButtonsCount.textContent = `${state.buttons.length}個`;
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

    const weekdayIdx = targetDt.getDay(); // 0: Sun, 1: Mon, ...
    const adjustedIdx = (weekdayIdx + 6) % 7; // 0: Mon, ..., 6: Sun
    const weekdayStr = WEEKDAYS_JP[adjustedIdx];

    const fullText = `${y}年${m}月${d}日(${weekdayStr}) ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')} (JST)`;

    // Relative calculation
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

  function updateScheduleSummaryCard() {
    const info = formatHumanReadableDateTime(state.date, state.time);
    if (!info.fullText) {
      el.summaryCardMain.textContent = '日時を選択してください';
      el.summaryCardSub.textContent = '-';
      el.datetimeWarning.style.display = 'none';
      return;
    }

    el.summaryCardMain.textContent = info.fullText;
    el.summaryCardSub.textContent = info.relativeText;
    el.dateWeekdayBadge.textContent = info.weekdayFull || '';

    if (info.isPast) {
      el.summaryCardSub.style.color = '#ff787b';
      el.datetimeWarning.style.display = 'block';
    } else {
      el.summaryCardSub.style.color = '#8ea1e1';
      el.datetimeWarning.style.display = 'none';
    }
  }

  // --- Calendar & Clock State ---
  let calViewYear = 2026;
  let calViewMonth = 9; // 0-indexed (9 = Oct)
  let clockPeriod = 'pm'; // 'am' | 'pm'

  // --- Calendar Logic ---
  function renderCalendar() {
    if (!el.calMonthLabel || !el.calDaysGrid) return;
    el.calMonthLabel.textContent = `${calViewYear}年 ${calViewMonth + 1}月`;
    el.calDaysGrid.innerHTML = '';

    const jstNow = getJSTNow();
    const todayYMD = formatYMD(jstNow);

    // Monday start: 0=Mon, ..., 6=Sun
    const firstDayRaw = new Date(calViewYear, calViewMonth, 1).getDay();
    const firstDayMondayBased = (firstDayRaw + 6) % 7;
    const totalDays = new Date(calViewYear, calViewMonth + 1, 0).getDate();
    const prevTotalDays = new Date(calViewYear, calViewMonth, 0).getDate();

    // 1. Previous month trailing days
    for (let i = firstDayMondayBased - 1; i >= 0; i--) {
      const dayNum = prevTotalDays - i;
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month disabled';
      cell.textContent = dayNum;
      el.calDaysGrid.appendChild(cell);
    }

    // 2. Current month days
    for (let d = 1; d <= totalDays; d++) {
      const ymd = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.textContent = d;

      if (ymd < todayYMD) {
        cell.classList.add('disabled', 'is-past');
      } else {
        cell.addEventListener('click', () => {
          state.date = ymd;
          el.inputDate.value = state.date;
          renderCalendar();
          updateScheduleSummaryCard();
          renderPreview();
        });
      }

      if (ymd === todayYMD) {
        cell.classList.add('is-today');
      }

      if (ymd === state.date) {
        cell.classList.add('is-selected');
      }

      el.calDaysGrid.appendChild(cell);
    }

    // 3. Next month leading days (pad to 7-column rows)
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

  // --- Clock / Time Picker Logic ---
  function renderTimePicker() {
    if (!el.clockNumHour || !el.clockNumMinute) return;
    if (!state.time) state.time = '12:00';
    const [hStr, mStr] = state.time.split(':');
    let h = parseInt(hStr, 10);
    let m = parseInt(mStr, 10);
    if (isNaN(h)) h = 12;
    if (isNaN(m)) m = 0;

    // Digital display
    el.clockNumHour.textContent = String(h).padStart(2, '0');
    el.clockNumMinute.textContent = String(m).padStart(2, '0');
    if (el.timeDisplayBadge) {
      el.timeDisplayBadge.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // Period toggle
    clockPeriod = (h >= 12) ? 'pm' : 'am';
    if (el.btnPeriodPm) el.btnPeriodPm.classList.toggle('active', clockPeriod === 'pm');
    if (el.btnPeriodAm) el.btnPeriodAm.classList.toggle('active', clockPeriod === 'am');

    // Hour chips
    renderHourChips(h);

    // Minute chips
    renderMinuteChips(m);
  }

  function renderHourChips(activeHour) {
    if (!el.hourChipsGrid) return;
    el.hourChipsGrid.innerHTML = '';
    const startHour = (clockPeriod === 'pm') ? 12 : 0;
    const endHour = startHour + 11;

    for (let h = startHour; h <= endHour; h++) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'hour-chip' + (h === activeHour ? ' active' : '');
      chip.textContent = `${h}時`;
      chip.addEventListener('click', () => {
        setHour(h);
      });
      el.hourChipsGrid.appendChild(chip);
    }
  }

  function renderMinuteChips(activeMinute) {
    if (!el.minuteChipsGrid) return;
    el.minuteChipsGrid.innerHTML = '';
    for (let m = 0; m < 60; m += 5) {
      const chip = document.createElement('button');
      chip.type = 'button';
      const isMatch = (activeMinute === m) || (Math.abs(activeMinute - m) <= 2 && Math.round(activeMinute / 5) * 5 === m);
      chip.className = 'minute-chip' + (isMatch ? ' active' : '');
      chip.textContent = `${String(m).padStart(2, '0')}分`;
      chip.addEventListener('click', () => {
        setMinute(m);
      });
      el.minuteChipsGrid.appendChild(chip);
    }
  }

  function setHour(h) {
    const curM = state.time ? state.time.split(':')[1] : '00';
    state.time = `${String(h).padStart(2, '0')}:${curM}`;
    el.inputTime.value = state.time;
    renderTimePicker();
    updateScheduleSummaryCard();
    renderPreview();
  }

  function setMinute(m) {
    const curH = state.time ? state.time.split(':')[0] : '12';
    state.time = `${curH}:${String(m).padStart(2, '0')}`;
    el.inputTime.value = state.time;
    renderTimePicker();
    updateScheduleSummaryCard();
    renderPreview();
  }

  function stepHour(delta) {
    let [h, m] = (state.time || '12:00').split(':').map(Number);
    h = (h + delta + 24) % 24;
    state.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    el.inputTime.value = state.time;
    renderTimePicker();
    updateScheduleSummaryCard();
    renderPreview();
  }

  function stepMinute(delta) {
    let [h, m] = (state.time || '12:00').split(':').map(Number);
    m = m + delta;
    if (m >= 60) {
      m = 0;
      h = (h + 1) % 24;
    } else if (m < 0) {
      m = 55;
      h = (h - 1 + 24) % 24;
    }
    state.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    el.inputTime.value = state.time;
    renderTimePicker();
    updateScheduleSummaryCard();
    renderPreview();
  }

  // --- Quick Presets Logic ---
  function applyPreset(mode) {
    const jstNow = getJSTNow();
    let target = new Date(jstNow);

    if (mode === 'in-30m') {
      target.setMinutes(target.getMinutes() + 30);
    } else if (mode === 'in-1h') {
      target.setMinutes(target.getMinutes() + 60);
    } else if (mode === 'tonight') {
      target.setHours(20, 0, 0, 0);
      if (target.getTime() <= jstNow.getTime()) {
        target.setDate(target.getDate() + 1);
      }
    } else if (mode === 'tomorrow-morning') {
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (mode === 'tomorrow-noon') {
      target.setDate(target.getDate() + 1);
      target.setHours(12, 0, 0, 0);
    } else if (mode === 'tomorrow-evening') {
      target.setDate(target.getDate() + 1);
      target.setHours(19, 0, 0, 0);
    }

    state.date = formatYMD(target);
    state.time = formatHM(target);
    el.inputDate.value = state.date;
    el.inputTime.value = state.time;

    jumpCalendarToDate(state.date);
    renderTimePicker();
    updateScheduleSummaryCard();
    renderPreview();
    showToast('⚡ 日時を設定しました');
  }

  // --- Initial Defaults ---
  function initDefaults() {
    const jstNow = getJSTNow();
    const future = new Date(jstNow.getTime() + 60 * 60000);
    const mRem = future.getMinutes() % 5;
    if (mRem !== 0) {
      future.setMinutes(future.getMinutes() + (5 - mRem));
    }

    state.date = formatYMD(future);
    state.time = formatHM(future);

    el.inputDate.value = state.date;
    el.inputTime.value = state.time;

    jumpCalendarToDate(state.date);
    renderTimePicker();
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

  // --- URL Link Buttons Logic ---
  function renderButtonsList() {
    el.buttonsList.innerHTML = '';
    if (state.buttons.length === 0) {
      el.buttonsEmptyHint.style.display = 'block';
    } else {
      el.buttonsEmptyHint.style.display = 'none';
    }

    state.buttons.forEach((btn, index) => {
      const card = document.createElement('div');
      card.className = 'button-item-card';
      card.innerHTML = `
        <div class="button-item-top">
          <span class="button-item-badge">ボタン #${index + 1}</span>
          <button type="button" class="button-delete-btn" data-id="${btn.id}">削除</button>
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-sublabel">ボタン表示名</label>
            <input type="text" class="form-input btn-label-input" placeholder="例: 🚀 公式サイトへ移動" value="${escapeHtml(btn.label)}" maxlength="80">
            <span class="field-help-text">※絵文字を表示したい場合はテキスト内に直接入力してください</span>
          </div>
          <div class="form-group flex-1">
            <label class="form-sublabel">リンク先 URL</label>
            <input type="url" class="form-input btn-url-input" placeholder="https://..." value="${escapeHtml(btn.url)}">
          </div>
        </div>
      `;

      // Event listeners
      const labelInput = card.querySelector('.btn-label-input');
      const urlInput = card.querySelector('.btn-url-input');
      const deleteBtn = card.querySelector('.button-delete-btn');

      labelInput.addEventListener('input', (e) => {
        btn.label = e.target.value;
        renderPreview();
      });

      urlInput.addEventListener('input', (e) => {
        btn.url = e.target.value;
        renderPreview();
      });

      deleteBtn.addEventListener('click', () => {
        state.buttons = state.buttons.filter(b => b.id !== btn.id);
        renderButtonsList();
        renderPreview();
      });

      el.buttonsList.appendChild(card);
    });

    el.btnAddButton.disabled = state.buttons.length >= 5;
    if (state.buttons.length >= 5) {
      el.btnAddButton.style.opacity = '0.5';
    } else {
      el.btnAddButton.style.opacity = '1';
    }
  }

  function addButton() {
    if (state.buttons.length >= 5) return;
    const newBtn = {
      id: 'btn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      label: '',
      url: ''
    };
    state.buttons.push(newBtn);
    renderButtonsList();
    renderPreview();
  }

  // --- Image Upload to Free Image Hosting (ImgBB API) ---
  async function handleImageUpload(file, targetType) {
    if (!file) return;
    const statusEl = targetType === 'embed' ? el.embedUploadStatus : el.plainUploadStatus;
    statusEl.textContent = '⏳ アップロード中...';
    statusEl.style.color = '#8ea1e1';

    try {
      // Free ImgBB anonymous key
      const apiKey = '6d207e02198a847aa5a0a033b6948a30';
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('アップロードAPIエラー');
      const data = await res.json();
      if (!data || !data.data || !data.data.url) throw new Error('レスポンス異常');

      const imageUrl = data.data.url;
      if (targetType === 'embed') {
        state.embed.image_url = imageUrl;
        el.embedImage.value = imageUrl;
      } else {
        state.plain.image_url = imageUrl;
        el.plainImage.value = imageUrl;
      }

      statusEl.textContent = '✅ アップロード完了！URLが設定されました';
      statusEl.style.color = 'var(--brand-green)';
      renderPreview();
      setTimeout(() => { statusEl.textContent = ''; }, 4000);
    } catch (err) {
      console.warn('Image upload error:', err);
      statusEl.textContent = '⚠️ アップロード失敗。Discordに画像を貼り、画像リンクをコピーして貼り付けてください。';
      statusEl.style.color = 'var(--brand-red)';
    }
  }

  // --- Dynamic Embed Fields Logic ---
  function renderEmbedFieldsList() {
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
            <input type="text" class="form-input field-name-input" placeholder="名前 (例: 日時)" value="${escapeHtml(field.name)}" maxlength="256">
          </div>
          <div class="form-group flex-1">
            <input type="text" class="form-input field-val-input" placeholder="値 (例: 20:00〜)" value="${escapeHtml(field.value)}" maxlength="1024">
          </div>
        </div>
        <label class="field-inline-toggle">
          <input type="checkbox" class="field-inline-chk" ${field.inline ? 'checked' : ''}>
          <span>横並び表示 (インライン)</span>
        </label>
      `;

      const nameInput = item.querySelector('.field-name-input');
      const valInput = item.querySelector('.field-val-input');
      const inlineChk = item.querySelector('.field-inline-chk');
      const delBtn = item.querySelector('.field-delete-btn');

      nameInput.addEventListener('input', (e) => {
        field.name = e.target.value;
        renderPreview();
      });

      valInput.addEventListener('input', (e) => {
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

    el.btnAddField.disabled = state.embed.fields.length >= 25;
  }

  function addEmbedField() {
    if (state.embed.fields.length >= 25) return;
    state.embed.fields.push({
      id: 'fld_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: '',
      value: '',
      inline: false
    });
    renderEmbedFieldsList();
    renderPreview();
  }

  // --- Real-Time Discord Client Preview Renderer ---
  function renderPreview() {
    // 1. Timestamp
    if (state.date && state.time) {
      const info = formatHumanReadableDateTime(state.date, state.time);
      const parts = state.date.split('-');
      el.previewTimestamp.textContent = `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)} ${state.time}`;
      el.summaryNextTime.textContent = info.fullText || `${state.date} ${state.time}`;
    } else {
      el.previewTimestamp.textContent = '-';
      el.summaryNextTime.textContent = '-';
    }

    // 2. Recurrence tag
    let recLabel = '1回のみ';
    if (state.recurrence.type === 'daily') recLabel = '毎日';
    else if (state.recurrence.type === 'weekdays') recLabel = '平日のみ';
    else if (state.recurrence.type === 'monthly') recLabel = '毎月';
    else if (state.recurrence.type === 'weekly') {
      const days = state.recurrence.days.map(d => WEEKDAYS_JP[d]).join(',');
      recLabel = `毎週(${days || '未選択'})`;
    }
    el.previewRecurrenceBadge.textContent = recLabel;
    el.summaryRecurrence.textContent = recLabel;
    el.summaryType.textContent = state.messageType === 'embed' ? 'Embed' : '通常テキスト';

    // 3. Message Mode
    if (state.messageType === 'plain') {
      el.previewPlainWrap.style.display = 'block';
      el.previewEmbedWrap.style.display = 'none';

      // Plain Text
      const rawText = state.plain.content.trim();
      el.previewPlainText.innerHTML = rawText ? renderMarkdown(rawText) : '<span style="color:#72767d; font-style:italic;">メッセージを入力してください</span>';

      // Plain Image
      if (isValidUrl(state.plain.image_url)) {
        el.previewPlainImage.src = state.plain.image_url;
        el.previewPlainImageWrap.style.display = 'block';
      } else {
        el.previewPlainImageWrap.style.display = 'none';
      }
    } else {
      el.previewPlainWrap.style.display = 'none';
      el.previewEmbedWrap.style.display = 'block';

      // Color Pill
      const colorHex = isValidHex(state.embed.color) ? state.embed.color : '#5865F2';
      el.previewEmbedPill.style.backgroundColor = colorHex;

      // Author
      if (state.embed.author.name) {
        el.previewEmbedAuthor.style.display = 'flex';
        el.previewEmbedAuthorLink.textContent = state.embed.author.name;
        if (isValidUrl(state.embed.author.url)) {
          el.previewEmbedAuthorLink.href = state.embed.author.url;
        } else {
          el.previewEmbedAuthorLink.removeAttribute('href');
        }

        if (isValidUrl(state.embed.author.icon_url)) {
          el.previewEmbedAuthorIcon.src = state.embed.author.icon_url;
          el.previewEmbedAuthorIcon.style.display = 'block';
        } else {
          el.previewEmbedAuthorIcon.style.display = 'none';
        }
      } else {
        el.previewEmbedAuthor.style.display = 'none';
      }

      // Title
      if (state.embed.title) {
        el.previewEmbedTitleWrap.style.display = 'block';
        el.previewEmbedTitleLink.textContent = state.embed.title;
        if (isValidUrl(state.embed.title_url)) {
          el.previewEmbedTitleLink.href = state.embed.title_url;
        } else {
          el.previewEmbedTitleLink.removeAttribute('href');
        }
      } else {
        el.previewEmbedTitleWrap.style.display = 'none';
      }

      // Description & Empty Hint
      const hasContent = state.embed.title || state.embed.description || state.embed.fields.length > 0 || state.embed.image_url;
      if (state.embed.description) {
        el.previewEmbedDesc.innerHTML = renderMarkdown(state.embed.description);
        el.previewEmbedDesc.style.display = 'block';
        el.previewEmptyHint.style.display = 'none';
      } else {
        el.previewEmbedDesc.style.display = 'none';
        el.previewEmptyHint.style.display = hasContent ? 'none' : 'block';
      }

      // Fields
      if (state.embed.fields.length > 0) {
        el.previewEmbedFields.style.display = 'grid';
        el.previewEmbedFields.innerHTML = '';
        state.embed.fields.forEach(f => {
          if (!f.name && !f.value) return;
          const fEl = document.createElement('div');
          fEl.className = 'embed-field-item' + (f.inline ? '' : ' full-width');
          fEl.innerHTML = `
            <div class="embed-field-name">${escapeHtml(f.name || '\u200b')}</div>
            <div class="embed-field-value">${renderMarkdown(f.value || '\u200b')}</div>
          `;
          el.previewEmbedFields.appendChild(fEl);
        });
      } else {
        el.previewEmbedFields.style.display = 'none';
      }

      // Thumbnail
      if (isValidUrl(state.embed.thumbnail_url)) {
        el.previewEmbedThumb.src = state.embed.thumbnail_url;
        el.previewEmbedThumbWrap.style.display = 'block';
      } else {
        el.previewEmbedThumbWrap.style.display = 'none';
      }

      // Image
      if (isValidUrl(state.embed.image_url)) {
        el.previewEmbedImage.src = state.embed.image_url;
        el.previewEmbedImageWrap.style.display = 'block';
      } else {
        el.previewEmbedImageWrap.style.display = 'none';
      }

      // Footer
      if (state.embed.footer.text) {
        el.previewEmbedFooter.style.display = 'flex';
        el.previewEmbedFooterText.textContent = state.embed.footer.text;

        if (isValidUrl(state.embed.footer.icon_url)) {
          el.previewEmbedFooterIcon.src = state.embed.footer.icon_url;
          el.previewEmbedFooterIcon.style.display = 'block';
        } else {
          el.previewEmbedFooterIcon.style.display = 'none';
        }

        if (state.date && state.time) {
          el.previewEmbedFooterTime.textContent = `${state.date} ${state.time}`;
          el.previewEmbedFooterTime.style.display = 'inline';
        } else {
          el.previewEmbedFooterTime.style.display = 'none';
        }
      } else {
        el.previewEmbedFooter.style.display = 'none';
      }
    }

    // 4. URL Link Buttons Component Preview (ActionRow)
    if (state.buttons.length > 0) {
      el.previewButtonsRow.style.display = 'flex';
      el.previewButtonsRow.innerHTML = '';
      state.buttons.forEach(btn => {
        const label = btn.label.trim() || 'Link Button';
        const linkBtn = document.createElement('a');
        linkBtn.className = 'discord-link-btn';
        if (isValidUrl(btn.url)) {
          linkBtn.href = btn.url;
          linkBtn.target = '_blank';
          linkBtn.rel = 'noopener noreferrer';
        } else {
          linkBtn.href = 'javascript:void(0)';
        }

        const inner = `<span>${escapeHtml(label)}</span> <svg class="btn-ext-icon" viewBox="0 0 24 24"><path d="M10 5V3H5.00001C3.89544 3 3.00001 3.89543 3.00001 5V19C3.00001 20.1046 3.89544 21 5.00001 21H19C20.1046 21 21 20.1046 21 19V14H19V19H5.00001V5H10ZM14 3V5H17.5858L9.2929 13.2929L10.7071 14.7071L19 6.41421V10H21V3H14Z"/></svg>`;

        linkBtn.innerHTML = inner;
        el.previewButtonsRow.appendChild(linkBtn);
      });
    } else {
      el.previewButtonsRow.style.display = 'none';
    }
  }

  // --- Markdown Parser with Code Block Stashing ---
  function renderMarkdown(text) {
    if (!text) return '';
    let out = String(text);

    // Stash code blocks and inline code
    const stashed = [];
    out = out.replace(/```([\s\S]*?)```/g, (_, code) => {
      stashed.push(`<pre class="discord-pre"><code>${escapeHtml(code.trim())}</code></pre>`);
      return `%%STASH_${stashed.length - 1}%%`;
    });
    out = out.replace(/`([^`]+)`/g, (_, code) => {
      stashed.push(`<code class="discord-code">${escapeHtml(code)}</code>`);
      return `%%STASH_${stashed.length - 1}%%`;
    });

    out = escapeHtml(out);

    // Bold & Italics
    out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    out = out.replace(/__([^_]+)__/g, '<u>$1</u>');
    out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Links [text](url)
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Mentions & Channels
    out = out.replace(/&lt;@!?(\d+)&gt;/g, '<span class="discord-mention">@user</span>');
    out = out.replace(/&lt;#(\d+)&gt;/g, '<span class="discord-mention">#channel</span>');
    out = out.replace(/&lt;@&amp;(\d+)&gt;/g, '<span class="discord-mention">@role</span>');

    // Line breaks
    out = out.replace(/\n/g, '<br>');

    // Restore code blocks
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

  // --- RSV1 Code Generation & Decoding (pako.js zlib) ---
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
      payload.content = {
        text: state.plain.content.trim(),
        ...(state.plain.image_url ? { image_url: state.plain.image_url.trim() } : {})
      };
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
      if (isValidUrl(state.embed.image_url)) c.image_url = state.embed.image_url.trim();

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

    // Attach Link Buttons if any
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
      el.inputDate.value = state.date;
      el.inputTime.value = state.time;
      syncTimeSelectsFromState();
      updateScheduleSummaryCard();
    }

    if (data.recurrence) {
      state.recurrence.type = data.recurrence.type || 'none';
      state.recurrence.days = Array.isArray(data.recurrence.days) ? data.recurrence.days : [];
      el.recurrenceType.value = state.recurrence.type;
      el.weeklyDaysContainer.style.display = state.recurrence.type === 'weekly' ? 'block' : 'none';
      el.weekdayCheckboxes.forEach(cb => {
        cb.checked = state.recurrence.days.includes(parseInt(cb.value, 10));
      });
    }

    if (data.type) {
      state.messageType = data.type;
      el.messageTypeInputs.forEach(r => {
        r.checked = (r.value === state.messageType);
      });
      el.embedSettingsSection.style.display = state.messageType === 'embed' ? 'block' : 'none';
      el.plainSettingsSection.style.display = state.messageType === 'plain' ? 'block' : 'none';
    }

    // Embed Content
    const c = data.content || {};
    if (state.messageType === 'embed') {
      if (typeof c.color === 'number') {
        const hex = '#' + c.color.toString(16).padStart(6, '0');
        state.embed.color = hex;
        el.embedColorPicker.value = hex;
        el.embedColorHex.value = hex;
      }
      state.embed.title = c.title || '';
      el.embedTitle.value = state.embed.title;
      state.embed.title_url = c.title_url || '';
      el.embedTitleUrl.value = state.embed.title_url;
      state.embed.description = c.description || '';
      el.embedDesc.value = state.embed.description;

      state.embed.author = c.author || { name: '', icon_url: '', url: '' };
      el.embedAuthorName.value = state.embed.author.name || '';
      el.embedAuthorIcon.value = state.embed.author.icon_url || '';
      el.embedAuthorUrl.value = state.embed.author.url || '';

      state.embed.thumbnail_url = c.thumbnail_url || '';
      el.embedThumbnail.value = state.embed.thumbnail_url;
      state.embed.image_url = c.image_url || '';
      el.embedImage.value = state.embed.image_url;

      state.embed.footer = c.footer || { text: '', icon_url: '' };
      el.embedFooterText.value = state.embed.footer.text || '';
      el.embedFooterIcon.value = state.embed.footer.icon_url || '';

      state.embed.fields = (c.fields || []).map((f, i) => ({
        id: 'fld_imp_' + i,
        name: f.name || '',
        value: f.value || '',
        inline: !!f.inline
      }));
      renderEmbedFieldsList();
    } else {
      state.plain.content = c.text || '';
      el.plainContent.value = state.plain.content;
      state.plain.image_url = c.image_url || '';
      el.plainImage.value = state.plain.image_url;
    }

    // Buttons
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

    renderPreview();
  }

  // --- Toast Notification ---
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    el.toastText.textContent = msg;
    el.toast.style.display = 'flex';
    toastTimer = setTimeout(() => {
      el.toast.style.display = 'none';
      toastTimer = null;
    }, 3500);
  }

  // --- Prevent Accidental Tab Closing (beforeunload) ---
  function hasUnsavedChanges() {
    return !!(
      state.embed.title ||
      state.embed.description ||
      state.embed.fields.length > 0 ||
      state.plain.content ||
      state.buttons.length > 0
    );
  }

  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // --- Attach Event Handlers ---
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
        // Validation for step 1
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

    // 2. Mobile Tab Toggle
    if (el.tabEdit && el.tabPreview) {
      el.tabEdit.addEventListener('click', () => {
        el.tabEdit.classList.add('active');
        el.tabPreview.classList.remove('active');
        el.editorPane.classList.add('active');
        el.previewPane.classList.remove('active');
      });
      el.tabPreview.addEventListener('click', () => {
        el.tabPreview.classList.add('active');
        el.tabEdit.classList.remove('active');
        el.previewPane.classList.add('active');
        el.editorPane.classList.remove('active');
      });
    }

    // 3. Quick Time Presets
    if (el.presetPills) {
      el.presetPills.forEach(pill => {
        pill.addEventListener('click', () => {
          applyPreset(pill.dataset.preset);
        });
      });
    }

    // 4. Quick Date Selection Pills
    el.quickDatePills.forEach(pill => {
      pill.addEventListener('click', () => {
        el.quickDatePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const mode = pill.dataset.quickDate;
        const jstNow = getJSTNow();
        let target = new Date(jstNow);

        if (mode === 'today') {
          // Keep today
        } else if (mode === 'tomorrow') {
          target.setDate(target.getDate() + 1);
        } else if (mode === 'after-tomorrow') {
          target.setDate(target.getDate() + 2);
        } else if (mode === 'next-week') {
          target.setDate(target.getDate() + 7);
        }

        state.date = formatYMD(target);
        el.inputDate.value = state.date;
        jumpCalendarToDate(state.date);
        updateScheduleSummaryCard();
        renderPreview();
      });
    });

    // 5. Calendar Navigation (Prev / Next Month)
    if (el.calPrevMonth) {
      el.calPrevMonth.addEventListener('click', () => changeCalendarMonth(-1));
    }
    if (el.calNextMonth) {
      el.calNextMonth.addEventListener('click', () => changeCalendarMonth(1));
    }

    // 6. Digital Clock Steppers & Period Toggle
    if (el.hourStepUp) el.hourStepUp.addEventListener('click', () => stepHour(1));
    if (el.hourStepDown) el.hourStepDown.addEventListener('click', () => stepHour(-1));
    if (el.minuteStepUp) el.minuteStepUp.addEventListener('click', () => stepMinute(5));
    if (el.minuteStepDown) el.minuteStepDown.addEventListener('click', () => stepMinute(-5));

    if (el.btnPeriodPm) {
      el.btnPeriodPm.addEventListener('click', () => {
        clockPeriod = 'pm';
        let [h] = (state.time || '12:00').split(':').map(Number);
        if (h < 12) h += 12;
        setHour(h);
      });
    }
    if (el.btnPeriodAm) {
      el.btnPeriodAm.addEventListener('click', () => {
        clockPeriod = 'am';
        let [h] = (state.time || '12:00').split(':').map(Number);
        if (h >= 12) h -= 12;
        setHour(h);
      });
    }

    // 5. Recurrence
    el.recurrenceType.addEventListener('change', (e) => {
      state.recurrence.type = e.target.value;
      el.weeklyDaysContainer.style.display = state.recurrence.type === 'weekly' ? 'block' : 'none';
      renderPreview();
    });

    el.weekdayCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        state.recurrence.days = Array.from(el.weekdayCheckboxes)
          .filter(c => c.checked)
          .map(c => parseInt(c.value, 10));
        renderPreview();
      });
    });

    // 6. Message Type Toggle
    el.messageTypeInputs.forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.messageType = e.target.value;
        el.embedSettingsSection.style.display = state.messageType === 'embed' ? 'block' : 'none';
        el.plainSettingsSection.style.display = state.messageType === 'plain' ? 'block' : 'none';
        renderPreview();
      });
    });

    // 7. Embed Settings
    el.embedColorPicker.addEventListener('input', (e) => {
      state.embed.color = e.target.value;
      el.embedColorHex.value = e.target.value.toUpperCase();
      renderPreview();
    });

    el.embedColorHex.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (isValidHex(val)) {
        state.embed.color = val;
        el.embedColorPicker.value = val;
        renderPreview();
      }
    });

    document.querySelectorAll('.color-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const col = chip.dataset.color;
        state.embed.color = col;
        el.embedColorPicker.value = col;
        el.embedColorHex.value = col;
        renderPreview();
      });
    });

    el.embedTitle.addEventListener('input', (e) => {
      state.embed.title = e.target.value;
      renderPreview();
    });
    el.embedTitleUrl.addEventListener('input', (e) => {
      state.embed.title_url = e.target.value;
      renderPreview();
    });
    el.embedDesc.addEventListener('input', (e) => {
      state.embed.description = e.target.value;
      renderPreview();
    });
    el.embedThumbnail.addEventListener('input', (e) => {
      state.embed.thumbnail_url = e.target.value;
      renderPreview();
    });
    el.embedImage.addEventListener('input', (e) => {
      state.embed.image_url = e.target.value;
      renderPreview();
    });
    el.embedImageFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageUpload(e.target.files[0], 'embed');
      }
    });

    el.embedAuthorName.addEventListener('input', (e) => {
      state.embed.author.name = e.target.value;
      renderPreview();
    });
    el.embedAuthorIcon.addEventListener('input', (e) => {
      state.embed.author.icon_url = e.target.value;
      renderPreview();
    });
    el.embedAuthorUrl.addEventListener('input', (e) => {
      state.embed.author.url = e.target.value;
      renderPreview();
    });

    el.embedFooterText.addEventListener('input', (e) => {
      state.embed.footer.text = e.target.value;
      renderPreview();
    });
    el.embedFooterIcon.addEventListener('input', (e) => {
      state.embed.footer.icon_url = e.target.value;
      renderPreview();
    });

    el.btnAddField.addEventListener('click', addEmbedField);

    // 8. Plain Message Settings
    el.plainContent.addEventListener('input', (e) => {
      state.plain.content = e.target.value;
      renderPreview();
    });
    el.plainImage.addEventListener('input', (e) => {
      state.plain.image_url = e.target.value;
      renderPreview();
    });
    el.plainImageFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageUpload(e.target.files[0], 'plain');
      }
    });

    // 9. URL Link Buttons
    el.btnAddButton.addEventListener('click', addButton);

    // 10. Copy Code Action
    el.btnCopyCode.addEventListener('click', () => {
      // Validate
      const info = formatHumanReadableDateTime(state.date, state.time);
      if (info.isPast) {
        showToast('⚠️ 過去の日時は予約できません');
        goToStep(1);
        return;
      }

      if (state.messageType === 'plain') {
        if (!state.plain.content.trim() && !state.plain.image_url.trim()) {
          showToast('⚠️ メッセージ本文または画像を入力してください');
          goToStep(2);
          return;
        }
      } else {
        const hasContent = state.embed.title.trim() ||
          state.embed.description.trim() ||
          state.embed.image_url.trim() ||
          state.embed.fields.length > 0 ||
          state.embed.author.name.trim();
        if (!hasContent) {
          showToast('⚠️ タイトル、説明文、または画像を入力してください');
          goToStep(2);
          return;
        }
      }

      const payload = buildPayload();
      const code = encodeReservationCode(payload);

      navigator.clipboard.writeText(code).then(() => {
        showToast('📋 予約コードをコピーしました！Discordで貼り付けてください');
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('📋 予約コードをコピーしました！Discordで貼り付けてください');
      });
    });

    // 11. Download JSON File Action (No Discord character limit issues)
    if (el.btnDownloadJson) {
      el.btnDownloadJson.addEventListener('click', () => {
        const info = formatHumanReadableDateTime(state.date, state.time);
        if (info.isPast) {
          showToast('⚠️ 過去の日時は予約できません');
          goToStep(1);
          return;
        }

        if (state.messageType === 'plain') {
          if (!state.plain.content.trim() && !state.plain.image_url.trim()) {
            showToast('⚠️ メッセージ本文または画像を入力してください');
            goToStep(2);
            return;
          }
        } else {
          const hasContent = state.embed.title.trim() ||
            state.embed.description.trim() ||
            state.embed.image_url.trim() ||
            state.embed.fields.length > 0 ||
            state.embed.author.name.trim();
          if (!hasContent) {
            showToast('⚠️ タイトル、説明文、または画像を入力してください');
            goToStep(2);
            return;
          }
        }

        const payload = buildPayload();
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timeClean = (state.time || '1200').replace(':', '');
        a.download = `discord_reservation_${state.date}_${timeClean}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('💾 予約ファイル (.json) をダウンロードしました！');
      });
    }

    // 12. Modal: Import Code or JSON File
    el.btnOpenImport.addEventListener('click', () => {
      el.importCodeInput.value = '';
      if (el.modalFileStatus) el.modalFileStatus.textContent = '';
      if (el.modalFileInput) el.modalFileInput.value = '';
      el.importErrorMsg.style.display = 'none';
      el.importModal.style.display = 'flex';
    });

    el.modalCloseBtn.addEventListener('click', () => {
      el.importModal.style.display = 'none';
    });
    el.modalCancelBtn.addEventListener('click', () => {
      el.importModal.style.display = 'none';
    });

    if (el.modalFileInput) {
      el.modalFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (el.modalFileStatus) el.modalFileStatus.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const text = evt.target.result;
            el.importCodeInput.value = text;
            const data = decodeReservationCode(text);
            applyImportedData(data);
            el.importModal.style.display = 'none';
            showToast(`✅ ${file.name} を読み込みました！`);
          } catch (err) {
            el.importErrorMsg.textContent = 'ファイルの読み込みに失敗しました: ' + err.message;
            el.importErrorMsg.style.display = 'block';
          }
        };
        reader.readAsText(file);
      });
    }

    el.modalApplyBtn.addEventListener('click', () => {
      const codeStr = el.importCodeInput.value.trim();
      if (!codeStr) {
        el.importErrorMsg.textContent = 'コードまたはJSONを入力してください';
        el.importErrorMsg.style.display = 'block';
        return;
      }
      try {
        const data = decodeReservationCode(codeStr);
        applyImportedData(data);
        el.importModal.style.display = 'none';
        showToast('予約設定を読み込みました');
      } catch (err) {
        el.importErrorMsg.textContent = '無効な予約データです: ' + err.message;
        el.importErrorMsg.style.display = 'block';
      }
    });

    // 13. Reset Button
    el.btnReset.addEventListener('click', () => {
      if (!confirm('入力内容をリセットしますか？')) return;
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
        footer: { text: '', icon_url: '' }
      };
      state.plain = { content: '', image_url: '' };
      state.buttons = [];

      el.embedTitle.value = '';
      el.embedTitleUrl.value = '';
      el.embedDesc.value = '';
      el.embedThumbnail.value = '';
      el.embedImage.value = '';
      el.embedAuthorName.value = '';
      el.embedAuthorIcon.value = '';
      el.embedAuthorUrl.value = '';
      el.embedFooterText.value = '';
      el.embedFooterIcon.value = '';
      el.plainContent.value = '';
      el.plainImage.value = '';

      renderEmbedFieldsList();
      renderButtonsList();
      renderPreview();
      goToStep(1);
      showToast('リセットしました');
    });
  }

  // --- Initialize App ---
  function init() {
    initDefaults();
    parseQueryParams();
    renderEmbedFieldsList();
    renderButtonsList();
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
