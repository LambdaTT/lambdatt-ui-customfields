// src/index.js

import ENDPOINTS from './src/ENDPOINTS.js'

function mapServices() {
  const servicesDirectory = __dirname + '/src/services/**/*.js';
  const services = import.meta.glob(servicesDirectory);

  const servicesMap = {};
  for (const path in services) {
    services[path]().then((mod) => {
      // Extract the service name from the file path
      const serviceName = path.split('/').pop().replace(/\.\w+$/, '');
      servicesMap[serviceName] = mod.default;
    });
  }
  return servicesMap;
}

function mapComponents() {
  const componentsDirectory = __dirname + '/src/components/**/*.vue';
  const components = import.meta.glob(componentsDirectory);

  const componentsMap = {};
  for (const path in components) {
    components[path]().then((mod) => {
      // Extract the component name from the file path
      const componentName = path.split('/').pop().replace(/\.\w+$/, '');
      componentsMap[componentName] = mod.default;
    });
  }
  return componentsMap;
}

function mapPages() {
  const pagesDirectory = __dirname + '/src/pages/**/*.vue';
  const pages = import.meta.glob(pagesDirectory);

  const pagesMap = {};
  for (const path in pages) {
    pages[path]().then((mod) => {
      // Extract the page name from the file path
      const pageName = path.split('/').pop().replace(/\.\w+$/, '');
      pagesMap[pageName] = mod.default;
    });
  }
  return pagesMap;
}

function mapLayouts() {
  const layoutsDirectory = __dirname + '/src/layouts/**/*.vue';
  const layouts = import.meta.glob(layoutsDirectory);

  const layoutsMap = {};
  for (const path in layouts) {
    layouts[path]().then((mod) => {
      // Extract the layout name from the file path
      const layoutName = path.split('/').pop().replace(/\.\w+$/, '');
      layoutsMap[layoutName] = mod.default;
    });
  }
  return layoutsMap;
}

function registerComponents(app) {
  const components = mapComponents();

  for (const componentName in components) {
    app.component(componentName, components[componentName]);
  }
}

const ENDPOINTS = ENDPOINTS;

const SERVICES = mapServices()

const COMPONENTS = mapComponents()

const PAGES = mapPages()

const LAYOUTS = mapLayouts()

export const CUSTOMFIELDS = {
  ENDPOINTS,
  SERVICES,
  COMPONENTS,
  PAGES,
  LAYOUTS,
  autoWire(app) {
    // 1) sync register all components
    registerComponents(app)

    // 2) bootstrap `$customfields` scope
    app.config.globalProperties.$customfields = {
      ENDPOINTS: ENDPOINTS,
      services: SERVICES,
      pages: PAGES,
      layouts: LAYOUTS,
    }
  }
}
