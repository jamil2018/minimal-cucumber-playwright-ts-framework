# Cucumber Playwright TS Minimal

A minimal cucumber js framework that utilizes playwright as its test engine and typescript as its language.

## Features

- TypeScript support with hot reload using `tsx`
- ESLint configuration for JavaScript, TypeScript, JSON, and Markdown files
- Prettier code formatting
- Node.js environment setup
- **Task Spawner Utility** - Advanced child process management with logging and monitoring

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```

## Task Spawner Utility

The Task Spawner Utility provides advanced child process management capabilities for your E2E testing framework. It allows you to spawn, monitor, and manage multiple child processes with real-time logging and output capture.

### Key Features

- **Process Management**: Spawn, monitor, and control child processes
- **Real-time Logging**: Stream process output to console with customizable prefixes
- **Output Capture**: Store stdout/stderr for later analysis
- **Concurrent Execution**: Run multiple processes simultaneously
- **Event System**: Listen to process lifecycle events
- **Cross-platform**: Works on Windows, macOS, and Linux

### Basic Usage

```typescript
import { spawnTask, taskSpawner } from './src/utils/spawner.util'

// Spawn a single process
const process = await spawnTask(
    'node',
    ['-e', 'console.log("Hello World!");'],
    {
        streamLogs: true,
        captureOutput: true,
        logPrefix: 'my-process',
    }
)

// Wait for completion
await new Promise((resolve) => setTimeout(resolve, 1000))
```

### Multiple Concurrent Processes

```typescript
import { spawnMultipleTasks } from './src/utils/spawner.util'

// Spawn multiple processes concurrently
const processes = await spawnMultipleTasks([
    {
        name: 'frontend',
        command: 'npm',
        args: ['run', 'dev'],
        options: { streamLogs: true, captureOutput: true },
    },
    {
        name: 'backend',
        command: 'node',
        args: ['server.js'],
        options: { streamLogs: true, captureOutput: true },
    },
    {
        name: 'tests',
        command: 'npm',
        args: ['test'],
        options: { streamLogs: true, captureOutput: true },
    },
])

// Wait for all processes to complete
await taskSpawner.waitForAll()
```

### Process Monitoring

```typescript
import { taskSpawner } from './src/utils/spawner.util'

// Get all processes
const allProcesses = taskSpawner.getAllProcesses()
console.log(`Total processes: ${allProcesses.size}`)

// Get running processes only
const runningProcesses = taskSpawner.getRunningProcesses()
console.log(`Running processes: ${runningProcesses.size}`)

// Get specific process
const process = taskSpawner.getProcess('frontend')
if (process) {
    console.log(`Process status: ${process.isRunning ? 'Running' : 'Stopped'}`)
    console.log(`Exit code: ${process.exitCode}`)
}
```

### Output Capture

```typescript
// Capture and retrieve process output
const process = await spawnTask('node', ['-e', 'console.log("Test output");'], {
    captureOutput: true,
    streamLogs: false,
})

// Wait for completion
await new Promise((resolve) => setTimeout(resolve, 1000))

// Retrieve captured output
const output = taskSpawner.getProcessOutput('node_1')
if (output) {
    console.log('Stdout:', output.stdout.join(''))
    console.log('Stderr:', output.stderr.join(''))
}
```

### Event Handling

```typescript
import { taskSpawner } from './src/utils/spawner.util'

// Listen to process events
taskSpawner.on('spawn', (process) => {
    console.log(`🚀 Process spawned: ${process.name}`)
})

taskSpawner.on('exit', ({ processName, code }) => {
    console.log(`🏁 Process exited: ${processName} with code ${code}`)
})

taskSpawner.on('stdout', ({ processName, data }) => {
    console.log(`📤 ${processName}: ${data.trim()}`)
})

taskSpawner.on('stderr', ({ processName, data }) => {
    console.log(`📥 ${processName}: ${data.trim()}`)
})

taskSpawner.on('error', ({ processName, error }) => {
    console.error(`❌ ${processName}: ${error.message}`)
})
```

### Process Control

```typescript
import { killTask, killAllTasks, waitForTask } from './src/utils/spawner.util'

// Kill a specific process
const killed = killTask('frontend', 'SIGTERM')
console.log(`Process killed: ${killed}`)

// Kill all running processes
killAllTasks('SIGKILL')

// Wait for specific process to complete
const exitCode = await waitForTask('backend')
console.log(`Backend exited with code: ${exitCode}`)
```

### Configuration Options

```typescript
interface SpawnerOptions {
    // Whether to stream logs to console (default: true)
    streamLogs?: boolean

    // Whether to prefix logs with process name (default: true)
    prefixLogs?: boolean

    // Custom prefix for logs (default: process name)
    logPrefix?: string

    // Whether to capture output for later retrieval (default: false)
    captureOutput?: boolean

    // Standard Node.js spawn options
    cwd?: string
    env?: NodeJS.ProcessEnv
    shell?: boolean
    // ... other SpawnOptions
}
```

### Advanced Usage Examples

#### Running E2E Tests with Multiple Services

```typescript
import { spawnMultipleTasks, taskSpawner } from './src/utils/spawner.util'

async function runE2ETests() {
    // Start required services
    const services = await spawnMultipleTasks([
        {
            name: 'database',
            command: 'docker',
            args: ['run', 'postgres:latest'],
            options: { streamLogs: true },
        },
        {
            name: 'api-server',
            command: 'npm',
            args: ['run', 'start:api'],
            options: { streamLogs: true, captureOutput: true },
        },
        {
            name: 'frontend',
            command: 'npm',
            args: ['run', 'start:frontend'],
            options: { streamLogs: true, captureOutput: true },
        },
    ])

    // Wait for services to be ready
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Run tests
    const testProcess = await spawnTask('npm', ['test'], {
        streamLogs: true,
        captureOutput: true,
        logPrefix: 'e2e-tests',
    })

    // Wait for tests to complete
    await taskSpawner.waitForProcess('e2e-tests')

    // Clean up services
    taskSpawner.killAll()
}
```

#### Monitoring Long-running Processes

```typescript
import { taskSpawner } from './src/utils/spawner.util'

async function monitorProcesses() {
    // Set up monitoring
    const interval = setInterval(() => {
        const running = taskSpawner.getRunningProcesses()
        console.log(`Currently running: ${running.size} processes`)

        running.forEach((process, name) => {
            const duration = Date.now() - process.startTime.getTime()
            console.log(`${name}: Running for ${Math.round(duration / 1000)}s`)
        })
    }, 5000)

    // Your process spawning code here...

    // Clean up monitoring
    setTimeout(() => {
        clearInterval(interval)
    }, 60000)
}
```

### Utility Functions

The spawner utility exports several convenience functions:

- `spawnTask(command, args, options)` - Spawn a single process
- `spawnMultipleTasks(tasks)` - Spawn multiple processes concurrently
- `killTask(processName, signal)` - Kill a specific process
- `killAllTasks(signal)` - Kill all running processes
- `waitForTask(processName)` - Wait for a specific process to complete
- `waitForAllTasks()` - Wait for all processes to complete

### Error Handling

The spawner utility includes comprehensive error handling:

- Process spawn errors are caught and emitted as events
- Uncaught exceptions in child processes are handled gracefully
- Process exit codes are tracked and available
- Error events include process name and error details

This utility is perfect for managing complex E2E test scenarios that require multiple services, background processes, or concurrent operations.
