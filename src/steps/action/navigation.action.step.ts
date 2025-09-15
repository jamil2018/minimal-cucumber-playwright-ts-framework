import { Given } from '@cucumber/cucumber'
import { CustomWorld } from '../../config/world.js'

Given(
    'the user navigates to {string}',
    async function (this: CustomWorld, url: string) {
        await this.page.goto(url, { timeout: 60000 })
    }
)
