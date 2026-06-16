import {
  badge,
  buttonHTML,
  chipList,
  createEmptyState,
  createFooter,
  createHeader,
  getImageSrc,
  loadJSON,
  setImageFallback,
  setPageTitle,
  textOrDash,
} from "./app.js";

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function contributionDetail(item) {
  const heroImage = item.image || item.images?.[0] || "";
  const extraImages = (item.images || []).filter((src, index) => src && index > 0);
  return `
    <section class="panel detail-grid">
      <div class="detail-visual">
        <img class="detail-image" src="${getImageSrc(heroImage)}" alt="${item.title}" />
        <div class="detail-badges">
          ${item.year ? badge(String(item.year), "blue") : ""}
          ${item.paperTitle ? badge("论文亮点", "neutral") : ""}
        </div>
      </div>
      <div class="detail-copy">
        <div class="eyebrow">RESEARCH CONTRIBUTION</div>
        <h1>${item.title}</h1>
        <p class="hero-lead">${textOrDash(item.paperTitle || item.paper)}</p>
        <p class="detail-summary">${textOrDash(item.summary)}</p>
        <div class="meta-grid detail-meta">
          <div><span>亮点工作</span><strong>${textOrDash(item.highlight)}</strong></div>
          <div><span>原型系统</span><strong>${textOrDash(item.prototype)}</strong></div>
          <div><span>负责人</span><strong>${textOrDash(item.owner)}</strong></div>
        </div>
        ${chipList(item.tags || [])}
        <div class="card-actions">
          ${item.paperUrl ? buttonHTML(item.paperUrl, "论文链接", "btn btn-primary", "_blank") : ""}
          ${item.detailUrl ? buttonHTML(item.detailUrl, "详情页链接", "btn btn-secondary") : ""}
          ${buttonHTML("index.html#research-contributions", "返回研究贡献", "btn btn-secondary")}
        </div>
      </div>
    </section>
    ${
      extraImages.length
        ? `
      <section class="panel">
        <div class="section-header">
          <div>
            <div class="section-kicker">PROTOTYPE GALLERY</div>
            <h2>原型系统展示</h2>
          </div>
        </div>
        <div class="card-grid project-grid">
          ${extraImages.map((src) => `
            <article class="card">
              <img class="detail-image" src="${getImageSrc(src)}" alt="${item.title} prototype" />
            </article>
          `).join("")}
        </div>
      </section>
    `
        : ""
    }
  `;
}

async function initContributionPage() {
  const [site, contributions] = await Promise.all([
    loadJSON("./data/site.json"),
    loadJSON("./data/research_contributions.json"),
  ]);

  setPageTitle(site, "研究贡献详情");
  document.getElementById("site-header").innerHTML = createHeader(site, "home");
  document.getElementById("site-footer").innerHTML = createFooter(site);

  const id = getParam("id");
  const item = contributions.find((entry) => entry.id === id) || contributions[0];

  if (!item) {
    document.getElementById("page-content").innerHTML = `
      <section class="panel">${createEmptyState("暂无研究贡献数据")}</section>
    `;
    return;
  }

  document.getElementById("page-content").innerHTML = `
    ${contributionDetail(item)}
    <section class="panel">
      <div class="section-header">
        <div>
          <div class="section-kicker">SYSTEM NOTES</div>
          <h2>可扩展内容</h2>
        </div>
      </div>
      <div class="empty-state">
        这里可以继续加入原型系统截图、演示视频、数据流程图、用户研究结果或学生自己的补充说明。
      </div>
    </section>
  `;

  document.querySelectorAll("img.detail-image").forEach(setImageFallback);
}

function handleError(error) {
  document.getElementById("page-content").innerHTML = `
    <section class="panel">
      <div class="error-box">
        <h2>研究贡献详情页加载失败</h2>
        <p>无法读取 JSON 数据。</p>
        <pre>${error.message}</pre>
      </div>
    </section>
  `;
}

initContributionPage().catch(handleError);
