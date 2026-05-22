# Yoga

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.16.

## Start the project

Git clone:

> git clone https://github.com/OpenClassrooms-Student-Center/P5-Full-Stack-testing

Go inside folder:

> cd yoga

Install dependencies:

> npm install

Launch Front-end:

> npm run start;


### Test

#### E2E

Launching e2e test:

> npm run e2e

Generate coverage report (you should launch e2e test before):

> npm run e2e:coverage

Report is available here:

> front/coverage/lcov-report/index.html

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
