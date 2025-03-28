const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mcp-delivery')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['mcp', 'partner'], required: true },
  wallet: { type: Number, default: 100 }, // Default 100 for MCP
  transactions: [{
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }]
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'accepted', 'rejected', 'completed'], 
    default: 'pending' 
  },
  mcp: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  assignedAt: { type: Date },
  completedAt: { type: Date },
  rejectedAt: { type: Date },
  refunded: { type: Boolean, default: false }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Authentication required');
    
    const decoded = jwt.verify(token, '065c201bb10d4fc4af9f4dd27ba74d3aa5c21c8c9522d90af097962c0b74a2e49e35c032cd3b0333a4bf248cf367b29f325c87ed6ecf17d9311510c4f60acf54');
    req.user = await User.findById(decoded.id);
    if (!req.user) throw new Error('User not found');
    
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// Routes
app.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign({ id: user._id }, '065c201bb10d4fc4af9f4dd27ba74d3aa5c21c8c9522d90af097962c0b74a2e49e35c032cd3b0333a4bf248cf367b29f325c87ed6ecf17d9311510c4f60acf54');
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id }, '065c201bb10d4fc4af9f4dd27ba74d3aa5c21c8c9522d90af097962c0b74a2e49e35c032cd3b0333a4bf248cf367b29f325c87ed6ecf17d9311510c4f60acf54');
    res.json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// MCP Routes
// In server.js (orders fetch endpoint)
app.get('/mcp/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ mcp: req.user._id })
      .populate('partner', 'name email'); // Add this
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all unassigned orders (for MCP)
app.get('/mcp/unassigned-orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'mcp') throw new Error('Unauthorized');
    
    const orders = await Order.find({
      mcp: req.user._id,
      status: 'pending'
    });
    
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign order to partner
// Assign order to partner
app.post('/orders/:id/assign', auth, async (req, res) => {
  try {
    if (req.user.role !== 'mcp') throw new Error('Only MCP can assign orders');
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        partner: req.body.partnerId,
        status: 'assigned',
        assignedAt: new Date()
      },
      { new: true }
    ).populate('partner', 'name email');
    
    if (!order) throw new Error('Order not found');
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// // Partner updates order status
// app.post('/orders/:id/status', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'partner') throw new Error('Only partners can update status');
    
//     const validStatuses = ['accepted', 'rejected', 'completed'];
//     if (!validStatuses.includes(req.body.status)) {
//       throw new Error('Invalid status');
//     }

//     const order = await Order.findOne({ _id: req.params.id, partner: req.user._id });
//     if (!order) throw new Error('Order not found or not assigned to you');

//     // Start a transaction to ensure data consistency
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // Update order status
//       order.status = req.body.status;
      
//       if (req.body.status === 'completed') {
//         order.completedAt = new Date();
//         // Credit partner's wallet
//         await User.findByIdAndUpdate(
//           req.user._id,
//           {
//             $inc: { wallet: order.amount },
//             $push: {
//               transactions: {
//                 amount: order.amount,
//                 type: 'credit',
//                 description: `Order delivery: ${order.description}`,
//                 date: new Date()
//               }
//             }
//           },
//           { session }
//         );
//       } 
//       else if (req.body.status === 'rejected') {
//         // Refund MCP's wallet
//         await User.findByIdAndUpdate(
//           order.mcp,
//           {
//             $inc: { wallet: order.amount },
//             $push: {
//               transactions: {
//                 amount: order.amount,
//                 type: 'credit',
//                 description: `Order refund: ${order.description}`,
//                 date: new Date()
//               }
//             }
//           },
//           { session }
//         );
//       }

//       await order.save({ session });
//       await session.commitTransaction();
//       res.json(order);
//     } catch (err) {
//       await session.abortTransaction();
//       throw err;
//     } finally {
//       session.endSession();
//     }
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

app.post('/orders/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'partner') throw new Error('Only partners can update status');
    
    const validStatuses = ['accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(req.body.status)) {
      throw new Error('Invalid status');
    }

    const order = await Order.findOne({ _id: req.params.id, partner: req.user._id });
    if (!order) throw new Error('Order not found or not assigned to you');

    // Update order status
    order.status = req.body.status;
    
    if (req.body.status === 'completed') {
      order.completedAt = new Date();
      // Credit partner's wallet
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $inc: { wallet: order.amount },
          $push: {
            transactions: {
              amount: order.amount,
              type: 'credit',
              description: `Order delivery: ${order.description}`,
              date: new Date()
            }
          }
        }
      );
    } 
    else if (req.body.status === 'rejected') {
      order.rejectedAt = new Date();
      // Refund MCP's wallet
      await User.findByIdAndUpdate(
        order.mcp,
        {
          $inc: { wallet: order.amount },
          $push: {
            transactions: {
              amount: order.amount,
              type: 'credit',
              description: `Order refund: ${order.description}`,
              date: new Date()
            }
          }
        }
      );
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// In server.js - Update the order creation endpoint
app.post('/mcp/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'mcp') throw new Error('Unauthorized');
    if (req.user.wallet < req.body.amount) throw new Error('Insufficient funds');

    // Update user wallet
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { wallet: -req.body.amount },
        $push: {
          transactions: {
            amount: -req.body.amount,
            type: 'debit',
            description: `Order: ${req.body.description}`,
            date: new Date()
          }
        }
      },
      { new: true }
    );

    const order = new Order({
      ...req.body,
      mcp: req.user._id
    });
    await order.save();

    res.status(201).json({ order, user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// In server.js - Update the partners endpoint
app.get('/mcp/partners', auth, async (req, res) => {
  try {
    if (req.user.role !== 'mcp') {
      return res.status(403).json({ error: 'Only MCP users can view partners' });
    }
    
    const partners = await User.find({ role: 'partner' })
      .select('-password -transactions');
    
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In server.js - Update the order assignment endpoint
// In server.js (order assignment endpoint)
app.post('/orders/:id/assign', auth, async (req, res) => {
  try {
    if (req.user.role !== 'mcp') throw new Error('Only MCP can assign orders');
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        partner: req.body.partnerId,
        status: 'assigned'
      },
      { new: true }
    ).populate('partner', 'name email'); // Add this populate
    
    if (!order) throw new Error('Order not found');
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Partner Routes
app.get('/partner/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'partner') throw new Error('Unauthorized');
    const orders = await Order.find({ partner: req.user._id });
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/partner/orders/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'partner') throw new Error('Unauthorized');
    
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, partner: req.user._id },
      { status: req.body.status },
      { new: true }
    );
    
    if (req.body.status === 'completed') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { wallet: order.amount },
        $push: {
          transactions: {
            amount: order.amount,
            type: 'credit',
            description: `Delivery: ${order.description}`
          }
        }
      });
    }
    
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Common Routes
app.get('/me', auth, (req, res) => {
  res.json(req.user);
});

app.get('/wallet', auth, async (req, res) => {
  try {
    res.json({
      balance: req.user.wallet,
      transactions: req.user.transactions
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/debug/auth', auth, (req, res) => {
  res.json({
    message: 'Auth successful',
    user: {
      id: req.user._id,
      role: req.user.role,
      name: req.user.name
    }
  });
});