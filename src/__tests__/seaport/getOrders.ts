import { assert, expect } from "chai";
import { suite, test } from "mocha";
import Web3 from "web3";
import { RINKEBY_PROVIDER_URL } from "../../constants";
import { OpenSeaPort } from "../../index";
import { Network } from "../../types";
import { RINKEBY_API_KEY } from "../constants";
import { assertIsOrderV2 } from "../utils";

// Client setup
const rinkebyProvider = new Web3.providers.HttpProvider(RINKEBY_PROVIDER_URL);
const rinkebyClient = new OpenSeaPort(rinkebyProvider, {
  networkName: Network.Rinkeby,
  apiKey: RINKEBY_API_KEY,
  // TODO: Remove once regular testnets (production unleash flags) supports seaport orders
  apiBaseUrl: "https://testnet-api.staging.openseabeta.com",
});

suite.only("Getting orders", () => {
  ["ask", "bid"].forEach((side) => {
    test(`getOrder should return a single order > ${side}`, async () => {
      const order = await rinkebyClient.api.getOrder({
        protocol: "seaport",
        side: "ask",
      });
      assertIsOrderV2(order);
    });
  });

  test(`getOrder should throw if no order found`, async () => {
    let didThrow = false;
    try {
      const _order = await rinkebyClient.api.getOrder({
        protocol: "seaport",
        side: "ask",
        maker: "0x000000000000000000000000000000000000dEaD",
      });
    } catch (error) {
      expect((error as Error).message).to.equal(
        "Not found: no matching order found"
      );
      didThrow = true;
    }
    if (!didThrow) {
      assert.fail("Expected getOrder to throw");
    }
  });

  ["ask", "bid"].forEach((side) => {
    test(`getOrders should return a list of orders > ${side}`, async () => {
      const { orders, next, previous } = await rinkebyClient.api.getOrders({
        protocol: "seaport",
        side: "ask",
      });
      orders.map(assertIsOrderV2);
      expect(next).to.not.be.undefined;
      expect(previous).to.not.be.undefined;
    });
  });
});