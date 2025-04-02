'use client'
// app/RootLayout.js
import { useState } from 'react';
import 'boxicons/css/boxicons.min.css';
import styles from './layout.module.css';


export default function RootLayout({ children }) {
  const [expanded, setExpanded] = useState(false);

  const handleResize = () => {
    setExpanded(!expanded);
  };

  return (
    <html lang="en">
      <body className={`${styles.body} ${expanded ? styles.sbExpanded : ''}`}>
        <aside className={styles.aside}>
          <nav className={styles.nav}>
            <ul className={styles.navUl}>
              <li className={styles.navLi}>
                <a className={`${styles.navA} ${styles.active}`} href='/'>
                  <i className="bx bx-home-circle"></i>
                  <span className={styles.navSpan}>Inicio</span>
                </a>
              </li>
              <li className={styles.navLi}>
                <a className={styles.navA} href='/pokemon'>
                  <i className="bx bx-grid-alt"></i>
                  <span className={styles.navSpan}>Pokemon</span>
                </a>
              </li>
              <li className={styles.navLi}>
                <a className={styles.navA} href='/items'>
                  <i className="bx bx-carousel"></i>
                  <span className={styles.navSpan}>Items</span>
                </a>
              </li>
              <li className={styles.navLi}>
                <a className={styles.navA} href='/regions'>
                  <i className="bx bx-collection"></i>
                  <span className={styles.navSpan}>Regiones</span>
                </a>
              </li>
              <li className={styles.navLi}>
                <a className={styles.navA}>
                  <i className="bx bx-cloud-download"></i>
                  <span className={styles.navSpan}>Downloads</span>
                </a>
              </li>
              <li className={styles.navLi}>
                <a className={styles.navA}>
                  <i className="bx bx-chat"></i>
                  <span className={styles.navSpan}>Messages</span>
                </a>
              </li>
              <li className={styles.navLi}>
                <a className={styles.navA}>
                  <i className="bx bx-cog"></i>
                  <span className={styles.navSpan}>Settings</span>
                </a>
              </li>
              <li className={styles.navLi}>
                <a className={styles.navA} onClick={handleResize}>
                  <i className="bx bx-chevrons-right"></i>
                  <span className={styles.navSpan}>Collapse</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        {children}
      </body>
    </html>
  );
}