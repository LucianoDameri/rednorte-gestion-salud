/**
 * Tests directos a los microservicios — CERO dependencias externas
 * Solo usa: node:http + node:assert (built-in Node.js)
 *
 * Requiere: docker compose up -d
 *
 * Cómo ejecutar:
 *   node tests/test-microservicios.js
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

function request(port, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', err =>
      reject(new Error(`No se pudo conectar al puerto ${port} — ¿están corriendo los contenedores? (${err.message})`))
    );
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async function main() {

  // ── servicio-paciente (:3001) ──────────────────────────────────────────────
  suite('servicio-paciente :3001');

  await test('GET /health → 200', async () => {
    const r = await request(3001, 'GET', '/health');
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.ok(r.body.status, 'Debe retornar campo status');
  });

  await test('GET /paciente → arreglo', async () => {
    const r = await request(3001, 'GET', '/paciente');
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
    assert.ok(Array.isArray(r.body), 'Debe retornar arreglo');
  });

  let pacId = null;
  const rutTest = `PAC${Date.now().toString().slice(-6)}-K`;

  await test('POST /paciente → crea paciente', async () => {
    const r = await request(3001, 'POST', '/paciente', {
      rut:      rutTest,
      nombre:   'TestPac',
      apellido: 'Directo',
      email:    `pac${Date.now()}@test.cl`,
      telefono: '+56900000099',
    });
    assert.ok(r.status === 200 || r.status === 201,
      `Esperaba 200/201, recibió ${r.status}: ${JSON.stringify(r.body)}`);
    assert.ok(r.body.id,     'Debe retornar id');
    assert.ok(r.body.nombre, 'Debe retornar nombre');
    pacId = r.body.id;
  });

  await test('GET /paciente/:id → obtiene el paciente creado', async () => {
    if (!pacId) throw new Error('Saltado: POST falló');
    const r = await request(3001, 'GET', `/paciente/${pacId}`);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.id,  pacId);
    assert.strictEqual(r.body.rut, rutTest);
  });

  await test('PUT /paciente/:id → actualiza telefono', async () => {
    if (!pacId) throw new Error('Saltado: POST falló');
    const r = await request(3001, 'PUT', `/paciente/${pacId}`, { telefono: '+56911111111' });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.telefono, '+56911111111');
  });

  await test('DELETE /paciente/:id → elimina el paciente', async () => {
    if (!pacId) throw new Error('Saltado: POST falló');
    const r = await request(3001, 'DELETE', `/paciente/${pacId}`);
    assert.strictEqual(r.status, 200);
  });

  await test('GET /paciente/:id → 404 después de eliminar', async () => {
    if (!pacId) throw new Error('Saltado: POST falló');
    const r = await request(3001, 'GET', `/paciente/${pacId}`);
    assert.strictEqual(r.status, 404);
  });

  // ── servicio-solicitudes (:3002) ───────────────────────────────────────────
  suite('servicio-solicitudes :3002');

  await test('GET /health → 200', async () => {
    const r = await request(3002, 'GET', '/health');
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
  });

  await test('GET /solicitud → arreglo', async () => {
    const r = await request(3002, 'GET', '/solicitud');
    assert.ok(r.status === 200, `Esperaba 200, recibió ${r.status}`);
    assert.ok(Array.isArray(r.body), 'Debe retornar arreglo');
  });

  // Crear paciente de soporte para la solicitud
  let pacSolId = null;
  const rSol = await request(3001, 'POST', '/paciente', {
    rut: `SOL${Date.now().toString().slice(-5)}-K`,
    nombre: 'SolPac', apellido: 'Test',
    email: `sol${Date.now()}@test.cl`,
    telefono: '+56900000003',
  });
  if (rSol.status === 200 || rSol.status === 201) pacSolId = rSol.body.id;

  let solId = null;

  await test('POST /solicitud → crea solicitud', async () => {
    if (!pacSolId) throw new Error('Saltado: paciente de soporte no creado');
    const r = await request(3002, 'POST', '/solicitud', {
      pacienteId:    pacSolId,
      especialidadId: 2,
      tipoAtencion:  'DIAGNOSTICO',
      descripcion:   'Test directo al microservicio',
      prioridad:     'ALTA',
    });
    assert.ok(r.status === 200 || r.status === 201,
      `Esperaba 200/201, recibió ${r.status}: ${JSON.stringify(r.body)}`);
    assert.ok(r.body.id, 'Debe retornar id');
    solId = r.body.id;
  });

  await test('GET /solicitud/:id → obtiene la solicitud', async () => {
    if (!solId) throw new Error('Saltado: POST falló');
    const r = await request(3002, 'GET', `/solicitud/${solId}`);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.id, solId);
    assert.strictEqual(r.body.tipoAtencion, 'DIAGNOSTICO');
  });

  await test('GET /solicitud?pacienteId → filtra por paciente', async () => {
    if (!pacSolId) throw new Error('Saltado');
    const r = await request(3002, 'GET', `/solicitud?pacienteId=${pacSolId}`);
    assert.strictEqual(r.status, 200);
    assert.ok(Array.isArray(r.body));
    assert.ok(r.body.length > 0, 'Debe encontrar al menos 1 solicitud para ese paciente');
  });

  await test('DELETE /solicitud/:id → elimina la solicitud', async () => {
    if (!solId) throw new Error('Saltado: POST falló');
    const r = await request(3002, 'DELETE', `/solicitud/${solId}`);
    assert.strictEqual(r.status, 200);
  });

  // Limpiar paciente de soporte
  if (pacSolId) await request(3001, 'DELETE', `/paciente/${pacSolId}`);

  // ── servicio-lista-espera (:3003) ──────────────────────────────────────────
  suite('servicio-lista-espera :3003');

  await test('GET /health → 200', async () => {
    const r = await request(3003, 'GET', '/health');
    assert.strictEqual(r.status, 200, `Esperaba 200, recibió ${r.status}`);
  });

  await test('GET /lista-espera → arreglo', async () => {
    const r = await request(3003, 'GET', '/lista-espera');
    assert.ok(r.status === 200, `Esperaba 200, recibió ${r.status}`);
    assert.ok(Array.isArray(r.body), 'Debe retornar arreglo');
  });

  await test('GET /lista-espera tiene campos de prioridad y estado', async () => {
    const r = await request(3003, 'GET', '/lista-espera');
    assert.strictEqual(r.status, 200);
    if (r.body.length > 0) {
      const item = r.body[0];
      assert.ok('prioridad'    in item || 'estado' in item || 'solicitudId' in item,
        `Los ítems deben tener prioridad/estado/solicitudId: ${JSON.stringify(item)}`);
    }
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
