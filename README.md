# 十分钟后的你 · FUTURE SIGNAL

悬疑叙事式 AI 反诈互动 H5，适合比赛现场扫码体验或课堂展示。

## 本地运行

```powershell
cd future-signal
node server.mjs
```

打开 `http://localhost:4173`。没有配置 API 时，AI 调查搭档使用安全的离线提示，主剧情始终可玩。

## 接入大模型

服务端支持 OpenAI 兼容的 Chat Completions 接口。启动前设置：

```powershell
$env:AI_API_URL = 'https://your-provider.example/v1/chat/completions'
$env:AI_API_KEY = 'your-key'
$env:AI_MODEL = 'your-model'
node server.mjs
```

前端会优先请求 `/api/chat`，接口不可用或未配置时自动回退离线陪练，不影响比赛演示。

## 交互设计

- **第一章**：收到十分钟后的自己发来的警告。
- **第二、三章**：调查演唱会转票，打开票面、冻结通知和收款信息三份证据。
- **第四、五章**：在催促中选择独立核实、停止追加付款或推进剧情。
- **结局复盘**：展示每个选择、风险线索与现实中的下一步。

所有支付、链接和人物均为虚构，不会触发真实交易。
