import { After, Before } from '@cucumber/cucumber'
import { CustomWorld } from '../config/world.js'
import { chromium, firefox, webkit } from 'playwright'

Before(async function (this: CustomWorld) {
    const picker = {
        chromium,
        firefox,
        webkit,
    } as const

    const launcher = picker[this.browserName] ?? chromium
    this.browser = await launcher.launch({
        headless: true,
    })
    this.context = await this.browser.newContext()
    this.page = await this.context.newPage()
})

After(async function (this: CustomWorld) {
    await this.page.close()
    await this.context.close()
    await this.browser.close()
})
