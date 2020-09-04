import React from 'react';
import { c } from 'ttag';

import { Address } from 'proton-shared/lib/interfaces';

import { ImportModalModel } from '../../interfaces';

interface Props {
    modalModel: ImportModalModel;
    address: Address;
}

const ImportStartedStep = ({ modalModel, address }: Props) => (
    <div className="aligncenter">
        <h3>{c('Info').t`Your import has started!`}</h3>
        <div className="mt1">{c('Info').t`Your messages are being imported from`}</div>
        <div className="mt1">
            <strong>{modalModel.email}</strong>
        </div>
        <div>{c('Info').t`to`}</div>
        <div>
            <strong>{address.Email}</strong>
        </div>
        <div className="mt1">{c('Info').t`We will notify you once your import is finished.`}</div>
        <div>{c('Info').t`Large imports can take several days to complete.`}</div>
        <div className="mt1">{c('Info').t`You can continue using Proton services as usual.`}</div>
    </div>
);
export default ImportStartedStep;
