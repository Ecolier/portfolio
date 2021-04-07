import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <section className={`${styles['presentation']} content-container`}>
        <div className={styles.woman}></div>
        <div className={styles.content}>
          <div className={styles['presentation__title']}>Prenez des vacances, on s'occupe de tout !</div>
          <div className={styles['presentation__subtitle']}>Linotte est une société de design et de développement web qui vous offre la paix.</div>
        </div>
      </section>
      <section className={`${styles['section']} ${styles['section--light']}`}>
        <div className={styles.wave}></div>
        <div className={styles['background-container']}>
          <div className="content-container">
          <div className={styles.content}>
          <div className={styles.title}>Votre application, à vos mesures.</div>
          <p className={styles.body}>Nous suivons les règles de design les plus modernes pour offrir à vos utilisateurs une navigation éloquente. Tout au long du processus de création, nous recueillons vos suggestions afin de parfaire l’expérience finale.</p>
        </div>
        <div className={styles.illustration}>
          <div className={styles.grid}></div>
          <div className={styles.window}></div>
        </div>
          </div>
        </div>
        <div className={`${styles['wave']} ${styles['wave--reversed']}`}></div>
      </section>
      <section className={`${styles['section']} content-container`}>

      <div className={styles.content}>
              <div className={styles.title}>Un coup de projecteur sur votre présence en ligne.</div>
              <p className={styles.body}>Construisez d'après vos valeurs un vivier technologique qui rassemble vos utilisateurs. Bénéficiez des techniques de référencements les plus élaborées et faites deux pas en avant vers votre nouvelle audience.</p>
            </div>
            <div className={styles.spotlights}>
              <div className={styles.yellowSpotlight}></div>
              <div className={styles.lines}></div>
            </div>

        
      </section>
    </div>
  )
}