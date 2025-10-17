import React, { useState } from 'react';
import { migrateUsersToPublicCollection } from '../utils/migratePublicUsers';

export default function AdminMigrate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const migrationResult = await migrateUsersToPublicCollection();
      setResult(migrationResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Ferramenta de Migração de Usuários</h1>
      <p>
        Esta ferramenta migra todos os usuários existentes para a coleção pública,
        permitindo que eles sejam encontrados na função de pesquisa.
      </p>

      <button
        onClick={handleMigrate}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: loading ? '#ccc' : '#4A90E2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem'
        }}
      >
        {loading ? 'Migrando...' : 'Executar Migração'}
      </button>

      {result && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <h3>Resultado da Migração</h3>
          {result.success ? (
            <div>
              <p>✅ Migração concluída com sucesso!</p>
              <p>Usuários migrados: {result.migratedCount}</p>
              <p>Erros: {result.errorCount}</p>
              <p>Total de usuários: {result.totalUsers}</p>
            </div>
          ) : (
            <div>
              <p>❌ Erro na migração: {result.error}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          <h3>Erro</h3>
          <p>{error}</p>
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#e2e3e5',
        border: '1px solid #d6d8db',
        borderRadius: '4px'
      }}>
        <h3>Instruções</h3>
        <ol>
          <li>Clique no botão "Executar Migração" para migrar todos os usuários existentes</li>
          <li>Aguarde o processo completar</li>
          <li>Verifique o resultado da migração</li>
          <li>Após a migração, todos os usuários deverão aparecer na função de pesquisa</li>
          <li>Esta página pode ser removida após a migração ser concluída</li>
        </ol>
      </div>
    </div>
  );
}