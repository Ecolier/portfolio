import { useState } from 'react'
import styles from '../styles/Navbar.module.css'

export default function Navbar ({ subtitles }) {

    const [menuToggled, setMenuToggled] = useState(false)

    const toggleMenu = () => {
        setMenuToggled(!menuToggled)
    }

    return (
        <div className={styles.navbar}>
            <div className={styles.navContainer}>
                <div className={styles.navLeft}>
                    <div className={styles.profilePicture}></div>
                    <div className={styles.identity}>
                        <span>Evan Gruère</span>
                        <span className={styles.job}>Developer</span>
                    </div>
                    <div className={styles.separator}></div>
                    <div className={`${styles.menu} ${menuToggled ? `${styles.menuActive}` : ''}`}>
                        <div className={styles.menuItem}>Home</div>
                        <div className={styles.menuItem}>Projects</div>
                        <div className={styles.menuItem}>Philosophy</div>
                    </div>
                    <div className={styles.button}>Hire Me !</div>
                </div>
                <div className={styles.navRight}>
                    <div className={styles.menuToggle}>
                        <span className={`${styles.menuIcon} material-icons`}
                                onClick={toggleMenu}>
                            menu
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

