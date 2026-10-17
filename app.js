/**
 * Discord Message Scheduler - Modern Web App (STEP 1 Focus)
 * Linear / Vercel-inspired UI with Multi-channel selection & JSON export
 */

(() => {
  'use strict';

  // --- DOM Helpers ---
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  // --- State ---
  const HASH_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;
  const VOICE_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
  const CHEVRON_DOWN_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
  const CLOSE_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  const SUN_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const MOON_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

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
    buttons: [],
    collapsedCategories: new Set(),
    allCategoriesCollapsed: false
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

    // Step 1: Channels (Multi-select & up to 500 channels)
    channelSearch: $('channel-search-input'),
    btnClearSearch: $('btn-clear-search'),
    btnSelectAllChannels: $('btn-select-all-channels'),
    btnClearAllChannels: $('btn-clear-all-channels'),
    btnToggleAllCats: $('btn-toggle-all-cats'),
    btnImportChannelsTrigger: $('btn-import-channels-trigger'),
    inputChannelsFile: $('input-channels-file'),
    btnToggleCustomChannel: $('btn-toggle-custom-channel'),
    customChannelWrap: $('custom-channel-wrap'),
    inputCustomChannelId: $('input-custom-channel-id'),
    btnApplyCustomChannel: $('btn-apply-custom-channel'),
    btnCancelCustomChannel: $('btn-cancel-custom-channel'),
    selectedChannelCount: $('selected-channel-count'),
    selectedChips: $('selected-channels-chips'),
    channelContainer: $('channel-list-container'),
    channelEmptyHint: $('channel-empty-hint'),

    // Step 1: Timing & Big Datetime Modal
    timingRadios: $$('input[name="timing_mode"]'),
    timingScheduledLabel: $('segment-scheduled-label'),
    timingImmediateLabel: $('segment-immediate-label'),
    scheduledSection: $('scheduled-datetime-section'),
    immediateCard: $('immediate-info-card'),
    inputDate: $('input-date'),
    inputTime: $('input-time'),
    btnOpenDatetimeModal: $('btn-open-datetime-modal'),
    dtDisplayText: $('dt-display-text'),
    modalDatetime: $('modal-datetime'),
    btnDatetimeClose: $('btn-datetime-close'),
    btnDatetimeCancel: $('btn-datetime-cancel'),
    btnDatetimeConfirm: $('btn-datetime-confirm'),
    btnCalPrev: $('btn-cal-prev'),
    btnCalNext: $('btn-cal-next'),
    calMonthTitle: $('cal-month-title'),
    calendarDaysGrid: $('calendar-days-grid'),
    timeModalHour: $('time-modal-hour'),
    timeModalMinute: $('time-modal-minute'),
    btnHourStepUp: $('btn-hour-step-up'),
    btnHourStepDown: $('btn-hour-step-down'),
    btnMinuteStepUp: $('btn-minute-step-up'),
    btnMinuteStepDown: $('btn-minute-step-down'),
    quickMinBtns: $$('.btn-quick-min'),
    modalDtPreviewText: $('modal-dt-preview-text'),

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
    btnSubmitApiFinal: $('btn-submit-api-final'),
    apiSubmitArea: $('api-submit-area'),
    apiSubmitStatus: $('api-submit-status'),
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

  // --- Active FastAPI Session State ---
  let activeSessionId = null;
  let activeApiUrl = '';

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

  // --- Channels Management (Step 1: Multi-select & 500 Channels Support) ---
  function parseChannelsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const cidsParam = params.get('cids');
    const cnamesParam = params.get('cnames');
    const chsToken = params.get('chs');
    const defaultCid = params.get('cid');
    const defaultCname = params.get('cname') || '一般';

    let loadedList = [];
    const discordChosenIds = new Set();

    // 1. Discord側で選ばれたチャンネルID群 (cids) を優先解析
    if (cidsParam) {
      if (cidsParam.startsWith('D_') && typeof window.pako !== 'undefined') {
        try {
          let b64 = cidsParam.slice(2).trim().replace(/-/g, '+').replace(/_/g, '/');
          while (b64.length % 4) b64 += '=';
          const binStr = atob(b64);
          const bytes = new Uint8Array(binStr.length);
          for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
          const raw = window.pako.inflate(bytes, { to: 'string' });
          const [baseStr, deltasStr] = raw.split(':');
          const baseId = BigInt(baseStr);
          deltasStr.split(',').forEach((d) => {
            const cid = (baseId + BigInt(d)).toString();
            discordChosenIds.add(cid);
          });
        } catch (e) {
          console.warn('cids delta decode error:', e);
        }
      } else {
        cidsParam.split(',').forEach((s) => {
          const clean = s.trim();
          if (clean) discordChosenIds.add(clean);
        });
      }
    } else if (defaultCid) {
      discordChosenIds.add(String(defaultCid));
    }

    // 2. サーバー全チャンネルカタログ (chsToken) の解析
    if (chsToken && typeof window.pako !== 'undefined') {
      try {
        let b64 = chsToken.trim().replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const binStr = atob(b64);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        const jsonStr = window.pako.inflate(bytes, { to: 'string' });
        const parsed = JSON.parse(jsonStr);

        if (parsed && parsed.v === 2 && parsed.b && Array.isArray(parsed.c) && Array.isArray(parsed.l)) {
          const baseId = BigInt(parsed.b);
          const cats = parsed.c;
          loadedList = parsed.l.map(([delta, name, isVoice, catIdx]) => {
            const cid = (baseId + BigInt(delta)).toString();
            return {
              id: cid,
              name: String(name || 'channel'),
              category: String(cats[catIdx] || '未分類'),
              type: isVoice === 1 ? 'voice' : 'text',
              selected: discordChosenIds.has(cid)
            };
          });
        } else if (Array.isArray(parsed)) {
          loadedList = parsed.map((c) => {
            if (Array.isArray(c)) {
              return {
                id: String(c[0]),
                name: String(c[1] || 'channel'),
                category: String(c[3] || 'テキストチャンネル'),
                type: c[2] === 1 ? 'voice' : 'text',
                selected: discordChosenIds.has(String(c[0]))
              };
            }
            return {
              id: String(c.id),
              name: c.name || 'channel',
              category: c.category || 'テキストチャンネル',
              type: c.type || 'text',
              selected: discordChosenIds.has(String(c.id))
            };
          });
        }
      } catch (e) {
        console.warn('chs parameter parse error:', e);
      }
    }

    // 3. Discord側で指定されたチャンネルがカタログにない場合、補完
    if (discordChosenIds.size > 0) {
      const names = cnamesParam ? cnamesParam.split(',').map((s) => s.trim()) : [];
      let idx = 0;
      discordChosenIds.forEach((cid) => {
        if (!loadedList.some((c) => c.id === cid)) {
          const cname = names[idx] || (cid === defaultCid ? defaultCname : `ch-${cid.slice(-4)}`);
          loadedList.unshift({
            id: cid,
            name: cname,
            category: 'Discord設定',
            type: 'text',
            selected: true
          });
        }
        idx++;
      });
    }

    // 4. フォールバック
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
      loadedList.push({
        id: 'default',
        name: '一般',
        category: 'テキストチャンネル',
        type: 'text',
        selected: true
      });
    }

    if (!loadedList.some((c) => c.selected)) {
      loadedList[0].selected = true;
    }

    state.channels = loadedList;
    renderChannelsList();
    renderSelectedChips();
  }

    // Botが送信した channels.json を直接読み込んで全500件完全同期
  function loadChannelsFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const list = JSON.parse(text);
        if (Array.isArray(list) && list.length) {
          const currentSelected = new Set(state.channels.filter((c) => c.selected).map((c) => c.id));
          state.channels = list.map((c) => {
            const cid = String(c.id || c[0] || '');
            const cname = String(c.name || c[1] || 'channel');
            const ctype = (c.type === 'voice' || c[2] === 1) ? 'voice' : 'text';
            const ccat = String(c.category || c[3] || '未分類');
            return {
              id: cid,
              name: cname,
              category: ccat,
              type: ctype,
              selected: currentSelected.has(cid)
            };
          }).filter((c) => c.id);

          if (!state.channels.some((c) => c.selected) && state.channels.length > 0) {
            state.channels[0].selected = true;
          }

          renderChannelsList();
          renderSelectedChips();
          showToast(`全 ${state.channels.length} チャンネルを完全同期しました`);
        } else {
          alert('有効なチャンネル一覧データが見つかりませんでした。');
        }
      } catch (err) {
        alert('channels.json の読み込みに失敗しました: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function renderChannelsList() {
    if (!el.channelContainer) return;
    el.channelContainer.innerHTML = '';
    const query = (el.channelSearch && el.channelSearch.value) ? el.channelSearch.value.trim().toLowerCase() : '';

    // 絞り込みフィルタ
    const filtered = state.channels.filter((c) => {
      if (!query) return true;
      return c.name.toLowerCase().includes(query) || (c.category && c.category.toLowerCase().includes(query));
    });

    if (!filtered.length) {
      if (el.channelEmptyHint) el.channelEmptyHint.style.display = 'block';
      return;
    }
    if (el.channelEmptyHint) el.channelEmptyHint.style.display = 'none';

    // Discordの実際の並び順のままカテゴリを抽出 (出現順を完全保持)
    const catOrder = [];
    const catMap = new Map();
    filtered.forEach((c) => {
      const catName = c.category || '未分類';
      if (!catMap.has(catName)) {
        catOrder.push(catName);
        catMap.set(catName, []);
      }
      catMap.get(catName).push(c);
    });

    catOrder.forEach((catName) => {
      const channelsInCat = catMap.get(catName);
      const isCollapsed = query ? false : state.collapsedCategories.has(catName);

      // カテゴリヘッダー
      const grpHeader = document.createElement('div');
      grpHeader.className = `channel-group-header ${isCollapsed ? 'collapsed' : ''}`;
      
      const selectedCount = channelsInCat.filter((c) => c.selected).length;
      const countBadge = selectedCount > 0 ? `<span class="cat-count-badge">${selectedCount}/${channelsInCat.length}</span>` : '';

      grpHeader.innerHTML = `
        <div class="cat-title-left">
          <span class="cat-chevron">${CHEVRON_DOWN_ICON}</span>
          <span class="cat-name">${escapeHtml(catName)}</span>
          ${countBadge}
        </div>
        <div class="cat-actions" onclick="event.stopPropagation();">
          <button type="button" class="cat-select-btn" data-cat="${escapeHtml(catName)}" data-action="select">全選択</button>
          <button type="button" class="cat-select-btn" data-cat="${escapeHtml(catName)}" data-action="clear">解除</button>
        </div>
      `;

      // アコーディオン開閉
      grpHeader.addEventListener('click', () => {
        if (state.collapsedCategories.has(catName)) {
          state.collapsedCategories.delete(catName);
        } else {
          state.collapsedCategories.add(catName);
        }
        renderChannelsList();
      });

      // カテゴリ内全選択・全解除
      grpHeader.querySelectorAll('.cat-select-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          channelsInCat.forEach((c) => {
            c.selected = (action === 'select');
          });
          renderChannelsList();
          renderSelectedChips();
        });
      });

      el.channelContainer.appendChild(grpHeader);

      // チャンネル行コンテナ
      const itemsContainer = document.createElement('div');
      itemsContainer.className = `channel-group-items ${isCollapsed ? 'collapsed' : ''}`;

      channelsInCat.forEach((c) => {
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
          // カテゴリのバッジ更新
          const currentHeader = itemsContainer.previousElementSibling;
          if (currentHeader) {
            const newSelCount = channelsInCat.filter((x) => x.selected).length;
            const titleLeft = currentHeader.querySelector('.cat-title-left');
            const existingBadge = titleLeft.querySelector('.cat-count-badge');
            if (newSelCount > 0) {
              if (existingBadge) {
                existingBadge.textContent = `${newSelCount}/${channelsInCat.length}`;
              } else {
                const badge = document.createElement('span');
                badge.className = 'cat-count-badge';
                badge.textContent = `${newSelCount}/${channelsInCat.length}`;
                titleLeft.appendChild(badge);
              }
            } else if (existingBadge) {
              existingBadge.remove();
            }
          }
        });

        itemsContainer.appendChild(item);
      });

      el.channelContainer.appendChild(itemsContainer);
    });
  }

  function renderSelectedChips() {
    const selected = state.channels.filter((c) => c.selected);
    if (el.selectedChannelCount) el.selectedChannelCount.textContent = selected.length;
    if (!el.selectedChips) return;
    el.selectedChips.innerHTML = '';

    if (!selected.length) {
      el.selectedChips.innerHTML = '<span style="font-size:0.78rem;color:var(--text-tertiary);line-height:26px;">チャンネルが選択されていません (最低1つ選択してください)</span>';
      if (el.pvTargetBadge) el.pvTargetBadge.textContent = 'チャンネル未選択';
      return;
    }

    if (el.pvTargetBadge) {
      el.pvTargetBadge.textContent = selected.length === 1 ? `#${selected[0].name}` : `${selected.length} チャンネル`;
    }

    // 10件以下の場合は全チップを表示
    if (selected.length <= 10) {
      selected.forEach((c) => {
        const chip = document.createElement('div');
        chip.className = 'channel-chip';
        chip.innerHTML = `
          <span class="chip-icon">${c.type === 'voice' ? VOICE_ICON : HASH_ICON}</span>
          <span class="chip-name">${escapeHtml(c.name)}</span>
          <button type="button" class="channel-chip-remove" title="選択解除" aria-label="削除">${CLOSE_ICON}</button>
        `;

        chip.querySelector('.channel-chip-remove').addEventListener('click', () => {
          c.selected = false;
          renderChannelsList();
          renderSelectedChips();
        });

        el.selectedChips.appendChild(chip);
      });
    } else {
      // 10件超（最大500件）の場合は最初の8件 + 残り件数バッジでスッキリ表示
      selected.slice(0, 8).forEach((c) => {
        const chip = document.createElement('div');
        chip.className = 'channel-chip';
        chip.innerHTML = `
          <span class="chip-icon">${c.type === 'voice' ? VOICE_ICON : HASH_ICON}</span>
          <span class="chip-name">${escapeHtml(c.name)}</span>
          <button type="button" class="channel-chip-remove" title="選択解除" aria-label="削除">${CLOSE_ICON}</button>
        `;

        chip.querySelector('.channel-chip-remove').addEventListener('click', () => {
          c.selected = false;
          renderChannelsList();
          renderSelectedChips();
        });

        el.selectedChips.appendChild(chip);
      });

      const morePill = document.createElement('span');
      morePill.className = 'channel-chip-overflow';
      morePill.textContent = `...ほか ${selected.length - 8} チャンネル`;
      el.selectedChips.appendChild(morePill);

      const clearAllBtn = document.createElement('button');
      clearAllBtn.type = 'button';
      clearAllBtn.className = 'btn btn-ghost btn-xs';
      clearAllBtn.textContent = '全解除';
      clearAllBtn.addEventListener('click', () => {
        state.channels.forEach((c) => { c.selected = false; });
        renderChannelsList();
        renderSelectedChips();
      });
      el.selectedChips.appendChild(clearAllBtn);
    }
  }

  // --- Step 1 Timing & Full Datetime Modal Logic ---
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  // カレンダーモーダル用内部状態
  const calState = {
    viewYear: 2026,
    viewMonth: 9, // 0-indexed (9 = 10月)
    selectedYear: 2026,
    selectedMonth: 9,
    selectedDay: 17,
    selectedHour: 12,
    selectedMinute: 0
  };

  function initTimingDefaults() {
    const now = new Date();
    // 10分後を基準とし、次の5分単位にスマート繰り上げ
    now.setMinutes(now.getMinutes() + 10);
    const rem = now.getMinutes() % 5;
    if (rem !== 0) {
      now.setMinutes(now.getMinutes() + (5 - rem));
    }
    now.setSeconds(0);
    now.setMilliseconds(0);

    calState.viewYear = now.getFullYear();
    calState.viewMonth = now.getMonth();
    calState.selectedYear = now.getFullYear();
    calState.selectedMonth = now.getMonth();
    calState.selectedDay = now.getDate();
    calState.selectedHour = now.getHours();
    calState.selectedMinute = now.getMinutes();

    el.inputDate.value = `${calState.selectedYear}-${pad(calState.selectedMonth + 1)}-${pad(calState.selectedDay)}`;
    el.inputTime.value = `${pad(calState.selectedHour)}:${pad(calState.selectedMinute)}`;

    initTimeSelectOptions();
    updateTimingDisplay();
  }

  function initTimeSelectOptions() {
    if (!el.timeModalHour || !el.timeModalMinute) return;

    function syncTimeDisplay() {
      el.timeModalHour.value = pad(calState.selectedHour);
      el.timeModalMinute.value = pad(calState.selectedMinute);
      updateModalPreviewText();
    }

    syncTimeDisplay();

    // 時の増減 (+1 / -1)
    if (el.btnHourStepUp) {
      el.btnHourStepUp.addEventListener('click', () => {
        calState.selectedHour = (calState.selectedHour + 1) % 24;
        syncTimeDisplay();
      });
    }
    if (el.btnHourStepDown) {
      el.btnHourStepDown.addEventListener('click', () => {
        calState.selectedHour = (calState.selectedHour - 1 + 24) % 24;
        syncTimeDisplay();
      });
    }

    // 分の増減 (+5 / -5)
    if (el.btnMinuteStepUp) {
      el.btnMinuteStepUp.addEventListener('click', () => {
        calState.selectedMinute = (Math.floor(calState.selectedMinute / 5) * 5 + 5) % 60;
        syncTimeDisplay();
      });
    }
    if (el.btnMinuteStepDown) {
      el.btnMinuteStepDown.addEventListener('click', () => {
        calState.selectedMinute = (Math.ceil(calState.selectedMinute / 5) * 5 - 5 + 60) % 60;
        syncTimeDisplay();
      });
    }

    // クイック分ボタン (:00, :15, :30, :45)
    if (el.quickMinBtns) {
      el.quickMinBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          calState.selectedMinute = parseInt(btn.dataset.min, 10) || 0;
          syncTimeDisplay();
        });
      });
    }

    // 直接数値入力時のハンドリング
    el.timeModalHour.addEventListener('input', () => {
      let val = parseInt(el.timeModalHour.value, 10);
      if (!isNaN(val)) {
        if (val < 0) val = 0;
        if (val > 23) val = 23;
        calState.selectedHour = val;
        updateModalPreviewText();
      }
    });
    el.timeModalHour.addEventListener('blur', () => {
      el.timeModalHour.value = pad(calState.selectedHour);
    });

    el.timeModalMinute.addEventListener('input', () => {
      let val = parseInt(el.timeModalMinute.value, 10);
      if (!isNaN(val)) {
        if (val < 0) val = 0;
        if (val > 59) val = 59;
        calState.selectedMinute = val;
        updateModalPreviewText();
      }
    });
    el.timeModalMinute.addEventListener('blur', () => {
      el.timeModalMinute.value = pad(calState.selectedMinute);
    });
  }

  function renderCalendarGrid() {
    if (!el.calendarDaysGrid || !el.calMonthTitle) return;

    el.calMonthTitle.textContent = `${calState.viewYear}年 ${calState.viewMonth + 1}月`;
    el.calendarDaysGrid.innerHTML = '';

    const firstDayIndex = new Date(calState.viewYear, calState.viewMonth, 1).getDay();
    const daysInMonth = new Date(calState.viewYear, calState.viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calState.viewYear, calState.viewMonth, 0).getDate();

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    // 前月の日付セル (埋め草)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month disabled';
      cell.textContent = daysInPrevMonth - i;
      el.calendarDaysGrid.appendChild(cell);
    }

    // 当月の日付セル
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell';
      cell.textContent = d;

      const isPast = (
        calState.viewYear < todayYear ||
        (calState.viewYear === todayYear && calState.viewMonth < todayMonth) ||
        (calState.viewYear === todayYear && calState.viewMonth === todayMonth && d < todayDate)
      );

      const isToday = (
        calState.viewYear === todayYear &&
        calState.viewMonth === todayMonth &&
        d === todayDate
      );

      const isSelected = (
        calState.viewYear === calState.selectedYear &&
        calState.viewMonth === calState.selectedMonth &&
        d === calState.selectedDay
      );

      if (isPast) cell.classList.add('disabled');
      if (isToday) cell.classList.add('today');
      if (isSelected) cell.classList.add('selected');

      if (!isPast) {
        cell.addEventListener('click', () => {
          calState.selectedYear = calState.viewYear;
          calState.selectedMonth = calState.viewMonth;
          calState.selectedDay = d;
          renderCalendarGrid();
          updateModalPreviewText();
        });
      }

      el.calendarDaysGrid.appendChild(cell);
    }

    // 翌月の日付セル (週の終わりまで埋める)
    const totalRendered = firstDayIndex + daysInMonth;
    const remaining = (7 - (totalRendered % 7)) % 7;
    for (let nextD = 1; nextD <= remaining; nextD++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month disabled';
      cell.textContent = nextD;
      el.calendarDaysGrid.appendChild(cell);
    }
  }

  function updateModalPreviewText() {
    const d = new Date(calState.selectedYear, calState.selectedMonth, calState.selectedDay, calState.selectedHour, calState.selectedMinute);
    const weekdaysJp = ['日', '月', '火', '水', '木', '金', '土'];
    const text = `${calState.selectedYear}/${pad(calState.selectedMonth + 1)}/${pad(calState.selectedDay)}(${weekdaysJp[d.getDay()]}) ${pad(calState.selectedHour)}:${pad(calState.selectedMinute)}`;
    if (el.modalDtPreviewText) el.modalDtPreviewText.textContent = text;
  }

  function openDatetimeModal() {
    // 現在の入力値を反映
    if (el.inputDate.value && el.inputTime.value) {
      const parts = el.inputDate.value.split('-');
      const timeParts = el.inputTime.value.split(':');
      if (parts.length === 3) {
        calState.selectedYear = parseInt(parts[0], 10);
        calState.selectedMonth = parseInt(parts[1], 10) - 1;
        calState.selectedDay = parseInt(parts[2], 10);
        calState.viewYear = calState.selectedYear;
        calState.viewMonth = calState.selectedMonth;
      }
      if (timeParts.length >= 2) {
        calState.selectedHour = parseInt(timeParts[0], 10);
        calState.selectedMinute = parseInt(timeParts[1], 10);
      }
    }

    if (el.timeModalHour) el.timeModalHour.value = pad(calState.selectedHour);
    if (el.timeModalMinute) el.timeModalMinute.value = pad(calState.selectedMinute);

    renderCalendarGrid();
    updateModalPreviewText();

    if (el.modalDatetime) el.modalDatetime.style.display = 'flex';
  }

  function closeDatetimeModal() {
    if (el.modalDatetime) el.modalDatetime.style.display = 'none';
  }

  function confirmDatetimeModal() {
    const d = new Date(calState.selectedYear, calState.selectedMonth, calState.selectedDay, calState.selectedHour, calState.selectedMinute);
    const now = new Date();
    // 過去の場合は警告 (即時モードではないため)
    if (d < new Date(now.getTime() - 60000)) {
      if (!confirm('過去の日時が選択されています。未来の日時を指定するか、即時送信を選択してください。このまま設定しますか？')) {
        return;
      }
    }

    el.inputDate.value = `${calState.selectedYear}-${pad(calState.selectedMonth + 1)}-${pad(calState.selectedDay)}`;
    el.inputTime.value = `${pad(calState.selectedHour)}:${pad(calState.selectedMinute)}`;

    closeDatetimeModal();
    updateTimingDisplay();
    showToast('送信日時を設定しました');
  }

  function updateTimingDisplay() {
    const isImmediate = state.timingMode === 'immediate';

    el.scheduledSection.style.display = isImmediate ? 'none' : 'block';
    el.immediateCard.style.display = isImmediate ? 'flex' : 'none';
    el.recurrenceSection.style.display = isImmediate ? 'none' : 'block';

    if (isImmediate) {
      el.scheduleSummaryText.textContent = '即時送信: Bot登録後すぐに指定チャンネルへ送信されます';
      if (el.pvTime) el.pvTime.textContent = '今すぐ送信';
      return;
    }

    const dateVal = el.inputDate.value;
    const timeVal = el.inputTime.value;
    if (!dateVal || !timeVal) {
      if (el.dtDisplayText) el.dtDisplayText.textContent = '日時を設定してください';
      el.scheduleSummaryText.textContent = '日付と時刻を指定してください';
      return;
    }

    const targetDate = new Date(`${dateVal}T${timeVal}:00`);
    const weekdaysJp = ['日', '月', '火', '水', '木', '金', '土'];
    const dateFormatted = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日(${weekdaysJp[targetDate.getDay()]}) ${timeVal}`;

    if (el.dtDisplayText) {
      el.dtDisplayText.textContent = dateFormatted;
    }

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
    if (el.channelSearch) {
      el.channelSearch.addEventListener('input', () => {
        if (el.btnClearSearch) {
          el.btnClearSearch.style.display = el.channelSearch.value ? 'block' : 'none';
        }
        renderChannelsList();
      });
    }

    if (el.btnClearSearch) {
      el.btnClearSearch.addEventListener('click', () => {
        if (el.channelSearch) el.channelSearch.value = '';
        el.btnClearSearch.style.display = 'none';
        renderChannelsList();
      });
    }

    // チャンネル一括操作 (全選択 / 選択解除 / 全カテゴリ開閉)
    if (el.btnSelectAllChannels) {
      el.btnSelectAllChannels.addEventListener('click', () => {
        state.channels.forEach((c) => { c.selected = true; });
        renderChannelsList();
        renderSelectedChips();
        showToast(`全 ${state.channels.length} チャンネルを選択しました`);
      });
    }

    if (el.btnClearAllChannels) {
      el.btnClearAllChannels.addEventListener('click', () => {
        state.channels.forEach((c) => { c.selected = false; });
        renderChannelsList();
        renderSelectedChips();
      });
    }

    if (el.btnToggleAllCats) {
      el.btnToggleAllCats.addEventListener('click', () => {
        state.allCategoriesCollapsed = !state.allCategoriesCollapsed;
        if (state.allCategoriesCollapsed) {
          state.channels.forEach((c) => state.collapsedCategories.add(c.category || '未分類'));
        } else {
          state.collapsedCategories.clear();
        }
        renderChannelsList();
      });
    }

    // channels.json ファイル読込トリガー
    if (el.btnImportChannelsTrigger && el.inputChannelsFile) {
      el.btnImportChannelsTrigger.addEventListener('click', () => {
        el.inputChannelsFile.click();
      });
      el.inputChannelsFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          loadChannelsFromFile(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    // チャンネルID手動追加フォームの開閉 & 適用
    if (el.btnToggleCustomChannel && el.customChannelWrap) {
      el.btnToggleCustomChannel.addEventListener('click', () => {
        const isHidden = el.customChannelWrap.style.display === 'none';
        el.customChannelWrap.style.display = isHidden ? 'block' : 'none';
        if (isHidden && el.inputCustomChannelId) {
          el.inputCustomChannelId.focus();
        }
      });
    }

    if (el.btnCancelCustomChannel && el.customChannelWrap) {
      el.btnCancelCustomChannel.addEventListener('click', () => {
        el.customChannelWrap.style.display = 'none';
        if (el.inputCustomChannelId) el.inputCustomChannelId.value = '';
      });
    }

    function handleApplyCustomChannel() {
      if (!el.inputCustomChannelId) return;
      const rawVal = el.inputCustomChannelId.value.trim();
      if (!rawVal) return;

      // カンマ・空白・改行区切りで複数IDを一括追加可能
      const ids = rawVal.split(/[\s,、\n]+/)
        .map((s) => s.replace(/[^0-9]/g, ''))
        .filter((s) => s.length >= 15 && s.length <= 22);

      if (!ids.length) {
        alert('有効なDiscordチャンネルID (17〜20桁程度の数字) を入力してください。');
        return;
      }

      let addedCount = 0;
      ids.forEach((cid) => {
        const existing = state.channels.find((c) => c.id === cid);
        if (existing) {
          existing.selected = true;
        } else {
          state.channels.unshift({
            id: cid,
            name: 'ch-' + cid.slice(-4),
            category: '手動指定',
            type: 'text',
            selected: true
          });
          addedCount++;
        }
      });

      el.inputCustomChannelId.value = '';
      el.customChannelWrap.style.display = 'none';
      renderChannelsList();
      renderSelectedChips();
      showToast(`${ids.length} 件のチャンネルを追加・選択しました`);
    }

    if (el.btnApplyCustomChannel) {
      el.btnApplyCustomChannel.addEventListener('click', handleApplyCustomChannel);
    }
    if (el.inputCustomChannelId) {
      el.inputCustomChannelId.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleApplyCustomChannel();
        }
      });
    }

    // 日時モーダル起動ボタン & オーバーレイ操作
    if (el.btnOpenDatetimeModal) {
      el.btnOpenDatetimeModal.addEventListener('click', openDatetimeModal);
      el.btnOpenDatetimeModal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDatetimeModal();
        }
      });
    }
    const triggerBtn = document.querySelector('.dt-trigger-btn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDatetimeModal();
      });
    }

    if (el.modalDatetime) {
      el.modalDatetime.addEventListener('click', (e) => {
        if (e.target === el.modalDatetime) closeDatetimeModal();
      });
    }
    if (el.btnDatetimeClose) {
      el.btnDatetimeClose.addEventListener('click', closeDatetimeModal);
    }
    if (el.btnDatetimeCancel) {
      el.btnDatetimeCancel.addEventListener('click', closeDatetimeModal);
    }
    if (el.btnDatetimeConfirm) {
      el.btnDatetimeConfirm.addEventListener('click', confirmDatetimeModal);
    }

    // カレンダー前月/次月ナビ
    if (el.btnCalPrev) {
      el.btnCalPrev.addEventListener('click', () => {
        calState.viewMonth--;
        if (calState.viewMonth < 0) {
          calState.viewMonth = 11;
          calState.viewYear--;
        }
        renderCalendarGrid();
      });
    }
    if (el.btnCalNext) {
      el.btnCalNext.addEventListener('click', () => {
        calState.viewMonth++;
        if (calState.viewMonth > 11) {
          calState.viewMonth = 0;
          calState.viewYear++;
        }
        renderCalendarGrid();
      });
    }

    // タイミングモード切替
    el.timingRadios.forEach((r) => {
      r.addEventListener('change', () => {
        state.timingMode = r.value;
        el.timingScheduledLabel.classList.toggle('active', r.value === 'scheduled');
        el.timingImmediateLabel.classList.toggle('active', r.value === 'immediate');
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

    el.weekdayChecks.forEach((c) => {
      c.addEventListener('change', updateTimingDisplay);
    });

    el.btnGotoStep2.addEventListener('click', () => {
      if (!state.channels.some((c) => c.selected)) {
        alert('送信先チャンネルを1つ以上選択してください。');
        return;
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

    // Preview Click to Focus Editor
    if (el.pvPlainWrap) {
      el.pvPlainWrap.style.cursor = 'pointer';
      el.pvPlainWrap.title = 'クリックして本文を編集';
      el.pvPlainWrap.addEventListener('click', () => {
        el.plainText.focus();
        el.plainText.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    if (el.pvEmbedTitleWrap) {
      el.pvEmbedTitleWrap.style.cursor = 'pointer';
      el.pvEmbedTitleWrap.title = 'クリックしてタイトルを編集';
      el.pvEmbedTitleWrap.addEventListener('click', () => {
        el.embedTitle.focus();
        el.embedTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    if (el.pvEmbedDesc) {
      el.pvEmbedDesc.style.cursor = 'pointer';
      el.pvEmbedDesc.title = 'クリックして説明文を編集';
      el.pvEmbedDesc.addEventListener('click', () => {
        el.embedDesc.focus();
        el.embedDesc.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    if (el.pvEmbedAuthor) {
      el.pvEmbedAuthor.style.cursor = 'pointer';
      el.pvEmbedAuthor.title = 'クリックして作成者を編集';
      el.pvEmbedAuthor.addEventListener('click', () => {
        el.embedAuthorName.focus();
        el.embedAuthorName.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    if (el.pvEmbedFooter) {
      el.pvEmbedFooter.style.cursor = 'pointer';
      el.pvEmbedFooter.title = 'クリックしてフッターを編集';
      el.pvEmbedFooter.addEventListener('click', () => {
        el.embedFooterText.focus();
        el.embedFooterText.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
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
        <div class="field-inputs-stacked">
          <div class="field-name-row">
            <input type="text" class="form-input field-name-input" placeholder="項目名 (例: 参加条件)" value="${escapeHtml(f.name)}">
            <label class="field-inline-toggle">
              <input type="checkbox" ${f.inline ? 'checked' : ''}>横並び
            </label>
            <button type="button" class="btn-del-row" title="削除">&times;</button>
          </div>
          <textarea class="form-input field-val-input" rows="2" placeholder="値 (改行・Markdown対応)">${escapeHtml(f.value)}</textarea>
        </div>
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

    if (el.btnSubmitApiFinal) {
      el.btnSubmitApiFinal.addEventListener('click', async () => {
        if (!activeSessionId) {
          alert('有効なセッションが見つかりません。Discordの /booking_message コマンドから開き直してください。');
          return;
        }

        // activeApiUrl の解決: URLクエリ -> localStorage -> ユーザー入力
        if (!activeApiUrl) {
          const savedApi = localStorage.getItem('booking_api_url');
          if (savedApi) {
            activeApiUrl = savedApi.replace(/\/+$/, '');
          } else {
            const inputUrl = prompt('BotのAPIサーバーURLを入力してください (例: https://your-domain.ts.net または http://localhost:8000):');
            if (inputUrl && inputUrl.trim()) {
              activeApiUrl = inputUrl.trim().replace(/\/+$/, '');
              localStorage.setItem('booking_api_url', activeApiUrl);
            } else {
              alert('APIサーバーのURLが未設定のため、Botへの登録を中断しました。');
              return;
            }
          }
        }

        try {
          const payload = buildFinalPayload();
          el.btnSubmitApiFinal.disabled = true;
          el.btnSubmitApiFinal.textContent = 'Botへ登録中...';
          if (el.apiSubmitStatus) el.apiSubmitStatus.style.display = 'none';

          const res = await fetch(`${activeApiUrl}/api/booking/session/${encodeURIComponent(activeSessionId)}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload })
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.message || data.error || `送信エラー (HTTP ${res.status})`);
          }

          el.btnSubmitApiFinal.textContent = '予約登録完了';
          el.btnSubmitApiFinal.className = 'btn btn-success btn-hero';

          if (el.apiSubmitStatus) {
            el.apiSubmitStatus.textContent = '予約が正常に完了しました。Discord側のメッセージが自動更新され、DMへ確定通知を送信しました。この画面は閉じて構いません。';
            el.apiSubmitStatus.style.display = 'block';
            el.apiSubmitStatus.className = 'api-submit-status success mt-2';
          }

          showToast('予約メッセージを正常に登録しました');
        } catch (err) {
          console.error('Submit API error:', err);
          el.btnSubmitApiFinal.disabled = false;
          el.btnSubmitApiFinal.textContent = '予約を確定してBotへ登録';
          if (el.apiSubmitStatus) {
            el.apiSubmitStatus.textContent = `送信エラー: ${err.message || '通信に失敗しました'}。APIサーバーの接続状態をご確認ください。`;
            el.apiSubmitStatus.style.display = 'block';
            el.apiSubmitStatus.className = 'api-submit-status error mt-2';
          }
          alert(`送信に失敗しました: ${err.message || '通信エラー'}`);
        }
      });
    }
  }

  // --- JSON File Import Modal ---
  function attachImportEvents() {
    el.btnImportOpen.addEventListener('click', () => {
      el.importError.style.display = 'none';
      el.importFile.value = '';
      el.modalImport.style.display = 'flex';
    });
    if (el.modalImport) {
      el.modalImport.addEventListener('click', (e) => {
        if (e.target === el.modalImport) el.modalImport.style.display = 'none';
      });
    }
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
    return Boolean(
      params.get('s') ||
      params.get('session') ||
      params.get('cid') ||
      params.get('cids') ||
      params.get('chs') ||
      params.get('gid')
    );
  }

  async function initBookingSession() {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('s') || params.get('session');
    if (!sid) return false;

    activeSessionId = sid;
    const apiParam = params.get('api');
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (apiParam) {
      activeApiUrl = apiParam.replace(/\/+$/, '');
      try { localStorage.setItem('booking_api_url', activeApiUrl); } catch (e) {}
    } else if (isLocalhost) {
      activeApiUrl = window.location.origin;
    } else {
      const savedApi = localStorage.getItem('booking_api_url');
      if (savedApi) {
        activeApiUrl = savedApi.replace(/\/+$/, '');
      }
    }

    // API URL が取得できない場合、fetchはスキップしURL展開済みのチャンネル情報で動作
    if (!activeApiUrl) {
      const banner = $('discord-sync-banner');
      if (banner && state.channels.length > 0) {
        banner.style.display = 'block';
        const textEl = banner.querySelector('.sync-banner-text');
        if (textEl) {
          textEl.textContent = `チャンネル連携完了: 全 ${state.channels.length} チャンネルを読み込みました。`;
        }
      }
      return false;
    }

    const banner = $('discord-sync-banner');
    if (banner) {
      banner.style.display = 'block';
      const textEl = banner.querySelector('.sync-banner-text');
      if (textEl) {
        textEl.textContent = 'FastAPI連携中: サーバーのチャンネル一覧を同期しています...';
      }
    }

    try {
      const res = await fetch(`${activeApiUrl}/api/booking/session/${encodeURIComponent(sid)}`);
      if (!res.ok) {
        throw new Error(`セッション取得失敗 (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (Array.isArray(data.channels) && data.channels.length > 0) {
        const defaultCid = data.defaultChannelId || params.get('cid');
        state.channels = data.channels.map((c) => ({
          id: String(c.id),
          name: String(c.name || 'channel'),
          category: String(c.category || '未分類'),
          type: c.type === 'voice' ? 'voice' : 'text',
          selected: defaultCid ? String(c.id) === String(defaultCid) : false
        }));

        if (!state.channels.some((c) => c.selected) && state.channels.length > 0) {
          state.channels[0].selected = true;
        }

        renderChannelsList();
        renderSelectedChips();

        if (banner) {
          const textEl = banner.querySelector('.sync-banner-text');
          if (textEl) {
            textEl.textContent = `FastAPI連携中: 全 ${state.channels.length} チャンネルを完全同期しました。Web上で決定するとBotへ自動登録されます。`;
          }
        }
        return true;
      }
    } catch (e) {
      console.warn('FastAPI session fetch failed, falling back to URL params:', e);
      if (banner) {
        const textEl = banner.querySelector('.sync-banner-text');
        if (textEl) {
          textEl.textContent = 'チャンネル連携完了: URLパラメータからチャンネルを読み込みました。';
        }
      }
    }
    return false;
  }

  function fallbackDefaultChannel() {
    const params = new URLSearchParams(window.location.search);
    const defaultCid = params.get('cid') || 'default';
    const defaultCname = params.get('cname') || '一般';
    state.channels = [{
      id: String(defaultCid),
      name: defaultCname,
      category: 'テキストチャンネル',
      type: 'text',
      selected: true
    }];
    try {
      renderChannelsList();
      renderSelectedChips();
    } catch (e) {
      console.error('fallback render error:', e);
    }
  }

  // --- Initializer (Robust & Defensive) ---
  function init() {
    try {
      initTheme();
    } catch (e) {
      console.warn('initTheme error:', e);
    }

    if (!checkHasBotSession()) {
      if (el.appMainContent) el.appMainContent.style.display = 'none';
      if (el.noSessionView) el.noSessionView.style.display = 'flex';
      if (el.headerSessionActions) el.headerSessionActions.style.display = 'none';
      return;
    }

    if (el.appMainContent) el.appMainContent.style.display = 'block';
    if (el.noSessionView) el.noSessionView.style.display = 'none';
    if (el.headerSessionActions) el.headerSessionActions.style.display = 'flex';

    // チャンネル解析 (URLパラメータパースおよびFastAPIセッション自動同期)
    try {
      parseChannelsFromUrl();
      initBookingSession();
    } catch (e) {
      console.error('Channel initialization failed, falling back:', e);
      fallbackDefaultChannel();
    }

    // 日時初期値 (独立保護)
    try {
      initTimingDefaults();
    } catch (e) {
      console.error('initTimingDefaults error:', e);
    }

    // イベントリスナー登録 (独立保護)
    try { attachStep1Events(); } catch (e) { console.error('attachStep1Events error:', e); }
    try { attachStep2Events(); } catch (e) { console.error('attachStep2Events error:', e); }
    try { attachStep3Events(); } catch (e) { console.error('attachStep3Events error:', e); }
    try { attachImportEvents(); } catch (e) { console.error('attachImportEvents error:', e); }

    try {
      goToStep(1);
    } catch (e) {
      console.error('goToStep error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
