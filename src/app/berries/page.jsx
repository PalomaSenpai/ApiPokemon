'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

// Función para agregar un retraso (para evitar problemas de rate-limiting)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Obtener la lista de bayas desde la PokéAPI
async function fetchBerries(offset = 0, limit = 20) {
  const response = await fetch(`https://pokeapi.co/api/v2/berry?offset=${offset}&limit=${limit}`, {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch berries');
  }
  return response.json();
}

// Obtener detalles de una baya específica
async function fetchBerryDetails(url) {
  const response = await fetch(url, {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch berry details from ${url}`);
  }
  return response.json();
}

// Obtener los detalles de las bayas en lotes
async function fetchBerriesInBatches(berries, batchSize = 20) {
  const results = [];
  for (let i = 0; i < berries.length; i += batchSize) {
    const batch = berries.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (berry) => {
        const details = await fetchBerryDetails(berry.url);
        return {
          name: berry.name,
          size: details.size, // Tamaño de la baya (en milímetros)
          growthTime: details.growth_time, // Tiempo de crecimiento (en horas)
          maxHarvest: details.max_harvest, // Máximo de bayas que se pueden cosechar
          flavors: details.flavors, // Sabores de la baya (spicy, dry, sweet, bitter, sour)
          effect: details.natural_gift_type?.name || 'N/A', // Tipo de regalo natural (efecto)
        };
      })
    );
    results.push(...batchResults);
    await delay(1000); // Retraso para evitar problemas de rate-limiting
  }
  return results;
}

export default function BerriesPage() {
  const [berries, setBerries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const limit = 20; // Número de bayas por página

  // Cargar las bayas iniciales
  useEffect(() => {
    async function loadBerries() {
      try {
        setLoading(true);
        const data = await fetchBerries(offset, limit);
        const berryDetails = await fetchBerriesInBatches(data.results, 20);
        setBerries((prev) => [...prev, ...berryDetails]);
        setHasMore(!!data.next); // Si hay un enlace "next", hay más datos
      } catch (err) {
        setError('Failed to load berries. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadBerries();
  }, [offset]);

  // Cargar más bayas al hacer clic en "Load More"
  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pokémon Berries</h1>
      <p className={styles.subtitle}>
        Explore {berries.length} berries from the PokéAPI:
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <ul className={styles.berryList}>
        {berries.map((berry, index) => (
          <li key={index} className={styles.berryItem}>
            <div className={styles.berryCard}>
              <h3 className={styles.berryName}>{berry.name}</h3>
              <div className={styles.berryDetails}>
                <p>Size: {berry.size} mm</p>
                <p>Growth Time: {berry.growthTime} hours</p>
                <p>Max Harvest: {berry.maxHarvest}</p>
                <p>Natural Gift Type: <span className={`${styles.berryType} ${styles[berry.effect]}`}>{berry.effect}</span></p>
                <div className={styles.flavors}>
                  <h4>Flavors:</h4>
                  <ul>
                    {berry.flavors.map((flavor, idx) => (
                      flavor.potency > 0 && (
                        <li key={idx}>
                          {flavor.flavor.name}: {flavor.potency}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {loading && <p className={styles.loading}>Loading berries...</p>}

      {hasMore && !loading && (
        <button onClick={loadMore} className={styles.loadMoreButton}>
          Load More Berries
        </button>
      )}

      <Link href="/" className={styles.backLink}>
        Back to Pokémon List
      </Link>
    </div>
  );
}