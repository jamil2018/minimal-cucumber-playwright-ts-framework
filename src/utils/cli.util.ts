import { Command, Option, OptionValues } from 'commander'
import { getAllEnvironments } from './environment.util.js'
import parseTagExpression from '@cucumber/tag-expressions'

// Type definitions for better type safety
interface CliOptions extends OptionValues {
    environment: string
    tags?: string
    parallel: number
    browser: 'chromium' | 'firefox' | 'webkit'
    headless: 'true' | 'false'
}

// Constants for better maintainability
const BROWSER_CHOICES = ['chromium', 'firefox', 'webkit'] as const
const HEADLESS_CHOICES = ['true', 'false'] as const
const DEFAULT_PARALLEL_WORKERS = 1
const DEFAULT_BROWSER = 'chromium'
const DEFAULT_HEADLESS = 'true'

// Initialize command program
const program = new Command()

// Load environment names with error handling
let environmentNames: string[] = []
try {
    environmentNames = Object.keys(getAllEnvironments())
    if (environmentNames.length === 0) {
        console.warn('⚠️  No environments found in configuration')
    }
} catch (error) {
    console.error(
        '❌ Failed to load environments:',
        error instanceof Error ? error.message : 'Unknown error'
    )
    process.exit(1)
}

/**
 * Validates and parses a positive integer value
 * @param val - The string value to parse
 * @returns The parsed positive integer
 * @throws Error if the value is not a valid positive integer
 */
function parsePositiveInt(val: string): number {
    const n = Number(val)
    if (!Number.isInteger(n) || n <= 0) {
        throw new Error(`--parallel must be a positive integer, got "${val}"`)
    }
    return n
}

/**
 * Validates a Cucumber tag expression
 * @param val - The tag expression string to validate
 * @returns The validated tag expression
 * @throws Error if the tag expression is invalid
 */
function validateCucumberTagExpression(val: string): string {
    try {
        parseTagExpression(val)
        return val
    } catch (error) {
        throw new Error(
            `Invalid tag expression: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

// Configure the CLI program
program
    .name('cucumber-cli')
    .description(
        'A CLI tool for running Cucumber tests with different configurations'
    )
    .version('1.0.0')
    .addOption(
        new Option(
            '-e, --environment <environment>',
            'The environment to run the tests on'
        )
            .choices(environmentNames)
            .makeOptionMandatory()
    )
    .option(
        '-t, --tags <tags>',
        'The tags to run the tests on (Cucumber tag expression)',
        validateCucumberTagExpression
    )
    .option(
        '-p, --parallel <parallel>',
        'The number of parallel workers to run the tests on',
        parsePositiveInt,
        DEFAULT_PARALLEL_WORKERS
    )
    .addOption(
        new Option('-b, --browser <browser>', 'The browser to run the tests on')
            .choices(BROWSER_CHOICES)
            .default(DEFAULT_BROWSER)
    )
    .addOption(
        new Option(
            '-h, --headless <headless>',
            'The headless mode to run the tests on'
        )
            .choices(HEADLESS_CHOICES)
            .default(DEFAULT_HEADLESS)
    )

/**
 * Starts the CLI and parses command line arguments
 * @returns The parsed CLI options
 * @throws Error if parsing fails or required options are missing
 */
export function startCli(): CliOptions {
    try {
        program.parse()
        const options = program.opts() as CliOptions

        return options
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ CLI Error:', error.message)
        } else {
            console.error('❌ CLI Error: Unknown error occurred')
        }
        process.exit(1)
    }
}
