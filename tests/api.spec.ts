import { test, expect } from '../src/fixtures/base';
import { uniqueEmail, uid, VALID_PASSWORD } from '../src/utils/random';

const NOTES = '/notes/api';

test.describe('Health y utilidades', () => {
  test('[API-01] /api/health-check responde UP', async ({ request }) => {
    const res = await request.get('/api/health-check');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe('UP');
  });

  test('[API-02] /api/health-check devuelve JSON', async ({ request }) => {
    const res = await request.get('/api/health-check');
    expect(res.headers()['content-type']).toContain('application/json');
  });

  test('[API-03] /api/health-check incluye un mensaje', async ({ request }) => {
    const body = await (await request.get('/api/health-check')).json();
    expect(typeof body.message).toBe('string');
    expect(body.message.length).toBeGreaterThan(0);
  });

  test('[API-04] /notes/api/health-check responde 200', async ({ request }) => {
    const res = await request.get(`${NOTES}/health-check`);
    expect(res.status()).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  test('[API-05] /api/my-ip responde 200', async ({ request }) => {
    const res = await request.get('/api/my-ip/');
    expect(res.status()).toBe(200);
  });

  test('[API-06] la documentación Swagger de Notes carga', async ({ request }) => {
    const res = await request.get(`${NOTES}/api-docs/`);
    expect(res.status()).toBe(200);
  });

  test('[API-07] la documentación Swagger de Practice API carga', async ({ request }) => {
    const res = await request.get('/api/api-docs/');
    expect(res.status()).toBe(200);
  });

  test('[API-08] un endpoint inexistente responde 404', async ({ request }) => {
    const res = await request.get(`${NOTES}/ruta-que-no-existe-${uid()}`);
    expect(res.status()).toBe(404);
  });
});

test.describe('Códigos de estado HTTP', () => {
  for (const code of [200, 404, 500]) {
    test(`[STS-${code}] /status-codes/${code} devuelve ${code}`, async ({ request }) => {
      const res = await request.get(`/status-codes/${code}`);
      expect(res.status()).toBe(code);
    });
  }

  test('[STS-301] /status-codes/301 devuelve 301 sin seguir redirecciones', async ({ request }) => {
    const res = await request.get('/status-codes/301', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
  });
});

test.describe('Notes API · usuarios', () => {
  test.describe.configure({ mode: 'serial' });

  const user = {
    name: `QA User ${uid().slice(0, 6)}`,
    email: uniqueEmail('api'),
    password: VALID_PASSWORD,
  };
  let token = '';

  test('[USR-01] registro exitoso', async ({ request }) => {
    const res = await request.post(`${NOTES}/users/register`, { data: user });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(user.email);
    expect(body.data.name).toBe(user.name);
    expect(body.data.id).toBeTruthy();
  });

  test('[USR-02] registro duplicado devuelve 409', async ({ request }) => {
    const res = await request.post(`${NOTES}/users/register`, { data: user });
    expect(res.status()).toBe(409);
    expect((await res.json()).success).toBe(false);
  });

  test('[USR-03] login exitoso devuelve un token', async ({ request }) => {
    const res = await request.post(`${NOTES}/users/login`, {
      data: { email: user.email, password: user.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    token = body.data.token;
    expect(token.length).toBeGreaterThan(10);
  });

  test('[USR-04] el perfil con token válido devuelve el usuario', async ({ request }) => {
    const res = await request.get(`${NOTES}/users/profile`, { headers: { 'x-auth-token': token } });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.email).toBe(user.email);
  });

  test('[USR-05] el perfil sin token devuelve 401', async ({ request }) => {
    const res = await request.get(`${NOTES}/users/profile`);
    expect(res.status()).toBe(401);
  });

  test('[USR-06] el perfil con token falso devuelve 401', async ({ request }) => {
    const res = await request.get(`${NOTES}/users/profile`, { headers: { 'x-auth-token': 'token-falso' } });
    expect(res.status()).toBe(401);
  });

  test('[USR-07] actualizar el nombre del perfil', async ({ request }) => {
    const res = await request.patch(`${NOTES}/users/profile`, {
      headers: { 'x-auth-token': token },
      data: { name: 'QA Renombrado' },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.name).toBe('QA Renombrado');
  });

  test('[USR-08] login con password incorrecto devuelve 401', async ({ request }) => {
    const res = await request.post(`${NOTES}/users/login`, {
      data: { email: user.email, password: 'Incorrecta123!' },
    });
    expect(res.status()).toBe(401);
  });

  test('[USR-09] logout invalida el token', async ({ request }) => {
    const res = await request.delete(`${NOTES}/users/logout`, { headers: { 'x-auth-token': token } });
    expect(res.status()).toBe(200);
    const after = await request.get(`${NOTES}/users/profile`, { headers: { 'x-auth-token': token } });
    expect(after.status()).toBe(401);
  });
});

test.describe('Notes API · validaciones de usuarios', () => {
  const base = { name: 'Valid Name', email: '', password: VALID_PASSWORD };

  const invalid: Array<[string, Record<string, unknown>]> = [
    ['sin nombre', { name: undefined }],
    ['nombre muy corto', { name: 'ab' }],
    ['sin email', { email: undefined }],
    ['email sin arroba', { email: 'correo-invalido' }],
    ['email sin dominio', { email: 'correo@' }],
    ['sin password', { password: undefined }],
    ['password muy corto', { password: '123' }],
    ['password muy largo', { password: 'x'.repeat(200) }],
  ];

  for (const [label, override] of invalid) {
    test(`[VAL-REG] registro inválido (${label}) devuelve 400`, async ({ request }) => {
      const data = { ...base, email: uniqueEmail('val'), ...override };
      const res = await request.post(`${NOTES}/users/register`, { data });
      expect(res.status()).toBe(400);
      expect((await res.json()).success).toBe(false);
    });
  }

  const badLogin: Array<[string, Record<string, unknown>, number]> = [
    ['email inexistente', { email: 'nadie@example.com', password: VALID_PASSWORD }, 401],
    ['sin email', { password: VALID_PASSWORD }, 400],
    ['sin password', { email: 'nadie@example.com' }, 400],
    ['email mal formado', { email: 'abc', password: VALID_PASSWORD }, 400],
  ];
  for (const [label, data, status] of badLogin) {
    test(`[VAL-LOGIN] login inválido (${label}) devuelve ${status}`, async ({ request }) => {
      const res = await request.post(`${NOTES}/users/login`, { data });
      expect(res.status()).toBe(status);
    });
  }
});

test.describe('Notes API · CRUD de notas', () => {
  test.describe.configure({ mode: 'serial' });

  const user = { name: `Notes User ${uid().slice(0, 5)}`, email: uniqueEmail('notes'), password: VALID_PASSWORD };
  let token = '';
  let noteId = '';

  const auth = () => ({ 'x-auth-token': token });

  test('[NOTE-00] preparación: crear usuario e iniciar sesión', async ({ request }) => {
    const reg = await request.post(`${NOTES}/users/register`, { data: user });
    expect(reg.status()).toBe(201);
    const login = await request.post(`${NOTES}/users/login`, {
      data: { email: user.email, password: user.password },
    });
    token = (await login.json()).data.token;
    expect(token).toBeTruthy();
  });

  test('[NOTE-01] la lista de notas inicia vacía', async ({ request }) => {
    const res = await request.get(`${NOTES}/notes`, { headers: auth() });
    expect(res.status()).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });

  test('[NOTE-02] crear una nota', async ({ request }) => {
    const res = await request.post(`${NOTES}/notes`, {
      headers: auth(),
      data: { title: 'Mi primera nota', description: 'Descripción de la nota de prueba', category: 'Home' },
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.data.title).toBe('Mi primera nota');
    expect(body.data.completed).toBe(false);
    noteId = body.data.id;
    expect(noteId).toBeTruthy();
  });

  test('[NOTE-03] la nota aparece en el listado', async ({ request }) => {
    const res = await request.get(`${NOTES}/notes`, { headers: auth() });
    const ids = (await res.json()).data.map((n: { id: string }) => n.id);
    expect(ids).toContain(noteId);
  });

  test('[NOTE-04] obtener la nota por id', async ({ request }) => {
    const res = await request.get(`${NOTES}/notes/${noteId}`, { headers: auth() });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.id).toBe(noteId);
  });

  test('[NOTE-05] actualizar la nota completa (PUT)', async ({ request }) => {
    const res = await request.put(`${NOTES}/notes/${noteId}`, {
      headers: auth(),
      data: { title: 'Nota actualizada', description: 'Descripción actualizada', completed: true, category: 'Work' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe('Nota actualizada');
    expect(body.data.category).toBe('Work');
    expect(body.data.completed).toBe(true);
  });

  test('[NOTE-06] cambiar estado de completado (PATCH)', async ({ request }) => {
    const res = await request.patch(`${NOTES}/notes/${noteId}`, {
      headers: auth(),
      data: { completed: false },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).data.completed).toBe(false);
  });

  for (const category of ['Home', 'Work', 'Personal']) {
    test(`[NOTE-CAT] crear nota con categoría ${category}`, async ({ request }) => {
      const res = await request.post(`${NOTES}/notes`, {
        headers: auth(),
        data: { title: `Nota ${category}`, description: `Descripción para ${category}`, category },
      });
      expect([200, 201]).toContain(res.status());
      expect((await res.json()).data.category).toBe(category);
    });
  }

  const invalidNotes: Array<[string, Record<string, unknown>]> = [
    ['sin título', { title: undefined }],
    ['título muy corto', { title: 'ab' }],
    ['sin descripción', { description: undefined }],
    ['descripción muy corta', { description: 'ab' }],
    ['categoría inválida', { category: 'Inexistente' }],
    ['sin categoría', { category: undefined }],
  ];
  for (const [label, override] of invalidNotes) {
    test(`[NOTE-VAL] nota inválida (${label}) devuelve 400`, async ({ request }) => {
      const data = { title: 'Título válido', description: 'Descripción válida', category: 'Home', ...override };
      const res = await request.post(`${NOTES}/notes`, { headers: auth(), data });
      expect(res.status()).toBe(400);
    });
  }

  test('[NOTE-07] crear nota sin token devuelve 401', async ({ request }) => {
    const res = await request.post(`${NOTES}/notes`, {
      data: { title: 'Sin token', description: 'No debe crearse', category: 'Home' },
    });
    expect(res.status()).toBe(401);
  });

  test('[NOTE-08] listar notas sin token devuelve 401', async ({ request }) => {
    const res = await request.get(`${NOTES}/notes`);
    expect(res.status()).toBe(401);
  });

  test('[NOTE-09] id con formato inválido devuelve 400', async ({ request }) => {
    const res = await request.get(`${NOTES}/notes/id-invalido`, { headers: auth() });
    expect(res.status()).toBe(400);
  });

  test('[NOTE-10] id válido pero inexistente devuelve 404', async ({ request }) => {
    const res = await request.get(`${NOTES}/notes/000000000000000000000000`, { headers: auth() });
    expect(res.status()).toBe(404);
  });

  test('[NOTE-11] eliminar la nota', async ({ request }) => {
    const res = await request.delete(`${NOTES}/notes/${noteId}`, { headers: auth() });
    expect(res.status()).toBe(200);
  });

  test('[NOTE-12] la nota eliminada ya no existe (404)', async ({ request }) => {
    const res = await request.get(`${NOTES}/notes/${noteId}`, { headers: auth() });
    expect(res.status()).toBe(404);
  });

  test('[NOTE-13] eliminar la misma nota otra vez devuelve 404', async ({ request }) => {
    const res = await request.delete(`${NOTES}/notes/${noteId}`, { headers: auth() });
    expect(res.status()).toBe(404);
  });

  test('[NOTE-99] limpieza: eliminar la cuenta de prueba', async ({ request }) => {
    const res = await request.delete(`${NOTES}/users/delete-account`, { headers: auth() });
    expect(res.status()).toBe(200);
  });
});
