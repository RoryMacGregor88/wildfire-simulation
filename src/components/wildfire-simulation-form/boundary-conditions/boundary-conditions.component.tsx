import { FieldArray } from 'formik';
import { FormGroup, Label } from 'reactstrap';

import {
  TableHead,
  AddBoundaryConditionIcon,
  BoundaryConditionColumn,
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
    <FormGroup className='form-group'>
      <Label for='boundaryConditions' className='m-0'>
        Boundary Conditions (bound to 'Hours Of Projection')
      </Label>

      <div className='d-flex'>
        <table className='on-demand-table align-content-between'>
          <TableHead />

          <tbody>
            <FieldArray name='boundaryConditions'>
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
          values={values}
          maxTables={maxTables}
          addBoundaryConditionTableColumn={addBoundaryConditionTableColumn}
          setFieldValue={setFieldValue}
        />
      </div>
    </FormGroup>
  );
};

export default BoundaryConditions;
