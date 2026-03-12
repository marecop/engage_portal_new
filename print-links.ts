import * as cheerio from "cheerio";
import fs from "fs";

const html = fs.readFileSync("default-page.html", "utf-8");
const $ = cheerio.load(html);

$("a").each((_, el) => {
  const href = $(el).attr("href");
  const text = $(el).text().trim();
  if (href && !href.startsWith("javascript")) {
    console.log("Link:", text, "->", href);
  }
});
