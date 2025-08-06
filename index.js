// src/index.js

import ENDPOINTS from './src/ENDPOINTS.js'

function mapServices() {
  const services = import.meta.globEager('./src/services/**/*.js');

  const servicesMap = {};
  for (const path in services) {
    const mod = services[path];
    // Extract the service name from the file path
    const serviceName = path.split('/').pop().replace(/\.\w+$/, '');
    servicesMap[serviceName] = mod.default;
  }
  return servicesMap;
}

function mapComponents() {
  const components = import.meta.globEager('./src/components/**/*.vue');

  const componentsMap = {};
  for (const path in components) {
    const mod = components[path];
    // Extract the component name from the file path
    const componentName = path.split('/').pop().replace(/\.\w+$/, '');
    componentsMap[componentName] = mod.default;
  }
  return componentsMap;
}

function mapPages() {
  const pages = import.meta.globEager('./src/pages/**/*.vue');

  const pagesMap = {};
  for (const path in pages) {
    const mod = pages[path];
    // Extract the page name from the file path
    const pageName = path.split('/').pop().replace(/\.\w+$/, '');
    pagesMap[pageName] = mod.default;
  }
  return pagesMap;
}

function mapLayouts() {
  const layouts = import.meta.globEager('./src/layouts/**/*.vue');

  const layoutsMap = {};
  for (const path in layouts) {
    const mod = layouts[path];
    // Extract the layout name from the file path
    const layoutName = path.split('/').pop().replace(/\.\w+$/, '');
    layoutsMap[layoutName] = mod.default;
  }
  return layoutsMap;
}

function registerComponents(app) {
  const components = mapComponents();

  for (const componentName in components) {
    app.component(componentName, components[componentName]);
  }
}

export const CUSTOMFIELDS = {
  ENDPOINTS,
  SERVICES: mapServices(),
  COMPONENTS: mapComponents(),
  PAGES: mapPages(),
  LAYOUTS: mapLayouts(),
  autoWire(app) {
    // 1) sync register all components
    registerComponents(app)

    // 2) bootstrap `$customfields` scope
    app.config.globalProperties.$customfields = {
      ENDPOINTS: ENDPOINTS,
      services: mapServices(),
      pages: mapPages(),
      layouts: mapLayouts(),
    }
  }
}

export function autoWire(app) {
  CUSTOMFIELDS.autoWire(app);
}
