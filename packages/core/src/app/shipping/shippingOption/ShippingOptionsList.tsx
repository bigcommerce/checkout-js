import { ExtensionRegion, type ShippingOption } from '@bigcommerce/checkout-sdk/essential';
import React, { type FunctionComponent, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { EMPTY_ARRAY } from '../../common/utility';
import { Checklist, ChecklistItem } from '../../ui/form';
import { getAllCarriers, getCarriers } from '../carriers/getCarriers';
import GetDefaultCarriers from '../carriers/getDefaultCarriers';

import StaticShippingOption from './StaticShippingOption';

const PICKUP_STORES = {
  'Boutique Selanusa': { postalCode: '06080' },
  'Recoger CLS': { postalCode: '07040' },
} as const;

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
  defaultCarriersSet: Set<string>,
  bundleCarriersSet: Set<string>,
  managedCarriersSet: Set<string>,
  customerGroupId: number | undefined,
  postalCode: string,
  stateOrProvince: string,
): ShippingOption[] {
  const isSelanusaGroup = customerGroupId === 570 && stateOrProvince === 'Ciudad de México';

  return options.filter((option) => {
    const { description } = option;

    // Default carriers: always show
    if (defaultCarriersSet.has(description)) {
      return true;
    }

    // Managed carriers (from /carriers endpoint): only show if in bundle
    if (managedCarriersSet.has(description)) {
      return bundleCarriersSet.has(description) && validatePickupRules(description, isSelanusaGroup, postalCode);
    }

    // Unmanaged carriers: always show
    return true;
  });
}

function validatePickupRules(
  carrierName: string,
  isSelanusaGroup: boolean,
  postalCode: string,
): boolean {
  const pickup = PICKUP_STORES[carrierName as keyof typeof PICKUP_STORES];
  if (!pickup) return true;

  return isSelanusaGroup && postalCode === pickup.postalCode;
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
  const [defaultCarriersSet, setDefaultCarriersSet] = useState<Set<string>>(new Set());
  const [bundleCarriersSet, setBundleCarriersSet] = useState<Set<string>>(new Set());
  const [managedCarriersSet, setManagedCarriersSet] = useState<Set<string>>(new Set());

  const handleSelect = useCallback(
    (value: string) => {
      onSelectedOption(consignmentId, value);
    },
    [consignmentId, onSelectedOption],
  );

  // Fetch carriers: managed (filterable) + bundle (customer-specific) + defaults (always show)
  useEffect(() => {
    let cancelled = false;

    if (!shippingOptions.length) return;

    Promise.all([
      getCarriers(customerId).then((c) => c || []),
      GetDefaultCarriers(),
      getAllCarriers(),
    ]).then(([bundleCarriers, defaultCarriers, managedCarriers]) => {
      if (cancelled) return;

      setDefaultCarriersSet(new Set(defaultCarriers));
      setBundleCarriersSet(new Set(bundleCarriers));
      setManagedCarriersSet(new Set(managedCarriers));
    });

    return () => {
      cancelled = true;
    };
  }, [shippingOptions, customerId]);

  const filteredShippingOptions = useMemo(
    () =>
      filterByPickupRules(
        shippingOptions,
        defaultCarriersSet,
        bundleCarriersSet,
        managedCarriersSet,
        customerGroupId,
        postalCode,
        stateOrProvince,
      ),
    [
      shippingOptions,
      defaultCarriersSet,
      bundleCarriersSet,
      managedCarriersSet,
      customerGroupId,
      postalCode,
      stateOrProvince,
    ],
  );

  if (!shippingOptions.length) {
    return null;
  }

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
