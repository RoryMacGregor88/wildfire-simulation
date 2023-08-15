import { FieldArray } from 'formik';
import { FormGroup, Label } from 'reactstrap';

import {
  AddBoundaryConditionIcon,
  BoundaryConditionColumn,
  TableHead,
} from '~/components';

const BoundaryConditions = (props) => {
  const {
    values,
    tableEntries,
    maxTables,
    setFieldValue,
    addBoundaryConditionTableColumn,
    ...restOfProps
  } = props;

  return (
    <FormGroup className="form-group">
      <Label className="m-0" for="boundaryConditions">
        Boundary Conditions (bound to 'Hours Of Projection')
      </Label>

      <div className="d-flex">
        <table className="on-demand-table align-content-between">
          <TableHead />

          <tbody style={{ maxWidth: '90rem' }}>
            <FieldArray name="boundaryConditions">
              {() =>
                tableEntries.map((position: number) => (
                  <BoundaryConditionColumn
                    position={position}
                    values={values}
                    {...restOfProps}
                  />
                ))
              }
            </FieldArray>
          </tbody>
        </table>

        <AddBoundaryConditionIcon
          addBoundaryConditionTableColumn={addBoundaryConditionTableColumn}
          maxTables={maxTables}
          setFieldValue={setFieldValue}
          values={values}
        />
      </div>
    </FormGroup>
  );
};

export default BoundaryConditions;
