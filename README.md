# Cucumber Playwright TypeScript E2E Testing Framework

A comprehensive, production-ready E2E testing framework that combines Cucumber for BDD, Playwright for browser automation, and TypeScript for type safety. This framework provides advanced features including intelligent locator management, environment configuration, parallel execution, and sophisticated process management.

## 🚀 Features

- **BDD Testing**: Cucumber.js integration with Gherkin syntax
- **Cross-Browser Support**: Chromium, Firefox, and WebKit via Playwright
- **TypeScript**: Full type safety and modern JavaScript features
- **Intelligent Locator Management**: JSON-based locator storage with path mapping
- **Environment Configuration**: Multi-environment support with JSON configuration
- **Parallel Execution**: Run tests in parallel for faster execution
- **Advanced Process Management**: Task spawner utility for complex test scenarios
- **CLI Interface**: Command-line tool with comprehensive options
- **Code Quality**: ESLint, Prettier, and TypeScript strict mode
- **Hot Reload**: Development mode with `tsx` for instant feedback

## 📋 Prerequisites

- **Node.js**: Version 18+ (LTS recommended)
- **npm**: Version 8+ or **yarn**: Version 1.22+
- **Git**: For version control

## 🛠️ Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Verify installation**
    ```bash
    npm run test
    ```

## 🏗️ Project Structure

```
minimal_e2e/
├── src/
│   ├── config/
│   │   ├── cucumber/           # Cucumber configuration
│   │   ├── environments/       # Environment configurations
│   │   └── executor/          # World configuration
│   ├── features/              # Gherkin feature files
│   ├── hooks/                 # Cucumber hooks
│   ├── locators/              # Page locators (JSON)
│   ├── mapping/               # URL to locator mapping
│   ├── reports/               # Test reports
│   ├── steps/                 # Step definitions
│   │   ├── action/           # Action steps (click, type, navigate)
│   │   └── validation/       # Validation steps (assertions)
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── cucumber.mjs              # Cucumber configuration
├── index.ts                  # Main CLI entry point
├── package.json
└── tsconfig.json
```

## 🎯 Quick Start

### Basic Test Execution

```bash
# Run all tests
npm run cli -- --environment staging

# Run with specific browser
npm run cli -- --environment staging --browser firefox

# Run in headless mode
npm run cli -- --environment staging --headless true

# Run with parallel execution
npm run cli -- --environment staging --parallel 4
```

### Development Mode

```bash
# Start development mode with hot reload
npm run dev

# Run tests with specific tags
npm run cli -- --environment staging --tags "@smoke"

# Run tests with custom tag expression
npm run cli -- --environment staging --tags "@smoke and @regression"
```

## 📝 Writing Tests

### 1. Feature Files (Gherkin)

Create feature files in `src/features/`:

```gherkin
@smoke
Feature: User Authentication

  Scenario: User can login successfully
    Given the user navigates to "staging" environment url
    When the user fills in the "email" field with "demo@example.com"
    And the user fills in the "password" field with "test1234"
    And the user clicks on "loginButton"
    Then the user should see "Welcome to Home Page" in ".container h1"

  Scenario: User sees login form
    Given the user navigates to "https://demo-test-site-beta.vercel.app/login"
    Then the user should see "Login" in "button[data-test-id='login-button']"
```

### 2. Step Definitions

Step definitions are automatically organized in `src/steps/`:

**Action Steps** (`src/steps/action/`):

- `navigation.action.step.ts` - Navigation steps
- `click.action.step.ts` - Click actions
- `type.action.step.ts` - Input actions

**Validation Steps** (`src/steps/validation/`):

- `text.validation.step.ts` - Text assertions

### 3. Locator Management

#### Define Locators

Create locator files in `src/locators/`:

**`src/locators/login/user login.json`**:

```json
{
    "email": "input[placeholder='Enter your email']",
    "password": "input[type='password']",
    "loginButton": "button[type='submit']"
}
```

**`src/locators/home/home.json`**:

```json
{
    "username": "input[name='username']",
    "email": "input[name='email']",
    "saveChangesButton": "button[type='submit']"
}
```

#### Map URL Paths to Locators

**`src/mapping/locator-map.json`**:

```json
[
    {
        "name": "user login",
        "path": "/login"
    },
    {
        "name": "home",
        "path": "/home"
    }
]
```

#### Use Locators in Steps

```typescript
// In step definitions, use locator names instead of selectors
When(
    'the user clicks on {string}',
    async function (this: CustomWorld, selector: string) {
        const locator = resolveLocator(this.page, selector)
        await this.page.click(locator, { timeout: 10000 })
    }
)
```

### 4. Environment Configuration

**`src/config/environments/environments.json`**:

```json
{
    "staging": {
        "url": "https://demo-test-site-beta.vercel.app",
        "username": "demo@example.com",
        "password": "test1234"
    },
    "production": {
        "url": "https://production.example.com",
        "username": "prod@example.com",
        "password": "prod_password"
    }
}
```

## ⚙️ Configuration

### Cucumber Configuration

**`cucumber.mjs`**:

```javascript
export default {
    paths: ['src/features/**/*.feature'],
    import: ['src/steps/**/*.ts', 'src/hooks/hooks.ts', 'src/config/world.ts'],
    loader: ['ts-node/esm'],
    format: ['pretty', 'json:src/reports/cucumber.json'],
    publishQuiet: true,
}
```

### TypeScript Configuration

**`tsconfig.json`**:

```json
{
    "compilerOptions": {
        "target": "esnext",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "strict": true,
        "types": ["node", "playwright"]
    }
}
```

## 🚀 Advanced Features

### Task Spawner Utility

The framework includes a sophisticated task spawner for managing test scenarios with different test configurations via the CLI:

```typescript
import {
    spawnTask,
    spawnMultipleTasks,
    taskSpawner,
} from './src/utils/spawner.util'

// Spawn a single process
const process = await spawnTask('npm', ['test'], {
    streamLogs: true,
    captureOutput: true,
    logPrefix: 'test-runner',
})

// Spawn multiple processes concurrently
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
])

// Wait for all processes
await taskSpawner.waitForAll()
```

### Process Monitoring

```typescript
// Monitor running processes
const running = taskSpawner.getRunningProcesses()
console.log(`Running processes: ${running.size}`)

// Get process output
const output = taskSpawner.getProcessOutput('test-runner')
if (output) {
    console.log('STDOUT:', output.stdout.join(''))
    console.log('STDERR:', output.stderr.join(''))
}
```

### Event Handling

```typescript
// Listen to process events
taskSpawner.on('spawn', (process) => {
    console.log(`🚀 Process spawned: ${process.name}`)
})

taskSpawner.on('exit', ({ processName, code }) => {
    console.log(`🏁 Process exited: ${processName} with code ${code}`)
})

taskSpawner.on('error', ({ processName, error }) => {
    console.error(`❌ ${processName}: ${error.message}`)
})
```

## 📊 CLI Usage

### Available Commands

```bash
# Basic usage
npm run cli -- --environment <env>

# All available options
npm run cli -- --help
```

### CLI Options

| Option          | Short | Description                | Required | Default  |
| --------------- | ----- | -------------------------- | -------- | -------- |
| `--environment` | `-e`  | Target environment         | ✅       | -        |
| `--tags`        | `-t`  | Cucumber tag expression    | ✅       | -        |
| `--parallel`    | `-p`  | Number of parallel workers | ❌       | 1        |
| `--browser`     | `-b`  | Browser engine             | ❌       | chromium |
| `--headless`    | `-h`  | Headless mode              | ❌       | true     |

### Examples

```bash
# Run smoke tests in parallel
npm run cli -- --environment staging --tags "@smoke" --parallel 4

# Run tests in Firefox with UI
npm run cli -- --environment staging --browser firefox --headless false

# Run regression tests
npm run cli -- --environment production --tags "@regression" --parallel 2
```

## 🔧 Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run CLI
npm run cli
```

### Code Quality

The project includes comprehensive code quality tools:

- **ESLint**: JavaScript, TypeScript, JSON, and Markdown linting
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Husky**: Git hooks (if configured)

## 🧪 Testing Strategy

### Test Organization

1. **Feature Files**: High-level test scenarios in Gherkin
2. **Step Definitions**: Reusable step implementations
3. **Locators**: Centralized element selectors
4. **Environments**: Configuration for different test environments
5. **Hooks**: Setup and teardown logic

### Best Practices

1. **Use Locator Repository Pattern**: Organize locators by page/component
2. **Environment-Specific Data**: Store test data in environment configs
3. **Reusable Steps**: Create generic, reusable step definitions
4. **Proper Tagging**: Use meaningful tags for test categorization
5. **Parallel Execution**: Leverage parallel execution for faster feedback

## 🐛 Troubleshooting

### Common Issues

1. **Browser Installation**: Ensure Playwright browsers are installed

    ```bash
    npx playwright install
    ```

2. **Environment Configuration**: Verify environment files exist and are valid JSON

3. **Locator Resolution**: Check that locator mappings match actual URL paths

4. **TypeScript Errors**: Ensure all imports use `.js` extensions for ES modules

## 📈 Performance

### Parallel Execution

```bash
# Run tests in parallel (adjust based on your system)
npm run cli -- --environment staging --parallel 4
```

### Headless Mode

```bash
# Faster execution in headless mode
npm run cli -- --environment staging --headless true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review existing issues
3. Create a new issue with detailed information

---

**Happy Testing! 🎉**
