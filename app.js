/**
 * Discord Message Scheduler - Web App JavaScript
 * Real-time Discord Preview, Datetime validation, Recurrence, and RSV1 Code Generator/Decoder
 */

(() => {
  'use strict';

  // --- State ---
  const state = {
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
    }
  };

  // --- DOM Elements ---
  const el = {
    // Header
    targetChannelBadge: document.getElementById('target-channel-badge'),
    targetChannelName: document.getElementById('target-channel-name'),
    targetChannelId: document.getElementById('target-channel-id'),
    btnOpenImport: document.getElementById('btn-open-import'),
    btnReset: document.getElementById('btn-reset'),

    // Mobile tabs
    tabEdit: document.getElementById('tab-edit'),
    tabPreview: document.getElementById('tab-preview'),
    editorPane: document.getElementById('editor-container'),
    previewPane: document.getElementById('preview-container'),

    // Datetime & recurrence
    inputDate: document.getElementById('input-date'),
    inputTime: document.getElementById('input-time'),
    datetimeWarning: document.getElementById('datetime-warning'),
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
    embedFooterText: document.getElementById('embed-footer-text'),
    embedFooterIcon: document.getElementById('embed-footer-icon'),
    fieldsList: document.getElementById('fields-list'),
    btnAddField: document.getElementById('btn-add-field'),

    // Plain fields
    plainContent: document.getElementById('plain-content'),
    plainImage: document.getElementById('plain-image'),

    // Action button
    btnCopyCode: document.getElementById('btn-copy-code'),

    // Preview
    previewChannelLabel: document.getElementById('preview-channel-label'),
    previewTimestamp: document.getElementById('preview-timestamp'),
    previewRecurrenceBadge: document.getElementById('preview-recurrence-badge'),
    previewPlainText: document.getElementById('preview-plain-text'),
    previewPlainImageWrap: document.getElementById('preview-plain-image-wrap'),
    previewPlainImage: document.getElementById('preview-plain-image'),
    previewEmbedCard: document.getElementById('preview-embed-card'),
    previewEmbedPill: document.getElementById('preview-embed-pill'),
    previewEmbedAuthor: document.getElementById('preview-embed-author'),
    previewEmbedAuthorIcon: document.getElementById('preview-embed-author-icon'),
    previewEmbedAuthorLink: document.getElementById('preview-embed-author-link'),
    previewEmbedTitleWrap: document.getElementById('preview-embed-title-wrap'),
    previewEmbedTitleLink: document.getElementById('preview-embed-title-link'),
    previewEmbedTitleText: document.getElementById('preview-embed-title-text'),
    previewEmbedDesc: document.getElementById('preview-embed-desc'),
    previewEmbedFields: document.getElementById('preview-embed-fields'),
    previewEmbedThumbWrap: document.getElementById('preview-embed-thumb-wrap'),
    previewEmbedThumb: document.getElementById('preview-embed-thumb'),
    previewEmbedImageWrap: document.getElementById('preview-embed-image-wrap'),
    previewEmbedImage: document.getElementById('preview-embed-image'),
    previewEmbedFooter: document.getElementById('preview-embed-footer'),
    previewEmbedFooterIcon: document.getElementById('preview-embed-footer-icon'),
    previewEmbedFooterText: document.getElementById('preview-embed-footer-text'),
    previewEmbedFooterTime: document.getElementById('preview-embed-footer-time'),
    summaryNextTime: document.getElementById('summary-next-time'),
    summaryRecurrence: document.getElementById('summary-recurrence'),
    summaryType: document.getElementById('summary-type'),

    // Modal
    importModal: document.getElementById('import-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalApplyBtn: document.getElementById('modal-apply-btn'),
    importCodeInput: document.getElementById('import-code-input'),
    importErrorMsg: document.getElementById('import-error-msg'),

    // Toast
    toast: document.getElementById('toast'),
    toastText: document.getElementById('toast-text')
  };

  // --- Utilities ---
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Safe Discord-flavored markdown renderer
   */
  function renderMarkdown(rawText) {
    if (!rawText) return '';
    let text = escapeHtml(rawText);

    // Stash code blocks and inline code to prevent style collisions
    const stash = [];
    text = text.replace(/```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g, (match, p1) => {
      const idx = stash.length;
      stash.push(`<pre class="md-code-block"><code>${p1}</code></pre>`);
      return `__MD_BLOCK_${idx}__`;
    });

    text = text.replace(/`([^`\n]+)`/g, (match, p1) => {
      const idx = stash.length;
      stash.push(`<span class="md-code">${p1}</span>`);
      return `__MD_INLINE_${idx}__`;
    });

    // Spoilers ||spoiler||
    text = text.replace(/\|\|([\s\S]+?)\|\|/g, '<span class="md-spoiler" title="クリックで表示" onclick="this.classList.toggle(\'revealed\')">$1</span>');

    // Bold + Italic ***text*** or ___text___
    text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<span class="md-bold md-italic">$1</span>');
    text = text.replace(/___([^_]+)___/g, '<span class="md-bold md-italic">$1</span>');

    // Bold **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<span class="md-bold">$1</span>');

    // Underline __text__
    text = text.replace(/__([^_]+)__/g, '<span class="md-underline">$1</span>');

    // Italic *text* or _text_
    text = text.replace(/\*([^*]+)\*/g, '<span class="md-italic">$1</span>');
    text = text.replace(/(^|[^a-zA-Z0-9_])_([^_]+)_(?![a-zA-Z0-9_])/g, '$1<span class="md-italic">$2</span>');

    // Strikethrough ~~text~~
    text = text.replace(/~~([^~]+)~~/g, '<span class="md-strike">$1</span>');

    // Quotes > line
    text = text.replace(/^(&gt;|\>)\s?(.*)$/gm, '<div class="md-quote">$2</div>');

    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks outside code blocks
    text = text.replace(/\n/g, '<br>');

    // Restore stashed code blocks & inline code
    stash.forEach((content, idx) => {
      text = text.replace(`__MD_BLOCK_${idx}__`, content);
      text = text.replace(`__MD_INLINE_${idx}__`, content);
    });

    return text;
  }

  function formatDisplayDate(dateStr, timeStr) {
    if (!dateStr || !timeStr) return '-';
    try {
      const dt = new Date(`${dateStr}T${timeStr}`);
      if (isNaN(dt.getTime())) return `${dateStr} ${timeStr}`;
      const now = new Date();
      const isToday = dt.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = dt.toDateString() === tomorrow.toDateString();

      const timeFormatted = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      if (isToday) {
        return `今日 ${timeFormatted}`;
      } else if (isTomorrow) {
        return `明日 ${timeFormatted}`;
      } else {
        const month = dt.getMonth() + 1;
        const date = dt.getDate();
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const dayName = days[dt.getDay()];
        return `${month}/${date}(${dayName}) ${timeFormatted}`;
      }
    } catch {
      return `${dateStr} ${timeStr}`;
    }
  }

  function showToast(message, isError = false) {
    el.toastText.textContent = message;
    if (isError) {
      el.toast.classList.add('toast-error');
      el.toast.style.borderColor = 'var(--brand-red)';
    } else {
      el.toast.classList.remove('toast-error');
      el.toast.style.borderColor = 'var(--brand-green)';
    }
    el.toast.style.display = 'flex';
    clearTimeout(el.toast._timer);
    el.toast._timer = setTimeout(() => {
      el.toast.style.display = 'none';
    }, 3000);
  }

  // --- Initializer & Presets ---
  function initDefaults() {
    // Default scheduled time: next nearest hour + 1
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    state.date = `${year}-${month}-${day}`;
    state.time = `${hours}:${minutes}`;

    el.inputDate.value = state.date;
    el.inputTime.value = state.time;

    // Start clean with empty fields
    state.embed.title = '';
    state.embed.title_url = '';
    state.embed.description = '';
    state.embed.color = '#5865F2';
    state.embed.fields = [];
    state.embed.author = { name: '', icon_url: '', url: '' };
    state.embed.thumbnail_url = '';
    state.embed.image_url = '';
    state.embed.footer = { text: '', icon_url: '' };

    state.plain.content = '';
    state.plain.image_url = '';

    // Parse URL params (?cid=...&cname=...&gid=...&code=...)
    parseUrlParams();

    // Populate form
    syncStateToForm();
    updatePreview();
  }

  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get('cid');
    const cname = params.get('cname');
    const gid = params.get('gid');
    const code = params.get('code');

    if (cid) {
      state.targetChannel.id = cid;
      state.targetChannel.name = cname || 'channel';
      state.targetChannel.guildId = gid || '';

      el.targetChannelBadge.style.display = 'flex';
      el.targetChannelName.textContent = state.targetChannel.name;
      el.targetChannelId.textContent = state.targetChannel.id;
      el.previewChannelLabel.textContent = state.targetChannel.name;
    }

    if (code) {
      try {
        applyCodeData(code);
      } catch (err) {
        console.warn('Failed to parse code from URL:', err);
      }
    }
  }

  function applyPreset(preset) {
    const now = new Date();
    let target = new Date(now);

    switch (preset) {
      case '1h':
        target = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case '3h':
        target = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        break;
      case 'today-evening':
        target.setHours(20, 0, 0, 0);
        if (target <= now) {
          target.setDate(target.getDate() + 1);
        }
        break;
      case 'tomorrow-morning':
        target.setDate(target.getDate() + 1);
        target.setHours(9, 0, 0, 0);
        break;
      case 'tomorrow-evening':
        target.setDate(target.getDate() + 1);
        target.setHours(20, 0, 0, 0);
        break;
      case 'weekend':
        // Next Saturday 12:00
        const day = target.getDay();
        const diff = (6 - day + 7) % 7 || 7;
        target.setDate(target.getDate() + diff);
        target.setHours(12, 0, 0, 0);
        break;
    }

    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    const hh = String(target.getHours()).padStart(2, '0');
    const mm = String(target.getMinutes()).padStart(2, '0');

    state.date = `${y}-${m}-${d}`;
    state.time = `${hh}:${mm}`;

    el.inputDate.value = state.date;
    el.inputTime.value = state.time;

    validateDatetime();
    updatePreview();
  }

  function validateDatetime() {
    if (!state.date || !state.time) return true;
    try {
      const scheduled = new Date(`${state.date}T${state.time}`);
      const now = new Date();
      const isPast = scheduled.getTime() < now.getTime() - 60000;
      el.datetimeWarning.style.display = isPast ? 'block' : 'none';
      return !isPast;
    } catch {
      return false;
    }
  }

  // --- Form <-> State Synchronization ---
  function syncStateToForm() {
    el.inputDate.value = state.date;
    el.inputTime.value = state.time;
    el.recurrenceType.value = state.recurrence.type;

    el.weeklyDaysContainer.style.display = state.recurrence.type === 'weekly' ? 'block' : 'none';
    el.weekdayCheckboxes.forEach(cb => {
      cb.checked = state.recurrence.days.includes(parseInt(cb.value, 10));
    });

    // Message type
    document.querySelector(`input[name="message-type"][value="${state.messageType}"]`).checked = true;
    toggleMessageType(state.messageType);

    // Embed inputs
    el.embedColorPicker.value = state.embed.color || '#5865F2';
    el.embedColorHex.value = state.embed.color || '#5865F2';
    el.embedAuthorName.value = state.embed.author.name || '';
    el.embedAuthorIcon.value = state.embed.author.icon_url || '';
    el.embedAuthorUrl.value = state.embed.author.url || '';
    el.embedTitle.value = state.embed.title || '';
    el.embedTitleUrl.value = state.embed.title_url || '';
    el.embedDesc.value = state.embed.description || '';
    el.embedThumbnail.value = state.embed.thumbnail_url || '';
    el.embedImage.value = state.embed.image_url || '';
    el.embedFooterText.value = state.embed.footer.text || '';
    el.embedFooterIcon.value = state.embed.footer.icon_url || '';

    // Plain inputs
    el.plainContent.value = state.plain.content || '';
    el.plainImage.value = state.plain.image_url || '';

    // Render field items
    renderFieldsList();
  }

  function toggleMessageType(type) {
    state.messageType = type;
    if (type === 'embed') {
      el.embedSettingsSection.style.display = 'block';
      el.plainSettingsSection.style.display = 'none';
    } else {
      el.embedSettingsSection.style.display = 'none';
      el.plainSettingsSection.style.display = 'block';
    }
    updatePreview();
  }

  function renderFieldsList() {
    el.fieldsList.innerHTML = '';
    state.embed.fields.forEach((field, index) => {
      const item = document.createElement('div');
      item.className = 'field-item';
      item.dataset.index = index;

      item.innerHTML = `
        <div class="field-item-top">
          <input type="text" class="form-input field-name-input" placeholder="フィールド名" value="${escapeHtml(field.name)}" maxlength="256">
          <label class="field-inline-toggle">
            <input type="checkbox" class="field-inline-chk" ${field.inline ? 'checked' : ''}>
            <span>横並び</span>
          </label>
          <button type="button" class="field-delete-btn" title="削除">削除</button>
        </div>
        <textarea class="form-textarea field-value-input" rows="2" placeholder="値 (Markdown対応)" maxlength="1024">${escapeHtml(field.value)}</textarea>
      `;

      // Event listeners for field
      const nameInput = item.querySelector('.field-name-input');
      const valInput = item.querySelector('.field-value-input');
      const inlineChk = item.querySelector('.field-inline-chk');
      const delBtn = item.querySelector('.field-delete-btn');

      nameInput.addEventListener('input', e => {
        state.embed.fields[index].name = e.target.value;
        updatePreview();
      });

      valInput.addEventListener('input', e => {
        state.embed.fields[index].value = e.target.value;
        updatePreview();
      });

      inlineChk.addEventListener('change', e => {
        state.embed.fields[index].inline = e.target.checked;
        updatePreview();
      });

      delBtn.addEventListener('click', () => {
        state.embed.fields.splice(index, 1);
        renderFieldsList();
        updatePreview();
      });

      el.fieldsList.appendChild(item);
    });
  }

  // --- Real-time Discord Preview Update ---
  function updatePreview() {
    validateDatetime();

    // 1. Timestamp & Recurrence
    const displayTimestamp = formatDisplayDate(state.date, state.time);
    el.previewTimestamp.textContent = displayTimestamp;
    el.previewEmbedFooterTime.textContent = displayTimestamp;
    el.summaryNextTime.textContent = displayTimestamp;

    // Recurrence label
    let recLabel = '1回のみ';
    switch (state.recurrence.type) {
      case 'daily':
        recLabel = '毎日';
        break;
      case 'weekly':
        const dayNames = ['月', '火', '水', '木', '金', '土', '日'];
        const selected = (state.recurrence.days || []).map(d => dayNames[d]).join(', ');
        recLabel = selected ? `毎週(${selected})` : '毎週';
        break;
      case 'weekdays':
        recLabel = '平日(月〜金)';
        break;
      case 'monthly':
        recLabel = '毎月';
        break;
    }
    el.previewRecurrenceBadge.textContent = recLabel;
    el.summaryRecurrence.textContent = recLabel;
    el.summaryType.textContent = state.messageType === 'embed' ? 'Embed' : '通常';

    // 2. Message Type Switch
    if (state.messageType === 'plain') {
      el.previewEmbedCard.style.display = 'none';

      // Plain content
      if (state.plain.content.trim()) {
        el.previewPlainText.innerHTML = renderMarkdown(state.plain.content);
        el.previewPlainText.style.display = 'block';
      } else {
        el.previewPlainText.innerHTML = '<span style="color:var(--text-muted);font-style:italic;">(本文が未入力です)</span>';
        el.previewPlainText.style.display = 'block';
      }

      // Plain image
      if (state.plain.image_url.trim()) {
        el.previewPlainImage.src = state.plain.image_url.trim();
        el.previewPlainImageWrap.style.display = 'block';
      } else {
        el.previewPlainImageWrap.style.display = 'none';
      }

    } else {
      // Embed mode
      el.previewPlainText.style.display = 'none';
      el.previewPlainImageWrap.style.display = 'none';
      el.previewEmbedCard.style.display = 'grid';

      // Color pill
      const color = state.embed.color || '#5865F2';
      el.previewEmbedPill.style.backgroundColor = color;

      // Author
      if (state.embed.author.name.trim()) {
        el.previewEmbedAuthor.style.display = 'flex';
        el.previewEmbedAuthorLink.textContent = state.embed.author.name;
        if (state.embed.author.url.trim()) {
          el.previewEmbedAuthorLink.href = state.embed.author.url.trim();
        } else {
          el.previewEmbedAuthorLink.removeAttribute('href');
        }

        if (state.embed.author.icon_url.trim()) {
          el.previewEmbedAuthorIcon.src = state.embed.author.icon_url.trim();
          el.previewEmbedAuthorIcon.style.display = 'block';
        } else {
          el.previewEmbedAuthorIcon.style.display = 'none';
        }
      } else {
        el.previewEmbedAuthor.style.display = 'none';
      }

      // Title
      if (state.embed.title.trim()) {
        el.previewEmbedTitleWrap.style.display = 'block';
        if (state.embed.title_url.trim()) {
          el.previewEmbedTitleLink.href = state.embed.title_url.trim();
          el.previewEmbedTitleLink.textContent = state.embed.title;
          el.previewEmbedTitleLink.style.display = 'inline';
          el.previewEmbedTitleText.style.display = 'none';
        } else {
          el.previewEmbedTitleText.textContent = state.embed.title;
          el.previewEmbedTitleText.style.display = 'inline';
          el.previewEmbedTitleLink.style.display = 'none';
        }
      } else {
        el.previewEmbedTitleWrap.style.display = 'none';
      }

      // Description
      if (state.embed.description.trim()) {
        el.previewEmbedDesc.innerHTML = renderMarkdown(state.embed.description);
        el.previewEmbedDesc.style.display = 'block';
      } else {
        el.previewEmbedDesc.style.display = 'none';
      }

      // Fields
      const validFields = state.embed.fields.filter(f => f.name.trim() || f.value.trim());
      if (validFields.length > 0) {
        el.previewEmbedFields.innerHTML = '';
        validFields.forEach(f => {
          const fEl = document.createElement('div');
          fEl.className = 'embed-field' + (f.inline ? '' : ' col-span-full');
          fEl.innerHTML = `
            <div class="embed-field-name">${escapeHtml(f.name || '\u200b')}</div>
            <div class="embed-field-value">${renderMarkdown(f.value || '\u200b')}</div>
          `;
          el.previewEmbedFields.appendChild(fEl);
        });
        el.previewEmbedFields.style.display = 'grid';
      } else {
        el.previewEmbedFields.style.display = 'none';
      }

      // Thumbnail
      if (state.embed.thumbnail_url.trim()) {
        el.previewEmbedThumb.src = state.embed.thumbnail_url.trim();
        el.previewEmbedThumbWrap.style.display = 'block';
      } else {
        el.previewEmbedThumbWrap.style.display = 'none';
      }

      // Large Image
      if (state.embed.image_url.trim()) {
        el.previewEmbedImage.src = state.embed.image_url.trim();
        el.previewEmbedImageWrap.style.display = 'block';
      } else {
        el.previewEmbedImageWrap.style.display = 'none';
      }

      // Footer
      if (state.embed.footer.text.trim()) {
        el.previewEmbedFooter.style.display = 'flex';
        el.previewEmbedFooterText.textContent = state.embed.footer.text;
        if (state.embed.footer.icon_url.trim()) {
          el.previewEmbedFooterIcon.src = state.embed.footer.icon_url.trim();
          el.previewEmbedFooterIcon.style.display = 'block';
        } else {
          el.previewEmbedFooterIcon.style.display = 'none';
        }
      } else {
        el.previewEmbedFooter.style.display = 'none';
      }

      // Empty state indicator
      const hasContent = Boolean(
        state.embed.title.trim() ||
        state.embed.description.trim() ||
        state.embed.image_url.trim() ||
        state.embed.thumbnail_url.trim() ||
        state.embed.author.name.trim() ||
        state.embed.footer.text.trim() ||
        state.embed.fields.some(f => f.name.trim() || f.value.trim())
      );

      let emptyHint = document.getElementById('preview-empty-hint');
      if (!emptyHint) {
        emptyHint = document.createElement('div');
        emptyHint.id = 'preview-empty-hint';
        emptyHint.className = 'preview-empty-hint';
        emptyHint.textContent = 'タイトルまたは説明文を入力してください';
        const gridContent = el.previewEmbedCard.querySelector('.embed-grid-content');
        if (gridContent) gridContent.appendChild(emptyHint);
      }
      if (emptyHint) {
        emptyHint.style.display = hasContent ? 'none' : 'block';
      }
    }
  }

  // --- Reservation Code Generation & Compression ---
  function buildPayload() {
    const payload = {
      v: 1,
      type: state.messageType,
      datetime: `${state.date}T${state.time}`,
      recurrence: {
        type: state.recurrence.type,
        days: state.recurrence.type === 'weekly' ? state.recurrence.days : []
      }
    };

    if (state.targetChannel.id) {
      payload.channel_id = state.targetChannel.id;
    }

    if (state.messageType === 'plain') {
      payload.content = {
        text: state.plain.content,
        image_url: state.plain.image_url || undefined
      };
    } else {
      // Hex color to integer
      let colorInt = 0x5865F2;
      try {
        colorInt = parseInt(state.embed.color.replace('#', ''), 16) || 0x5865F2;
      } catch {}

      payload.content = {
        title: state.embed.title || undefined,
        title_url: state.embed.title_url || undefined,
        description: state.embed.description || undefined,
        color: colorInt,
        author: (state.embed.author.name) ? {
          name: state.embed.author.name,
          icon_url: state.embed.author.icon_url || undefined,
          url: state.embed.author.url || undefined
        } : undefined,
        thumbnail_url: state.embed.thumbnail_url || undefined,
        image_url: state.embed.image_url || undefined,
        footer: (state.embed.footer.text) ? {
          text: state.embed.footer.text,
          icon_url: state.embed.footer.icon_url || undefined
        } : undefined,
        fields: state.embed.fields.length > 0 ? state.embed.fields.filter(f => f.name.trim() || f.value.trim()).map(f => ({
          name: f.name || '\u200b',
          value: f.value || '\u200b',
          inline: Boolean(f.inline)
        })) : undefined
      };
    }

    return payload;
  }

  function encodeReservationCode(payload) {
    const jsonStr = JSON.stringify(payload);

    // If pako (zlib) is available, use zlib compress
    if (window.pako && typeof window.pako.deflate === 'function') {
      try {
        const utf8Bytes = new TextEncoder().encode(jsonStr);
        const compressed = window.pako.deflate(utf8Bytes);
        let binary = '';
        const len = compressed.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(compressed[i]);
        }
        return 'RSV1_' + btoa(binary);
      } catch (err) {
        console.warn('pako compression error, falling back to base64:', err);
      }
    }

    // Fallback: standard UTF-8 Base64
    const utf8B64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return 'RSV1_' + utf8B64;
  }

  function decodeReservationCode(codeStr) {
    if (!codeStr || typeof codeStr !== 'string') {
      throw new Error('コードが空です');
    }

    let cleaned = codeStr.trim().replace(/^`+|`+$/g, '').trim();
    if (cleaned.includes('code=')) {
      try {
        const url = new URL(cleaned);
        const codeParam = url.searchParams.get('code');
        if (codeParam) cleaned = codeParam.trim().replace(/^`+|`+$/g, '').trim();
      } catch {
        const m = cleaned.match(/[?&]code=([^&\s]+)/);
        if (m) cleaned = decodeURIComponent(m[1]).trim().replace(/^`+|`+$/g, '').trim();
      }
    }

    if (cleaned.startsWith('RSV1_')) {
      cleaned = cleaned.slice(5);
    } else if (cleaned.startsWith('RSV_')) {
      cleaned = cleaned.slice(4);
    }

    // Try zlib inflate
    if (window.pako && typeof window.pako.inflate === 'function') {
      try {
        const binary = atob(cleaned);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const decompressed = window.pako.inflate(bytes);
        const jsonStr = new TextDecoder('utf-8').decode(decompressed);
        return JSON.parse(jsonStr);
      } catch (err) {
        // Fallback to uncompressed Base64
      }
    }

    // Try standard Base64 (TextDecoder first, then decodeURIComponent fallback)
    try {
      const binary = atob(cleaned);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoded = new TextDecoder('utf-8').decode(bytes);
      return JSON.parse(decoded);
    } catch {
      try {
        const decoded = decodeURIComponent(escape(atob(cleaned)));
        return JSON.parse(decoded);
      } catch {}
    }

    // Try direct JSON
    try {
      return JSON.parse(cleaned);
    } catch {
      throw new Error('予約コードの形式が不正です。');
    }
  }

  function applyCodeData(codeStr) {
    const data = decodeReservationCode(codeStr);
    if (!data || typeof data !== 'object') {
      throw new Error('データが不正です');
    }

    // Datetime
    if (data.datetime) {
      const parts = data.datetime.split('T');
      if (parts.length === 2) {
        state.date = parts[0];
        state.time = parts[1].slice(0, 5);
      }
    }

    // Recurrence
    if (data.recurrence) {
      state.recurrence.type = data.recurrence.type || 'none';
      state.recurrence.days = Array.isArray(data.recurrence.days) ? data.recurrence.days : [];
    }

    // Target channel
    if (data.channel_id) {
      state.targetChannel.id = data.channel_id;
    }

    // Message Type
    state.messageType = data.type === 'plain' ? 'plain' : 'embed';

    if (state.messageType === 'plain') {
      state.plain.content = data.content?.text || '';
      state.plain.image_url = data.content?.image_url || '';
    } else {
      const c = data.content || {};
      if (c.color !== undefined) {
        const hex = typeof c.color === 'number'
          ? '#' + c.color.toString(16).padStart(6, '0')
          : String(c.color);
        state.embed.color = hex;
      }
      state.embed.title = c.title || '';
      state.embed.title_url = c.title_url || '';
      state.embed.description = c.description || '';
      state.embed.thumbnail_url = c.thumbnail_url || '';
      state.embed.image_url = c.image_url || '';

      if (c.author) {
        state.embed.author.name = c.author.name || '';
        state.embed.author.icon_url = c.author.icon_url || '';
        state.embed.author.url = c.author.url || '';
      } else {
        state.embed.author = { name: '', icon_url: '', url: '' };
      }

      if (c.footer) {
        state.embed.footer.text = c.footer.text || '';
        state.embed.footer.icon_url = c.footer.icon_url || '';
      } else {
        state.embed.footer = { text: '', icon_url: '' };
      }

      state.embed.fields = Array.isArray(c.fields) ? c.fields.map(f => ({
        name: f.name || '',
        value: f.value || '',
        inline: Boolean(f.inline)
      })) : [];
    }

    syncStateToForm();
    updatePreview();
  }

  // --- Attach Event Listeners ---
  function setupEvents() {
    // Presets
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyPreset(btn.dataset.preset);
      });
    });

    // Date / Time change
    el.inputDate.addEventListener('change', e => {
      state.date = e.target.value;
      updatePreview();
    });
    el.inputTime.addEventListener('change', e => {
      state.time = e.target.value;
      updatePreview();
    });

    // Recurrence
    el.recurrenceType.addEventListener('change', e => {
      state.recurrence.type = e.target.value;
      el.weeklyDaysContainer.style.display = state.recurrence.type === 'weekly' ? 'block' : 'none';
      updatePreview();
    });

    el.weekdayCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = [];
        el.weekdayCheckboxes.forEach(box => {
          if (box.checked) checked.push(parseInt(box.value, 10));
        });
        state.recurrence.days = checked;
        updatePreview();
      });
    });

    // Message Type radio
    el.messageTypeInputs.forEach(radio => {
      radio.addEventListener('change', e => {
        if (e.target.checked) {
          toggleMessageType(e.target.value);
        }
      });
    });

    // Embed Color
    el.embedColorPicker.addEventListener('input', e => {
      state.embed.color = e.target.value;
      el.embedColorHex.value = e.target.value.toUpperCase();
      updatePreview();
    });
    el.embedColorHex.addEventListener('input', e => {
      let val = e.target.value;
      if (!val.startsWith('#') && val.length > 0) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        state.embed.color = val;
        el.embedColorPicker.value = val;
        updatePreview();
      }
    });

    document.querySelectorAll('.color-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const c = chip.dataset.color;
        state.embed.color = c;
        el.embedColorPicker.value = c;
        el.embedColorHex.value = c;
        updatePreview();
      });
    });

    // Embed Author
    el.embedAuthorName.addEventListener('input', e => {
      state.embed.author.name = e.target.value;
      updatePreview();
    });
    el.embedAuthorIcon.addEventListener('input', e => {
      state.embed.author.icon_url = e.target.value;
      updatePreview();
    });
    el.embedAuthorUrl.addEventListener('input', e => {
      state.embed.author.url = e.target.value;
      updatePreview();
    });

    // Title
    el.embedTitle.addEventListener('input', e => {
      state.embed.title = e.target.value;
      updatePreview();
    });
    el.embedTitleUrl.addEventListener('input', e => {
      state.embed.title_url = e.target.value;
      updatePreview();
    });

    // Description
    el.embedDesc.addEventListener('input', e => {
      state.embed.description = e.target.value;
      updatePreview();
    });

    // Thumbnail & Image
    el.embedThumbnail.addEventListener('input', e => {
      state.embed.thumbnail_url = e.target.value;
      updatePreview();
    });
    el.embedImage.addEventListener('input', e => {
      state.embed.image_url = e.target.value;
      updatePreview();
    });

    // Footer
    el.embedFooterText.addEventListener('input', e => {
      state.embed.footer.text = e.target.value;
      updatePreview();
    });
    el.embedFooterIcon.addEventListener('input', e => {
      state.embed.footer.icon_url = e.target.value;
      updatePreview();
    });

    // Add field button
    el.btnAddField.addEventListener('click', () => {
      if (state.embed.fields.length >= 25) {
        showToast('フィールドは最大25個までです', true);
        return;
      }
      state.embed.fields.push({ name: '', value: '', inline: false });
      renderFieldsList();
      updatePreview();
    });

    // Plain message inputs
    el.plainContent.addEventListener('input', e => {
      state.plain.content = e.target.value;
      updatePreview();
    });
    el.plainImage.addEventListener('input', e => {
      state.plain.image_url = e.target.value;
      updatePreview();
    });

    // Copy Code Button
    el.btnCopyCode.addEventListener('click', async () => {
      // Validate
      if (!state.date || !state.time) {
        showToast('送信日時を入力してください', true);
        return;
      }
      if (!validateDatetime()) {
        showToast('指定された日時は過去です。未来の日時を指定してください', true);
        return;
      }

      if (state.messageType === 'plain') {
        if (!state.plain.content.trim() && !state.plain.image_url.trim()) {
          showToast('通常メッセージの本文または画像URLを入力してください', true);
          return;
        }
      } else {
        const hasTitle = Boolean(state.embed.title.trim());
        const hasDesc = Boolean(state.embed.description.trim());
        const hasImage = Boolean(state.embed.image_url.trim());
        const hasFields = state.embed.fields.some(f => f.name.trim() || f.value.trim());
        const hasAuthor = Boolean(state.embed.author.name.trim());
        const hasThumb = Boolean(state.embed.thumbnail_url.trim());

        if (!hasTitle && !hasDesc && !hasImage && !hasFields && !hasAuthor && !hasThumb) {
          showToast('Embedのタイトル、説明文、画像、またはフィールドのいずれかを設定してください', true);
          return;
        }
      }

      const payload = buildPayload();
      const code = encodeReservationCode(payload);

      try {
        await navigator.clipboard.writeText(code);
        showToast('予約コードをコピーしました（Discordに貼り付けてください）');
      } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('予約コードをコピーしました（Discordに貼り付けてください）');
      }
    });

    // Reset Button
    el.btnReset.addEventListener('click', () => {
      if (confirm('設定をリセットしますか？')) {
        initDefaults();
        showToast('設定をリセットしました');
      }
    });

    // Import Modal
    el.btnOpenImport.addEventListener('click', () => {
      el.importCodeInput.value = '';
      el.importErrorMsg.style.display = 'none';
      el.importModal.style.display = 'flex';
    });

    const closeModal = () => {
      el.importModal.style.display = 'none';
    };
    el.modalCloseBtn.addEventListener('click', closeModal);
    el.modalCancelBtn.addEventListener('click', closeModal);
    el.importModal.addEventListener('click', e => {
      if (e.target === el.importModal) closeModal();
    });

    el.modalApplyBtn.addEventListener('click', () => {
      const code = el.importCodeInput.value.trim();
      if (!code) {
        el.importErrorMsg.textContent = 'コードを入力してください';
        el.importErrorMsg.style.display = 'block';
        return;
      }
      try {
        applyCodeData(code);
        closeModal();
        showToast('予約コードを正常に読み込みました！');
      } catch (err) {
        el.importErrorMsg.textContent = err.message || '無効なコードです';
        el.importErrorMsg.style.display = 'block';
      }
    });

    // Mobile tabs
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

  // --- Start App ---
  setupEvents();
  initDefaults();
})();
