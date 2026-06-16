const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.get("/", async (req, res) => {
  const snapshot = await db.collection("clientes").get();
  const clientes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.json(clientes);
});

router.post("/", async (req, res) => {
  const { nome, telefone, interesse } = req.body;
  const doc = await db
    .collection("clientes")
    .add({ nome, telefone, interesse });
  res.json({ id: doc.id });
});

module.exports = router;
