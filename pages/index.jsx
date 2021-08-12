import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import CategoryBlock from '../components/CategoryBlock'
import useSWR from 'swr';
import styles from '../styles/Home.module.css';
import { BlockNames } from '../constants/blocks-names';
import Additionals from "../components/Additionals";

const trackEndpoint = '/api/user?zone=';
const QR_SCAN_FREQUENCY_TIMEOUT = 60000; // 1 min
const MAX_BREAKFAST_HOUR = 13;

const getData = async () => {
	const urlParams = new URLSearchParams(window.location.search);
	const storage = window.localStorage;
	const zone = urlParams.get('zone');

	const fetchData = async () => {
		storage.setItem('lastUpdated', new Date().toISOString());
		const response = await fetch(trackEndpoint + zone);
		return await response.json();
	};

	let lastUpdated = storage.getItem('lastUpdated');
	if (lastUpdated) {
		let currentTime = new Date(new Date().toISOString()).getTime();
		if (
			currentTime - new Date(lastUpdated).getTime() >
			QR_SCAN_FREQUENCY_TIMEOUT
		) {
			return await fetchData();
		} else {
			return new Promise.resolve(false);
		}
	} else {
		return await fetchData();
	}
};

export default function Home({ blocks }) {
	const data = useSWR(trackEndpoint, getData, {
		dedupingInterval: 60000,
	});

	const [breakfaskFirst, setBreakfaskFirst] = useState(false);

	useEffect(() => {
		const hour = new Date().getHours();
		setBreakfaskFirst(hour <= 8 || hour <= MAX_BREAKFAST_HOUR);
	}, []);

	return (
		<div className={styles.container}>
			<Head>
				<title>Меню Мушля</title>
				<meta name="description" content="QR меню кафе Мушля Житомир" />
				<meta name="robots" content="noindex,nofollow" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="true"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Montserrat&family=Open+Sans:wght@300&display=swap"
					rel="stylesheet"
				/>
			</Head>

			<main className={styles.main}>
				<header>
					<Image
						className={styles.logo}
						priority={true}
						src="/logo.svg"
						alt="Мушля"
						width={350}
						height={80}
					/>
					<a
						href={'https://www.instagram.com/mushlya.zt/'}
						target={'_blank'}
						rel="noreferrer"
						className={styles.instagram}
					>
						<Image
							priority={true}
							src="/instagram.svg"
							alt="Мушля"
							width={16}
							height={16}
						/>
						<span>mushlya.zt</span>
					</a>
				</header>
				
				{/*<MainList blocks={blocks} showMainLabel={breakfaskFirst} />*/}

        <CategoryBlock
          key={BlockNames.oysterBar}
          {...{
            ...blocks.find(
              (block) => block.blockName === BlockNames.oysterBar
            ),
            className: styles.backgroundOyster,
          }}
        />
        <CategoryBlock
          key={BlockNames.cooledSeafood}
          {...{
            ...blocks.find(
              (block) => block.blockName === BlockNames.cooledSeafood
            ),
          }}
        />
        <CategoryBlock {...({...blocks.find(block => block.blockName === BlockNames.tartar), className: styles.cardBlock})}/>

        <CategoryBlock
          key={BlockNames.salad}
          {...{
            ...blocks.find(
              (block) => block.blockName === BlockNames.salad
            ),
          }}
        />

        <CategoryBlock
          key={BlockNames.bowls}
          {...{
            ...blocks.find(
              (block) => block.blockName === BlockNames.bowls
            ),
            className: styles.cardBlockBordered,
          }}
        />

				<div className={styles.biliyNalyv}>
					<header>
          <Image
            className={styles.logo}
            priority={true}
            src="/logo_BN.svg"
            alt="Білий Налив"
            width={350}
            height={80}
          />
          <a
            href={'https://www.instagram.com/biliy.nalyv.zt/'}
            target={'_blank'}
            rel="noreferrer"
            className={styles.instagram}
          >
            <Image
              priority={true}
              src="/instagramBn.svg"
              alt="Білий Налив"
              width={16}
              height={16}
            />
            <span className={styles.bnColor}>biliy.nalyv.zt</span>
          </a>
        </header>
          <CategoryBlock
            key={BlockNames.drinks}
            {...{
              ...blocks.find(
                (block) => block.blockName === BlockNames.drinks
              )
            }}
          />
          <CategoryBlock
            key={BlockNames.hotDog}
            {...{
              ...blocks.find(
                (block) => block.blockName === BlockNames.hotDog
              )
            }}
          />
          <Additionals />
          <CategoryBlock
            key={BlockNames.pie}
            {...{
              ...blocks.find(
                (block) => block.blockName === BlockNames.pie
              )
            }}
          />
				</div>
			</main>
		</div>
	);
}

export async function getStaticProps() {
	const clientId = process.env.CLIENT_ID;
	const host = process.env.HOST;
	const res = await fetch(
		`https://${host}/api/v1/categories?clientId=${clientId}`
	);
	const productsRes = await fetch(
		`https://${host}/api/v1/products?clientId=${clientId}`
	);
	const { data: categories } = await res.json();
	const { data: products } = await productsRes.json();

	if (!categories || !products) {
		return {
			notFound: true,
		};
	}

	const blocks = [];

	categories.forEach((cat) => {
		blocks.push({
			id: cat._id,
			blockName: cat.name,
			description: cat.description,
			products: products
				.filter((v) => v.available && v.category === cat._id)
				.sort((a, b) => a.price - b.price),
			subCategories: cat.children,
		});
	});

	return {
		props: { categories, products, blocks }, // will be passed to the page component as props
	};
}
