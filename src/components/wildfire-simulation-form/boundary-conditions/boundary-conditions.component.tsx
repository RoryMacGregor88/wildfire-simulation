import { FieldArray } from 'formik';
import { FormGroup, Label, Input } from 'reactstrap';
import { FIRE_BREAK_OPTIONS } from '~/constants';
import { setSelectedFireBreak } from '~/store/app.slice';
import { getWKTfromFeature, Error } from '~/utils/utils';
import { useAppDispatch } from '~/hooks';
import { TableHead, AddBoundaryConditionIcon } from './composite-components';

const BoundaryConditionColumn = ({
  position,
  selectedFireBreak,
  removeBoundaryConditionTableColumn,
  fireBreakSelectedOptions,
  handleFireBreakEditClick,
  ...formProps
}) => {
  const dispatch = useAppDispatch();

  const { errors, values, touched, handleChange, handleBlur } = formProps;

  const isFireBreakSelected = position === selectedFireBreak?.position;

  const baseFormId = `boundaryConditions.${position}`,
    baseValues = values.boundaryConditions[position] ?? {},
    baseErrors = errors.boundaryConditions?.[position] ?? {},
    baseTouched = touched.boundaryConditions?.[position] ?? {};

  const handleFireBreakChange = ({ target: { value } }) =>
    dispatch(
      setSelectedFireBreak({
        position,
        type: value,
      })
    );

  return (
    <tr key={position}>
      <td>
        <i
          className='bx bx-trash font-size-24 p-0 w-auto'
          onClick={() => removeBoundaryConditionTableColumn(position)}
          style={{
            cursor: 'pointer',
            visibility: position === 0 ? 'hidden' : 'visible',
          }}
        />
      </td>

      <td>
        <Input
          name={`${baseFormId}.timeOffset`}
          id={`${baseFormId}.timeOffset`}
          value={baseValues.timeOffset}
          disabled={position === 0}
          placeholder='[Type value]'
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {!!baseTouched.timeOffset ? (
          <Error message={baseErrors.timeOffset} />
        ) : null}
      </td>

      <td>
        <Input
          name={`${baseFormId}.windDirection`}
          id={`${baseFormId}.windDirection`}
          value={baseValues.windDirection}
          placeholder='[Type value]'
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {!!baseTouched.windDirection ? (
          <Error message={baseErrors.windDirection} />
        ) : null}
      </td>

      <td>
        <Input
          name={`${baseFormId}.windSpeed`}
          id={`${baseFormId}.windSpeed`}
          value={baseValues.windSpeed}
          placeholder='[Type value]'
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {!!baseTouched.windSpeed ? (
          <Error message={baseErrors.windSpeed} />
        ) : null}
      </td>

      <td>
        <Input
          name={`${baseFormId}.fuelMoistureContent`}
          id={`${baseFormId}.fuelMoistureContent`}
          value={baseValues.fuelMoistureContent}
          placeholder='[Type value]'
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {!!baseTouched.fuelMoistureContent ? (
          <Error message={baseErrors.fuelMoistureContent} />
        ) : null}
      </td>

      <td>
        <div
          className='d-flex align-items-center gap-2 my-1'
          style={{ width: '100%' }}
        >
          <Input
            type='select'
            className='btn-sm sort-select-input'
            value={fireBreakSelectedOptions[position]}
            onChange={handleFireBreakChange}
            onBlur={handleBlur}
          >
            {FIRE_BREAK_OPTIONS.map(({ label, value }) => (
              <option key={label} value={value}>
                {label}
              </option>
            ))}
          </Input>

          <button
            key={position}
            color='primary'
            onClick={(e) => handleFireBreakEditClick(e, position)}
            className={`btn btn-primary ${
              !isFireBreakSelected ? 'fire-break-selected' : ''
            }`}
          >
            {isFireBreakSelected ? 'Finish' : 'Edit'}
          </button>
        </div>
      </td>

      <td>
        <Input
          name={`${baseFormId}.fireBreak`}
          id={`${baseFormId}.fireBreak`}
          readOnly
          type='textarea'
          value={getWKTfromFeature(
            baseValues.fireBreak?.[fireBreakSelectedOptions[position]] ?? ''
          )}
        />
      </td>
    </tr>
  );
};

const BoundaryConditions = (props) => {
  const {
    tableEntries,
    maxTables,
    setFieldValue,
    addBoundaryConditionTableColumn,
    ...restOfProps
  } = props;

  return (
    <FormGroup className='form-group'>
      <Label for='boundaryConditions' className='m-0'>
        Boundary Conditions (paired with 'Hours Of Projection')
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
                    {...restOfProps}
                  />
                ))
              }
            </FieldArray>
          </tbody>
        </table>

        <AddBoundaryConditionIcon
          maxTables={maxTables}
          addBoundaryConditionTableColumn={addBoundaryConditionTableColumn}
          setFieldValue={setFieldValue}
        />
      </div>
    </FormGroup>
  );
};

export default BoundaryConditions;
