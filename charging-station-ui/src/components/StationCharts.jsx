import { useState, useEffect } from 'react';

/**
 * StationCharts Component
 * 
 * Displays real-time visualizations of charging station data
 * Updates every second to show live statistics with animated movements
 */
const StationCharts = ({ stations }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  
  const [chartData, setChartData] = useState({
    statusData: [],
    connectorData: [],
    total: 0,
    operational: 0,
    maintenance: 0,
  });

  // Update current time every second for live display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate chart data from stations (updates every second)
  useEffect(() => {
    const calculateChartData = () => {
      const statusCounts = {
        Operational: 0,
        Maintenance: 0,
      };

      const connectorCounts = {};

      stations.forEach((station) => {
        // Count by status
        const status = station.status || 'Unknown';
        if (statusCounts[status] !== undefined) {
          statusCounts[status]++;
        }

        // Count by connector type
        const connector = station.connectorType || 'Unknown';
        const connectorLabel = connector.replace(/_/g, ' ').replace(/TYPE 2/g, 'Type 2');
        connectorCounts[connectorLabel] = (connectorCounts[connectorLabel] || 0) + 1;
      });

      const total = stations.length;
      const operational = statusCounts.Operational || 0;
      const maintenance = statusCounts.Maintenance || 0;

      setChartData({
        statusData: [
          { name: 'Operational', value: operational, color: '#10b981' },
          { name: 'Maintenance', value: maintenance, color: '#ef4444' },
        ],
        connectorData: Object.entries(connectorCounts).map(([name, value]) => ({
          name,
          value,
          color: getColorForConnector(name),
        })),
        total,
        operational,
        maintenance,
      });

      // Add to time series data for line chart every second (keep last 60 points for more visible trends)
      setTimeSeriesData((prev) => {
        const now = new Date();
        const newDataPoint = {
          time: now,
          operational,
          maintenance,
          total,
        };
        
        // Always add a new data point every second to show continuous real-time trends
        // Even if values are the same, this shows stability over time
        const updatedData = [...prev, newDataPoint];
        return updatedData.slice(-60); // Keep last 60 data points (60 seconds of history)
      });
    };

    // Initial calculation
    calculateChartData();

    // Update every second to collect time series data
    const interval = setInterval(calculateChartData, 1000);
    return () => clearInterval(interval);
  }, [stations]);


  const getColorForConnector = (name) => {
    const colors = {
      'Type 2 (AC)': '#3b82f6',
      'CCS2 (DC Fast)': '#8b5cf6',
      'Bharat AC-001': '#f59e0b',
      'Bharat DC-001': '#ec4899',
    };
    return colors[name] || '#6b7280';
  };

  // Calculate percentage for pie chart
  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  // Calculate SVG arc path for pie chart slice
  const createArc = (percentage, offset = 0) => {
    const radius = 60;
    const centerX = 70;
    const centerY = 70;
    const startAngle = (offset / 100) * 360 - 90; // Start from top
    const endAngle = ((offset + percentage) / 100) * 360 - 90;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const operationalPercentage = getPercentage(chartData.operational, chartData.total);
  const maintenancePercentage = getPercentage(chartData.maintenance, chartData.total);
  
  const operationalPath = createArc(operationalPercentage, 0);
  const maintenancePath = createArc(maintenancePercentage, operationalPercentage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Status Distribution Pie Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
          {/* <div className="text-xs text-gray-500 font-mono">
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div> */}
        </div>
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Pie Chart */}
            <svg width="140" height="140" viewBox="0 0 140 140">
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="#e5e7eb"
              />
              {/* Operational slice */}
              {operationalPercentage > 0 && (
                <path
                  d={operationalPath}
                  fill="#10b981"
                  className="transition-all duration-1000 ease-out"
                />
              )}
              {/* Maintenance slice */}
              {maintenancePercentage > 0 && (
                <path
                  d={maintenancePath}
                  fill="#ef4444"
                  className="transition-all duration-1000 ease-out"
                />
              )}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{chartData.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>
        {/* Legend */}
        <div className="mt-6 space-y-2">
          {chartData.statusData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                <span className="text-xs text-gray-500 w-12 text-right">
                  ({getPercentage(item.value, chartData.total).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connector Type Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Connector Types</h3>
          <div className="text-xs text-gray-500">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
            Live
          </div>
        </div>
        {chartData.connectorData.length > 0 ? (
          <div className="space-y-4">
            {chartData.connectorData.map((item, index) => {
              const maxValue = Math.max(...chartData.connectorData.map((d) => d.value), 1);
              const percentage = (item.value / maxValue) * 100;
              
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">{item.name}</span>
                    <span className="text-gray-900 font-semibold">{item.value}</span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    >
                      {item.value > 0 && (
                        <span className="text-xs text-white font-medium">
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            No connector data available
          </div>
        )}
      </div>

      {/* Animated Time-Series Line Chart - Shows trends over time */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Station Status Over Time</h3>
          <div className="flex items-center gap-2">
            {/* <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> */}
            {/* <div className="text-xs text-gray-500 font-mono">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div> */}
          </div>
        </div>
        
        {timeSeriesData.length > 0 ? (
          <div className="relative">

            {/* Line Chart */}
            <div className="relative" style={{ height: '250px' }}>
              <svg width="100%" height="250" viewBox="0 0 1000 250" preserveAspectRatio="none" className="overflow-visible">
                {/* Grid lines */}
                <defs>
                  <linearGradient id="operationalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="maintenanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Y-axis labels */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = Math.max(...timeSeriesData.map(d => Math.max(d.operational, d.maintenance, d.total))) || 1;
                  const maxValue = Math.ceil(value * 1.2);
                  const yValue = maxValue - (maxValue / 4) * i;
                  const yPos = 30 + (220 / 4) * i;
                  return (
                    <text
                      key={`y-${i}`}
                      x="10"
                      y={yPos + 4}
                      className="text-xs fill-gray-400"
                      textAnchor="start"
                    >
                      {Math.round(yValue)}
                    </text>
                  );
                })}

                {/* X-axis time labels */}
                {timeSeriesData.length > 1 && (() => {
                  const width = 1000;
                  const height = 220;
                  const padding = 40;
                  const chartWidth = width - padding * 2;
                  const labelCount = Math.min(5, timeSeriesData.length);
                  const step = Math.floor((timeSeriesData.length - 1) / (labelCount - 1));
                  
                  return Array.from({ length: labelCount }).map((_, i) => {
                    const index = i === labelCount - 1 ? timeSeriesData.length - 1 : i * step;
                    const dataPoint = timeSeriesData[index];
                    const xPos = padding + (chartWidth / (timeSeriesData.length - 1)) * index;
                    const timeLabel = dataPoint.time.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: index === timeSeriesData.length - 1 ? '2-digit' : undefined,
                    });
                    
                    return (
                      <text
                        key={`x-${index}`}
                        x={xPos}
                        y={height - 5}
                        className="text-xs fill-gray-400"
                        textAnchor="middle"
                      >
                        {timeLabel}
                      </text>
                    );
                  });
                })()}

                {/* Chart Area */}
                {timeSeriesData.length > 1 && (() => {
                  const maxValue = Math.max(
                    ...timeSeriesData.map(d => Math.max(d.operational, d.maintenance, d.total)),
                    1
                  ) || 1;
                  const chartMax = Math.ceil(maxValue * 1.2);
                  const width = 1000; // SVG width
                  const height = 220;
                  const padding = 40;
                  const chartWidth = width - padding * 2;
                  const chartHeight = height - padding;
                  
                  const getX = (index) => padding + (chartWidth / (timeSeriesData.length - 1)) * index;
                  const getY = (value) => padding + chartHeight - (value / chartMax) * chartHeight;

                  // Operational line
                  const operationalPath = timeSeriesData
                    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.operational)}`)
                    .join(' ');

                  // Maintenance line
                  const maintenancePath = timeSeriesData
                    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.maintenance)}`)
                    .join(' ');

                  // Total line
                  const totalPath = timeSeriesData
                    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.total)}`)
                    .join(' ');

                  // Area under operational line
                  const operationalAreaPath = `${operationalPath} L ${getX(timeSeriesData.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

                  // Area under maintenance line
                  const maintenanceAreaPath = `${maintenancePath} L ${getX(timeSeriesData.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

                  return (
                    <>
                      {/* Operational area */}
                      <path
                        d={operationalAreaPath}
                        fill="url(#operationalGradient)"
                        className="transition-all duration-1000"
                      />
                      {/* Maintenance area */}
                      <path
                        d={maintenanceAreaPath}
                        fill="url(#maintenanceGradient)"
                        className="transition-all duration-1000"
                      />
                      {/* Operational line */}
                      <path
                        d={operationalPath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-1000"
                      >
                        <animate
                          attributeName="stroke-dasharray"
                          values="0,1000;1000,0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </path>
                      {/* Maintenance line */}
                      <path
                        d={maintenancePath}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-1000"
                      >
                        <animate
                          attributeName="stroke-dasharray"
                          values="0,1000;1000,0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </path>
                      {/* Total line */}
                      <path
                        d={totalPath}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      {/* Data point markers - show every 5th point for clarity */}
                      {timeSeriesData.map((d, i) => {
                        if (i % 5 === 0 || i === timeSeriesData.length - 1) {
                          const x = getX(i);
                          const yOp = getY(d.operational);
                          const yMaint = getY(d.maintenance);
                          const yTotal = getY(d.total);
                          return (
                            <g key={`markers-${i}`}>
                              <circle cx={x} cy={yOp} r="2" fill="#10b981" opacity="0.6" />
                              <circle cx={x} cy={yMaint} r="2" fill="#ef4444" opacity="0.6" />
                              {i === timeSeriesData.length - 1 && (
                                <circle cx={x} cy={yTotal} r="2" fill="#3b82f6" opacity="0.6" />
                              )}
                            </g>
                          );
                        }
                        return null;
                      })}
                      {/* Animated moving dots on lines - Current values with labels */}
                      {timeSeriesData.length > 0 && (() => {
                        const latest = timeSeriesData[timeSeriesData.length - 1];
                        const latestIndex = timeSeriesData.length - 1;
                        const x = getX(latestIndex);
                        
                        return (
                          <g>
                            {/* Pulsing dot on operational line */}
                            <circle
                              cx={x}
                              cy={getY(latest.operational)}
                              r="6"
                              fill="#10b981"
                              stroke="white"
                              strokeWidth="2"
                            >
                              <animate
                                attributeName="r"
                                values="4;8;4"
                                dur="1.5s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="opacity"
                                values="1;0.7;1"
                                dur="1.5s"
                                repeatCount="indefinite"
                              />
                            </circle>
                            {/* Value label for operational */}
                            <text
                              x={x + 12}
                              y={getY(latest.operational) - 5}
                              className="text-xs fill-green-600 font-semibold"
                            >
                              {latest.operational} Op
                            </text>
                            
                            {/* Pulsing dot on maintenance line */}
                            <circle
                              cx={x}
                              cy={getY(latest.maintenance)}
                              r="6"
                              fill="#ef4444"
                              stroke="white"
                              strokeWidth="2"
                            >
                              <animate
                                attributeName="r"
                                values="4;8;4"
                                dur="1.5s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="opacity"
                                values="1;0.7;1"
                                dur="1.5s"
                                repeatCount="indefinite"
                              />
                            </circle>
                            {/* Value label for maintenance */}
                            <text
                              x={x + 12}
                              y={getY(latest.maintenance) + 15}
                              className="text-xs fill-red-600 font-semibold"
                            >
                              {latest.maintenance} Maint
                            </text>
                          </g>
                        );
                      })()}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span className="text-sm text-gray-700">Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500"></div>
                <span className="text-sm text-gray-700">Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t-2"></div>
                <span className="text-sm text-gray-700">Total</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Collecting data... Chart will appear after a few seconds
          </div>
        )}
      </div>
    </div>
  );
};

export default StationCharts;

