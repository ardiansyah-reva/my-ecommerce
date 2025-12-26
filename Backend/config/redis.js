// Backend/config/redis.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Middleware
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.originalJson = res.json;
    res.json = (data) => {
      redis.setex(key, duration, JSON.stringify(data));
      res.originalJson(data);
    };
    
    next();
  };
};

// Usage
router.get('/products', cacheMiddleware(300), productController.getAllProducts);