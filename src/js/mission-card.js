import StyledComponent from "./styled-component.js";

class MissionCard extends StyledComponent {
  static get observedAttributes() {
    return ["title", "icon", "bg"];
  }

  constructor() {
    super();
    this.render();
  }

  getTemplate() {
    const bgClass = this.getAttribute("bg") || "bg-white";
    return `
      <div class="w-full radius-lg shadow-md p-md flex flex-col items-start ${bgClass} border border-color-primary">
        <div class="flex flex-row items-center mb-xs">
          ${
            this.getAttribute("icon")
              ? `<i class="${this.getAttribute(
                  "icon"
                )} text-primary mr-xs" aria-hidden="true"></i>`
              : ""
          }
          <h5 class="text-primary font-weight-bold m-0"><slot name="title"></slot></h5>
        </div>
        <p class="mb-0"><slot name="description"></slot></p>
        <slot></slot>
      </div>
    `;
  }

  getComponentStyles() {
    return `<style>
      .card { transition: box-shadow 0.2s; }
      .card:hover { box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10); }
      h5 { font-size: 1.1rem; }
    </style>`;
  }
}

customElements.define("mission-card", MissionCard);
