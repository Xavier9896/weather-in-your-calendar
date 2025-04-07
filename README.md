# Weather in Your Calendar

这是一个将天气信息转换为日历订阅格式的服务。使用彩云天气 API 提供天气数据。

## 功能特点

- 支持通过经纬度查询天气
- 支持通过城市名称查询天气
- 支持通过行政区划代码(adcode)查询天气
- 生成 iCalendar 格式的天气日历
- 显示温度、天气状况、日出日落时间等信息
- 支持多种天气指标（温度、降水、风速等）

## 安装

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/weather-in-your-calendar.git
cd weather-in-your-calendar
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
- 创建 `.env` 文件
- 在 `.env` 文件中设置你的彩云天气 API key 和端口：
```
CAIYUN_API_KEY=你的彩云天气API密钥
PORT=3000
```

## 开发

在开发模式下运行：
```bash
npm run dev
```

## 构建与部署

1. 构建项目：
```bash
npm run build
```

这将使用 Rollup 打包项目，生成优化后的代码到 `dist` 目录。

2. 运行生产版本：
```bash
npm start
```

或者使用一条命令构建并运行：
```bash
npm run serve
```

## 使用方法

### 通过城市名称查询：
```
http://localhost:3000/weather-cal?city=北京
```

### 通过经纬度查询：
```
http://localhost:3000/weather-cal?lat=39.9042&lng=116.4074
```

### 通过行政区划代码(adcode)查询：
```
http://localhost:3000/weather-cal?adcode=110100
```

### 参数说明

- `city`: 城市名称（例如：北京、上海、广州）
- `lat`: 纬度
- `lng`: 经度
- `adcode`: 行政区划代码
- `location`: 是否显示位置信息，可选值：`show`（默认）或 `hide`
- `temperature`: 温度显示方式，可选值：`day`（默认，显示平均温度）或 `range`（显示温度范围）

### 查看支持的城市

获取所有支持的城市列表：
```
http://localhost:3000/cities
```

搜索特定城市：
```
http://localhost:3000/cities?q=上海
```

## API 密钥

你需要从 [彩云天气](https://dashboard.caiyunapp.com/) 获取 API 密钥。

## 天气图标说明

| 天气现象 | 图标 |
|---------|------|
| 晴（白天） | ☀️ |
| 晴（夜间） | ✨ |
| 多云（白天） | 🌤 |
| 多云（夜间） | 🌤 |
| 阴 | ☁️ |
| 小雨 | 🌧 |
| 中雨 | 🌧 |
| 大雨 | 🌧 |
| 暴雨 | ⛈ |
| 雾 | 🌫 |
| 小雪 | 🌨 |
| 中雪 | 🌨 |
| 大雪 | 🌨 |
| 暴雪 | 🌨 |
| 浮尘 | 🌫 |
| 沙尘 | 🌫 |
| 大风 | 💨 |

## 许可证

MIT

# Weather in your Calendar   ⛅️ 26°

This is the code powering the [Weather in your Calendar](https://weather.vejnoe.dk/?from=github.com).

It's a simple PHP script generating a .ical formated calendar with a 16 days weather forecast with data from [OpenWeatherMap](https://openweathermap.org/).

[You can try it out here](https://weather.vejnoe.dk/?from=github.com)

![Calendar preview](https://weather.vejnoe.dk/images/weather-calendar-screenshot.png)

## URL parameters

#### Usage
You can upload it to your host and enter the following url like so:

```url
https://yourdomain.com/weather-cal.php?city=London&units=imperial
```

#### Options

Key | Values
--- | ------
`city` | `city name` or <br>`city name,state code` or <br>`city name,state code,country code`
`units` | `metric` or `imperial`
`temperature` | `day` or `low-high`
`location` | `show` or `hide`

## System Requirements

- A calendar application that supports .ical
- A system the supports Unicode 7+ *(Released: 2014 June 16)*

*These are the emojis used so fare:*

#### Emojis in Event Title

Your Browser | Emoji code | API names
------------ | ---------- | ---------
☀️ | `:sunny:` | `01d`
✨ | `:sparkles:` | `01n`
🌤 | `:sun_behind_small_cloud:` | `02d`, ```02n```
☁️ | `:cloud:` | `03d`, `03n`, `04d`, `04n`
🌧 | `:cloud_with_rain:` | `09d`, `09n`
🌦 | `:sun_behind_rain_cloud:` | `10d`, `10n`
⛈ | `:cloud_with_lightning_and_rain:` | `11d`, `11n`
🌨 | `:cloud_with_rain:` | `13d`, `13n`
🌫 | `:fog:` | `50d`, `50n`
🤔 | `:thinking:` | No match

#### Emojis in the Description

Your Browser | Emoji code
------------ | ----------
🌅 | `:sunrise:`
⚡️ | `:zap:`
💧 | `:droplet:`
💨 | `:dash:`
🚩 | `:triangular_flag_on_post:`


## Check it out on Product Hunt

[![Featured on Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=242724&theme=light)](https://www.producthunt.com/posts/weather-in-your-calendar?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-weather-in-your-calendar)
