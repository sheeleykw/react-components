import React, { useState, ChangeEvent } from 'react';
import { c } from 'ttag';
import { LINK_TYPES } from 'proton-shared/lib/constants';
import { linkToType } from 'proton-shared/lib/helpers/url';

import FormModal from '../../modal/FormModal';
import { PrimaryButton } from '../../button';
import Alert from '../../alert/Alert';
import Row from '../../container/Row';
import Label from '../../label/Label';
import Field from '../../container/Field';
import Input from '../../input/Input';
import Href from '../../link/Href';
import { Select } from '../../select';

import { LinkData } from '../squireConfig';

const getActualUrl = (url: string, type: LINK_TYPES) =>
    type === LINK_TYPES.WEB ? url : type === LINK_TYPES.EMAIL ? `mailto:${url}` : `tel:${url}`;

interface Props {
    inputLink: LinkData;
    onSubmit: (link: LinkData) => void;
    onClose?: () => void;
}

const EditorLinkModal = ({ inputLink, onSubmit, onClose, ...rest }: Props) => {
    const [url, setUrl] = useState(inputLink.link);
    const [label, setLabel] = useState(inputLink.title);
    const [type, setType] = useState(linkToType(inputLink.link) || LINK_TYPES.WEB);

    const typesOptions = [
        { value: LINK_TYPES.WEB, text: c('Info').t`Web URL` },
        { value: LINK_TYPES.EMAIL, text: c('Info').t`Email address` },
        { value: LINK_TYPES.PHONE, text: c('Info').t`Phone number` },
    ];

    const i18n = {
        [LINK_TYPES.WEB]: {
            label: c('Info').t`URL link`,
            placeholder: c('Placeholder').t`Link`,
        },
        [LINK_TYPES.EMAIL]: {
            label: c('Info').t`Email address`,
            placeholder: c('Placeholder').t`Email address`,
        },
        [LINK_TYPES.PHONE]: {
            label: c('Info').t`Phone number`,
            placeholder: c('Placeholder').t`Phone number`,
        },
    };

    const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setType(event.target.value as LINK_TYPES);
    };

    const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
        if (url === label) {
            setLabel(event.target.value);
        }
    };

    const handleSubmit = () => {
        onSubmit({ link: getActualUrl(url, type), title: label });
        onClose?.();
    };

    return (
        <FormModal
            title={c('Info').t`Insert link`}
            close={c('Action').t`Cancel`}
            submit={
                <PrimaryButton type="submit" disabled={!label || !url}>
                    {c('Action').t`Insert`}
                </PrimaryButton>
            }
            onSubmit={handleSubmit}
            onClose={onClose}
            {...rest}
        >
            <Alert>
                {c('Info')
                    .t`In the first box, put the link/email/phone number the text should go to. In the second box, put the text you want to appear.`}
            </Alert>
            <Row>
                <Label htmlFor="link-modal-type" className="flex flex-column">
                    {c('Info').t`Link type`}
                </Label>
                <Field>
                    <Select
                        id="link-modal-type"
                        value={type}
                        onChange={handleTypeChange}
                        options={typesOptions}
                        required
                    />
                </Field>
            </Row>
            <Row>
                <Label htmlFor="link-modal-url" className="flex flex-column">
                    {i18n[type].label}
                </Label>
                <Field>
                    <Input
                        id="link-modal-url"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder={i18n[type].placeholder}
                        required
                    />
                </Field>
            </Row>
            <Row>
                <Label htmlFor="link-modal-label" className="flex flex-column">
                    {c('Info').t`Text to display`}
                </Label>
                <Field>
                    <Input
                        id="link-modal-label"
                        value={label}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setLabel(event.target.value)}
                        placeholder={c('Placeholder').t`Text`}
                        required
                    />
                </Field>
            </Row>
            <Row>
                <Label>{c('Info').t`Test link`}</Label>
                <Field className="pt0-5">
                    {url && label ? (
                        <Href url={getActualUrl(url, type)}>{label}</Href>
                    ) : (
                        <span className="placeholder">{c('Info').t`Fill url and text to test your link`}</span>
                    )}
                </Field>
            </Row>
        </FormModal>
    );
};

export default EditorLinkModal;
