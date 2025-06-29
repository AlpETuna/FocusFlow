const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = process.env.USERS_TABLE;
const GROUP_MEMBERS_TABLE = process.env.GROUP_MEMBERS_TABLE;

// Helper function to get user by userId from headers
const getUserById = async (event) => {
  const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];
  
  if (!userId) {
    throw new Error('User ID is required in headers (x-user-id)');
  }

  const result = await dynamodb.get({
    TableName: USERS_TABLE,
    Key: { userId: userId }
  }).promise();

  if (!result.Item) {
    throw new Error('User not found');
  }

  return result.Item;
};

// Add friend (simplified - in real app, you'd have friend requests)
exports.addFriend = async (event) => {
  try {
    const user = await getUserById(event);
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Friend email is required' })
      };
    }

    // Find user by email
    const friendResult = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }).promise();

    if (friendResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const friend = friendResult.Items[0];

    if (friend.userId === user.userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Cannot add yourself as a friend' })
      };
    }

    // For this simplified implementation, we'll just return the friend info
    // In a real app, you'd create a friendship record
    const { password: _, ...friendWithoutPassword } = friend;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        message: 'Friend found! Join the same groups to compete together.',
        friend: friendWithoutPassword
      })
    };
  } catch (error) {
    console.error('Add friend error:', error);
    return {
      statusCode: error.message.includes('User ID is required') || error.message.includes('User not found') ? 401 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

// Get friends (users from same groups)
exports.getFriends = async (event) => {
  try {
    const user = await getUserById(event);

    // Get user's groups
    const userGroups = await dynamodb.query({
      TableName: GROUP_MEMBERS_TABLE,
      IndexName: 'UserGroups',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': user.userId
      }
    }).promise();

    if (userGroups.Items.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({
          friends: [],
          message: 'Join groups to connect with friends'
        })
      };
    }

    // Get all members from user's groups (excluding the user)
    const groupMemberPromises = userGroups.Items.map(membership =>
      dynamodb.query({
        TableName: GROUP_MEMBERS_TABLE,
        IndexName: 'GroupMembers',
        KeyConditionExpression: 'groupId = :groupId',
        FilterExpression: 'userId <> :userId',
        ExpressionAttributeValues: {
          ':groupId': membership.groupId,
          ':userId': user.userId
        }
      }).promise()
    );

    const groupMemberResults = await Promise.all(groupMemberPromises);
    const friendUserIds = new Set();
    const friendGroupMap = new Map(); // Track which groups friends are in
    
    // Collect unique friend user IDs and their groups
    groupMemberResults.forEach((result, groupIndex) => {
      const groupId = userGroups.Items[groupIndex].groupId;
      result.Items.forEach(member => {
        friendUserIds.add(member.userId);
        if (!friendGroupMap.has(member.userId)) {
          friendGroupMap.set(member.userId, []);
        }
        friendGroupMap.get(member.userId).push(groupId);
      });
    });

    if (friendUserIds.size === 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({
          friends: [],
          message: 'No friends found in your groups'
        })
      };
    }

    // Get friend user details
    const friendPromises = Array.from(friendUserIds).map(userId =>
      dynamodb.get({
        TableName: USERS_TABLE,
        Key: { userId },
        ProjectionExpression: 'userId, #name, totalFocusTime, #level, streakDays, lastActiveAt',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#level': 'level'
        }
      }).promise()
    );

    const friendResults = await Promise.all(friendPromises);
    const friends = friendResults
      .filter(result => result.Item)
      .map(result => ({
        ...result.Item,
        sharedGroups: friendGroupMap.get(result.Item.userId) || [],
        sharedGroupCount: (friendGroupMap.get(result.Item.userId) || []).length
      }))
      .sort((a, b) => b.totalFocusTime - a.totalFocusTime); // Sort by focus time

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        friends,
        totalFriends: friends.length
      })
    };
  } catch (error) {
    console.error('Get friends error:', error);
    return {
      statusCode: error.message.includes('User ID is required') || error.message.includes('User not found') ? 401 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};