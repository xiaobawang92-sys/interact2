/**
 * 认识金乡大蒜 · Apple 3D 叠放卡片空间科普交互控制器
 * 纯粹面向科普展陈：5 卡对称 3D 空间卡片墙 + 底部章节液态玻璃导航 Dock + 深度科普工作台
 */
(function initDeckApp() {
  'use strict';

  const app = document.getElementById('app');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const infoModal = document.getElementById('info-modal');
  const assetRoot = '素材/';

  const partPoints = [
    { x: 655, y: 291, side: 'right', pinY: 22, lineEnd: 825, zoom: '78% 52%', observation: '观察整头轮廓与蒜瓣环绕紧实度' },
    { x: 702, y: 252, side: 'right', pinY: 45, lineEnd: 842, zoom: '85% 44%', observation: '观察外层偏白蒜皮的致密纹理' },
    { x: 599, y: 369, side: 'right', pinY: 73, lineEnd: 842, zoom: '67% 65%', observation: '比较整头与掰开后的饱满蒜瓣' },
    { x: 279, y: 249, side: 'left',  pinY: 36, lineEnd: 175, zoom: '10% 44%', observation: '定位蒜头底部扁圆形根盘结构' },
  ];

  const tradeShorts = ['按径分级', '恒温抑芽', '内陆通关', '海运防护', '远销全球'];

  const state = {
    mode: 'idle',        // 'idle' 待机页 | 'deck' 3D卡片墙 | 'detail' 深度科普页
    activeCard: 1,       // 3D卡片墙默认居中「02 一头金乡蒜」
    metricIdx: 0,
    partIdx: 0,
    partMode: 'anatomy',
    gradeIdx: 2,
    growthIdx: 0,
    foodIdx: 0,
    foodStep: 0,
    tradeIdx: 0,
    destIdx: 0,
  };

  let dragStartX = null;
  let dragMoved = false;
  let wheelLock = 0;

  const num = i => String(i + 1).padStart(2, '0');
  const photo = (file, alt = '', extra = '') => `<img src="${assetRoot + file}" alt="${alt}" ${extra}>`;

  const icons = {
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></svg>`,
    zoom: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`,
  };

  function zoomBtn(file, caption) {
    const safe = String(caption || '').replace(/"/g, '&quot;');
    return `<button class="zoom-orb" type="button" data-zoom-src="${assetRoot + file}" data-zoom-caption="${safe}" aria-label="放大查看原图">${icons.zoom}</button>`;
  }

  /* 精准 5 卡循环扇形槽位 (-2, -1, 0, +1, +2) */
  function cardOffset(index) {
    const total = deckCards.length;
    let diff = (index - state.activeCard) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return String(diff);
  }

  const foodSubtitles = ['原形鲜食 · 产区直供', '去皮薄切 · 控水锁香', '精磨细筛 · 复合调味', '控温熟化 · 软糯酸甜'];

  function insightCard(title, body) {
    return `<div class="insight-callout"><strong>${title}</strong><p>${body}</p></div>`;
  }

  /* ========================================================================
     视图 0：Apple 空间待机封面页
     ======================================================================== */
  function renderIdleStage() {
    return `<div class="idle-stage">
      <div class="idle-copy">
        <span class="idle-eyebrow"><span class="idle-dot"></span>国家地理标志产品 · 中欧 10+10 国际互认</span>
        <h1 class="idle-title">
          认识金乡大蒜
          <span>两千年风土积淀 · 一头白皮蒜的世界坐标</span>
        </h1>
        <div class="idle-kpis">
          <div class="idle-kpi glass-tile"><strong>2,000+年</strong><small>东汉至今种植史</small></div>
          <div class="idle-kpi glass-tile"><strong>218.19亿</strong><small>区域公用品牌价值</small></div>
          <div class="idle-kpi glass-tile"><strong>480万吨</strong><small>骨干冷链总储量</small></div>
          <div class="idle-kpi glass-tile"><strong>170+</strong><small>出口国家与地区</small></div>
        </div>
        <div class="idle-cta-row">
          <button class="idle-start-btn" type="button" data-action="go-deck">
            轻触进入 3D 科普展厅 <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <button class="idle-stack-btn" type="button" data-action="go-deck" aria-label="轻触进入 3D 科普卡片墙">
        <div class="idle-preview-card card-left">${photo('field.jpg', '金乡蒜田')}<span>四季农时</span></div>
        <div class="idle-preview-card card-right">${photo('sorting.jpg', '冷链出口')}<span>全球远行</span></div>
        <div class="idle-preview-card card-front">${photo('bulb-shop4.jpg', '金乡白皮蒜')}<span>一头金乡蒜 · 轻触探索</span></div>
      </button>
    </div>`;
  }

  /* ========================================================================
     视图 A：3D 叠放科普卡片墙（不重绘 DOM，60fps 3D 丝滑滑移）
     ======================================================================== */
  function renderDeckStage() {
    const current = deckCards[state.activeCard];
    const cardsHtml = deckCards.map((c, i) => {
      const off = cardOffset(i);
      const mediaClass = c.fit === 'contain' ? 'deck-card-media is-contain' : 'deck-card-media';
      return `<button class="deck-card" type="button" data-card-idx="${i}" data-offset="${off}" aria-label="${c.title}：${c.subtitle}">
        <div class="${mediaClass}">
          ${photo(c.cover, c.title)}
          <span class="deck-card-num">${c.num}</span>
          <span class="deck-card-stat">${c.badge}</span>
          <span class="deck-open-hint">点击进入深度科普 ↗</span>
        </div>
        <div class="deck-card-chin">
          <h2>${c.title}</h2>
          <p>${c.subtitle}</p>
        </div>
      </button>`;
    }).join('');

    return `<div class="deck-stage">
      <div class="deck-heading">
        <h1>认识金乡大蒜</h1>
        <p>一瓣蒜，一方水土 · 左右切换或点击中央卡片深入探索</p>
      </div>
      <div class="deck-viewport" id="deck-viewport" aria-label="3D 空间科普卡片（支持点击、拖拽或滚轮切换）">
        ${cardsHtml}
      </div>
      <p class="deck-tagline" id="deck-tagline">${current.tagline}</p>
      <button class="mobile-deck-cta" id="mobile-deck-cta" type="button" data-action="toggle-mode">
        进入「${current.title}」深度探索 ↗
      </button>
    </div>`;
  }

  function syncDeckPositions() {
    const current = deckCards[state.activeCard];
    document.querySelectorAll('.deck-card').forEach(el => {
      el.setAttribute('data-offset', cardOffset(Number(el.dataset.cardIdx)));
    });
    const tagline = document.getElementById('deck-tagline');
    if (tagline) tagline.textContent = current.tagline;
    const mobileCta = document.getElementById('mobile-deck-cta');
    if (mobileCta) mobileCta.textContent = `进入「${current.title}」深度探索 ↗`;

    const tint = document.getElementById('theater-tint');
    if (tint) tint.style.background = current.tint;
    const amb = document.getElementById('theater-ambient-img');
    if (amb) amb.style.backgroundImage = `url("${assetRoot + current.cover}")`;

    const counter = document.getElementById('top-counter');
    if (counter) counter.innerHTML = `<strong>${current.num}</strong> / 05`;

    document.querySelectorAll('.dock-chap-btn').forEach(btn => {
      const idx = Number(btn.dataset.selectCard);
      if (idx === state.activeCard) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
    window.LiquidGlass?.syncSliders?.();
  }

  function stepCard(delta) {
    state.activeCard = (state.activeCard + delta + deckCards.length) % deckCards.length;
    if (state.mode === 'deck') syncDeckPositions();
    else renderFull();
  }

  function selectCard(idx) {
    if (state.mode === 'deck') {
      if (idx === state.activeCard) {
        state.mode = 'detail';
        renderFull();
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        state.activeCard = idx;
        syncDeckPositions();
      }
    } else {
      state.activeCard = idx;
      renderFull();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  /* ========================================================================
     5 大深度科普交互工作台（零滚动、零空白、零裁切）
     ======================================================================== */
  function renderOverviewDetail() {
    const active = macroMetrics[state.metricIdx];
    const radius = 44;
    const circ = 2 * Math.PI * radius;
    const offset = circ * (1 - active.percent / 100);

    const tiles = macroMetrics.map((m, i) => `
      <button class="kpi-card glass-tile" type="button" data-metric="${i}" aria-pressed="${i === state.metricIdx}">
        <div class="kpi-card-top">
          <span class="kpi-badge">${m.badge}</span>
          <span style="color:var(--muted);font-size:0.78em;font-weight:700">${num(i)}</span>
        </div>
        <div class="kpi-num"><strong>${m.value}</strong><span>${m.unit}</span></div>
        <div class="kpi-label">${m.label}</div>
      </button>`).join('');

    const bars = active.bars.map(b => `
      <div>
        <div class="bar-row-head"><span>${b.name}</span><strong>${b.val}</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${b.pct}%"></div></div>
      </div>`).join('');

    const facts = active.facts.map(f => `
      <div class="detail-metric"><small>${f.k}</small><strong>${f.v}</strong></div>`).join('');

    return `<div class="detail-stage"><div class="overview-grid">
      <div class="kpi-matrix" role="group" aria-label="切换产业数据">${tiles}</div>
      <article class="data-inspector glass-window">
        <div class="inspector-top-chart">
          <div class="donut-wrap">
            <svg viewBox="0 0 104 104" aria-hidden="true">
              <defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a2ea"/><stop offset="100%" stop-color="#c5e86c"/></linearGradient></defs>
              <circle class="donut-track" cx="52" cy="52" r="${radius}"/>
              <circle class="donut-fill" cx="52" cy="52" r="${radius}" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>
            </svg>
            <div class="donut-center"><strong>${active.ringTitle}</strong><small>${active.ringSub}</small></div>
          </div>
          <div class="inspector-head"><h3>${active.headline}</h3><p>${active.summary}</p></div>
        </div>
        <div class="metric-bars">${bars}</div>
        ${insightCard(active.insightTitle, active.insightBody)}
        <div class="detail-metrics">${facts}</div>
      </article>
    </div></div>`;
  }

  function renderPartsDetail() {
    const idx = state.partIdx;
    const item = content.parts[idx];
    const obs = partPoints[idx];
    const grade = garlicGrades[state.gradeIdx];

    const lines = partPoints.map(({ x, y, side, pinY, lineEnd }, i) => {
      const py = (pinY / 100) * 567;
      const elbowX = side === 'left' ? x - 34 : x + 30;
      const cls = i === idx ? 'is-active' : '';
      return `<path class="${cls}" d="M${lineEnd} ${py.toFixed(1)} H${elbowX} L${x} ${y}"/>
        <circle class="dot-pulse ${cls}" cx="${x}" cy="${y}" r="9"/>
        <circle class="dot-core ${cls}" cx="${x}" cy="${y}" r="8"/>`;
    }).join('');

    const pins = partPoints.map(({ side, pinY }, i) => {
      const pos = side === 'right' ? `right:3.5%;top:${pinY}%` : `left:3.5%;top:${pinY}%`;
      return `<button class="pin" type="button" style="${pos}" data-part="${i}" aria-pressed="${i === idx}">${content.parts[i].tab}</button>`;
    }).join('');

    const gradeBtns = garlicGrades.map((g, i) => `
      <button class="grade-pill" type="button" data-grade="${i}" aria-pressed="${i === state.gradeIdx}">${g.size}</button>`).join('');

    const rightBody = state.partMode === 'anatomy'
      ? `<div class="loupe-header">
          <div class="zoom-loupe" style="background-position:${obs.zoom}" aria-hidden="true"></div>
          <div class="loupe-info">
            <small>OPTICAL LOUPE · 光学局部放大</small>
            <strong>${item.tab} · ${item.tag}</strong>
            <span>${obs.observation}</span>
          </div>
        </div>
        <div class="inspector-copy"><h3>${item.title}</h3>${item.text.map(p => `<p>${p}</p>`).join('')}</div>
        ${insightCard(item.calloutTitle, item.calloutBody)}
        <div class="spec-chips">${item.specs.map(s => `<span class="spec-chip">${s}</span>`).join('')}</div>`
      : `<div class="reaction-card">
          <div class="reaction-title">大蒜素（Allicin）酶促风味生成机理</div>
          <div class="reaction-flow">
            <div class="chem-node"><strong>蒜氨酸</strong><small>Alliin</small></div>
            <span class="chem-op">+</span>
            <div class="chem-node"><strong>蒜氨酸酶</strong><small>切碎释放</small></div>
            <span class="chem-op">→</span>
            <div class="chem-node is-result"><strong>大蒜素</strong><small>辛辣与抑菌活性</small></div>
          </div>
        </div>
        <div class="telemetry-card">
          <div class="telemetry-head"><span>核心营养与功能活性指标</span><span>20+ 种营养成分</span></div>
          <div class="metric-bars">${nutritionSpecs.map(n => `
            <div>
              <div class="bar-row-head"><span>${n.name}</span><strong>${n.value}</strong></div>
              <div class="bar-track"><div class="bar-fill" style="width:${n.pct}%"></div></div>
              <div style="font-size:0.72em;color:var(--muted);margin-top:2px">${n.note}</div>
            </div>`).join('')}</div>
        </div>
        <div class="insight-callout" style="margin-top:auto"><strong>国家地理标志品质特征</strong><p>金乡白皮蒜个大皮白、头圆瓣匀、汁鲜味浓、耐储藏，富含天然硒、锗及大蒜多糖。</p></div>`;

    return `<div class="detail-stage"><div class="parts-grid">
      <div class="specimen-panel glass-window">
        <div class="specimen-stage-box">
          <div class="specimen-inner">
            ${photo('bulb-shop4.jpg', '金乡白皮蒜标本', 'class="specimen-image"')}
            <svg class="wires" viewBox="0 0 1000 567" aria-hidden="true">${lines}</svg>
            ${pins}
          </div>
          ${zoomBtn('bulb-shop4.jpg', photoCredits.bulb)}
        </div>
        <div class="grade-bar">
          <div class="grade-pills" role="group" aria-label="出口横径分级">${gradeBtns}</div>
          <div class="grade-note"><strong>${grade.tag}</strong>${grade.desc}</div>
        </div>
      </div>

      <article class="detail-glass glass-window">
        <div>
          <div class="apple-segment glass-pill" role="group" aria-label="切换观察视角">
            <span class="lg-slider-pill" aria-hidden="true"></span>
            <button class="seg-btn" type="button" data-part-mode="anatomy" aria-pressed="${state.partMode === 'anatomy'}">形态结构解剖</button>
            <button class="seg-btn" type="button" data-part-mode="science" aria-pressed="${state.partMode === 'science'}">营养与风味科学</button>
          </div>
        </div>
        ${rightBody}
      </article>
    </div></div>`;
  }

  function renderGrowthDetail() {
    const idx = state.growthIdx;
    const total = content.growth.length;
    const item = content.growth[idx];
    const prev = (idx - 1 + total) % total;
    const next = (idx + 1) % total;

    const timeline = content.growth.map((s, i) => `
      <button class="timeline-tile glass-tile" type="button" data-growth="${i}" aria-pressed="${i === idx}">
        ${photo(s.image, s.tab, s.focus ? `style="object-position:${s.focus}"` : '')}
        <div><small>${num(i)} · ${s.tag.split(' · ')[0]}</small><strong>${s.tab}</strong></div>
      </button>`).join('');

    const gauges = item.gauges.map(g => `
      <div>
        <div class="bar-row-head"><span>${g.name}</span><strong>${g.val}</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${g.pct}%"></div></div>
      </div>`).join('');

    const metrics = item.metrics.map(m => `<div class="detail-metric"><small>${m.k}</small><strong>${m.v}</strong></div>`).join('');

    return `<div class="detail-stage"><div class="growth-workspace">
      <div class="growth-main">
        <div class="photo-glass-card glass-window">
          <div class="photo-viewport">
            ${photo(item.image, item.alt || item.tab, item.focus ? `style="object-position:${item.focus}"` : '')}
            <span class="photo-pill-tl">${num(idx)} / 05 · ${item.tag}</span>
            ${zoomBtn(item.image, `${item.tab} · ${item.credit}`)}
            <div class="photo-arrows-br">
              <button class="arrow-orb" type="button" data-growth="${prev}" aria-label="上一阶段">←</button>
              <button class="arrow-orb" type="button" data-growth="${next}" aria-label="下一阶段">→</button>
            </div>
          </div>
          <div class="photo-tip-bl"><strong>看图提示</strong>${item.observation}</div>
        </div>
        <article class="detail-glass glass-window">
          <div>
            <span class="kicker-pill">${item.tag}</span>
            <div class="inspector-copy" style="margin-top:8px"><h3>${item.title}</h3>${item.text.map(p => `<p>${p}</p>`).join('')}</div>
          </div>
          <div class="telemetry-card">
            <div class="telemetry-head"><span>240 天跨年农时生长进度</span><span>${item.dayRange}</span></div>
            <div class="cycle-progress"><div class="cycle-progress-fill" style="width:${item.progress}%"></div></div>
            <div class="metric-bars">${gauges}</div>
          </div>
          ${insightCard(item.noteTitle, item.noteBody)}
          <div class="detail-metrics">${metrics}</div>
        </article>
      </div>
      <nav class="timeline-bar" aria-label="切换农时阶段">${timeline}</nav>
    </div></div>`;
  }

  function renderFoodDetail() {
    const idx = state.foodIdx;
    const stepIdx = state.foodStep;
    const item = content.food[idx];
    const steps = foodProcesses[idx];
    const [stepTitle, stepText, stepImg, dish] = steps[stepIdx] || steps[0];

    const prodShelf = content.food.map((f, i) => `
      <button class="food-shelf-btn glass-tile" type="button" data-food="${i}" aria-pressed="${i === idx}">
        <img class="food-shelf-thumb" src="${assetRoot + f.image}" alt="${f.tab}">
        <span class="food-shelf-meta">
          <strong>${f.tab}</strong>
          <small>${foodSubtitles[i] || f.tag}</small>
        </span>
        <span class="food-shelf-dot" aria-hidden="true"></span>
      </button>`).join('');

    const compareHtml = idx === 0
      ? `<div class="compare-pair">
          <div class="compare-box">${photo('金乡晾晒.jpg', '金乡新蒜晾晒')}${zoomBtn('金乡晾晒.jpg', '收获后 · 摊开晾晒')}<span class="compare-tag">收获后 · 摊开晾晒</span></div>
          <div class="compare-box">${photo('加工车间.jpg', '加工车间')}${zoomBtn('加工车间.jpg', '金乡鑫诺蒜制品生产车间')}<span class="compare-tag">车间 · 整理与加工</span></div>
        </div>`
      : `<div class="compare-pair">
          <div class="compare-box is-product">${photo(item.compare, item.before)}${zoomBtn(item.compare, item.before)}<span class="compare-tag">${item.before}</span></div>
          <span class="compare-orb" aria-hidden="true">→</span>
          <div class="compare-box is-product">${photo(item.image, item.tab)}${zoomBtn(item.image, `成品 · ${item.tab}`)}<span class="compare-tag">成品 · ${item.tab}</span></div>
        </div>`;

    const stepBtns = steps.map(([label], i) => `
      <button class="proc-tab" type="button" data-food-step="${i}" aria-pressed="${i === stepIdx}">${num(i)} ${label}</button>`).join('');

    const profile = item.profile.map(p => `
      <div>
        <div class="bar-row-head"><span>${p.name}</span><strong>${p.val}</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${p.pct}%"></div></div>
      </div>`).join('');

    const specs = item.specs.map(s => `<div class="detail-metric"><small>${s.k}</small><strong>${s.v}</strong></div>`).join('');

    return `<div class="detail-stage"><div class="food-workspace">
      <div class="food-shelf" role="group" aria-label="选择蒜制品形态">
        ${prodShelf}
      </div>
      <div class="food-main">
        <div class="food-left-col glass-window">
          ${compareHtml}
          <div class="process-box">
            <div class="process-tabs" role="group" aria-label="工序切换">${stepBtns}</div>
            <div class="process-card-inner">
              ${photo(stepImg, dish || stepTitle)}
              <div><strong>${stepTitle}${dish ? ` · ${dish}` : ''}</strong><p>${stepText}</p></div>
            </div>
          </div>
        </div>
        <article class="detail-glass glass-window">
          <div>
            <span class="kicker-pill">${item.tab} · 工艺科学</span>
            <div class="inspector-copy" style="margin-top:8px"><h3>${item.title}</h3>${item.text.map(p => `<p>${p}</p>`).join('')}</div>
          </div>
          <div class="telemetry-card">
            <div class="telemetry-head"><span>风味与加工形态特征图谱</span><span>${item.tab}</span></div>
            <div class="metric-bars">${profile}</div>
          </div>
          ${insightCard('典型应用场景', item.usageNote)}
          <div class="detail-metrics">${specs}</div>
        </article>
      </div>
    </div></div>`;
  }

  function renderTradeDetail() {
    const idx = state.tradeIdx;
    const dIdx = state.destIdx;
    const total = content.trade.length;
    const item = content.trade[idx];
    const prev = (idx - 1 + total) % total;
    const next = (idx + 1) % total;

    const rail = content.trade.map((t, i) => `
      <button class="trade-step glass-tile" type="button" data-trade="${i}" aria-pressed="${i === idx}">
        <span class="trade-num">${num(i)}</span>
        <div><strong>${t.tab}</strong><small>${tradeShorts[i]}</small></div>
      </button>`).join('');

    const activeData = item.map && destinations[dIdx] ? destinations[dIdx] : item;
    let centerHtml = '';
    if (item.map) {
      const points = [[60.97, 21.55], [45.2, 46.01], [46.7, 93.26]];
      const markers = destinations.map((d, i) => `
        <button class="map-point" type="button" style="left:${points[i][0]}%;top:${points[i][1]}%" data-dest="${i}" aria-label="查看${d.name}" aria-pressed="${i === dIdx}"></button>`).join('');
      const pills = destinations.map((d, i) => `
        <button class="dest-pill" type="button" data-dest="${i}" aria-pressed="${i === dIdx}">${d.name}</button>`).join('');
      centerHtml = `<div class="photo-glass-card glass-window">
        <div class="map-stage-wrap"><div class="map-inner">${photo('出口目的地.png', '出口贸易联系地图')}${markers}</div></div>
        <div class="dest-row"><div class="dest-pills" role="group">${pills}</div><span style="font-size:0.74em;color:var(--muted)">点击光点切换出口案例</span></div>
      </div>`;
    } else {
      centerHtml = `<div class="photo-glass-card glass-window">
        <div class="photo-viewport">
          ${photo(item.image, item.alt || item.tab)}
          <span class="photo-pill-tl">${item.tag}</span>
          ${zoomBtn(item.image, `${item.tab} · ${item.credit}`)}
          <div class="photo-arrows-br">
            <button class="arrow-orb" type="button" data-trade="${prev}" aria-label="上一环节">←</button>
            <button class="arrow-orb" type="button" data-trade="${next}" aria-label="下一环节">→</button>
          </div>
        </div>
      </div>`;
    }

    const chainNames = ['分选', '冷储', '检疫', '包装', '出海'];
    const chainHtml = chainNames.map((label, i) => `<div class="chain-node ${i < idx ? 'is-done' : i === idx ? 'is-now' : ''}">${label}</div>`).join('');
    const highlights = (activeData.highlights || item.highlights).map(h => `
      <div>
        <div class="bar-row-head"><span>${h.name}</span><strong>${h.val}</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${h.pct}%"></div></div>
      </div>`).join('');
    const specs = (activeData.specs || item.specs).map(s => `<div class="detail-metric"><small>${s.k}</small><strong>${s.v}</strong></div>`).join('');

    return `<div class="detail-stage"><div class="trade-workspace">
      <nav class="trade-rail" aria-label="出口流程五步">${rail}</nav>
      ${centerHtml}
      <article class="detail-glass glass-window">
        <div>
          <span class="kicker-pill">${activeData.tag}</span>
          <div class="inspector-copy" style="margin-top:8px"><h3>${activeData.title}</h3>${activeData.text.map(p => `<p>${p}</p>`).join('')}</div>
        </div>
        <div class="telemetry-card">
          <div class="telemetry-head"><span>跨境冷链出口链路追踪</span><span>环节 ${num(idx)} / 05</span></div>
          <div class="chain-tracker">${chainHtml}</div>
          <div class="metric-bars">${highlights}</div>
        </div>
        ${insightCard(activeData.noteTitle || item.noteTitle, activeData.noteBody || item.noteBody)}
        <div class="detail-metrics">${specs}</div>
      </article>
    </div></div>`;
  }

  function renderActiveDetail() {
    const id = deckCards[state.activeCard].id;
    switch (id) {
      case 'overview': return renderOverviewDetail();
      case 'parts':    return renderPartsDetail();
      case 'growth':   return renderGrowthDetail();
      case 'food':     return renderFoodDetail();
      case 'trade':    return renderTradeDetail();
      default:         return renderOverviewDetail();
    }
  }

  /* ========================================================================
     整体展陈剧场渲染（纯粹科普交互 Dock，彻底去除音乐播放器元素）
     ======================================================================== */
  function renderFull() {
    const current = deckCards[state.activeCard];
    const isPearl = window.LiquidGlass?.getTheme?.() === 'pearl';

    const chapterTabs = deckCards.map((c, i) => `
      <button class="dock-chap-btn" type="button" data-select-card="${i}" ${i === state.activeCard ? 'aria-current="true"' : ''}>
        <span class="chap-num">${c.num}</span>${c.short}
      </button>`).join('');

    const stageHtml = state.mode === 'idle'
      ? renderIdleStage()
      : state.mode === 'deck'
        ? renderDeckStage()
        : renderActiveDetail();

    const dockHtml = state.mode === 'idle'
      ? ''
      : `<footer class="vision-dock-row">
          <button class="dock-arrow-orb glass-orb" type="button" data-action="prev-card" aria-label="上一科普主题" title="上一主题">←</button>
          <nav class="vision-dock" aria-label="科普主题切换">
            <div class="dock-chapters">
              <span class="lg-slider-pill" aria-hidden="true"></span>
              ${chapterTabs}
            </div>
          </nav>
          <button class="dock-arrow-orb glass-orb" type="button" data-action="next-card" aria-label="下一科普主题" title="下一主题">→</button>
          <button class="dock-cta-pill" type="button" data-action="toggle-mode">
            ${state.mode === 'deck' ? '进入本章探索 ↗' : '返回 3D 卡片'}
          </button>
        </footer>`;

    app.innerHTML = `<section class="theater-shell">
      <div id="theater-ambient-img" class="theater-ambient-img" style="background-image:url('${assetRoot + (state.mode === 'idle' ? 'field.jpg' : current.cover)}')"></div>
      <div id="theater-tint" class="theater-tint" style="background:${current.tint}"></div>

      <header class="theater-topbar">
        <div class="top-group">
          <button class="brand-pill glass-pill glass-refract-pill" type="button" data-action="go-idle" aria-label="返回待机封面">
            <span class="brand-logo-chip">${photo('logo.png', '金乡大蒜节')}</span>
            <span class="brand-meta">科普交互展屏</span>
          </button>
          ${state.mode === 'deck'
            ? `<button class="pill-btn glass-pill glass-refract-pill" type="button" data-action="go-idle">← 待机封面</button>`
            : state.mode === 'detail'
              ? `<button class="pill-btn glass-pill glass-refract-pill" type="button" data-action="go-deck">← 返回 3D 卡片墙</button>`
              : ''}
        </div>
        <div class="top-group">
          ${state.mode !== 'idle' ? `<span id="top-counter" class="counter-pill glass-pill"><strong>${current.num}</strong> / 05</span>` : ''}
          <button class="pill-btn glass-pill glass-refract-pill" type="button" data-action="toggle-theme" aria-label="切换暮紫或柔光玻璃外观">
            ${isPearl ? icons.moon : icons.sun}<span>${isPearl ? '暮紫玻璃' : '柔光玻璃'}</span>
          </button>
          <button class="top-icon-orb glass-orb" type="button" data-action="open-info" aria-label="查看数据与素材出处" title="数据与出处">
            ${icons.info}
          </button>
        </div>
      </header>

      <main class="theater-center">
        ${stageHtml}
      </main>

      ${dockHtml}
    </section>`;

    window.LiquidGlass?.syncSliders?.();
  }

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || '高清实拍图';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.hidden = false;
  }

  function closeModals() {
    if (lightbox) lightbox.hidden = true;
    if (infoModal) infoModal.hidden = true;
  }

  /* ========================================================================
     交互事件：点击、3D 拖拽滑动、滚轮切换、键盘导航
     ======================================================================== */
  let touchStartX = null;
  let touchStartY = null;

  app.addEventListener('touchstart', event => {
    const vp = event.target.closest('#deck-viewport');
    if (!vp || event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    dragMoved = false;
  }, { passive: true });

  app.addEventListener('touchmove', event => {
    if (touchStartX === null || event.touches.length !== 1) return;
    const dx = event.touches[0].clientX - touchStartX;
    const dy = event.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      dragMoved = true;
      stepCard(dx < 0 ? 1 : -1);
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }
  }, { passive: true });

  app.addEventListener('touchend', () => {
    touchStartX = null;
    touchStartY = null;
    setTimeout(() => { dragMoved = false; }, 80);
  }, { passive: true });

  app.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') return;
    const vp = event.target.closest('#deck-viewport');
    if (!vp) return;
    dragStartX = event.clientX;
    dragMoved = false;
  });

  window.addEventListener('pointermove', event => {
    if (dragStartX === null) return;
    const dx = event.clientX - dragStartX;
    if (Math.abs(dx) > 46) {
      dragMoved = true;
      stepCard(dx < 0 ? 1 : -1);
      dragStartX = event.clientX;
    }
  });

  window.addEventListener('pointerup', () => {
    dragStartX = null;
    setTimeout(() => { dragMoved = false; }, 60);
  });

  app.addEventListener('wheel', event => {
    if (state.mode !== 'deck') return;
    const vp = event.target.closest('#deck-viewport');
    if (!vp) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 16) return;
    event.preventDefault();
    const now = Date.now();
    if (now - wheelLock < 280) return;
    wheelLock = now;
    stepCard(delta > 0 ? 1 : -1);
  }, { passive: false });

  app.addEventListener('click', event => {
    if (dragMoved) return;
    const t = event.target;

    const actionEl = t.closest('[data-action]');
    if (actionEl) {
      const act = actionEl.dataset.action;
      if (act === 'prev-card') { stepCard(-1); return; }
      if (act === 'next-card') { stepCard(1); return; }
      if (act === 'go-idle') {
        if (state.mode !== 'idle') { state.mode = 'idle'; renderFull(); }
        return;
      }
      if (act === 'go-deck') {
        if (state.mode !== 'deck') { state.mode = 'deck'; renderFull(); }
        return;
      }
      if (act === 'toggle-mode') {
        state.mode = state.mode === 'deck' ? 'detail' : 'deck';
        renderFull();
        return;
      }
      if (act === 'toggle-theme') {
        window.LiquidGlass?.toggleTheme?.();
        renderFull();
        return;
      }
      if (act === 'open-info') {
        if (infoModal) infoModal.hidden = false;
        return;
      }
    }

    const jumpDetailBtn = t.closest('[data-jump-detail]');
    if (jumpDetailBtn) {
      state.activeCard = Number(jumpDetailBtn.dataset.jumpDetail);
      state.mode = 'detail';
      renderFull();
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const selectBtn = t.closest('[data-select-card]');
    if (selectBtn) {
      selectCard(Number(selectBtn.dataset.selectCard));
      return;
    }

    const cardEl = t.closest('.deck-card');
    if (cardEl) {
      selectCard(Number(cardEl.dataset.cardIdx));
      return;
    }

    const zoomEl = t.closest('[data-zoom-src]');
    if (zoomEl) {
      openLightbox(zoomEl.dataset.zoomSrc, zoomEl.dataset.zoomCaption);
      return;
    }

    const metricBtn = t.closest('[data-metric]');
    if (metricBtn) { state.metricIdx = Number(metricBtn.dataset.metric); renderFull(); return; }

    const partBtn = t.closest('[data-part]');
    if (partBtn) { state.partIdx = Number(partBtn.dataset.part); state.partMode = 'anatomy'; renderFull(); return; }

    const partModeBtn = t.closest('[data-part-mode]');
    if (partModeBtn) { state.partMode = partModeBtn.dataset.partMode; renderFull(); return; }

    const gradeBtn = t.closest('[data-grade]');
    if (gradeBtn) { state.gradeIdx = Number(gradeBtn.dataset.grade); renderFull(); return; }

    const growthBtn = t.closest('[data-growth]');
    if (growthBtn) { state.growthIdx = Number(growthBtn.dataset.growth); renderFull(); return; }

    const foodBtn = t.closest('[data-food]');
    if (foodBtn) { state.foodIdx = Number(foodBtn.dataset.food); state.foodStep = 0; renderFull(); return; }

    const foodStepBtn = t.closest('[data-food-step]');
    if (foodStepBtn) { state.foodStep = Number(foodStepBtn.dataset.foodStep); renderFull(); return; }

    const tradeBtn = t.closest('[data-trade]');
    if (tradeBtn) { state.tradeIdx = Number(tradeBtn.dataset.trade); renderFull(); return; }

    const destBtn = t.closest('[data-dest]');
    if (destBtn) { state.tradeIdx = 4; state.destIdx = Number(destBtn.dataset.dest); renderFull(); }
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-close-modal]')) closeModals();
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!lightbox?.hidden || !infoModal?.hidden) { closeModals(); return; }
      if (state.mode === 'detail') { state.mode = 'deck'; renderFull(); }
      else if (state.mode === 'deck') { state.mode = 'idle'; renderFull(); }
      return;
    }
    if (!lightbox?.hidden || !infoModal?.hidden) return;
    if (state.mode === 'idle' && (event.key === 'Enter' || event.key === ' ')) {
      state.mode = 'deck';
      renderFull();
      return;
    }
    if (state.mode === 'idle') return;
    if (event.key === 'ArrowLeft') stepCard(-1);
    else if (event.key === 'ArrowRight') stepCard(1);
    else if (event.key === 'Enter' && state.mode === 'deck') {
      state.mode = 'detail';
      renderFull();
    }
  });

  window.addEventListener('resize', () => window.LiquidGlass?.syncSliders?.(), { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(() => window.LiquidGlass?.syncSliders?.(), 180));
  window.addEventListener('load', () => window.LiquidGlass?.syncSliders?.());

  /* 支持扫码直达指定章节（如 #parts / #growth / #food / #trade / #deck） */
  const hashTarget = location.hash.slice(1).split(':')[0];
  if (hashTarget === 'deck') {
    state.mode = 'deck';
  } else {
    const matchedIdx = deckCards.findIndex(c => c.id === hashTarget);
    if (matchedIdx >= 0) {
      state.activeCard = matchedIdx;
      state.mode = 'detail';
    }
  }

  window.LiquidGlass?.init?.();
  renderFull();
})();
