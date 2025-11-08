import React from 'react';
import styles from './PublicLayout.module.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.publicContainer}>
      <header className={styles.publicHeader}>
        { }
        Portal Acadêmico
      </header>

      <main className={styles.publicMain}>
        {children} { }
      </main>

      { }
      <footer className={styles.publicFooter}>
        Copyright © 2025 - Portal Acadêmico
      </footer>
    </div>
  );
}