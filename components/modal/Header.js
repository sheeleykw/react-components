import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import Icon from '../icon/Icon';
import { classnames } from '../../helpers';

const Header = ({
    children,
    modalTitleID,
    className = '',
    closeTextModal = '',
    closeTextVisible = false,
    hasClose = true,
    displayTitle = true,
    onClose,
    ...rest
}) => {
    const closeText = closeTextModal === '' ? c('Action').t`Close modal` : closeTextModal;
    return (
        <header
            className={classnames(['pm-modalHeader', !displayTitle && 'pm-modalHeader--no-title', className])}
            {...rest}
        >
            {hasClose ? (
                <button type="button" className="pm-modalClose" title={closeText} onClick={onClose}>
                    <span className={classnames(['mr0-25', !closeTextVisible && 'sr-only'])}>{closeText}</span>
                    <Icon className="pm-modalClose-icon" name="close" />
                </button>
            ) : null}
            <h1 id={modalTitleID} className={classnames(['pm-modalTitle', !displayTitle && 'sr-only'])}>
                {children}
            </h1>
        </header>
    );
};

Header.propTypes = {
    children: PropTypes.node.isRequired,
    closeTextModal: PropTypes.string,
    hasClose: PropTypes.bool,
    onClose: PropTypes.func,
    className: PropTypes.string,
    closeTextIsHidden: PropTypes.bool,
    modalTitleID: PropTypes.string.isRequired,
};

export default Header;
