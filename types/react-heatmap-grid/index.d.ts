declare module 'react-heatmap-grid' {
  import * as React from 'react';

  export interface HeatMapProps {
    xLabels: string[];
    yLabels: string[];
    data: number[][];
    xLabelWidth?: number;
    yLabelWidth?: number;
    xLabelsLocation?: 'top' | 'bottom';
    backgroundColor?: string;
    height?: number;
    squares?: boolean;
    onClick?: (x: number, y: number) => void;
    cellStyle?: (
      background: string,
      value: number,
      min: number,
      max: number,
      data: number[][],
    ) => React.CSSProperties;
    cellRender?: (value: number) => React.ReactNode;
  }

  export default class HeatMap extends React.Component<HeatMapProps> {}
}
