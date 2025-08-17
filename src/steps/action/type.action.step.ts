import { When } from '@cucumber/cucumber'
import { CustomWorld } from '../../config/world.js'

When(
    'the user fills in the {string} field with {string}',
    async function (this: CustomWorld, field: string, text: string) {
        const locator = this.page.locator(`input[name="${field}"]`)
        await locator.fill(text)
    }
)
