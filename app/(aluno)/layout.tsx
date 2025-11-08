import React from 'react';
import styles from './AlunoLayout.module.css';

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      
      <header className={styles.layoutHeader}>
        { }
      </header>

      <main className={styles.layoutMain}>
        {children}
      </main>

      { }
      <footer className={styles.layoutFooter}>
        Copyright © 2025 - Portal Acadêmico
      </footer>
    </div>
  );
}