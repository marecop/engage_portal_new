import axios from "axios";
import fs from "fs";

async function main() {
  const cookies = "ASP.NET_SessionId=eypo3mxpa304v3uakmr4fys1; .ASPXFORMSAUTH=A5C7AAFD55046A7730BCB866A114DBA6025B89E495ADBE6318BA4B22A8C9939BD404CD56F721306CD91556C839A3F7385439C0A310A53867672F8B8C96C788A908E052FBB663C74B2A13056372198DE50E70AC1787AD42DD257E4FA4139204A7C760650B621CF7034B8C438AEDC82CC9D542FCC7";
  
  try {
    const response = await axios.post("https://ulinkcollege.engagehosted.cn/Services/PupilDetailsServices.asmx/RenderSimpleSection", {
      encryptedPupilID: "wbDPGBLaosgCAfitoDds7w==",
      sectionType: "PupilDetails"
    }, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Cookie": cookies,
        "Content-Type": "application/json; charset=utf-8"
      }
    });
    
    fs.writeFileSync("RenderSimpleSection.json", JSON.stringify(response.data));
    console.log("Saved to RenderSimpleSection.json");
  } catch (err) {
    console.error(err);
  }
}

main();
