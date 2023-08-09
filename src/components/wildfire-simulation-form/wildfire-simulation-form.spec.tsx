import React from 'react';

import { screen, render, userEvent, fireEvent, waitFor, act } from 'test-utils';

import WildfireSimulation from './WildfireSimulation';

const DEFAULT_STATE = {};

const TEST_VALID_WKT =
  'POLYGON ((22.069942 50.839797, 22.333582 50.197151, 23.168442 50.365641, 22.069942 50.839797))';

const renderComponent = (state = {}) => {
  const props = {
    t: str => str,
    handleResetAOI: jest.fn(),
    backToOnDemandPanel: jest.fn(),
    mapInputOnChange: jest.fn(),
    onSubmit: jest.fn(),
  };

  const { store } = render(<WildfireSimulation {...props} />, {
    state: { ...DEFAULT_STATE, ...state },
  });
  return { store, ...props };
};

describe('WildfireSimulation', () => {
  it('renders', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: 'request' })).toBeInTheDocument();
  });

  it('blocks submission when form is invalid', async () => {
    const { onSubmit } = renderComponent();

    userEvent.click(screen.getByRole('button', { name: 'request' }));

    await waitFor(() => {
      expect(screen.getAllByText('field-empty-err')[0]).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  xit('calls submit handler when form is valid (no optional fields)', async () => {
    const { onSubmit } = renderComponent();

    const testValues = {
      simulationTitle: 'Test Title',
      simulationDescription: 'Test Description',
      probabilityRange: 0.75,
      mapSelection: TEST_VALID_WKT,
      isMapAreaValid: null,
      isMapAreaValidWKT: null,
      hoursOfProjection: 1,
      ignitionDateTime: '2050-03-29',
      simulationFireSpotting: false,
      boundaryConditions: [
        {
          timeOffset: 0,
          windDirection: '11',
          windSpeed: '22',
          fuelMoistureContent: '33',
        },
      ],
    };

    await userEvent.type(
      screen.getByRole('textbox', { name: 'simulationTitle' }),
      testValues.simulationTitle,
    );

    await userEvent.type(
      screen.getByRole('textbox', { name: 'simulationDescription' }),
      testValues.simulationDescription,
    );

    await userEvent.type(
      screen.getByRole('textbox', { name: 'mapSelection' }),
      testValues.mapSelection,
    );

    await waitFor(() => {
      fireEvent.change(
        screen.getByRole('daterange-picker', {
          name: 'ignitionDateTime',
        }),
        {
          target: { value: testValues.ignitionDateTime },
        },
      );
    });

    // boundary conditions
    await userEvent.type(
      screen.getByTestId('boundaryConditions.0.windDirection'),
      testValues.boundaryConditions[0].windDirection,
    );

    await userEvent.type(
      screen.getByTestId('boundaryConditions.0.windSpeed'),
      testValues.boundaryConditions[0].windSpeed,
    );

    await userEvent.type(
      screen.getByTestId('boundaryConditions.0.fuelMoistureContent'),
      testValues.boundaryConditions[0].fuelMoistureContent,
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(testValues);
    });
  });
});
