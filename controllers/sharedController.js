import Department from '../models/Department.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .select('name')
      .sort({ name: 1 });

    res.json(departments.map(dept => ({
      id: dept._id,
      name: dept.name
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};