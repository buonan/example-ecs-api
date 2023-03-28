import App from './server';

const app = new App();
app.init().then(() => {
    app.listen();
})
