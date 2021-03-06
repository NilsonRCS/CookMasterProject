const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');
const multer = require('multer');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'uploads')));

const { create } = require('../controllers/users');
const { userLogin } = require('../controllers/login');
const { 
  createRecepie,
  findRecepies,
  findRecepieById,
  editRecepie,
  deleteOneRecepie,
  addImage,
} = require('../controllers/recepie');
const { verifyName, verifyEmail, emailExists } = require('../middlewares/userValidation');
const { verifyEmailPass, emailValid, passwordValid } = require('../middlewares/loginValidations');
const { tokenValidation } = require('../middlewares/tokenValidations');
const verifyRecepie = require('../middlewares/recipieValidation');

// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador

const userValid = [verifyName, verifyEmail, emailExists];
const loginValid = [verifyEmailPass, emailValid, passwordValid];
const recepieValid = [
  verifyRecepie.verifyName,
  verifyRecepie.verifyIngredients,
  verifyRecepie.verifyPreparation,
];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, './src/uploads');
  },
  filename: (req, _file, callback) => {
    const { id } = req.params;
    callback(null, `${id}.jpeg`);
  },
});

const upload = multer({ storage });

app.post('/users', ...userValid, create);

app.post('/login', ...loginValid, userLogin);

app.post('/recipes', ...recepieValid, tokenValidation, createRecepie);

app.get('/recipes', findRecepies);

app.get('/recipes/:id', findRecepieById);

app.put('/recipes/:id', tokenValidation, editRecepie);

app.delete('/recipes/:id', tokenValidation, deleteOneRecepie);

app.put('/recipes/:id/image/', tokenValidation, upload.single('image'), addImage);

module.exports = app;
