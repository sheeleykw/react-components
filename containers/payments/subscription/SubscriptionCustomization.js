import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Price, useConfig } from 'react-components';
import { c, msgid } from 'ttag';
import { PLANS, CYCLE, ADDON_NAMES, CLIENT_TYPES, PLAN_SERVICES, FREE, PLAN_TYPES } from 'proton-shared/lib/constants';
import { toMap } from 'proton-shared/lib/helpers/object';
import humanSize from 'proton-shared/lib/helpers/humanSize';
import { hasBit } from 'proton-shared/lib/helpers/bitset';

import SubscriptionPlan from './SubscriptionPlan';
import SubscriptionAddonRow from './SubscriptionAddonRow';
import SubscriptionFeatureRow from './SubscriptionFeatureRow';
import MailSubscriptionTable from './MailSubscriptionTable';
import VpnSubscriptionTable from './VpnSubscriptionTable';

const VPNFREE = 'vpnfree';

const TITLE = {
    [FREE]: 'ProtonMail Free',
    [PLANS.PLUS]: 'ProtonMail Plus',
    [PLANS.PROFESSIONAL]: 'ProtonMail Professional',
    [PLANS.VISIONARY]: 'Proton Visionary',
    [VPNFREE]: 'ProtonVPN Free',
    [PLANS.VPNBASIC]: 'ProtonVPN Basic',
    [PLANS.VPNPLUS]: 'ProtonVPN Plus'
};

/**
 * Remove all plans concerned by a service
 * @param {Object} planIDs
 * @param {Array} plans
 * @param {Integer} service
 * @returns {Object} new planIDs
 */
const removeService = (planIDs = {}, plans = [], service = PLAN_SERVICES.MAIL) => {
    const plansMap = toMap(plans);
    return Object.entries(planIDs).reduce((acc, [planID = '', quantity = 0]) => {
        const { Services } = plansMap[planID];

        if (!hasBit(Services, service)) {
            acc[planID] = quantity;
        }

        return acc;
    }, {});
};

const Description = ({ planName, setModel, model, plans }) => {
    const plansMap = toMap(plans, 'Name');
    const plusPlan = plansMap[PLANS.PLUS];
    const vpnPlusPlan = plansMap[PLANS.VPNPLUS];
    const upgradeToPlus = (
        <a
            key="upgrade-to-plus"
            onClick={() =>
                setModel({
                    ...model,
                    planIDs: {
                        ...removeService(model.planIDs, plans, PLAN_SERVICES.MAIL),
                        [plusPlan.ID]: 1
                    }
                })
            }
        >{c('Action').t`Upgrade to ProtonMail Plus`}</a>
    );
    const upgradeToVpnPlus = (
        <a
            key="upgrade-to-vpnplus"
            onClick={() =>
                setModel({
                    ...model,
                    planIDs: {
                        ...removeService(model.planIDs, plans, PLAN_SERVICES.VPN),
                        [vpnPlusPlan.ID]: 1
                    }
                })
            }
        >{c('Link').t`upgrade to ProtonVPN Plus`}</a>
    );

    const DESCRIPTION = {
        [FREE]: c('Description plan').jt`To get more features and security, ${upgradeToPlus}.`,
        [PLANS.PLUS]: c('Description plan')
            .t`You can customize the storage, number of addresses, etc, included with ProtonMail Plus.`,
        [PLANS.PROFESSIONAL]: c('Description plan').t`Select the number of users within your organization.`,
        [PLANS.VISIONARY]: c('Description plan').t`Your plan includes both ProtonMail and ProtonVPN Visionary.`,
        [VPNFREE]: c('Description plan')
            .jt`To get advanced security features and the highest speed, ${upgradeToVpnPlus}.`,
        [PLANS.VPNBASIC]: c('Description plan')
            .jt`To get advanced security features and the highest speed, ${upgradeToVpnPlus}.`,
        [PLANS.VPNPLUS]: c('Description plan')
            .t`You can customize the number of connections when combining ProtonVPN with ProtonMail Professional.`
    };

    const annualBilling = (
        <a key="annual-billing" onClick={() => setModel({ ...model, cycle: CYCLE.YEARLY })}>{c('Link')
            .t`annual billing`}</a>
    );

    return (
        <>
            {model.cycle === CYCLE.MONTHLY && <Alert>{c('Info').jt`Save 20% by switching to ${annualBilling}.`}</Alert>}
            <Alert>{DESCRIPTION[planName]}</Alert>
        </>
    );
};

Description.propTypes = {
    plans: PropTypes.array.isRequired,
    planName: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    setModel: PropTypes.func.isRequired
};

const SubscriptionCustomization = ({ plans, model, setModel, expanded = false }) => {
    const { CLIENT_TYPE } = useConfig();
    const plansMap = toMap(plans, 'Name');
    const plusPlan = plansMap[PLANS.PLUS];
    const visionaryPlan = plansMap[PLANS.VISIONARY];
    const vpnplusPlan = plansMap[PLANS.VPNPLUS];
    const professionalPlan = plansMap[PLANS.PROFESSIONAL];
    const storageAddon = plansMap[ADDON_NAMES.SPACE];
    const addressAddon = plansMap[ADDON_NAMES.ADDRESS];
    const domainAddon = plansMap[ADDON_NAMES.DOMAIN];
    const memberAddon = plansMap[ADDON_NAMES.MEMBER];
    const vpnAddon = plansMap[ADDON_NAMES.VPN];
    const hasVisionary = !!model.planIDs[visionaryPlan.ID];

    const { mailPlan, vpnPlan } = Object.entries(model.planIDs).reduce(
        (acc, [planID, quantity]) => {
            if (!quantity) {
                return acc;
            }

            const plan = plans.find(({ ID }) => ID === planID);

            if (plan.Type === PLAN_TYPES.PLAN) {
                if (hasBit(plan.Services, PLAN_SERVICES.MAIL)) {
                    acc.mailPlan = plan;
                } else if (hasBit(plan.Services, PLAN_SERVICES.VPN)) {
                    acc.vpnPlan = plan;
                }
            }

            return acc;
        },
        { mailPlan: { Name: FREE }, vpnPlan: { Name: VPNFREE } }
    );

    const CAN_CUSTOMIZE = {
        [FREE]: false,
        [PLANS.PLUS]: true,
        [PLANS.PROFESSIONAL]: true,
        [PLANS.VISIONARY]: false,
        [VPNFREE]: false,
        [PLANS.VPNBASIC]: false,
        [PLANS.VPNPLUS]: !!model.planIDs[professionalPlan.ID]
    };

    const DESCRIPTIONS = {
        [PLANS.VPNPLUS]: c('Decription')
            .t`VPN connections can be allocated to users within your organization. Each device requires one connection.`,
        [PLANS.PROFESSIONAL]: c('Decription')
            .t`Each additional user comes automatically with 5 GB storage space and 5 email addresses.`,
        [PLANS.PLUS]: c('Decription').t`.`
    };

    const FEATURES = {
        [FREE]: [
            <SubscriptionFeatureRow key="user" icon="organization-users" feature={c('Feature').t`1 User`} />,
            <SubscriptionFeatureRow key="storage" icon="user-storage" feature={c('Feature').t`500 MB storage`} />,
            <SubscriptionFeatureRow key="address" icon="email-address" feature={c('Feature').t`1 email address`} />,
            <SubscriptionFeatureRow key="all" icon="add" feature={c('Feature').t`150 messages per day`} />
        ],
        [PLANS.PLUS]: [
            <SubscriptionFeatureRow key="user" icon="organization-users" feature={c('Feature').t`1 User`} />,
            <SubscriptionFeatureRow
                key="storage"
                icon="user-storage"
                feature={humanSize(
                    (model.planIDs[storageAddon.ID] || 0) * storageAddon.MaxSpace + plusPlan.MaxSpace,
                    'GB'
                )}
            />,
            <SubscriptionFeatureRow
                key="address"
                icon="email-address"
                feature={c('Feature').t`${(model.planIDs[addressAddon.ID] || 0) * addressAddon.MaxAddresses +
                    plusPlan.MaxAddresses} email addresses`}
            />,
            <SubscriptionFeatureRow
                key="domain"
                icon="domains"
                feature={c('Feature').ngettext(
                    msgid`${(model.planIDs[domainAddon.ID] || 0) * domainAddon.MaxDomains +
                        plusPlan.MaxDomains} custom domain`,
                    `${(model.planIDs[domainAddon.ID] || 0) * domainAddon.MaxDomains +
                        plusPlan.MaxDomains} custom domains`,
                    (model.planIDs[domainAddon.ID] || 0) * domainAddon.MaxDomains + plusPlan.MaxDomains
                )}
            />,
            <SubscriptionFeatureRow key="all" icon="add" feature={c('Feature').t`All plus features`} />
        ],
        [PLANS.PROFESSIONAL]: [
            <SubscriptionFeatureRow
                key="member"
                icon="organization-users"
                feature={c('Feature').ngettext(
                    msgid`${(model.planIDs[memberAddon.ID] || 0) * memberAddon.MaxMembers +
                        professionalPlan.MaxMembers} user`,
                    `${(model.planIDs[memberAddon.ID] || 0) * memberAddon.MaxMembers +
                        professionalPlan.MaxMembers} users`,
                    (model.planIDs[memberAddon.ID] || 0) * memberAddon.MaxMembers + professionalPlan.MaxMembers
                )}
            />,
            <SubscriptionFeatureRow
                key="storage"
                icon="user-storage"
                feature={humanSize(
                    (model.planIDs[storageAddon.ID] || 0) * storageAddon.MaxSpace + professionalPlan.MaxSpace,
                    'GB'
                )}
            />,
            <SubscriptionFeatureRow
                key="address"
                icon="email-address"
                feature={c('Feature').ngettext(
                    msgid`${(model.planIDs[memberAddon.ID] || 0) * memberAddon.MaxAddresses +
                        professionalPlan.MaxAddresses} email address`,
                    `${(model.planIDs[memberAddon.ID] || 0) * memberAddon.MaxAddresses +
                        professionalPlan.MaxAddresses} email addresses`,
                    (model.planIDs[memberAddon.ID] || 0) * memberAddon.MaxAddresses + professionalPlan.MaxAddresses
                )}
            />,
            <SubscriptionFeatureRow
                key="domain"
                icon="domains"
                feature={c('Feature').ngettext(
                    msgid`${(model.planIDs[memberAddon.ID] || 0) * memberAddon.MaxDomains +
                        professionalPlan.MaxDomains} custom domain`,
                    `${(model.planIDs[memberAddon.ID] || 0) * memberAddon.MaxDomains +
                        professionalPlan.MaxDomains} custom domains`,
                    (model.planIDs[memberAddon.ID] || 0) * memberAddon.MaxDomains + professionalPlan.MaxDomains
                )}
            />,
            <SubscriptionFeatureRow key="all" icon="add" feature={c('Feature').t`All professional features`} />
        ],
        [PLANS.VISIONARY]: [
            <SubscriptionFeatureRow key="user" icon="organization-users" feature={c('Feature').t`6 users`} />,
            <SubscriptionFeatureRow key="storage" icon="user-storage" feature={c('Feature').t`20 GB storage`} />,
            <SubscriptionFeatureRow key="address" icon="email-address" feature={c('Feature').t`50 email addresses`} />,
            <SubscriptionFeatureRow key="domain" icon="domains" feature={c('Feature').t`10 custom domains`} />,
            <SubscriptionFeatureRow key="all" icon="add" feature={c('Feature').t`All visionary features`} />
        ],
        [VPNFREE]: [
            <SubscriptionFeatureRow key="connection" icon="connection" feature={c('Feature').t`1 VPN connection`} />,
            <SubscriptionFeatureRow key="country" icon="country" feature={c('Feature').t`3 countries`} />,
            <SubscriptionFeatureRow key="speed" icon="speed" feature={c('Feature').t`Medium speed`} />,
            <SubscriptionFeatureRow key="bandwidth" icon="bandwidth" feature={c('Feature').t`Unlimited bandwidth`} />
        ],
        [PLANS.VPNBASIC]: [
            <SubscriptionFeatureRow key="connection" icon="connection" feature={c('Feature').t`2 VPN connections`} />,
            <SubscriptionFeatureRow key="country" icon="country" feature={c('Feature').t`XX countries`} />, // TODO
            <SubscriptionFeatureRow key="speed" icon="speed" feature={c('Feature').t`High speed`} />,
            <SubscriptionFeatureRow key="bandwidth" icon="bandwidth" feature={c('Feature').t`P2P/Bittorrent support`} />
        ],
        [PLANS.VPNPLUS]: [
            <SubscriptionFeatureRow key="connection" icon="connection" feature={c('Feature').t`5 VPN connections`} />,
            <SubscriptionFeatureRow key="country" icon="country" feature={c('Feature').t`XX countries`} />, // TODO
            <SubscriptionFeatureRow key="speed" icon="speed" feature={c('Feature').t`Highest speed`} />,
            <SubscriptionFeatureRow
                key="bandwidth"
                icon="bandwidth"
                feature={c('Feature').t`P2P/Bittorrent support`}
            />,
            <SubscriptionFeatureRow key="access" icon="access" feature={c('Feature').t`Access blocked content`} />
        ]
    };

    const ADDONS = {
        [PLANS.PLUS]: [
            <SubscriptionAddonRow
                key="storage"
                label={c('Label').t`Storage space`}
                price={
                    <Price currency={model.currency} prefix="+" suffix={c('Suffix').t`/month`}>
                        {(model.planIDs[storageAddon.ID] || 0) * storageAddon.Pricing[CYCLE.MONTHLY]}
                    </Price>
                }
                format={(value) => humanSize(value, 'GB')}
                step={storageAddon.MaxSpace}
                start={plusPlan.MaxSpace}
                quantity={model.planIDs[storageAddon.ID]}
                onChange={(quantity) =>
                    setModel({ ...model, planIDs: { ...model.planIDs, [storageAddon.ID]: quantity } })
                }
            />,
            <SubscriptionAddonRow
                key="address"
                label={c('Label').t`Email addresses`}
                price={
                    <Price currency={model.currency} prefix="+" suffix={c('Suffix').t`/month`}>
                        {(model.planIDs[addressAddon.ID] || 0) * plansMap[ADDON_NAMES.ADDRESS].Pricing[CYCLE.MONTHLY]}
                    </Price>
                }
                step={addressAddon.MaxAddresses}
                start={plusPlan.MaxAddresses}
                quantity={model.planIDs[addressAddon.ID]}
                onChange={(quantity) =>
                    setModel({ ...model, planIDs: { ...model.planIDs, [addressAddon.ID]: quantity } })
                }
            />,
            <SubscriptionAddonRow
                key="domain"
                label={c('Label').t`Custom domains`}
                price={
                    <Price currency={model.currency} prefix="+" suffix={c('Suffix').t`/month`}>
                        {(model.planIDs[domainAddon.ID] || 0) * plansMap[ADDON_NAMES.DOMAIN].Pricing[CYCLE.MONTHLY]}
                    </Price>
                }
                step={domainAddon.MaxDomains}
                start={plusPlan.MaxDomains}
                quantity={model.planIDs[domainAddon.ID]}
                onChange={(quantity) =>
                    setModel({ ...model, planIDs: { ...model.planIDs, [domainAddon.ID]: quantity } })
                }
            />
        ],
        [PLANS.PROFESSIONAL]: [
            <SubscriptionAddonRow
                key="member"
                label={c('Label').t`Users`}
                price={
                    <Price currency={model.currency} prefix="+" suffix={c('Suffix').t`/month`}>
                        {(model.planIDs[memberAddon.ID] || 0) * plansMap[ADDON_NAMES.MEMBER].Pricing[CYCLE.MONTHLY]}
                    </Price>
                }
                step={memberAddon.MaxMembers}
                start={professionalPlan.MaxMembers}
                quantity={model.planIDs[memberAddon.ID]}
                onChange={(quantity) =>
                    setModel({ ...model, planIDs: { ...model.planIDs, [memberAddon.ID]: quantity } })
                }
            />,
            <SubscriptionAddonRow
                key="domain"
                label={c('Label').t`Custom domains`}
                price={
                    <Price currency={model.currency} prefix="+" suffix={c('Suffix').t`/month`}>
                        {(model.planIDs[domainAddon.ID] || 0) * plansMap[ADDON_NAMES.DOMAIN].Pricing[CYCLE.MONTHLY]}
                    </Price>
                }
                step={domainAddon.MaxDomains}
                start={professionalPlan.MaxDomains}
                quantity={model.planIDs[domainAddon.ID]}
                onChange={(quantity) =>
                    setModel({ ...model, planIDs: { ...model.planIDs, [domainAddon.ID]: quantity } })
                }
            />
        ],
        [PLANS.VPNPLUS]: [
            <SubscriptionAddonRow
                key="vpn"
                label={c('Label').t`VPN connections`}
                price={
                    <Price currency={model.currency} prefix="+" suffix={c('Suffix').t`/month`}>
                        {(model.planIDs[vpnAddon.ID] || 0) * plansMap[ADDON_NAMES.VPN].Pricing[CYCLE.MONTHLY]}
                    </Price>
                }
                step={vpnAddon.MaxVpn}
                start={vpnplusPlan.MaxVpn}
                quantity={model.planIDs[vpnAddon.ID]}
                onChange={(quantity) => setModel({ ...model, planIDs: { ...model.planIDs, [vpnAddon.ID]: quantity } })}
            />
        ]
    };

    const sections = [
        <section className="subscriptionCustomization-section" key="mail-section">
            <h3>{TITLE[mailPlan.Name]}</h3>
            <Description plans={plans} planName={mailPlan.Name} model={model} setModel={setModel} />
            <MailSubscriptionTable
                currentPlan={c('Status').t`Selected`}
                planNameSelected={mailPlan.Name}
                plans={plans}
                cycle={model.cycle}
                currency={model.currency}
                onSelect={(planID) => {
                    setModel({
                        ...model,
                        planIDs: {
                            ...removeService(model.planIDs, plans, PLAN_SERVICES.MAIL),
                            [planID]: 1
                        }
                    });
                }}
            />
            <SubscriptionPlan
                expanded={expanded}
                canCustomize={CAN_CUSTOMIZE[mailPlan.Name]}
                addons={ADDONS[mailPlan.Name]}
                features={FEATURES[mailPlan.Name]}
                currency={model.currency}
                plan={mailPlan}
                description={DESCRIPTIONS[mailPlan.Name]}
            />
        </section>,
        !hasVisionary && (
            <section className="subscriptionCustomization-section" key="vpn-section">
                <h3>{TITLE[vpnPlan.Name]}</h3>
                <Description plans={plans} planName={vpnPlan.Name} model={model} setModel={setModel} />
                <VpnSubscriptionTable
                    currentPlan={c('Status').t`Selected`}
                    planNameSelected={vpnPlan.Name}
                    plans={plans}
                    cycle={model.cycle}
                    currency={model.currency}
                    onSelect={(planID) => {
                        setModel({
                            ...model,
                            planIDs: {
                                ...removeService(model.planIDs, plans, PLAN_SERVICES.VPN),
                                [planID]: 1
                            }
                        });
                    }}
                />
                <SubscriptionPlan
                    expanded={expanded}
                    canCustomize={CAN_CUSTOMIZE[vpnPlan.Name]}
                    addons={ADDONS[vpnPlan.Name]}
                    features={FEATURES[vpnPlan.Name]}
                    currency={model.currency}
                    plan={vpnPlan}
                    description={DESCRIPTIONS[vpnPlan.Name]}
                />
            </section>
        )
    ].filter(Boolean);

    if (CLIENT_TYPE === CLIENT_TYPES.VPN) {
        return <div className="subscriptionCustomization-container">{sections.reverse()}</div>;
    }

    return <div className="subscriptionCustomization-container">{sections}</div>;
};

SubscriptionCustomization.propTypes = {
    plans: PropTypes.arrayOf(PropTypes.object).isRequired,
    expanded: PropTypes.bool,
    model: PropTypes.object.isRequired,
    setModel: PropTypes.func.isRequired
};

export default SubscriptionCustomization;