import * as cheerio from "cheerio";
import fs from "fs";

const html = fs.readFileSync("student-details.html", "utf-8");
const $ = cheerio.load(html);

console.log("Looking for select all...");
$("body *").each((_, el) => {
  const text = $(el).text().trim();
  if (text.toLowerCase().includes("select all")) {
    console.log("Found select all in:", el.tagName, $(el).attr("class"), $(el).attr("id"));
  }
});

console.log("Looking for 3373...");
$("body *").each((_, el) => {
  const text = $(el).text().trim();
  if (text.includes("3373")) {
    console.log("Found 3373 in:", el.tagName, $(el).attr("class"), $(el).attr("id"));
  }
});
