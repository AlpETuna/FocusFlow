const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = process.env.USERS_TABLE;
const FOCUS_SESSIONS_TABLE = process.env.FOCUS_SESSIONS_TABLE;

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

// Start a new focus session
exports.startSession = async (event) => {
  try {
    const user = await getUserById(event);
    const { groupId, goal } = JSON.parse(event.body || '{}');

    const sessionId = uuidv4();
    const session = {
      sessionId,
      userId: user.userId,
      groupId: groupId || null,
      goal: goal || 'Focus session',
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      totalFocusScore: 0,
      averageFocusScore: 0,
      scoreCount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: FOCUS_SESSIONS_TABLE,
      Item: session
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        message: 'Focus session started',
        session
      })
    };
  } catch (error) {
    console.error('Start session error:', error);
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

// Stop a focus session
exports.stopSession = async (event) => {
  try {
    const user = await getUserById(event);
    const { sessionId } = JSON.parse(event.body);

    if (!sessionId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Session ID is required' })
      };
    }

    // Get the session
    const sessionResult = await dynamodb.get({
      TableName: FOCUS_SESSIONS_TABLE,
      Key: { sessionId }
    }).promise();

    if (!sessionResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Session not found' })
      };
    }

    const session = sessionResult.Item;

    // Verify session belongs to user
    if (session.userId !== user.userId) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Calculate duration
    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds

    // Update session
    const updatedSession = await dynamodb.update({
      TableName: FOCUS_SESSIONS_TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET endTime = :endTime, duration = :duration, #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':endTime': endTime.toISOString(),
        ':duration': duration,
        ':status': 'completed'
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    // Get any focus adjustments from the session
    const focusAdjustment = updatedSession.Attributes.focusAdjustment || 0;
    
    // Update user's total focus time and level
    const focusTimeMinutes = Math.floor(duration / 60) + focusAdjustment;
    const effectiveFocusTime = Math.max(0, focusTimeMinutes); // Don't allow negative time
    const newTotalFocusTime = user.totalFocusTime + effectiveFocusTime;
    const newLevel = Math.floor(newTotalFocusTime / 60) + 1; // Level up every hour

    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId: user.userId },
      UpdateExpression: 'SET totalFocusTime = :totalFocusTime, #level = :level, lastActiveAt = :now',
      ExpressionAttributeNames: {
        '#level': 'level'
      },
      ExpressionAttributeValues: {
        ':totalFocusTime': newTotalFocusTime,
        ':level': newLevel,
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
        message: 'Focus session stopped',
        session: updatedSession.Attributes,
        focusTimeAdded: effectiveFocusTime,
        adjustment: focusAdjustment,
        newLevel
      })
    };
  } catch (error) {
    console.error('Stop session error:', error);
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

// Adjust session based on focus score
exports.adjustSession = async (event) => {
  try {
    const user = await getUserById(event);
    const { sessionId, adjustment, focusScore } = JSON.parse(event.body);

    if (!sessionId || adjustment === undefined || focusScore === undefined) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Session ID, adjustment, and focus score are required' })
      };
    }

    // Get the session
    const sessionResult = await dynamodb.get({
      TableName: FOCUS_SESSIONS_TABLE,
      Key: { sessionId }
    }).promise();

    if (!sessionResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Session not found' })
      };
    }

    const session = sessionResult.Item;

    // Verify session belongs to user and is active
    if (session.userId !== user.userId) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    if (session.status !== 'active') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Session is not active' })
      };
    }

    // Update session with adjustment
    const currentAdjustment = session.focusAdjustment || 0;
    const newAdjustment = currentAdjustment + adjustment;

    await dynamodb.update({
      TableName: FOCUS_SESSIONS_TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET focusAdjustment = :adjustment, lastFocusScore = :score, lastAdjustmentTime = :time',
      ExpressionAttributeValues: {
        ':adjustment': newAdjustment,
        ':score': focusScore,
        ':time': new Date().toISOString()
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        message: 'Session adjusted successfully',
        adjustment: adjustment,
        totalAdjustment: newAdjustment,
        focusScore: focusScore
      })
    };
  } catch (error) {
    console.error('Adjust session error:', error);
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

// Get user's focus sessions
exports.getSessions = async (event) => {
  try {
    const user = await getUserById(event);
    const { limit = 20, lastEvaluatedKey } = event.queryStringParameters || {};

    const params = {
      TableName: FOCUS_SESSIONS_TABLE,
      IndexName: 'UserSessions',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': user.userId
      },
      ScanIndexForward: false, // Sort by startTime descending
      Limit: parseInt(limit)
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastEvaluatedKey));
    }

    const result = await dynamodb.query(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        sessions: result.Items,
        lastEvaluatedKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
        count: result.Count
      })
    };
  } catch (error) {
    console.error('Get sessions error:', error);
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