import { getNextIntervals } from '../lib/sm2';

interface RatingButtonsProps {
  easeFactor: number;
  interval: number;
  onRate: (quality: 1 | 2 | 3 | 4) => void;
  disabled?: boolean;
}

function RatingButtons({ easeFactor, interval, onRate, disabled }: RatingButtonsProps) {
  const intervals = getNextIntervals(easeFactor, interval);

  const buttons = [
    {
      quality: 1 as const,
      label: 'Again',
      interval: intervals.again,
      color: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
    },
    {
      quality: 2 as const,
      label: 'Hard',
      interval: intervals.hard,
      color: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
    },
    {
      quality: 3 as const,
      label: 'Good',
      interval: intervals.good,
      color: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
    },
    {
      quality: 4 as const,
      label: 'Easy',
      interval: intervals.easy,
      color: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.quality}
          onClick={() => onRate(btn.quality)}
          disabled={disabled}
          className={`${btn.color} text-white rounded-xl py-3 px-2 flex flex-col items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="font-semibold text-sm">{btn.label}</span>
          <span className="text-xs opacity-80">{btn.interval}</span>
        </button>
      ))}
    </div>
  );
}

export default RatingButtons;
