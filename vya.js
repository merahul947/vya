const net = require("net");

class ProxyServer {
  constructor(port) {
    this.server = net.createServer();
    this.port = port;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    this.server.listen(this.port, "0.0.0.0", () => {
      console.log(`[${new Date()}] Proxy server started on port ${this.port}`);
    });

    this.server.on("connection", (client) => {
      const clientAddress = client.remoteAddress;
      const clientPort = client.remotePort;
      console.log(
        `[${new Date()}] New connection from ${clientAddress}:${clientPort}`
      );
      this.handleClient(client);
    });
  }

  async handleClient(client) {
    const timeout = 30000; // 30 seconds

    try {
      // Set socket timeout
      client.setTimeout(timeout);

      // Create a promise that resolves with the first data event
      const dataPromise = new Promise((resolve) => {
        client.once("data", (data) => {
          resolve(data);
        });
      });

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        client.once("timeout", () => {
          reject(new Error("Client connection timed out"));
        });
      });

      // Race between data and timeout
      const data = await Promise.race([dataPromise, timeoutPromise]);
      const request = data.toString("ascii");

      await this.writeWithRetry(client, async (stream) => {
        if (
          request.includes("vyaparapp.in/api/ns/license") ||
          request.includes("/api/ns/license")
        ) {
          console.log(
            `[${new Date().toISOString()}] Intercepting Vyapar license request`
          );
          await this.handleVyaparLicenseRequest(request, stream);
        } else if (
          request.includes("vyaparapp.in/api/ns/pricing") ||
          request.includes("/api/ns/pricing")
        ) {
          console.log(
            `[${new Date().toISOString()}] Intercepting Vyapar pricing request`
          );
          await this.handleVyaparPricingRequest(request, stream);
        } else if (request.match(/GET \/ HTTP\/\d\.\d/)) {
          console.log(
            `[${new Date().toISOString()}] Serving welcome page for root URL`
          );
          await this.handleWelcomePage(request, stream);
        }
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.code === "ECONNRESET" || error.code === "EPIPE")
      ) {
        console.log(
          `[${new Date().toISOString()}] Connection handling completed: ${
            error.message
          }`
        );
      }
      throw error;
    } finally {
      client.destroy();
    }
  }

  // Add this method to your class
  async writeWithRetry(stream, writeAction) {
    const maxRetries = 3;
    const delayMs = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await writeAction(stream);
        return;
      } catch (error) {
        if (i < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayMs * (i + 1))
          );
        }
      }
    }
  }

  // Method to handle Vyapar license request
  async handleVyaparLicenseRequest(request, clientStream) {
    const licenseResponse = {
      created_at: "2022-01-01 00:00:00",
      current_date: "2025-02-13 17:05:56",
      expiry_date: "2999-12-31 23:59:59",
      groupTitle: null,
      license_code: "felli0t@Board4All",
      pairExpiryDate: "2999-12-31 23:59:59",
      perDayCost: 0,
      perDayCostUsd: 0,
      plan: "Pos",
      planId: 166,
      planType: 3,
      status: 2,
    };

    const body = JSON.stringify(licenseResponse);
    const response =
      "HTTP/1.1 200 OK\r\n" +
      "Content-Type: application/json; charset=utf-8\r\n" +
      `Content-Length: ${Buffer.byteLength(body)}\r\n` +
      "Connection: close\r\n" +
      "\r\n" +
      body;

    const responseBytes = Buffer.from(response, "utf8");
    await clientStream.write(responseBytes);
    console.log(`[${new Date().toISOString()}] Served Vyapar license response`);
  }

  // New method to handle Vyapar pricing request
  async handleVyaparPricingRequest(request, clientStream) {
    const pricingResponse = {
      data: {
        allowDowngrade: false,
        bannerDiscount: {
          bannerStatus: 0,
        },
        conversionRate: 85.5,
        couponCode: "",
        coupons: [],
        currencyInfo: {
          currencyCode: "INR",
          currencyName: "Rupee",
          currencySymbol: "₹",
          isCurrencyPrefix: true,
        },
        discount: {},
        maxPricedCountryId: 98,
        oldMapping: {
          1: 137,
          10: 142,
          100: 137,
          101: 137,
          102: 137,
          103: 145,
          104: 136,
          105: 139,
          106: 143,
          11: 138,
          110: 110,
          111: 135,
          112: 136,
          113: 137,
          114: 138,
          115: 139,
          116: 140,
          117: 141,
          118: 142,
          119: 143,
          12: 137,
          120: 144,
          121: 145,
          122: 146,
          123: 135,
          124: 136,
          125: 137,
          126: 138,
          127: 139,
          128: 140,
          129: 141,
          13: 141,
          130: 142,
          131: 143,
          132: 144,
          133: 145,
          134: 146,
          14: 138,
          147: 141,
          148: 137,
          149: 145,
          15: 142,
          150: 136,
          151: 139,
          152: 143,
          16: 138,
          17: 142,
          18: 137,
          19: 138,
          2: 138,
          20: 138,
          21: 138,
          22: 141,
          23: 142,
          24: 142,
          25: 142,
          26: 141,
          27: 142,
          28: 142,
          29: 142,
          3: 138,
          30: 137,
          31: 137,
          32: 138,
          33: 138,
          34: 142,
          35: 142,
          36: 141,
          37: 142,
          38: 142,
          39: 142,
          4: 141,
          40: 138,
          41: 141,
          42: 142,
          43: 138,
          44: 137,
          45: 146,
          46: 146,
          47: 142,
          48: 138,
          49: 142,
          5: 137,
          50: 146,
          51: 138,
          52: 142,
          53: 142,
          54: 142,
          55: 146,
          56: 138,
          57: 138,
          58: 137,
          59: 141,
          6: 138,
          60: 141,
          61: 137,
          62: 142,
          63: 142,
          64: 138,
          65: 138,
          66: 142,
          67: 142,
          68: 137,
          69: 141,
          7: 138,
          70: 141,
          71: 137,
          72: 141,
          73: 137,
          74: 135,
          75: 136,
          76: 137,
          77: 138,
          78: 139,
          79: 140,
          8: 142,
          80: 141,
          81: 142,
          82: 143,
          83: 144,
          84: 145,
          85: 146,
          9: 142,
        },
        plans: [
          {
            activePlanId: 135,
            comboAmountPercent: 18.51,
            comboId: 144,
            cost: 1499,
            costRegional: 1499,
            costUsd: 17.53,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Android  3 Year Silver",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 135,
            isActive: 4,
            isGstFee: 0,
            name: "Silver ( 3 Year, Android)",
            originalCost: 2899,
            originalCostUsd: 33.91,
            regionalMrp: 2899,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Silver",
            type: 1,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 136,
            comboAmountPercent: 19.43,
            comboId: 143,
            cost: 699,
            costRegional: 699,
            costUsd: 8.18,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Android 1 Year Silver",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 136,
            isActive: 4,
            isGstFee: 0,
            name: "Silver (1 Year, Android)",
            originalCost: 1099,
            originalCostUsd: 12.85,
            regionalMrp: 1099,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Silver",
            type: 1,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 137,
            comboAmountPercent: 19.03,
            comboId: 145,
            cost: 799,
            costRegional: 799,
            costUsd: 9.35,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Android 1 Year Gold",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 137,
            isActive: 4,
            isGstFee: 0,
            name: "Gold (1 Year, Android)",
            originalCost: 1399,
            originalCostUsd: 16.36,
            regionalMrp: 1399,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Gold",
            type: 1,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 138,
            comboAmountPercent: 18.67,
            comboId: 146,
            cost: 1699,
            costRegional: 1699,
            costUsd: 19.87,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Android 3 Year Gold",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 138,
            isActive: 4,
            isGstFee: 0,
            name: "Gold (3 Year, Android)",
            originalCost: 3799,
            originalCostUsd: 44.43,
            regionalMrp: 3799,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Gold",
            type: 1,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 139,
            comboAmountPercent: 80.56999999999999,
            comboId: 143,
            cost: 3399,
            costRegional: 3399,
            costUsd: 39.75,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Desktop 1 Year Silver",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 139,
            isActive: 4,
            isGstFee: 0,
            name: "Silver (1 Year, Desktop)",
            originalCost: 4599,
            originalCostUsd: 53.79,
            regionalMrp: 4599,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Silver",
            type: 2,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 140,
            comboAmountPercent: 81.48999999999999,
            comboId: 144,
            cost: 7799,
            costRegional: 7799,
            costUsd: 91.22,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Desktop 3 Year Silver",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 140,
            isActive: 4,
            isGstFee: 0,
            name: "Silver (3 Year, Desktop)",
            originalCost: 12599,
            originalCostUsd: 147.36,
            regionalMrp: 12599,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Silver",
            type: 2,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 141,
            comboAmountPercent: 80.97,
            comboId: 145,
            cost: 3699,
            costRegional: 3699,
            costUsd: 43.26,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Desktop 1 Year Gold",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 141,
            isActive: 4,
            isGstFee: 0,
            name: "Gold (1 Year, Desktop)",
            originalCost: 6999,
            originalCostUsd: 81.86,
            regionalMrp: 6999,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Gold",
            type: 2,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 142,
            comboAmountPercent: 81.33,
            comboId: 146,
            cost: 8199,
            costRegional: 8199,
            costUsd: 95.89,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Desktop 3 Year Gold",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 142,
            isActive: 4,
            isGstFee: 0,
            name: "Gold (3 Year, Desktop)",
            originalCost: 18999,
            originalCostUsd: 222.21,
            regionalMrp: 18999,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Gold",
            type: 2,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 143,
            comboAmountPercent: null,
            comboId: null,
            cost: 3999,
            costRegional: 3999,
            costUsd: 46.77,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Desktop+Mobile 1 Year Silver",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 143,
            isActive: 4,
            isGstFee: 0,
            name: "Silver (1 Year, Desktop + Mobile)",
            originalCost: 5699,
            originalCostUsd: 66.65000000000001,
            regionalMrp: 5699,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Silver",
            type: 3,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 144,
            comboAmountPercent: null,
            comboId: null,
            cost: 8699,
            costRegional: 8699,
            costUsd: 101.74,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Desktop+Mobile 3 Year Silver",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 144,
            isActive: 4,
            isGstFee: 0,
            name: "Silver (3 Year, Desktop + Mobile)",
            originalCost: 14299,
            originalCostUsd: 167.24,
            regionalMrp: 14299,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Silver",
            type: 3,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 145,
            comboAmountPercent: null,
            comboId: null,
            cost: 4299,
            costRegional: 4299,
            costUsd: 50.28,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Desktop+Mobile 1 Year Gold",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 145,
            isActive: 4,
            isGstFee: 0,
            name: "Gold (1 Year, Desktop + Mobile)",
            originalCost: 8299,
            originalCostUsd: 97.06,
            regionalMrp: 8299,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Gold",
            type: 3,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 146,
            comboAmountPercent: null,
            comboId: null,
            cost: 8999,
            costRegional: 8999,
            costUsd: 105.25,
            createdAt: "2023-08-28T04:39:57.000Z",
            description: "Desktop+Mobile 3 Year Gold",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 146,
            isActive: 4,
            isGstFee: 0,
            name: "Gold (3 Year, Desktop + Mobile)",
            originalCost: 21999,
            originalCostUsd: 257.3,
            regionalMrp: 21999,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Gold",
            type: 3,
            updatedAt: "2023-08-28T04:39:57.000Z",
          },
          {
            activePlanId: 161,
            comboAmountPercent: 90,
            comboId: 165,
            cost: 7200,
            costRegional: 7200,
            costUsd: 84.20999999999999,
            createdAt: "2025-01-20T06:43:10.000Z",
            description: "Desktop 1 Year Pos",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 161,
            isActive: 4,
            isGstFee: 0,
            name: "Pos (1 Year, Desktop)",
            originalCost: 13500,
            originalCostUsd: 157.89,
            regionalMrp: 13500,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Pos",
            type: 2,
            updatedAt: "2025-01-29T00:17:57.000Z",
          },
          {
            activePlanId: 162,
            comboAmountPercent: 90,
            comboId: 166,
            cost: 15120,
            costRegional: 15120,
            costUsd: 176.84,
            createdAt: "2025-01-20T06:43:10.000Z",
            description: "Desktop 3 Year Pos",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 162,
            isActive: 4,
            isGstFee: 0,
            name: "Pos (3 Year, Desktop)",
            originalCost: 22500,
            originalCostUsd: 263.16,
            regionalMrp: 22500,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Pos",
            type: 2,
            updatedAt: "2025-01-29T00:17:58.000Z",
          },
          {
            activePlanId: 163,
            comboAmountPercent: 10,
            comboId: 165,
            cost: 800,
            costRegional: 800,
            costUsd: 9.359999999999999,
            createdAt: "2025-01-20T06:43:10.000Z",
            description: "Android 1 Year Pos",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 163,
            isActive: 4,
            isGstFee: 0,
            name: "Pos (1 Year, Android)",
            originalCost: 1500,
            originalCostUsd: 17.54,
            regionalMrp: 1500,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Pos",
            type: 1,
            updatedAt: "2025-01-29T00:17:59.000Z",
          },
          {
            activePlanId: 164,
            comboAmountPercent: 10,
            comboId: 166,
            cost: 1680,
            costRegional: 1680,
            costUsd: 19.65,
            createdAt: "2025-01-20T06:43:10.000Z",
            description: "Android 3 Year Pos",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 164,
            isActive: 4,
            isGstFee: 0,
            name: "Pos (3 Year, Android)",
            originalCost: 2500,
            originalCostUsd: 29.24,
            regionalMrp: 2500,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Pos",
            type: 1,
            updatedAt: "2025-01-29T00:18:01.000Z",
          },
          {
            activePlanId: 165,
            comboAmountPercent: null,
            comboId: null,
            cost: 8000,
            costRegional: 8000,
            costUsd: 93.56999999999999,
            createdAt: "2025-01-20T06:43:10.000Z",
            description: "Desktop+Mobile 1 Year Pos",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 165,
            isActive: 4,
            isGstFee: 0,
            name: "Pos (1 Year, Desktop + Mobile)",
            originalCost: 15000,
            originalCostUsd: 175.44,
            regionalMrp: 15000,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Pos",
            type: 3,
            updatedAt: "2025-01-29T00:18:02.000Z",
          },
          {
            activePlanId: 166,
            comboAmountPercent: null,
            comboId: null,
            cost: 16800,
            costRegional: 16800,
            costUsd: 196.49,
            createdAt: "2025-01-20T06:43:10.000Z",
            description: "Desktop+Mobile 3 Year Pos",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 166,
            isActive: 4,
            isGstFee: 0,
            name: "Pos (3 Year, Desktop + Mobile)",
            originalCost: 25000,
            originalCostUsd: 292.4,
            regionalMrp: 25000,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Pos",
            type: 3,
            updatedAt: "2025-01-29T00:18:03.000Z",
          },
          {
            activePlanId: 155,
            comboAmountPercent: 94.09,
            comboId: 159,
            cost: 9408,
            costRegional: 9408,
            costUsd: 110.04,
            createdAt: "2024-10-07T05:43:10.000Z",
            description: "Desktop 1 Year Platinum",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 155,
            isActive: 4,
            isGstFee: 0,
            name: "Platinum (1 Year, Desktop)",
            originalCost: 13600,
            originalCostUsd: 159.06,
            regionalMrp: 13600,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Platinum",
            type: 2,
            updatedAt: "2025-01-09T02:15:15.000Z",
          },
          {
            activePlanId: 156,
            comboAmountPercent: 93.59,
            comboId: 160,
            cost: 18717,
            costRegional: 18717,
            costUsd: 218.91,
            createdAt: "2024-12-06T05:43:10.000Z",
            description: "Desktop 3 Year Platinum",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 156,
            isActive: 4,
            isGstFee: 0,
            name: "Platinum (3 Year, Desktop)",
            originalCost: 26700,
            originalCostUsd: 312.28,
            regionalMrp: 26700,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Platinum",
            type: 2,
            updatedAt: "2025-01-09T02:15:16.000Z",
          },
          {
            activePlanId: 157,
            comboAmountPercent: 5.91,
            comboId: 159,
            cost: 799,
            costRegional: 799,
            costUsd: 9.35,
            createdAt: "2025-01-09T06:43:10.000Z",
            description: "Android 1 Year Platinum",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 157,
            isActive: 4,
            isGstFee: 0,
            name: "Platinum (1 Year, Android)",
            originalCost: 1399,
            originalCostUsd: 16.36,
            regionalMrp: 1399,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Platinum",
            type: 1,
            updatedAt: "2025-01-09T02:15:10.000Z",
          },
          {
            activePlanId: 158,
            comboAmountPercent: 6.41,
            comboId: 160,
            cost: 1699,
            costRegional: 1699,
            costUsd: 19.87,
            createdAt: "2025-01-09T06:43:10.000Z",
            description: "Android 3 Year Platinum",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 158,
            isActive: 4,
            isGstFee: 0,
            name: "Platinum (3 Year, Android)",
            originalCost: 3300,
            originalCostUsd: 38.6,
            regionalMrp: 3300,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Platinum",
            type: 1,
            updatedAt: "2025-01-09T02:15:11.000Z",
          },
          {
            activePlanId: 159,
            comboAmountPercent: null,
            comboId: null,
            cost: 9999,
            costRegional: 9999,
            costUsd: 116.95,
            createdAt: "2025-01-09T06:43:10.000Z",
            description: "Desktop+Mobile 1 Year Platinum",
            duration: 1,
            groupText: null,
            groupTitle: null,
            id: 159,
            isActive: 4,
            isGstFee: 0,
            name: "Platinum (1 Year, Desktop + Mobile)",
            originalCost: 15000,
            originalCostUsd: 175.44,
            regionalMrp: 15000,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Platinum",
            type: 3,
            updatedAt: "2025-01-09T02:15:13.000Z",
          },
          {
            activePlanId: 160,
            comboAmountPercent: null,
            comboId: null,
            cost: 19999,
            costRegional: 19999,
            costUsd: 233.91,
            createdAt: "2025-01-09T06:43:10.000Z",
            description: "Desktop+Mobile 3 Year Platinum",
            duration: 3,
            groupText: null,
            groupTitle: null,
            id: 160,
            isActive: 4,
            isGstFee: 0,
            name: "Platinum (3 Year, Desktop + Mobile)",
            originalCost: 30000,
            originalCostUsd: 350.88,
            regionalMrp: 30000,
            serviceTaxPercent: 0,
            showCutPrice: 1,
            showTag: 0,
            tag: null,
            tier: "Platinum",
            type: 3,
            updatedAt: "2025-01-09T02:15:14.000Z",
          },
        ],
        regionalConversionRate: 1,
      },
      message: "Plans fetched successfully",
      statusCode: 200,
    };

    const body = JSON.stringify(pricingResponse);
    const response =
      "HTTP/1.1 200 OK\r\n" +
      "Content-Type: application/json; charset=utf-8\r\n" +
      `Content-Length: ${Buffer.byteLength(body)}\r\n` +
      "Connection: close\r\n" +
      "\r\n" +
      body;

    const responseBytes = Buffer.from(response, "utf8");
    await clientStream.write(responseBytes);
    console.log(`[${new Date().toISOString()}] Served Vyapar pricing response`);
  }

  // Add a new method for handling the welcome page
  async handleWelcomePage(request, clientStream) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>VYA</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .status {
      background-color: #e8f4fd;
      padding: 10px;
      border-radius: 4px;
      margin-top: 20px;
    }
    .status-active {
      color: #2ecc71;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Vyapar Patcher</h1>
    
    <div class="status">
      <h2>Server Status</h2>
      <p>Proxy Server: <span class="status-active">Active</span></p>
      <p>Listening on port: ${this.port}</p>
      <p>Running since: ${new Date().toISOString()}</p>
    </div>
  </div>
</body>
</html>
    `;

    const response =
      "HTTP/1.1 200 OK\r\n" +
      "Content-Type: text/html; charset=utf-8\r\n" +
      `Content-Length: ${Buffer.byteLength(htmlContent)}\r\n` +
      "Connection: close\r\n" +
      "\r\n" +
      htmlContent;

    const responseBytes = Buffer.from(response, "utf8");
    await clientStream.write(responseBytes);
    console.log(`[${new Date().toISOString()}] Served welcome page`);
  }
}

module.exports = ProxyServer;
