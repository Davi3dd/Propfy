const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { db } = require("./src/firebase");
console.log("Firebase conectado!");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "Servidor do Propfy funcionando!" });
});

const imoveisRoutes = require("./src/routes/imoveis");
const clientesRoutes = require("./src/routes/clientes");
const visitasRoutes = require("./src/routes/visitas");
const contratosRoutes = require("./src/routes/contratos");

app.use("/imoveis", imoveisRoutes);
app.use("/clientes", clientesRoutes);
app.use("/visitas", visitasRoutes);
app.use("/contratos", contratosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
