import styles from '../styles/Home.module.css'

export default function Home() {

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.content}>
          <div className={styles.title}>My Talent. <span className={styles.callout}>Your Rules.</span></div>
          <p>
            Years of programming experience has led me to develop an
            intuitive sense for solving problem on computers. As I grew older
            with a laptop in my hands, learning the 
            technologies that suit you and your company is just a matter of time !
          </p>
        </div>
        <div className={styles.illustration}>
          <div className={styles.code}></div>
          <div className={styles.space}></div>
          <div className={styles.spaceship}></div>
          <div className={styles.spaceOutline}></div>
        </div>
      </section>
    </div>
  )
}