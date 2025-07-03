import StyledComponent from "./styled-component.js";

class EventCard extends StyledComponent {
  static get observedAttributes() {
    return ["avatar", "speaker", "agency", "agencyAvatar", "image"];
  }

  constructor() {
    super();
    this.attributeMap = {
      avatar: { element: "#avatar", property: "src" },
      speaker: {
        elements: [
          { selector: "#avatar", property: "alt" },
          { selector: 'slot[name="speaker"]', property: "textContent" },
        ],
      },
      agency: { element: 'slot[name="agency"]', property: "textContent" },
      agencyAvatar: { element: "#agency-avatar", property: "src" },
    };
    this.render();
  }

  getTemplate() {
    return `
      <div class="card w-full m-0 flex flex-col items-start justify-between radius-lg">
        <div class="flex flex-col items-start justify-between px-md pb-md pt-4xl radius-lg w-full mb-md" 
             style="background: url('${
               this.getAttribute("image") || "public/demo-img.png"
             }'); background-size: cover; background-position: center;">
          <h3 class="mb-sm text-white text-shadow"><slot name="title"></slot></h3>
          <div class="flex flex-row items-center">
            <div class="shadow-md radius-md bg-accent p-sm font-weight-bold flex items-center mr-sm">
              <i class="ph-fill ph-calendar mr-xs"></i>
              <small><slot name="date"></slot></small>
            </div>
            <small class="shadow-md radius-md bg-accent p-sm font-weight-bold">
              <slot name="location"></slot>
            </small>
          </div>
        </div>
        <div class="bg-gray-100 p-md flex flex-col items-start w-full radius-md flex-grow-1">
          <p><slot name="description"></slot></p>
          <div class="font-weight-bold flex items-center mb-sm">
            <img id="avatar" class="shadow-md radius-full mr-md" style="width:30px; height:30px;">
            <span><slot name="speaker"></slot></span>
          </div>
          <div class="font-weight-bold flex items-center">
            <img id="agency-avatar" class="shadow-md radius-full mr-md" style="width:30px; height:30px;">
            <span class="text-primary"><slot name="agency"></slot></span>
          </div>
        </div>
        <a href="#" class="mt-md w-full">
          <button class="button button-secondary w-full">
            <i class="ph-fill ph-ticket mr-xs"></i> <slot name="cta">Iscriviti</slot>
          </button>
        </a>
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
      // Handle multiple elements
      config.elements.forEach(({ selector, property }) => {
        const element = this.shadowRoot.querySelector(selector);
        if (element) {
          element[property] = value || this.getDefaultValue(name);
        }
      });
    } else {
      // Handle single element
      const element = this.shadowRoot.querySelector(config.element);
      if (element) {
        element[config.property] = value || this.getDefaultValue(name);
      }
    }
  }

  getDefaultValue(attributeName) {
    const defaults = {
      speaker: "Speaker",
      agency: "Agency",
      avatar: "",
      agencyAvatar: "",
      image: "public/demo-img.png",
    };
    return defaults[attributeName] || "";
  }

  connectedCallback() {
    // Initialize all observed attributes
    this.constructor.observedAttributes.forEach((attr) => {
      if (this.hasAttribute(attr)) {
        this.updateAttribute(attr, this.getAttribute(attr));
      }
    });
  }
}

customElements.define("event-card", EventCard);
