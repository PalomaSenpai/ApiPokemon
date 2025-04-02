'use client'
// app/[name].jsx
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

// Función para calcular estadísticas mínimas y máximas
function calculateStats(baseStat, level, isHP) {
  const minIV = 0;
  const maxIV = 31;
  const minEV = 0;
  const maxEV = 252;
  const natureMin = 0.9; // Naturaleza desfavorable
  const natureMax = 1.1; // Naturaleza favorable

  let min, max;

  if (isHP) {
    // Fórmula para HP
    min = Math.floor(((2 * baseStat + minIV + Math.floor(minEV / 4)) * level) / 100) + level + 10;
    max = Math.floor(((2 * baseStat + maxIV + Math.floor(maxEV / 4)) * level) / 100) + level + 10;
  } else {
    // Fórmula para otras estadísticas
    min = Math.floor(Math.floor(((2 * baseStat + minIV + Math.floor(minEV / 4)) * level) / 100) + 5) * natureMin;
    max = Math.floor(Math.floor(((2 * baseStat + maxIV + Math.floor(maxEV / 4)) * level) / 100) + 5) * natureMax;
  }

  return { min, max };
}

async function fetchPokemonDetails(name) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {
    cache: 'force-cache',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch details for ${name}`);
  }
  return response.json();
}

export default async function PokemonDetailsPage({ params }) {
  const { name } = params;
  const pokemon = await fetchPokemonDetails(name);

  // Calcular estadísticas para nivel 50 y 100
  const statsWithCalculations = pokemon.stats.map(stat => {
    const baseStat = stat.base_stat;
    const isHP = stat.stat.name === 'hp';
    const level50 = calculateStats(baseStat, 50, isHP);
    const level100 = calculateStats(baseStat, 100, isHP);
    const effort = stat.effort; // Puntos de esfuerzo (EVs)

    return {
      name: stat.stat.name,
      base: baseStat,
      level50Min: level50.min,
      level50Max: level50.max,
      level100Min: level100.min,
      level100Max: level100.max,
      effort,
    };
  });

  // Calcular el total de las estadísticas base
  const totalBaseStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{pokemon.name.toUpperCase()}</h1>
      <div className={styles.pokemonDetails}>
        {/* Imagen del Pokémon */}
        <div className={styles.imageContainer}>
          {pokemon.sprites.front_default ? (
            <Image
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              width={200}
              height={200}
              className={styles.pokemonImage}
              priority
            />
          ) : (
            <div className={styles.noImage}>No Image</div>
          )}
        </div>

        {/* Información básica */}
        <div className={styles.infoSection}>
          <h2>Información básica</h2>
          <p><strong>ID:</strong> {pokemon.id}</p>
          <p><strong>Altura:</strong> {pokemon.height / 10} m</p>
          <p><strong>Peso:</strong> {pokemon.weight / 10} kg</p>
          <p><strong>Tipos:</strong> {pokemon.types.map(type => type.type.name).join(', ')}</p>
          <p><strong>Habilidades:</strong> {pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
        </div>

        {/* Estadísticas */}
        <div className={styles.statsSection}>
          <h2>Características base</h2>
          <table className={styles.statsTable}>
            <thead>
              <tr>
                <th>Características base</th>
                <th>Nivel 50</th>
                <th>Nivel 100</th>
                <th>PE</th>
              </tr>
            </thead>
            <tbody>
              {statsWithCalculations.map((stat, index) => (
                <tr key={index}>
                  <td>
                    <span className={styles.statName}>
                      {stat.name === 'hp' ? 'PS' : 
                       stat.name === 'attack' ? 'Ataque' : 
                       stat.name === 'defense' ? 'Defensa' : 
                       stat.name === 'special-attack' ? 'At. esp.' : 
                       stat.name === 'special-defense' ? 'Def. esp.' : 
                       stat.name === 'speed' ? 'Velocidad' : stat.name}
                    </span>
                    <span className={styles.statValue}>{stat.base}</span>
                    <div className={styles.statBarContainer}>
                      <div
                        className={styles.statBar}
                        style={{
                          width: `${(stat.base / 255) * 100}%`, // 255 es el máximo posible para una estadística base
                          backgroundColor: stat.base < 50 ? '#ff7f7f' : stat.base < 100 ? '#ffbf7f' : '#7fff7f',
                        }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    {stat.level50Min} - {stat.level50Max}
                  </td>
                  <td>
                    {stat.level100Min} - {stat.level100Max}
                  </td>
                  <td>{stat.effort}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td>
                  <span className={styles.statName}>Total</span>
                  <span className={styles.statValue}>{totalBaseStats}</span>
                </td>
                <td colSpan="3"></td>
              </tr>
            </tbody>
          </table>
          <p className={styles.statsNote}>
            Valores mínimos (Mín) calculados asumiendo naturaleza desfavorable, 0 EVs y 0 IVs.<br />
            Valores máximos (Máx) calculados asumiendo naturaleza favorable, 252 EVs y 31 IVs.
          </p>
        </div>

        {/* Movimientos */}
        <div className={styles.movesSection}>
          <h2>Movimientos</h2>
          <ul className={styles.movesList}>
            {pokemon.moves.slice(0, 10).map((move, index) => (
              <li key={index}>{move.move.name.replace(/-/g, ' ')}</li>
            ))}
          </ul>
        </div>
      </div>
      <Link href="/about" className={styles.backLink}>
        Volver a la lista de Pokémon
      </Link>
    </div>
  );
}