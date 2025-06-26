const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime({ region: process.env.AWS_REGION });

const JWT_SECRET = process.env.JWT_SECRET;
const USERS_TABLE = process.env.USERS_TABLE;
const FOCUS_SESSIONS_TABLE = process.env.FOCUS_SESSIONS_TABLE;
const FOCUS_SCORES_TABLE = process.env.FOCUS_SCORES_TABLE;

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

// Analyze screen content using AWS Bedrock
const analyzeScreenWithBedrock = async (screenDescription) => {
  try {
    const prompt = `You are an AI assistant that analyzes screen content to determine focus levels for productivity tracking.

Given the following screen description, analyze how focused the user is on productive work:

Screen Description: "${screenDescription}"

Please provide a focus score from 0-100 and a brief explanation:
- 90-100: Highly focused on productive work (coding, writing, research, learning)
- 70-89: Moderately focused on work-related tasks
- 50-69: Somewhat focused but with some distractions
- 30-49: Mostly distracted (social media, entertainment, shopping)
- 0-29: Completely unfocused (games, videos, non-work content)

Respond in this exact JSON format:
{
  "focusScore": 85,
  "explanation": "User is actively coding in VS Code with documentation open, showing high productivity focus.",
  "category": "Programming",
  "isProductive": true
}`;

    const params = {
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    };

    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract the JSON response from Claude's text response
    const analysisText = responseBody.content[0].text;
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        focusScore: Math.max(0, Math.min(100, analysis.focusScore || 50)),
        explanation: analysis.explanation || 'Focus analysis completed',
        category: analysis.category || 'General',
        isProductive: analysis.isProductive !== false
      };
    } else {
      // Fallback scoring based on keywords if JSON parsing fails
      return analyzeScreenFallback(screenDescription);
    }
  } catch (error) {
    console.error('Bedrock analysis error:', error);
    // Fallback to simple keyword-based analysis
    return analyzeScreenFallback(screenDescription);
  }
};

// Fallback analysis using keyword detection
const analyzeScreenFallback = (screenDescription) => {
  const description = screenDescription.toLowerCase();
  
  // Productive keywords
  const productiveKeywords = [
    'code', 'coding', 'programming', 'development', 'vscode', 'ide',
    'document', 'writing', 'editor', 'research', 'study', 'learning',
    'work', 'project', 'analysis', 'spreadsheet', 'presentation',
    'terminal', 'command', 'database', 'api', 'documentation'
  ];
  
  // Distraction keywords
  const distractionKeywords = [
    'youtube', 'netflix', 'facebook', 'instagram', 'twitter', 'tiktok',
    'games', 'gaming', 'entertainment', 'shopping', 'social media',
    'chat', 'messaging', 'news', 'reddit', 'memes'
  ];
  
  let focusScore = 50; // Default neutral score
  let category = 'General';
  let isProductive = true;
  
  // Check for productive activities
  const productiveMatches = productiveKeywords.filter(keyword => 
    description.includes(keyword)
  ).length;
  
  // Check for distracting activities
  const distractionMatches = distractionKeywords.filter(keyword => 
    description.includes(keyword)
  ).length;
  
  if (productiveMatches > distractionMatches) {
    focusScore = Math.min(90, 60 + (productiveMatches * 10));
    category = 'Productive Work';
    isProductive = true;
  } else if (distractionMatches > productiveMatches) {
    focusScore = Math.max(10, 40 - (distractionMatches * 10));
    category = 'Distraction';
    isProductive = false;
  }
  
  return {
    focusScore,
    explanation: `Analysis based on screen content keywords. Productive indicators: ${productiveMatches}, Distraction indicators: ${distractionMatches}`,
    category,
    isProductive
  };
};

// Analyze screen content and save focus score
exports.analyzeScreen = async (event) => {
  try {
    const user = await getUserFromToken(event);
    const { sessionId, screenDescription, timestamp } = JSON.parse(event.body);

    if (!sessionId || !screenDescription) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Session ID and screen description are required' })
      };
    }

    // Verify session exists and belongs to user
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

    // Analyze screen content
    const analysis = await analyzeScreenWithBedrock(screenDescription);

    // Save focus score
    const scoreId = uuidv4();
    const focusScore = {
      scoreId,
      sessionId,
      userId: user.userId,
      focusScore: analysis.focusScore,
      explanation: analysis.explanation,
      category: analysis.category,
      isProductive: analysis.isProductive,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: FOCUS_SCORES_TABLE,
      Item: focusScore
    }).promise();

    // Update session with new score statistics
    const newScoreCount = session.scoreCount + 1;
    const newTotalFocusScore = session.totalFocusScore + analysis.focusScore;
    const newAverageFocusScore = Math.round(newTotalFocusScore / newScoreCount);

    await dynamodb.update({
      TableName: FOCUS_SESSIONS_TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET scoreCount = :scoreCount, totalFocusScore = :totalScore, averageFocusScore = :avgScore',
      ExpressionAttributeValues: {
        ':scoreCount': newScoreCount,
        ':totalScore': newTotalFocusScore,
        ':avgScore': newAverageFocusScore
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        message: 'Screen analysis completed',
        analysis: {
          focusScore: analysis.focusScore,
          explanation: analysis.explanation,
          category: analysis.category,
          isProductive: analysis.isProductive
        },
        sessionStats: {
          averageFocusScore: newAverageFocusScore,
          totalScores: newScoreCount
        }
      })
    };
  } catch (error) {
    console.error('Screen analysis error:', error);
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