import styles from '../styles/Layout.module.css'
import Navbar from '../components/navbar'

export default function Layout ({ children }) {
    return (
        <div className={styles['page-container']}>
            <Navbar />
            {children}
        </div>
    )
}