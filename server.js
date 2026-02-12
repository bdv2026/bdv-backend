const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log("BDV Backend rodando na porta", PORT));