import axios from "axios";
import * as cheerio from "cheerio";

async function testLogin() {
  const username = "zhahuang2868@guiscn.com";
  const password = "Hzj20100309";
  const loginUrl = "https://ulinkcollege.engagehosted.cn/Login.aspx?ReturnUrl=%2f";

  try {
    console.log("Step 1: Fetching login page...");
    const initialResponse = await axios.get(loginUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      }
    });

    const cookies = initialResponse.headers["set-cookie"] || [];
    console.log("Initial Cookies:", cookies);
    const sessionId = cookies.find(c => c.includes("ASP.NET_SessionId"))?.split(";")[0] || "";

    const $ = cheerio.load(initialResponse.data);
    const viewState = $("#__VIEWSTATE").val() as string;
    const viewStateGenerator = $("#__VIEWSTATEGENERATOR").val() as string;
    const eventValidation = $("#__EVENTVALIDATION").val() as string;

    console.log("Extracted hidden fields:", {
      viewState: viewState ? "Found" : "Missing",
      viewStateGenerator: viewStateGenerator ? "Found" : "Missing",
      eventValidation: eventValidation ? "Found" : "Missing"
    });

    const formData = new URLSearchParams();
    
    $("input[type='hidden']").each((_, el) => {
      const name = $(el).attr("name");
      const value = $(el).attr("value") || "";
      if (name) {
        formData.append(name, value);
      }
    });

    formData.append("ctl00$PageContent$loginControl$txtUN", username);
    formData.append("ctl00$PageContent$loginControl$txtPwd", password);
    formData.append("ctl00$PageContent$loginControl$btnLogin", "Login");

    console.log("Step 2: Sending POST request...");
    const loginResponse = await axios.post(loginUrl, formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        "Cookie": sessionId,
        "Origin": "https://ulinkcollege.engagehosted.cn",
        "Referer": loginUrl
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });

    console.log("Login Response Status:", loginResponse.status);
    console.log("Login Response Headers Location:", loginResponse.headers.location);
    console.log("Login Response Cookies:", loginResponse.headers["set-cookie"]);

  } catch (error: any) {
    console.error("Test failed:", error.message);
  }
}

testLogin();
