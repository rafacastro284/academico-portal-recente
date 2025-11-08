import Link from 'next/link';
import styles from './AdminLayout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Opcional: Logo ou Título do Portal */}
          {/* <span className={styles.logo}>Portal Admin</span> */}
          <div className={styles.userInfo}>
            <span>Olá, Admin Teste!</span>
            <Link href="/login">
              <button className={styles.logoutButton}>Sair</button>
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {children}
      </main>

      <footer className={styles.footer}>
        Copyright © 2025
      </footer>
    </div>
  );
}