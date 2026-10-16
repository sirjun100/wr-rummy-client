// @ts-nocheck
// Recovered from index.js:653
import GameConfig from "./GameConfig";
const URLConfig = {
  // Keep failover addresses separate from older test/production installations.
  httpHostCacheKey:
    1 == GameConfig.SERVER_DEBUG
      ? "TMP_HOST_URLS:47.114.61.208"
      : "TMP_HOST_URLS:mrummy.xuanxi.net",
  orginHttp_CurHttpUrl:
    1 == GameConfig.SERVER_DEBUG ? "47.114.61.208:3040" : "mrummy.xuanxi.net",
  orginHttp_tcp:
    1 == GameConfig.SERVER_DEBUG
      ? "ws://47.114.61.208:28002"
      : "wss://mrummy.xuanxi.net:443",
  WS_LABA:
    1 == GameConfig.SERVER_DEBUG
      ? "ws://47.114.61.208:19108"
      : "ws:speaker.masterummy.com:19108",
  SDK_URL: 1 == GameConfig.SERVER_DEBUG ? "" : "",
  SDK_URL2: "",
  CPP_URL: "",
  update_url:
    1 == GameConfig.SERVER_DEBUG
      ? ["http://47.114.61.208:3040/api.php"]
      : ["https://mrummy.xuanxi.net/api.php"],
  kyc_img_url: "",
  googleplay_url: "",
  appstore_url: "",
  calendar_master_url: "https://share2.masterummy.com/",
  calendar_circ_url: "https://share2.cric11.net",
};
export default URLConfig;
