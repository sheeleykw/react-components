import React, { forwardRef, Ref, MutableRefObject } from 'react';
import { toBase64 } from 'proton-shared/lib/helpers/file';

import SquireEditor, { SquireEditorRef } from './SquireEditor';
import { classnames } from '../../helpers';
import useActiveBreakpoint from '../../hooks/useActiveBreakpoint';

interface Props {
    className?: string;
    supportImages?: boolean;
    isNarrow?: boolean;
    onChange?: (value: string) => void;
    disabled?: boolean;
    onReady?: () => void;
    onFocus?: () => void;
}

/**
 * This component is *Uncontrolled*
 * https://reactjs.org/docs/uncontrolled-components.html
 * There is issues when trying to synchronize input value to the current content of the editor
 * Uncontrolled components is prefered in this case
 * Look at the specific SquireEditorRef provided to set initial value
 */
const SimpleSquireEditor = forwardRef(
    (
        { className, supportImages = true, isNarrow: forcedIsNarrow, onChange, disabled, onReady, onFocus }: Props,
        ref: Ref<SquireEditorRef>
    ) => {
        const { isNarrow } = useActiveBreakpoint();

        const handleAddImages = (files: File[]) => {
            files.forEach(async (file) => {
                const base64str = await toBase64(file);
                (ref as MutableRefObject<SquireEditorRef>).current?.insertImage(base64str);
            });
        };

        return (
            <SquireEditor
                ref={ref}
                className={classnames([className, 'simple-squire-editor'])}
                metadata={{ supportImages }}
                onChange={onChange}
                isNarrow={isNarrow || forcedIsNarrow}
                disabled={disabled}
                onReady={onReady}
                onFocus={onFocus}
                onAddImages={handleAddImages}
            />
        );
    }
);

export default SimpleSquireEditor;
