const app = require('./app');
const port = process.env.PORT;
// listen on port 400
app.listen(port, () => {
    console.log('app is listening on', port);
});
