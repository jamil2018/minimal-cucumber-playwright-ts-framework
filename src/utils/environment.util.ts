import { readFileSync } from 'fs'

export function getEnvironment(environment: string) {
    const environmentConfig = JSON.parse(
        readFileSync(
            `${process.cwd()}/src/config/environments/environments.json`,
            'utf8'
        )
    )
    return environmentConfig[environment]
}

export function getAllEnvironments() {
    const environmentConfig = JSON.parse(
        readFileSync(
            `${process.cwd()}/src/config/environments/environments.json`,
            'utf8'
        )
    )
    return environmentConfig
}
