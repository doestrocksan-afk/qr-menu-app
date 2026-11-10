'use client';
export default function MenuError({ reset }) {
  return <main style={{fontFamily:'system-ui',maxWidth:560,margin:'15vh auto',padding:24}}><h1>No hemos podido cargar la carta</h1><p>Hay un problema temporal de conexión. Inténtalo de nuevo.</p><button onClick={reset}>Volver a intentar</button></main>;
}
