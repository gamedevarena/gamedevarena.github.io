// Base class for components with shared styles
class StyledComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // Override this method in child classes
  getTemplate() {
    return "";
  }

  // Override this method to add component-specific styles
  getComponentStyles() {
    return "";
  }

  // Shared styles that all components will use
  getSharedStyles() {
    return `
      <style>
        /* Import external stylesheets */
        @import url('./src/css/design.css');
        @import url('./src/css/styles.css');
        @import url('https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css');
      </style>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      ${this.getSharedStyles()}
      ${this.getComponentStyles()}
      ${this.getTemplate()}
    `;
  }
}

export default StyledComponent;
