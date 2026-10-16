/**
 * Discord Message Scheduler - Modern Web App (STEP 1 Focus)
 * Linear / Vercel-inspired UI with Multi-channel selection & JSON export
 */

(() => {
  'use strict';

  // --- State ---
  const state = {
    currentStep: 1,
    channels: [],
    timingMode: 'scheduled',
    recurrence: { type: 'none', days: [] },
    messageType: 'embed',
    plainText: '',
    embed: {
      title: '',
      titleUrl: '',
      description: '',
      color: '#5865F2',
      author: {
        name: '',
        url: '',
        iconData: ''
      },
      thumbnail: {
        data: ''
      },
      footer: {
        text: '',
        iconData: '',
        timestamp: true
      },
      fields: []
    },
    images: [],
    buttons: []
  };

    const el = {
    appMainContent: $('app-main-content'),
    noSessionView: $('no-session-view'),
    headerSessionActions: $('header-session-actions'),
    themeBtn: $('btn-theme-toggle'),
    themeIcon: $('theme-icon-wrap'),
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

    // Step 1: Recurrence
    recurrenceSection: $('recurrence-section'),
    recurrenceRadios: $$('input[name="recurrence_type"]'),
    weeklyDaysPicker: $('weekly-days-picker'),
    weekdayChecks: $$('input[name="weekday"]'),
    scheduleSummaryText: $('schedule-summary-text'),

    // Step 1 Navigation
    btnGotoStep2: $('btn-goto-step-2'),

    // Step 2: Editor (Split Layout & Media Uploads)
    typeBtns: $$('.type-segment-btn'),
    plainEditorSection: $('plain-editor-section'),
    embedEditorSection: $('embed-editor-section'),
    plainText: $('plain-text'),
    plainCharCount: $('plain-char-count'),

    // Embed Form
    embedTitle: $('embed-title'),
    embedTitleUrl: $('embed-title-url'),
    embedDesc: $('embed-desc'),

    embedColor: $('embed-color'),
    embedColorHex: $('embed-color-hex'),
    colorSwatches: $$('.color-swatch'),

    // Thumbnail
    thumbUploadInput: $('thumb-upload-input'),
    btnThumbTrigger: $('btn-thumb-trigger'),
    thumbPreviewWrap: $('thumb-preview-wrap'),
    thumbPreviewImg: $('thumb-preview-img'),
    btnThumbClear: $('btn-thumb-clear'),

    // Author
    embedAuthorName: $('embed-author-name'),
    embedAuthorUrl: $('embed-author-url'),
    authorIconUploadInput: $('author-icon-upload-input'),
    btnAuthorIconTrigger: $('btn-author-icon-trigger'),
    authorIconPreviewWrap: $('author-icon-preview-wrap'),
    authorIconPreviewImg: $('author-icon-preview-img'),
    btnAuthorIconClear: $('btn-author-icon-clear'),

    // Fields
    fieldsEditorList: $('fields-editor-list'),
    btnAddField: $('btn-add-field'),

    // Footer
    embedFooterText: $('embed-footer-text'),
    footerIconUploadInput: $('footer-icon-upload-input'),
    btnFooterIconTrigger: $('btn-footer-icon-trigger'),
    footerIconPreviewWrap: $('footer-icon-preview-wrap'),
    footerIconPreviewImg: $('footer-icon-preview-img'),
    btnFooterIconClear: $('btn-footer-icon-clear'),
    embedFooterTimestamp: $('embed-footer-timestamp'),

    // Images
    imageUploadInput: $('image-upload-input'),
    mediaDropzone: $('media-upload-dropzone'),
    mediaGalleryGrid: $('media-gallery-grid'),
    uploadedImagesCount: $('uploaded-images-count'),

    // Buttons
    buttonsEditorList: $('buttons-editor-list'),
    btnAddButton: $('btn-add-button'),

    // Preview Elements
    pvTargetBadge: $('preview-target-badge'),
    pvTime: $('pv-time'),
    pvPlainWrap: $('pv-plain-wrap'),
    pvEmbedCard: $('pv-embed-card'),
    pvEmbedPill: $('pv-embed-pill'),
    pvEmbedAuthor: $('pv-embed-author'),
    pvAuthorIcon: $('pv-author-icon'),
    pvAuthorLink: $('pv-author-link'),
    pvEmbedTitleWrap: $('pv-embed-title-wrap'),
    pvEmbedTitle: $('pv-embed-title'),
    pvEmbedDesc: $('pv-embed-desc'),
    pvEmbedFields: $('pv-embed-fields'),
    pvEmbedThumbnail: $('pv-embed-thumbnail'),
    pvEmbedMainImg: $('pv-embed-main-img'),
    pvEmbedFooter: $('pv-embed-footer'),
    pvFooterIcon: $('pv-footer-icon'),
    pvFooterText: $('pv-footer-text'),
    pvFooterSep: $('pv-footer-sep'),
    pvFooterTimestamp: $('pv-footer-timestamp'),
    pvMediaGallery: $('pv-media-gallery'),
    pvButtonsWrap: $('pv-buttons-wrap'),

    btnBackToStep1: $('btn-back-to-step-1'),
    btnGotoStep3: $('btn-goto-step-3'),

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
          loadedList = list.map((c) => {
            if (Array.isArray(c)) {
              // 超軽量タプル配列: [id, name, type_code (0: text, 1: voice), category]
              return {
                id: String(c[0]),
                name: String(c[1] || 'channel'),
                category: String(c[3] || ''),
                type: c[2] === 1 ? 'voice' : 'text',
                selected: defaultCid ? String(c[0]) === String(defaultCid) : false
              };
            }
            // 従来のオブジェクト形式
            return {
              id: String(c.id),
              name: c.name || 'channel',
              category: c.category || '',
              type: c.type || 'text',
              selected: defaultCid ? String(c.id) === String(defaultCid) : false
            };
          });
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
      el.scheduleSummaryText.textContent = '日付と時刻を指定してください';
      return;
    }

    const targetDate = new Date(`${dateVal}T${timeVal}:00`);

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

  // --- Step 2 Events & Real-Time Preview Synchronization ---
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
      if (state.messageType === 'plain') {
        const text = state.plainText.trim();
        if (!text && !state.images.length) {
          alert('メッセージ本文を入力するか、画像をアップロードしてください。');
          return;
        }
      } else {
        const title = state.embed.title.trim();
        const desc = state.embed.description.trim();
        if (!title && !desc && !state.images.length && !state.embed.fields.length && !state.embed.thumbnail.data && !state.embed.author.name) {
          alert('Embedのタイトル、本文、作成者、または画像を設定してください。');
          return;
        }
      }
      goToStep(3);
    });

    // Message type switch
    el.typeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        el.typeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.messageType = btn.dataset.type;
        el.plainEditorSection.style.display = state.messageType === 'plain' ? 'block' : 'none';
        el.embedEditorSection.style.display = state.messageType === 'embed' ? 'block' : 'none';
        renderPreview();
      });
    });

    // Plain text input
    el.plainText.addEventListener('input', () => {
      state.plainText = el.plainText.value;
      el.plainCharCount.textContent = state.plainText.length;
      renderPreview();
    });

    // Embed Basic Inputs
    el.embedTitle.addEventListener('input', () => {
      state.embed.title = el.embedTitle.value;
      renderPreview();
    });
    el.embedTitleUrl.addEventListener('input', () => {
      state.embed.titleUrl = el.embedTitleUrl.value;
      renderPreview();
    });
    el.embedDesc.addEventListener('input', () => {
      state.embed.description = el.embedDesc.value;
      renderPreview();
    });

    // Color Pickers
    el.embedColor.addEventListener('input', (e) => {
      const col = e.target.value;
      state.embed.color = col;
      el.embedColorHex.value = col.toUpperCase();
      renderPreview();
    });
    el.embedColorHex.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        state.embed.color = val;
        el.embedColor.value = val;
        renderPreview();
      }
    });
    el.colorSwatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const col = swatch.dataset.color;
        state.embed.color = col;
        el.embedColor.value = col;
        el.embedColorHex.value = col.toUpperCase();
        renderPreview();
      });
    });

    // Thumbnail Uploader (PC & Mobile)
    setupSingleUploader(
      el.thumbUploadInput,
      el.btnThumbTrigger,
      el.thumbPreviewWrap,
      el.thumbPreviewImg,
      el.btnThumbClear,
      (dataUrl) => {
        state.embed.thumbnail.data = dataUrl;
        renderPreview();
      }
    );

    // Author Inputs & Icon Uploader
    el.embedAuthorName.addEventListener('input', () => {
      state.embed.author.name = el.embedAuthorName.value;
      renderPreview();
    });
    el.embedAuthorUrl.addEventListener('input', () => {
      state.embed.author.url = el.embedAuthorUrl.value;
      renderPreview();
    });
    setupSingleUploader(
      el.authorIconUploadInput,
      el.btnAuthorIconTrigger,
      el.authorIconPreviewWrap,
      el.authorIconPreviewImg,
      el.btnAuthorIconClear,
      (dataUrl) => {
        state.embed.author.iconData = dataUrl;
        renderPreview();
      }
    );

    // Footer Inputs & Icon Uploader
    el.embedFooterText.addEventListener('input', () => {
      state.embed.footer.text = el.embedFooterText.value;
      renderPreview();
    });
    el.embedFooterTimestamp.addEventListener('change', () => {
      state.embed.footer.timestamp = el.embedFooterTimestamp.checked;
      renderPreview();
    });
    setupSingleUploader(
      el.footerIconUploadInput,
      el.btnFooterIconTrigger,
      el.footerIconPreviewWrap,
      el.footerIconPreviewImg,
      el.btnFooterIconClear,
      (dataUrl) => {
        state.embed.footer.iconData = dataUrl;
        renderPreview();
      }
    );

    // Fields Management
    el.btnAddField.addEventListener('click', () => {
      if (state.embed.fields.length >= 25) {
        alert('フィールドは最大25個までです。');
        return;
      }
      state.embed.fields.push({ name: '', value: '', inline: false });
      renderFieldsEditor();
      renderPreview();
    });

    // Buttons Management
    el.btnAddButton.addEventListener('click', () => {
      if (state.buttons.length >= 5) {
        alert('ボタンは最大5個までです。');
        return;
      }
      state.buttons.push({ label: '', url: '' });
      renderButtonsEditor();
      renderPreview();
    });

    // Multiple Media Upload (Drag and drop & File select)
    el.mediaDropzone.addEventListener('click', () => el.imageUploadInput.click());
    el.imageUploadInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        handleImageFiles(e.target.files);
        e.target.value = '';
      }
    });

    el.mediaDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      el.mediaDropzone.classList.add('dragover');
    });
    el.mediaDropzone.addEventListener('dragleave', () => {
      el.mediaDropzone.classList.remove('dragover');
    });
    el.mediaDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      el.mediaDropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        handleImageFiles(e.dataTransfer.files);
      }
    });

    // 初期状態でフィールドが空なら1つ追加しておく (すべての項目をデフォルト表示)
    if (!state.embed.fields.length) {
      state.embed.fields.push({ name: '', value: '', inline: false });
    }

    renderFieldsEditor();
    renderButtonsEditor();
    renderMediaGallery();
    renderPreview();
  }

  function setupSingleUploader(inputEl, triggerBtn, previewWrap, previewImg, clearBtn, onDataChanged) {
    triggerBtn.addEventListener('click', () => inputEl.click());
    inputEl.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          previewImg.src = ev.target.result;
          previewWrap.style.display = 'flex';
          triggerBtn.style.display = 'none';
          onDataChanged(ev.target.result);
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    });
    clearBtn.addEventListener('click', () => {
      previewImg.src = '';
      previewWrap.style.display = 'none';
      triggerBtn.style.display = 'inline-flex';
      onDataChanged('');
    });
  }

  function handleImageFiles(fileList) {
    const remaining = 10 - state.images.length;
    if (remaining <= 0) {
      alert('画像は最大10枚まで追加できます。');
      return;
    }
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/')).slice(0, remaining);
    if (!files.length) return;

    let loadedCount = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        state.images.push({
          filename: file.name,
          data: e.target.result
        });
        loadedCount++;
        if (loadedCount === files.length) {
          renderMediaGallery();
          renderPreview();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function renderMediaGallery() {
    el.uploadedImagesCount.textContent = state.images.length;
    el.mediaGalleryGrid.innerHTML = '';
    if (!state.images.length) {
      el.mediaGalleryGrid.style.display = 'none';
      return;
    }
    el.mediaGalleryGrid.style.display = 'grid';

    state.images.forEach((img, idx) => {
      const card = document.createElement('div');
      card.className = 'media-thumb-card';
      card.innerHTML = `
        <img src="${img.data}" class="media-thumb-img" alt="${escapeHtml(img.filename)}">
        <button type="button" class="media-thumb-remove" title="画像を削除" aria-label="削除">${CLOSE_ICON}</button>
      `;

      card.querySelector('.media-thumb-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        state.images.splice(idx, 1);
        renderMediaGallery();
        renderPreview();
      });

      el.mediaGalleryGrid.appendChild(card);
    });
  }

  function renderFieldsEditor() {
    el.fieldsEditorList.innerHTML = '';
    state.embed.fields.forEach((f, idx) => {
      const row = document.createElement('div');
      row.className = 'field-editor-row';
      row.innerHTML = `
        <div class="field-inputs">
          <input type="text" class="form-input field-name-input" placeholder="項目名" value="${escapeHtml(f.name)}" style="flex:1;">
          <input type="text" class="form-input field-val-input" placeholder="値" value="${escapeHtml(f.value)}" style="flex:2;">
        </div>
        <label class="field-inline-toggle">
          <input type="checkbox" ${f.inline ? 'checked' : ''}>横並び
        </label>
        <button type="button" class="btn-del-row" title="削除">&times;</button>
      `;

      const nameInput = row.querySelector('.field-name-input');
      const valInput = row.querySelector('.field-val-input');
      const inlineCheck = row.querySelector('input[type="checkbox"]');
      const delBtn = row.querySelector('.btn-del-row');

      nameInput.addEventListener('input', () => { f.name = nameInput.value; renderPreview(); });
      valInput.addEventListener('input', () => { f.value = valInput.value; renderPreview(); });
      inlineCheck.addEventListener('change', () => { f.inline = inlineCheck.checked; renderPreview(); });
      delBtn.addEventListener('click', () => {
        state.embed.fields.splice(idx, 1);
        renderFieldsEditor();
        renderPreview();
      });

      el.fieldsEditorList.appendChild(row);
    });
  }

  function renderButtonsEditor() {
    el.buttonsEditorList.innerHTML = '';
    state.buttons.forEach((b, idx) => {
      const row = document.createElement('div');
      row.className = 'button-editor-row';
      row.innerHTML = `
        <div class="button-inputs">
          <input type="text" class="form-input btn-label-input" placeholder="ボタン名" value="${escapeHtml(b.label)}" style="flex:1;">
          <input type="url" class="form-input btn-url-input" placeholder="https://..." value="${escapeHtml(b.url)}" style="flex:2;">
        </div>
        <button type="button" class="btn-del-row" title="削除">&times;</button>
      `;

      const [labelInput, urlInput] = row.querySelectorAll('input');
      const delBtn = row.querySelector('.btn-del-row');

      labelInput.addEventListener('input', () => { b.label = labelInput.value; renderPreview(); });
      urlInput.addEventListener('input', () => { b.url = urlInput.value; renderPreview(); });
      delBtn.addEventListener('click', () => {
        state.buttons.splice(idx, 1);
        renderButtonsEditor();
        renderPreview();
      });

      el.buttonsEditorList.appendChild(row);
    });
  }

  function renderPreview() {
    if (state.messageType === 'plain') {
      el.pvPlainWrap.style.display = 'block';
      el.pvPlainWrap.textContent = state.plainText || '（メッセージ本文を入力してください）';
      el.pvEmbedCard.style.display = 'none';

      // ギャラリー画像
      el.pvMediaGallery.innerHTML = '';
      if (state.images.length) {
        el.pvMediaGallery.style.display = 'grid';
        state.images.forEach((img) => {
          const imgEl = document.createElement('img');
          imgEl.src = img.data;
          el.pvMediaGallery.appendChild(imgEl);
        });
      } else {
        el.pvMediaGallery.style.display = 'none';
      }
    } else {
      el.pvPlainWrap.style.display = 'none';
      el.pvEmbedCard.style.display = 'flex';

      // Accent color
      el.pvEmbedPill.style.background = state.embed.color || '#5865F2';

      // Author
      const hasAuthor = !!(state.embed.author.name.trim() || state.embed.author.iconData);
      if (hasAuthor) {
        el.pvEmbedAuthor.style.display = 'flex';
        if (state.embed.author.iconData) {
          el.pvAuthorIcon.src = state.embed.author.iconData;
          el.pvAuthorIcon.style.display = 'block';
        } else {
          el.pvAuthorIcon.style.display = 'none';
        }
        el.pvAuthorLink.textContent = state.embed.author.name || '作成者';
        if (state.embed.author.url.trim()) {
          el.pvAuthorLink.href = state.embed.author.url;
        } else {
          el.pvAuthorLink.removeAttribute('href');
        }
      } else {
        el.pvEmbedAuthor.style.display = 'none';
      }

      // Title
      if (state.embed.title.trim()) {
        el.pvEmbedTitleWrap.style.display = 'block';
        el.pvEmbedTitle.textContent = state.embed.title;
        if (state.embed.titleUrl.trim()) {
          el.pvEmbedTitle.href = state.embed.titleUrl;
          el.pvEmbedTitle.className = 'pv-title-link';
        } else {
          el.pvEmbedTitle.removeAttribute('href');
          el.pvEmbedTitle.className = 'pv-title-text';
        }
      } else {
        el.pvEmbedTitleWrap.style.display = 'none';
      }

      // Description
      if (state.embed.description.trim()) {
        el.pvEmbedDesc.style.display = 'block';
        el.pvEmbedDesc.textContent = state.embed.description;
      } else {
        el.pvEmbedDesc.style.display = 'none';
      }

      // Fields
      const validFields = state.embed.fields.filter((f) => f.name.trim() || f.value.trim());
      el.pvEmbedFields.innerHTML = '';
      if (validFields.length) {
        el.pvEmbedFields.style.display = 'grid';
        validFields.forEach((f) => {
          const col = document.createElement('div');
          col.className = 'pv-field-col' + (f.inline ? '' : ' full-width');
          col.innerHTML = `
            <div class="pv-field-name">${escapeHtml(f.name || '​')}</div>
            <div class="pv-field-value">${escapeHtml(f.value || '​')}</div>
          `;
          el.pvEmbedFields.appendChild(col);
        });
      } else {
        el.pvEmbedFields.style.display = 'none';
      }

      // Thumbnail
      if (state.embed.thumbnail.data) {
        el.pvEmbedThumbnail.src = state.embed.thumbnail.data;
        el.pvEmbedThumbnail.style.display = 'block';
      } else {
        el.pvEmbedThumbnail.style.display = 'none';
      }

      // Main image (1枚目をEmbed内に表示)
      if (state.images.length > 0) {
        el.pvEmbedMainImg.src = state.images[0].data;
        el.pvEmbedMainImg.style.display = 'block';
      } else {
        el.pvEmbedMainImg.style.display = 'none';
      }

      // 2枚目以降の画像をEmbed下にグリッド表示
      el.pvMediaGallery.innerHTML = '';
      if (state.images.length > 1) {
        el.pvMediaGallery.style.display = 'grid';
        state.images.slice(1).forEach((img) => {
          const imgEl = document.createElement('img');
          imgEl.src = img.data;
          el.pvMediaGallery.appendChild(imgEl);
        });
      } else {
        el.pvMediaGallery.style.display = 'none';
      }

      // Footer
      const hasFooter = !!(state.embed.footer.text.trim() || state.embed.footer.iconData || state.embed.footer.timestamp);
      if (hasFooter) {
        el.pvEmbedFooter.style.display = 'flex';
        if (state.embed.footer.iconData) {
          el.pvFooterIcon.src = state.embed.footer.iconData;
          el.pvFooterIcon.style.display = 'block';
        } else {
          el.pvFooterIcon.style.display = 'none';
        }
        el.pvFooterText.textContent = state.embed.footer.text || '';
        el.pvFooterSep.style.display = (state.embed.footer.text && state.embed.footer.timestamp) ? 'inline' : 'none';
        el.pvFooterTimestamp.style.display = state.embed.footer.timestamp ? 'inline' : 'none';
      } else {
        el.pvEmbedFooter.style.display = 'none';
      }
    }

    // Buttons (Embed & Plain共通)
    const validBtns = state.buttons.filter((b) => b.label.trim() && b.url.trim());
    el.pvButtonsWrap.innerHTML = '';
    if (validBtns.length) {
      el.pvButtonsWrap.style.display = 'flex';
      validBtns.forEach((b) => {
        const btn = document.createElement('a');
        btn.className = 'pv-discord-btn';
        btn.href = b.url;
        btn.target = '_blank';
        btn.rel = 'noopener';
        btn.textContent = b.label;
        el.pvButtonsWrap.appendChild(btn);
      });
    } else {
      el.pvButtonsWrap.style.display = 'none';
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
        text: state.plainText.trim()
      };
      if (state.images.length) {
        payload.content.images = state.images.map((img) => ({
          filename: img.filename,
          data: img.data
        }));
        payload.content.image_data = state.images[0].data;
        payload.content.image_filename = state.images[0].filename;
      }
    } else {
      const content = {
        color: state.embed.color || '#5865F2'
      };

      if (state.embed.title.trim()) content.title = state.embed.title.trim();
      if (state.embed.titleUrl.trim()) content.title_url = state.embed.titleUrl.trim();
      if (state.embed.description.trim()) content.description = state.embed.description.trim();

      // Author
      if (state.embed.author.name.trim() || state.embed.author.iconData) {
        content.author = {};
        if (state.embed.author.name.trim()) content.author.name = state.embed.author.name.trim();
        if (state.embed.author.url.trim()) content.author.url = state.embed.author.url.trim();
        if (state.embed.author.iconData) {
          content.author.icon_data = state.embed.author.iconData;
          content.author.icon_url = state.embed.author.iconData;
        }
      }

      // Thumbnail
      if (state.embed.thumbnail.data) {
        content.thumbnail_data = state.embed.thumbnail.data;
        content.thumbnail_url = state.embed.thumbnail.data;
      }

      // Footer
      if (state.embed.footer.text.trim() || state.embed.footer.iconData) {
        content.footer = {};
        if (state.embed.footer.text.trim()) content.footer.text = state.embed.footer.text.trim();
        if (state.embed.footer.iconData) {
          content.footer.icon_data = state.embed.footer.iconData;
          content.footer.icon_url = state.embed.footer.iconData;
        }
      }

      // Fields
      const validFields = state.embed.fields
        .filter((f) => f.name.trim() || f.value.trim())
        .map((f) => ({ name: f.name.trim(), value: f.value.trim(), inline: !!f.inline }));
      if (validFields.length) content.fields = validFields;

      // Images
      if (state.images.length) {
        content.images = state.images.map((img) => ({
          filename: img.filename,
          data: img.data
        }));
        content.image_data = state.images[0].data;
        content.image_filename = state.images[0].filename;
      }

      payload.content = content;
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

        // 1. チャンネル復元
        if (Array.isArray(data.channel_ids)) {
          state.channels.forEach((c) => {
            c.selected = data.channel_ids.includes(c.id);
          });
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

        // 2. 送信タイミング復元
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

        // 3. 繰り返し復元
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

        // 4. メッセージ形式復元
        const mtype = data.type || 'embed';
        state.messageType = mtype;
        el.typeBtns.forEach((b) => b.classList.toggle('active', b.dataset.type === mtype));
        el.plainEditorSection.style.display = mtype === 'plain' ? 'block' : 'none';
        el.embedEditorSection.style.display = mtype === 'embed' ? 'block' : 'none';

        const content = data.content || {};
        if (mtype === 'plain') {
          state.plainText = content.text || '';
          el.plainText.value = state.plainText;
          el.plainCharCount.textContent = state.plainText.length;
        } else {
          // Embed Title & Desc
          state.embed.title = content.title || '';
          state.embed.titleUrl = content.title_url || '';
          state.embed.description = content.description || '';
          el.embedTitle.value = state.embed.title;
          el.embedTitleUrl.value = state.embed.titleUrl;
          el.embedDesc.value = state.embed.description;

          // Color
          if (content.color) {
            let hex = content.color;
            if (typeof hex === 'number') hex = '#' + hex.toString(16).padStart(6, '0');
            state.embed.color = hex;
            el.embedColor.value = hex;
            el.embedColorHex.value = hex.toUpperCase();
          }

          // Author
          state.embed.author.name = (content.author && content.author.name) || '';
          state.embed.author.url = (content.author && content.author.url) || '';
          state.embed.author.iconData = (content.author && (content.author.icon_data || content.author.icon_url)) || '';
          el.embedAuthorName.value = state.embed.author.name;
          el.embedAuthorUrl.value = state.embed.author.url;
          if (state.embed.author.iconData) {
            el.authorIconPreviewImg.src = state.embed.author.iconData;
            el.authorIconPreviewWrap.style.display = 'flex';
            el.btnAuthorIconTrigger.style.display = 'none';
          } else {
            el.authorIconPreviewWrap.style.display = 'none';
            el.btnAuthorIconTrigger.style.display = 'inline-flex';
          }

          // Thumbnail
          state.embed.thumbnail.data = content.thumbnail_data || content.thumbnail_url || '';
          if (state.embed.thumbnail.data) {
            el.thumbPreviewImg.src = state.embed.thumbnail.data;
            el.thumbPreviewWrap.style.display = 'flex';
            el.btnThumbTrigger.style.display = 'none';
          } else {
            el.thumbPreviewWrap.style.display = 'none';
            el.btnThumbTrigger.style.display = 'inline-flex';
          }

          // Footer
          state.embed.footer.text = (content.footer && content.footer.text) || '';
          state.embed.footer.iconData = (content.footer && (content.footer.icon_data || content.footer.icon_url)) || '';
          el.embedFooterText.value = state.embed.footer.text;
          if (state.embed.footer.iconData) {
            el.footerIconPreviewImg.src = state.embed.footer.iconData;
            el.footerIconPreviewWrap.style.display = 'flex';
            el.btnFooterIconTrigger.style.display = 'none';
          } else {
            el.footerIconPreviewWrap.style.display = 'none';
            el.btnFooterIconTrigger.style.display = 'inline-flex';
          }

          // Fields
          state.embed.fields = Array.isArray(content.fields) ? content.fields : [];
          renderFieldsEditor();
        }

        // 複数画像復元
        state.images = [];
        if (Array.isArray(content.images)) {
          state.images = content.images.map((img, i) => ({
            filename: img.filename || `image_${i + 1}.png`,
            data: img.data || img.image_data || ''
          })).filter((img) => img.data);
        } else if (content.image_data) {
          state.images.push({
            filename: content.image_filename || 'image.png',
            data: content.image_data
          });
        }
        renderMediaGallery();

        // ボタン復元
        state.buttons = Array.isArray(data.buttons) ? data.buttons : [];
        renderButtonsEditor();

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

  function checkHasBotSession() {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get('cid') || params.get('chs') || params.get('gid'));
  }

  // --- Initializer ---
  function init() {
    initTheme();

    if (!checkHasBotSession()) {
      if (el.appMainContent) el.appMainContent.style.display = 'none';
      if (el.noSessionView) el.noSessionView.style.display = 'flex';
      if (el.headerSessionActions) el.headerSessionActions.style.display = 'none';
      return;
    }

    if (el.appMainContent) el.appMainContent.style.display = 'block';
    if (el.noSessionView) el.noSessionView.style.display = 'none';
    if (el.headerSessionActions) el.headerSessionActions.style.display = 'flex';

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
