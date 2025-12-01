import StyledComponent from "./styled-component.js";

class PartnersCard extends StyledComponent {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  getTemplate() {
    const partners = [
      {
        logo: "univr.svg",
        name: "Universita degli studi di Verona",
        link: "https://www.univr.it/it/",
      },
      {
        logo: "coderdojo-tn.png",
        name: "CoderDojo Trento",
        link: "https://www.coderdojotrento.it",
      },
      {
        logo: "coderdojo-vr-logo-150x150.png",
        name: "CoderDojo Verona",
        link: "https://www.coderdojovr.it",
      },
      {
        logo: "311_logo.png",
        name: "311 Verona",
        link: "https://311verona.org",
      },
      {
        logo: "logo_IDP.png",
        name: "Istituto Design Palladio Verona",
        link: "https://istitutopalladio.it",
      },
      {
        logo: "vrfablab_logo_h_90dpi_color_nobg.png",
        name: "VR FabLab",
        link: "https://www.veronafablab.it",
      },
    ];

    const imageElements = partners
      .map(
        (partner) => `
        <a href="${partner.link}" target="_blank" rel="noopener noreferrer" class="text-center h-full">
          <div class="partner-logo-container h-full">
            <img 
              src="public/partners/${partner.logo}" 
              alt="${partner.name} logo"
              class="partner-logo"
              loading="lazy"
            />
            <span class="sr-only text-on-primary mt-xs">${partner.name}</span>
          </div>
        </a>
    `
      )
      .join("");

    return `
      <div class="partners-grid">
        ${imageElements}
      </div>
    `;
  }

  getComponentStyles() {
    return `
      <style>
        .partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          width: 100%;
        }

        .partner-logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .partner-logo-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .partner-logo {
          max-width: 100%;
          max-height: 80px;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        @media (max-width: 768px) {
          .partners-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
          }
          
          .partner-logo {
            max-height: 60px;
          }
        }
      </style>
    `;
  }
}

customElements.define("partners-card", PartnersCard);
