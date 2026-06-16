# 课题组主页静态站点模板

这是一个适合高校课题组、实验室或科研团队使用的静态主页项目，面向 GitHub Pages 部署。

## 特点

- 纯前端实现，不依赖 Node.js 后端，不依赖数据库
- 所有内容统一放在 `data/` 目录下的 JSON 文件中
- 页面通过 `fetch` 动态读取 JSON 并渲染
- 响应式布局，适配电脑、平板和手机
- 支持成员页、项目页、研究贡献页和成果统计页
- 统计数据自动由 `publications.json`、`projects.json`、`patents.json` 计算生成

## 当前站点结构

```text
.
├── index.html
├── stats.html
├── member.html
├── project.html
├── contribution.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── images/
│   │   ├── projects/
│   │   └── contributions/
│   └── js/
│       ├── app.js
│       ├── index.js
│       ├── stats.js
│       ├── member.js
│       ├── project.js
│       └── contribution.js
└── data/
    ├── site.json
    ├── members.json
    ├── research.json
    ├── projects.json
    ├── research_contributions.json
    ├── publications.json
    ├── patents.json
    ├── software.json
    └── news.json
```

### 页面说明

- `index.html`：首页，展示站点简介、研究方向、团队成员、项目、研究贡献、论文、专利、软著和新闻
- `stats.html`：成果统计页
- `member.html`：团队成员详情页
- `project.html`：项目详情页
- `contribution.html`：研究贡献详情页

### 资源说明

- `assets/js/`：页面逻辑脚本
- `assets/css/`：全站样式
- `assets/images/projects/`：项目缩略图和示意图
- `assets/images/contributions/`：研究贡献缩略图和示意图

## 如何修改数据

所有展示内容都在 `data/` 目录下维护。

### 1. 网站基本信息

修改 `data/site.json`，包含：

- 课题组名称
- 简介和研究特色
- 联系方式
- 导航菜单
- 页脚说明

### 2. 团队成员

修改 `data/members.json`。建议每个成员包含：

- `id`
- `name`
- `title`
- `group`
- `researchAreas`
- `email`
- `bio`
- `image`
- `profileUrl`

点击首页成员卡片会跳转到 `member.html?id=成员ID`。

### 3. 研究方向

修改 `data/research.json`，用于首页研究方向展示。

### 4. 项目

修改 `data/projects.json`。建议字段：

- `id`
- `title`
- `status`
- `pi`
- `funder`
- `startDate`
- `endDate`
- `summary`
- `detail`
- `team`
- `tags`
- `detailUrl`

点击项目卡片会跳转到 `project.html?id=项目ID`。

### 5. 研究贡献

修改 `data/research_contributions.json`，用于首页“研究贡献”栏目。

建议字段：

- `id`
- `title`
- `paperTitle`
- `year`
- `summary`
- `highlight`
- `prototype`
- `owner`
- `paperUrl`
- `detailUrl`
- `image`
- `tags`

点击卡片可跳转到 `contribution.html?id=研究贡献ID`。

### 6. 论文

修改 `data/publications.json`。建议字段：

- `title`
- `authors`
- `journal`
- `volume`
- `issue`
- `pages`
- `year`
- `doi`
- `link`

### 7. 专利

修改 `data/patents.json`。

### 8. 软著

修改 `data/software.json`。

### 9. 新闻动态

修改 `data/news.json`。

## 本地预览

由于浏览器对 `fetch` 读取本地 JSON 有限制，不建议直接双击 `index.html` 打开。

建议在项目根目录启动一个静态服务器，例如：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

如果你使用 VS Code，也可以直接用 Live Server 插件预览。

## Fork 与更新流程

如果其他同学想基于这个项目搭建自己的课题组主页，可以直接 fork 到自己的 GitHub 仓库，再在自己的仓库里维护和发布。

### 1. Fork 到自己的仓库

1. 打开本项目的 GitHub 页面。
2. 点击右上角 `Fork`。
3. 选择自己的账号作为目标仓库。
4. Fork 完成后，会得到一个属于自己的副本，例如 `yourname/iid-githubio`。

### 2. 克隆到本地

```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名
```

### 3. 修改内容

常见的可修改文件有：

- `data/site.json`
- `data/members.json`
- `data/research.json`
- `data/projects.json`
- `data/research_contributions.json`
- `data/publications.json`
- `data/patents.json`
- `data/software.json`
- `data/news.json`

### 4. 提交并推送更新

```bash
git add .
git commit -m "Update homepage content"
git push origin main
```

如果默认分支不是 `main`，请把命令里的分支名替换成实际分支名。

### 5. 重新部署 GitHub Pages

如果仓库启用了 GitHub Pages，通常只要推送到远程仓库，Pages 会自动重新构建。也可以到仓库的 `Settings -> Pages` 查看部署状态。

### 6. 把更新传回原项目

如果你希望把自己改好的内容合并回原始仓库，可以：

1. 在自己的 fork 中完成修改并推送。
2. 到 GitHub 上发起 `Pull Request`，说明你改了哪些内容。
3. 原仓库维护者审核后决定是否合并。

### 7. 日常同步上游仓库

如果原仓库有更新，而你也想同步到自己的 fork，可以添加上游仓库作为远程源：

```bash
git remote add upstream https://github.com/原作者用户名/原仓库名.git
git fetch upstream
git merge upstream/main
git push origin main
```

如果原仓库默认分支不是 `main`，把 `main` 替换成对应分支名即可。

## 数据维护建议

- 成员头像留空时，页面会自动使用占位图
- 论文、项目、专利列表会自动按年份或时间倒序显示
- 统计页中的数字由脚本自动计算，不需要手工改数字
- 如果某条数据的 DOI 或链接为空，对应按钮不会显示

## 备注

本项目使用原生 HTML、CSS 和 JavaScript 实现，结构简单，适合长期维护和二次扩展。
