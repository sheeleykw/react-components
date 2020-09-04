import React, { useEffect, useRef } from 'react';
import Icon from '../icon/Icon';
import { classnames } from '../../helpers';

export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    loading?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
    indeterminate?: boolean;
    labelOnClick?: (event: React.MouseEvent<HTMLLabelElement, MouseEvent>) => void;
}

const Checkbox = ({
    id,
    className,
    title,
    loading,
    disabled,
    checked,
    indeterminate = false,
    color,
    backgroundColor,
    borderColor,
    children,
    labelOnClick,
    ...rest
}: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <label
            htmlFor={id}
            className={classnames([
                'inline-flex',
                !className?.includes('increase-surface-click') && 'relative',
                className,
            ])}
            title={title}
            onClick={labelOnClick}
        >
            <input
                ref={inputRef}
                disabled={disabled || loading}
                id={id}
                type="checkbox"
                className="pm-checkbox"
                checked={checked}
                {...rest}
            />
            <span className="pm-checkbox-fakecheck" style={{ borderColor, background: backgroundColor, color }}>
                <Icon className="pm-checkbox-fakecheck-img" name="on" color={color} />
            </span>
            {children}
        </label>
    );
};

export default Checkbox;
