import {
  badge,
  buttonHTML,
  chipList,
  computeStats,
  createEmptyState,
  createFooter,
  createHeader,
  formatDate,
  loadJSON,
  setPageTitle,
  sortByDateDesc,
  sortByYearDesc,
  textOrDash,
  toSentenceList,
} from "./app.js";

function memberCard(member, compact = false) {
  const url = member.profileUrl || `member.html?id=${encodeURIComponent(member.id)}`;
  return `
    <article class="card member-card ${compact ? "compact" : ""}">
      <div class="card-body">
        <div class="card-head">
          <div>
            <h3 class="card-title"><a href="${url}">${member.name}</a></h3>
            <div class="card-subtitle">${textOrDash(member.title)}</div>
          </div>
        </div>
        <p class="card-text">${textOrDash(member.bio)}</p>
        ${chipList(member.researchAreas || [])}
        <div class="card-actions">
          ${member.email ? `<a class="inline-link" href="mailto:${member.email}">${member.email}</a>` : ""}
          ${member.website ? `<a class="inline-link" href="${member.website}" target="_blank" rel="noreferrer">个人主页</a>` : ""}
        </div>
      </div>
    </article>
  `;
}

function researchItem(item) {
  return `
    <article class="research-item">
      <h3 class="research-title">${item.title}</h3>
      <p class="research-summary">${textOrDash(item.summary)}</p>
    </article>
  `;
}

function projectCard(project) {
  const detailUrl = project.detailUrl || `project.html?id=${encodeURIComponent(project.id)}`;
  const statusType = String(project.status || "").toLowerCase().includes("ongoing") ? "success" : "neutral";
  return `
    <article class="card project-card">
      <div class="card-body">
        <div class="card-head">
          <div>
            <h3 class="card-title"><a href="${detailUrl}">${project.title}</a></h3>
            <div class="card-subtitle">${textOrDash(project.funder)}</div>
          </div>
          ${badge(project.statusLabel || project.status || "项目", statusType)}
        </div>
        <p class="card-text">${textOrDash(project.summary)}</p>
        <div class="meta-grid">
          <div><span>时间</span><strong>${project.startDate ? formatDate(project.startDate) : "未填写"}</strong></div>
          <div><span>负责人</span><strong>${textOrDash(project.pi)}</strong></div>
          <div><span>金额</span><strong>${textOrDash(project.amount)}</strong></div>
        </div>
        ${chipList(project.tags || [])}
        <div class="card-actions">
          ${buttonHTML(detailUrl, "查看详情", "btn btn-primary")}
          ${buttonHTML(project.link, "外部链接", "btn btn-secondary", "_blank")}
        </div>
      </div>
    </article>
  `;
}

function researchContributionCard(item) {
  const detailUrl = item.detailUrl || "";
  const paperUrl = item.paperUrl || item.link || "";
  return `
    <article class="card project-card">
      <div class="card-body">
        <div class="card-head">
          <div>
            <h3 class="card-title">${item.title}</h3>
            <div class="card-subtitle">${textOrDash(item.paperTitle || item.paper)}</div>
          </div>
          ${item.year ? badge(String(item.year), "blue") : ""}
        </div>
        <p class="card-text">${textOrDash(item.summary)}</p>
        <div class="meta-grid">
          <div><span>亮点工作</span><strong>${textOrDash(item.highlight)}</strong></div>
          <div><span>原型系统</span><strong>${textOrDash(item.prototype)}</strong></div>
          <div><span>负责人</span><strong>${textOrDash(item.owner)}</strong></div>
        </div>
        ${chipList(item.tags || [])}
        <div class="card-actions">
          ${detailUrl ? buttonHTML(detailUrl, "查看详情", "btn btn-primary") : ""}
          ${paperUrl ? buttonHTML(paperUrl, "论文链接", "btn btn-secondary", "_blank") : ""}
        </div>
      </div>
    </article>
  `;
}

function publicationCard(pub) {
  const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : "";
  const year = pub.year ? String(pub.year) : "";
  return `
    <article class="card publication-card">
      <div class="publication-year">${year || "N/A"}</div>
      <div class="card-body">
        <h3 class="card-title">${pub.title}</h3>
        <p class="card-text publication-authors">${toSentenceList(pub.authors || [])}</p>
        <div class="publication-meta">${textOrDash(pub.journal)}${pub.volume ? `, ${pub.volume}` : ""}${pub.issue ? `(${pub.issue})` : ""}${pub.pages ? `, ${pub.pages}` : ""}</div>
        <div class="card-actions">
          ${doiUrl ? buttonHTML(doiUrl, "DOI", "btn btn-secondary", "_blank") : ""}
          ${pub.link ? buttonHTML(pub.link, "原文链接", "btn btn-secondary", "_blank") : ""}
        </div>
      </div>
    </article>
  `;
}

function renderPublicationsSection(publications) {
  const visibleCount = 5;
  const visiblePublications = publications.slice(0, visibleCount);
  const hiddenPublications = publications.slice(visibleCount);

  return `
    <div class="publication-list">
      ${visiblePublications.map((item) => publicationCard(item)).join("")}
      <div class="publication-more" id="publication-more" hidden>
        ${hiddenPublications.map((item) => publicationCard(item)).join("")}
      </div>
    </div>
    ${hiddenPublications.length ? `
      <div class="publication-toggle-wrap">
        <button class="btn btn-secondary publication-toggle" id="publication-toggle" type="button" aria-expanded="false" aria-controls="publication-more">
          显示更多
        </button>
      </div>
    ` : ""}
  `;
}

function patentCard(patent) {
  return `
    <article class="card patent-card">
      <div class="card-body">
        <div class="card-head">
          <div>
            <h3 class="card-title">${patent.title}</h3>
            <div class="card-subtitle">${textOrDash(patent.number)}</div>
          </div>
          ${badge(patent.statusLabel || patent.status || "专利", String(patent.status || "").toLowerCase().includes("authorized") ? "success" : "neutral")}
        </div>
        <p class="card-text">${textOrDash(patent.summary)}</p>
        <div class="meta-grid">
          <div><span>申请年</span><strong>${textOrDash(patent.applicationYear || patent.year)}</strong></div>
          <div><span>授权年</span><strong>${textOrDash(patent.authorizationYear)}</strong></div>
          <div><span>发明人</span><strong>${toSentenceList(patent.inventors || [])}</strong></div>
        </div>
        <div class="card-actions">
          ${buttonHTML(patent.link, "查看链接", "btn btn-secondary", "_blank")}
        </div>
      </div>
    </article>
  `;
}

function softwareCard(item) {
  return `
    <article class="card software-card">
      <div class="card-body">
        <div class="card-head">
          <div>
            <h3 class="card-title">${item.title}</h3>
            <div class="card-subtitle">${textOrDash(item.registrationNumber)}</div>
          </div>
          ${badge(item.statusLabel || item.status || "软著", "blue")}
        </div>
        <p class="card-text">${textOrDash(item.summary)}</p>
        <div class="meta-grid">
          <div><span>登记年</span><strong>${textOrDash(item.year)}</strong></div>
          <div><span>负责人</span><strong>${textOrDash(item.owner)}</strong></div>
          <div><span>类型</span><strong>${textOrDash(item.category)}</strong></div>
        </div>
        <div class="card-actions">
          ${buttonHTML(item.link, "查看链接", "btn btn-secondary", "_blank")}
        </div>
      </div>
    </article>
  `;
}

function newsCard(item) {
  return `
    <article class="news-item">
      <div class="news-date">${formatDate(item.date)}</div>
      <div class="news-content">
        <h3>${item.title}</h3>
        <p>${textOrDash(item.summary)}</p>
        ${item.link ? `<a class="inline-link" href="${item.link}" target="_blank" rel="noreferrer">查看详情</a>` : ""}
      </div>
    </article>
  `;
}

function renderMemberGroups(members) {
  if (!members.length) return createEmptyState("暂无团队成员数据");

  const sortedMembers = [...members].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  return `
    <div class="card-grid member-grid">
      ${sortedMembers.map((member) => memberCard(member)).join("")}
    </div>
  `;
}

function renderStatsCards(stats) {
  return `
    <div class="stats-grid">
      <div class="stat-card"><span>论文总数</span><strong>${stats.publicationTotal}</strong></div>
      <div class="stat-card"><span>近五年论文数量</span><strong>${stats.publicationRecentFiveYears}</strong></div>
      <div class="stat-card"><span>项目总数</span><strong>${stats.projectTotal}</strong></div>
      <div class="stat-card"><span>在研项目数量</span><strong>${stats.projectActive}</strong></div>
      <div class="stat-card"><span>专利总数</span><strong>${stats.patentTotal}</strong></div>
      <div class="stat-card"><span>授权专利数量</span><strong>${stats.patentGranted}</strong></div>
    </div>
  `;
}

function renderGroupedList(title, subtitle, content, anchor) {
  return `
    <section class="panel" id="${anchor}">
      <div class="section-header">
        <div>
          <div class="section-kicker">${subtitle}</div>
          <h2>${title}</h2>
        </div>
      </div>
      ${content}
    </section>
  `;
}

async function initHome() {
  const [site, members, research, projects, researchContributions, publications, patents, news, software] = await Promise.all([
    loadJSON("./data/site.json"),
    loadJSON("./data/members.json"),
    loadJSON("./data/research.json"),
    loadJSON("./data/projects.json"),
    loadJSON("./data/research_contributions.json"),
    loadJSON("./data/publications.json"),
    loadJSON("./data/patents.json"),
    loadJSON("./data/news.json"),
    loadJSON("./data/software.json"),
  ]);

  setPageTitle(site);
  document.getElementById("site-header").innerHTML = createHeader(site, "home");
  document.getElementById("site-footer").innerHTML = createFooter(site);

  const stats = computeStats({ publications, projects, patents });
  const sortedProjects = sortByDateDesc(projects, "startDate");
  const sortedResearchContributions = sortByYearDesc(researchContributions, "year");
  const sortedPublications = sortByYearDesc(publications, "year");
  const sortedPatents = sortByYearDesc(patents, "year");
  const sortedNews = sortByDateDesc(news, "date");
  const sortedSoftware = sortByYearDesc(software, "year");

  const page = document.getElementById("page-content");
  page.innerHTML = `
    <section class="hero panel">
      <div class="hero-copy">
        <div class="eyebrow">高校课题组 / 实验室主页</div>
        <h1>${site.siteName}</h1>
        <p class="hero-lead">${site.description}</p>
        ${chipList(site.researchKeywords || site.keywords || [])}
        <div class="hero-actions">
          ${buttonHTML("#research", "浏览研究方向", "btn btn-primary")}
          ${buttonHTML("stats.html", "查看成果统计", "btn btn-secondary")}
        </div>
        <div class="contact-pills">
          <span>${site.contact?.email || ""}</span>
          <span>${site.contact?.address || ""}</span>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-side-card">
          <div class="hero-side-title">课题组特色</div>
          <p>${textOrDash(site.highlight || "聚焦数据驱动、智能计算与可落地的应用研究。")}</p>
        </div>
        <div class="hero-side-card accent">
          <div class="hero-side-title">当前概览</div>
          ${renderStatsCards(stats)}
        </div>
      </div>
    </section>

    ${renderGroupedList("研究方向介绍", "RESEARCH DIRECTIONS", `
      <div class="research-list">
        ${research.map((item) => researchItem(item)).join("")}
      </div>
    `, "research")}

    ${renderGroupedList("团队成员", "TEAM", `
      ${renderMemberGroups(members)}
    `, "members")}

    ${renderGroupedList("项目介绍", "PROJECTS", `
      <div class="card-grid project-grid">
        ${sortedProjects.map((item) => projectCard(item)).join("")}
      </div>
    `, "projects")}

    ${renderGroupedList("论文成果", "PUBLICATIONS", `
      ${renderPublicationsSection(sortedPublications)}
    `, "publications")}

    ${renderGroupedList("专利", "PATENTS", `
      <div class="card-grid patent-grid">
        ${sortedPatents.map((item) => patentCard(item)).join("")}
      </div>
    `, "patents")}

    ${renderGroupedList("软著", "SOFTWARE COPYRIGHTS", `
      <div class="card-grid software-grid">
        ${sortedSoftware.map((item) => softwareCard(item)).join("")}
      </div>
    `, "software")}

    ${renderGroupedList("新闻动态", "NEWS", `
      <div class="news-list">
        ${sortedNews.map((item) => newsCard(item)).join("")}
      </div>
    `, "news")}

    ${renderGroupedList("成果统计", "STATISTICS", `
      ${renderStatsCards(stats)}
      <div class="stats-note">
        数据自动来源于 publications.json、projects.json 与 patents.json，页面会随 JSON 更新同步刷新。
      </div>
    `, "statistics")}
  `;

  const researchContributionsSection = renderGroupedList("研究贡献", "RESEARCH CONTRIBUTIONS", `
    <div class="card-grid project-grid">
      ${sortedResearchContributions.map((item) => researchContributionCard(item)).join("")}
    </div>
  `, "research-contributions");
  const publicationsSection = document.getElementById("publications");
  if (publicationsSection) {
    publicationsSection.insertAdjacentHTML("beforebegin", researchContributionsSection);
  }

  const publicationToggle = document.getElementById("publication-toggle");
  const publicationMore = document.getElementById("publication-more");
  if (publicationToggle && publicationMore) {
    publicationToggle.addEventListener("click", () => {
      const expanded = publicationToggle.getAttribute("aria-expanded") === "true";
      publicationToggle.setAttribute("aria-expanded", String(!expanded));
      publicationToggle.textContent = expanded ? "显示更多" : "收起";
      publicationMore.hidden = expanded;
    });
  }
}

function handleError(error) {
  const page = document.getElementById("page-content");
  page.innerHTML = `
    <section class="panel">
      <div class="error-box">
        <h2>页面加载失败</h2>
        <p>无法读取本地 JSON 数据，请确认 data 目录和文件路径是否正确。</p>
        <pre>${error.message}</pre>
      </div>
    </section>
  `;
}

initHome().catch(handleError);
