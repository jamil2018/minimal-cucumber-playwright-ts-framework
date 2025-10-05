import { spawn, ChildProcess } from 'child_process'
import type { SpawnOptions } from 'child_process'
import { EventEmitter } from 'events'

export interface SpawnerOptions extends SpawnOptions {
    /** Whether to stream logs to console (default: true) */
    streamLogs?: boolean
    /** Whether to prefix logs with process name (default: true) */
    prefixLogs?: boolean
    /** Custom prefix for logs (default: process name) */
    logPrefix?: string
    /** Whether to capture output for later retrieval (default: false) */
    captureOutput?: boolean
}

export interface SpawnedProcess {
    process: ChildProcess
    name: string
    output: {
        stdout: string[]
        stderr: string[]
    }
    isRunning: boolean
    exitCode: number | null
    startTime: Date
    endTime: Date | null
}

export class TaskSpawner extends EventEmitter {
    private processes: Map<string, SpawnedProcess> = new Map()
    private processCounter = 0

    /**
     * Spawn a child process with logging capabilities
     */
    async spawn(
        command: string,
        args: string[] = [],
        options: SpawnerOptions = {}
    ): Promise<SpawnedProcess> {
        const {
            streamLogs = true,
            prefixLogs = true,
            logPrefix,
            captureOutput = false,
            ...spawnOptions
        } = options

        const processName = logPrefix || `${command}_${++this.processCounter}`

        // Create the spawned process object
        const spawnedProcess: SpawnedProcess = {
            process: null as any, // Will be set below
            name: processName,
            output: {
                stdout: [],
                stderr: [],
            },
            isRunning: false,
            exitCode: null,
            startTime: new Date(),
            endTime: null,
        }

        // Spawn the child process
        const childProcess = spawn(command, args, {
            stdio: 'pipe',
            ...spawnOptions,
        })

        spawnedProcess.process = childProcess
        spawnedProcess.isRunning = true

        // Store the process
        this.processes.set(processName, spawnedProcess)

        // Set up event listeners
        this.setupProcessListeners(spawnedProcess, {
            streamLogs,
            prefixLogs,
            captureOutput,
        })

        // Emit spawn event
        this.emit('spawn', spawnedProcess)

        return spawnedProcess
    }

    /**
     * Spawn multiple processes concurrently
     */
    async spawnMultiple(
        tasks: Array<{
            name: string
            command: string
            args?: string[]
            options?: SpawnerOptions
        }>
    ): Promise<Map<string, SpawnedProcess>> {
        const promises = tasks.map(async (task) => {
            const process = await this.spawn(task.command, task.args || [], {
                logPrefix: task.name,
                ...task.options,
            })
            return { name: task.name, process }
        })

        const results = await Promise.all(promises)
        const processMap = new Map<string, SpawnedProcess>()

        results.forEach(({ name, process }) => {
            processMap.set(name, process)
        })

        return processMap
    }

    /**
     * Kill a specific process by name
     */
    killProcess(
        processName: string,
        signal: NodeJS.Signals = 'SIGTERM'
    ): boolean {
        const spawnedProcess = this.processes.get(processName)
        if (!spawnedProcess || !spawnedProcess.isRunning) {
            return false
        }

        spawnedProcess.process.kill(signal)
        return true
    }

    /**
     * Kill all running processes
     */
    killAll(signal: NodeJS.Signals = 'SIGTERM'): void {
        this.processes.forEach((spawnedProcess) => {
            if (spawnedProcess.isRunning) {
                spawnedProcess.process.kill(signal)
            }
        })
    }

    /**
     * Wait for a specific process to complete
     */
    async waitForProcess(processName: string): Promise<number | null> {
        const spawnedProcess = this.processes.get(processName)
        if (!spawnedProcess) {
            throw new Error(`Process '${processName}' not found`)
        }

        return new Promise((resolve) => {
            if (!spawnedProcess.isRunning) {
                resolve(spawnedProcess.exitCode)
                return
            }

            spawnedProcess.process.on('exit', (code) => {
                resolve(code)
            })
        })
    }

    /**
     * Wait for all processes to complete
     */
    async waitForAll(): Promise<Map<string, number | null>> {
        const results = new Map<string, number | null>()
        const promises: Array<Promise<[string, number | null]>> = []

        this.processes.forEach((spawnedProcess, name) => {
            if (spawnedProcess.isRunning) {
                promises.push(
                    this.waitForProcess(name).then(
                        (code) => [name, code] as [string, number | null]
                    )
                )
            } else {
                results.set(name, spawnedProcess.exitCode)
            }
        })

        const completed = await Promise.all(promises)
        completed.forEach(([name, code]) => {
            results.set(name, code)
        })

        return results
    }

    /**
     * Get a specific process by name
     */
    getProcess(processName: string): SpawnedProcess | undefined {
        return this.processes.get(processName)
    }

    /**
     * Get all processes
     */
    getAllProcesses(): Map<string, SpawnedProcess> {
        return new Map(this.processes)
    }

    /**
     * Get running processes only
     */
    getRunningProcesses(): Map<string, SpawnedProcess> {
        const running = new Map<string, SpawnedProcess>()
        this.processes.forEach((process, name) => {
            if (process.isRunning) {
                running.set(name, process)
            }
        })
        return running
    }

    /**
     * Get process output
     */
    getProcessOutput(
        processName: string
    ): { stdout: string[]; stderr: string[] } | null {
        const spawnedProcess = this.processes.get(processName)
        return spawnedProcess?.output || null
    }

    /**
     * Clear process history
     */
    clearHistory(): void {
        this.processes.clear()
        this.processCounter = 0
    }

    private setupProcessListeners(
        spawnedProcess: SpawnedProcess,
        options: {
            streamLogs: boolean
            prefixLogs: boolean
            captureOutput: boolean
        }
    ): void {
        const { streamLogs, prefixLogs, captureOutput } = options
        const { process: childProcess, name } = spawnedProcess

        // Handle stdout
        childProcess.stdout?.on('data', (data: Buffer) => {
            const output = data.toString()

            if (captureOutput) {
                spawnedProcess.output.stdout.push(output)
            }

            if (streamLogs) {
                const prefix = prefixLogs ? `[${name}] ` : ''
                console.log(`${prefix}${output.trim()}`)
            }

            this.emit('stdout', { processName: name, data: output })
        })

        // Handle stderr
        childProcess.stderr?.on('data', (data: Buffer) => {
            const output = data.toString()

            if (captureOutput) {
                spawnedProcess.output.stderr.push(output)
            }

            if (streamLogs) {
                const prefix = prefixLogs ? `[${name}] ` : ''
                console.error(`${prefix}${output.trim()}`)
            }

            this.emit('stderr', { processName: name, data: output })
        })

        // Handle process exit
        childProcess.on('exit', (code: number | null) => {
            spawnedProcess.isRunning = false
            spawnedProcess.exitCode = code
            spawnedProcess.endTime = new Date()

            this.emit('exit', { processName: name, code })
        })

        // Handle process error
        childProcess.on('error', (error: Error) => {
            spawnedProcess.isRunning = false
            spawnedProcess.endTime = new Date()

            if (streamLogs) {
                const prefix = prefixLogs ? `[${name}] ` : ''
                console.error(`${prefix}ERROR: ${error.message}`)
            }

            this.emit('error', { processName: name, error })
        })

        // Handle uncaught exceptions to prevent crashes
        childProcess.on('uncaughtException', (error: Error) => {
            spawnedProcess.isRunning = false
            spawnedProcess.endTime = new Date()

            if (streamLogs) {
                const prefix = prefixLogs ? `[${name}] ` : ''
                console.error(`${prefix}UNCAUGHT EXCEPTION: ${error.message}`)
            }

            this.emit('error', { processName: name, error })
        })
    }
}

// Create a default instance for convenience
export const taskSpawner = new TaskSpawner()

// Export utility functions
export const spawnTask = (
    command: string,
    args: string[] = [],
    options: SpawnerOptions = {}
) => taskSpawner.spawn(command, args, options)

export const spawnMultipleTasks = (
    tasks: Array<{
        name: string
        command: string
        args?: string[]
        options?: SpawnerOptions
    }>
) => taskSpawner.spawnMultiple(tasks)

export const killTask = (processName: string, signal?: NodeJS.Signals) =>
    taskSpawner.killProcess(processName, signal)

export const killAllTasks = (signal?: NodeJS.Signals) =>
    taskSpawner.killAll(signal)

export const waitForTask = (processName: string) =>
    taskSpawner.waitForProcess(processName)

export const waitForAllTasks = () => taskSpawner.waitForAll()
