import '../styles/globals.css'
import Layout from '../components/layout'

function Portfolio({ Component, pageProps}) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default Portfolio
