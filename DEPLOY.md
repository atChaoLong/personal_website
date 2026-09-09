# Docker + 域名部署

适用于一台新 Linux 服务器，80/443 未被其他服务占用。请求路径：浏览器 → Caddy（HTTPS）→ Next.js 网站容器。无需在宿主机安装 Node.js、npm 或 Nginx。

## 1. 安装 Docker

先运行 `cat /etc/os-release` 确认发行版，按照 [Docker 官方 Linux 安装文档](https://docs.docker.com/engine/install/)选择 Ubuntu、Debian、CentOS 等对应说明，安装 Docker Engine、Buildx 和 Compose 插件。Ubuntu 可直接参考[官方 Ubuntu 安装步骤](https://docs.docker.com/engine/install/ubuntu/#install-using-the-apt-repository)。不要把 Ubuntu 的安装命令直接用到其他发行版。

安装后验证并启用开机启动：

```bash
sudo systemctl enable --now docker
sudo docker version
sudo docker compose version
```

首次构建需要服务器能够访问 Docker Hub 和 npm registry。

## 2. 配置域名与网络

在域名服务商的 DNS 控制台添加 A 记录。以 `example.com` 为例：

| 要访问的地址 | 记录类型 | 主机记录 | 记录值 |
| --- | --- | --- | --- |
| example.com | A | @ | 服务器公网 IPv4 |
| me.example.com（若选择子域名） | A | me | 服务器公网 IPv4 |

选择一个访问地址即可，`.env` 中的 `DOMAIN` 与它一致。只有服务器具有可用公网 IPv6 时才配置 AAAA；已有的错误 AAAA 记录需要更正。首次配置时可使用纯 DNS 解析，便于直接排查证书问题。

在云服务器安全组及系统防火墙中允许入站 TCP 80、443；UDP 443 可选，用于 HTTP/3。保留原本的 SSH 访问端口。网站的 3000 端口仅供容器之间通信，不需要对公网开放。

可用下面的命令检查解析：

```bash
getent ahostsv4 example.com
```

将 `example.com` 替换成你的域名，确认返回服务器公网 IP。

## 3. 把项目放到服务器

将包含本次部署文件的代码提交并推送到自己的仓库，然后在服务器执行：

```bash
git clone <你的仓库地址> personal_website
cd personal_website
```

也可以使用 SFTP 上传当前项目源码，包含隐藏文件 `.dockerignore` 和 `.env.example`，以及 `deploy` 目录。不需要上传 `node_modules`、`.next` 或 `.git`。

之后的命令都在项目根目录执行：

```bash
cp .env.example .env
nano .env
```

至少修改这一行：

```dotenv
DOMAIN=example.com
```

填写你自己的完整域名，例如 `me.example.com`，不要包含 `https://`、路径或末尾斜杠。当前配置绑定一个域名，不会自动添加 `www`。`.env` 已被 Git 忽略，也不会打进网站镜像。

## 4. 构建并启动

```bash
sudo docker compose config --quiet
sudo docker compose up -d --build
sudo docker compose ps
sudo docker compose logs --tail=100 web caddy
```

首次构建会安装依赖并编译网站。`web` 健康检查通过后启动 Caddy。DNS 和端口正确时，Caddy 会自动申请证书、把 HTTP 跳转到 HTTPS，并持续自动续期。[Caddy 自动 HTTPS 文档](https://caddyserver.com/docs/automatic-https)

浏览器访问 `https://你的域名`。还可以验证：

```bash
curl -I http://example.com
curl -I https://example.com
```

预期 HTTP 跳转到 HTTPS，HTTPS 返回 200。访问 `/?lang=zh` 和 `/?lang=en` 可以验证两种语言。

## 5. 更新、日志与停止

更新源代码后重新构建并替换网站容器：

```bash
git pull --ff-only
sudo docker compose up -d --build
```

单机单副本更新可能有短暂中断。构建失败时先查看错误，修复后重试。

```bash
# 持续查看日志（Ctrl+C 只退出查看，不会停止网站）
sudo docker compose logs -f --tail=100

# 重新启动
sudo docker compose restart

# 停止本项目，保留证书数据卷
sudo docker compose down
```

容器设有 `unless-stopped` 重启策略；Docker 随服务器启动后，未被手动停止的容器会恢复运行。证书保存在 `caddy_data` 数据卷内，日常更新不需要删除它，不要在普通更新时使用 `down -v`。

如需保留可回退的镜像，每次更新前给 `.env` 的 `IMAGE_TAG` 设置唯一版本，例如 `2026-09-09-v1`，再执行构建。回退时改回保留的旧版本标签，并执行 `sudo docker compose up -d --no-build web`；应保留与旧版本匹配的部署配置。

## 常见问题

- **证书申请失败**：检查 A/AAAA 解析、云安全组与系统防火墙的 80/443，以及 `sudo docker compose logs --tail=100 caddy`。改正后重试，不要反复删除证书卷。
- **502 或 web 不健康**：查看 `sudo docker compose logs --tail=100 web` 与 `sudo docker compose ps`。
- **构建期间进程被 Killed**：检查服务器内存和日志；可以增加内存/交换空间，或在同架构机器构建镜像再导入服务器。
- **修改 DOMAIN 后不生效**：运行 `sudo docker compose up -d caddy` 重新创建容器；单纯 `restart` 不会加载新的环境变量。
- **需要 www 也能访问**：先给 `www` 配置 DNS，再把 Caddyfile 的站点地址改成 `{$DOMAIN}, www.example.com`（替换为真实域名），然后运行 `sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile`。

## 可选：已有宿主机 Nginx / 宝塔

新服务器按上面的默认方案即可。仅当已有宿主机反向代理时，使用附带的端口覆盖文件，只启动网站服务：

```bash
sudo docker compose -f compose.yaml -f compose.proxy.yaml up -d --build web
```

然后在已有代理中把域名反向代理到 `http://127.0.0.1:3000`，由已有代理管理证书。若端口已占用，修改 `.env` 中的 `APP_PORT`。这个地址用于宿主机代理；其他容器内的 `127.0.0.1` 指向自身，需要另外配置共享 Docker 网络。

不要同时启动本项目 Caddy 和已有的 80/443 服务。若此前已经启动本项目 Caddy，先执行 `sudo docker compose stop caddy`。

## 镜像说明

Dockerfile 使用多阶段构建、锁文件安装依赖、非 root 用户运行、健康检查及 Next.js `standalone` 输出，并复制必要静态资源。镜像构建不会使用本机 `.next`。部署前不需要先在 Windows 上运行 `npm run build`。[Next.js standalone 文档](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)

## 本次本地验证

已在 Linux Docker 容器内完成生产构建：网站健康检查通过，中英文首页及 JavaScript 静态资源均返回 200，运行用户为 `node`；Compose 配置和 Caddy 配置验证通过。尚未在你的服务器上启动，也未验证真实域名证书签发。

构建期间 npm 提示现有锁文件的依赖告警。通过官方 registry 执行 `npm audit --omit=dev` 确认 3 项（1 moderate、2 high），涉及 Next.js 的 PostCSS 依赖及 sharp。此部署改动保留现有应用版本，没有自动执行可能升级 Next.js 主版本的 `npm audit fix --force`。这些是依赖审计结果，不代表已验证的本站可利用路径；正式上线前应单独评估并处理对应依赖更新。
