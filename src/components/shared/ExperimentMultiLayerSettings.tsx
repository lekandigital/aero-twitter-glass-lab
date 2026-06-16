import type { MaterialFieldBase } from './MaterialSettingControl';
import { MaterialSettingCollapsibleSection } from './MaterialSettingCollapsibleSection';
import { MaterialSettingFieldRow } from './MaterialSettingControl';
import type { ExperimentSetOneSnapshot } from '../experiment-set-one/savedConfigs';
import {
  foldableSectionDomId,
  foldableSectionId,
  layerPairValuesDiffer,
  resolveFieldValueForLayerMode,
  resolvePairedSuffix,
  sectionsForLayerMode,
  transformFieldsForLayerMode,
  type LayerEditMode,
} from './layerEditMode';

type ResetTarget<T> = { label: string; value: T };

type ExperimentMultiLayerSettingsProps<TSettings extends Record<string, unknown>> = {
  experimentKey: string;
  title: string;
  description: string;
  filtering: boolean;
  fields: Array<MaterialFieldBase & { when?: (settings: TSettings) => boolean }>;
  sectionOrder: readonly string[];
  settings: TSettings;
  masterDefault: TSettings;
  layerEditMode: LayerEditMode;
  onChange: (id: keyof TSettings & string, value: TSettings[keyof TSettings]) => void;
  onPairedChange: (suffix: string, value: TSettings[keyof TSettings]) => void;
  resetTargets: (
    masterValue: TSettings[keyof TSettings],
    experiment: 'three' | 'four',
    fieldId: string,
    saves: ExperimentSetOneSnapshot[],
  ) => ResetTarget<TSettings[keyof TSettings]>[];
  scopedSaves: ExperimentSetOneSnapshot[];
  saveExperiment: 'three' | 'four';
  isOpen: (id: string) => boolean;
  onToggle: (id: string) => void;
};

export function ExperimentMultiLayerSettings<TSettings extends Record<string, unknown>>({
  experimentKey,
  title,
  description,
  filtering,
  fields,
  sectionOrder,
  settings,
  masterDefault,
  layerEditMode,
  onChange,
  onPairedChange,
  resetTargets,
  scopedSaves,
  saveExperiment,
  isOpen,
  onToggle,
}: ExperimentMultiLayerSettingsProps<TSettings>) {
  const displayFields = transformFieldsForLayerMode(fields, layerEditMode);
  const displaySections = sectionsForLayerMode(displayFields, sectionOrder, layerEditMode);
  const allIds = new Set(fields.map((field) => field.id));

  if (displayFields.length === 0) return null;

  return (
    <section className="experiment-set-one-dock__experiment">
      {!filtering && (
        <>
          <h2 className="experiment-set-one-dock__experiment-title">{title}</h2>
          <p className="experiment-set-one-dock__experiment-desc">{description}</p>
        </>
      )}
      {displaySections.map((section) => {
        const sectionFields = displayFields.filter((field) => field.section === section);
        if (sectionFields.length === 0) return null;

        const sectionStateKey = foldableSectionId(experimentKey, section);
        const sectionDomId = foldableSectionDomId(experimentKey, section);

        return (
          <MaterialSettingCollapsibleSection
            key={sectionDomId}
            id={sectionStateKey}
            domId={sectionDomId}
            title={section}
            count={sectionFields.length}
            open={isOpen(sectionStateKey)}
            onToggle={onToggle}
            titleClassName="experiment-one-settings-dock__section-title"
            fieldsClassName="experiment-one-settings-dock__fields"
          >
            {sectionFields.map((field, index) => {
              const pairedSuffix = resolvePairedSuffix(field.id, allIds);
              const fieldId = field.id as keyof TSettings & string;
              const value = resolveFieldValueForLayerMode(settings, field.id, layerEditMode) as TSettings[keyof TSettings];
              const outOfSync =
                layerEditMode === 'both' && pairedSuffix
                  ? layerPairValuesDiffer(settings, field.id, allIds)
                  : false;

              const masterValue = pairedSuffix
                ? (masterDefault[`layerA${pairedSuffix}` as keyof TSettings] as TSettings[keyof TSettings])
                : (masterDefault[fieldId] as TSettings[keyof TSettings]);

              const handleChange = (next: TSettings[keyof TSettings]) => {
                if (layerEditMode === 'both' && pairedSuffix) {
                  onPairedChange(pairedSuffix, next);
                  return;
                }
                onChange(fieldId, next);
              };

              const handleResetTo = (next: TSettings[keyof TSettings]) => {
                if (layerEditMode === 'both' && pairedSuffix) {
                  onPairedChange(pairedSuffix, next);
                  return;
                }
                onChange(fieldId, next);
              };

              const targets = resetTargets(masterValue, saveExperiment, field.id, scopedSaves);

              return (
                <MaterialSettingFieldRow
                  key={`${experimentKey}-${field.id}`}
                  field={field}
                  value={value}
                  onChange={handleChange}
                  defaultValue={masterValue}
                  resetTargets={targets}
                  onResetTo={handleResetTo}
                  classPrefix="e2"
                  highlighted={false}
                  fieldIndex={index + 1}
                  outOfSync={outOfSync}
                />
              );
            })}
          </MaterialSettingCollapsibleSection>
        );
      })}
    </section>
  );
}

export function applyPairedLayerChange<TSettings extends Record<string, unknown>>(
  settings: TSettings,
  suffix: string,
  value: TSettings[keyof TSettings],
): TSettings {
  return {
    ...settings,
    [`layerA${suffix}`]: value,
    [`layerB${suffix}`]: value,
  } as TSettings;
}
