const ProxyServer = require("./vya");

const proxy = new ProxyServer(3000); // Choose any port
proxy.start();
