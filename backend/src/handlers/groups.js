const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const JWT_SECRET = process.env.JWT_SECRET;
const USERS_TABLE = process.env.USERS_TABLE;
const GROUPS_TABLE = process.env.GROUPS_TABLE;
const GROUP_MEMBERS_TABLE = process.env.GROUP_MEMBERS_TABLE;
const FOCUS_SESSIONS_TABLE = process.env.FOCUS_SESSIONS_TABLE;

// Helper function to get user from token
const getUserFromToken = async (event) => {
  const token = event.headers.Authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token provided');
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  const result = await dynamodb.get({
    TableName: USERS_TABLE,
    Key: { userId: decoded.userId }
  }).promise();

  if (!result.Item) {
    throw new Error('User not found');
  }

  return result.Item;
};

// Create a new group
exports.createGroup = async (event) => {
  try {
    const user = await getUserFromToken(event);
    const { name, description, dailyGoalMinutes = 60 } = JSON.parse(event.body);

    if (!name) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Group name is required' })
      };
    }

    const groupId = uuidv4();
    const group = {
      groupId,
      name,
      description: description || '',
      createdBy: user.userId,
      dailyGoalMinutes,
      memberCount: 1,
      treeHealth: 100,
      level: 1,
      totalFocusTime: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    // Create group
    await dynamodb.put({
      TableName: GROUPS_TABLE,
      Item: group
    }).promise();

    // Add creator as first member
    const membershipId = uuidv4();
    const membership = {
      membershipId,
      groupId,
      userId: user.userId,
      role: 'admin',
      joinedAt: new Date().toISOString(),
      dailyStreak: 0,
      totalContribution: 0
    };

    await dynamodb.put({
      TableName: GROUP_MEMBERS_TABLE,
      Item: membership
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        message: 'Group created successfully',
        group,
        membership
      })
    };
  } catch (error) {
    console.error('Create group error:', error);
    return {
      statusCode: error.message.includes('token') || error.message.includes('User not found') ? 401 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

// Join a group
exports.joinGroup = async (event) => {
  try {
    const user = await getUserFromToken(event);
    const { groupId } = event.pathParameters;

    if (!groupId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Group ID is required' })
      };
    }

    // Check if group exists
    const groupResult = await dynamodb.get({
      TableName: GROUPS_TABLE,
      Key: { groupId }
    }).promise();

    if (!groupResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Group not found' })
      };
    }

    // Check if user is already a member
    const existingMembership = await dynamodb.query({
      TableName: GROUP_MEMBERS_TABLE,
      IndexName: 'GroupMembers',
      KeyConditionExpression: 'groupId = :groupId',
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':groupId': groupId,
        ':userId': user.userId
      }
    }).promise();

    if (existingMembership.Items.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Already a member of this group' })
      };
    }

    // Add user to group
    const membershipId = uuidv4();
    const membership = {
      membershipId,
      groupId,
      userId: user.userId,
      role: 'member',
      joinedAt: new Date().toISOString(),
      dailyStreak: 0,
      totalContribution: 0
    };

    await dynamodb.put({
      TableName: GROUP_MEMBERS_TABLE,
      Item: membership
    }).promise();

    // Update group member count
    await dynamodb.update({
      TableName: GROUPS_TABLE,
      Key: { groupId },
      UpdateExpression: 'SET memberCount = memberCount + :inc, lastActiveAt = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': new Date().toISOString()
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        message: 'Successfully joined group',
        membership
      })
    };
  } catch (error) {
    console.error('Join group error:', error);
    return {
      statusCode: error.message.includes('token') || error.message.includes('User not found') ? 401 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

// Get user's groups
exports.getGroups = async (event) => {
  try {
    const user = await getUserFromToken(event);

    // Get user's group memberships
    const memberships = await dynamodb.query({
      TableName: GROUP_MEMBERS_TABLE,
      IndexName: 'UserGroups',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': user.userId
      }
    }).promise();

    if (memberships.Items.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ groups: [] })
      };
    }

    // Get group details for each membership
    const groupPromises = memberships.Items.map(membership =>
      dynamodb.get({
        TableName: GROUPS_TABLE,
        Key: { groupId: membership.groupId }
      }).promise()
    );

    const groupResults = await Promise.all(groupPromises);
    const groups = groupResults
      .filter(result => result.Item)
      .map((result, index) => ({
        ...result.Item,
        membership: memberships.Items[index]
      }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ groups })
    };
  } catch (error) {
    console.error('Get groups error:', error);
    return {
      statusCode: error.message.includes('token') || error.message.includes('User not found') ? 401 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

// Get group details with members
exports.getGroupDetails = async (event) => {
  try {
    const user = await getUserFromToken(event);
    const { groupId } = event.pathParameters;

    if (!groupId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Group ID is required' })
      };
    }

    // Check if user is a member of the group
    const userMembership = await dynamodb.query({
      TableName: GROUP_MEMBERS_TABLE,
      IndexName: 'GroupMembers',
      KeyConditionExpression: 'groupId = :groupId',
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':groupId': groupId,
        ':userId': user.userId
      }
    }).promise();

    if (userMembership.Items.length === 0) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Not a member of this group' })
      };
    }

    // Get group details
    const groupResult = await dynamodb.get({
      TableName: GROUPS_TABLE,
      Key: { groupId }
    }).promise();

    if (!groupResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Group not found' })
      };
    }

    // Get all group members
    const memberships = await dynamodb.query({
      TableName: GROUP_MEMBERS_TABLE,
      IndexName: 'GroupMembers',
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: {
        ':groupId': groupId
      }
    }).promise();

    // Get user details for each member
    const memberPromises = memberships.Items.map(membership =>
      dynamodb.get({
        TableName: USERS_TABLE,
        Key: { userId: membership.userId }
      }).promise()
    );

    const memberResults = await Promise.all(memberPromises);
    const members = memberResults
      .filter(result => result.Item)
      .map((result, index) => {
        const { password, ...userWithoutPassword } = result.Item;
        return {
          ...userWithoutPassword,
          membership: memberships.Items[index]
        };
      });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        group: groupResult.Item,
        members,
        userMembership: userMembership.Items[0]
      })
    };
  } catch (error) {
    console.error('Get group details error:', error);
    return {
      statusCode: error.message.includes('token') || error.message.includes('User not found') ? 401 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};