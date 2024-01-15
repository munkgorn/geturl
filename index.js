const express = require('express')
const app = express()
const port = 3456
const puppeteer = require('puppeteer'); // v20.7.4 or later
const _ = require('lodash');


app.use(express.json());
app.post('/kex', async (req, res) => {
  console.log('req.body',req.body?.code);
  if (!req.body?.code) {
    console.log('ส่งค่า code [ ] มา');
  }
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const timeout = 5000;
  page.setDefaultTimeout(timeout);

  {
      const targetPage = page;
      await targetPage.setViewport({
          width: 1241,
          height: 963
      })
  }
  {
      const targetPage = page;
      const promises = [];
      const startWaitingForEvents = () => {
          promises.push(targetPage.waitForNavigation());
      }
      startWaitingForEvents();
      await targetPage.goto('https://th.kerryexpress.com/th/track/');
      await targetPage.setRequestInterception(true);
      // Intercept network requests
      await targetPage.on('request', (request) => {
        request.continue();
      });
    
      // Capture the response
      await targetPage.on('response', async (response) => {
        if (_.startsWith(response.url(), 'https://th.kerryexpress.com/th/track/?track=')) {
          console.log(response);
          const responseBody = await response.text();
          console.log('Form submission response:', responseBody);
        }
      });
      await Promise.all(promises);
  }
  {
      const targetPage = page;
      await puppeteer.Locator.race([
          targetPage.locator('div.input-highlight-panel'),
          targetPage.locator('::-p-xpath(/html/body/kett-root/kett-search-form/div/div/div/form/div/div[1])'),
          targetPage.locator(':scope >>> div.input-highlight-panel')
      ])
          .setTimeout(timeout)
          .click({
            offset: {
              x: 443.171875,
              y: 20.078125,
            },
          });
  }
  {
      const targetPage = page;
      await puppeteer.Locator.race([
          targetPage.locator('::-p-aria(ตรวจพัสดุได้สูงสุด 30 เลขหมายในคราวเดียว ด้วยการเว้นวรรค หรือใส่เครื่องหมาย \\",\\")'),
          targetPage.locator('textarea'),
          targetPage.locator('::-p-xpath(/html/body/kett-root/kett-search-form/div/div/div/form/div/div[1]/textarea)'),
          targetPage.locator(':scope >>> textarea')
      ])
          .setTimeout(timeout)
          .fill(_.join(req.body?.code,','));
  }
  {
      const targetPage = page;
      await puppeteer.Locator.race([
          targetPage.locator('::-p-aria(ติดตาม)'),
          targetPage.locator('kett-root button'),
          targetPage.locator('::-p-xpath(/html/body/kett-root/kett-search-form/div/div/div/form/div/div[2]/button)'),
          targetPage.locator(':scope >>> kett-root button')
      ])
          .setTimeout(timeout)
          .click({
            offset: {
              x: 47.578125,
              y: 26.078125,
            },
          });
  }

  let currentUrl = await page.url();
  currentUrl = _.last(_.split(_.last(_.split(currentUrl, '?')), '='))
  console.log(currentUrl);
  // await page.waitForTimeout(10000)
  await browser.close();
  res.send(currentUrl)
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})