import request from "request-promise";
import fs from "fs";
import colors from "colors";

const readProxies = () => {
    return fs.readFileSync("./proxies.txt", "utf-8").split(/\r?\n/).map(addy => {
        let [ip, port, user, password] = addy.split(":");

        let proxy = `http://${user}:${password}@${ip}:${port}`;

        return {
            ip,
            port,
            user,
            password,
            proxy
        }
    });
}

const checkIfValidIp = async (proxy) => {
    try {
        let start = new Date();

        const response = await request("https://api.myip.com", {
            "method": "GET",
            "proxy": proxy.proxy,
            "resolveWithFullResponse": true,
            "simple": false
        });

        let end = new Date();

        const responseTime = end - start;
        const parsedBody = JSON.parse(response.body);

        console.log(colors.yellow(`Recived: ${parsedBody.ip} -> Expected: ${proxy.ip} -> ${colors[proxy.ip == parsedBody.ip ? "green" : "red"](proxy.ip == parsedBody.ip ? "VALID" : "NOT VALID")} | Speed: ${colors[responseTime <= 1200 ? "green" : "red"](responseTime)}`));
    } catch (e) {
        console.log(colors.red(`Error occured while checking: ${proxy.ip} | ${e.message}`));
    }
}

(async function () {
    const proxies = readProxies();

    for (let proxy of proxies) {
        await checkIfValidIp(proxy);
    }
}()); 