const jwt = require('jsonwebtoken');
const h = require('./helpers/setup');

beforeAll(h.start);
afterAll(h.stop);
afterEach(h.reset);

describe('authentication', () => {
    test('/ping returns 200', async () => {
        await h.api().get('/ping').expect(200);
    });

    test('requests without a token get 401', async () => {
        await h.api().get('/user/user_details').expect(401);
    });

    test('a token signed with the wrong secret is rejected (was accepted via jwt.decode)', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        const forged = jwt.sign({ user_id: user.id }, 'attacker-secret');
        await h.api().get('/user/user_details').set(h.bearer(forged)).expect(401);
    });

    test('an unsigned token is rejected', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        const unsigned = jwt.sign({ user_id: user.id }, null, { algorithm: 'none' });
        await h.api().get('/user/user_details').set(h.bearer(unsigned)).expect(401);
    });

    test('an expired token is rejected', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        const expired = jwt.sign({ user_id: user.id, exp: Math.floor(Date.now() / 1000) - 10 }, process.env.JWT_SECRET);
        await h.api().get('/user/user_details').set(h.bearer(expired)).expect(401);
    });

    test('a valid token for a deleted user is rejected cleanly', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        await h.api().delete(`/admin/delete_user/${user.id}`).set(h.bearer(admin.token)).expect(200);
        await h.api().get('/user/user_details').set(h.bearer(user.token)).expect(401);
    });

    test('the bare token (no "Bearer ") still works for old clients', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        await h.api().get('/user/user_details').set({ Authorization: user.token }).expect(200);
    });
});

describe('login', () => {
    test('unknown email gets 401, not a server error', async () => {
        const res = await h.api().post('/user/signin').send({ email: 'nobody@example.com', password: 'whatever1' });
        expect(res.status).toBe(401);
        expect(res.body.msg).toBe('Invalid email or password');
    });

    test('wrong password gets the same message as unknown email', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        const res = await h.api().post('/user/signin').send({ email: user.email, password: 'wrong-pass' });
        expect(res.status).toBe(401);
        expect(res.body.msg).toBe('Invalid email or password');
    });

    test('login before setup is finished explains what to do', async () => {
        const admin = await h.create_admin();
        const email = h.unique_email();
        await h
            .api()
            .post('/admin/create_user')
            .set(h.bearer(admin.token))
            .send({ email, first_name: 'A', last_name: 'B' });
        const res = await h.api().post('/user/signin').send({ email, password: 'anything1' });
        expect(res.status).toBe(403);
    });
});

describe('account setup and passwords', () => {
    test('there is no unauthenticated password-reset by email any more', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        // the old takeover: set anyone's password knowing only their email
        await h.api().put('/user/update_password').send({ email: user.email, password: 'hacked' }).expect(404);
        // the setup endpoint needs the one-time code
        await h
            .api()
            .post('/user/setup_password')
            .send({ email: user.email, setup_token: 'WRONG123', password: 'hacked-123' })
            .expect(400);
        await h.api().post('/user/signin').send({ email: user.email, password: 'password-123' }).expect(200);
    });

    test('a setup code works only once', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        await h
            .api()
            .post('/user/setup_password')
            .send({ email: user.email, setup_token: user.setup_token, password: 'another-123' })
            .expect(400);
    });

    test('change_password needs the current password', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        await h
            .api()
            .put('/user/change_password')
            .set(h.bearer(user.token))
            .send({ current_password: 'nope-nope', new_password: 'new-pass-123' })
            .expect(400);
        await h
            .api()
            .put('/user/change_password')
            .set(h.bearer(user.token))
            .send({ current_password: 'password-123', new_password: 'new-pass-123' })
            .expect(200);
        await h.api().post('/user/signin').send({ email: user.email, password: 'new-pass-123' }).expect(200);
    });

    test('passwords shorter than 8 characters are rejected', async () => {
        const admin = await h.create_admin();
        const email = h.unique_email();
        const created = await h
            .api()
            .post('/admin/create_user')
            .set(h.bearer(admin.token))
            .send({ email, first_name: 'A', last_name: 'B' });
        await h
            .api()
            .post('/user/setup_password')
            .send({ email, setup_token: created.body.setup_token, password: 'short' })
            .expect(400);
    });
});

describe('profile', () => {
    test('user_details never includes password or PIN hashes', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        const res = await h.api().get('/user/user_details').set(h.bearer(user.token)).expect(200);
        const profile = res.body.user_profile_details;
        expect(profile.password).toBeUndefined();
        expect(profile.transaction_pin).toBeUndefined();
        expect(profile.setup_token).toBeUndefined();
        expect(profile.has_pin).toBe(true);
        expect(profile.account_details.account_number).toMatch(/^\d{10}$/);
    });

    test('update_profile is reachable (route was missing its leading slash)', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        const res = await h
            .api()
            .put('/user/update_profile')
            .set(h.bearer(user.token))
            .send({ first_name: "Ngozi O'Brien" })
            .expect(200);
        expect(res.body.data.first_name).toBe("Ngozi O'Brien");
    });

    test('update_profile refuses an email another user has', async () => {
        const admin = await h.create_admin();
        const a = await h.create_customer(admin);
        const b = await h.create_customer(admin);
        await h.api().put('/user/update_profile').set(h.bearer(a.token)).send({ email: b.email }).expect(409);
    });

    test('created_at is the real creation time, not the server start time', async () => {
        const admin = await h.create_admin();
        const a = await h.create_customer(admin);
        await new Promise((r) => setTimeout(r, 20));
        const b = await h.create_customer(admin);
        const get = async (u) =>
            new Date(
                (await h.api().get('/user/user_details').set(h.bearer(u.token))).body.user_profile_details.created_at,
            );
        expect((await get(b)).getTime()).toBeGreaterThan((await get(a)).getTime());
    });
});

describe('transaction PIN', () => {
    test('PIN must be exactly 4 digits', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin, { pin: null });
        await h.api().post('/user/setpin').set(h.bearer(user.token)).send({ pin: '12a4' }).expect(400);
        await h.api().post('/user/setpin').set(h.bearer(user.token)).send({ pin: '12345' }).expect(400);
    });

    test('changing an existing PIN needs the current PIN or the password', async () => {
        const admin = await h.create_admin();
        const user = await h.create_customer(admin);
        await h.api().post('/user/setpin').set(h.bearer(user.token)).send({ pin: '9999' }).expect(400);
        await h
            .api()
            .post('/user/setpin')
            .set(h.bearer(user.token))
            .send({ pin: '9999', current_pin: '1234' })
            .expect(200);
        await h
            .api()
            .post('/user/setpin')
            .set(h.bearer(user.token))
            .send({ pin: '5555', password: 'password-123' })
            .expect(200);
    });
});
