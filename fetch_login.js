import https from 'https';

https.get('https://ulinkcollege.engagehosted.cn/Login.aspx?ReturnUrl=%2f', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const viewState = data.match(/id="__VIEWSTATE" value="(.*?)"/);
    const viewStateGen = data.match(/id="__VIEWSTATEGENERATOR" value="(.*?)"/);
    const eventVal = data.match(/id="__EVENTVALIDATION" value="(.*?)"/);
    console.log("VIEWSTATE:", viewState ? viewState[1].substring(0, 20) + "..." : "NOT FOUND");
    console.log("VIEWSTATEGENERATOR:", viewStateGen ? viewStateGen[1] : "NOT FOUND");
    console.log("EVENTVALIDATION:", eventVal ? eventVal[1].substring(0, 20) + "..." : "NOT FOUND");
    
    // Also check input names
    const inputs = data.match(/<input[^>]+name="([^"]+)"[^>]*>/g);
    if (inputs) {
      inputs.forEach(i => console.log(i));
    }
  });
});
