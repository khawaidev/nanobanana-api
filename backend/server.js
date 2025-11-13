
import cors from 'cors';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Set your frontend URL in production
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// In-memory storage for task results
// In production, you might want to use a database (Redis, MongoDB, etc.)
const taskResults = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Callback endpoint - receives POST requests from Banana API
app.post('/callback', (req, res) => {
  try {
    console.log('Received callback from Banana API:', JSON.stringify(req.body, null, 2));
    
    const { taskId, code, msg, data } = req.body;
    
    // Extract taskId from various possible locations
    const extractedTaskId = taskId || data?.taskId || req.body.data?.taskId;
    
    if (extractedTaskId) {
      // Store the entire Banana API response
      taskResults.set(extractedTaskId, {
        taskId: extractedTaskId,
        code: code || req.body.code,
        msg: msg || req.body.msg,
        data: data || req.body.data, // Store the full data from Banana API
        receivedAt: new Date().toISOString(),
        fullResponse: req.body // Store full response for debugging
      });
      
      console.log(`Stored result for taskId: ${extractedTaskId}`);
      console.log(`Data structure:`, JSON.stringify(data || req.body.data, null, 2));
    } else {
      console.warn('No taskId found in callback:', req.body);
    }
    
    // Respond to Banana API (they might expect a 200 response)
    res.status(200).json({ 
      success: true, 
      message: 'Callback received' 
    });
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get result endpoint - frontend polls this to get results
app.get('/result/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  const result = taskResults.get(taskId);
  
  if (!result) {
    return res.status(404).json({ 
      code: 404,
      msg: 'Task not found',
      data: null
    });
  }
  
  res.json({
    code: 200,
    msg: 'success',
    data: result
  });
});

// Get all results (for debugging)
app.get('/results', (req, res) => {
  const results = Array.from(taskResults.entries()).map(([taskId, data]) => ({
    taskId,
    ...data
  }));
  
  res.json({
    code: 200,
    msg: 'success',
    data: results
  });
});

// Clean up old results (older than 1 hour) - run periodically
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  let cleaned = 0;
  
  for (const [taskId, result] of taskResults.entries()) {
    const receivedAt = new Date(result.receivedAt).getTime();
    if (receivedAt < oneHourAgo) {
      taskResults.delete(taskId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} old results`);
  }
}, 60 * 60 * 1000); // Run every hour

app.listen(PORT, () => {
  console.log(`Banana API Callback Server running on port ${PORT}`);
  console.log(`Callback URL: https://nanobanana-api.onrender.com/callback`);
  console.log(`Result endpoint: https://nanobanana-api.onrender.com/result/:taskId`);
});

