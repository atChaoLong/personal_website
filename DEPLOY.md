# 正式部署：统一 Nginx + 多项目 Docker

宿主机安装一份 Nginx，统一监听公网 80/443、管理证书、按域名转发。每个项目拥有独立目录和 Compose，只暴露一个宿主机回环端口。本站使用 `127.0.0.1:3001 → 容器 3000`。

```text
公网 80/443 → 宿主机 Nginx
                ├─ www.atchaolong.me → 127.0.0.1:3001 → 个人网站
                ├─ app.example.com  → 127.0.0.1:3002 → 第二个项目
                └─ api.example.com  → 127.0.0.1:3003 → 第三个项目
```

`app.example.com`、`api.example.com` 是后续项目占位示例。本站裸域名 `atchaolong.me` 自动跳转到 www 主站，并保留路径和查询参数。此方案的 Nginx 运行在宿主机，不能把回环地址配置直接用到普通独立 Nginx 容器里。

## 1. 安装 Docker 和 Nginx

登录服务器，执行 `cat /etc/os-release` 确认发行版，按 [Docker 官方安装说明](https://docs.docker.com/engine/install/)安装 Docker Engine、Buildx 和 Compose 插件。

Ubuntu/Debian 安装宿主机 Nginx：

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable --now docker
sudo docker version
sudo docker compose version
nginx -v
```

Rocky/AlmaLinux 等发行版使用其 dnf 包管理器，不要混用 apt 命令。启用 SELinux 的主机，如果日志显示 Nginx 连接上游被策略拒绝，应按发行版说明配置 `httpd_can_network_connect`，不要关闭 SELinux。

本指南使用 `/etc/nginx/conf.d/*.conf`；确认 Nginx 的 http 块包含该目录。面板管理的 Nginx 应使用面板对应配置入口。

## 2. 域名和网络

DNS 控制台将 A 记录 `@` 和 `www` 都指向服务器公网 IPv4，更新已有记录，避免遗留旧地址。没有可用 IPv6 时不要配置 AAAA。

安全组和系统防火墙允许 TCP 80/443，并保留 SSH 端口。3001、3002 等应用端口只绑定回环地址，不向公网开放。当前 Nginx 配置提供 IPv4 入口。

## 3. 上传并启动项目

通过 SFTP 或 Git 将当前源码放到服务器独立目录，例如 `~/apps/personal_website`。包括 `.dockerignore`、`.env.example` 等隐藏文件，不上传 `node_modules/`、`.next/`、`.git/` 或证书。Git 方式需先提交并推送本次修改。

```bash
cd ~/apps/personal_website
cp .env.example .env
```

这是首次配置命令；已有 `.env` 时请编辑并保留其他自定义设置。本站所需内容：

```dotenv
IMAGE_TAG=local
APP_PORT=3001
```

若之前复制过 `.env.cert.example`，务必去掉其中的 `COMPOSE_FILE`。新版 Compose 只包含网站，不再包含 Caddy。

```bash
sudo docker compose config --quiet
sudo docker compose up -d --build
sudo docker compose ps
curl -I http://127.0.0.1:3001
```

预期 web 为 healthy，curl 返回 200。首次构建需要访问 Docker 镜像仓库和 npm registry。启动项目不会占用 80/443，也不会启动或重启 Nginx。

## 4. 上传证书并交给统一 Nginx

将下载的 `www.atchaolong.me.pem` 和 `www.atchaolong.me.key` 通过 SFTP 上传到服务器用户主目录，然后执行：

```bash
sudo install -d -m 700 /etc/nginx/certs/atchaolong.me
sudo install -m 644 ~/www.atchaolong.me.pem /etc/nginx/certs/atchaolong.me/fullchain.pem
sudo install -m 600 ~/www.atchaolong.me.key /etc/nginx/certs/atchaolong.me/privkey.pem
```

证书由宿主机管理，不进入应用容器或镜像，不要把私钥内容提交到 Git 或粘贴到聊天。本次证书覆盖 www 和裸域名，已检查与私钥匹配。PEM 包含站点证书及中间证书，站点证书需位于链文件首位。[Nginx HTTPS 文档](https://nginx.org/en/docs/http/configuring_https_servers.html)

## 5. 启用站点

在项目根目录执行：

```bash
sudo install -m 644 deploy/nginx/atchaolong.conf /etc/nginx/conf.d/atchaolong.conf
sudo nginx -t
```

仅在校验成功后执行：

```bash
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

已有相同域名配置时，更新原配置，避免重复 server_name。保留其他项目配置。

```bash
curl -I https://www.atchaolong.me
curl -I https://atchaolong.me
curl -I http://www.atchaolong.me
```

主站 HTTPS 应返回 200，裸域名和 HTTP 应跳转到主站 HTTPS。不要加 `-k`，这样才能发现证书错误。浏览器再检查中英文切换、开场及页尾。

DNS 尚在传播时，可从本机指定公网 IP 临时验证：

```bash
curl --resolve www.atchaolong.me:443:服务器公网IP -I https://www.atchaolong.me
```

## 6. 后续增加项目

新项目用独立目录、独立 Compose 项目名和不同回环端口。不要给所有项目都用 `name: jcl-portfolio`。示例：

```yaml
name: second-project
services:
  web:
    build: .
    restart: unless-stopped
    ports:
      - "127.0.0.1:3002:3000"
```

最后的 3000 改成该应用实际容器端口；应用应在容器内监听 `0.0.0.0`。

1. 新域名或子域名解析到同一服务器。
2. 在新项目目录构建启动，验证 `http://127.0.0.1:3002`。
3. 准备覆盖新域名的证书。现有证书只覆盖 `atchaolong.me` 和 `www.atchaolong.me`，不覆盖任意其他子域名。
4. 复制 `deploy/nginx/project.conf.example` 为 `/etc/nginx/conf.d/second-project.conf`，修改域名、证书路径、代理端口；不要覆盖个人网站配置。
5. 执行 `sudo nginx -t`，通过后 `sudo systemctl reload nginx`。

同一公网 IP 和 443 可服务多个域名，Nginx 按域名与 TLS SNI 选择站点和证书。[Nginx SNI 文档](https://nginx.org/en/docs/http/configuring_https_servers.html#sni)

新增项目不需要修改个人网站 Compose。模板支持普通 HTTP 和流式响应；需要 WebSocket 的新应用应按其要求增加 Upgrade 转发配置。

## 7. 更新与运维

更新个人网站代码后，仅在该项目目录执行：

```bash
sudo docker compose up -d --build
sudo docker compose logs --tail=100 web
```

不需要重启 Nginx。单副本网站自身可能短暂中断，其他项目容器不会被替换；所有项目仍共享服务器资源与 Nginx，大型构建时需留意资源占用。

停止本站用 `sudo docker compose down`，统一 Nginx 和其他项目保持运行，本站域名暂时可能返回 502。

修改 APP_PORT 时，同时修改 Nginx 的 proxy_pass，重新创建网站容器并校验、重载 Nginx。

手动证书需要在 **2026 年 12 月 7 日前**续签更换。更新 `/etc/nginx/certs/atchaolong.me/` 中两个文件后，运行 `sudo nginx -t`，通过后 `sudo systemctl reload nginx`。不需要重建应用镜像。以后也可为统一入口单独引入 ACME 自动续期。

```bash
sudo docker compose ps
sudo docker compose logs --tail=100 web
sudo tail -n 100 /var/log/nginx/error.log
```

## 从旧 Caddy 方案迁移

尚未部署过的直接按本指南操作。

若已启动旧 Caddy，在替换服务器文件之前，于旧项目目录执行 `sudo docker compose stop caddy` 释放 80/443。保留证书和旧数据卷，上传新版源码，去掉 `.env` 中的 `COMPOSE_FILE`，按本文配置 Nginx。若文件已被替换，用 `sudo docker ps` 找到原项目的 Caddy 容器，只停止该容器。

新 Compose 不再管理旧 Caddy；确认迁移成功后可删除旧的已停止 Caddy 容器。日常更新不需要 `--remove-orphans` 或删除数据卷。

## 验证与依赖记录

本次使用临时测试证书完成 Nginx 配置校验及实际反向代理验证：主站 HTTPS 返回 200，裸域名 HTTPS 和 HTTP 返回 301，路径与查询参数保留。临时证书仅用于本地测试；正式证书仍需在服务器按上文安装并验证。

此前已在 Linux Docker 中验证网站镜像构建、健康检查、中英文页面和静态资源。现有依赖审计曾报告 3 项（1 moderate、2 high），涉及 Next.js 的 PostCSS 依赖及 sharp；入口调整未升级依赖，上线前仍需单独评估处理。不要直接运行可能升级 Next.js 主版本的 `npm audit fix --force`。

配置只在本地准备和验证，尚未连接你的服务器或修改公网 DNS。
