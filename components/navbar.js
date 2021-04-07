import styles from '../styles/Navbar.module.css'

export default function Navbar () {
    return (
        <div className={`${styles.navbar} content-container`}>
            <div className={styles.navContainer}>
                <div className={styles.navLeft}>
                    <a href="/" className={styles.logo}></a>
                    <span className={styles.brand}>Linotte</span>
                </div>
                <div className={styles.navRight}>
                    <a href='/offers' className={styles.button}>Voir les offres</a>
                </div>
            </div>
        </div>
    )
}

