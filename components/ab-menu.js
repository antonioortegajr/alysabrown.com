// <ab-menu>: the site's hamburger menu, shared by every page.
// To add a page, add it to PAGES below. The current page is marked with aria-current.
// Colors come from the --ab-* custom properties set on .ab-header, which inherit into the shadow root.

const PAGES = [
    { href: "index.html", label: "Home" },
    { href: "commissions.html", label: "Commissions" },
];

const STYLES = `
    :host { display: block; position: relative; }
    summary {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin: -7px -7px -7px 0;
        color: var(--ab-muted);
        cursor: pointer;
        list-style: none;
        transition: color 220ms ease;
    }
    summary::-webkit-details-marker { display: none; }
    summary:hover,
    summary:focus-visible,
    details[open] summary { color: var(--ab-ink); }
    svg { width: 18px; height: 18px; display: block; }
    nav {
        position: absolute;
        top: calc(100% + 0.75rem);
        right: -7px;
        z-index: 10;
        display: flex;
        flex-direction: column;
        min-width: 11rem;
        padding: 0.5rem 0;
        background: var(--ab-paper);
        border: 1px solid var(--ab-rule);
    }
    a {
        padding: 0.7rem 1.25rem;
        font-size: 0.6875rem;
        font-weight: 500;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        text-decoration: none;
        color: var(--ab-muted);
    }
    a:hover,
    a:focus-visible,
    a[aria-current="page"] { color: var(--ab-ink); }
    .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
    }
    @media (prefers-reduced-motion: reduce) {
        summary { transition: none; }
    }
`;

// "/", "/index.html", "/commissions", and "/commissions.html" all compare equal to their page.
function pageKey(pathname) {
    const file = pathname.split("/").pop().replace(/\.html$/, "");
    return file === "" ? "index" : file;
}

class AbMenu extends HTMLElement {
    connectedCallback() {
        if (this.shadowRoot) return;
        const current = pageKey(location.pathname);
        const links = PAGES.map(({ href, label }) => {
            const attr = pageKey(href) === current ? ' aria-current="page"' : "";
            return `<a href="${href}"${attr}>${label}</a>`;
        }).join("");

        this.attachShadow({ mode: "open" }).innerHTML = `
            <style>${STYLES}</style>
            <details>
                <summary>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
                    <span class="visually-hidden">Menu</span>
                </summary>
                <nav aria-label="Site">${links}</nav>
            </details>
        `;
    }
}

customElements.define("ab-menu", AbMenu);
