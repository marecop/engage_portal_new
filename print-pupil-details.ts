import * as cheerio from "cheerio";
import fs from "fs";

const html = fs.readFileSync("student-details.html", "utf-8");
const $ = cheerio.load(html);

console.log($("#PupilDetails").html());
