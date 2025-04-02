// app/items/page.jsx
import Link from 'next/link';
import styles from './page.module.css';

// Función para agregar un retraso
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchItemList() {
  const response = await fetch('https://pokeapi.co/api/v2/item?limit=500', {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch item list');
  }
  return response.json();
}

async function fetchItemDetails(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        cache: 'force-cache',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch item details from ${url}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error.message);
      if (i === retries - 1) {
        return null;
      }
      await delay(1000);
    }
  }
}

async function fetchItemsInBatches(itemList, batchSize = 50) {
  const results = [];
  for (let i = 0; i < itemList.length; i += batchSize) {
    const batch = itemList.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const details = await fetchItemDetails(item.url);
        if (!details) {
          return null;
        }
        // Obtenemos la descripción del efecto (en inglés, si está disponible)
        const description = details.effect_entries?.find(entry => entry.language.name === 'en')?.effect || 'No description available';
        return {
          name: item.name,
          sprite: details.sprites.default, // Imagen del item
          description: description, // Descripción del efecto
        };
      })
    );
    results.push(...batchResults);
    await delay(1000);
  }
  return results;
}

export default async function ItemsPage() {
  const data = await fetchItemList();
  const itemDetails = await fetchItemsInBatches(data.results, 50);

  const validItemDetails = itemDetails.filter((item) => item !== null);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pokémon Items</h1>
      <p className={styles.subtitle}>
        Here are {validItemDetails.length} items from the PokéAPI:
      </p>
      <ul className={styles.itemList}>
        {validItemDetails.map((item, index) => (
          <li key={index} className={styles.item}>
            <div className={styles.itemHeader}>
              {item.sprite ? (
                <img
                  src={item.sprite}
                  alt={item.name}
                  className={styles.itemImage}
                />
              ) : (
                <div className={styles.noImage}>No Image</div>
              )}
              <h3 className={styles.itemName}>{item.name.replace(/-/g, ' ')}</h3>
            </div>
            <p className={styles.itemDescription}>{item.description}</p>
          </li>
        ))}
      </ul>
      <Link href="/" className={styles.backLink}>
        Back to Home
      </Link>
    </div>
  );
}