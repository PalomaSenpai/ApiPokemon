// app/regions/page.jsx
import Link from 'next/link';
import styles from './page.module.css';

// Función para agregar un retraso
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRegionList() {
  const response = await fetch('https://pokeapi.co/api/v2/region', {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch region list');
  }
  return response.json();
}

async function fetchRegionDetails(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        cache: 'force-cache',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch region details from ${url}: ${response.status}`);
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

async function fetchRegionsInBatches(regionList, batchSize = 5) {
  const results = [];
  for (let i = 0; i < regionList.length; i += batchSize) {
    const batch = regionList.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (region) => {
        const details = await fetchRegionDetails(region.url);
        if (!details) {
          return null;
        }
        return {
          name: region.name,
          locations: details.locations || [],
        };
      })
    );
    results.push(...batchResults);
    await delay(1000);
  }
  return results;
}

export default async function RegionsPage() {
  const data = await fetchRegionList();
  const regionDetails = await fetchRegionsInBatches(data.results, 5);

  const validRegionDetails = regionDetails.filter((region) => region !== null);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pokémon Regions</h1>
      <p className={styles.subtitle}>
        Here are {validRegionDetails.length} regions from the PokéAPI:
      </p>
      <ul className={styles.regionList}>
        {validRegionDetails.map((region, index) => (
          <li key={index} className={styles.region}>
            <h3 className={styles.regionName}>{region.name.replace(/-/g, ' ')}</h3>
            <div className={styles.locations}>
              <h4 className={styles.locationsTitle}>Locations:</h4>
              {region.locations.length > 0 ? (
                <ul className={styles.locationList}>
                  {region.locations.map((location, locIndex) => (
                    <li key={locIndex} className={styles.locationItem}>
                      {location.name.replace(/-/g, ' ')}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noLocations}>No locations available</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}