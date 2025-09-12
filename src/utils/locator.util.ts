import { Page } from 'playwright'

export function resolveLocator(page: Page, locatorName: string) {
    try {
        const currentUrl = new URL(page.url())
        const currentPath = currentUrl.pathname
    } catch (error) {
        console.error(error)
    }
}
