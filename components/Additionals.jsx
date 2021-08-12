import styles from '../styles/Home.module.css'

export default function Additionals({ blockName, products, description, className }) {
	return (
		<div className={[styles.additionals, className].join(' ')}>
			<div className={styles.additionalsHeader}>Додай:</div>
			<div className={styles.additionalsCategory}>
				<div>
					<h3>Сир чеддер</h3>
					<span className={styles.price}>9₴</span>
				</div>
			</div>
		</div>
	);
}
