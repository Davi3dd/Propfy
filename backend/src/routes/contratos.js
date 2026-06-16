const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.get("/", async (req, res) => {
  const snapshot = await db.collection("contratos").get();
  const contratos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.json(contratos);
});

router.post("/", async (req, res) => {
  const { clienteId, imovelId, valorAluguel, dataInicio, dataVencimento } =
    req.body;
  const doc = await db
    .collection("contratos")
    .add({ clienteId, imovelId, valorAluguel, dataInicio, dataVencimento });
  res.json({ id: doc.id });
});

module.exports = router;
