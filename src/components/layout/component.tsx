import { Header } from '../header/component'
import { Footer } from '../footer/component'

import styles from './styles.module.scss'

export const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className={styles.layout}>
        <Header className={styles.header} />
        <main>{children}</main>
        <Footer />
    </div>
)
