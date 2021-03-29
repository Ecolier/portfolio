import { useState } from 'react'
import styles from '../styles/Navbar.module.css'

export default function Navbar () {

    const [menuToggled, setMenuToggled] = useState(false)

    const toggleMenu = () => {
        setMenuToggled(!menuToggled)
    }

    return (
        <div className={styles.navbar}>
            <div className={styles.navContainer}>
                <div className={styles.navLeft}>
                    <div className={styles.logo}></div>
                    <div className={styles.brand}>
                        <span>Hidavi</span>
                    </div>
                </div>
                <div className={styles.navRight}>
                    <div className={styles.button}>Embauchez-nous !</div>
                </div>
            </div>
        </div>
    )
}

