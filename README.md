# 日历天气订阅服务

这是一个基于 Node.js 的日历天气订阅服务，提供天气预报信息功能。用户可以通过订阅生成的日历文件，在日历应用中查看未来多天的天气预报。

## 功能特点

- 支持未来15天的天气预报
- 生成标准的 iCal 格式日历文件
- 使用表情符号展示天气状况
- 天气数据缓存功能，优化请求频率

## 技术栈

- Node.js
- Express
- SQLite3
- Axios
- Day.js

## 安装与使用

1. 克隆项目
```
git clone https://github.com/yourusername/weather-in-your-calendar.git
```

2. 安装依赖
```
cd weather-in-your-calendar
npm install
```

3. 创建 .env 文件并配置（参考 .env.example）

4. 启动服务
```
npm start
```

开发模式：
```
npm run dev
```

## API 参数

访问 URL 示例：
```
http://localhost:3000/weather?areaCode=370100
```

| 参数名 | 说明 | 可选值 | 默认值 |
|-------|------|-------|-------|
| areaCode | 地区代码 | 城市区域代码 | - |
| location | 是否显示位置 | show/hide | show |
| temperature | 温度显示格式 | day/minmax | day |

## 许可证

ISC
