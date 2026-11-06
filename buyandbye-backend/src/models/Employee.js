import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employee_id: { type: Number, unique: true },
    employee_name: { type: String, required: true },
    employee_salary: { type: Number, required: true },
    employee_worktype: { type: String, default: 'Staff' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;
