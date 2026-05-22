/// <reference types="cypress" />

const codeCoverageTask = require('@cypress/code-coverage/task');

const setupPlugins = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Cypress.PluginConfigOptions => {
  codeCoverageTask(on, config);
  return config;
};

export default setupPlugins;