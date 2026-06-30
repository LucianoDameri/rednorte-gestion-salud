/**
 * Tests SaludRedNorte BFF — CERO dependencias externas
 * Solo usa módulos nativos de Node.js: http + assert
 *
 * Requisito: los contenedores Docker deben estar corriendo
 *   docker compose up -d
 *
 * Cómo ejecutar:
 *   node tests/test-bff.js
 */

'use strict';
const http   = require('http');
const assert = require('assert');

// ─── Mini test runner ────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch (e) {
    const msg = e.message || String(e);
    console.log(`  ❌  ${name}`);
    console.log(`      → ${msg}`);
    failed++;
    failures.push({ name, msg });
  }
}

function suite(title) {
  console.log(`\n📦  ${title}`);
  console.log('─'.repeat(55));
}

// ─── Helper HTTP (solo http nativo) ─────────────────────────────────────────
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token   ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', err =>
      reject(new Error(`No se pudo conectar al BFF en :3000 — ¿están corriendo los contenedores? (${err.message})`))
    );
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async function main() {

  // ── 1. Autenticación ───────────────────────────────────────────────────────
  suite('POST /auth/login');

  await test('200 + token con credenciales de recepcionista', async () => {
    const r = await request('POST', '/auth/login', { username: 'recepcionista', password: 'rec123' });
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.ok(r.body.token,              'Debe retornar token JWT');
    assert.ok(r.body.usuario,            'Debe retornar objeto usuario');
    assert.strictEqual(r.body.usuario.rol, 'RECEPCIONISTA');
    assert.ok(r.body.usuario.nombre,     'Debe retornar nombre');
  });

  await test('200 + token con credenciales de médico', async () => {
    const r = await request('POST', '/auth/login', { username: 'dr.garcia', password: 'med123' });
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.strictEqual(r.body.usuario.rol, 'MEDICO');
    assert.ok(r.body.token);
  });

  await test('200 con segundo médico (dr.lopez)', async () => {
    const r = await request('POST', '/auth/login', { username: 'dr.lopez', password: 'med456' });
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.strictEqual(r.body.usuario.rol, 'MEDICO');
  });

  await test('401 con contraseña incorrecta', async () => {
    const r = await request('POST', '/auth/login', { username: 'recepcionista', password: 'mala' });
    assert.strictEqual(r.status, 401, `Esperaba 401, recibió ${r.status}`);
    assert.ok(r.body.error, 'Debe retornar mensaje de error');
  });

  await test('401 con usuario inexistente', async () => {
    const r = await request('POST', '/auth/login', { username: 'nadie', password: 'x' });
    assert.strictEqual(r.status, 401, `Esperaba 401, recibió ${r.status}`);
  });

  await test('400/401 sin body (credenciales vacías)', async () => {
    const r = await request('POST', '/auth/login');
    assert.ok(r.status === 400 || r.status === 401,
      `Esperaba 400 o 401, recibió ${r.status}`);
  });

  // ── Tokens para el resto de los tests ─────────────────────────────────────
  const [lRec, lMed] = await Promise.all([
    request('POST', '/auth/login', { username: 'recepcionista', password: 'rec123' }),
    request('POST', '/auth/login', { username: 'dr.garcia',     password: 'med123' }),
  ]);
  const tokenRec = lRec.body.token;
  const tokenMed = lMed.body.token;

  if (!tokenRec || !tokenMed) {
    console.error('\n🚫  No se pudieron obtener tokens — abortando tests.\n');
    process.exit(1);
  }

  // ── 2. /auth/me ────────────────────────────────────────────────────────────
  suite('GET /auth/me');

  await test('401 sin token', async () => {
    const r = await request('GET', '/auth/me');
    assert.strictEqual(r.status, 401);
  });

  await test('401 con token malformado', async () => {
    const r = await request('GET', '/auth/me', null, 'esto.no.es.un.jwt');
    assert.strictEqual(r.status, 401);
  });

  await test('200 con token recepcionista — retorna rol correcto', async () => {
    const r = await request('GET', '/auth/me', null, tokenRec);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.usuario.rol, 'RECEPCIONISTA');
    assert.ok(r.body.usuario.username);
  });

  await test('200 con token médico — retorna rol correcto', async () => {
    const r = await request('GET', '/auth/me', null, tokenMed);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.usuario.rol, 'MEDICO');
  });

  // ── 3. /health ─────────────────────────────────────────────────────────────
  suite('GET /health');

  await test('responde sin autenticación (endpoint público)', async () => {
    const r = await request('GET', '/health');
    assert.ok(r.status === 200 || r.status === 207,
      `Esperaba 200 o 207, recibió ${r.status}`);
    assert.ok(r.body.status,   'Debe tener campo status');
    assert.ok(r.body.service,  'Debe identificar el servicio');
    assert.ok(r.body.downstream, 'Debe reportar downstream');
  });

  await test('downstream contiene los 3 microservicios', async () => {
    const r = await request('GET', '/health');
    const d = r.body.downstream;
    assert.ok(d.paciente,    'Falta servicio-paciente');
    assert.ok(d.solicitud,   'Falta servicio-solicitudes');
    assert.ok(d.listaEspera, 'Falta servicio-lista-espera');
    assert.ok(d.paciente.status,    'paciente debe tener status');
    assert.ok(d.solicitud.status,   'solicitud debe tener status');
    assert.ok(d.listaEspera.status, 'listaEspera debe tener status');
  });

  // ── 4. CRUD Pacientes ──────────────────────────────────────────────────────
  suite('CRUD /bff/paciente');

  await test('401 GET sin token', async () => {
    const r = await request('GET', '/bff/paciente');
    assert.strictEqual(r.status, 401);
  });

  await test('200 GET lista — retorna arreglo', async () => {
    const r = await request('GET', '/bff/paciente', null, tokenRec);
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.ok(Array.isArray(r.body), 'Debe retornar arreglo');
  });

  await test('200 GET lista con token de médico (solo lectura permitida)', async () => {
    const r = await request('GET', '/bff/paciente', null, tokenMed);
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.ok(Array.isArray(r.body));
  });

  let pacienteId = null;
  const rut = `TEST${Date.now().toString().slice(-6)}-K`;

  await test('201/200 POST — crea paciente nuevo', async () => {
    const r = await request('POST', '/bff/paciente', {
      rut,
      nombre: 'Prueba',
      apellido: 'Automatica',
      email: `prueba${Date.now()}@test.cl`,
      telefono: '+56900000001',
    }, tokenRec);
    assert.ok(r.status === 200 || r.status === 201,
      `Esperaba 200/201, recibió ${r.status}: ${JSON.stringify(r.body)}`);
    assert.ok(r.body.id,       'Debe retornar id del paciente');
    assert.ok(r.body.nombre,   'Debe retornar nombre');
    assert.ok(r.body.rut,      'Debe retornar rut');
    pacienteId = r.body.id;
  });

  await test('200 GET /:id — obtiene el paciente creado', async () => {
    if (!pacienteId) throw new Error('Saltado: POST falló');
    const r = await request('GET', `/bff/paciente/${pacienteId}`, null, tokenRec);
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.strictEqual(r.body.id, pacienteId);
    assert.strictEqual(r.body.nombre, 'Prueba');
  });

  await test('200 PUT /:id — actualiza nombre del paciente', async () => {
    if (!pacienteId) throw new Error('Saltado: POST falló');
    const r = await request('PUT', `/bff/paciente/${pacienteId}`, {
      nombre: 'PruebaActualizada',
    }, tokenRec);
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.strictEqual(r.body.nombre, 'PruebaActualizada');
  });

  await test('200 DELETE /:id — elimina el paciente', async () => {
    if (!pacienteId) throw new Error('Saltado: POST falló');
    const r = await request('DELETE', `/bff/paciente/${pacienteId}`, null, tokenRec);
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
  });

  await test('404 GET /:id — después de eliminar', async () => {
    if (!pacienteId) throw new Error('Saltado: POST falló');
    const r = await request('GET', `/bff/paciente/${pacienteId}`, null, tokenRec);
    assert.ok(r.status === 404, `Esperaba 404, recibió ${r.status}`);
  });

  // ── 5. CRUD Solicitudes ────────────────────────────────────────────────────
  suite('CRUD /bff/solicitud');

  await test('401 GET sin token', async () => {
    const r = await request('GET', '/bff/solicitud');
    assert.strictEqual(r.status, 401);
  });

  await test('200 GET lista de solicitudes', async () => {
    const r = await request('GET', '/bff/solicitud', null, tokenRec);
    assert.ok(r.status === 200, `Esperaba 200, recibió ${r.status}`);
    assert.ok(Array.isArray(r.body), 'Debe retornar arreglo');
  });

  // Crear paciente temporal para solicitud
  let pacTempId = null;
  const rTemp = await request('POST', '/bff/paciente', {
    rut: `TEMP${Date.now().toString().slice(-5)}-K`,
    nombre: 'Temp', apellido: 'Solicitud',
    email: `temp${Date.now()}@test.cl`,
    telefono: '+56900000002',
  }, tokenRec);
  if (rTemp.status === 200 || rTemp.status === 201) pacTempId = rTemp.body.id;

  let solicitudId = null;

  await test('201/200 POST — crea solicitud médica', async () => {
    if (!pacTempId) throw new Error('Saltado: paciente temporal no creado');
    const r = await request('POST', '/bff/solicitud', {
      pacienteId:   pacTempId,
      especialidadId: 1,
      tipoAtencion: 'CONSULTA',
      descripcion:  'Test automatizado',
      prioridad:    'NORMAL',
    }, tokenRec);
    assert.ok(r.status === 200 || r.status === 201,
      `Esperaba 200/201, recibió ${r.status}: ${JSON.stringify(r.body)}`);
    assert.ok(r.body.id, 'Debe retornar id de la solicitud');
    solicitudId = r.body.id;
  });

  await test('200 GET /:id — obtiene la solicitud creada', async () => {
    if (!solicitudId) throw new Error('Saltado: POST falló');
    const r = await request('GET', `/bff/solicitud/${solicitudId}`, null, tokenRec);
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.strictEqual(r.body.id, solicitudId);
  });

  await test('200 DELETE /:id — elimina la solicitud', async () => {
    if (!solicitudId) throw new Error('Saltado: POST falló');
    const r = await request('DELETE', `/bff/solicitud/${solicitudId}`, null, tokenRec);
    assert.ok(r.status === 200, `Esperaba 200, recibió ${r.status}`);
  });

  // Limpiar paciente temporal
  if (pacTempId) await request('DELETE', `/bff/paciente/${pacTempId}`, null, tokenRec);

  // ── 6. Lista de espera ─────────────────────────────────────────────────────
  suite('GET /bff/lista-espera');

  await test('401 sin token', async () => {
    const r = await request('GET', '/bff/lista-espera');
    assert.strictEqual(r.status, 401);
  });

  await test('200 GET lista de espera (recepcionista)', async () => {
    const r = await request('GET', '/bff/lista-espera', null, tokenRec);
    assert.ok(r.status === 200, `Esperaba 200, recibió ${r.status}`);
    assert.ok(Array.isArray(r.body), 'Debe retornar arreglo');
  });

  await test('200 GET lista de espera (médico)', async () => {
    const r = await request('GET', '/bff/lista-espera', null, tokenMed);
    assert.ok(r.status === 200, `Esperaba 200, recibió ${r.status}`);
  });

  // ── Resumen ────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n' + '═'.repeat(55));
  console.log(`📊  RESULTADO: ${passed}/${total} pasaron    ${failed} fallaron`);
  console.log('═'.repeat(55));

  if (failed > 0) {
    console.log('\n⚠️  Tests fallidos:');
    failures.forEach(f => console.log(`   ✗ ${f.name}\n     ${f.msg}`));
    process.exit(1);
  } else {
    console.log('\n✅  Todos los tests pasaron.\n');
    process.exit(0);
  }

})();
