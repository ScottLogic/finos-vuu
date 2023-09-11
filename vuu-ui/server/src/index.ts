import express from 'express';
import cors from 'cors';
import layoutManagementRoutes from './routes/layoutManagement';

const app = express();
const port = process.env.PORT? parseInt(process.env.PORT) : 3000;
const host = process.env.HOST || "";

// enable JSON parsing in request body
app.use(express.json()); 

// enable CORS
app.use(cors());

// mount the LayoutManagement API routes
app.use('/api/vui/layouts', layoutManagementRoutes); 

app.listen(port, host,() => {
  console.log(`Server running at http://127.0.0.1/:${port}`);
});