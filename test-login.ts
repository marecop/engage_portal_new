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
    formData.append("ReturnUrl", "/");
    formData.append("ctl00_ctl13_TSSM", ";Telerik.Web.UI, Version=2021.3.1111.45, Culture=neutral, PublicKeyToken=121fae78165ba3d4:en-GB:b406acc5-0028-4c73-8915-a9da355d848a:1c2121e");
    formData.append("ctl00_ScriptManager1_HiddenField", "");
    formData.append("__LASTFOCUS", "");
    formData.append("__EVENTTARGET", "");
    formData.append("__EVENTARGUMENT", "");
    formData.append("__VIEWSTATE", viewState);
    formData.append("__VIEWSTATEGENERATOR", viewStateGenerator);
    formData.append("__VIEWSTATEENCRYPTED", "");
    formData.append("__EVENTVALIDATION", eventValidation);
    formData.append("ctl00$hdnUnsavedDataWarningEnabled", "false");
    formData.append("ctl00$hdnHorizontalScrollPosition", "");
    formData.append("ctl00$hdnVerticalScrollPosition", "");
    formData.append("ctl00$hdnStaffRegisterInFlag", "in");
    formData.append("ctl00$hdnPageName", "Login.aspx");
    formData.append("ctl00$PageContent$loginControl$hdnMaxLoginAttempts", "0");
    formData.append("ctl00$PageContent$loginControl$hdnToken", "");
    formData.append("ctl00$PageContent$loginControl$hdnLinkAccount", "0");
    formData.append("ctl00$PageContent$loginControl$hdnIsPWALogin", "false");
    formData.append("ctl00$PageContent$loginControl$hdnIsPupilPortal", "0");
    formData.append("ctl00$PageContent$loginControl$languageSelect$ddlLanguage", "UK English");
    formData.append("ctl00_PageContent_loginControl_languageSelect_ddlLanguage_ClientState", "");
    formData.append("ctl00$PageContent$loginControl$txtUN", username);
    formData.append("ctl00$PageContent$loginControl$txtPwd", password);
    formData.append("ctl00$PageContent$loginControl$txtMFA", "");
    formData.append("ctl00$PageContent$loginControl$cbRememberMe", "on");
    formData.append("ctl00$PageContent$loginControl$btnLogin", "Login");
    formData.append("ctl00$ddlReason", "Select");
    formData.append("ctl00_ddlReason_ClientState", "");
    formData.append("ctl00$txtNotes", "");

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
