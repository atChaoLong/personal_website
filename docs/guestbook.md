# 流星留言板

页面尾部依次为联系区、版权与备案信息、流星留言板、ATCHAOLONG 签名。版权署名、备案链接、邮箱、开场重播和返回顶部位于留言板上方；留言工具栏位于星空上方，星空下沿直接衔接签名，以星空和字母收尾。使用现有 Next.js Node.js 路由和 Node 24 内置 `node:sqlite`，没有新增数据库服务或 npm 依赖。

## 访客体验

- 昵称选填，最多 24 个 Unicode 字符；留言 1–280 个字符，提交后立即公开。
- 每颗流星对应一条真实留言，尾迹长度随留言长度增加。冰蓝与薄荷绿的光核、细尾迹区分远近，留言以两行字幕渐显，落下前淡出；文字避开尾迹，鼠标悬停停住当前流星并展开全文，点击后保持停留。轮换不同长度留言时保持航道时钟和光核位置连续。
- 向下滚动露出 ATCHAOLONG 签名后，流星保持原有速度、方向和尾迹长度，从星空下沿平滑加速落向字母，触发落点闪光、三层涟漪和粒子回弹。长留言的冲击稍强。签名仍被上方内容遮住时不触发隐形冲击；滚动时追踪落点且保持飞行进度，尺寸变化或目标重新被遮住时取消飞行，暂停、后台和减少动态效果时停止自动联动。
- 手机可点击查看；所有留言也能在静态列表里阅读，较早留言通过游标继续加载。流星轮播最近 60 条留言，桌面最多同时 8 颗、手机最多 4 颗。
- 联系区、留言区和备案区统一使用连续的深色背景，薄荷绿用于强调文字、按钮和星光。全宽夜空在上下边缘渐隐，包含远近星群、银河尘带、微光星芒；下沿只留淡淡微光，不用弧线隔开签名。没有留言时仍展示完整星空，不生成虚构访客。没有收到响应时提供重试，发送失败保留输入。
- 星空在接近视口时首次绘制，缓存 320×180 的程序化星云纹理，之后只在尺寸或像素比变化时重绘。星空像素比上限为桌面 1.5、手机 1.25；整体缓慢漂移和桌面 6 颗／手机 4 颗近景星的闪烁只使用 CSS transform/opacity，没有逐帧生成噪声、滤镜动画或逐字 DOM 动画。
- 签名字母的静态残影使用缓存画布，动态粒子按颜色与透明度合批填充，每帧仅计算一次波场；只在受扰动期间更新，桌面最多 60 次／秒、手机最多 30 次／秒，手机签名画布像素比上限为 1.5。流星本身仍使用独立的 CSS 动画。
- 只有留言区在视口附近且页面可见时才播放动画和每 30 秒刷新。支持暂停、键盘浏览列表和系统“减少动态效果”。

## 本地开发

使用 Node 24，按原方式 `npm run dev`。首次访问 `/api/guestbook` 时创建 `data/guestbook.sqlite`。开发时可通过 `GUESTBOOK_DB_PATH` 指定其他文件路径。

`GET /api/guestbook` 返回 `{ messages, total, nextCursor }`；传 `?before=<nextCursor>` 读取上一页，每页最多 60 条。公开响应仅含留言 ID、昵称、正文和时间。

`POST /api/guestbook` 接收 `{ name, body, requestId, website }`。`requestId` 是客户端为一次提交生成的 UUID，重试保持不变，24 小时内不会重复写入。`website` 是应为空的防机器人字段。

请求需来自同站页面并使用 JSON；请求体最多 4096 字节。后端检查字符数、使用 SQL 绑定参数，前端把留言作为纯文本渲染，不执行 HTML、不自动转成外链。

## Docker 数据持久化

Compose 挂载 `guestbook-data:/app/data`，数据库路径为 `/app/data/guestbook.sqlite`。沿用 `bash scripts/deploy.sh` 更新网站，重建容器后留言仍保存在数据卷中。不要运行 `docker compose down -v` 或删除该数据卷，除非明确要清空留言。

镜像中的数据目录属于 `node` 用户，应用以该非 root 用户运行。健康检查同时访问首页和留言 API，因此数据卷不可写或数据库打不开时部署会报错。数据库、WAL/SHM 日志与本地数据目录都从 Git 和 Docker 构建上下文排除，不会写入公开镜像。

Compose 开启 `GUESTBOOK_TRUST_PROXY=1`，前提是网站只通过可信 Nginx 入口访问，且 Nginx **覆盖** `X-Real-IP`。现有网关模板已经如此配置。应用不信任访客提供的 `X-Forwarded-For`。若直接向公网暴露 Next.js，请关闭代理信任或重新配置受信任入口。

基础限制是同一来源 30 秒内一次、10 分钟内三次、24 小时内十次，以及全站每天最多 300 条。限制记录保存在 SQLite 中，重启不能绕过；仅保存带私有随机盐的来源摘要，超过 24 小时的限制记录会在下一次提交时清理。开发环境默认不信任转发头，所有本地请求共享一个限额。暂不包含账号登录和审核队列。

## 站主管理

没有公开管理接口；通过服务器 SSH / 容器管理权限执行以下操作。在项目目录先选中当前镜像：

```bash
export APP_IMAGE="$(cat /var/lib/personal-website/current-image)"
```

查看最近 100 条留言及其 ID：

```bash
docker compose exec web node ops/guestbook.mjs list
```

删除指定留言（把 `123` 替换成要删除的 ID）：

```bash
docker compose exec web node ops/guestbook.mjs delete 123
```

正在访问的页面会在下一次刷新时更新。已删除留言对应的提交重试不能把它立即重新写回。

在线备份使用 SQLite 的备份 API，会包含 WAL 中已提交的数据。不要在应用运行时只复制主 `.sqlite` 文件。

```bash
docker compose exec web node ops/guestbook.mjs backup /app/data/backups/guestbook-2026-09-16.sqlite
docker compose cp web:/app/data/backups/guestbook-2026-09-16.sqlite ./guestbook-backup.sqlite
```

每次使用新的文件名，工具拒绝覆盖已有备份。备份应另存到服务器之外。恢复时先停止本站容器，再用备份替换数据卷中的主库、移除对应旧 WAL/SHM 文件，并保持 `node` 用户的读写权限后启动。操作前保留当前库的备份。

## 验证

```bash
node --test tests/*.test.mjs
npm run build
```

`tests/guestbook.test.mjs` 使用独立临时数据库检查持久化、幂等重试、频率限制、输入与请求来源校验、游标分页、在线备份和删除。生产镜像还需要验证非 root 用户可以写入命名数据卷，并在替换容器后读回留言。

实现参考：[Node 24 SQLite API](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html)、[Next.js 15 Route Handlers](https://nextjs.org/docs/15/app/api-reference/file-conventions/route)。
