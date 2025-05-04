import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  allocatedBudget: { 
    type: Number, 
    required: true,
    min: [0, 'Allocated budget cannot be negative']
  },
  currentSpend: { 
    type: Number, 
    default: 0,
    min: [0, 'Current spend cannot be negative']
  },
  remainingBudget: { 
    type: Number, 
    required: true,
    min: [0, 'Remaining budget cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.allocatedBudget;
      },
      message: 'Remaining budget cannot exceed allocated budget'
    }
  },
  reason: { type: String, required: true },      
  infoFile: { type: String },                      
  status: { type: String, enum: ['approved', 'declined', 'pending'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Budget = mongoose.model('Budget', BudgetSchema);
export default Budget;
