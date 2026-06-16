const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.get("/", async (req, res) => {
  const snapshot = await db.collection("imoveis").get();
  const imoveis = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.json(imoveis);
});

router.post("/", async (req, res) => {
  const { endereco, valor, tipo } = req.body;
  const doc = await db.collection("imoveis").add({ endereco, valor, tipo });
  res.json({ id: doc.id });
});

module.exports = router;
