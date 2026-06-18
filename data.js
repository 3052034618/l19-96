const AppData = {
  config: {
    storeName: '',
    addresses: [],
    items: [],
    keywords: ['卫生', '欺诈', '态度差', '排队久', '难吃', '贵', '不新鲜', '服务差', '不干净', '套路', '坑', '失望']
  },

  reviews: [],

  drafts: [],

  init() {
    this.loadConfig();
    this.loadReviews();
    this.loadDrafts();
    if (this.reviews.length === 0) {
      this.generateMockData();
    }
  },

  loadConfig() {
    const saved = localStorage.getItem('rg_config');
    if (saved) {
      this.config = { ...this.config, ...JSON.parse(saved) };
    }
  },

  saveConfig() {
    localStorage.setItem('rg_config', JSON.stringify(this.config));
  },

  loadReviews() {
    const saved = localStorage.getItem('rg_reviews');
    if (saved) {
      this.reviews = JSON.parse(saved);
    }
  },

  saveReviews() {
    localStorage.setItem('rg_reviews', JSON.stringify(this.reviews));
  },

  loadDrafts() {
    const saved = localStorage.getItem('rg_drafts');
    if (saved) {
      this.drafts = JSON.parse(saved);
    }
  },

  saveDrafts() {
    localStorage.setItem('rg_drafts', JSON.stringify(this.drafts));
  },

  generateMockData() {
    const today = new Date();
    const platforms = [
      { id: 'dianping', name: '大众点评', icon: '📋' },
      { id: 'waimai', name: '外卖平台', icon: '🛵' },
      { id: 'video', name: '短视频探店', icon: '📱' },
      { id: 'community', name: '本地社群', icon: '👥' }
    ];

    const mockReviews = [
      {
        id: 'r001',
        platform: 'dianping',
        platformName: '大众点评',
        store: '味道轩中餐厅（人民路店）',
        rating: 2,
        content: '环境真的很一般，地面有油腻感。点了招牌红烧肉，味道还行但是上菜太慢了，等了快一个小时。服务员态度也不好，叫了半天没人理。',
        keywords: ['态度差', '排队久'],
        likes: 23,
        sharedByInfluencer: false,
        hasEvidence: false,
        author: '美食小白',
        date: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        riskLevel: 'high',
        handleNote: ''
      },
      {
        id: 'r002',
        platform: 'waimai',
        platformName: '外卖平台',
        store: '味道轩中餐厅（开发区店）',
        rating: 1,
        content: '太恶心了！吃出来一根头发！直接整个人都不好了，已经申请退款加投诉。大家千万别点这家，卫生太差了！',
        keywords: ['卫生', '不干净'],
        likes: 5,
        sharedByInfluencer: false,
        hasEvidence: true,
        author: '匿名用户',
        date: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        riskLevel: 'high',
        handleNote: ''
      },
      {
        id: 'r003',
        platform: 'video',
        platformName: '短视频探店',
        store: '味道轩中餐厅（人民路店）',
        rating: 3,
        content: '探店实拍，这家店网上评分挺高的，实际去了感觉一般般。等座等了40分钟，菜的分量也不大。不会二刷的类型。',
        keywords: ['排队久', '失望'],
        likes: 156,
        sharedByInfluencer: true,
        influencerName: '本地美食探店',
        hasEvidence: true,
        author: '本地美食探店',
        date: new Date(today.getTime() - 8 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        riskLevel: 'high',
        handleNote: ''
      },
      {
        id: 'r004',
        platform: 'community',
        platformName: '本地社群',
        store: '味道轩中餐厅（步行街店）',
        rating: null,
        content: '曝光一家黑店！昨天在味道轩吃饭，结账的时候发现多收了钱，问服务员还说就是这个价，感觉被套路了。大家避坑！',
        keywords: ['欺诈', '套路', '坑'],
        likes: 67,
        sharedByInfluencer: false,
        hasEvidence: false,
        author: '路人甲',
        date: new Date(today.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        riskLevel: 'high',
        handleNote: ''
      },
      {
        id: 'r005',
        platform: 'dianping',
        platformName: '大众点评',
        store: '味道轩中餐厅（开发区店）',
        rating: 3,
        content: '中规中矩吧，价格有点小贵。酸菜鱼还可以，但是其他菜就一般了。环境有点吵，不适合聊天。',
        keywords: ['贵'],
        likes: 8,
        sharedByInfluencer: false,
        hasEvidence: false,
        author: '食客一枚',
        date: new Date(today.getTime() - 15 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        riskLevel: 'medium',
        handleNote: ''
      },
      {
        id: 'r006',
        platform: 'waimai',
        platformName: '外卖平台',
        store: '味道轩中餐厅（人民路店）',
        rating: 2,
        content: '送过来的时候都凉了，而且饭给的特别少。联系商家也没回复，差评！',
        keywords: ['服务差', '失望'],
        likes: 3,
        sharedByInfluencer: false,
        hasEvidence: false,
        author: '饿了的打工人',
        date: new Date(today.getTime() - 20 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        riskLevel: 'low',
        handleNote: ''
      },
      {
        id: 'r007',
        platform: 'dianping',
        platformName: '大众点评',
        store: '味道轩中餐厅（步行街店）',
        rating: 4,
        content: '总体来说还不错，就是周末人太多，排了半小时队。味道可以，服务也还行，下次还会来。',
        keywords: ['排队久'],
        likes: 12,
        sharedByInfluencer: false,
        hasEvidence: false,
        author: '吃货小王',
        date: new Date(today.getTime() - 36 * 60 * 60 * 1000).toISOString(),
        status: 'misunderstanding',
        riskLevel: 'low',
        handleNote: '正面评价附带排队建议，已标记为误会，不影响口碑。'
      }
    ];

    this.reviews = mockReviews;
    this.saveReviews();

    this.config.storeName = '味道轩中餐厅';
    this.config.addresses = [
      { id: 'a1', name: '人民路店', address: '人民路123号' },
      { id: 'a2', name: '开发区店', address: '开发区科技路45号' },
      { id: 'a3', name: '步行街店', address: '商业步行街88号' }
    ];
    this.config.items = ['招牌红烧肉', '酸菜鱼', '宫保鸡丁', '麻婆豆腐', '清蒸鲈鱼', '扬州炒饭'];
    this.saveConfig();
  },

  getTodayReviews() {
    const today = new Date().toDateString();
    return this.reviews.filter(r => new Date(r.date).toDateString() === today);
  },

  getPendingReviews() {
    return this.reviews.filter(r => r.status === 'pending');
  },

  getReviewsByStatus(status) {
    if (status === 'all') return this.reviews;
    return this.reviews.filter(r => r.status === status);
  },

  getReviewById(id) {
    return this.reviews.find(r => r.id === id);
  },

  updateReviewStatus(id, status, note = '') {
    const review = this.getReviewById(id);
    if (review) {
      review.status = status;
      review.handleNote = note;
      review.handleDate = new Date().toISOString();
      this.saveReviews();
    }
  },

  addDraft(draft) {
    this.drafts.unshift({
      id: 'd' + Date.now(),
      ...draft,
      createdAt: new Date().toISOString()
    });
    this.saveDrafts();
  },

  deleteDraft(id) {
    this.drafts = this.drafts.filter(d => d.id !== id);
    this.saveDrafts();
  }
};

const ReplyTemplates = {
  categories: {
    hygiene: { name: '卫生问题', icon: '🧹' },
    attitude: { name: '服务态度', icon: '😊' },
    wait: { name: '排队/等待', icon: '⏳' },
    taste: { name: '口味/菜品', icon: '🍜' },
    price: { name: '价格争议', icon: '💰' },
    general: { name: '通用致歉', icon: '🙏' }
  },

  tones: {
    sincere: { name: '诚恳道歉', desc: '态度诚恳，勇于承担责任' },
    professional: { name: '专业正式', desc: '专业严谨，有理有据' },
    warm: { name: '亲切温暖', desc: '如朋友般亲切，拉近距离' },
    firm: { name: '坚定理性', desc: '坚定立场，理性回应' }
  },

  templates: {
    hygiene: {
      sincere: `尊敬的顾客，非常抱歉给您带来了不愉快的用餐体验！

您反馈的卫生问题我们高度重视，已立即对门店进行全面检查和整改。食品安全和卫生是我们的底线，出现这样的问题我们深感愧疚。

我们愿意全额退款并赠送您一份代金券，希望能给我们一次弥补的机会。如方便的话，请您私信留下联系方式，我们的店长将亲自与您沟通。

再次向您致以最诚挚的歉意！
—— {店名} 全体员工`,

      professional: `尊敬的顾客您好，感谢您的真实反馈。

对于您反映的卫生问题，我们已启动内部调查程序，对涉及门店进行突击检查。我们严格执行食品安全管理制度，每道菜品都有可追溯记录。

如您方便，请提供更多细节以便我们核实情况，如有确凿证据证明是我们的问题，我们将按照相关规定承担全部责任。

感谢您的监督与反馈。
—— {店名} 客诉处理中心`,

      warm: `亲爱的朋友，看到您的评价我们心里特别难受😔

卫生一直是我们最在意的事情，没想到让您遇到了这种情况，真的对不起！

我们已经全店大检查了，店长也批评教育了所有人。您看方便的时候，能不能再来一次？我们想请您吃顿好的，当面跟您说声对不起。

等您哦~
—— {店名} 小伙伴们`,

      firm: `尊敬的顾客，我们关注到您的反馈。

我们门店每日执行严格的卫生标准，有完整的消毒记录和食材验收流程。对于您描述的情况，我们正在进行核实。

我们欢迎真实的监督和建议，但也请注意，不实言论可能会对商家造成不良影响。如您有相关证据，欢迎提供，我们将认真对待。

—— {店名} 运营部`
    },

    attitude: {
      sincere: `尊敬的顾客，非常抱歉我们的服务让您失望了！

您反馈的服务态度问题我们已经核实，相关服务人员已进行严肃的批评教育和再培训。服务好每一位顾客是我们的宗旨，这次没有做好我们深感抱歉。

希望能给我们一次改进的机会，下次您来用餐，我们一定让您感受到宾至如归的服务。

再次道歉！
—— {店名} 店长`,

      professional: `尊敬的顾客您好，感谢您抽出宝贵时间反馈。

我们对服务人员有明确的服务标准和考核制度，您反映的问题我们已记录在案，并将对涉事门店进行服务质量专项检查。

持续改进服务质量是我们的目标，您的反馈是我们进步的动力。

—— {店名} 客服部`,

      warm: `亲爱的顾客，对不起让您不开心了🥺

我们的小伙伴可能那天状态不好，但是这不应该成为服务不好的理由。店长已经找大家开过会了，以后一定让每位来的客人都暖暖的。

有空再来坐坐呀，我们准备了小甜品给您赔罪~

—— {店名} 大家庭`,

      firm: `尊敬的顾客您好，已收到您的反馈。

我们的服务人员均经过专业培训，有标准化的服务流程。我们会对您描述的情况进行核实，如确有服务不到位之处，我们将按规定处理。

同时也希望顾客与服务人员相互尊重，共同营造良好的用餐环境。

—— {店名} 运营部`
    },

    wait: {
      sincere: `尊敬的顾客，非常抱歉让您久等了！

看到您反馈的等待时间过长的问题，我们深感歉意。我们正在优化点餐和出餐流程，也在增加高峰期的人手配置。

感谢您的耐心和理解，也感谢您选择我们。下次来之前可以提前打电话预约，我们会为您优先安排。

再次为让您久等而道歉！
—— {店名} 全体员工`,

      professional: `尊敬的顾客您好，感谢您的反馈。

用餐高峰期排队等待时间较长的问题我们已经关注到，目前正在推进以下改进措施：
1. 优化点餐系统，提高下单效率
2. 增加厨房人手，缩短出餐时间
3. 提供预约订餐服务

预计两周内将有明显改善，感谢您的理解与支持。

—— {店名} 运营部`,

      warm: `亲爱的朋友，真的不好意思让你等那么久~

最近人确实有点多，我们也在努力招人提速呢。下次来之前可以微信提前跟我们说一声，我们给你留好位置，尽量不让你等太久。

感谢你的包容呀，比心❤️

—— {店名} 小伙伴们`,

      firm: `尊敬的顾客您好。

用餐高峰期可能会有一定的等待时间，我们在门店显眼位置有提示。我们一直在努力提升翻台率，但也要保证每一道菜的品质。

如果您时间比较紧张，建议您错峰用餐或选择外带服务。

感谢您的理解。
—— {店名}`
    },

    taste: {
      sincere: `尊敬的顾客，非常抱歉我们的菜品不合您的口味！

每个人的口味偏好不同，我们理解也尊重您的感受。您有任何具体的建议都可以告诉我们，我们会认真考虑，争取让更多顾客满意。

希望下次能为您带来更好的用餐体验。

—— {店名} 厨师长`,

      professional: `尊敬的顾客您好，感谢您的宝贵意见。

我们的菜品由资深厨师团队研发，有统一的出品标准。口味是很主观的感受，我们会持续优化菜品，也欢迎您提出具体的改进建议。

如有任何问题，欢迎随时与我们联系。

—— {店名} 出品部`,

      warm: `亲爱的朋友，口味这个东西真的很个人呢~

不知道您觉得哪里不太合口味呀？是咸了淡了还是别的？跟我们说说，说不定下次就能调出您喜欢的味道呢。

期待您再来试试别的菜，也许会有惊喜哦😉

—— {店名} 后厨团队`,

      firm: `尊敬的顾客，口味因人而异，我们理解您的感受。

我们的菜品配方经过反复调试，有稳定的出品标准。如果您有特殊的口味需求，点餐时可以告知服务员，我们会尽量满足。

感谢您的尝试。
—— {店名}`
    },

    price: {
      sincere: `尊敬的顾客，非常抱歉让您觉得价格偏高！

我们一直努力在品质和价格之间找平衡，所有食材都是精心挑选的，成本确实不低。但您的反馈我们记在心里了，我们会研究推出一些性价比更高的套餐。

感谢您的坦诚反馈，希望还有机会为您服务。

—— {店名} 店长`,

      professional: `尊敬的顾客您好，感谢您的反馈。

我们的定价基于食材成本、人工成本和运营成本综合制定，确保菜品品质和服务质量。我们也会定期推出优惠活动和会员折扣，欢迎关注。

如您有更好的建议，欢迎提出。

—— {店名} 运营部`,

      warm: `亲爱的朋友，让您觉得贵了真不好意思😅

我们家的食材都是挑好的买，成本确实有点高。不过我们经常有活动的，关注一下下次有优惠告诉你~

要是您常来，可以办个会员，有折扣还积分呢，挺划算的。

—— {店名} 小伙伴`,

      firm: `尊敬的顾客，我们的定价是合理的。

一分钱一分货，我们坚持使用优质食材，保证菜品质量。相比同品质的餐厅，我们的价格是有竞争力的。

我们明码标价，您可以根据自己的预算选择。

—— {店名}`
    },

    general: {
      sincere: `尊敬的顾客，非常抱歉给您带来了不好的体验！

您的反馈我们已认真阅读，每一条建议对我们都很重要。我们会认真反思，努力改进。

希望能给我们一次弥补的机会，欢迎您再次光临，检验我们的改变。

再次向您致歉！
—— {店名} 全体员工`,

      professional: `尊敬的顾客您好，感谢您的宝贵意见。

我们高度重视每一位顾客的反馈，您提出的问题我们将进行专项研究和改进。持续提升顾客满意度是我们的目标。

如有任何问题，欢迎随时联系我们的客服。

—— {店名} 客户服务中心`,

      warm: `亲爱的朋友，对不起让您失望了🥺

看到您的评价我们都挺难过的，我们会努力做得更好的。

有空再来看看吧，说不定会有惊喜呢~有什么不满意的直接找店长，一定给您处理好。

—— {店名} 一家人`,

      firm: `尊敬的顾客您好，感谢您的反馈。

我们关注到您的评价，我们有自己的服务标准和品质要求，同时也尊重每一位顾客的感受。

如您有具体的问题需要解决，欢迎直接联系我们，我们会理性沟通处理。

—— {店名} 运营部`
    }
  },

  getTemplate(category, tone) {
    return this.templates[category]?.[tone] || '';
  }
};
