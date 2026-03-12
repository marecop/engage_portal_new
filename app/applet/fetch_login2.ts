import axios from 'axios';
import * as cheerio from 'cheerio';

async function testLogin() {
  const loginUrl = "https://ulinkcollege.engagehosted.cn/Login.aspx?ReturnUrl=%2f";
  
  const initialResponse = await axios.get(loginUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    }
  });

  const cookies = initialResponse.headers["set-cookie"] || [];
  const sessionId = cookies.find(c => c.includes("ASP.NET_SessionId"))?.split(";")[0] || "";

  const $ = cheerio.load(initialResponse.data);
  const formData = new URLSearchParams();

  // Extract all hidden inputs
  $("input[type='hidden']").each((_, el) => {
    const name = $(el).attr("name");
    const value = $(el).attr("value") || "";
    if (name) {
      formData.append(name, value);
    }
  });

  // Add specific login fields
  formData.append("ctl00$PageContent$loginControl$txtUN", "testuser");
  formData.append("ctl00$PageContent$loginControl$txtPwd", "testpass");
  formData.append("ctl00$PageContent$loginControl$btnLogin", "Login");

  console.log("POST URL:", loginUrl);
  console.log("Cookies:", sessionId);
  console.log("POST Body Parameters:");
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  }
}

testLogin();
