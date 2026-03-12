import * as cheerio from "cheerio";
import fs from "fs";

const html = fs.readFileSync("student-details.html", "utf-8");
const $ = cheerio.load(html);

console.log("Looking for pupil details...");
$("table").each((i, el) => {
  console.log("Table", i, "id:", $(el).attr("id"), "class:", $(el).attr("class"));
});

$("div").each((i, el) => {
  const id = $(el).attr("id");
  if (id && id.toLowerCase().includes("pupil")) {
    console.log("Div id:", id);
  }
});
