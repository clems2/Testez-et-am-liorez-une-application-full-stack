# Yoga

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.16.

## Prerequisites

- Node.js 18+
- npm
- The back-end must be running on port 8080 (see back-end README)

## Start the project

Git clone:

> git clone https://github.com/OpenClassrooms-Student-Center/P5-Full-Stack-testing

Go inside folder:

> cd yoga

Install dependencies:

> npm install

Launch Front-end:

> npm run start;

The application is available at `http://localhost:4200`.

---

## Test

### E2E tests (Cypress)

**Important**: E2E tests mock all HTTP calls via `cy.intercept()` — the back-end does not need to be running.

#### Run in interactive mode (with Cypress UI):

> npm run e2e

This opens the Cypress interface. Select a browser (Edge recommended) then click on a spec file to run it.

#### Run in headless mode (CI):

> npm run e2e:ci

Runs all specs in Edge headless mode and displays results in the terminal. If you want to change the browser modify "Edge" into angular.json (to "chrome" for example) in the e2e-ci section.

#### Generate coverage report:

E2E tests must be run before generating the report:

> npm run e2e:coverage

Report is available at:

> coverage/lcov-report/index.html

**Coverage thresholds**: 80% minimum on statements, branches, lines, and functions.

---


#### Unit and integration tests (Jest)

Launch all tests with coverage report:

> npm run test

For continuous testing on file change:

> npm run test:watch

The coverage report is generated at `coverage/jest/index.html` and can be opened in a browser.

**Coverage thresholds**: 80% minimum on statements, branches, lines, and functions.

To run a specific test file:

> npx jest src/app/path/to/file.spec.ts

To check coverage for a specific file only:

> npx jest src/app/path/to/file.spec.ts --coverage --collectCoverageFrom="src/app/path/to/file.ts"

---


## Coverage reports summary

| Test type | Tool | Report location |
|---|---|---|
| Unit & integration | Jest + Istanbul | `coverage/jest/index.html` |
| E2E | Cypress + Istanbul + nyc | `coverage/lcov-report/index.html` |
