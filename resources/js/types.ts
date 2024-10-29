export type WidgetType = 'chart' | 'table' | 'metric';

export interface Widget {
    id: number;
    type: WidgetType;
    column: number;
} 