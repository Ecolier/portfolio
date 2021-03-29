import styles from '../styles/Home.module.css'

export default function Home() {

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.content}>
          <div className={styles.title}>Votre application, à vos mesures.</div>
          <p className={styles.body}>Nous suivons les règles de design les plus modernes pour offrir à vos utilisateurs une navigation éloquente. Tout au long du processus de création, nous recueillons vos suggestions afin de parfaire l’expérience finale.</p>
        </div>
        <div className={styles.illustration}>
          <div className={styles.grid}></div>
          <div className={styles.window}></div>
        </div>
      </section>
      <div className={styles.wave}></div>
      <section className={styles.lightSection}>
        <div className={styles.content}>
          <div className={styles.title}>Un coup de projecteur sur votre présence en ligne.</div>
          <p className={styles.body}>Nous suivons les règles de design les plus modernes pour offrir à vos utilisateurs une navigation éloquente. Tout au long du processus de création, nous recueillons vos suggestions afin de parfaire l’expérience finale.</p>
        </div>
        <div className={styles.illustration}>
          <div className={styles.grid}></div>
          <div className={styles.window}></div>
        </div>
      </section>
    </div>
  )
}