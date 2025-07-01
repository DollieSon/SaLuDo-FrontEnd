import React, { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorMessage } from '../common';
import { CandidateData, CandidateStatus } from '../../types/CandidateApiTypes';

export interface DiversityMetrics {
  gender: {
    male: number;
    female: number;
    nonBinary: number;
    preferNotToSay: number;
    unknown: number;
  };
  ethnicity: {
    [key: string]: number;
  };
  age: {
    '18-25': number;
    '26-35': number;
    '36-45': number;
    '46-55': number;
    '56+': number;
    unknown: number;
  };
  location: {
    [key: string]: number;
  };
  education: {
    'High School': number;
    'Associates': number;
    'Bachelors': number;
    'Masters': number;
    'PhD': number;
    'Other': number;
  };
}

export interface HiringMetrics {
  timeToHire: {
    average: number;
    median: number;
    byStage: {
      [stage: string]: number;
    };
    trend: {
      period: string;
      value: number;
    }[];
  };
  costPerHire: {
    total: number;
    breakdown: {
      advertising: number;
      recruiterTime: number;
      interviewTime: number;
      background: number;
      other: number;
    };
    trend: {
      period: string;
      value: number;
    }[];
  };
  sourceEffectiveness: {
    source: string;
    applications: number;
    hires: number;
    conversionRate: number;
    costPerHire: number;
  }[];
}

export interface FunnelMetrics {
  stages: {
    stage: CandidateStatus;
    candidates: number;
    conversionRate: number;
    averageTime: number;
    dropOffRate: number;
  }[];
  totalApplications: number;
  totalHires: number;
  overallConversionRate: number;
  bottlenecks: {
    stage: CandidateStatus;
    impact: 'high' | 'medium' | 'low';
    reason: string;
  }[];
}

export interface AdvancedAnalyticsData {
  diversity: DiversityMetrics;
  hiring: HiringMetrics;
  funnel: FunnelMetrics;
  qualityOfHire: {
    performanceRating: number;
    retentionRate90Days: number;
    retentionRate1Year: number;
    managerSatisfaction: number;
    timeToProductivity: number;
  };
  recruitmentROI: {
    totalInvestment: number;
    valueGenerated: number;
    roi: number;
    paybackPeriod: number;
  };
}

interface AdvancedAnalyticsProps {
  dateRange?: { start: Date; end: Date };
  jobIds?: string[];
  departmentIds?: string[];
  onExportData?: (data: AdvancedAnalyticsData, format: 'csv' | 'excel' | 'pdf') => Promise<void>;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  dateRange,
  jobIds,
  departmentIds,
  onExportData
}) => {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'diversity' | 'hiring' | 'funnel' | 'quality' | 'roi'>('diversity');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, jobIds, departmentIds, selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: AdvancedAnalyticsData = {
        diversity: {
          gender: {
            male: 145,
            female: 132,
            nonBinary: 8,
            preferNotToSay: 23,
            unknown: 45
          },
          ethnicity: {
            'White': 156,
            'Black or African American': 67,
            'Hispanic or Latino': 89,
            'Asian': 98,
            'Native American': 12,
            'Mixed Race': 34,
            'Other': 45,
            'Prefer not to say': 52
          },
          age: {
            '18-25': 89,
            '26-35': 167,
            '36-45': 134,
            '46-55': 78,
            '56+': 23,
            unknown: 62
          },
          location: {
            'New York': 123,
            'California': 156,
            'Texas': 89,
            'Florida': 67,
            'Remote': 234,
            'Other': 184
          },
          education: {
            'High School': 34,
            'Associates': 67,
            'Bachelors': 234,
            'Masters': 167,
            'PhD': 45,
            'Other': 23
          }
        },
        hiring: {
          timeToHire: {
            average: 32,
            median: 28,
            byStage: {
              [CandidateStatus.APPLIED]: 2,
              [CandidateStatus.REFERENCE_CHECK]: 14,
              [CandidateStatus.OFFER]: 8,
              [CandidateStatus.HIRED]: 3
            },
            trend: [
              { period: 'Jan', value: 35 },
              { period: 'Feb', value: 33 },
              { period: 'Mar', value: 31 },
              { period: 'Apr', value: 29 },
              { period: 'May', value: 32 },
              { period: 'Jun', value: 28 }
            ]
          },
          costPerHire: {
            total: 4250,
            breakdown: {
              advertising: 1200,
              recruiterTime: 1800,
              interviewTime: 800,
              background: 300,
              other: 150
            },
            trend: [
              { period: 'Jan', value: 4800 },
              { period: 'Feb', value: 4600 },
              { period: 'Mar', value: 4400 },
              { period: 'Apr', value: 4200 },
              { period: 'May', value: 4250 },
              { period: 'Jun', value: 4100 }
            ]
          },
          sourceEffectiveness: [
            { source: 'LinkedIn', applications: 234, hires: 23, conversionRate: 9.8, costPerHire: 3200 },
            { source: 'Indeed', applications: 456, hires: 34, conversionRate: 7.5, costPerHire: 2800 },
            { source: 'Company Website', applications: 189, hires: 28, conversionRate: 14.8, costPerHire: 1500 },
            { source: 'Referrals', applications: 67, hires: 18, conversionRate: 26.9, costPerHire: 800 },
            { source: 'Recruiters', applications: 123, hires: 15, conversionRate: 12.2, costPerHire: 5200 }
          ]
        },
        funnel: {
          stages: [
            { stage: CandidateStatus.APPLIED, candidates: 1200, conversionRate: 100, averageTime: 0, dropOffRate: 0 },
            { stage: CandidateStatus.REFERENCE_CHECK, candidates: 480, conversionRate: 40, averageTime: 5, dropOffRate: 60 },
            { stage: CandidateStatus.OFFER, candidates: 144, conversionRate: 30, averageTime: 12, dropOffRate: 70 },
            { stage: CandidateStatus.HIRED, candidates: 86, conversionRate: 59.7, averageTime: 8, dropOffRate: 40.3 }
          ],
          totalApplications: 1200,
          totalHires: 86,
          overallConversionRate: 7.2,
          bottlenecks: [
            { stage: CandidateStatus.REFERENCE_CHECK, impact: 'high', reason: 'Long screening process' },
            { stage: CandidateStatus.OFFER, impact: 'medium', reason: 'Salary negotiations' }
          ]
        },
        qualityOfHire: {
          performanceRating: 4.2,
          retentionRate90Days: 92,
          retentionRate1Year: 78,
          managerSatisfaction: 4.1,
          timeToProductivity: 42
        },
        recruitmentROI: {
          totalInvestment: 125000,
          valueGenerated: 380000,
          roi: 204,
          paybackPeriod: 6.2
        }
      };

      setData(mockData);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: 'csv' | 'excel' | 'pdf') => {
    if (data) {
      try {
        await onExportData?.(data, format);
      } catch (err) {
        setError(`Failed to export data as ${format.toUpperCase()}`);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage message="No data available" />;

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <div>
          <h2>Advanced Analytics</h2>
          <p>Deep insights into your recruitment performance</p>
        </div>
        <div className="header-controls">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <div className="export-buttons">
            <button onClick={() => handleExportData('csv')} className="btn btn-secondary btn-sm">
              Export CSV
            </button>
            <button onClick={() => handleExportData('excel')} className="btn btn-secondary btn-sm">
              Export Excel
            </button>
            <button onClick={() => handleExportData('pdf')} className="btn btn-secondary btn-sm">
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div className="analytics-tabs">
        <button
          className={`tab ${activeView === 'diversity' ? 'active' : ''}`}
          onClick={() => setActiveView('diversity')}
        >
          Diversity & Inclusion
        </button>
        <button
          className={`tab ${activeView === 'hiring' ? 'active' : ''}`}
          onClick={() => setActiveView('hiring')}
        >
          Hiring Metrics
        </button>
        <button
          className={`tab ${activeView === 'funnel' ? 'active' : ''}`}
          onClick={() => setActiveView('funnel')}
        >
          Funnel Analysis
        </button>
        <button
          className={`tab ${activeView === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveView('quality')}
        >
          Quality of Hire
        </button>
        <button
          className={`tab ${activeView === 'roi' ? 'active' : ''}`}
          onClick={() => setActiveView('roi')}
        >
          ROI Analysis
        </button>
      </div>

      <div className="analytics-content">
        {activeView === 'diversity' && (
          <DiversityAnalytics diversity={data.diversity} />
        )}
        {activeView === 'hiring' && (
          <HiringAnalytics hiring={data.hiring} />
        )}
        {activeView === 'funnel' && (
          <FunnelAnalytics funnel={data.funnel} />
        )}
        {activeView === 'quality' && (
          <QualityAnalytics quality={data.qualityOfHire} />
        )}
        {activeView === 'roi' && (
          <ROIAnalytics roi={data.recruitmentROI} />
        )}
      </div>
    </div>
  );
};

interface DiversityAnalyticsProps {
  diversity: DiversityMetrics;
}

const DiversityAnalytics: React.FC<DiversityAnalyticsProps> = ({ diversity }) => {
  const renderPieChart = (data: { [key: string]: number }, title: string) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    
    return (
      <div className="diversity-chart">
        <h4>{title}</h4>
        <div className="pie-chart">
          {/* In a real app, use a charting library like Chart.js or Recharts */}
          <div className="chart-placeholder">
            <p>Pie Chart: {title}</p>
            <div className="chart-legend">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="legend-item">
                  <span className="legend-color" style={{backgroundColor: `hsl(${Object.keys(data).indexOf(key) * 360 / Object.keys(data).length}, 70%, 50%)`}}></span>
                  <span>{key}: {value} ({((value / total) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="diversity-analytics">
      <div className="diversity-overview">
        <div className="metric-card">
          <h3>Gender Diversity Index</h3>
          <div className="metric-value">74%</div>
          <div className="metric-change positive">+3.2% from last period</div>
        </div>
        <div className="metric-card">
          <h3>Ethnic Diversity Index</h3>
          <div className="metric-value">68%</div>
          <div className="metric-change positive">+1.8% from last period</div>
        </div>
        <div className="metric-card">
          <h3>Age Distribution Score</h3>
          <div className="metric-value">82%</div>
          <div className="metric-change neutral">+0.5% from last period</div>
        </div>
        <div className="metric-card">
          <h3>Geographic Diversity</h3>
          <div className="metric-value">91%</div>
          <div className="metric-change positive">+2.1% from last period</div>
        </div>
      </div>

      <div className="diversity-charts">
        {renderPieChart(diversity.gender, 'Gender Distribution')}
        {renderPieChart(diversity.ethnicity, 'Ethnic Distribution')}
        {renderPieChart(diversity.age, 'Age Distribution')}
        {renderPieChart(diversity.education, 'Education Level')}
      </div>

      <div className="diversity-insights">
        <h4>Key Insights</h4>
        <ul>
          <li>Gender representation is well-balanced with slight male skew (41% female, 45% male)</li>
          <li>Strong ethnic diversity with no single group exceeding 30%</li>
          <li>Age distribution favors mid-career professionals (26-45 age range)</li>
          <li>High percentage of candidates with bachelor's and master's degrees</li>
          <li>Remote work options attracting geographically diverse talent</li>
        </ul>
      </div>
    </div>
  );
};

interface HiringAnalyticsProps {
  hiring: HiringMetrics;
}

const HiringAnalytics: React.FC<HiringAnalyticsProps> = ({ hiring }) => {
  return (
    <div className="hiring-analytics">
      <div className="hiring-overview">
        <div className="metric-card">
          <h3>Average Time to Hire</h3>
          <div className="metric-value">{hiring.timeToHire.average} days</div>
          <div className="metric-subtext">Median: {hiring.timeToHire.median} days</div>
        </div>
        <div className="metric-card">
          <h3>Cost per Hire</h3>
          <div className="metric-value">${hiring.costPerHire.total.toLocaleString()}</div>
          <div className="metric-change negative">+5.2% from last period</div>
        </div>
        <div className="metric-card">
          <h3>Best Source</h3>
          <div className="metric-value">Referrals</div>
          <div className="metric-subtext">26.9% conversion rate</div>
        </div>
        <div className="metric-card">
          <h3>Volume Leader</h3>
          <div className="metric-value">Indeed</div>
          <div className="metric-subtext">456 applications</div>
        </div>
      </div>

      <div className="hiring-charts">
        <div className="chart-container">
          <h4>Time to Hire Trend</h4>
          <div className="line-chart">
            {/* In a real app, use a charting library */}
            <div className="chart-placeholder">
              <p>Line Chart: Time to Hire by Month</p>
              <div className="trend-data">
                {hiring.timeToHire.trend.map(point => (
                  <div key={point.period} className="trend-point">
                    {point.period}: {point.value} days
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h4>Cost Breakdown</h4>
          <div className="donut-chart">
            <div className="chart-placeholder">
              <p>Donut Chart: Cost per Hire Breakdown</p>
              <div className="breakdown-data">
                {Object.entries(hiring.costPerHire.breakdown).map(([category, cost]) => (
                  <div key={category} className="breakdown-item">
                    {category}: ${cost.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="source-effectiveness">
        <h4>Source Effectiveness</h4>
        <div className="source-table">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Applications</th>
                <th>Hires</th>
                <th>Conversion Rate</th>
                <th>Cost per Hire</th>
                <th>Quality Score</th>
              </tr>
            </thead>
            <tbody>
              {hiring.sourceEffectiveness.map((source, index) => (
                <tr key={source.source}>
                  <td>{source.source}</td>
                  <td>{source.applications}</td>
                  <td>{source.hires}</td>
                  <td>{source.conversionRate}%</td>
                  <td>${source.costPerHire.toLocaleString()}</td>
                  <td>
                    <div className="quality-score">
                      <div className={`score-bar score-${Math.floor((source.conversionRate / 30) * 5) + 1}`}>
                        {source.conversionRate > 20 ? 'Excellent' : 
                         source.conversionRate > 15 ? 'Good' : 
                         source.conversionRate > 10 ? 'Average' : 'Poor'}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface FunnelAnalyticsProps {
  funnel: FunnelMetrics;
}

const FunnelAnalytics: React.FC<FunnelAnalyticsProps> = ({ funnel }) => {
  return (
    <div className="funnel-analytics">
      <div className="funnel-overview">
        <div className="metric-card">
          <h3>Total Applications</h3>
          <div className="metric-value">{funnel.totalApplications.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <h3>Total Hires</h3>
          <div className="metric-value">{funnel.totalHires}</div>
        </div>
        <div className="metric-card">
          <h3>Overall Conversion</h3>
          <div className="metric-value">{funnel.overallConversionRate}%</div>
        </div>
        <div className="metric-card">
          <h3>Biggest Drop-off</h3>
          <div className="metric-value">Screening</div>
          <div className="metric-subtext">60% drop rate</div>
        </div>
      </div>

      <div className="funnel-visualization">
        <h4>Recruitment Funnel</h4>
        <div className="funnel-chart">
          {funnel.stages.map((stage, index) => (
            <div key={stage.stage} className="funnel-stage">
              <div className="stage-bar" style={{width: `${(stage.candidates / funnel.totalApplications) * 100}%`}}>
                <div className="stage-info">
                  <span className="stage-name">{stage.stage}</span>
                  <span className="stage-count">{stage.candidates}</span>
                  <span className="stage-rate">{stage.conversionRate}%</span>
                </div>
              </div>
              {index < funnel.stages.length - 1 && (
                <div className="stage-arrow">
                  <span className="drop-off">-{stage.dropOffRate}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="stage-details">
        <h4>Stage Performance</h4>
        <div className="stage-table">
          <table>
            <thead>
              <tr>
                <th>Stage</th>
                <th>Candidates</th>
                <th>Conversion Rate</th>
                <th>Average Time</th>
                <th>Drop-off Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {funnel.stages.map(stage => (
                <tr key={stage.stage}>
                  <td>{stage.stage}</td>
                  <td>{stage.candidates}</td>
                  <td>{stage.conversionRate}%</td>
                  <td>{stage.averageTime} days</td>
                  <td>{stage.dropOffRate}%</td>
                  <td>
                    <span className={`status-indicator ${
                      stage.dropOffRate > 70 ? 'critical' :
                      stage.dropOffRate > 50 ? 'warning' : 'healthy'
                    }`}>
                      {stage.dropOffRate > 70 ? 'Critical' :
                       stage.dropOffRate > 50 ? 'Needs Attention' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bottlenecks">
        <h4>Identified Bottlenecks</h4>
        <div className="bottleneck-list">
          {funnel.bottlenecks.map((bottleneck, index) => (
            <div key={index} className={`bottleneck-item ${bottleneck.impact}`}>
              <div className="bottleneck-stage">{bottleneck.stage}</div>
              <div className="bottleneck-impact">
                <span className={`impact-badge ${bottleneck.impact}`}>
                  {bottleneck.impact.toUpperCase()} IMPACT
                </span>
              </div>
              <div className="bottleneck-reason">{bottleneck.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface QualityAnalyticsProps {
  quality: AdvancedAnalyticsData['qualityOfHire'];
}

const QualityAnalytics: React.FC<QualityAnalyticsProps> = ({ quality }) => {
  return (
    <div className="quality-analytics">
      <div className="quality-overview">
        <div className="metric-card">
          <h3>Performance Rating</h3>
          <div className="metric-value">{quality.performanceRating}/5.0</div>
          <div className="metric-change positive">+0.3 from last period</div>
        </div>
        <div className="metric-card">
          <h3>90-Day Retention</h3>
          <div className="metric-value">{quality.retentionRate90Days}%</div>
          <div className="metric-change positive">+2.1% from last period</div>
        </div>
        <div className="metric-card">
          <h3>1-Year Retention</h3>
          <div className="metric-value">{quality.retentionRate1Year}%</div>
          <div className="metric-change neutral">-1.2% from last period</div>
        </div>
        <div className="metric-card">
          <h3>Time to Productivity</h3>
          <div className="metric-value">{quality.timeToProductivity} days</div>
          <div className="metric-change positive">-5 days from last period</div>
        </div>
      </div>

      <div className="quality-details">
        <div className="quality-score-card">
          <h4>Overall Quality Score</h4>
          <div className="quality-score-circle">
            <div className="score-display">87/100</div>
            <div className="score-label">Excellent</div>
          </div>
          <div className="score-breakdown">
            <div className="score-item">
              <span>Performance</span>
              <div className="score-bar">
                <div className="score-fill" style={{width: `${(quality.performanceRating / 5) * 100}%`}}></div>
              </div>
              <span>{quality.performanceRating}/5</span>
            </div>
            <div className="score-item">
              <span>Manager Satisfaction</span>
              <div className="score-bar">
                <div className="score-fill" style={{width: `${(quality.managerSatisfaction / 5) * 100}%`}}></div>
              </div>
              <span>{quality.managerSatisfaction}/5</span>
            </div>
            <div className="score-item">
              <span>90-Day Retention</span>
              <div className="score-bar">
                <div className="score-fill" style={{width: `${quality.retentionRate90Days}%`}}></div>
              </div>
              <span>{quality.retentionRate90Days}%</span>
            </div>
            <div className="score-item">
              <span>1-Year Retention</span>
              <div className="score-bar">
                <div className="score-fill" style={{width: `${quality.retentionRate1Year}%`}}></div>
              </div>
              <span>{quality.retentionRate1Year}%</span>
            </div>
          </div>
        </div>

        <div className="quality-insights">
          <h4>Quality Insights</h4>
          <ul>
            <li>New hires are performing above expectations with an average rating of {quality.performanceRating}/5</li>
            <li>Retention rates are strong in the first 90 days ({quality.retentionRate90Days}%)</li>
            <li>Time to productivity has improved by 12% compared to last quarter</li>
            <li>Manager satisfaction scores indicate good cultural fit</li>
            <li>Some decline in 1-year retention suggests need for better long-term engagement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

interface ROIAnalyticsProps {
  roi: AdvancedAnalyticsData['recruitmentROI'];
}

const ROIAnalytics: React.FC<ROIAnalyticsProps> = ({ roi }) => {
  return (
    <div className="roi-analytics">
      <div className="roi-overview">
        <div className="metric-card large">
          <h3>Recruitment ROI</h3>
          <div className="metric-value">{roi.roi}%</div>
          <div className="metric-subtext">Return on Investment</div>
        </div>
        <div className="metric-card">
          <h3>Total Investment</h3>
          <div className="metric-value">${roi.totalInvestment.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <h3>Value Generated</h3>
          <div className="metric-value">${roi.valueGenerated.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <h3>Payback Period</h3>
          <div className="metric-value">{roi.paybackPeriod} months</div>
        </div>
      </div>

      <div className="roi-details">
        <div className="roi-calculation">
          <h4>ROI Calculation</h4>
          <div className="calculation-formula">
            <div className="formula-line">
              <span>ROI = </span>
              <span className="formula-fraction">
                <span className="numerator">(Value Generated - Total Investment)</span>
                <span className="denominator">Total Investment</span>
              </span>
              <span> × 100</span>
            </div>
            <div className="formula-result">
              <span>ROI = </span>
              <span className="formula-fraction">
                <span className="numerator">(${roi.valueGenerated.toLocaleString()} - ${roi.totalInvestment.toLocaleString()})</span>
                <span className="denominator">${roi.totalInvestment.toLocaleString()}</span>
              </span>
              <span> × 100 = {roi.roi}%</span>
            </div>
          </div>
        </div>

        <div className="roi-benchmarks">
          <h4>Industry Benchmarks</h4>
          <div className="benchmark-comparison">
            <div className="benchmark-item">
              <span>Your ROI</span>
              <div className="benchmark-bar">
                <div className="benchmark-fill your-roi" style={{width: `${Math.min(roi.roi / 3, 100)}%`}}></div>
              </div>
              <span>{roi.roi}%</span>
            </div>
            <div className="benchmark-item">
              <span>Industry Average</span>
              <div className="benchmark-bar">
                <div className="benchmark-fill industry-avg" style={{width: '45%'}}></div>
              </div>
              <span>135%</span>
            </div>
            <div className="benchmark-item">
              <span>Top Performers</span>
              <div className="benchmark-bar">
                <div className="benchmark-fill top-performers" style={{width: '75%'}}></div>
              </div>
              <span>250%</span>
            </div>
          </div>
        </div>

        <div className="roi-insights">
          <h4>ROI Insights</h4>
          <ul>
            <li>Your recruitment ROI of {roi.roi}% exceeds industry average by {roi.roi - 135}%</li>
            <li>Payback period of {roi.paybackPeriod} months is competitive</li>
            <li>Strong value generation indicates effective hiring decisions</li>
            <li>Consider investing more in high-ROI channels like referrals</li>
            <li>Focus on reducing time-to-hire to further improve ROI</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
