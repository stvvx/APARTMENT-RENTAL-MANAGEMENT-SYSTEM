import React from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;500;600;700&display=swap";
document.head.appendChild(fontLink);

const styles = {
  footerContainer: {
    background: "#f9f9f9",
    borderTop: "1px solid #ebebeb",
    padding: "60px 40px 30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#222",
  },
  footerContent: {
    maxWidth: 1400,
    margin: "0 auto",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 40,
    marginBottom: 50,
  },
  footerSection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#222",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 400,
    color: "#717171",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.2s",
    lineHeight: 1.6,
    padding: "4px 0",
    background: "none",
    border: "none",
    fontFamily: "inherit",
  },
  footerBottom: {
    borderTop: "1px solid #ebebeb",
    paddingTop: 30,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
  },
  copyright: {
    fontSize: 13,
    color: "#717171",
    fontWeight: 400,
  },
  socialIcons: {
    display: "flex",
    gap: 16,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    border: "1px solid #ebebeb",
    cursor: "pointer",
    fontSize: 16,
    transition: "all 0.2s",
    textDecoration: "none",
    color: "#717171",
  },
};

export default function Footer() {
  const [hoveredLink, setHoveredLink] = React.useState(null);
  const [hoveredSocial, setHoveredSocial] = React.useState(null);

  const footerSections = [
    {
      title: "SUPPORT",
      links: [
        { label: "Help Center", href: "#" },
        { label: "Contact Support", href: "#" },
        { label: "Safety Information", href: "#" },
        { label: "Community Guidelines", href: "#" },
      ],
    },
    {
      title: "COMMUNITY",
      links: [
        { label: "Blog", href: "#" },
        { label: "News", href: "#" },
        { label: "Magazine", href: "#" },
        { label: "Community Forum", href: "#" },
      ],
    },
    {
      title: "HOSTING",
      links: [
        { label: "List Your Property", href: "#" },
        { label: "Hosting Resources", href: "#" },
        { label: "Community Center", href: "#" },
        { label: "Host Responsibilities", href: "#" },
      ],
    },
    {
      title: "ABOUT",
      links: [
        { label: "About EasRent", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
        { label: "Investors", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: "f", label: "Facebook" },
    { icon: "𝕏", label: "Twitter" },
    { icon: "in", label: "Instagram" },
  ];

  return (
    <footer style={styles.footerContainer}>
      <div style={styles.footerContent}>
        {/* Footer Grid */}
        <div style={styles.footerGrid}>
          {footerSections.map((section) => (
            <div key={section.title} style={styles.footerSection}>
              <h4 style={styles.footerTitle}>{section.title}</h4>
              {section.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  style={styles.footerLink}
                  onMouseEnter={() => setHoveredLink(link.label)}
                  onMouseLeave={() => setHoveredLink(null)}
                  onMouseMove={(e) =>
                    hoveredLink === link.label
                      ? (e.target.style.color = "#222")
                      : (e.target.style.color = "#717171")
                  }
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div style={styles.footerBottom}>
          <div style={styles.copyright}>
            © 2024 EasRent. All rights reserved. | <a href="#" style={{ ...styles.footerLink, display: "inline", color: "#717171" }}>Privacy</a> | <a href="#" style={{ ...styles.footerLink, display: "inline", color: "#717171" }}>Terms</a>
          </div>
          <div style={styles.socialIcons}>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href="#"
                style={{...styles.socialIcon }}
                title={social.label}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FF385C";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "#FF385C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#717171";
                  e.currentTarget.style.borderColor = "#ebebeb";
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
