import { When } from '@cucumber/cucumber'
import { CustomWorld } from '../../config/world.js'

When(
    'the user clicks on {string}',
    async function (this: CustomWorld, selector: string) {
        await this.page.click(selector)
    }
)
