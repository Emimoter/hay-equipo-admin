async function check() {
  const res = await fetch('https://hay-equipo-admin.vercel.app/reservar');
  const html = await res.text();
  const buildIdMatch = html.match(/"buildId":"([^"]+)"/);
  console.log('Production buildId:', buildIdMatch ? buildIdMatch[1] : 'not found');
  
  const scriptMatches = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map(m => m[1]);
  console.log('Scripts count:', scriptMatches.length);
  for (const s of scriptMatches) {
    if (s.includes('reservar') || s.includes('pages/')) {
      const codeRes = await fetch('https://hay-equipo-admin.vercel.app' + s);
      const code = await codeRes.text();
      console.log('Script:', s);
      console.log('  has "HORARIOS DISPONIBLES":', code.includes('HORARIOS DISPONIBLES'));
      console.log('  has "Disponibilidad & Turnos Directos":', code.includes('Disponibilidad & Turnos Directos'));
      console.log('  has "Consultar WhatsApp":', code.includes('Consultar WhatsApp'));
      console.log('  has "16:30":', code.includes('16:30'));
    }
  }
}

check().catch(console.error);
