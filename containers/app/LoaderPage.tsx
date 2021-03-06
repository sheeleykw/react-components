import React from 'react';
import { c } from 'ttag';
import { APPS_CONFIGURATION } from 'proton-shared/lib/constants';
import { useConfig } from '../../hooks';
import { FullLoader, TextLoader } from '../../components';

interface Props {
    text?: string;
    loaderClassName?: string;
}

const LoaderPage = ({ text, loaderClassName = 'color-global-light' }: Props) => {
    const { APP_NAME } = useConfig();
    const appName = APPS_CONFIGURATION[APP_NAME].name;
    return (
        <div className="centered-absolute aligncenter">
            <FullLoader className={loaderClassName} size={200} />
            <TextLoader>{text || c('Info').t`Loading ${appName}`}</TextLoader>
        </div>
    );
};

export default LoaderPage;
