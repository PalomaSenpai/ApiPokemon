'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

// Función para agregar un retraso (para evitar problemas de rate-limiting)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Obtener la lista de movimientos desde la PokéAPI
async function fetchMoves(offset = 0, limit = 20) {
  const response = await fetch(`https://pokeapi.co/api/v2/move?offset=${offset}`, {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch moves');
  }
  return response.json();
}

// Obtener detalles de un movimiento específico
async function fetchMoveDetails(url) {
  const response = await fetch(url, {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch move details from ${url}`);
  }
  return response.json();
}

// Obtener los detalles de los movimientos en lotes
async function fetchMovesInBatches(moves, batchSize = 20) {
  const results = [];
  for (let i = 0; i < moves.length; i += batchSize) {
    const batch = moves.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (move) => {
        const details = await fetchMoveDetails(move.url);
        return {
          name: move.name,
          type: details.type.name,
          power: details.power || 'N/A',
          accuracy: details.accuracy || 'N/A',
          pp: details.pp || 'N/A',
          effect: details.effect_entries[0]?.short_effect || 'No effect description available',
        };
      })
    );
    results.push(...batchResults);
    await delay(1000); // Retraso para evitar problemas de rate-limiting
  }
  return results;
}

export default function MovesPage() {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const limit = 20; // Número de movimientos por página

  // Cargar los movimientos iniciales
  useEffect(() => {
    async function loadMoves() {
      try {
        setLoading(true);
        const data = await fetchMoves(offset, limit);
        const moveDetails = await fetchMovesInBatches(data.results, 20);
        setMoves((prev) => [...prev, ...moveDetails]);
        setHasMore(!!data.next); // Si hay un enlace "next", hay más datos
      } catch (err) {
        setError('Failed to load moves. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadMoves();
  }, [offset]);

  // Cargar más movimientos al hacer clic en "Load More"
  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pokémon Moves</h1>
      <p className={styles.subtitle}>
        Explore {moves.length} moves from the PokéAPI:
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <ul className={styles.moveList}>
        {moves.map((move, index) => (
          <li key={index} className={styles.moveItem}>
            <div className={styles.moveCard}>
              <h3 className={styles.moveName}>{move.name}</h3>
              <div className={styles.moveDetails}>
                <span className={`${styles.moveType} ${styles[move.type]}`}>
                  {move.type}
                </span>
                <p>Power: {move.power}</p>
                <p>Accuracy: {move.accuracy}</p>
                <p>PP: {move.pp}</p>
                <p className={styles.moveEffect}>{move.effect}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {loading && <p className={styles.loading}>Loading moves...</p>}

      {hasMore && !loading && (
        <button onClick={loadMore} className={styles.loadMoreButton}>
          Load More Moves
        </button>
      )}

      <Link href="/" className={styles.backLink}>
        Back to Pokémon List
      </Link>
    </div>
  );
}