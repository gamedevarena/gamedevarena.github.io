import StyledComponent from "./styled-component.js";

class SponsorCard extends StyledComponent {
  static get observedAttributes() {
    return ["logo", "name", "link", "tier"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  getTemplate() {
    const logo = this.getAttribute("logo") || "";
    const name = this.getAttribute("name") || "Sponsor";
    const link = this.getAttribute("link") || "#";
    const tier = this.getAttribute("tier") || "standard";

    return `
      <a href="${link}" target="_blank" rel="noopener noreferrer" class="sponsor-link" aria-label="${name}">
        <div class="sponsor-card p-md flex flex-col gap-md tier-${tier}">
          <div class="sponsor-logo-container">
            <img
              src="${logo}"
              alt="${name} logo"
              class="sponsor-logo"
              loading="lazy"
            />
          </div>
          <div class="sponsor-info">
            <h6 class="sponsor-name">${name}</h6>
            <slot name="description"></slot>
          </div>
        </div>
      </a>
    `;
  }

  getComponentStyles() {
    return `
      <style>
        .sponsor-link {
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }

        .sponsor-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-lg);
          background: var(--color-white);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
          height: 100%;
          border: 2px solid transparent;
        }

        .sponsor-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-primary);
        }

        /* Tier-based styling */
        .tier-platinum {
          background: linear-gradient(135deg, var(--color-gray-200) 0%, var(--color-gray-100) 100%);
          border-color: var(--color-gray-400);
        }

        .tier-gold {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
          border-color: #f59e0b;
        }

        .tier-silver {
          background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-white) 100%);
          border-color: var(--color-gray-300);
        }

        .tier-bronze {
          background: linear-gradient(135deg, #fed7aa 0%, #fef3e7 100%);
          border-color: #ea580c;
        }

        .sponsor-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100px;
          margin-bottom: var(--spacing-md);
        }

        .sponsor-logo {
          max-width: 100%;
          max-height: 100px;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        /* Larger logos for premium tiers */
        .tier-platinum .sponsor-logo {
          max-height: 140px;
        }

        .tier-gold .sponsor-logo {
          max-height: 120px;
        }

        .sponsor-info {
          text-align: center;
          width: 100%;
        }

        .sponsor-name {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-gray-800);
        }

        ::slotted([slot="description"]) {
          color: var(--color-black) !important;
        }

        .tier-platinum .sponsor-name {
          font-size: 1.3rem;
        }

        .tier-gold .sponsor-name {
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .sponsor-card {
            padding: var(--spacing-md);
          }

          .sponsor-logo {
            max-height: 80px;
          }

          .tier-platinum .sponsor-logo {
            max-height: 100px;
          }

          .tier-gold .sponsor-logo {
            max-height: 90px;
          }

          .sponsor-name {
            font-size: 1rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("sponsor-card", SponsorCard);
