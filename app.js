const App = {
  currentTab: 'monitor',
  selectedReviewId: null,
  currentCategory: 'hygiene',
  currentTone: 'sincere',

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

    document.getElementById('riskLevelFilter').addEventListener('change', () => {
      this.renderMonitor();
    });
    document.getElementById('platformFilter').addEventListener('change', () => {
      this.renderMonitor();
    });

    document.getElementById('reviewStatusFilter').addEventListener('change', () => {
      this.renderReviewList();
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

    let reviews = [...AppData.reviews].sort((a, b) => {
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

    const todayCount = AppData.getTodayReviews().length;
    document.getElementById('todayRiskCount').textContent = `共 ${reviews.length} 条（今日新增 ${todayCount} 条）`;

    if (reviews.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>暂无风险评价</p>
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

    const keywordTags = review.keywords.map(kw =>
      `<span class="keyword-tag">${kw}</span>`
    ).join('');

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
          <div class="risk-tags">${tags}</div>
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
    const storeFilter = document.getElementById('storeSelect').value;

    let reviews = [...AppData.reviews].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (statusFilter !== 'all') {
      reviews = reviews.filter(r => r.status === statusFilter);
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
    if (review.rating !== null) {
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

    const keywordTags = review.keywords.map(kw =>
      `<span class="keyword-tag">${kw}</span>`
    ).join('');

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

    const saveNoteBtn = document.getElementById('saveNoteBtn');
    if (saveNoteBtn) {
      saveNoteBtn.addEventListener('click', () => {
        const note = document.getElementById('handleNote').value;
        AppData.updateReviewStatus(id, review.status, note);
        this.showToast('记录已保存');
      });
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

    AppData.addDraft({
      content,
      category: this.currentCategory,
      tone: this.currentTone,
      categoryName: ReplyTemplates.categories[this.currentCategory].name,
      toneName: ReplyTemplates.tones[this.currentTone].name
    });

    this.renderDraftList();
    this.showToast('草稿已保存');
  },

  renderDraftList() {
    const container = document.getElementById('draftList');

    if (AppData.drafts.length === 0) {
      container.innerHTML = '<p class="empty-text">暂无历史草稿</p>';
      return;
    }

    container.innerHTML = AppData.drafts.slice(0, 5).map(draft => `
      <div class="draft-item" data-id="${draft.id}">
        <div class="draft-header">
          <span class="draft-category">${draft.categoryName}</span>
          <span class="draft-tone">${draft.toneName}</span>
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
    container.innerHTML = AppData.config.keywords.map(kw =>
      `<span class="keyword-tag">${kw}</span>`
    ).join('');
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
    AppData.saveConfig();

    this.updateStoreSelector();
    this.updateTemplateContent();
    this.closeConfigModal();
    this.showToast('配置已保存');
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
