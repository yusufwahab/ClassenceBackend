import express from 'express';
import dotenv from 'dotenv'
import { connectDB } from './db.js';
dotenv.config();
import authRoutes from './routes/auth.js';



const PORT = process.env.PORT || 3000;

const app = express()

app.use(express.json());

app.use("/api/ecouser", authRoutes)

// app.get('/', (req, res) => {
//   res.send('Hello from Node API server cleaned!')
// });

connectDB();

 app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
// app.get('/api/products', async (req, res) => {
//   try {
//     const products = await Product.find({});
//     res.status(200).json(products);
//   } catch (error) {
//     // console.error("Error fetching products:", error);
//     res.status(500).json({message: error.message});
//   }
// });

// app.get('/api/products/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findById(id);
//     res.status(200).json(product);
//   } catch (error) {
//     // console.error("Error fetching product:", error);
//     res.status(500).json({message: error.message});
//   }
// });

// app.post("/api/products", async (req, res) => {
//   try {
//     const product = await Product.create(req.body);
//     res.status(200).json(product);
//   } catch (error) {
//     // console.error("Error creating product:", error);
//     res.status(500).json({message: error.message});
//   }
// });

// //update product by id
// app.put("/api/products/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findByIdAndUpdate(id, req.body);
//     if (!product) {
//       return res.status(404).json({ message: `Cannot find product with ID ${id}` });
//     }
//     const updatedProduct = await Product.findById(id);
//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     // console.error("Error updating product:", error);
//     res.status(500).json({message: error.message});
//   }
// });


// //delete product by id
// app.delete("/api/products/:id", async (req, res) => {
//   try { 
//     const { id } = req.params;
//     const product = await Product.findByIdAndDelete(id);  
//     if (!product) {
//       return res.status(404).json({ message: `Cannot find product with ID ${id}` });
//     }
//     res.status(200).json({message: "Product deleted successfully" });
//   } catch (error) {
//     // console.error("Error deleting product:", error);
//     res.status(500).json({message: error.message});
//   }
// });

