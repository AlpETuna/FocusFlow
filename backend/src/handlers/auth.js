const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

// Helper function to get user by userId
const getUserById = async (userId) => {
  const result = await dynamodb.get({
    TableName: USERS_TABLE,
    Key: { userId: userId }
  }).promise();

  if (!result.Item) {
    throw new Error('User not found');
  }

  return result.Item;
};

// Helper function to get user by email
const getUserByEmail = async (email) => {
  const result = await dynamodb.query({
    TableName: USERS_TABLE,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  }).promise();

  if (result.Items.length === 0) {
    throw new Error('User not found');
  }

  return result.Items[0];
};

// Register new user
exports.register = async (event) => {
  try {
    const { email, password, name } = JSON.parse(event.body);

    // Validate input
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Email, password, and name are required' })
      };
    }

    // Check if user already exists
    const existingUser = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }).promise();

    if (existingUser.Items.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'User already exists' })
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const user = {
      userId,
      email,
      password: hashedPassword,
      name,
      level: 1,
      totalFocusTime: 0,
      streakDays: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: user
    }).promise();

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        message: 'User registered successfully',
        user: userWithoutPassword
      })
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Login user
exports.login = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    // Find user by email
    const result = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }).promise();

    if (result.Items.length === 0) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    const user = result.Items[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Update last active time
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId: user.userId },
      UpdateExpression: 'SET lastActiveAt = :now',
      ExpressionAttributeValues: {
        ':now': new Date().toISOString()
      }
    }).promise();

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        message: 'Login successful',
        user: userWithoutPassword
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Get user profile (using userId in headers)
exports.getProfile = async (event) => {
  try {
    const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];
    
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'User ID is required in headers (x-user-id)' })
      };
    }

    const user = await getUserById(userId);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ user: userWithoutPassword })
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.message || 'User not found' })
    };
  }
};

// Update user profile (using userId in headers)
exports.updateProfile = async (event) => {
  try {
    const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];
    
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'User ID is required in headers (x-user-id)' })
      };
    }

    // Verify user exists
    const user = await getUserById(userId);
    const updates = JSON.parse(event.body);

    // Only allow certain fields to be updated
    const allowedFields = ['name', 'email'];
    const updateExpressions = [];
    const expressionAttributeValues = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateExpressions.push(`${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
      }
    }

    if (updateExpressions.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'No valid fields to update' })
      };
    }

    // If email is being updated, check if it already exists
    if (updates.email) {
      const existingUser = await dynamodb.query({
        TableName: USERS_TABLE,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': updates.email
        }
      }).promise();

      if (existingUser.Items.length > 0 && existingUser.Items[0].userId !== user.userId) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
          },
          body: JSON.stringify({ error: 'Email already exists' })
        };
      }
    }

    // Update user
    const result = await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId: user.userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }).promise();

    // Return updated user data without password
    const { password: _, ...userWithoutPassword } = result.Attributes;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      })
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      statusCode: error.message === 'User not found' ? 404 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};