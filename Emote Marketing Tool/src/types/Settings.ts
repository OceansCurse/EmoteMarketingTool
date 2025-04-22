export interface Settings {
    fileName: String;
    fileType: "png" | "jpg" | "webp";
    backgroundColors: string[];
    sizes: number[];
    horizontalOuterPadding: number;
    verticalOuterPadding: number;
    iconSpacing: number;
    verticalAlignment: "top" | "middle" | "bottom";
    hideOriginal: boolean;
    useLargestWidth: boolean;
    showSizeLabels: boolean;
    sizeLabelsOccupySpace: boolean;
    sizeLabelColors: string[];
    sizeLabelFontSize: number;
    sizeLabelFontFamily: string;
}
