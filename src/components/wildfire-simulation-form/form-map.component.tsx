import { Card } from 'reactstrap';
import { setSelectedFireBreak } from '~/store/app.slice';
import { MapCard } from '~/components';
import { useAppDispatch } from '~/hooks';

const FormMap = ({
  selectedFireBreak,
  getAllGeojson,
  validateArea,
  fireBreakSelectedOptions,
  ...formProps
}) => {
  const dispatch = useAppDispatch();

  const { values, setFieldValue } = formProps;
  const baseFireBreakId = `boundaryConditions.${selectedFireBreak?.position}.fireBreak`;
  return (
    <Card className='map-card mb-0 position-relative' style={{ height: 670 }}>
      <MapCard
        isDrawingPolygon={!selectedFireBreak}
        coordinates={getAllGeojson(values)}
        handleAreaValidation={validateArea}
        setCoordinates={async (geoJson, isAreaValid) => {
          /** called if map is used to draw polygon */

          if (selectedFireBreak) {
            /** currently selected fireBreak object (data for all fireBreak types) */
            const existingFireBreakData =
              values.boundaryConditions?.[selectedFireBreak?.position]
                ?.fireBreak;

            /** current value of selected BoundaryCondition's select
             *  dropdown ('vehicle', 'canadair', etc)
             */
            const selectedFireBreakType =
              fireBreakSelectedOptions[selectedFireBreak?.position];

            /** add id specific to A) which boundary condition, B) which fire
             * break type, and C) which position within feature array
             */
            const id = `${selectedFireBreakType}-${
              selectedFireBreak?.position
            }-${geoJson.length - 1}`;

            const newData = [
              ...(existingFireBreakData?.[selectedFireBreakType] ?? []),
              {
                ...geoJson[geoJson.length - 1],
                properties: {
                  id,
                  fireBreakType: selectedFireBreakType,
                },
              },
            ];

            const updatedFireBreakData = {
              ...existingFireBreakData,
              [selectedFireBreakType]: newData,
            };

            setFieldValue(baseFireBreakId, updatedFireBreakData);
          } else {
            await setFieldValue('mapSelection', geoJson);
            await setFieldValue('isMapAreaValid', isAreaValid);
            await setFieldValue('isValidWkt', true);
          }
        }}
        onSelect={(selected) => {
          const id = selected?.selectedFeature?.properties?.id;
          if (id) {
            const [type, position] = id.split('-');
            dispatch(
              setSelectedFireBreak({
                type,
                position: Number(position),
              })
            );
          }
        }}
        clearMap={(selectedFeatureData) => {
          const { properties, geometry } = selectedFeatureData.selectedFeature;

          if (geometry.type === 'Polygon') {
            setFieldValue('mapSelection', []);
            setFieldValue('isMapAreaValid', true);
            setFieldValue('isMapAreaValidWKT', true);
          } else {
            /**
             * id is specific to individual feature, so can be used for map and
             * also setCoords to determnine which to remove from form state
             */
            const deleteId = properties.id ?? null;

            const existingFireBreakData =
              values.boundaryConditions?.[selectedFireBreak?.position]
                ?.fireBreak;

            /**
             * current value of selected BoundaryCondition's select
             * ('vehicle', 'canadair', etc)
             */
            const selectedFireBreakType =
              fireBreakSelectedOptions[selectedFireBreak?.position];

            /** filter out feature that has been deleted on map */
            const filteredData = existingFireBreakData?.[
              selectedFireBreakType
            ]?.filter(({ properties }) => properties.id !== deleteId);

            const updatedFireBreakData = {
              ...existingFireBreakData,
              [selectedFireBreakType]: filteredData,
            };

            setFieldValue(baseFireBreakId, updatedFireBreakData);
          }
        }}
      />
    </Card>
  );
};

export default FormMap;
