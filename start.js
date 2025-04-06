const ProxyServer = require("./vya");

const proxy = new ProxyServer(80); // Choose any port
proxy.start();
