const h = require('./helpers/setup');
const Transaction = require('../Database/model/transaction');

beforeAll(h.start);
afterAll(h.stop);
afterEach(h.reset);

let admin;
beforeEach(async () => {
    admin = await h.create_admin();
});

const transfer = (u, to, amount) =>
    h
        .api()
        .post('/transaction/transfer')
        .set(h.bearer(u.token))
        .send({ pin: u.pin, amount, account_number: to.account_number, narration: 'test' });
const reverse = (id, token = admin.token) => h.api().put(`/admin/reverse_transaction/${id}`).set(h.bearer(token));

describe('admin access', () => {
    test('customers cannot use admin routes', async () => {
        const u = await h.create_customer(admin);
        await h.api().get('/admin/users').set(h.bearer(u.token)).expect(403);
        await h
            .api()
            .post('/admin/create_user')
            .set(h.bearer(u.token))
            .send({ email: 'x@example.com', first_name: 'X', last_name: 'Y' })
            .expect(403);
    });

    test('create_user returns a setup code and rejects duplicates', async () => {
        const res = await h
            .api()
            .post('/admin/create_user')
            .set(h.bearer(admin.token))
            .send({ email: 'new@example.com', first_name: 'New', last_name: 'Person' })
            .expect(201);
        expect(res.body.setup_token).toMatch(/^[A-Z0-9]{8}$/);
        expect(res.body.data.password).toBeUndefined();
        await h
            .api()
            .post('/admin/create_user')
            .set(h.bearer(admin.token))
            .send({ email: 'NEW@example.com', first_name: 'New', last_name: 'Person' })
            .expect(409);
    });

    test('role must be user or admin', async () => {
        await h
            .api()
            .post('/admin/create_user')
            .set(h.bearer(admin.token))
            .send({ email: 'r@example.com', first_name: 'R', last_name: 'S', role: 'superuser' })
            .expect(400);
    });

    test('resend_setup issues a new working code', async () => {
        const created = await h
            .api()
            .post('/admin/create_user')
            .set(h.bearer(admin.token))
            .send({ email: 'late@example.com', first_name: 'Late', last_name: 'Comer' })
            .expect(201);
        const resent = await h
            .api()
            .post(`/admin/resend_setup/${created.body.data._id}`)
            .set(h.bearer(admin.token))
            .expect(200);
        // old code no longer works, new one does
        await h
            .api()
            .post('/user/setup_password')
            .send({ email: 'late@example.com', setup_token: created.body.setup_token, password: 'password-123' })
            .expect(400);
        await h
            .api()
            .post('/user/setup_password')
            .send({ email: 'late@example.com', setup_token: resent.body.setup_token, password: 'password-123' })
            .expect(200);
    });

    test('lists users without secrets', async () => {
        await h.create_customer(admin);
        const res = await h.api().get('/admin/users').set(h.bearer(admin.token)).expect(200);
        expect(res.body.users.length).toBe(2);
        expect(res.body.users.every((u) => u.password === undefined)).toBe(true);
    });

    test('admins cannot disable or delete themselves', async () => {
        const me = (await h.api().get('/user/user_details').set(h.bearer(admin.token))).body.user_profile_details._id;
        await h.api().put(`/admin/disable_user/${me}`).set(h.bearer(admin.token)).expect(400);
        await h.api().delete(`/admin/delete_user/${me}`).set(h.bearer(admin.token)).expect(400);
    });

    test('invalid ids are a 400 and unknown ids a 404', async () => {
        await h.api().put('/admin/disable_user/not-an-id').set(h.bearer(admin.token)).expect(400);
        await h.api().put('/admin/disable_user/0123456789abcdef01234567').set(h.bearer(admin.token)).expect(404);
    });

    test('deleting a user removes all their transactions (was only one)', async () => {
        const u = await h.create_customer(admin, { deposit: 10 });
        for (let i = 0; i < 3; i++)
            await h
                .api()
                .post('/transaction/deposit')
                .set(h.bearer(u.token))
                .send({ pin: u.pin, amount: 1 })
                .expect(200);
        const res = await h.api().delete(`/admin/delete_user/${u.id}`).set(h.bearer(admin.token)).expect(200);
        expect(res.body.data.deleted_transactions).toBe(4);
        expect(await Transaction.countDocuments({ user_id: u.id })).toBe(0);
    });
});

describe('reversing a transfer', () => {
    test('moves the money back and keeps the history', async () => {
        const a = await h.create_customer(admin, { deposit: 100 });
        const b = await h.create_customer(admin);
        const sent = await transfer(a, b, 30).expect(200);
        const txid = sent.body.details.transaction.transaction_id;

        const res = await reverse(txid).expect(200);
        expect(res.body.data).toMatchObject({ sender_balance: 100, recipient_balance: 0 });
        expect(await h.balance_of(a.id)).toBe(100);
        expect(await h.balance_of(b.id)).toBe(0);

        // originals kept and flagged, plus two reversal entries
        const originals = await Transaction.find({ transaction_type: 'transfer' });
        expect(originals).toHaveLength(2);
        expect(originals.every((t) => t.is_reversed)).toBe(true);
        expect(await Transaction.countDocuments({ transaction_type: 'reversal' })).toBe(2);
    });

    test('works with the recipient-side transaction id too', async () => {
        const a = await h.create_customer(admin, { deposit: 100 });
        const b = await h.create_customer(admin);
        await transfer(a, b, 30).expect(200);
        const credit = await Transaction.findOne({ direction: 'credit', transaction_type: 'transfer' });
        await reverse(credit.transaction_id).expect(200);
        expect(await h.balance_of(a.id)).toBe(100);
    });

    test('cannot be reversed twice, even concurrently', async () => {
        const a = await h.create_customer(admin, { deposit: 100 });
        const b = await h.create_customer(admin);
        const sent = await transfer(a, b, 30).expect(200);
        const txid = sent.body.details.transaction.transaction_id;
        const results = await Promise.all([reverse(txid), reverse(txid), reverse(txid)]);
        expect(results.filter((r) => r.status === 200)).toHaveLength(1);
        expect(await h.balance_of(a.id)).toBe(100);
        expect(await h.balance_of(b.id)).toBe(0);
    });

    test('fails cleanly if the recipient already spent the money', async () => {
        const a = await h.create_customer(admin, { deposit: 100 });
        const b = await h.create_customer(admin);
        const sent = await transfer(a, b, 30).expect(200);
        await h
            .api()
            .post('/transaction/withdrawal')
            .set(h.bearer(b.token))
            .send({ pin: b.pin, amount: 25 })
            .expect(200);

        await reverse(sent.body.details.transaction.transaction_id).expect(400);
        expect(await h.balance_of(a.id)).toBe(70);
        expect(await h.balance_of(b.id)).toBe(5);
        // still reversible later once funds are back
        const original = await Transaction.findOne({ transaction_id: sent.body.details.transaction.transaction_id });
        expect(original.is_reversed).toBe(false);
    });

    test('only transfers can be reversed', async () => {
        const a = await h.create_customer(admin, { deposit: 100 });
        const dep = await Transaction.findOne({ transaction_type: 'deposit', user_id: a.id });
        await reverse(dep.transaction_id).expect(400);
    });

    test('unknown transaction id is a 404', async () => {
        await reverse('AAAAAAAAAAAA').expect(404);
    });
});
