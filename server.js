require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// ===== BDV Básico =====
app.get("/health", (req, res) => {
  res.json({ ok: true, name: "BDV Backend", status: "online" });
});

app.get("/categories", (req, res) => {
  res.json([
    { id: "casa-inteligente", name: "Casa Inteligente" },
    { id: "beleza", name: "Beleza" },
    { id: "eletronicos", name: "Eletrônicos" },
  ]);
});

app.get("/products", (req, res) => {
  res.json([
    {
      id: "p1",
      name: "Lâmpada Smart Wi-Fi",
      price: 59.9,
      categoryId: "casa-inteligente",
      image: "https://via.placeholder.com/400x300",
    },
  ]);
});

app.get("/offers", (req, res) => {
  res.json([
    {
      id: "o1",
      productId: "p1",
      label: "Oferta do Dia",
      discountPercent: 15,
    },
  ]);
});

// ===== Mercado Livre OAuth =====
const ML_CLIENT_ID = process.env.ML_CLIENT_ID;
const ML_CLIENT_SECRET = process.env.ML_CLIENT_SECRET;
const ML_REDIRECT_URI = process.env.ML_REDIRECT_URI;

// Iniciar autenticação
app.get("/ml/auth", (req, res) => {
  const url = `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=${ML_CLIENT_ID}&redirect_uri=${ML_REDIRECT_URI}`;
  res.redirect(url);
});

// Callback do OAuth
app.get("/ml/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post(`https://api.mercadolibre.com/oauth/token`, null, {
      params: {
        grant_type: "authorization_code",
        client_id: ML_CLIENT_ID,
        client_secret: ML_CLIENT_SECRET,
        code,
        redirect_uri: ML_REDIRECT_URI
      }
    });
    res.json(response.data); // contém access_token e refresh_token
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ===== Usuários =====
app.get("/ml/users/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token OAuth necessário" });
  try {
    const response = await axios.get(`https://api.mercadolibre.com/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ===== Pedidos =====
app.get("/ml/orders", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const sellerId = req.query.sellerId;
  if (!token || !sellerId) return res.status(401).json({ error: "Token e sellerId necessários" });
  try {
    const response = await axios.get(`https://api.mercadolibre.com/orders/search?seller=${sellerId}&order.status=paid`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.get("/ml/orders/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Token OAuth necessário" });
  try {
    const response = await axios.get(`https://api.mercadolibre.com/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ===== Mensagens =====
app.get("/ml/messages/:orderId", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { orderId } = req.params;
  if (!token) return res.status(401).json({ error: "Token OAuth necessário" });
  try {
    const response = await axios.get(`https://api.mercadolibre.com/messages/packs/${orderId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.post("/ml/messages/:orderId", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { orderId } = req.params;
  const { subject, text } = req.body;
  if (!token) return res.status(401).json({ error: "Token OAuth necessário" });
  try {
    const response = await axios.post(`https://api.mercadolibre.com/messages/packs/${orderId}/messages`, {
      subject,
      text
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ===== Webhooks (Notificações) =====
app.post("/ml/webhooks", async (req, res) => {
  console.log("Recebeu notificação do Mercado Livre:", req.body);
  res.status(200).json({ ok: true });
});

// ===== Iniciar servidor =====
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log("BDV Backend rodando na porta", PORT));
