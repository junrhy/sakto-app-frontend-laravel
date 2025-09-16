import React, { useMemo } from 'react';

type ToothStatus = 'healthy' | 'decayed' | 'filled' | 'missing';

type ToothData = {
  id: number;
  status: ToothStatus;
};

type DentalChartProps = {
  teethData: ToothData[];
  onToothClick: (toothId: number) => void;
};

const DentalChart: React.FC<DentalChartProps> = ({ teethData, onToothClick }) => {
  const getToothImage = (status: ToothStatus) => {
    switch (status) {
      case 'healthy': return '/images/healthy-tooth.svg';
      case 'decayed': return '/images/decayed-tooth.svg';
      case 'filled': return '/images/filled-tooth.svg';
      case 'missing': return '/images/missing-tooth.svg';
      default: return '/images/healthy-tooth.svg';
    }
  };

  const upperTeeth = useMemo(() => teethData.slice(0, 16), [teethData]);
  const lowerTeeth = useMemo(() => teethData.slice(16), [teethData]);

  const renderToothRow = useMemo(() => (teeth: ToothData[], isUpper: boolean) => (
    <div className="flex justify-center space-x-1">
      {teeth.map((tooth, index) => {
        const toothNumber = isUpper ? 16 - index : index + 17;
        return (
          <div
            key={tooth.id}
            className="relative w-8 h-12 cursor-pointer"
            onClick={() => onToothClick(tooth.id)}
          >
            <img
              src={getToothImage(tooth.status)}
              alt={`Tooth ${toothNumber}`}
              width={32}
              height={48}
              className="object-contain"
            />
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs">
              {toothNumber}
            </span>
          </div>
        );
      })}
    </div>
  ), [onToothClick]);

  const renderLegend = useMemo(() => () => (
    <div className="flex justify-center space-x-4 mt-4">
      {(['healthy', 'decayed', 'filled', 'missing'] as ToothStatus[]).map((status) => (
        <div key={status} className="flex items-center">
          <img
            src={getToothImage(status)}
            alt={status}
            width={24}
            height={24}
            className="object-contain"
          />
          <span className="ml-1 capitalize">{status}</span>
        </div>
      ))}
    </div>
  ), []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-semibold">
        <span>Upper Right</span>
        <span>Upper Left</span>
      </div>
      {renderToothRow(upperTeeth, true)}
      <div className="h-4" /> {/* Spacer */}
      {renderToothRow(lowerTeeth, false)}
      <div className="flex justify-between text-sm font-semibold">
        <span>Lower Right</span>
        <span>Lower Left</span>
      </div>
      {renderLegend()}
    </div>
  );
};

export default DentalChart;
