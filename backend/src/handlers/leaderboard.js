const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const JWT_SECRET = process.env.JWT_SECRET;
const USERS_TABLE = process.env.USERS_TABLE;
const GROUP_MEMBERS_TABLE = process.env.GROUP_MEMBERS_TABLE;

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

// Get global leaderboard
exports.getLeaderboard = async (event) => {
  try {
    const user = await getUserFromToken(event);
    const { limit = 50, period = 'all' } = event.queryStringParameters || {};

    // For now, we'll get all users and sort by total focus time
    // In a real implementation, you might want to add time-based filtering
    const result = await dynamodb.scan({
      TableName: USERS_TABLE,
      ProjectionExpression: 'userId, #name, totalFocusTime, #level, streakDays, lastActiveAt',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#level': 'level'
      }
    }).promise();

    // Sort by total focus time (descending)
    const sortedUsers = result.Items
      .sort((a, b) => (b.totalFocusTime || 0) - (a.totalFocusTime || 0))
      .slice(0, parseInt(limit))
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        isCurrentUser: user.userId === user.userId
      }));

    // Find current user's rank if not in top results
    const currentUserRank = result.Items
      .sort((a, b) => (b.totalFocusTime || 0) - (a.totalFocusTime || 0))
      .findIndex(u => u.userId === user.userId) + 1;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        leaderboard: sortedUsers,
        currentUserRank,
        totalUsers: result.Items.length,
        period
      })
    };
  } catch (error) {
    console.error('Get leaderboard error:', error);
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

// Get friends leaderboard
exports.getFriendsLeaderboard = async (event) => {
  try {
    const user = await getUserFromToken(event);
    const { limit = 20 } = event.queryStringParameters || {};

    // For this implementation, we'll get users from the same groups as friends
    // In a real app, you'd have a separate friends table
    
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
          leaderboard: [],
          message: 'Join groups to see friends on the leaderboard'
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
    
    // Collect unique friend user IDs
    groupMemberResults.forEach(result => {
      result.Items.forEach(member => {
        friendUserIds.add(member.userId);
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
          leaderboard: [],
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
      .map(result => result.Item);

    // Add current user to the list for ranking
    const currentUserForRanking = {
      userId: user.userId,
      name: user.name,
      totalFocusTime: user.totalFocusTime,
      level: user.level,
      streakDays: user.streakDays,
      lastActiveAt: user.lastActiveAt
    };

    const allUsers = [...friends, currentUserForRanking];

    // Sort by total focus time (descending) and add ranks
    const sortedUsers = allUsers
      .sort((a, b) => (b.totalFocusTime || 0) - (a.totalFocusTime || 0))
      .slice(0, parseInt(limit))
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        isCurrentUser: user.userId === user.userId
      }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        leaderboard: sortedUsers,
        totalFriends: friends.length
      })
    };
  } catch (error) {
    console.error('Get friends leaderboard error:', error);
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