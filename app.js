/**
 * Discord Message Scheduler - Minimal Web App
 * Compatible with GeminiDBot Booking Cog
 */

(() => {
  'use strict';

  // --- State ---
  const state = {
    messageType: 'embed',
    date: '',
    time: '',
    recurrence: { type: 'none', days: [] },
    embed: {
      title: '',
      description: '',
      color: '#5865F2',
      image_url: '',
      author: { name: '', icon_url: '' },
      thumbnail_url: '',
      footer: { text: '', icon_url: '' },
      fields: []
    },
    plain: {
      text: '',
      image_url: ''
    },
    buttons: []
  };

  // --- DOM Elements ---
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  const el = {
    themeBtn: $('btn-theme'),
    themeIcon: $('theme-icon'),
    channelBadge: $('channel-badge'),
    channelName: $('channel-name'),
    btnReset: $('btn-reset'),

    inputDate: $('input-date'),
    inputTime: $('input-time'),
    selectRecurrence: $('select-recurrence'),
    weeklyGroup: $('weekly-days-group'),
    weekdayChecks: $$('input[name="weekday"]'),
    scheduleSummary: $('schedule-summary'),

    typeBtns: $$('.type-btn'),
    formEmbed: $('form-embed'),
    formPlain: $('form-plain'),

    embedTitle: $('embed-title'),
    embedDesc: $('embed-desc'),
    embedColor: $('embed-color'),
    embedColorText: $('embed-color-text'),
    embedImage: $('embed-image'),
    embedAuthorName: $('embed-author-name'),
    embedAuthorIcon: $('embed-author-icon'),
    embedThumbnail: $('embed-thumbnail'),
    embedFooter: $('embed-footer'),
    embedFooterIcon: $('embed-footer-icon'),
    fieldsContainer: $('fields-container'),
    btnAddField: $('btn-add-field'),

    plainText: $('plain-text'),
    plainCharCount: $('plain-char-count'),
    plainImage: $('plain-image'),

    buttonsContainer: $('buttons-container'),
    btnAddButton: $('btn-add-button'),

    btnCopyCode: $('btn-copy-code'),
    btnDownloadRsv: $('btn-download-rsv'),
    btnDownloadJson: $('btn-download-json'),

    // Preview
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

    // Modal
    btnImportOpen: $('btn-import-open'),
    modalImport: $('modal-import'),
    btnImportClose: $('btn-import-close'),
    btnImportCancel: $('btn-import-cancel'),
    btnImportSubmit: $('btn-import-submit'),
    importFile: $('import-file'),
    importCode: $('import-code'),
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
    if (el.themeIcon) el.themeIcon.textContent = isLight ? '☀️' : '🌙';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isLight ? '#f2f3f5' : '#1e1f22');
  }

  function initTheme() {
    const saved = localStorage.getItem('theme');
    const isLight = (saved === 'light' || (!saved && getSystemTheme() === 'light'));
    applyTheme(isLight);

    if (el.themeBtn) {
      el.themeBtn.addEventListener('click', () => {
        const nextLight = !document.body.classList.contains('light-theme');
        localStorage.setItem('theme', nextLight ? 'light' : 'dark');
        applyTheme(nextLight);
      });
    }

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          applyTheme(e.matches);
        }
      });
    }
  }

  // --- Toast Notification ---
  let toastTimer = null;
  function showToast(msg) {
    if (!el.toast) return;
    el.toast.textContent = msg;
    el.toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.style.display = 'none';
    }, 2500);
  }

  // --- Defaults & URL Params ---
  function initDefaults() {
    const now = new Date();
    // デフォルトは直近の次の正時
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);

    const pad = (n) => String(n).padStart(2, '0');
    el.inputDate.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    el.inputTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // クエリパラメータ
    const params = new URLSearchParams(window.location.search);
    const cname = params.get('cname');
    if (cname && el.channelBadge && el.channelName) {
      el.channelName.textContent = cname;
      el.channelBadge.style.display = 'inline-block';
    }

    const codeFromUrl = params.get('code') || params.get('data');
    if (codeFromUrl) {
      try {
        loadPayload(decodeCode(codeFromUrl));
      } catch (e) {
        console.warn('URLコード読み込み失敗:', e);
      }
    }

    updateScheduleSummary();
    renderPreview();
  }

  // --- Recurrence & Schedule Summary ---
  function updateScheduleSummary() {
    const dateVal = el.inputDate.value;
    const timeVal = el.inputTime.value;
    const recType = el.selectRecurrence.value;

    if (!dateVal || !timeVal) {
      el.scheduleSummary.textContent = '日付と時刻を指定してください';
      return;
    }

    const dateObj = new Date(`${dateVal}T${timeVal}:00`);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const dateStr = `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}(${weekdays[dateObj.getDay()]}) ${timeVal}`;

    let recStr = '1回のみ送信';
    if (recType === 'daily') recStr = '毎日 送信';
    else if (recType === 'weekdays') recStr = '平日 (月〜金) 送信';
    else if (recType === 'monthly') recStr = '毎月 送信';
    else if (recType === 'weekly') {
      const selected = Array.from(el.weekdayChecks)
        .filter((c) => c.checked)
        .map((c) => ['月', '火', '水', '木', '金', '土', '日'][parseInt(c.value, 10)]);
      recStr = selected.length ? `毎週 (${selected.join(', ')}) 送信` : '毎週 送信';
    }

    el.scheduleSummary.textContent = `📅 初回: ${dateStr} [${recStr}]`;
    if (el.pvTime) el.pvTime.textContent = `${dateStr} 送信予定`;
  }

  // --- Form Events ---
  function attachEventHandlers() {
    // 日時
    el.inputDate.addEventListener('input', () => { updateScheduleSummary(); renderPreview(); });
    el.inputTime.addEventListener('input', () => { updateScheduleSummary(); renderPreview(); });

    // 繰り返し
    el.selectRecurrence.addEventListener('change', () => {
      el.weeklyGroup.style.display = el.selectRecurrence.value === 'weekly' ? 'block' : 'none';
      updateScheduleSummary();
    });
    el.weekdayChecks.forEach((c) => c.addEventListener('change', updateScheduleSummary));

    // メッセージ形式タブ
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

    // Embed入力
    el.embedTitle.addEventListener('input', renderPreview);
    el.embedDesc.addEventListener('input', renderPreview);
    el.embedColor.addEventListener('input', (e) => {
      el.embedColorText.textContent = e.target.value.toUpperCase();
      renderPreview();
    });
    el.embedImage.addEventListener('input', renderPreview);
    el.embedAuthorName.addEventListener('input', renderPreview);
    el.embedAuthorIcon.addEventListener('input', renderPreview);
    el.embedThumbnail.addEventListener('input', renderPreview);
    el.embedFooter.addEventListener('input', renderPreview);
    el.embedFooterIcon.addEventListener('input', renderPreview);

    // 通常テキスト入力
    el.plainText.addEventListener('input', () => {
      const len = el.plainText.value.length;
      el.plainCharCount.textContent = `${len} / 2000`;
      renderPreview();
    });
    el.plainImage.addEventListener('input', renderPreview);

    // フィールド追加
    el.btnAddField.addEventListener('click', () => {
      if (state.embed.fields.length >= 25) {
        alert('フィールドは最大25個までです');
        return;
      }
      state.embed.fields.push({ name: '', value: '', inline: false });
      renderFieldsList();
      renderPreview();
    });

    // ボタン追加
    el.btnAddButton.addEventListener('click', () => {
      if (state.buttons.length >= 5) {
        alert('ボタンは最大5個までです');
        return;
      }
      state.buttons.push({ label: '', url: '' });
      renderButtonsList();
      renderPreview();
    });

    // コピー & ダウンロード
    el.btnCopyCode.addEventListener('click', handleCopyCode);
    el.btnDownloadRsv.addEventListener('click', () => handleDownload(true));
    el.btnDownloadJson.addEventListener('click', () => handleDownload(false));

    // モーダル
    el.btnImportOpen.addEventListener('click', () => {
      el.importError.style.display = 'none';
      el.importCode.value = '';
      el.importFile.value = '';
      el.modalImport.style.display = 'flex';
    });
    el.btnImportClose.addEventListener('click', () => { el.modalImport.style.display = 'none'; });
    el.btnImportCancel.addEventListener('click', () => { el.modalImport.style.display = 'none'; });
    el.btnImportSubmit.addEventListener('click', handleImport);

    // リセット
    el.btnReset.addEventListener('click', () => {
      if (!confirm('入力内容を初期状態にリセットしますか？')) return;
      location.reload();
    });
  }

  // --- Dynamic Lists (Fields & Buttons) ---
  function renderFieldsList() {
    el.fieldsContainer.innerHTML = '';
    state.embed.fields.forEach((f, idx) => {
      const item = document.createElement('div');
      item.className = 'field-item';
      item.innerHTML = `
        <input type="text" placeholder="項目名" value="${escapeHtml(f.name)}" style="flex:1;">
        <input type="text" placeholder="値" value="${escapeHtml(f.value)}" style="flex:2;">
        <label style="font-size:0.75rem;display:flex;align-items:center;gap:2px;cursor:pointer;">
          <input type="checkbox" ${f.inline ? 'checked' : ''}>横並び
        </label>
        <button type="button" class="btn btn-sm btn-ghost" style="color:var(--danger);padding:2px 6px;">✕</button>
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
        <button type="button" class="btn btn-sm btn-ghost" style="color:var(--danger);padding:2px 6px;">✕</button>
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

  // --- Discord Live Preview ---
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
          <div class="pv-field-name">${escapeHtml(f.name || '\u200b')}</div>
          <div class="pv-field-value">${escapeHtml(f.value || '\u200b')}</div>
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
        btnEl.className = 'pv-btn';
        btnEl.textContent = b.label;
        el.pvButtons.appendChild(btnEl);
      });
    } else {
      el.pvButtons.style.display = 'none';
    }
  }

  // --- Payload Generation & Compression ---
  function buildPayload() {
    const dateVal = el.inputDate.value;
    const timeVal = el.inputTime.value;
    if (!dateVal || !timeVal) {
      throw new Error('送信日時を入力してください。');
    }

    // JST ISO string
    const datetimeStr = `${dateVal}T${timeVal}:00+09:00`;

    // Recurrence
    const recType = el.selectRecurrence.value;
    const recurrence = { type: recType };
    if (recType === 'weekly') {
      const selectedDays = Array.from(el.weekdayChecks)
        .filter((c) => c.checked)
        .map((c) => parseInt(c.value, 10));
      recurrence.days = selectedDays.length ? selectedDays : [new Date(`${dateVal}T${timeVal}`).getDay() === 0 ? 6 : new Date(`${dateVal}T${timeVal}`).getDay() - 1];
    }

    // Buttons
    const buttons = state.buttons
      .filter((b) => b.label.trim() && b.url.trim())
      .map((b) => ({ label: b.label.trim(), url: b.url.trim() }));

    const payload = {
      datetime: datetimeStr,
      type: state.messageType,
      recurrence: recurrence
    };

    if (buttons.length) payload.buttons = buttons;

    if (state.messageType === 'plain') {
      const text = el.plainText.value.trim();
      const img = el.plainImage.value.trim();
      if (!text && !img) {
        throw new Error('メッセージ本文または画像URLを入力してください。');
      }
      payload.content = { text: text };
      if (img) payload.content.image_url = img;
    } else {
      const title = el.embedTitle.value.trim();
      const desc = el.embedDesc.value.trim();
      const color = el.embedColor.value;
      const img = el.embedImage.value.trim();
      const thumb = el.embedThumbnail.value.trim();
      const authorName = el.embedAuthorName.value.trim();
      const authorIcon = el.embedAuthorIcon.value.trim();
      const footerText = el.embedFooter.value.trim();
      const footerIcon = el.embedFooterIcon.value.trim();

      const validFields = state.embed.fields
        .filter((f) => f.name.trim() || f.value.trim())
        .map((f) => ({ name: f.name.trim(), value: f.value.trim(), inline: !!f.inline }));

      if (!title && !desc && !img && !thumb && !validFields.length && !authorName) {
        throw new Error('タイトルまたは説明文を入力してください。');
      }

      const content = {
        title: title || undefined,
        description: desc || undefined,
        color: color || '#5865F2'
      };

      if (img) content.image_url = img;
      if (thumb) content.thumbnail_url = thumb;
      if (authorName) {
        content.author = { name: authorName };
        if (authorIcon) content.author.icon_url = authorIcon;
      }
      if (footerText) {
        content.footer = { text: footerText };
        if (footerIcon) content.footer.icon_url = footerIcon;
      }
      if (validFields.length) content.fields = validFields;

      // undefinedを整理
      payload.content = JSON.parse(JSON.stringify(content));
    }

    return payload;
  }

  function encodePayloadToRsv(payload) {
    const jsonStr = JSON.stringify(payload);
    if (typeof window.pako === 'undefined') {
      // pakoが無い場合のフォールバック (生Base64)
      return 'RSV1_' + btoa(unescape(encodeURIComponent(jsonStr)));
    }
    // zlib 最高圧縮 (level: 9)
    const compressed = window.pako.deflate(jsonStr, { level: 9 });
    let binary = '';
    const bytes = new Uint8Array(compressed);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'RSV1_' + btoa(binary);
  }

  function getCompressedBinary(payload) {
    const jsonStr = JSON.stringify(payload);
    if (typeof window.pako !== 'undefined') {
      return window.pako.deflate(jsonStr, { level: 9 });
    }
    return new TextEncoder().encode(jsonStr);
  }

  // --- Copy & Download Actions ---
  async function handleCopyCode() {
    try {
      const payload = buildPayload();
      const code = encodePayloadToRsv(payload);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast('📋 予約コードをコピーしました！Discordに貼り付けてください');
    } catch (e) {
      alert(e.message || 'エラーが発生しました');
    }
  }

  function handleDownload(isRsv) {
    try {
      const payload = buildPayload();
      let blob, filename;

      if (isRsv) {
        const bin = getCompressedBinary(payload);
        blob = new Blob([bin], { type: 'application/octet-stream' });
        filename = `reservation_${Date.now()}.rsv`;
      } else {
        const jsonStr = JSON.stringify(payload, null, 2);
        blob = new Blob([jsonStr], { type: 'application/json' });
        filename = `reservation_${Date.now()}.json`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`💾 ${filename} を保存しました`);
    } catch (e) {
      alert(e.message || 'エラーが発生しました');
    }
  }

  // --- Import Logic ---
  function decodeCode(rawInput) {
    let clean = String(rawInput).trim();
    if (clean.startsWith('RSV1_')) clean = clean.slice(5);
    else if (clean.startsWith('RSV_')) clean = clean.slice(4);

    // 1. zlib Base64 試行
    try {
      const bin = atob(clean);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      if (typeof window.pako !== 'undefined') {
        const decompressed = window.pako.inflate(bytes, { to: 'string' });
        return JSON.parse(decompressed);
      }
    } catch (e) {}

    // 2. 平文Base64試行
    try {
      const decoded = decodeURIComponent(escape(atob(clean)));
      return JSON.parse(decoded);
    } catch (e) {}

    // 3. 生JSON試行
    return JSON.parse(clean);
  }

  function loadPayload(data) {
    if (!data || typeof data !== 'object') throw new Error('データ形式が無効です');

    // 日時
    if (data.datetime) {
      const dt = new Date(data.datetime);
      if (!isNaN(dt.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        el.inputDate.value = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
        el.inputTime.value = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      }
    }

    // 繰り返し
    if (data.recurrence) {
      el.selectRecurrence.value = data.recurrence.type || 'none';
      el.weeklyGroup.style.display = data.recurrence.type === 'weekly' ? 'block' : 'none';
      const days = data.recurrence.days || [];
      el.weekdayChecks.forEach((c) => {
        c.checked = days.includes(parseInt(c.value, 10));
      });
    }

    // 形式
    const type = data.type || 'embed';
    state.messageType = type;
    el.typeBtns.forEach((b) => b.classList.toggle('active', b.dataset.type === type));
    el.formEmbed.style.display = type === 'embed' ? 'block' : 'none';
    el.formPlain.style.display = type === 'plain' ? 'block' : 'none';

    const content = data.content || {};

    if (type === 'plain') {
      el.plainText.value = content.text || '';
      el.plainImage.value = content.image_url || '';
      el.plainCharCount.textContent = `${el.plainText.value.length} / 2000`;
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

    // ボタン
    state.buttons = Array.isArray(data.buttons) ? data.buttons : [];
    renderButtonsList();

    updateScheduleSummary();
    renderPreview();
  }

  async function handleImport() {
    el.importError.style.display = 'none';
    const code = el.importCode.value.trim();
    const file = el.importFile.files[0];

    try {
      if (file) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let parsed = null;
        try {
          if (typeof window.pako !== 'undefined') {
            const text = window.pako.inflate(bytes, { to: 'string' });
            parsed = JSON.parse(text);
          }
        } catch (e) {}

        if (!parsed) {
          const str = new TextDecoder('utf-8').decode(bytes);
          parsed = decodeCode(str);
        }

        loadPayload(parsed);
      } else if (code) {
        loadPayload(decodeCode(code));
      } else {
        throw new Error('ファイルまたはコードを入力してください');
      }

      el.modalImport.style.display = 'none';
      showToast('読み込みが完了しました');
    } catch (e) {
      el.importError.textContent = '読み込みに失敗しました: ' + (e.message || '形式が不正です');
      el.importError.style.display = 'block';
    }
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

  // --- Init ---
  function init() {
    initTheme();
    initDefaults();
    attachEventHandlers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
