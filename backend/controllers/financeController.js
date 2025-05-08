import Notification from '../models/Notification.js';

exports.resolveAnomaly = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNote } = req.body;

    const anomaly = await Anomaly.findById(id);
    if (!anomaly) {
      return res.status(404).json({
        success: false,
        message: 'Anomaly not found'
      });
    }

    // Update anomaly status and resolution details
    anomaly.status = 'resolved';
    anomaly.resolutionNote = resolutionNote;
    anomaly.resolvedAt = new Date();
    anomaly.resolvedBy = req.user._id;

    await anomaly.save();

    res.status(200).json({
      success: true,
      message: 'Anomaly resolved successfully',
      data: anomaly
    });
  } catch (error) {
    console.error('Error resolving anomaly:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve anomaly',
      error: error.message
    });
  }
};

exports.getForecast = async (req, res) => {
  try {
    const { timeRange, forecastType, modelType, confidenceInterval } = req.query;

    // Get historical data based on forecast type
    const historicalData = await getHistoricalData(forecastType);

    // Generate forecast using selected model
    const forecast = await generateForecast({
      data: historicalData,
      timeRange,
      modelType,
      confidenceInterval: Number(confidenceInterval)
    });

    // Calculate metrics
    const metrics = await calculateForecastMetrics(forecast);

    // Generate insights
    const insights = generateInsights(forecast, metrics);

    res.status(200).json({
      success: true,
      data: {
        forecast,
        metrics,
        insights
      }
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate forecast',
      error: error.message
    });
  }
};

// Helper function to get historical data
const getHistoricalData = async (forecastType) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12); // Get last 12 months of data

  let query = {};
  switch (forecastType) {
    case 'revenue':
      query = { type: 'income' };
      break;
    case 'expenses':
      query = { type: 'expense' };
      break;
    case 'profit':
      // Will calculate from income and expenses
      break;
    case 'transactions':
      query = { type: 'transaction' };
      break;
  }

  const data = await Transaction.find({
    ...query,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  return data;
};

// Helper function to generate forecast
const generateForecast = async ({ data, timeRange, modelType, confidenceInterval }) => {
  // Convert data to time series format
  const timeSeriesData = data.map(item => ({
    date: item.date,
    value: item.amount
  }));

  let forecast;
  switch (modelType) {
    case 'prophet':
      forecast = await generateProphetForecast(timeSeriesData, timeRange, confidenceInterval);
      break;
    case 'arima':
      forecast = await generateARIMAForecast(timeSeriesData, timeRange, confidenceInterval);
      break;
    case 'lstm':
      forecast = await generateLSTMForecast(timeSeriesData, timeRange, confidenceInterval);
      break;
    case 'xgboost':
      forecast = await generateXGBoostForecast(timeSeriesData, timeRange, confidenceInterval);
      break;
    default:
      forecast = await generateProphetForecast(timeSeriesData, timeRange, confidenceInterval);
  }

  return forecast;
};

// Helper function to calculate forecast metrics
const calculateForecastMetrics = async (forecast) => {
  // Calculate accuracy (MAPE)
  const mape = calculateMAPE(forecast);

  // Calculate trend direction and strength
  const trend = calculateTrend(forecast);

  // Calculate seasonality impact
  const seasonality = calculateSeasonality(forecast);

  return {
    accuracy: (100 - mape).toFixed(2),
    trendDirection: trend.direction,
    trendStrength: trend.strength,
    seasonalityImpact: seasonality
  };
};

// Helper function to generate insights
const generateInsights = (forecast, metrics) => {
  const insights = [];

  // Trend insights
  if (metrics.trendDirection === 'up' && metrics.trendStrength > 70) {
    insights.push('Strong upward trend detected with high confidence');
  } else if (metrics.trendDirection === 'down' && metrics.trendStrength > 70) {
    insights.push('Strong downward trend detected with high confidence');
  }

  // Seasonality insights
  if (metrics.seasonalityImpact > 30) {
    insights.push('Significant seasonal patterns detected in the data');
  }

  // Accuracy insights
  if (metrics.accuracy > 90) {
    insights.push('High forecast accuracy suggests reliable predictions');
  } else if (metrics.accuracy < 70) {
    insights.push('Lower forecast accuracy indicates higher uncertainty');
  }

  // Add specific insights based on forecast values
  const recentForecast = forecast.slice(-7);
  const avgChange = calculateAverageChange(recentForecast);
  
  if (Math.abs(avgChange) > 10) {
    insights.push(`Significant ${avgChange > 0 ? 'increase' : 'decrease'} expected in the next week`);
  }

  return insights;
};

// Notification controller functions
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
}; 