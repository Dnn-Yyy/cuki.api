module.exports = {
  method: 'get',
  path: '/user/:id',
  handler: (req, res) => {
    res.json({ 
      status: 200,
      data: { id: req.params.id, name: 'John Doe' }
    });
  },
  metadata: {
    category: 'Users',
    description: 'Get user by ID',
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'User ID' }
    ],
    isApikey: true
  }
};