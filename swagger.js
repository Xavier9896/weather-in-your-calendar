import swaggerJsdoc from "swagger-jsdoc";
export * as swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "天气日历订阅服务 API",
      version: "1.0.0",
      description: "一个提供天气日历订阅服务的API",
    },
    servers: [
      {
        url: "http://134.175.62.249:3000",
        description: "开发服务器",
      },
    ],
  },
  apis: ["./routes/*.js"], // 扫描routes目录下的所有js文件
};

export const swaggerSpec = swaggerJsdoc(options);
