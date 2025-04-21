export interface Settings {
    backgroundColors: string[];
    sizes: number[];
    horizontalOuterPadding: number;
    verticalOuterPadding: number;
    iconSpacing: number;
    verticalAlignment: "top" | "middle" | "bottom";
    useLargestWidth: boolean;
    showSizeLabels: boolean;
    sizeLabelsOccupySpace: boolean;
    sizeLabelColors: string[];
    sizeLabelFontSize: number;
    sizeLabelFontFamily: string;
}
