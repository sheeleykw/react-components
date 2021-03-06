import React, { useEffect, useState, useRef } from 'react';
import { c } from 'ttag';
import { noop } from 'proton-shared/lib/helpers/function';
import { classnames } from '../../helpers';
import { usePopper } from '../popper';
import useRightToLeft from '../../containers/rightToLeft/useRightToLeft';
import { ALL_PLACEMENTS, Position } from '../popper/utils';
import Portal from '../portal/Portal';
import useIsClosing from './useIsClosing';

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
    ref: React.RefObject<HTMLDivElement>;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    anchorRef: React.RefObject<HTMLElement>;
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    originalPlacement?: string;
    isOpen?: boolean;
    noMaxSize?: boolean;
    noCaret?: boolean;
    availablePlacements?: string[];
    originalPosition?: Position;
    offset?: number;
    autoClose?: boolean;
    autoCloseOutside?: boolean;
    autoCloseOutsideAnchor?: boolean;
    contentProps?: ContentProps;
}

const Dropdown = ({
    anchorRef,
    children,
    className,
    originalPlacement = 'bottom',
    availablePlacements = ALL_PLACEMENTS,
    originalPosition,
    offset = 20,
    onClose = noop,
    onContextMenu = noop,
    isOpen = false,
    noMaxSize = false,
    noCaret = false,
    autoClose = true,
    autoCloseOutside = true,
    autoCloseOutsideAnchor = true,
    contentProps,
    ...rest
}: Props) => {
    const { isRTL } = useRightToLeft();
    const rtlAdjustedPlacement = originalPlacement.includes('right')
        ? originalPlacement.replace('right', 'left')
        : originalPlacement.replace('left', 'right');

    const [popperEl, setPopperEl] = useState<HTMLDivElement | null>(null);
    const { position, placement } = usePopper({
        popperEl,
        anchorEl: anchorRef.current,
        isOpen,
        originalPlacement: isRTL ? rtlAdjustedPlacement : originalPlacement,
        availablePlacements,
        originalPosition,
        offset,
        scrollContainerClass: 'main',
    });

    const handleClickContent = () => {
        if (autoClose) {
            onClose();
        }
    };

    const contentRef = useRef<HTMLDivElement>(null);
    const [contentRect, setContentRect] = useState<DOMRect>();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && event.target === document.activeElement) {
                onClose();
            }
        };

        const handleClickOutside = ({ target }: MouseEvent) => {
            const targetNode = target as Node;
            const anchorEl = anchorRef.current;
            // Do nothing if clicking ref's element or descendent elements
            if (
                !autoCloseOutside ||
                (autoCloseOutsideAnchor && anchorEl?.contains(targetNode)) ||
                popperEl?.contains(targetNode)
            ) {
                return;
            }
            onClose();
        };

        document.addEventListener('dropdownclose', onClose);
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeydown);

        return () => {
            document.removeEventListener('dropdownclose', onClose);
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [isOpen, autoCloseOutside, onClose, anchorRef.current, popperEl]);

    const [isClosing, isClosed, setIsClosed] = useIsClosing(isOpen);
    const popperClassName = classnames([
        'dropDown',
        `dropDown--${placement}`,
        isClosing && `is-dropdownOut`,
        noCaret && 'dropDown--noCaret',
        className,
    ]);

    if (isClosed) {
        return null;
    }

    const varPosition = {
        '--top': position.top,
        '--left': position.left,
    };

    const varSize = contentRect
        ? {
              '--width': `${contentRect.width}`,
              '--height': `${contentRect.height}`,
          }
        : {};

    const handleAnimationEnd = ({ animationName }: React.AnimationEvent) => {
        if (animationName.includes('dropdownOut') && isClosing) {
            setIsClosed();
            setContentRect(undefined);
        }
        if (animationName.includes('dropdownIn') && isOpen && contentRef.current && !contentRect) {
            setContentRect(contentRef.current.getBoundingClientRect());
        }
    };

    return (
        <Portal>
            <div
                ref={setPopperEl}
                style={{ ...varPosition, ...varSize }}
                role="dialog"
                className={popperClassName}
                onClick={handleClickContent}
                onAnimationEnd={handleAnimationEnd}
                onContextMenu={onContextMenu}
                {...rest}
            >
                {/* Backdrop button, meant to override 'autoClose' option on mobile */}
                <button type="button" className="dropDown-backdrop" title={c('Action').t`Close`} onClick={onClose}>
                    <span className="sr-only">{c('Action').t`Close`}</span>
                </button>
                <div
                    ref={contentRef}
                    className={classnames(['dropDown-content', noMaxSize && 'dropDown-content--noMaxSize'])}
                    {...contentProps}
                >
                    {children}
                </div>
            </div>
        </Portal>
    );
};

export default Dropdown;
