// Controller for Chat functionality
// Note: The Message model will be injected into the controller or retrieved from the req object

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    const Message = req.app.get('chatModel'); // Retrieve model from app settings

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId, otherId } = req.params;
    const Message = req.app.get('chatModel');

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
