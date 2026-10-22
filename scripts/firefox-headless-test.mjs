import { Builder, By, until } from 'selenium-webdriver'
import firefox from 'selenium-webdriver/firefox.js'

const addonPath = process.argv[2]
if (!addonPath) throw new Error('Usage: node scripts/firefox-headless-test.mjs <path-to-xpi>')

const options = new firefox.Options()
  .setBinary('C:\\Program Files\\Mozilla Firefox\\firefox.exe')
  .addArguments('-headless', '-no-remote', '--width=1280', '--height=900')

const driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build()
try {
  const addonId = await driver.installAddon(addonPath, true)
  await driver.get('http://127.0.0.1:5173/')
  await driver.executeScript(() => {
    window.browser = {
      bookmarks: {
        getTree: async () => [{ id: 'root', title: '', children: [{ id: '1', title: 'Firefox docs', url: 'https://developer.mozilla.org/firefox', dateAdded: 1718668800000 }] }],
        onCreated: { addListener: () => undefined }, onRemoved: { addListener: () => undefined }, onChanged: { addListener: () => undefined }, onMoved: { addListener: () => undefined },
      },
      storage: { local: { get: async () => ({}), set: async () => undefined } },
    }
  })
  await driver.wait(until.elementLocated(By.css('h1')), 10000)
  const heading = await driver.findElement(By.css('h1')).getText()
  const bookmarkCount = await driver.findElement(By.css('.results-head strong')).getText()
  await driver.findElement(By.css('.primary-button')).click()
  await driver.wait(until.elementLocated(By.css('.notice')), 5000)
  const notice = await driver.findElement(By.css('.notice')).getText()
  console.log(JSON.stringify({ addonId, heading, bookmarkCount, notice }))
} finally {
  await driver.quit()
}
