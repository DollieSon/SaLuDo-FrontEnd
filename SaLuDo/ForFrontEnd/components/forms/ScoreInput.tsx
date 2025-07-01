import React from 'react';

export interface ScoreInputProps {
  value: number;
  onChange: (score: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
  showLabels?: boolean;
}

const ScoreInput: React.FC<ScoreInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  label = 'Score',
  disabled = false,
  showLabels = true
}) => {
  const getScoreColor = (score: number) => {
    const percentage = ((score - min) / (max - min)) * 100;
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    const percentage = ((score - min) / (max - min)) * 100;
    if (percentage >= 75) return 'Expert';
    if (percentage >= 50) return 'Proficient';
    if (percentage >= 25) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className="space-y-3">
      {/* Label and Value */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">/ {max}</span>
          {showLabels && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getScoreColor(value)}`}>
              {getScoreLabel(value)}
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${getScoreColor(value)} 0%, ${getScoreColor(value)} ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Tick marks */}
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          {Array.from({ length: max - min + 1 }, (_, i) => (
            <span key={i}>{min + i}</span>
          ))}
        </div>
      </div>

      {/* Click buttons for precise control */}
      <div className="flex justify-center space-x-1">
        {Array.from({ length: max - min + 1 }, (_, i) => {
          const score = min + i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(score)}
              disabled={disabled}
              className={`w-8 h-8 text-xs font-medium rounded-full border transition-colors ${
                value === score
                  ? `text-white ${getScoreColor(score)} border-transparent`
                  : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreInput;
