import express from "express";
import cors from "cors";
import { connectToDB, getDB } from "./db.js";
import { ObjectId } from "mongodb";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// =======================
// ROOT
// =======================
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Lesson API running" });
});

// =======================
// GET /lessons
// =======================
app.get("/lessons", async (req, res) => {
  try {
    const lessons = await getDB().collection("Lessons").find().toArray();
    res.json(lessons);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

// =======================
// GET /search?q=term
// =======================
app.get("/search", async (req, res) => {
  const q = req.query.q;

  if (!q || q.trim() === "") {
    return res.json([]);
  }

  const regex = new RegExp(q, "i");

  try {
    const results = await getDB()
      .collection("Lessons")
      .find({
        $or: [
          { subject: regex },
          { location: regex }
        ]
      })
      .toArray();

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// =======================
// POST /order
// =======================
// =======================
// POST /order
// =======================
app.post("/order", async (req, res) => {
  const order = req.body;

  // Simple basic validation (optional but nice for coursework)
  if (!order || !order.name || !order.phone || !Array.isArray(order.items)) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  try {
    await getDB().collection("orders").insertOne({
      ...order,
      createdAt: new Date()
    });

    res.json({ message: "Order saved" });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});


// =======================
// PUT /lesson/:id
// =======================
app.put("/lesson/:id", async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;

  console.log("🔎 PUT /lesson/:id called with:");
  console.log("   id   =", id);
  console.log("   body =", updateData);

  // 1) Check ID format
  if (!ObjectId.isValid(id)) {
    console.log("❌ Invalid ObjectId format");
    return res.status(400).json({ error: "Invalid lesson ID format" });
  }

  // 2) Check body not empty
  if (!updateData || Object.keys(updateData).length === 0) {
    console.log("❌ Empty update body");
    return res.status(400).json({ error: "No update fields provided" });
  }

  try {
    const result = await getDB()
      .collection("Lessons") // capital L — matches MongoDB
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

    console.log("   MongoDB update result:", result);

    if (result.matchedCount === 0) {
      console.log("❌ No lesson found with that ID");
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.json({ message: "Lesson updated" });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ error: err.message || "Failed to update lesson" });
  }
});

// =======================
// START SERVER
// =======================
connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
