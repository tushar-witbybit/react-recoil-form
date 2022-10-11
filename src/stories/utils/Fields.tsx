import * as React from 'react';
import {
  useField,
  useFieldArray,
  useFieldArrayColumnWatch,
} from '../../FormProvider';

interface FileFieldProps {
  name: string;
}

interface IFileType {
  name: string;
  type: string;
}

export interface InputFieldProps {
  type: 'number' | 'text' | 'date';
  ancestors?: { name: string; rowId: number }[];
  name: string;
  label?: string;
  validate?: (value: any, otherParams: any) => string | null;
  depFields?: string[];
  disabled?: boolean;
  onChange?: (value: any) => void;
  defaultValue?: number | string;
  max?: number;
}

export function FileField(props: FileFieldProps) {
  const field = useField<IFileType | null>({
    name: props.name,
    defaultValue: null,
  });
  return (
    <div>
      <input
        type="file"
        onChange={async (evt) => {
          const file = evt.currentTarget.files?.[0];
          if (file) {
            field.setFieldValue(
              {
                name: file.name,
                type: file.type,
              },
              { file }
            );
          } else {
            field.setFieldValue(null);
          }
        }}
      />
    </div>
  );
}

export function InputField(props: InputFieldProps) {
  const field = useField<string | number>({
    ancestors: props.ancestors,
    name: props.name,
    validate: props.validate,
    defaultValue: props.defaultValue,
    depFields: props.depFields,
  });
  return (
    <div className="flex flex-col items-start mb-4">
      <label
        htmlFor={props.name}
        className="block text-sm font-medium text-gray-700 capitalize mb-1"
      >
        {props.label ?? props.name}
      </label>
      <input
        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
        id={props.name}
        type={props.type}
        name={props.name}
        disabled={props.disabled}
        onChange={(evt) => {
          if (props.type === 'number') {
            try {
              const val = parseInt(evt.target.value);
              field.setFieldValue(val);
            } catch (err) {}
          } else {
            field.setFieldValue(evt.target.value);
          }
          props.onChange?.(evt.target.value);
        }}
        value={field.fieldValue ?? ''}
        onBlur={field.onBlur}
      />
      {field.error && (
        <div className="text-red-500 text-sm mt-1">{field.error}</div>
      )}
    </div>
  );
}

interface TableFieldProps {
  name: string;
  fields: InputFieldProps[];
}

export function TableField(props: TableFieldProps) {
  const tableField = useFieldArray({
    fieldNames: props.fields.map((f) => f.name),
    name: props.name,
    // If validate function is removed, only the particular field inside field array will render
    // For real-time validation, we need to listen to all fields inside the field array to pass data to validate function.
    validate: (value) =>
      value?.length <= 1 ? 'Need at least two rows' : undefined,
  });

  return (
    <div>
      <label htmlFor={props.name}>{props.name}</label>
      <table id={props.name}>
        <tbody>
          {tableField.fieldArrayProps.rowIds.map((r, idx) => {
            return (
              <tr key={r}>
                <React.Fragment>
                  {props.fields.map((f) => (
                    <td key={f.name}>
                      <InputField
                        ancestors={[{ name: props.name, rowId: r }]}
                        name={f.name}
                        type={f.type}
                        validate={(value) => (!value ? `Value missing` : '')}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      onClick={() => tableField.remove(idx)}
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        tableField.insert(
                          idx + 1,
                          tableField.getFieldArrayValue()[idx]
                        )
                      }
                    >
                      Duplicate Row
                    </button>
                  </td>
                </React.Fragment>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button type="button" onClick={() => tableField.append()}>
        Add Row
      </button>
      {tableField?.error && (
        <div style={{ color: 'red' }}>{tableField.error}</div>
      )}
    </div>
  );
}

interface WatchFieldProps {
  name: string;
  fieldArrayName: string;
  colNames: string[];
  calculateFunc?: (values: any) => string;
}

export function WatchField(props: WatchFieldProps) {
  const res = useFieldArrayColumnWatch({
    fieldArrayName: props.fieldArrayName,
    fieldNames: props.colNames,
  });
  const value = props.calculateFunc
    ? props.calculateFunc(res.values)
    : JSON.stringify(res.values ?? {});
  return (
    <div>
      <label htmlFor={props.name}>{props.name}</label>
      <input id={props.name} type="text" disabled value={value} />
    </div>
  );
}
