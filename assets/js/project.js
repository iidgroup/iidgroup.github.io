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
  sortByDateDesc,
  textOrDash,
  toSentenceList,
} from "./app.js";

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function projectDetail(project) {
  const statusType = String(project.status || "").toLowerCase().includes("ongoing") ? "success" : "neutral";
  return `
    <section class="panel detail-grid">
      <div class="detail-visual">
        <img class="detail-image" src="${getImageSrc(project.image)}" alt="${project.title}" />
        <div class="detail-badges">
          ${badge(project.statusLabel || project.status || "项目", statusType)}
          ${project.type ? badge(project.type, "blue") : ""}
        </div>
      </div>
      <div class="detail-copy">
        <div class="eyebrow">PROJECT DETAIL</div>
        <h1>${project.title}</h1>
        <p class="hero-lead">${textOrDash(project.summary)}</p>
        <div class="meta-grid detail-meta">
          <div><span>负责人</span><strong>${textOrDash(project.pi)}</strong></div>
          <div><span>起始时间</span><strong>${textOrDash(project.startDate)}</strong></div>
          <div><span>结束时间</span><strong>${textOrDash(project.endDate)}</strong></div>
          <div><span>资助机构</span><strong>${textOrDash(project.funder)}</strong></div>
        </div>
        <p class="detail-summary">${textOrDash(project.detail)}</p>
        ${chipList(project.tags || [])}
        <div class="card-actions">
          ${project.link ? buttonHTML(project.link, "外部链接", "btn btn-primary", "_blank") : ""}
          ${project.detailUrl ? buttonHTML(project.detailUrl, "项目页面", "btn btn-secondary") : ""}
          ${buttonHTML("index.html#projects", "返回项目列表", "btn btn-secondary")}
        </div>
      </div>
    </section>
  `;
}

async function initProjectPage() {
  const [site, projects, members] = await Promise.all([
    loadJSON("./data/site.json"),
    loadJSON("./data/projects.json"),
    loadJSON("./data/members.json"),
  ]);

  setPageTitle(site, "项目详情");
  document.getElementById("site-header").innerHTML = createHeader(site, "project");
  document.getElementById("site-footer").innerHTML = createFooter(site);

  const id = getParam("id");
  const project = projects.find((item) => item.id === id) || projects[0];

  if (!project) {
    document.getElementById("page-content").innerHTML = `
      <section class="panel">${createEmptyState("未找到该项目")}</section>
    `;
    return;
  }

  const team = (project.team || [])
    .map((memberId) => members.find((item) => item.id === memberId))
    .filter(Boolean);
  const relatedProjects = sortByDateDesc(
    projects.filter((item) => item.id !== project.id && item.status === project.status),
    "startDate",
  ).slice(0, 4);

  document.getElementById("page-content").innerHTML = `
    ${projectDetail(project)}

    <section class="panel">
      <div class="section-header">
        <div>
          <div class="section-kicker">TEAM</div>
          <h2>参与成员</h2>
        </div>
      </div>
      ${
        team.length
          ? `<div class="chip-list">
              ${team.map((member) => `
                <a class="chip chip-link" href="${member.profileUrl || `member.html?id=${member.id}`}">${member.name}</a>
              `).join("")}
            </div>`
          : createEmptyState("该项目暂无成员配置")
      }
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <div class="section-kicker">RELATED PROJECTS</div>
          <h2>相关项目</h2>
        </div>
      </div>
      ${
        relatedProjects.length
          ? `<div class="card-grid project-grid">
              ${relatedProjects.map((item) => `
                <article class="card project-card">
                  <div class="card-body">
                    <div class="card-head">
                      <div>
                        <h3 class="card-title"><a href="${item.detailUrl || `project.html?id=${item.id}`}">${item.title}</a></h3>
                        <div class="card-subtitle">${textOrDash(item.funder)}</div>
                      </div>
                      ${badge(item.statusLabel || item.status || "项目", "blue")}
                    </div>
                    <p class="card-text">${textOrDash(item.summary)}</p>
                  </div>
                </article>
              `).join("")}
            </div>`
          : createEmptyState("暂无相关项目")
      }
    </section>
  `;

  document.querySelectorAll("img.detail-image").forEach(setImageFallback);
}

function handleError(error) {
  document.getElementById("page-content").innerHTML = `
    <section class="panel">
      <div class="error-box">
        <h2>项目页加载失败</h2>
        <p>无法读取 JSON 数据。</p>
        <pre>${error.message}</pre>
      </div>
    </section>
  `;
}

initProjectPage().catch(handleError);
