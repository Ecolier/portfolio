import styles from '../styles/Offers.module.css'

export default function Offers () {
    return (
        <div className="content-container">
            <h1>Évaluons vos besoins !</h1>
            <div className={styles['card']}>
                <span className={`${styles['card__illustration']} material-icons`}>
                    person
                </span>
                <h1 className={styles['card__title']}>
                    Page personnelle
                </h1>
                <h2 className={styles['card__subtitle']}>
                    Un lieu qui vous ressemble et vous donne la parole.
                </h2>
                <a href="#" className={styles['card__button']}>Choisir cette offre</a>
            </div>
            <div className={styles['card']}>
                <span className={`${styles['card__illustration']} material-icons`}>
                    shopping_cart
                </span>
                <h1 className={styles['card__title']}>
                    E-Commerce
                </h1>
                <h2 className={styles['card__subtitle']}>
                    Une gallerie qui met en valeur vos produits avec la possibilité d'acheter et d'expédier.
                </h2>
                <a href="#" className={styles['card__button']}>Choisir cette offre</a>
            </div>
            <div className={styles['card']}>
                <span className={`${styles['card__illustration']} material-icons`}>
                    smartphone
                </span>
                <h1 className={styles['card__title']}>
                    Application
                </h1>
                <h2 className={styles['card__subtitle']}>
                    Un produit dynamique avec des fonctionnalités sur-mesure, disponible sur iOS et Android.
                </h2>
                <a href="#" className={styles['card__button']}>Choisir cette offre</a>
            </div>
        </div>
    )
}