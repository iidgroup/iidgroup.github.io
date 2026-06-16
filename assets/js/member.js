import {
  badge,
  buttonHTML,
  chipList,
  createEmptyState,
  createFooter,
  createHeader,
  loadJSON,
  setImageFallback,
  setPageTitle,
  textOrDash,
  toSentenceList,
  sortByYearDesc,
} from "./app.js";

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function memberDetail(member) {
  return `
    <section class="panel detail-grid">
      <div class="detail-visual">
        <div class="detail-badges">
          ${badge(member.groupLabel || member.group || "成员", "blue")}
          ${member.status ? badge(member.status, "neutral") : ""}
        </div>
      </div>
      <div class="detail-copy">
        <div class="eyebrow">TEAM MEMBER</div>
        <h1>${member.name}</h1>
        <p class="hero-lead">${textOrDash(member.title)}</p>
        <p class="detail-summary">${textOrDash(member.bio)}</p>
        ${chipList(member.researchAreas || [])}
        <div class="meta-grid detail-meta">
          <div><span>邮箱</span><strong>${textOrDash(member.email)}</strong></div>
          <div><span>主页</span><strong>${textOrDash(member.website)}</strong></div>
          <div><span>研究方向</span><strong>${textOrDash(member.researchFocus)}</strong></div>
        </div>
        <div class="card-actions">
          ${member.email ? buttonHTML(`mailto:${member.email}`, "发送邮件", "btn btn-primary") : ""}
          ${member.website ? buttonHTML(member.website, "个人主页", "btn btn-secondary", "_blank") : ""}
          ${buttonHTML("index.html#members", "返回成员列表", "btn btn-secondary")}
        </div>
      </div>
    </section>
  `;
}

async function initMemberPage() {
  const [site, members, publications] = await Promise.all([
    loadJSON("./data/site.json"),
    loadJSON("./data/members.json"),
    loadJSON("./data/publications.json"),
  ]);

  setPageTitle(site, "团队成员");
  document.getElementById("site-header").innerHTML = createHeader(site, "member");
  document.getElementById("site-footer").innerHTML = createFooter(site);

  const id = getParam("id");
  const member = members.find((item) => item.id === id) || members[0];

  if (!member) {
    document.getElementById("page-content").innerHTML = `
      <section class="panel">${createEmptyState("未找到该成员")}</section>
    `;
    return;
  }

  const aliases = [member.name, ...(member.aliases || [])].filter(Boolean);
  const relatedPublications = sortByYearDesc(
    publications.filter((pub) => {
      const authors = (pub.authors || []).join(" ");
      return aliases.some((alias) => authors.includes(alias));
    }),
    "year",
  ).slice(0, 5);

  const peers = members
    .filter((item) => item.id !== member.id && item.group === member.group)
    .slice(0, 4);

  document.getElementById("page-content").innerHTML = `
    ${memberDetail(member)}

    <section class="panel">
      <div class="section-header">
        <div>
          <div class="section-kicker">RELATED PUBLICATIONS</div>
          <h2>相关论文</h2>
        </div>
      </div>
      ${
        relatedPublications.length
          ? `<div class="card-stack">
              ${relatedPublications.map((pub) => `
                <article class="card publication-card">
                  <div class="publication-year">${pub.year || "N/A"}</div>
                  <div class="card-body">
                    <h3 class="card-title">${pub.title}</h3>
                    <p class="card-text">${toSentenceList(pub.authors || [])}</p>
                    <div class="publication-meta">${textOrDash(pub.journal)}</div>
                    <div class="card-actions">
                      ${pub.doi ? buttonHTML(`https://doi.org/${pub.doi}`, "DOI", "btn btn-secondary", "_blank") : ""}
                      ${pub.link ? buttonHTML(pub.link, "原文链接", "btn btn-secondary", "_blank") : ""}
                    </div>
                  </div>
                </article>
              `).join("")}
            </div>`
          : createEmptyState("该成员暂无关联论文示例数据")
      }
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <div class="section-kicker">PEERS</div>
          <h2>同组成员</h2>
        </div>
      </div>
      ${
        peers.length
          ? `<div class="card-grid member-grid">
              ${peers.map((peer) => `
                <article class="card member-card compact">
                  <div class="card-body">
                    <h3 class="card-title"><a href="${peer.profileUrl || `member.html?id=${peer.id}`}">${peer.name}</a></h3>
                    <div class="card-subtitle">${textOrDash(peer.title)}</div>
                  </div>
                </article>
              `).join("")}
            </div>`
          : createEmptyState("暂无同组成员数据")
      }
    </section>
  `;

  document.querySelectorAll("img.card-image, img.detail-image").forEach(setImageFallback);
}

function handleError(error) {
  document.getElementById("page-content").innerHTML = `
    <section class="panel">
      <div class="error-box">
        <h2>成员页加载失败</h2>
        <p>无法读取 JSON 数据。</p>
        <pre>${error.message}</pre>
      </div>
    </section>
  `;
}

initMemberPage().catch(handleError);
