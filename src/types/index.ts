
export interface DataReading {
  id: string;
  timestamp: string;
  location: string;
  operator: string;
  readings: {
    sampleNumber: string;
    dateTime: string;
    vehicleNumber: string;
    manifestId: string;
    producerName: string;
    sourceDistrict: string;
    wasteType: string;
    sampleWeight: number;
    vehicleType: string;
    binWeights: number[];
    binVolumes: number[];
    binAverages: {
      weight: string;
      volume: string;
      bulkDensity: string;
    };
    sortingWeights: number[];
    sortingTotal: number;
    wasteBreakdown: Array<{
      primary: string;
      secondary: string;
      emptyBin: number;
      weightWithWaste: number;
      binNumber?: number;
      netWeight: number;
      percentage: string;
    }>;
    totalWeight: number;
    samplingMoistureLoss: number;
    percentageLoss: string;
    remarks: string;
  };
}
