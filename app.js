const App = {
  currentTab: 'monitor',
  selectedReviewId: null,
  currentCategory: 'hygiene',
  currentTone: 'sincere',
  currentTimeRange: 'today',
  linkedReviewId: null,

  init() {
    AppData.init();
    this.bindEvents();
    this.renderMonitor();
    this.renderReviewList();
    this.renderReplyTemplates();
    this.updateStoreSelector();
    this.updateMonitorBadge();
  },

  bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    document.getElementById('btnConfig').addEventListener('click', () => {
      this.openConfigModal();
    });
    document.getElementById('closeConfig').addEventListener('click', () => {
      this.closeConfigModal();
    });
    document.getElementById('cancelConfig').addEventListener('click', () => {
      this.closeConfigModal();
    });
    document.getElementById('saveConfig').addEventListener('click', () => {
      this.saveConfig();
    });
    document.getElementById('addAddress').addEventListener('click', () => {
      this.addAddress();
    });
    document.getElementById('addItem').addEventListener('click', () => {
      this.addItem();
    });
    document.getElementById('addKeyword').addEventListener('click', () => {
      this.addKeyword();
    });

    document.querySelectorAll('.range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTimeRange = btn.dataset.range;
        document.querySelectorAll('.range-btn').forEach(b => b.classList.toggle('active', b.dataset.range === this.currentTimeRange));
        this.renderMonitor();
      });
    });

    document.getElementById('riskLevelFilter').addEventListener('change', () => {
      this.renderMonitor();
    });
    document.getElementById('platformFilter').addEventListener('change', () => {
      this.renderMonitor();
    });

    document.getElementById('reviewStatusFilter').addEventListener('change', () => {
      this.renderReviewList();
    });
    document.getElementById('reviewProgressFilter').addEventListener('change', () => {
      this.renderReviewList();
    });

    document.getElementById('btnAddReview').addEventListener('click', () => {
      this.openAddReviewModal();
    });
    document.getElementById('closeAddReview').addEventListener('click', () => {
      this.closeAddReviewModal();
    });
    document.getElementById('cancelAddReview').addEventListener('click', () => {
      this.closeAddReviewModal();
    });
    document.getElementById('confirmAddReview').addEventListener('click', () => {
      this.confirmAddReview();
    });
    document.getElementById('inputContent').addEventListener('input', () => {
      this.updateMatchedKeywords();
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentCategory = btn.dataset.category;
        this.updateCategoryButtons();
        this.updateTemplateContent();
      });
    });

    document.querySelectorAll('.tone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTone = btn.dataset.tone;
        this.updateToneButtons();
        this.updateTemplateContent();
      });
    });

    document.getElementById('btnCopy').addEventListener('click', () => {
      this.copyTemplate();
    });

    document.getElementById('btnUseTemplate').addEventListener('click', () => {
      this.useTemplateInEditor();
    });

    document.getElementById('btnSaveDraft').addEventListener('click', () => {
      this.saveDraft();
    });

    document.getElementById('storeSelect').addEventListener('change', () => {
      this.renderMonitor();
      this.renderReviewList();
    });
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${tab}`);
    });
  },

  updateMonitorBadge() {
    const count = AppData.getPendingReviews().length;
    const badge = document.getElementById('monitorBadge');
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  },

  renderMonitor() {
    const container = document.getElementById('riskCards');
    const levelFilter = document.getElementById('riskLevelFilter').value;
    const platformFilter = document.getElementById('platformFilter').value;
    const storeFilter = document.getElementById('storeSelect').value;

    let reviews = AppData.getReviewsByTimeRange(this.currentTimeRange);

    reviews = [...reviews].sort((a, b) => {
      const levelOrder = { high: 3, medium: 2, low: 1 };
      const levelDiff = levelOrder[b.riskLevel] - levelOrder[a.riskLevel];
      if (levelDiff !== 0) return levelDiff;
      const likeDiff = b.likes - a.likes;
      if (likeDiff !== 0) return likeDiff;
      return new Date(b.date) - new Date(a.date);
    });

    if (levelFilter !== 'all') {
      reviews = reviews.filter(r => r.riskLevel === levelFilter);
    }
    if (platformFilter !== 'all') {
      reviews = reviews.filter(r => r.platform === platformFilter);
    }
    if (storeFilter !== 'all') {
      reviews = reviews.filter(r => r.store.includes(storeFilter));
    }

    const rangeLabels = { today: '今日', week: '近7天', all: '全部' };
    const rangeLabel = rangeLabels[this.currentTimeRange];
    const todayCount = AppData.getTodayReviews().length;
    let countText = `${rangeLabel}共 ${reviews.length} 条`;
    if (this.currentTimeRange !== 'today') {
      countText += `（今日新增 ${todayCount} 条）`;
    }
    document.getElementById('todayRiskCount').textContent = countText;

    if (reviews.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>${this.currentTimeRange === 'today' ? '今日暂无新增风险' : '该时间范围内暂无风险评价'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = reviews.map(review => this.createRiskCard(review)).join('');

    container.querySelectorAll('.risk-card').forEach(card => {
      card.addEventListener('click', () => {
        const reviewId = card.dataset.id;
        this.selectedReviewId = reviewId;
        this.switchTab('review');
        this.renderReviewList();
        this.renderReviewDetail(reviewId);
      });
    });
  },

  createRiskCard(review) {
    const levelClass = { high: 'risk-high', medium: 'risk-medium', low: 'risk-low' }[review.riskLevel];
    const levelText = { high: '高风险', medium: '中风险', low: '低风险' }[review.riskLevel];
    const isToday = new Date(review.date).toDateString() === new Date().toDateString();
    const timeAgo = this.getTimeAgo(review.date);

    let tags = '';
    if (review.likes > 10) {
      tags += `<span class="tag tag-like">👍 ${review.likes}人点赞</span>`;
    }
    if (review.sharedByInfluencer) {
      tags += `<span class="tag tag-influencer">📢 达人转发</span>`;
    }
    if (review.hasEvidence) {
      tags += `<span class="tag tag-evidence">📷 有证据</span>`;
    }

    const keywordTags = (review.keywords || []).map(kw =>
      `<span class="keyword-tag">${kw}</span>`
    ).join('');

    let progressTags = '';
    if (review.progress && review.progress.length > 0) {
      const progressMap = {
        contacted: { text: '📞 已联系', class: 'progress-contacted' },
        compensated: { text: '🎁 已补偿', class: 'progress-compensated' },
        replied: { text: '💬 已回复', class: 'progress-replied' }
      };
      progressTags = review.progress.map(p => {
        const pm = progressMap[p];
        return pm ? `<span class="progress-tag ${pm.class}">${pm.text}</span>` : '';
      }).join('');
    }

    return `
      <div class="risk-card ${levelClass}" data-id="${review.id}">
        <div class="risk-card-header">
          <div class="risk-level ${levelClass}">
            ${levelText}
            ${isToday ? '<span class="new-badge">NEW</span>' : ''}
          </div>
          <div class="risk-time">${timeAgo}</div>
        </div>
        <div class="risk-platform">
          <span class="platform-name">${review.platformName}</span>
          <span class="store-name">${review.store}</span>
        </div>
        <div class="risk-content">${review.content.substring(0, 80)}${review.content.length > 80 ? '...' : ''}</div>
        <div class="risk-keywords">${keywordTags}</div>
        <div class="risk-footer">
          <div class="risk-tags">${tags}${progressTags}</div>
          <div class="risk-author">— ${review.author}</div>
        </div>
      </div>
    `;
  },

  getTimeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  },

  renderReviewList() {
    const container = document.getElementById('reviewList');
    const statusFilter = document.getElementById('reviewStatusFilter').value;
    const progressFilter = document.getElementById('reviewProgressFilter').value;
    const storeFilter = document.getElementById('storeSelect').value;

    let reviews = [...AppData.reviews].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (statusFilter !== 'all') {
      reviews = reviews.filter(r => r.status === statusFilter);
    }
    if (progressFilter !== 'all') {
      reviews = AppData.getReviewsByProgress(progressFilter).filter(r => reviews.some(rv => rv.id === r.id));
    }
    if (storeFilter !== 'all') {
      reviews = reviews.filter(r => r.store.includes(storeFilter));
    }

    const pendingCount = AppData.getPendingReviews().length;
    document.getElementById('reviewStats').textContent = `待处理 ${pendingCount} 条`;

    if (reviews.length === 0) {
      container.innerHTML = `<div class="empty-list">暂无评价</div>`;
      return;
    }

    container.innerHTML = reviews.map(review => {
      const levelClass = { high: 'risk-high', medium: 'risk-medium', low: 'risk-low' }[review.riskLevel];
      const statusMap = {
        pending: { text: '待核查', class: 'status-pending' },
        true: { text: '属实', class: 'status-true' },
        misunderstanding: { text: '误会', class: 'status-misunderstanding' },
        malicious: { text: '恶意竞争', class: 'status-malicious' },
        contact: { text: '需联系顾客', class: 'status-contact' }
      };
      const status = statusMap[review.status] || statusMap.pending;
      const isActive = this.selectedReviewId === review.id ? 'active' : '';

      let progressDots = '';
      if (review.progress && review.progress.length > 0) {
        progressDots = `<span class="progress-dot" title="${review.progress.map(p => ({contacted:'已联系',compensated:'已补偿',replied:'已公开回复'}[p])).join('、')}">●</span>`;
      }

      return `
        <div class="review-item ${isActive}" data-id="${review.id}">
          <div class="review-item-header">
            <span class="review-platform ${review.platform}">${review.platformName}</span>
            <span class="review-risk ${levelClass}">${
              { high: '高', medium: '中', low: '低' }[review.riskLevel]
            }</span>
          </div>
          <div class="review-item-content">${review.content.substring(0, 50)}...</div>
          <div class="review-item-footer">
            <span class="status-badge ${status.class}">${status.text}</span>
            <span class="review-item-progress">${progressDots}</span>
            <span class="review-time">${this.getTimeAgo(review.date)}</span>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.review-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        this.selectedReviewId = id;
        this.renderReviewList();
        this.renderReviewDetail(id);
      });
    });
  },

  renderReviewDetail(id) {
    const container = document.getElementById('reviewDetail');
    const review = AppData.getReviewById(id);

    if (!review) {
      container.innerHTML = `<div class="empty-state"><p>评价不存在</p></div>`;
      return;
    }

    const levelClass = { high: 'risk-high', medium: 'risk-medium', low: 'risk-low' }[review.riskLevel];
    const levelText = { high: '高风险', medium: '中风险', low: '低风险' }[review.riskLevel];

    let ratingDisplay = '';
    if (review.rating !== null && review.rating !== undefined) {
      const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      ratingDisplay = `<div class="detail-rating">评分: <span class="stars">${stars}</span></div>`;
    }

    const statusMap = {
      pending: { text: '待核查', class: 'status-pending' },
      true: { text: '属实', class: 'status-true' },
      misunderstanding: { text: '误会', class: 'status-misunderstanding' },
      malicious: { text: '恶意竞争', class: 'status-malicious' },
      contact: { text: '需联系顾客', class: 'status-contact' }
    };
    const status = statusMap[review.status] || statusMap.pending;

    const keywordTags = (review.keywords || []).map(kw =>
      `<span class="keyword-tag">${kw}</span>`
    ).join('');

    const progressOptions = [
      { key: 'contacted', label: '📞 已联系顾客', class: 'progress-contacted' },
      { key: 'compensated', label: '🎁 已补偿', class: 'progress-compensated' },
      { key: 'replied', label: '💬 已公开回复', class: 'progress-replied' }
    ];

    const progressCheckboxes = progressOptions.map(opt => {
      const checked = review.progress && review.progress.includes(opt.key) ? 'checked' : '';
      return `
        <label class="progress-checkbox ${opt.class}">
          <input type="checkbox" data-progress="${opt.key}" ${checked}>
          <span>${opt.label}</span>
        </label>
      `;
    }).join('');

    const linkedDrafts = AppData.getDraftsForReview(id);
    let linkedDraftsHtml = '';
    if (linkedDrafts.length > 0) {
      linkedDraftsHtml = `
        <div class="detail-linked-drafts">
          <h4>📝 回复准备 (${linkedDrafts.length})</h4>
          ${linkedDrafts.map(d => `
            <div class="linked-draft-item">
              <span class="linked-draft-meta">${d.categoryName} · ${d.toneName}</span>
              <span class="linked-draft-time">${this.getTimeAgo(d.createdAt)}</span>
              <div class="linked-draft-content">${d.content.substring(0, 80)}...</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="detail-header">
        <div class="detail-platform">
          <span class="platform-label">${review.platformName}</span>
          <span class="risk-level ${levelClass}">${levelText}</span>
        </div>
        <div class="detail-store">${review.store}</div>
      </div>

      <div class="detail-info">
        ${ratingDisplay}
        <div class="detail-author">用户: ${review.author}</div>
        <div class="detail-date">发布时间: ${new Date(review.date).toLocaleString()}</div>
      </div>

      <div class="detail-tags">${keywordTags}</div>

      <div class="detail-content">
        <h4>评价内容</h4>
        <p>${review.content}</p>
      </div>

      <div class="detail-metrics">
        <div class="metric-item">
          <span class="metric-label">👍 点赞数</span>
          <span class="metric-value">${review.likes}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">📢 达人转发</span>
          <span class="metric-value">${review.sharedByInfluencer ? '是' : '否'}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">📷 证据图片</span>
          <span class="metric-value">${review.hasEvidence ? '有' : '无'}</span>
        </div>
      </div>

      <div class="detail-status">
        <h4>当前状态</h4>
        <span class="status-badge ${status.class}">${status.text}</span>
      </div>

      <div class="detail-actions">
        <h4>标记处理状态</h4>
        <div class="action-buttons">
          <button class="action-btn btn-true" data-status="true">属实</button>
          <button class="action-btn btn-misunderstanding" data-status="misunderstanding">误会</button>
          <button class="action-btn btn-malicious" data-status="malicious">恶意竞争</button>
          <button class="action-btn btn-contact" data-status="contact">需联系顾客</button>
        </div>
      </div>

      <div class="detail-progress">
        <h4>处理进度</h4>
        <div class="progress-checkboxes">
          ${progressCheckboxes}
        </div>
      </div>

      <div class="detail-note">
        <h4>处理记录</h4>
        <textarea id="handleNote" placeholder="记录线下处理结果和跟进情况...">${review.handleNote || ''}</textarea>
        <button class="btn-primary btn-save-note" id="saveNoteBtn">保存记录</button>
      </div>

      ${review.status !== 'pending' ? `
        <div class="detail-history">
          <h4>处理历史</h4>
          <div class="history-item">
            <span class="history-date">${review.handleDate ? new Date(review.handleDate).toLocaleString() : '-'}</span>
            <span class="history-status ${status.class}">${status.text}</span>
          </div>
        </div>
      ` : ''}

      ${linkedDraftsHtml}

      <div class="detail-reply-entry">
        <button class="btn-primary btn-goto-reply" id="btnGotoReply">✏️ 撰写回复草稿</button>
      </div>
    `;

    container.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const status = btn.dataset.status;
        const note = document.getElementById('handleNote').value;
        AppData.updateReviewStatus(id, status, note);
        this.renderReviewList();
        this.renderReviewDetail(id);
        this.updateMonitorBadge();
        this.showToast('状态已更新');
      });
    });

    container.querySelectorAll('.progress-checkbox input').forEach(cb => {
      cb.addEventListener('change', () => {
        const progressKey = cb.dataset.progress;
        if (cb.checked) {
          AppData.updateReviewProgress(id, progressKey);
        } else {
          AppData.removeReviewProgress(id, progressKey);
        }
        this.renderReviewList();
        this.renderMonitor();
      });
    });

    const saveNoteBtn = document.getElementById('saveNoteBtn');
    if (saveNoteBtn) {
      saveNoteBtn.addEventListener('click', () => {
        const note = document.getElementById('handleNote').value;
        AppData.updateReviewStatus(id, review.status, note);
        this.showToast('记录已保存');
      });
    }

    const gotoReplyBtn = document.getElementById('btnGotoReply');
    if (gotoReplyBtn) {
      gotoReplyBtn.addEventListener('click', () => {
        this.linkedReviewId = id;
        const review = AppData.getReviewById(id);
        const guessedCategory = ReplyTemplates.guessCategory(review.keywords);
        this.currentCategory = guessedCategory;
        this.updateCategoryButtons();
        this.switchTab('reply');
        this.updateReplyContextHint();
        this.updateTemplateContent();
      });
    }
  },

  updateReplyContextHint() {
    const hint = document.getElementById('replyContextHint');
    if (this.linkedReviewId) {
      const review = AppData.getReviewById(this.linkedReviewId);
      if (review) {
        hint.textContent = `关联评价: ${review.store} — ${review.content.substring(0, 30)}...`;
        hint.classList.add('hint-linked');
      }
    } else {
      hint.textContent = '选择场景和语气，生成专业回复';
      hint.classList.remove('hint-linked');
    }
  },

  renderReplyTemplates() {
    this.updateTemplateContent();
    this.renderDraftList();
  },

  updateCategoryButtons() {
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === this.currentCategory);
    });
  },

  updateToneButtons() {
    document.querySelectorAll('.tone-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tone === this.currentTone);
    });
  },

  updateTemplateContent() {
    const category = ReplyTemplates.categories[this.currentCategory];
    const tone = ReplyTemplates.tones[this.currentTone];
    const template = ReplyTemplates.getTemplate(this.currentCategory, this.currentTone);
    const storeName = AppData.config.storeName || '【您的店名】';
    const filledTemplate = template.replace(/{店名}/g, storeName);

    document.getElementById('templateTitle').textContent = `${tone.name} - ${category.name}`;
    document.getElementById('templateContent').textContent = filledTemplate;
  },

  copyTemplate() {
    const content = document.getElementById('templateContent').textContent;
    navigator.clipboard.writeText(content).then(() => {
      this.showToast('已复制到剪贴板');
    });
  },

  useTemplateInEditor() {
    const content = document.getElementById('templateContent').textContent;
    document.getElementById('replyEditor').value = content;
    this.showToast('已填充到编辑器');
  },

  saveDraft() {
    const content = document.getElementById('replyEditor').value.trim();
    if (!content) {
      this.showToast('请输入回复内容');
      return;
    }

    const draft = {
      content,
      category: this.currentCategory,
      tone: this.currentTone,
      categoryName: ReplyTemplates.categories[this.currentCategory].name,
      toneName: ReplyTemplates.tones[this.currentTone].name
    };

    if (this.linkedReviewId) {
      draft.reviewId = this.linkedReviewId;
      const review = AppData.getReviewById(this.linkedReviewId);
      if (review) {
        draft.reviewStore = review.store;
        draft.reviewSnippet = review.content.substring(0, 30);
      }
    }

    AppData.addDraft(draft);
    this.renderDraftList();
    this.showToast('草稿已保存');

    if (this.selectedReviewId === this.linkedReviewId) {
      this.renderReviewDetail(this.selectedReviewId);
    }
  },

  renderDraftList() {
    const container = document.getElementById('draftList');

    if (AppData.drafts.length === 0) {
      container.innerHTML = '<p class="empty-text">暂无历史草稿</p>';
      return;
    }

    container.innerHTML = AppData.drafts.slice(0, 8).map(draft => `
      <div class="draft-item" data-id="${draft.id}">
        <div class="draft-header">
          <span class="draft-category">${draft.categoryName}</span>
          <span class="draft-tone">${draft.toneName}</span>
          ${draft.reviewStore ? `<span class="draft-review-store">${draft.reviewStore}</span>` : ''}
          <span class="draft-date">${this.getTimeAgo(draft.createdAt)}</span>
        </div>
        <div class="draft-content">${draft.content.substring(0, 60)}...</div>
        <div class="draft-actions">
          <button class="draft-btn" data-action="use">使用</button>
          <button class="draft-btn" data-action="delete">删除</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.draft-item').forEach(item => {
      const id = item.dataset.id;

      item.querySelector('[data-action="use"]').addEventListener('click', (e) => {
        e.stopPropagation();
        const draft = AppData.drafts.find(d => d.id === id);
        if (draft) {
          document.getElementById('replyEditor').value = draft.content;
          this.showToast('已载入草稿');
        }
      });

      item.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('确定删除这条草稿吗？')) {
          AppData.deleteDraft(id);
          this.renderDraftList();
          this.showToast('已删除');
        }
      });
    });
  },

  openAddReviewModal() {
    document.getElementById('addReviewModal').classList.add('active');
    this.populateAddReviewForm();
  },

  closeAddReviewModal() {
    document.getElementById('addReviewModal').classList.remove('active');
  },

  populateAddReviewForm() {
    const storeSelect = document.getElementById('inputStore');
    const addresses = AppData.config.addresses;
    let options = '<option value="">请选择门店</option>';
    addresses.forEach(addr => {
      options += `<option value="${addr.name}">${addr.name}</option>`;
    });
    storeSelect.innerHTML = options;

    document.getElementById('inputPlatform').value = '';
    document.getElementById('inputRating').value = 'null';
    document.getElementById('inputRiskLevel').value = 'medium';
    document.getElementById('inputContent').value = '';
    document.getElementById('inputLikes').value = '0';
    document.getElementById('inputAuthor').value = '';
    document.getElementById('inputInfluencer').checked = false;
    document.getElementById('inputEvidence').checked = false;
    document.getElementById('matchedKeywords').style.display = 'none';
  },

  updateMatchedKeywords() {
    const content = document.getElementById('inputContent').value;
    const matched = AppData.matchKeywords(content);
    const container = document.getElementById('matchedKeywords');
    const list = document.getElementById('matchedKeywordsList');

    if (matched.length > 0) {
      container.style.display = 'block';
      list.innerHTML = matched.map(kw => `<span class="keyword-tag">${kw}</span>`).join('');
    } else {
      container.style.display = 'none';
    }
  },

  confirmAddReview() {
    const platform = document.getElementById('inputPlatform').value;
    const storeBranch = document.getElementById('inputStore').value;
    const ratingVal = document.getElementById('inputRating').value;
    const rating = ratingVal === 'null' ? null : parseInt(ratingVal);
    const riskLevel = document.getElementById('inputRiskLevel').value;
    const content = document.getElementById('inputContent').value.trim();
    const likes = parseInt(document.getElementById('inputLikes').value) || 0;
    const author = document.getElementById('inputAuthor').value.trim();
    const sharedByInfluencer = document.getElementById('inputInfluencer').checked;
    const hasEvidence = document.getElementById('inputEvidence').checked;

    if (!platform) {
      this.showToast('请选择来源平台');
      return;
    }
    if (!storeBranch) {
      this.showToast('请选择所属门店');
      return;
    }
    if (!content) {
      this.showToast('请输入评价内容');
      return;
    }

    AppData.addReview({
      platform,
      storeBranch,
      rating,
      riskLevel,
      content,
      likes,
      author: author || undefined,
      sharedByInfluencer,
      hasEvidence
    });

    this.closeAddReviewModal();
    this.renderMonitor();
    this.renderReviewList();
    this.updateMonitorBadge();
    this.showToast('评价已录入');
  },

  updateStoreSelector() {
    const select = document.getElementById('storeSelect');
    const addresses = AppData.config.addresses;

    let options = '<option value="all">全部门店</option>';
    addresses.forEach(addr => {
      options += `<option value="${addr.name}">${addr.name}</option>`;
    });

    select.innerHTML = options;
  },

  openConfigModal() {
    document.getElementById('configModal').classList.add('active');
    this.renderConfigForm();
  },

  closeConfigModal() {
    document.getElementById('configModal').classList.remove('active');
  },

  renderConfigForm() {
    document.getElementById('storeName').value = AppData.config.storeName;
    this.renderAddressList();
    this.renderItemsList();
    this.renderKeywordsList();
  },

  renderAddressList() {
    const container = document.getElementById('addressList');
    container.innerHTML = AppData.config.addresses.map((addr, index) => `
      <div class="address-item" data-index="${index}">
        <input type="text" class="addr-name" value="${addr.name}" placeholder="分店名称">
        <input type="text" class="addr-address" value="${addr.address}" placeholder="分店地址">
        <button class="btn-remove" data-action="remove-address" data-index="${index}">×</button>
      </div>
    `).join('');

    container.querySelectorAll('[data-action="remove-address"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        AppData.config.addresses.splice(index, 1);
        this.renderAddressList();
      });
    });
  },

  addAddress() {
    AppData.config.addresses.push({ id: 'a' + Date.now(), name: '', address: '' });
    this.renderAddressList();
  },

  renderItemsList() {
    const container = document.getElementById('itemsList');
    container.innerHTML = AppData.config.items.map((item, index) => `
      <span class="item-tag">
        ${item}
        <button class="item-remove" data-index="${index}">×</button>
      </span>
    `).join('');

    container.querySelectorAll('.item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        AppData.config.items.splice(index, 1);
        this.renderItemsList();
      });
    });
  },

  addItem() {
    const input = document.getElementById('newItem');
    const value = input.value.trim();
    if (value && !AppData.config.items.includes(value)) {
      AppData.config.items.push(value);
      input.value = '';
      this.renderItemsList();
    }
  },

  renderKeywordsList() {
    const container = document.getElementById('keywordsList');
    container.innerHTML = AppData.config.keywords.map((kw, index) =>
      `<span class="keyword-tag">${kw}<button class="keyword-remove" data-index="${index}">×</button></span>`
    ).join('');

    container.querySelectorAll('.keyword-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        AppData.config.keywords.splice(index, 1);
        this.renderKeywordsList();
      });
    });
  },

  addKeyword() {
    const input = document.getElementById('newKeyword');
    const value = input.value.trim();
    if (value && !AppData.config.keywords.includes(value)) {
      AppData.config.keywords.push(value);
      input.value = '';
      this.renderKeywordsList();
    }
  },

  saveConfig() {
    const storeName = document.getElementById('storeName').value.trim();
    if (!storeName) {
      this.showToast('请填写店铺名称');
      return;
    }

    const addressItems = document.querySelectorAll('.address-item');
    const addresses = [];
    addressItems.forEach((item, index) => {
      const name = item.querySelector('.addr-name').value.trim();
      const address = item.querySelector('.addr-address').value.trim();
      if (name || address) {
        addresses.push({
          id: AppData.config.addresses[index]?.id || 'a' + Date.now() + index,
          name,
          address
        });
      }
    });

    AppData.config.storeName = storeName;
    AppData.config.addresses = addresses;
    AppData.recalcKeywords();
    AppData.saveConfig();

    this.updateStoreSelector();
    this.updateTemplateContent();
    this.renderMonitor();
    this.renderReviewList();
    this.closeConfigModal();
    this.showToast('配置已保存，关键词已重新匹配');
  },

  showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
