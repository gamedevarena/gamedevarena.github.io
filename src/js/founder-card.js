import StyledComponent from "./styled-component.js";

class FounderCard extends StyledComponent {
  static get observedAttributes() {
    return ["avatar", "name", "role", "bio"];
  }

  constructor() {
    super();
    this.attributeMap = {
      avatar: { element: "#avatar", property: "src" },
      name: {
        elements: [
          { selector: "#avatar", property: "alt" },
          { selector: 'slot[name="name"]', property: "textContent" },
        ],
      },
      role: { element: 'slot[name="role"]', property: "textContent" },
      bio: { element: 'slot[name="bio"]', property: "textContent" },
    };
    this.render();
  }

  getTemplate() {
    return `
      <div class="card w-full m-0 flex flex-col items-start justify-between radius-lg">
        <div class="flex flex-col items-start justify-between px-md pb-md pt-4xl radius-lg w-full mb-md bg-primary" style="background: url('${
          this.getAttribute("image") || "public/demo-img.png"
        }'); background-size: cover; background-position: center;">
          <div class="font-weight-bold flex items-center mb-sm">
            <img id="avatar" class="shadow-md radius-full mr-md" style="width:60px; height:60px;">
            <div class="flex flex-col">
              <span class="text-shadow text-white text-lg font-weight-bold"><slot name="name"></slot></span>
              <span class="text-shadow text-white font-weight-light"><slot name="role"></slot></span>
            </div>
          </div>
        </div>
        <div class="bg-gray-100 p-md flex flex-col items-start w-full radius-md flex-grow-1">
          <p class="mb-md"><slot name="bio"></slot></p>
        </div>
      </div>
    `;
  }

  getComponentStyles() {
    return `
      <style>
        .card {
          transition: transform 0.2s ease;
        }
        .card:hover {
          transform: translateY(-2px);
        }
      </style>
    `;
  }

  updateAttribute(name, value) {
    const config = this.attributeMap[name];
    if (!config) return;

    if (config.elements) {
      config.elements.forEach(({ selector, property }) => {
        const element = this.shadowRoot.querySelector(selector);
        if (element) {
          element[property] = value || this.getDefaultValue(name);
        }
      });
    } else {
      const element = this.shadowRoot.querySelector(config.element);
      if (element) {
        element[config.property] = value || this.getDefaultValue(name);
      }
    }
  }

  getDefaultValue(attributeName) {
    const defaults = {
      name: "Founder Name",
      role: "Role",
      bio: "Founder bio goes here.",
      avatar: "",
    };
    return defaults[attributeName] || "";
  }

  connectedCallback() {
    this.constructor.observedAttributes.forEach((attr) => {
      if (this.hasAttribute(attr)) {
        this.updateAttribute(attr, this.getAttribute(attr));
      }
    });
  }
}

customElements.define("founder-card", FounderCard);
