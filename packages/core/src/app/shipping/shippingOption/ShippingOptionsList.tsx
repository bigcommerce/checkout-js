import { ExtensionRegion, type ShippingOption } from '@bigcommerce/checkout-sdk/essential';
import React, { type FunctionComponent, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { EMPTY_ARRAY } from '../../common/utility';
import { Checklist, ChecklistItem } from '../../ui/form';
import { getCarriers } from '../carriers/getCarriers';
import GetDefaultCarriers from '../carriers/getDefaultCarriers';

import StaticShippingOption from './StaticShippingOption';

interface ShippingOptionListItemProps {
  consignmentId: string;
  isMultiShippingMode: boolean;
  selectedShippingOptionId?: string;
  shippingOption: ShippingOption;
}

const ShippingOptionListItem: FunctionComponent<ShippingOptionListItemProps> = ({
  consignmentId,
  isMultiShippingMode,
  selectedShippingOptionId,
  shippingOption,
}) => {
  const isSelected = selectedShippingOptionId === shippingOption.id;

  const renderLabel = useCallback(
    () => (
      <div className="shippingOptionLabel">
        <StaticShippingOption
          displayAdditionalInformation={true}
          method={shippingOption}
          shippingCostAfterDiscount={shippingOption.costAfterDiscount}
        />
        {isSelected && !isMultiShippingMode && (
          <Extension region={ExtensionRegion.ShippingSelectedShippingMethod} />
        )}
      </div>
    ),
    [isSelected, isMultiShippingMode, shippingOption],
  );

  return (
    <ChecklistItem
      htmlId={`shippingOptionRadio-${consignmentId}-${shippingOption.id}`}
      label={renderLabel}
      value={shippingOption.id}
    />
  );
};

export interface ShippingOptionListProps {
  consignmentId: string;
  customerId?: number;
  customerGroupId?: number;
  postalCode: string;
  stateOrProvince: string;
  inputName: string;
  isLoading: boolean;
  isMultiShippingMode: boolean;
  selectedShippingOptionId?: string;
  shippingOptions?: ShippingOption[];
  onSelectedOption(consignmentId: string, shippingOptionId: string): void;
}

function filterByPickupRules(
  options: ShippingOption[],
  carrierNames: string[],
  customerGroupId: number | undefined,
  postalCode: string,
  stateOrProvince: string,
): ShippingOption[] {
  const isSelanusaGroup = customerGroupId === 570 && stateOrProvince === 'Ciudad de México';

  return carrierNames.reduce<ShippingOption[]>((result, carrierName) => {
    const option = options.find((el) => el.description === carrierName);

    if (!option) return result;

    if (option.description === 'Boutique Selanusa' || option.description === 'Recoger CLS') {
      const allowedPickup =
        isSelanusaGroup &&
        ((postalCode === '06080' && option.description === 'Boutique Selanusa') ||
          (postalCode === '07040' && option.description === 'Recoger CLS'));

      if (!allowedPickup) return result;
    }

    result.push(option);

    return result;
  }, []);
}

const ShippingOptionsList: FunctionComponent<ShippingOptionListProps> = ({
  consignmentId,
  customerId,
  customerGroupId,
  postalCode,
  stateOrProvince,
  inputName,
  isLoading,
  isMultiShippingMode,
  shippingOptions = EMPTY_ARRAY,
  selectedShippingOptionId,
  onSelectedOption,
}) => {
  const [carriers, setCarriers] = useState<string[]>([]);

  const handleSelect = useCallback(
    (value: string) => {
      onSelectedOption(consignmentId, value);
    },
    [consignmentId, onSelectedOption],
  );

  // Fetch carriers ONCE — they only depend on customerId/customerGroupId
  useEffect(() => {
    let cancelled = false;

    const fetchCarriers = async () => {
      const [bundleCarriers, defaultCarriers] = await Promise.all([
        getCarriers(customerId).then((c) => c || []),
        GetDefaultCarriers(),
      ]);

      if (!cancelled) {
        setCarriers([...defaultCarriers, ...bundleCarriers]);
      }
    };

    fetchCarriers();

    return () => {
      cancelled = true;
    };
  }, [customerId, customerGroupId]);

  // Re-filter when postalCode, stateOrProvince, or shippingOptions change (no fetch)
  const filteredShippingOptions = useMemo(
    () =>
      filterByPickupRules(shippingOptions, carriers, customerGroupId, postalCode, stateOrProvince),
    [shippingOptions, carriers, customerGroupId, postalCode, stateOrProvince],
  );

  return (
    <LoadingOverlay isLoading={isLoading}>
      {filteredShippingOptions.length > 0 ? (
        <Checklist
          aria-live="polite"
          defaultSelectedItemId={selectedShippingOptionId}
          name={inputName}
          onSelect={handleSelect}
        >
          {filteredShippingOptions.map((shippingOption) => (
            <ShippingOptionListItem
              consignmentId={consignmentId}
              isMultiShippingMode={isMultiShippingMode}
              key={shippingOption.id}
              selectedShippingOptionId={selectedShippingOptionId}
              shippingOption={shippingOption}
            />
          ))}
        </Checklist>
      ) : (
        <h4>No hay transportistas disponibles</h4>
      )}
    </LoadingOverlay>
  );
};

export default memo(ShippingOptionsList);
