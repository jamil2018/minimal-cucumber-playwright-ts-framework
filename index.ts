import { startCli } from './src/utils/cli.util.js'
import type { OptionValues } from 'commander'
import { config } from 'dotenv'

/**
 * Main entry point for the CLI application
 * Handles CLI parsing, error handling, and application lifecycle
 */
function bootstrap(): void {
    // Load environment variables
    config()

    try {
        // Parse CLI arguments and get options
        const options: OptionValues = startCli()

        // Log parsed options with better formatting
        console.log('🚀 CLI Options parsed successfully:')
        console.log(JSON.stringify(options, null, 2))

        // TODO: Add actual test execution logic here
        console.log('✅ Application completed successfully')
        process.exit(0)
    } catch (error) {
        console.error('❌ Application failed with error:')
        console.error(
            error instanceof Error ? error.message : 'Unknown error occurred'
        )
        process.exit(1)
    }
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message)
    process.exit(1)
})

process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason)
    process.exit(1)
})

// Start the application
bootstrap()
