import React, { Ref, useState } from 'react';

import { generateUID, classnames } from '../../helpers';
import useInput from '../input/useInput';
import ErrorZone from '../text/ErrorZone';

export interface OptionProps
    extends React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement> {
    value: string | number;
    text: string | number;
    group?: string;
    disabled?: boolean;
}

const buildOptions = (options: OptionProps[] = [], keyPrefix = 'option') => {
    return options.map(({ text, ...rest }, index) => (
        <option key={`${keyPrefix}_${index}`} {...rest}>
            {text}
        </option>
    ));
};

const buildGroupedOptions = (options: OptionProps[] = []) => {
    const orphanOptions = options.filter((o: OptionProps) => !o.group);

    return (
        <>
            {buildOptions(orphanOptions)}
            {Object.entries(
                options.reduce<{ [key: string]: OptionProps[] }>((acc, option) => {
                    if (!option.group) {
                        return acc;
                    }

                    const { group } = option;
                    acc[group] = acc[group] || [];
                    acc[group].push(option);
                    return acc;
                }, {})
            ).map(([group, options], index) => {
                return (
                    <optgroup key={`optionGroup_${index}`} label={group}>
                        {buildOptions(options, `optionGroup_${index}`)}
                    </optgroup>
                );
            })}
        </>
    );
};

export interface Props
    extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
    ref?: Ref<HTMLSelectElement>; // override ref so that LegacyRef isn't used
    error?: string;
    isSubmitted?: boolean;
    size?: number;
    options: OptionProps[];
    loading?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, Props>(
    (
        {
            options,
            error,
            size = 1,
            className = '',
            multiple = false,
            loading = false,
            isSubmitted = false,
            ...rest
        }: Props,
        ref
    ) => {
        const { handlers, statusClasses, status } = useInput<HTMLSelectElement>(rest);
        const [uid] = useState(generateUID('select'));
        const hasError = error && (status.isDirty || isSubmitted);
        const hasGroup = options.some(({ group }) => group);

        return (
            <>
                <select
                    className={classnames(['pm-field w100', className, statusClasses])}
                    size={size}
                    multiple={multiple}
                    disabled={loading || rest.disabled}
                    ref={ref}
                    {...rest}
                    {...handlers}
                >
                    {hasGroup ? buildGroupedOptions(options) : buildOptions(options)}
                </select>
                <ErrorZone id={uid}>{hasError ? error : ''}</ErrorZone>
            </>
        );
    }
);

export default Select;
