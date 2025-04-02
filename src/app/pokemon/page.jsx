// app/about/page.jsx
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

// Función para agregar un retraso
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPokemonList() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=500', {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon list');
  }
  return response.json();
}

async function fetchPokemonDetails(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        cache: 'force-cache',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch Pokémon details from ${url}: ${response.status}`);
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

async function fetchPokemonInBatches(pokemonList, batchSize = 50) {
  const results = [];
  for (let i = 0; i < pokemonList.length; i += batchSize) {
    const batch = pokemonList.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (pokemon) => {
        const details = await fetchPokemonDetails(pokemon.url);
        if (!details) {
          return null;
        }
        return {
          name: pokemon.name,
          image: details.sprites.front_default,
        };
      })
    );
    results.push(...batchResults);
    await delay(1000);
  }
  return results;
}

export default async function AboutPage() {
  const data = await fetchPokemonList();
  const pokemonDetails = await fetchPokemonInBatches(data.results, 50);

  const validPokemonDetails = pokemonDetails.filter((pokemon) => pokemon !== null);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pokémon List</h1>
      <p className={styles.subtitle}>
        Here are {validPokemonDetails.length} Pokémon from the PokéAPI:
      </p>
      <ul className={styles.pokemonList}>
        {validPokemonDetails.map((pokemon, index) => (
          <li key={index} className={styles.pokemonItem}>
            <Link href={`/pokemon/${pokemon.name}`} className={styles.pokemonLink}>
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                width={96}
                height={96}
                className={styles.pokemonImage}
                priority={index < 20}
              />
              <span className={styles.pokemonName}>{pokemon.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}