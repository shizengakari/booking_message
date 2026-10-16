/**
 * Discord Message Scheduler - Modern Web App (STEP 1 Focus)
 * Linear / Vercel-inspired UI with Multi-channel selection & JSON export
 */

(() => {
  'use strict';

  // --- State ---
  const state = {
    currentStep: 1,
    channels: [], // [{ id, name, category, type, selected: boolean }]
    timingMode: 'scheduled', // 'scheduled' | 'immediate'
    date: '',
    time: '',
    recurrence: {
      type: 'none', // 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly'
      days: []      // 0: Mon ... 6: Sun
    },
    messageType: 'embed', // 'embed' | 'plain'
    embed: {
      title: '',
      description: '',
      color: '#5865F2',
      image_url: '',
      thumbnail_url: '',
      author: { name: '', icon_url: '' },
      footer: { text: '', icon_url: '' },
      fields: []
    },
    plain: {
      text: '',
      image_url: ''
    },
    buttons: []
  };

  // --- Helpers ---
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);
  const pad = (n) => String(n).padStart(2, '0');

  // --- SVG Icons (No Unicode emojis) ---
  const SUN_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const MOON_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  const HASH_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;
  const VOICE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
  const CLOSE_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  // --- DOM Elements ---
  const el = {
    themeBtn: $('btn-theme-toggle'),
    themeIcon: $('theme-icon'),
    btnReset: $('btn-reset'),
    stepTabs: $$('.step-tab'),
    stepPanes: {
      1: $('step-pane-1'),
      2: $('step-pane-2'),
      3: $('step-pane-3')
    },

    // Step 1: Channels
    selectedChannelCount: $('selected-channel-count'),
    selectedChips: $('selected-channels-chips'),
    channelSearch: $('channel-search-input'),
    btnClearSearch: $('btn-clear-search'),
    btnSelectAll: $('btn-select-all-channels'),
    btnClearAll: $('btn-clear-all-channels'),
    channelContainer: $('channel-list-container'),
    channelEmptyHint: $('channel-empty-hint'),

    // Step 1: Timing
    timingRadios: $$('input[name="timing_mode"]'),
    timingScheduledLabel: $('segment-scheduled-label'),
    timingImmediateLabel: $('segment-immediate-label'),
    scheduledSection: $('scheduled-datetime-section'),
    immediateCard: $('immediate-info-card'),
    inputDate: $('input-date'),
    inputTime: $('input-time'),
    quickChips: $$('.quick-presets-chips button'),
    relativeTimeBadge: $('relative-time-badge'),
    relativeTimeText: $('relative-time-text'),

    // Step 1: Recurrence
    recurrenceSection: $('recurrence-section'),
    recurrenceRadios: $$('input[name="recurrence_type"]'),
    weeklyDaysPicker: $('weekly-days-picker'),
    weekdayChecks: $$('input[name="weekday"]'),
    scheduleSummaryText: $('schedule-summary-text'),

    // Step 1 Navigation
    btnGotoStep2: $('btn-goto-step-2'),

    // Step 2: Editor
    typeBtns: $$('.type-segment-btn'),
    formEmbed: $('form-embed'),
    formPlain: $('form-plain'),
    embedTitle: $('embed-title'),
    embedDesc: $('embed-desc'),
    embedColor: $('embed-color'),
    embedColorText: $('embed-color-text'),
    embedImage: $('embed-image'),
    embedThumbnail: $('embed-thumbnail'),
    embedAuthorName: $('embed-author-name'),
    embedAuthorIcon: $('embed-author-icon'),
    embedFooter: $('embed-footer'),
    embedFooterIcon: $('embed-footer-icon'),
    fieldsContainer: $('fields-container'),
    btnAddField: $('btn-add-field'),
    plainText: $('plain-text'),
    plainCharCount: $('plain-char-count'),
    plainImage: $('plain-image'),
    buttonsContainer: $('buttons-container'),
    btnAddButton: $('btn-add-button'),

    btnBackToStep1: $('btn-back-to-step-1'),
    btnGotoStep3: $('btn-goto-step-3'),

    // Step 2: Preview
    pvTargetBadge: $('preview-target-badge'),
    pvTime: $('pv-time'),
    pvPlain: $('pv-plain'),
    pvPlainText: $('pv-plain-text'),
    pvPlainImage: $('pv-plain-image'),
    pvEmbed: $('pv-embed'),
    pvEmbedPill: $('pv-embed-pill'),
    pvEmbedAuthor: $('pv-embed-author'),
    pvAuthorIcon: $('pv-author-icon'),
    pvAuthorName: $('pv-author-name'),
    pvEmbedTitle: $('pv-embed-title'),
    pvEmbedDesc: $('pv-embed-desc'),
    pvEmbedFields: $('pv-embed-fields'),
    pvEmbedImage: $('pv-embed-image'),
    pvEmbedFooter: $('pv-embed-footer'),
    pvFooterIcon: $('pv-footer-icon'),
    pvFooterText: $('pv-footer-text'),
    pvEmbedThumbnail: $('pv-embed-thumbnail'),
    pvButtons: $('pv-buttons'),

    // Step 3: Final
    finalSummaryChannels: $('final-summary-channels'),
    finalSummaryTime: $('final-summary-time'),
    finalSummaryRec: $('final-summary-rec'),
    finalSummaryType: $('final-summary-type'),
    btnDownloadJsonFinal: $('btn-download-json-final'),
    btnBackToStep2: $('btn-back-to-step-2'),

    // Import Modal
    btnImportOpen: $('btn-import-open'),
    modalImport: $('modal-import'),
    btnImportClose: $('btn-import-close'),
    btnImportCancel: $('btn-import-cancel'),
    btnImportSubmit: $('btn-import-submit'),
    importFile: $('import-file'),
    importError: $('import-error'),

    toast: $('toast')
  };

  // --- Theme Management ---
  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }

  function applyTheme(isLight) {
    document.documentElement.classList.toggle('light-theme', isLight);
    document.body.classList.toggle('light-theme', isLight);
    if (el.themeIcon) el.themeIcon.innerHTML = isLight ? SUN_ICON : MOON_ICON;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isLight ? '#f8fafc' : '#0b0e14');
  }

  function initTheme() {
    const saved = localStorage.getItem('theme');
    const isLight = saved === 'light' || (!saved && getSystemTheme() === 'light');
    applyTheme(isLight);

    if (el.themeBtn) {
      el.themeBtn.addEventListener('click', () => {
        const next = !document.body.classList.contains('light-theme');
        localStorage.setItem('theme', next ? 'light' : 'dark');
        applyTheme(next);
      });
    }

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) applyTheme(e.matches);
      });
    }
  }

  function showToast(msg) {
    if (!el.toast) return;
    el.toast.textContent = msg;
    el.toast.style.display = 'block';
    clearTimeout(el.toast._timer);
    el.toast._timer = setTimeout(() => { el.toast.style.display = 'none'; }, 2600);
  }

  // --- Step Navigation & Stepper ---
  function goToStep(step) {
    state.currentStep = step;

    // Tabs update
    el.stepTabs.forEach((tab) => {
      const s = parseInt(tab.dataset.step, 10);
      tab.classList.toggle('active', s === step);
      tab.classList.toggle('completed', s < step);
    });

    // Panes update
    Object.keys(el.stepPanes).forEach((s) => {
      el.stepPanes[s].classList.toggle('active', parseInt(s, 10) === step);
    });

    if (step === 2) {
      renderPreview();
    } else if (step === 3) {
      renderFinalSummary();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Channels Management (Step 1) ---
  function parseChannelsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const chsToken = params.get('chs');
    const defaultCid = params.get('cid');
    const defaultCname = params.get('cname') || '一般';

    let loadedList = [];

    if (chsToken && typeof window.pako !== 'undefined') {
      try {
        // Base64 URL-safe decode
        let b64 = chsToken.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const binStr = atob(b64);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        const jsonStr = window.pako.inflate(bytes, { to: 'string' });
        const list = JSON.parse(jsonStr);
        if (Array.isArray(list)) {
          loadedList = list.map((c) => ({
            id: String(c.id),
            name: c.name || 'channel',
            category: c.category || '',
            type: c.type || 'text',
            selected: defaultCid ? String(c.id) === String(defaultCid) : false
          }));
        }
      } catch (e) {
        console.warn('chs parameter parse error:', e);
      }
    }

    // フォールバック（パラメータがない場合やデフォルトチャンネルの保証）
    if (!loadedList.length && defaultCid) {
      loadedList.push({
        id: String(defaultCid),
        name: defaultCname,
        category: 'テキストチャンネル',
        type: 'text',
        selected: true
      });
    }

    if (!loadedList.length) {
      // 完全にパラメータなしで開いた場合のダミー例
      loadedList.push({
        id: 'default',
        name: '一般',
        category: 'テキストチャンネル',
        type: 'text',
        selected: true
      });
    }

    // もしどのチャンネルも選択されていなければ先頭を選択
    if (!loadedList.some((c) => c.selected)) {
      loadedList[0].selected = true;
    }

    state.channels = loadedList;
    renderChannelsList();
    renderSelectedChips();
  }

  function renderChannelsList() {
    el.channelContainer.innerHTML = '';
    const query = el.channelSearch.value.trim().toLowerCase();

    // フィルタリング
    const filtered = state.channels.filter((c) => {
      if (!query) return true;
      return c.name.toLowerCase().includes(query) || (c.category && c.category.toLowerCase().includes(query));
    });

    if (!filtered.length) {
      el.channelEmptyHint.style.display = 'block';
      return;
    }
    el.channelEmptyHint.style.display = 'none';

    // カテゴリごとにグループ化
    const groups = {};
    filtered.forEach((c) => {
      const cat = c.category || '未分類';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });

    Object.keys(groups).forEach((cat) => {
      const grpHeader = document.createElement('div');
      grpHeader.className = 'channel-group-title';
      grpHeader.textContent = cat;
      el.channelContainer.appendChild(grpHeader);

      groups[cat].forEach((c) => {
        const item = document.createElement('label');
        item.className = `channel-item-label ${c.selected ? 'selected' : ''}`;
        item.innerHTML = `
          <input type="checkbox" value="${c.id}" ${c.selected ? 'checked' : ''}>
          <span class="channel-item-icon">${c.type === 'voice' ? VOICE_ICON : HASH_ICON}</span>
          <span class="channel-item-name">${escapeHtml(c.name)}</span>
        `;

        const check = item.querySelector('input');
        check.addEventListener('change', () => {
          c.selected = check.checked;
          item.classList.toggle('selected', c.selected);
          renderSelectedChips();
        });

        el.channelContainer.appendChild(item);
      });
    });
  }

  function renderSelectedChips() {
    const selected = state.channels.filter((c) => c.selected);
    el.selectedChannelCount.textContent = selected.length;
    el.selectedChips.innerHTML = '';

    if (!selected.length) {
      el.selectedChips.innerHTML = '<span style="font-size:0.8rem;color:var(--text-tertiary);line-height:28px;">チャンネルが選択されていません</span>';
      if (el.pvTargetBadge) el.pvTargetBadge.textContent = 'チャンネル未選択';
      return;
    }

    if (el.pvTargetBadge) {
      el.pvTargetBadge.textContent = selected.length === 1 ? `# ${selected[0].name}` : `${selected.length} チャンネル`;
    }

    selected.forEach((c) => {
      const chip = document.createElement('div');
      chip.className = 'channel-chip';
      chip.innerHTML = `
        <span class="chip-icon">${c.type === 'voice' ? VOICE_ICON : HASH_ICON}</span>
        <span class="chip-name">${escapeHtml(c.name)}</span>
        <button type="button" class="channel-chip-remove" title="選択解除" aria-label="削除">${CLOSE_ICON}</button>
      `;

      chip.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        c.selected = false;
        renderChannelsList();
        renderSelectedChips();
      });

      el.selectedChips.appendChild(chip);
    });
  }

  // --- Timing & Datetime Management (Step 1) ---
  function initTimingDefaults() {
    const now = new Date();
    // 30分後の時刻をデフォルトにセット
    now.setMinutes(now.getMinutes() + 30);
    now.setSeconds(0);

    el.inputDate.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    el.inputTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    updateTimingDisplay();
  }

  function updateTimingDisplay() {
    const isScheduled = state.timingMode === 'scheduled';
    el.scheduledSection.style.display = isScheduled ? 'block' : 'none';
    el.immediateCard.style.display = isScheduled ? 'none' : 'flex';
    el.recurrenceSection.style.opacity = isScheduled ? '1' : '0.4';
    el.recurrenceSection.style.pointerEvents = isScheduled ? 'auto' : 'none';

    if (!isScheduled) {
      el.scheduleSummaryText.textContent = '登録後すぐに送信 (繰り返しなし)';
      if (el.pvTime) el.pvTime.textContent = '今すぐ送信';
      return;
    }

    const dateVal = el.inputDate.value;
    const timeVal = el.inputTime.value;
    if (!dateVal || !timeVal) {
      el.relativeTimeText.textContent = '日付と時刻を入力してください';
      el.relativeTimeBadge.className = 'relative-time-banner is-past';
      el.scheduleSummaryText.textContent = '日付と時刻を指定してください';
      return;
    }

    const targetDate = new Date(`${dateVal}T${timeVal}:00`);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    // 相対時間計算
    if (diffMs <= -60000) {
      el.relativeTimeBadge.className = 'relative-time-banner is-past';
      el.relativeTimeText.textContent = '過去の日時が指定されています。未来の日時を指定してください。';
    } else if (diffMs < 60000) {
      el.relativeTimeBadge.className = 'relative-time-banner';
      el.relativeTimeText.textContent = 'まもなく送信 (1分未満)';
    } else {
      el.relativeTimeBadge.className = 'relative-time-banner';
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      let diffStr = '';
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        diffStr = `あと約 ${days} 日後`;
      } else if (hours > 0) {
        diffStr = `あと ${hours}時間 ${mins}分後`;
      } else {
        diffStr = `あと ${mins}分後`;
      }
      el.relativeTimeText.textContent = `送信予定: ${diffStr}`;
    }

    // 繰り返し要約
    const weekdaysJp = ['日', '月', '火', '水', '木', '金', '土'];
    const dateFormatted = `${targetDate.getFullYear()}/${targetDate.getMonth() + 1}/${targetDate.getDate()}(${weekdaysJp[targetDate.getDay()]}) ${timeVal}`;

    let recStr = '1回のみ';
    const recType = state.recurrence.type;
    if (recType === 'daily') recStr = '毎日';
    else if (recType === 'weekdays') recStr = '平日 (月〜金)';
    else if (recType === 'monthly') recStr = '毎月 (指定日)';
    else if (recType === 'weekly') {
      const selected = Array.from(el.weekdayChecks)
        .filter((c) => c.checked)
        .map((c) => ['月', '火', '水', '木', '金', '土', '日'][parseInt(c.value, 10)]);
      recStr = selected.length ? `毎週 (${selected.join(', ')})` : '毎週';
    }

    el.scheduleSummaryText.textContent = `初回: ${dateFormatted} [${recStr}]`;
    if (el.pvTime) el.pvTime.textContent = `${dateFormatted} 送信予定`;
  }

  // --- Step 1 Events Setup ---
  function attachStep1Events() {
    // チャンネル検索
    el.channelSearch.addEventListener('input', () => {
      el.btnClearSearch.style.display = el.channelSearch.value ? 'block' : 'none';
      renderChannelsList();
    });

    el.btnClearSearch.addEventListener('click', () => {
      el.channelSearch.value = '';
      el.btnClearSearch.style.display = 'none';
      renderChannelsList();
    });

    el.btnSelectAll.addEventListener('click', () => {
      state.channels.forEach((c) => { c.selected = true; });
      renderChannelsList();
      renderSelectedChips();
    });

    el.btnClearAll.addEventListener('click', () => {
      state.channels.forEach((c) => { c.selected = false; });
      renderChannelsList();
      renderSelectedChips();
    });

    // タイミングモード切替
    el.timingRadios.forEach((r) => {
      r.addEventListener('change', () => {
        state.timingMode = r.value;
        el.timingScheduledLabel.classList.toggle('active', r.value === 'scheduled');
        el.timingImmediateLabel.classList.toggle('active', r.value === 'immediate');
        updateTimingDisplay();
      });
    });

    // 日時変更
    el.inputDate.addEventListener('input', updateTimingDisplay);
    el.inputTime.addEventListener('input', updateTimingDisplay);

    // クイックプリセットボタン
    el.quickChips.forEach((btn) => {
      btn.addEventListener('click', () => {
        const now = new Date();
        const mins = btn.dataset.minutes;
        const target = btn.dataset.target;

        if (mins) {
          now.setMinutes(now.getMinutes() + parseInt(mins, 10));
        } else if (target === 'tomorrow-9') {
          now.setDate(now.getDate() + 1);
          now.setHours(9, 0, 0, 0);
        } else if (target === 'tomorrow-18') {
          now.setDate(now.getDate() + 1);
          now.setHours(18, 0, 0, 0);
        }

        el.inputDate.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        el.inputTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        updateTimingDisplay();
      });
    });

    // 繰り返しラジオ
    el.recurrenceRadios.forEach((r) => {
      r.addEventListener('change', () => {
        state.recurrence.type = r.value;
        $$('.recurrence-card').forEach((card) => {
          card.classList.toggle('active', card.querySelector('input').value === r.value);
        });
        el.weeklyDaysPicker.style.display = r.value === 'weekly' ? 'block' : 'none';
        updateTimingDisplay();
      });
    });

    // 曜日チェック
    el.weekdayChecks.forEach((c) => {
      c.addEventListener('change', () => {
        updateTimingDisplay();
      });
    });

    // STEP 1 -> STEP 2
    el.btnGotoStep2.addEventListener('click', () => {
      const selectedChannels = state.channels.filter((c) => c.selected);
      if (!selectedChannels.length) {
        alert('送信先チャンネルを少なくとも1つ選択してください。');
        return;
      }

      if (state.timingMode === 'scheduled') {
        const dateVal = el.inputDate.value;
        const timeVal = el.inputTime.value;
        if (!dateVal || !timeVal) {
          alert('送信日時を指定してください。');
          return;
        }
        const targetDate = new Date(`${dateVal}T${timeVal}:00`);
        const now = new Date();
        if (targetDate.getTime() - now.getTime() <= -60000) {
          alert('過去の日時が指定されています。未来の日時を指定してください。');
          return;
        }
      }

      goToStep(2);
    });
  }

  // --- Step 2 Events & Preview ---
  function attachStep2Events() {
    el.stepTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetStep = parseInt(tab.dataset.step, 10);
        if (targetStep === 1) {
          goToStep(1);
        } else if (targetStep === 2) {
          if (!state.channels.some((c) => c.selected)) {
            alert('先に送信先チャンネルを選択してください。');
            return;
          }
          goToStep(2);
        } else if (targetStep === 3) {
          goToStep(3);
        }
      });
    });

    el.btnBackToStep1.addEventListener('click', () => goToStep(1));
    el.btnGotoStep3.addEventListener('click', () => {
      // メッセージのバリデーション
      if (state.messageType === 'plain') {
        if (!el.plainText.value.trim() && !el.plainImage.value.trim()) {
          alert('メッセージ本文または画像URLを入力してください。');
          return;
        }
      } else {
        const title = el.embedTitle.value.trim();
        const desc = el.embedDesc.value.trim();
        const img = el.embedImage.value.trim();
        if (!title && !desc && !img && !state.embed.fields.length) {
          alert('Embedのタイトルまたは本文を入力してください。');
          return;
        }
      }
      goToStep(3);
    });

    // Type switch
    el.typeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        el.typeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.messageType = btn.dataset.type;
        el.formEmbed.style.display = state.messageType === 'embed' ? 'block' : 'none';
        el.formPlain.style.display = state.messageType === 'plain' ? 'block' : 'none';
        renderPreview();
      });
    });

    // Embed inputs
    el.embedTitle.addEventListener('input', renderPreview);
    el.embedDesc.addEventListener('input', renderPreview);
    el.embedColor.addEventListener('input', (e) => {
      el.embedColorText.textContent = e.target.value.toUpperCase();
      renderPreview();
    });
    el.embedImage.addEventListener('input', renderPreview);
    el.embedThumbnail.addEventListener('input', renderPreview);
    el.embedAuthorName.addEventListener('input', renderPreview);
    el.embedAuthorIcon.addEventListener('input', renderPreview);
    el.embedFooter.addEventListener('input', renderPreview);
    el.embedFooterIcon.addEventListener('input', renderPreview);

    // Plain inputs
    el.plainText.addEventListener('input', () => {
      el.plainCharCount.textContent = `${el.plainText.value.length} / 2000`;
      renderPreview();
    });
    el.plainImage.addEventListener('input', renderPreview);

    // Fields
    el.btnAddField.addEventListener('click', () => {
      if (state.embed.fields.length >= 25) {
        alert('フィールドは最大25個までです');
        return;
      }
      state.embed.fields.push({ name: '', value: '', inline: false });
      renderFieldsList();
      renderPreview();
    });

    // Buttons
    el.btnAddButton.addEventListener('click', () => {
      if (state.buttons.length >= 5) {
        alert('ボタンは最大5個までです');
        return;
      }
      state.buttons.push({ label: '', url: '' });
      renderButtonsList();
      renderPreview();
    });
  }

  function renderFieldsList() {
    el.fieldsContainer.innerHTML = '';
    state.embed.fields.forEach((f, idx) => {
      const item = document.createElement('div');
      item.className = 'field-item';
      item.innerHTML = `
        <input type="text" placeholder="項目名" value="${escapeHtml(f.name)}" style="flex:1;">
        <input type="text" placeholder="値" value="${escapeHtml(f.value)}" style="flex:2;">
        <label style="font-size:0.75rem;display:flex;align-items:center;gap:3px;cursor:pointer;">
          <input type="checkbox" ${f.inline ? 'checked' : ''}>横並び
        </label>
        <button type="button" class="btn btn-xs btn-ghost" style="color:var(--danger);padding:3px 6px;" title="削除" aria-label="削除">${CLOSE_ICON}</button>
      `;

      const [nameInput, valInput] = item.querySelectorAll('input[type="text"]');
      const inlineCheck = item.querySelector('input[type="checkbox"]');
      const delBtn = item.querySelector('button');

      nameInput.addEventListener('input', () => { f.name = nameInput.value; renderPreview(); });
      valInput.addEventListener('input', () => { f.value = valInput.value; renderPreview(); });
      inlineCheck.addEventListener('change', () => { f.inline = inlineCheck.checked; renderPreview(); });
      delBtn.addEventListener('click', () => {
        state.embed.fields.splice(idx, 1);
        renderFieldsList();
        renderPreview();
      });

      el.fieldsContainer.appendChild(item);
    });
  }

  function renderButtonsList() {
    el.buttonsContainer.innerHTML = '';
    state.buttons.forEach((b, idx) => {
      const item = document.createElement('div');
      item.className = 'button-item';
      item.innerHTML = `
        <input type="text" placeholder="ボタン名" value="${escapeHtml(b.label)}" style="flex:1;">
        <input type="url" placeholder="https://..." value="${escapeHtml(b.url)}" style="flex:2;">
        <button type="button" class="btn btn-xs btn-ghost" style="color:var(--danger);padding:3px 6px;" title="削除" aria-label="削除">${CLOSE_ICON}</button>
      `;

      const [labelInput, urlInput] = item.querySelectorAll('input');
      const delBtn = item.querySelector('button');

      labelInput.addEventListener('input', () => { b.label = labelInput.value; renderPreview(); });
      urlInput.addEventListener('input', () => { b.url = urlInput.value; renderPreview(); });
      delBtn.addEventListener('click', () => {
        state.buttons.splice(idx, 1);
        renderButtonsList();
        renderPreview();
      });

      el.buttonsContainer.appendChild(item);
    });
  }

  function renderPreview() {
    if (state.messageType === 'plain') {
      el.pvPlain.style.display = 'block';
      el.pvEmbed.style.display = 'none';

      const text = el.plainText.value.trim();
      el.pvPlainText.textContent = text || 'メッセージを入力するとプレビューされます';

      const img = el.plainImage.value.trim();
      if (img) {
        el.pvPlainImage.src = img;
        el.pvPlainImage.style.display = 'block';
      } else {
        el.pvPlainImage.style.display = 'none';
      }
    } else {
      el.pvPlain.style.display = 'none';
      el.pvEmbed.style.display = 'flex';

      const color = el.embedColor.value;
      el.pvEmbedPill.style.background = color;

      // Author
      const authorName = el.embedAuthorName.value.trim();
      const authorIcon = el.embedAuthorIcon.value.trim();
      if (authorName) {
        el.pvEmbedAuthor.style.display = 'flex';
        el.pvAuthorName.textContent = authorName;
        if (authorIcon) {
          el.pvAuthorIcon.src = authorIcon;
          el.pvAuthorIcon.style.display = 'block';
        } else {
          el.pvAuthorIcon.style.display = 'none';
        }
      } else {
        el.pvEmbedAuthor.style.display = 'none';
      }

      // Title
      const title = el.embedTitle.value.trim();
      if (title) {
        el.pvEmbedTitle.style.display = 'block';
        el.pvEmbedTitle.textContent = title;
      } else {
        el.pvEmbedTitle.style.display = 'none';
      }

      // Desc
      const desc = el.embedDesc.value.trim();
      el.pvEmbedDesc.textContent = desc || (title ? '' : 'メッセージを入力するとプレビューされます');

      // Fields
      el.pvEmbedFields.innerHTML = '';
      state.embed.fields.forEach((f) => {
        if (!f.name && !f.value) return;
        const fi = document.createElement('div');
        fi.className = `pv-field-item ${f.inline ? '' : 'full-width'}`;
        fi.innerHTML = `
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-primary);">${escapeHtml(f.name || '\u200b')}</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);white-space:pre-wrap;">${escapeHtml(f.value || '\u200b')}</div>
        `;
        el.pvEmbedFields.appendChild(fi);
      });

      // Image
      const img = el.embedImage.value.trim();
      if (img) {
        el.pvEmbedImage.src = img;
        el.pvEmbedImage.style.display = 'block';
      } else {
        el.pvEmbedImage.style.display = 'none';
      }

      // Thumbnail
      const thumb = el.embedThumbnail.value.trim();
      if (thumb) {
        el.pvEmbedThumbnail.src = thumb;
        el.pvEmbedThumbnail.style.display = 'block';
      } else {
        el.pvEmbedThumbnail.style.display = 'none';
      }

      // Footer
      const footText = el.embedFooter.value.trim();
      const footIcon = el.embedFooterIcon.value.trim();
      if (footText) {
        el.pvEmbedFooter.style.display = 'flex';
        el.pvFooterText.textContent = footText;
        if (footIcon) {
          el.pvFooterIcon.src = footIcon;
          el.pvFooterIcon.style.display = 'block';
        } else {
          el.pvFooterIcon.style.display = 'none';
        }
      } else {
        el.pvEmbedFooter.style.display = 'none';
      }
    }

    // Buttons
    el.pvButtons.innerHTML = '';
    const validBtns = state.buttons.filter((b) => b.label.trim() && b.url.trim());
    if (validBtns.length) {
      el.pvButtons.style.display = 'flex';
      validBtns.forEach((b) => {
        const btnEl = document.createElement('span');
        btnEl.className = 'btn btn-xs btn-secondary';
        btnEl.textContent = b.label;
        el.pvButtons.appendChild(btnEl);
      });
    } else {
      el.pvButtons.style.display = 'none';
    }
  }

  // --- Step 3: Final JSON Build & Download ---
  function buildFinalPayload() {
    const selectedChannels = state.channels.filter((c) => c.selected);
    const channelIds = selectedChannels.map((c) => c.id);

    const isImmediate = state.timingMode === 'immediate';
    let datetimeStr = 'now';
    if (!isImmediate) {
      const dateVal = el.inputDate.value;
      const timeVal = el.inputTime.value;
      datetimeStr = `${dateVal}T${timeVal}:00+09:00`;
    }

    // Recurrence
    const recurrence = { type: isImmediate ? 'none' : state.recurrence.type };
    if (!isImmediate && state.recurrence.type === 'weekly') {
      const days = Array.from(el.weekdayChecks)
        .filter((c) => c.checked)
        .map((c) => parseInt(c.value, 10));
      recurrence.days = days.length ? days : [new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    }

    const payload = {
      channel_ids: channelIds,
      datetime: datetimeStr,
      immediate: isImmediate,
      type: state.messageType,
      recurrence: recurrence
    };

    // Buttons
    const validBtns = state.buttons
      .filter((b) => b.label.trim() && b.url.trim())
      .map((b) => ({ label: b.label.trim(), url: b.url.trim() }));
    if (validBtns.length) payload.buttons = validBtns;

    if (state.messageType === 'plain') {
      payload.content = {
        text: el.plainText.value.trim()
      };
      if (el.plainImage.value.trim()) payload.content.image_url = el.plainImage.value.trim();
    } else {
      const content = {
        title: el.embedTitle.value.trim() || undefined,
        description: el.embedDesc.value.trim() || undefined,
        color: el.embedColor.value || '#5865F2'
      };

      if (el.embedImage.value.trim()) content.image_url = el.embedImage.value.trim();
      if (el.embedThumbnail.value.trim()) content.thumbnail_url = el.embedThumbnail.value.trim();

      const authorName = el.embedAuthorName.value.trim();
      if (authorName) {
        content.author = { name: authorName };
        if (el.embedAuthorIcon.value.trim()) content.author.icon_url = el.embedAuthorIcon.value.trim();
      }

      const footerText = el.embedFooter.value.trim();
      if (footerText) {
        content.footer = { text: footerText };
        if (el.embedFooterIcon.value.trim()) content.footer.icon_url = el.embedFooterIcon.value.trim();
      }

      const validFields = state.embed.fields
        .filter((f) => f.name.trim() || f.value.trim())
        .map((f) => ({ name: f.name.trim(), value: f.value.trim(), inline: !!f.inline }));
      if (validFields.length) content.fields = validFields;

      payload.content = JSON.parse(JSON.stringify(content));
    }

    return payload;
  }

  function renderFinalSummary() {
    const selected = state.channels.filter((c) => c.selected);
    el.finalSummaryChannels.textContent = `${selected.length} チャンネル (${selected.map((c) => '#' + c.name).slice(0, 3).join(', ')}${selected.length > 3 ? '...' : ''})`;

    if (state.timingMode === 'immediate') {
      el.finalSummaryTime.textContent = '即時送信';
      el.finalSummaryRec.textContent = '1回のみ';
    } else {
      el.finalSummaryTime.textContent = `${el.inputDate.value} ${el.inputTime.value} (JST)`;
      const recLabels = { none: '1回のみ', daily: '毎日', weekdays: '平日 (月〜金)', weekly: '毎週', monthly: '毎月' };
      el.finalSummaryRec.textContent = recLabels[state.recurrence.type] || '1回のみ';
    }

    el.finalSummaryType.textContent = state.messageType === 'embed' ? 'Embed (埋め込み)' : '通常テキスト';
  }

  function attachStep3Events() {
    el.btnBackToStep2.addEventListener('click', () => goToStep(2));

    el.btnDownloadJsonFinal.addEventListener('click', () => {
      try {
        const payload = buildFinalPayload();
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const now = new Date();
        const fname = `reservation_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.json`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(`${fname} をダウンロードしました`);
      } catch (e) {
        alert(e.message || '保存に失敗しました');
      }
    });
  }

  // --- JSON File Import Modal ---
  function attachImportEvents() {
    el.btnImportOpen.addEventListener('click', () => {
      el.importError.style.display = 'none';
      el.importFile.value = '';
      el.modalImport.style.display = 'flex';
    });
    el.btnImportClose.addEventListener('click', () => { el.modalImport.style.display = 'none'; });
    el.btnImportCancel.addEventListener('click', () => { el.modalImport.style.display = 'none'; });

    el.btnImportSubmit.addEventListener('click', async () => {
      el.importError.style.display = 'none';
      const file = el.importFile.files[0];
      if (!file) {
        el.importError.textContent = 'ファイルを選択してください';
        el.importError.style.display = 'block';
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // 復元処理
        // 1. チャンネル
        if (Array.isArray(data.channel_ids)) {
          state.channels.forEach((c) => {
            c.selected = data.channel_ids.includes(c.id);
          });
          // 見つからなかったチャンネルを手動追加
          data.channel_ids.forEach((cid) => {
            if (!state.channels.some((c) => c.id === String(cid))) {
              state.channels.push({
                id: String(cid),
                name: `チャンネル (${String(cid).slice(-4)})`,
                category: 'インポート',
                type: 'text',
                selected: true
              });
            }
          });
          renderChannelsList();
          renderSelectedChips();
        }

        // 2. タイミング
        if (data.immediate || data.datetime === 'now') {
          state.timingMode = 'immediate';
          el.timingImmediateLabel.querySelector('input').checked = true;
          el.timingImmediateLabel.classList.add('active');
          el.timingScheduledLabel.classList.remove('active');
        } else if (data.datetime) {
          state.timingMode = 'scheduled';
          el.timingScheduledLabel.querySelector('input').checked = true;
          el.timingScheduledLabel.classList.add('active');
          el.timingImmediateLabel.classList.remove('active');

          const dt = new Date(data.datetime);
          if (!isNaN(dt.getTime())) {
            el.inputDate.value = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
            el.inputTime.value = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
          }
        }

        // 3. 繰り返し
        if (data.recurrence) {
          state.recurrence.type = data.recurrence.type || 'none';
          el.recurrenceRadios.forEach((r) => {
            r.checked = (r.value === state.recurrence.type);
            r.closest('.recurrence-card').classList.toggle('active', r.checked);
          });
          el.weeklyDaysPicker.style.display = state.recurrence.type === 'weekly' ? 'block' : 'none';
          const days = data.recurrence.days || [];
          el.weekdayChecks.forEach((c) => {
            c.checked = days.includes(parseInt(c.value, 10));
          });
        }

        // 4. メッセージ形式
        const mtype = data.type || 'embed';
        state.messageType = mtype;
        el.typeBtns.forEach((b) => b.classList.toggle('active', b.dataset.type === mtype));
        el.formEmbed.style.display = mtype === 'embed' ? 'block' : 'none';
        el.formPlain.style.display = mtype === 'plain' ? 'block' : 'none';

        const content = data.content || {};
        if (mtype === 'plain') {
          el.plainText.value = content.text || '';
          el.plainImage.value = content.image_url || '';
        } else {
          el.embedTitle.value = content.title || '';
          el.embedDesc.value = content.description || '';
          if (content.color) {
            let hex = content.color;
            if (typeof hex === 'number') hex = '#' + hex.toString(16).padStart(6, '0');
            el.embedColor.value = hex;
            el.embedColorText.textContent = hex.toUpperCase();
          }
          el.embedImage.value = content.image_url || '';
          el.embedThumbnail.value = content.thumbnail_url || '';
          if (content.author) {
            el.embedAuthorName.value = content.author.name || '';
            el.embedAuthorIcon.value = content.author.icon_url || '';
          }
          if (content.footer) {
            el.embedFooter.value = content.footer.text || '';
            el.embedFooterIcon.value = content.footer.icon_url || '';
          }
          state.embed.fields = Array.isArray(content.fields) ? content.fields : [];
          renderFieldsList();
        }

        state.buttons = Array.isArray(data.buttons) ? data.buttons : [];
        renderButtonsList();

        updateTimingDisplay();
        renderPreview();

        el.modalImport.style.display = 'none';
        showToast('JSONファイルを読み込みました');
        goToStep(1);
      } catch (err) {
        el.importError.textContent = 'JSONファイルの解析に失敗しました: ' + err.message;
        el.importError.style.display = 'block';
      }
    });

    el.btnReset.addEventListener('click', () => {
      if (!confirm('入力内容をすべてリセットしますか？')) return;
      location.reload();
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- Initializer ---
  function init() {
    initTheme();
    parseChannelsFromUrl();
    initTimingDefaults();
    attachStep1Events();
    attachStep2Events();
    attachStep3Events();
    attachImportEvents();
    goToStep(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
