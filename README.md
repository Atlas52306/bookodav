# Booko-DAV - 自部署式电子书WebDAV管理系统

## 简介

Booko-DAV是一个自托管的WebDAV服务器，专为电子书管理而设计，完美兼容KOReader和其他电子阅读器。基于Cloudflare Workers和R2存储构建，提供稳定可靠的云端存储服务。

## 主要特点
 
- 基于Cloudflare R2存储，提供10GB免费存储空间  
- 完全兼容KOReader WebDAV协议  
- 基本身份验证保护，确保您的数据安全  
- 无服务器架构，几乎无需维护  
- 跨平台WebDAV客户端支持  

## 系统架构

```plaintext
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│   客户端    │ HTTP   │ Cloudflare   │  R2 API │  R2 存储    │
│ (KOReader)  │◄──────►│   Worker     │◄───────►│  (bookodav) │
└─────────────┘        └──────────────┘        └─────────────┘
```

## 部署说明

### 前提条件

- Cloudflare 账户
- GitHub 账户
- 信用卡（用于 Cloudflare 账户验证）

### 1. 设置 Cloudflare 账户

#### 1.1 创建和配置 R2 存储桶

1. 登录 [Cloudflare 控制面板](https://dash.cloudflare.com/login)（如果没有账户，请创建一个）
2. 在控制面板侧边栏，找到并点击 **R2 对象存储**
3. 完成账单详情并提交（需要信用卡，但有 10GB 免费存储额度）
4. 点击 **+ 创建存储桶**
5. 将存储桶命名为 `bookodav`（区分大小写）
6. 保留默认选项并创建存储桶

#### 1.2 创建 API 令牌

1. 在 Cloudflare 控制面板中，点击右上角的个人资料图标
2. 选择 [API 令牌](https://dash.cloudflare.com/profile/api-tokens)
3. 点击 **创建令牌**
4. 选择 **编辑 Cloudflare Workers** 模板
5. 在账户资源下拉菜单中选择您的账户
6. 在区域资源下选择"所有区域"
7. 如果需要，添加额外的 R2 存储桶权限
8. 创建令牌并保存
9. **重要**：记下您的 API 令牌，它只会显示一次

#### 1.3 获取账户 ID

1. 在 Cloudflare 控制面板中，查看浏览器地址栏
2. 您的账户 ID 是 URL 中的一部分：`https://dash.cloudflare.com/{账户ID}/home`
3. 复制并保存这个账户 ID

### 2. 设置 GitHub 仓库

#### 2.1 复刻仓库

1. 复刻Booko-DAV仓库到您的 GitHub 账户

#### 2.2 配置仓库密钥

1. 在您复刻的仓库中，点击 **Settings**（设置）
2. 在左侧菜单中，点击 **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下两个密钥：
   - 名称：`CF_API_TOKEN`，值：您之前创建的 Cloudflare API 令牌
   - 名称：`CF_ACCOUNT_ID`，值：您的 Cloudflare 账户 ID

### 3. 部署应用

#### 3.1 启用 GitHub Actions

1. 在您复刻的仓库中，点击 **Actions** 标签
2. 如果看到提示，点击 **I understand my workflows, go ahead and enable them**
3. 在工作流列表中找到 **Deploy** 工作流

#### 3.2 手动触发部署

1. 点击 **Deploy** 工作流
2. 点击 **Run workflow** 按钮
3. 选择 **master** 分支并点击 **Run workflow**
4. 等待工作流完成（可能需要几分钟）

#### 3.3 检查部署状态

1. 点击正在运行的工作流查看详细日志
2. 成功部署后，您将看到绿色的对勾标记
3. 如果部署失败，请查看日志了解详细错误信息

### 4. 配置 Workers 应用

#### 4.1 设置访问凭据

1. 在 Cloudflare 控制面板中，前往 **Workers & Pages**
2. 找到并点击 **bookodav-worker**
3. 点击 **Settings** → **Variables**
4. 点击 **Add variable**
5. 添加以下两个变量（选择类型为 **Secret**）：
   - 名称：`USERNAME`，值：您希望用于访问 WebDAV 的用户名
   - 名称：`PASSWORD`，值：您希望用于访问 WebDAV 的密码
6. 点击 **Save and deploy**

#### 4.2 访问您的应用

1. 在 Workers 页面找到您的应用 URL（例如：`bookodav-worker.username.workers.dev/dav`）
2. 使用这个 URL 和您设置的用户名/密码访问 WebDAV 服务

## KOReader 配置

在KOReader中设置WebDAV：

1. 在KOReader中，前往**设置 → 云存储**
2. 选择**WebDAV**作为服务类型
3. 输入以下详细信息：
   - URL: `https://[your-worker-subdomain].workers.dev`
   - 用户名: 您在Cloudflare Workers变量中设置的用户名
   - 密码: 您在Cloudflare Workers变量中设置的密码
4. 保存配置并开始使用

## 价格结构 (Cloudflare)

| 服务           | 免费层级       | 付费层级          |
|-----------------|-----------------|--------------------|
| R2 存储         | 10GB            | $0.015/GB-月       |
| 请求            | 每日100,000次   | $0.15/百万次       |

## 故障排除

### 部署失败

如果 GitHub Actions 部署失败，请检查：
- 确保 `CF_API_TOKEN` 和 `CF_ACCOUNT_ID` 密钥正确设置
- API 令牌是否有足够的权限
- 令牌是否过期（如果是，请创建新令牌并更新密钥）

### 无法访问应用

如果无法访问您的 WebDAV 服务，请检查：
- Workers 应用是否成功部署
- `USERNAME` 和 `PASSWORD` 变量是否正确设置
- 是否使用了正确的 URL

### 文件操作问题

如果上传或下载文件出现问题：
- 检查 Cloudflare R2 存储桶权限
- 查看 Cloudflare 控制面板中的 R2 日志
- 确认您没有超过免费层级的 10GB 存储限制

## 更新应用

当原始仓库有更新时：
1. 在您复刻的仓库中，点击 **Sync fork**
2. 选择 **Update branch** 或通过 Pull Request 更新
3. 更新后，GitHub Actions 将自动触发新的部署

## 重要链接

- [Cloudflare控制面板](https://dash.cloudflare.com) - 监控使用情况和设置
- [存储定价](https://developers.cloudflare.com/r2/pricing/) - 10GB免费层级详情
- [请求定价](https://developers.cloudflare.com/workers/platform/pricing/) - 每日10万次操作

## 开发与贡献

欢迎贡献和新功能开发。所有贡献必须遵守GPL-3.0许可。

## 行为和更新说明

- 每个列表调用都会缓存约一周，假设应用的使用不会很频繁
- 每次上传或删除新文件时，缓存都会被清除，保持列表的准确性
- 真实数据源始终是您的Cloudflare控制面板，在R2对象存储下，您还可以在那里查看日志
- 任何应用更新都可以从GitHub同步到您的应用

## Dashboard
![Screenshot 2025-03-01 at 15-01-01 BOOKO-DAV - Instructions](https://github.com/user-attachments/assets/92c9f242-6e8a-4236-b9a0-45b1a77cc3b6)
![Screenshot 2025-03-01 at 15-01-17 BOOKO-DAV - Upload](https://github.com/user-attachments/assets/5f02ea04-4d8b-4d92-bde3-6387acb16209)
![Screenshot 2025-03-01 at 15-01-30 BOOKO-DAV - List](https://github.com/user-attachments/assets/18288766-1395-4851-9bb5-c7d516160959)


