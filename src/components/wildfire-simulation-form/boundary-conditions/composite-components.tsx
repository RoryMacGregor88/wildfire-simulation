import { BOUNDARY_CONDITIONS_TABLE_HEADERS } from '~/constants';

const TableHead = () => (
  <thead>
    <tr
      className='d-flex justify-content-evenly mt-3'
      style={{ height: '100%' }}
    >
      {BOUNDARY_CONDITIONS_TABLE_HEADERS.map((header) => (
        <th key={header} className='font-bold'>
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const AddBoundaryConditionIcon = ({
  maxTables,
  addBoundaryConditionTableColumn,
  setFieldValue,
}) => (
  <i
    onClick={() => {
      if (maxTables) return;
      addBoundaryConditionTableColumn(setFieldValue);
    }}
    className='bx bx-plus-circle p-0 text-lg'
    style={{
      cursor: 'pointer',
      alignSelf: 'center',
      fontSize: '2.5rem',
    }}
  />
);

export { TableHead, AddBoundaryConditionIcon };
