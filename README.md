# 课题组主页静态站点模板

这是一个适合高校课题组、实验室或科研团队使用的纯静态主页项目，专门面向 GitHub Pages 部署。

## 特点

- 纯前端实现，不依赖 Node.js 后端、不依赖数据库
- 所有内容统一放在 `data/` 目录下的 JSON 文件中
- 页面通过 `fetch` 动态读取 JSON 并渲染
- 响应式布局，适配电脑、平板和手机
- 支持成员页、项目详情页、成果统计页
- 统计数据自动从 `publications.json`、`projects.json`、`patents.json` 计算生成

## 项目结构

```text
.
├── index.html
├── stats.html
├── member.html
├── project.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── index.js
│       ├── stats.js
│       ├── member.js
│       └── project.js
└── data/
    ├── site.json
    ├── members.json
    ├── research.json
    ├── projects.json
    ├── publications.json
    ├── patents.json
    ├── software.json
    └── news.json
```

## 如何修改数据

所有展示内容都在 `data/` 目录下维护。

### 1. 网站基本信息

修改 `data/site.json`，包括：

- 课题组名称
- 简介和研究特色
- 联系方式
- 导航菜单
- 页脚说明

### 2. 团队成员

修改 `data/members.json`。

每个成员建议包含：

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

修改 `data/projects.json`。

建议字段：

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

### 5. 论文

修改 `data/publications.json`。

建议字段：

- `title`
- `authors`
- `journal`
- `volume`
- `issue`
- `pages`
- `year`
- `doi`
- `link`

### 6. 专利

修改 `data/patents.json`。

### 7. 软著

修改 `data/software.json`。

### 8. 新闻动态

修改 `data/news.json`。

## 如何本地预览

由于浏览器对 `fetch` 读取本地 JSON 的限制，不建议直接双击 `index.html` 打开。

建议在项目根目录启动一个静态服务器，例如：

```bash
python -m http.server 8000
```

然后在浏览器中访问：

```text
http://localhost:8000
```

如果你用 VS Code，也可以直接使用 Live Server 插件预览。

## 如何提交到 GitHub

1. 新建一个 GitHub 仓库
2. 将本项目代码提交到仓库
3. 推送到 GitHub：

```bash
git add .
git commit -m "Create lab homepage"
git push origin main
```

如果你使用的是其他默认分支，把 `main` 换成对应分支名。

## 如何启用 GitHub Pages

1. 打开 GitHub 仓库页面
2. 进入 `Settings`
3. 找到 `Pages`
4. 在 `Build and deployment` 中选择：
   - `Source`: Deploy from a branch
   - `Branch`: `main`
   - `Folder`: `/ (root)`
5. 保存后等待几分钟
6. GitHub 会生成一个可访问的网址

## 数据维护建议

- 成员头像留空时，页面会自动使用占位图
- 论文、项目、专利列表会自动按年份或时间倒序显示
- 统计页中的数字由脚本自动计算，不需要手工改数字
- 如果某条数据的 DOI 或链接为空，对应按钮不会显示

## 备注

本项目使用原生 HTML、CSS 和 JavaScript 实现，结构简单，适合长期维护和二次扩展。
