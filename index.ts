import { Command } from 'commander'

const program = new Command()

program
    .name('cli')
    .description('a cli tool for running tests with different configurations')
    .version('0.0.1')

program
    .option(
        '-e, --environment <environment>',
        'the environment to run the tests on'
    )
    .option('-t, --tags <tags>', 'the tags to run the tests on')
    .option(
        '-p, --parallel <parallel>',
        'the number of parallel workers to run the tests on'
    )
    .option('-b, --browser <browser>', 'the browser to run the tests on')
    .option(
        '-h, --headless <headless>',
        'the headless mode to run the tests on'
    )
    .parse(process.argv)

const options = program.opts()
console.log(options)
