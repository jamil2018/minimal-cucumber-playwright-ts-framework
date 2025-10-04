import {
    After,
    AfterAll,
    Before,
    BeforeAll,
    setDefaultTimeout,
} from '@cucumber/cucumber'
import { BrowserName, CustomWorld } from '../config/executor/world.js'
import {
    chromium,
    ChromiumBrowser,
    firefox,
    FirefoxBrowser,
    webkit,
    WebKitBrowser,
} from 'playwright'

let browser: ChromiumBrowser | FirefoxBrowser | WebKitBrowser

BeforeAll(async function () {
    setDefaultTimeout(60000)
    const browserName = (process.env.BROWSER as BrowserName) || 'chromium'
    switch (browserName) {
        case 'chromium':
            browser = await chromium.launch({
                headless: process.env.HEADLESS === 'false',
            })
            break
        case 'firefox':
            browser = await firefox.launch({
                headless: process.env.HEADLESS === 'false',
            })
            break
        case 'webkit':
            browser = await webkit.launch({
                headless: process.env.HEADLESS === 'false',
            })
            break
        default:
            throw new Error(`Invalid browser name: ${browserName}`)
    }
})

Before(async function (this: CustomWorld) {
    this.context = await browser.newContext()
    this.page = await this.context.newPage()
})

After(async function (this: CustomWorld) {
    await this.page.close()
    await this.context.close()
})

AfterAll(async function () {
    await browser.close()
})
