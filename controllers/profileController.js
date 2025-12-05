import User from '../models/User.js';

export const saveSignature = async (req, res) => {
  try {
    const { signatureImage } = req.body;

    if (!signatureImage) {
      return res.status(400).json({ message: 'Signature image is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can save signatures' });
    }

    user.signatureImage = signatureImage;
    user.profileCompleted = true;
    await user.save();

    res.json({
      message: 'Signature saved successfully. Profile completed!',
      profileCompleted: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('departmentId', 'name')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        matricNumber: user.matricNumber,
        role: user.role,
        departmentId: user.departmentId._id,
        departmentName: user.departmentId.name,
        profileCompleted: user.profileCompleted,
        hasSignature: !!user.signatureImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};