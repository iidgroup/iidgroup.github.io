const PLACEHOLDER_IMAGE = (() => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="Placeholder image">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1f4f82" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" rx="28" fill="url(#bg)" />
      <circle cx="140" cy="112" r="74" fill="rgba(255,255,255,0.08)" />
      <circle cx="504" cy="300" r="116" fill="rgba(255,255,255,0.06)" />
      <rect x="76" y="250" width="488" height="20" rx="10" fill="rgba(255,255,255,0.18)" />
      <rect x="76" y="284" width="360" height="16" rx="8" fill="rgba(255,255,255,0.12)" />
      <text x="76" y="188" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">Lab Profile</text>
      <text x="76" y="224" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif" font-size="18">Image placeholder</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

export async function loadJSON(relativePath) {
  const url = new URL(relativePath, window.location.href);
  const response = await fetch(url.href, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${relativePath} (${response.status})`);
  }
  return response.json();
}

export function isStudentMember(member = {}) {
  return ["phd", "master", "ms", "undergraduate"].includes(String(member.group || "").toLowerCase());
}

export function isResearchAssistantMember(member = {}) {
  return ["researchassistant", "research_assistant", "assistant", "ra"].includes(String(member.group || "").toLowerCase());
}

export function getMemberGroupLabel(member = {}) {
  if (member.groupLabel && String(member.groupLabel).trim()) return String(member.groupLabel);
  const group = String(member.group || "").toLowerCase();
  const labels = {
    faculty: "导师 / 教师",
    researcher: "研究员",
    postdoc: "博士后",
    researchassistant: "研究助理",
    research_assistant: "研究助理",
    assistant: "研究助理",
    ra: "研究助理",
    phd: "博士研究生",
    master: "硕士研究生",
    ms: "硕士研究生",
    undergraduate: "本科生",
    alumni: "已毕业成员",
  };
  return labels[group] || member.group || "成员";
}

export function getMemberStudyYears(member = {}) {
  const enrollmentYear = Number(member.enrollmentYear ?? member.startYear ?? member.admissionYear);
  const graduationYear = Number(member.graduationYear ?? member.endYear ?? member.graduateYear);

  return {
    enrollmentYear: Number.isFinite(enrollmentYear) ? enrollmentYear : null,
    graduationYear: Number.isFinite(graduationYear) ? graduationYear : null,
  };
}

export function formatMemberStudyLabel(member = {}) {
  const { enrollmentYear, graduationYear } = getMemberStudyYears(member);
  if (enrollmentYear && graduationYear) return `${enrollmentYear} - ${graduationYear}`;
  if (enrollmentYear) return `${enrollmentYear} 入学`;
  if (graduationYear) return `${graduationYear} 毕业`;
  return "";
}

export function getMemberStudyStatus(member = {}) {
  const { enrollmentYear, graduationYear } = getMemberStudyYears(member);
  if (graduationYear) {
    return {
      status: "alumni",
      label: "已毕业",
      enrollmentYear,
      graduationYear,
    };
  }
  if (isStudentMember(member)) {
    return {
      status: "current",
      label: "在读",
      enrollmentYear,
      graduationYear,
    };
  }
  return {
    status: "other",
    label: "",
    enrollmentYear,
    graduationYear,
  };
}

export function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function textOrDash(value) {
  return value && String(value).trim() ? String(value) : "暂无";
}

export function getImageSrc(value) {
  return value && String(value).trim() ? value : PLACEHOLDER_IMAGE;
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function sortByDateDesc(items, key) {
  return [...items].sort((a, b) => {
    const left = new Date(a?.[key] || 0).getTime();
    const right = new Date(b?.[key] || 0).getTime();
    return right - left;
  });
}

export function groupMembers(members) {
  const order = {
    faculty: 0,
    researcher: 1,
    postdoc: 2,
    researchassistant: 3,
    research_assistant: 3,
    assistant: 3,
    ra: 3,
    phd: 4,
    master: 5,
    undergraduate: 6,
    alumni: 7,
  };
  const grouped = new Map();
  for (const member of members) {
    const key = member.group || "other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(member);
  }
  return [...grouped.entries()]
    .sort((a, b) => {
      const left = order[a[0]] ?? 99;
      const right = order[b[0]] ?? 99;
      return left - right;
    })
    .map(([group, items]) => ({
      group,
      items: items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    }));
}

export function computeStats({ publications = [], projects = [], patents = [] }) {
  const currentYear = new Date().getFullYear();
  const publicationYears = publications
    .map((publication) => Number(publication.year))
    .filter((year) => Number.isFinite(year));
  const projectStatus = projects.map((project) => String(project.status || "").toLowerCase());
  const patentStatus = patents.map((patent) => String(patent.status || "").toLowerCase());

  return {
    publicationTotal: publications.length,
    publicationRecentFiveYears: publicationYears.filter((year) => year >= currentYear - 4).length,
    projectTotal: projects.length,
    projectActive: projectStatus.filter((status) => ["ongoing", "in progress", "active", "running"].includes(status)).length,
    patentTotal: patents.length,
    patentGranted: patentStatus.filter((status) => ["authorized", "granted", "issued"].includes(status)).length,
  };
}

export function setPageTitle(site, title = "") {
  const suffix = title ? ` - ${title}` : "";
  document.title = `${site.siteName || site.shortName || "Lab Site"}${suffix}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && site.description) {
    meta.setAttribute("content", site.description);
  }
}

export function createHeader(site, activePage = "home") {
  const navItems = (site.navigation || []).map((item) => {
    const active =
      (activePage === "home" && item.page === "home") ||
      (activePage === "stats" && item.page === "stats") ||
      (activePage === "member" && item.page === "member") ||
      (activePage === "project" && item.page === "project");
    return `
      <a class="nav-link${active ? " active" : ""}" href="${escapeHTML(item.href)}">${escapeHTML(item.label)}</a>
    `;
  });

  const social = (site.socialLinks || [])
    .map(
      (item) => `
      <a class="social-link" href="${escapeHTML(item.href)}" target="_blank" rel="noreferrer">${escapeHTML(item.label)}</a>
    `,
    )
    .join("");

  return `
    <div class="topbar">
      <div class="brand">
        <div class="brand-mark">${escapeHTML((site.shortName || site.siteName || "L").slice(0, 1))}</div>
        <div>
          <div class="brand-name">${escapeHTML(site.siteName || "")}</div>
        </div>
      </div>
    </div>
    <nav class="nav-shell" aria-label="主导航">
      <div class="nav-links">${navItems.join("")}</div>
      <div class="nav-social">${social}</div>
    </nav>
  `;
}

export function createFooter(site) {
  return `
    <div class="footer-grid">
      <div>
        <div class="footer-title">${escapeHTML(site.siteName || "")}</div>
        <p class="footer-text">${escapeHTML(site.footerText || site.description || "")}</p>
      </div>
      <div>
        <div class="footer-title">联系方式</div>
        <p class="footer-text">
          ${escapeHTML(site.contact?.email || "")}<br />
          ${escapeHTML(site.contact?.address || "")}<br />
          ${escapeHTML(site.contact?.phone || "")}
        </p>
      </div>
    </div>
    <div class="footer-bottom">Copyright © ${new Date().getFullYear()} ${escapeHTML(site.siteName || site.shortName || "")}. All rights reserved.</div>
  `;
}

export function buttonHTML(url, label, className = "btn btn-secondary", target = "_self") {
  if (!url) return "";
  return `<a class="${className}" href="${escapeHTML(url)}" target="${target}">${escapeHTML(label)}</a>`;
}

export function chipList(items = []) {
  if (!items.length) return "";
  return `<div class="chip-list">${items.map((item) => `<span class="chip">${escapeHTML(item)}</span>`).join("")}</div>`;
}

export function badge(label, type = "default") {
  return `<span class="badge badge-${escapeHTML(type)}">${escapeHTML(label)}</span>`;
}

export function setImageFallback(img) {
  img.onerror = () => {
    img.onerror = null;
    img.src = PLACEHOLDER_IMAGE;
  };
}

export function createEmptyState(message) {
  return `<div class="empty-state">${escapeHTML(message)}</div>`;
}

export function sortByYearDesc(items, key = "year") {
  return [...items].sort((a, b) => Number(b?.[key] ?? 0) - Number(a?.[key] ?? 0));
}

export function toSentenceList(items = []) {
  return items.filter(Boolean).join("，");
}

export const utils = {
  PLACEHOLDER_IMAGE,
};
