const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');
const helpers = require('handlebars-helpers')(); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  helpers: helpers 
}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(cors());



app.get('/cadastrar', (req, res) => {
  res.render('cadastrar');
});


app.get('/consulta', async (req, res) => {
  const agendamentosSnapshot = await db.collection('agendamentos').get();
  const agendamentos = agendamentosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.render('consulta', { posts: agendamentos });
});


app.post('/cadastrar', async (req, res) => {
  const { nome, telefone, origem, data_contato, observacao } = req.body;
  await db.collection('agendamentos').add({
    nome, telefone, origem, data_contato, observacao
  });
  res.redirect('/consulta');
});


app.get('/editar/:id', async (req, res) => {
  const doc = await db.collection('agendamentos').doc(req.params.id).get();
  if (!doc.exists) {
    return res.redirect('/consulta');
  }
  res.render('editar', { id: doc.id, ...doc.data() });
});

app.post('/editar/:id', async (req, res) => {
  const { nome, telefone, origem, data_contato, observacao } = req.body;
  await db.collection('agendamentos').doc(req.params.id).update({
    nome, telefone, origem, data_contato, observacao
  });
  res.redirect('/consulta');
});


app.get('/excluir/:id', async (req, res) => {
  await db.collection('agendamentos').doc(req.params.id).delete();
  res.redirect('/consulta');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
