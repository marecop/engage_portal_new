import fs from "fs";
const html = fs.readFileSync("student-details.html", "utf-8");
console.log(html.substring(0, 1000));
console.log("Length:", html.length);
