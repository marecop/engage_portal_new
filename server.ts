import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    try {
      const loginUrl = "https://ulinkcollege.engagehosted.cn/Login.aspx?ReturnUrl=%2f";
      
      // Step 1: Fetch the login page to get the hidden fields (ViewState, etc.)
      const initialResponse = await axios.get(loginUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        }
      });

      const cookies = initialResponse.headers["set-cookie"] || [];
      const sessionId = cookies.find(c => c.includes("ASP.NET_SessionId"))?.split(";")[0] || "";

      const $ = cheerio.load(initialResponse.data);
      const viewState = $("#__VIEWSTATE").val() as string;
      const viewStateGenerator = $("#__VIEWSTATEGENERATOR").val() as string;
      const eventValidation = $("#__EVENTVALIDATION").val() as string;

      if (!viewState || !viewStateGenerator || !eventValidation) {
        return res.status(500).json({ error: "Failed to extract ASP.NET hidden fields" });
      }

      // Step 2: Send the POST request with the extracted fields
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

      const loginResponse = await axios.post(loginUrl, formData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
          "Cookie": sessionId,
          "Origin": "https://ulinkcollege.engagehosted.cn",
          "Referer": loginUrl
        },
        maxRedirects: 0, // We want to catch the 302 redirect
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Resolve on 302
        }
      });

      // Check if login was successful (usually a 302 redirect to /vle/default.aspx)
      if (loginResponse.status === 302 && loginResponse.headers.location === "/vle/default.aspx") {
        // Extract the auth cookies
        const authCookies = loginResponse.headers["set-cookie"] || [];
        
        // We need to combine the initial sessionId with the new auth cookies
        // Filter out cookies that are just clearing the value (e.g., .ASPXFORMSAUTH=;)
        const validAuthCookies = authCookies
          .map(c => c.split(";")[0])
          .filter(c => !c.endsWith("="));

        const allCookies = [
          sessionId,
          ...validAuthCookies
        ].filter(Boolean).join("; ");

        return res.json({ 
          success: true, 
          message: "Login successful",
          token: allCookies // Return all cookies as the token
        });
      }

      // If we didn't get the expected redirect, login probably failed (e.g., wrong password)
      return res.status(401).json({ error: "Invalid username or password" });

    } catch (error: any) {
      console.error("Login error:", error.message);
      return res.status(500).json({ error: "An error occurred during login" });
    }
  });

  app.post("/api/logout", async (req, res) => {
    const cookies = req.headers.authorization?.replace("Bearer ", "");
    
    if (!cookies) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    try {
      const logoutUrl = "https://ulinkcollege.engagehosted.cn/Login.aspx?action=logout";
      
      const logoutResponse = await axios.get(logoutUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
          "Cookie": cookies,
          "Referer": "https://ulinkcollege.engagehosted.cn/vle/default.aspx"
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      if (logoutResponse.status === 302) {
        return res.json({ success: true, message: "Logged out successfully" });
      }

      return res.status(500).json({ error: "Logout failed" });
    } catch (error: any) {
      console.error("Logout error:", error.message);
      return res.status(500).json({ error: "An error occurred during logout" });
    }
  });

  app.get("/api/activities", async (req, res) => {
    const cookies = req.headers.authorization?.replace("Bearer ", "");
    
    if (!cookies) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    try {
      const activitiesUrl = "https://ulinkcollege.engagehosted.cn/Services/ActivitiesService.asmx/GetSchedulesForPupilPortal";
      
      const activitiesResponse = await axios.post(activitiesUrl, { scheduleID: 18 }, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Content-Type": "application/json; charset=UTF-8",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "Origin": "https://ulinkcollege.engagehosted.cn",
          "Referer": "https://ulinkcollege.engagehosted.cn/vle/default.aspx",
          "Cookie": cookies,
          "X-Requested-With": "XMLHttpRequest"
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Resolve on 401 as well
        }
      });

      if (activitiesResponse.status === 401) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      return res.json(activitiesResponse.data);
    } catch (error: any) {
      console.error("Activities error:", error.message);
      return res.status(500).json({ error: "An error occurred while fetching activities" });
    }
  });

  app.get("/api/timetable", async (req, res) => {
    const cookies = req.headers.authorization?.replace("Bearer ", "");
    
    if (!cookies) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    try {
      const response = await axios.get("https://ulinkcollege.engagehosted.cn/VLE/WeeklyTimetable.aspx", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Cookie": cookies
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      if (response.status === 401 || response.status === 302) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const $ = cheerio.load(response.data);
      const lessons: any[] = [];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

      $('tr').each((i, tr) => {
        let currentDay = '';

        // Try to find the day in this row
        $(tr).find('td, th').each((j, cell) => {
          const cellText = $(cell).text().trim();
          const foundDay = days.find(d => cellText.toLowerCase() === d.toLowerCase() || cellText.toLowerCase().includes(d.toLowerCase()));
          if (foundDay && !currentDay) {
            currentDay = foundDay;
          }

          // If we have a day, look for lessons in the cells
          if (currentDay) {
            const cellHtml = $(cell).html() || '';
            // Replace common block elements and breaks with newlines
            const cleanText = cellHtml
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<\/div>/gi, '\n')
              .replace(/<\/p>/gi, '\n')
              .replace(/<[^>]+>/g, ' ') // Strip remaining tags
              .split('\n')
              .map(s => s.trim())
              .filter(s => s.length > 0);

            const timeRegex = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;
            const timeMatch = cleanText.find(s => timeRegex.test(s));

            if (timeMatch) {
              const timeStr = timeMatch.match(timeRegex)![0];
              const startTime = timeMatch.match(timeRegex)![1];
              const endTime = timeMatch.match(timeRegex)![2];

              const otherParts = cleanText.filter(s => s !== timeMatch);

              let period = '';
              let subject = '';
              let room = '';
              let teacher = '';

              otherParts.forEach(part => {
                const lowerPart = part.toLowerCase();
                if (lowerPart.includes('period') || lowerPart.includes('节') || lowerPart.match(/^p\d+$/)) {
                  period = part;
                } else if (lowerPart.includes('room') || lowerPart.includes('classroom') || part.match(/^[A-Z]+\d+/)) {
                  room = part;
                } else if (!subject) {
                  subject = part;
                } else if (!teacher) {
                  teacher = part;
                } else {
                  subject += ' ' + part; // fallback
                }
              });

              // Normalize day to English for easier frontend handling
              let normalizedDay = currentDay;
              if (currentDay.includes('一')) normalizedDay = 'Monday';
              if (currentDay.includes('二')) normalizedDay = 'Tuesday';
              if (currentDay.includes('三')) normalizedDay = 'Wednesday';
              if (currentDay.includes('四')) normalizedDay = 'Thursday';
              if (currentDay.includes('五')) normalizedDay = 'Friday';

              lessons.push({
                day: normalizedDay,
                startTime,
                endTime,
                time: timeStr,
                subject: subject || 'Unknown',
                room: room || '',
                teacher: teacher || '',
                period: period || '',
                raw: cleanText
              });
            }
          }
        });
      });

      // Sort lessons by start time
      lessons.sort((a, b) => a.startTime.localeCompare(b.startTime));

      return res.json({ lessons });
    } catch (error: any) {
      console.error("Timetable error:", error.message);
      return res.status(500).json({ error: "An error occurred while fetching timetable" });
    }
  });

  app.get("/api/pupil-id", async (req, res) => {
    const cookies = req.headers.authorization?.replace("Bearer ", "");
    
    if (!cookies) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    try {
      const response = await axios.get("https://ulinkcollege.engagehosted.cn/VLE/pupildetails.aspx?detail=PupilDetails", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Cookie": cookies
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      if (response.status === 401 || response.status === 302) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const html = response.data;
      let pupilId = null;

      // Regex patterns ported from the Python script
      const patterns = [
        /pupilIDs?:\s*["'](\d+)["']/i,
        /Pupil[^=]*?=\s*["'](\d+)["']/i,
        /value=["'](\d{3,5})["']/i,
        /pupil.*?["'](\d+)["']/i,
        /(\d{4})/
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          pupilId = match[1];
          break;
        }
      }

      if (pupilId) {
        return res.json({ pupilId });
      } else {
        return res.status(404).json({ error: "Could not find pupil ID in HTML" });
      }
    } catch (error: any) {
      console.error("Pupil ID error:", error.message);
      return res.status(500).json({ error: "An error occurred while fetching pupil ID" });
    }
  });

  app.post("/api/report-services/:action", async (req, res) => {
    const cookies = req.headers.authorization?.replace("Bearer ", "");
    const { action } = req.params;

    if (!cookies) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    try {
      const response = await axios.post(`https://ulinkcollege.engagehosted.cn/Services/ReportCommentServices.asmx/${action}`, req.body, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Content-Type": "application/json; charset=UTF-8",
          "Cookie": cookies,
          "Origin": "https://ulinkcollege.engagehosted.cn",
          "Referer": "https://ulinkcollege.engagehosted.cn/VLE/pupildetails.aspx?detail=PupilDetails",
          "X-Requested-With": "XMLHttpRequest"
        },
        validateStatus: function (status) {
          return true; // Resolve all statuses to see the error body
        }
      });

      if (response.status === 401 || response.status === 302) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Write to file for debugging
      fs.writeFileSync(`debug_${action}.json`, JSON.stringify({
        status: response.status,
        data: response.data
      }, null, 2));

      return res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error(`Report service error (${action}):`, error.message);
      return res.status(500).json({ error: `An error occurred while fetching ${action}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
