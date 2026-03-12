import * as cheerio from "cheerio";
import fs from "fs";

const html = fs.readFileSync("student-details.html", "utf-8");
const $ = cheerio.load(html);

console.log("Title:", $("title").text());
console.log("Body text preview:", $("body").text().substring(0, 500).replace(/\s+/g, " "));

// Let's print all <th> and <td>
$("th").each((_, el) => {
  console.log("TH:", $(el).text().trim());
});

$("td").each((_, el) => {
  const text = $(el).text().trim();
  if (text) console.log("TD:", text.substring(0, 50));
});

$("span").each((_, el) => {
  const id = $(el).attr("id");
  if (id && id.toLowerCase().includes("pupil")) {
    console.log("SPAN ID:", id, "Text:", $(el).text().trim());
  }
});
