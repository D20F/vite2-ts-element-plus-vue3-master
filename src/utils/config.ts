interface Config {
    URL: string;
    userId: string;
    token: string;
}
const config: Config = {
    URL: "https://sxngapi.whkxzj.com/sxngApi", // 请修改成你的信息
    userId: "XXXXXXXXX", // 请修改成你的信息
    token: "XXXXXXXXX" // 请修改成你的信息
};

// 本地开发环境下 （如下的信息在本地开发可以当测试用）
if (import.meta.env.MODE === "development") {
    config.URL = "http://192.168.2.135:1009";
    config.userId = "502176cec65773057a9e";
    config.token = "65d444de381a026301a2c7cffb6952b9a86ac235";
}
export default config;
