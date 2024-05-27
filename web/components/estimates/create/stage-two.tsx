import { FC } from "react";
import { Plus } from "lucide-react";
import { TEstimatePointsObject } from "@plane/types";
import { Button, Sortable } from "@plane/ui";
// components
import { EstimatePointItem } from "@/components/estimates";
// constants
import { EEstimateSystem, EEstimateUpdateStages, ESTIMATE_SYSTEMS } from "@/constants/estimates";

type TEstimateCreateStageTwo = {
  estimateSystem: EEstimateSystem;
  estimatePoints: TEstimatePointsObject[];
  handleEstimatePoints: (value: TEstimatePointsObject[]) => void;
};

export const EstimateCreateStageTwo: FC<TEstimateCreateStageTwo> = (props) => {
  const { estimateSystem, estimatePoints, handleEstimatePoints } = props;

  const currentEstimateSystem = ESTIMATE_SYSTEMS[estimateSystem] || undefined;
  const maxEstimatesCount = 11;

  const addNewEstimationPoint = () => {
    const currentEstimationPoints = estimatePoints;
    const newEstimationPoint: TEstimatePointsObject = {
      key: currentEstimationPoints.length + 1,
      value: "0",
    };
    handleEstimatePoints([...currentEstimationPoints, newEstimationPoint]);
  };

  const editEstimationPoint = (index: number, value: string) => {
    const newEstimationPoints = estimatePoints;
    newEstimationPoints[index].value = value;
    handleEstimatePoints(newEstimationPoints);
  };

  const deleteEstimationPoint = (index: number) => {
    let newEstimationPoints = estimatePoints;
    newEstimationPoints.splice(index, 1);
    newEstimationPoints = newEstimationPoints.map((item, index) => ({
      ...item,
      key: index + 1,
    }));
    handleEstimatePoints(newEstimationPoints);
  };

  const updatedSortedKeys = (updatedEstimatePoints: TEstimatePointsObject[]) => {
    const sortedEstimatePoints = updatedEstimatePoints.map((item, index) => ({
      ...item,
      key: index + 1,
    })) as TEstimatePointsObject[];
    return sortedEstimatePoints;
  };

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-custom-text-300">{estimateSystem}</div>
      <div className="space-y-3">
        <Sortable
          data={estimatePoints}
          render={(value: TEstimatePointsObject, index: number) => (
            <EstimatePointItem
              mode={EEstimateUpdateStages.CREATE}
              item={value}
              editItem={(value: string) => editEstimationPoint(index, value)}
              deleteItem={() => deleteEstimationPoint(index)}
            />
          )}
          onChange={(data: TEstimatePointsObject[]) => handleEstimatePoints(updatedSortedKeys(data))}
          keyExtractor={(item: TEstimatePointsObject) => item?.id?.toString() || item.value.toString()}
        />
        {estimatePoints && estimatePoints.length <= maxEstimatesCount && (
          <Button size="sm" prependIcon={<Plus />} onClick={addNewEstimationPoint}>
            Add {currentEstimateSystem?.name}
          </Button>
        )}
      </div>
    </div>
  );
};
