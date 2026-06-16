const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.get("/", async (req, res) => {
  const snapshot = await db.collection("visitas").get();
  const visitas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.json(visitas);
});

router.post("/", async (req, res) => {
  const { clienteId, imovelId, data, status } = req.body;
  const doc = await db
    .collection("visitas")
    .add({ clienteId, imovelId, data, status });
  res.json({ id: doc.id });
});

module.exports = router;
