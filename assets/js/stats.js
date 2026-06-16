import {
  buttonHTML,
  computeStats,
  createEmptyState,
  createFooter,
  createHeader,
  escapeHTML,
  loadJSON,
  setPageTitle,
  sortByDateDesc,
  sortByYearDesc,
  textOrDash,
  toSentenceList,
} from "./app.js";

function buildYearDistribution(publications) {
  const map = new Map();
  for (const item of publications) {
    const year = Number(item.year);
    if (!Number.isFinite(year)) continue;
    map.set(year, (map.get(year) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

function renderBarChart(yearDistribution) {
  if (!yearDistribution.length) return createEmptyState("暂无论文年份分布数据");
  const max = Math.max(...yearDistribution.map(([, count]) => count));
  return `
    <div class="bar-chart">
      ${yearDistribution.map(([year, count]) => `
        <div class="bar-row">
          <span class="bar-year">${year}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${Math.max(8, (count / max) * 100)}%"></div>
          </div>
          <span class="bar-count">${count}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderPublicationTable(publications) {
  if (!publications.length) return createEmptyState("暂无论文数据");
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>年份</th>
            <th>论文</th>
            <th>期刊</th>
            <th>作者</th>
            <th>链接</th>
          </tr>
        </thead>
        <tbody>
          ${publications.map((pub) => {
            const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : "";
            return `
              <tr>
                <td>${escapeHTML(pub.year || "")}</td>
                <td>${escapeHTML(pub.title || "")}</td>
                <td>${escapeHTML([pub.journal, pub.volume, pub.issue].filter(Boolean).join(" "))}</td>
                <td>${escapeHTML(toSentenceList(pub.authors || []))}</td>
                <td>
                  ${doiUrl ? `<a class="inline-link" href="${doiUrl}" target="_blank" rel="noreferrer">DOI</a>` : ""}
                  ${pub.link ? `<a class="inline-link" href="${pub.link}" target="_blank" rel="noreferrer">原文</a>` : ""}
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderProjectTable(projects) {
  if (!projects.length) return createEmptyState("暂无项目数据");
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>起始时间</th>
            <th>项目</th>
            <th>状态</th>
            <th>负责人</th>
            <th>链接</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map((project) => `
            <tr>
              <td>${escapeHTML(project.startDate || "")}</td>
              <td>${escapeHTML(project.title || "")}</td>
              <td>${escapeHTML(project.statusLabel || project.status || "")}</td>
              <td>${escapeHTML(textOrDash(project.pi))}</td>
              <td>${project.detailUrl ? `<a class="inline-link" href="${project.detailUrl}">详情</a>` : ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPatentTable(patents) {
  if (!patents.length) return createEmptyState("暂无专利数据");
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>年份</th>
            <th>专利</th>
            <th>编号</th>
            <th>发明人</th>
            <th>链接</th>
          </tr>
        </thead>
        <tbody>
          ${patents.map((patent) => `
            <tr>
              <td>${escapeHTML(patent.year || patent.authorizationYear || "")}</td>
              <td>${escapeHTML(patent.title || "")}</td>
              <td>${escapeHTML(patent.number || "")}</td>
              <td>${escapeHTML(toSentenceList(patent.inventors || []))}</td>
              <td>${patent.link ? `<a class="inline-link" href="${patent.link}" target="_blank" rel="noreferrer">查看</a>` : ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function initStatsPage() {
  const [site, publications, projects, patents] = await Promise.all([
    loadJSON("./data/site.json"),
    loadJSON("./data/publications.json"),
    loadJSON("./data/projects.json"),
    loadJSON("./data/patents.json"),
  ]);

  setPageTitle(site, "成果统计");
  document.getElementById("site-header").innerHTML = createHeader(site, "stats");
  document.getElementById("site-footer").innerHTML = createFooter(site);

  const stats = computeStats({ publications, projects, patents });
  const sortedPublications = sortByYearDesc(publications, "year");
  const sortedProjects = sortByDateDesc(projects, "startDate");
  const sortedPatents = sortByYearDesc(patents, "year");
  const yearDistribution = buildYearDistribution(publications);

  document.getElementById("page-content").innerHTML = `
    <section class="panel hero compact-hero">
      <div class="hero-copy">
        <div class="eyebrow">STATISTICS</div>
        <h1>成果统计</h1>
        <p class="hero-lead">页面中的统计指标会根据 JSON 文件自动生成，无需手工维护数值。</p>
        ${buttonHTML("index.html", "返回首页", "btn btn-secondary")}
      </div>
      <div class="hero-side">
        <div class="hero-side-card accent">
          <div class="hero-side-title">自动统计指标</div>
          <div class="stats-grid">
            <div class="stat-card"><span>论文总数</span><strong>${stats.publicationTotal}</strong></div>
            <div class="stat-card"><span>近五年论文数量</span><strong>${stats.publicationRecentFiveYears}</strong></div>
            <div class="stat-card"><span>项目总数</span><strong>${stats.projectTotal}</strong></div>
            <div class="stat-card"><span>在研项目数量</span><strong>${stats.projectActive}</strong></div>
            <div class="stat-card"><span>专利总数</span><strong>${stats.patentTotal}</strong></div>
            <div class="stat-card"><span>授权专利数量</span><strong>${stats.patentGranted}</strong></div>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <div class="section-kicker">PUBLICATION TREND</div>
          <h2>论文年份分布</h2>
        </div>
      </div>
      ${renderBarChart(yearDistribution)}
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <div class="section-kicker">PUBLICATIONS</div>
          <h2>论文清单</h2>
        </div>
      </div>
      ${renderPublicationTable(sortedPublications)}
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <div class="section-kicker">PROJECTS</div>
          <h2>项目清单</h2>
        </div>
      </div>
      ${renderProjectTable(sortedProjects)}
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <div class="section-kicker">PATENTS</div>
          <h2>专利清单</h2>
        </div>
      </div>
      ${renderPatentTable(sortedPatents)}
    </section>
  `;
}

function handleError(error) {
  document.getElementById("page-content").innerHTML = `
    <section class="panel">
      <div class="error-box">
        <h2>统计页加载失败</h2>
        <p>无法读取 JSON 数据。</p>
        <pre>${error.message}</pre>
      </div>
    </section>
  `;
}

initStatsPage().catch(handleError);
