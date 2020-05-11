export enum SIGNUP_STEPS {
    LOADING_SIGNUP = 'loading-signup',
    NO_SIGNUP = 'no-signup',
    ACCOUNT_CREATION_USERNAME = 'account-creation-username',
    ACCOUNT_CREATION_EMAIL = 'account-creation-email',
    RECOVERY_EMAIL = 'recovery-email',
    RECOVERY_PHONE = 'recovery-phone',
    VERIFICATION_CODE = 'verification-code',
    PLANS = 'plans',
    PAYMENT = 'payment',
    HUMAN_VERIFICATION = 'human-verification',
    CREATING_ACCOUNT = 'creating-account',
    COMPLETE = 'complete'
}

export const YANDEX_DOMAINS = ['yandex.ru', 'yandex.ua'];
export const YAHOO_DOMAINS = [
    'yahoo.at',
    'yahoo.be',
    'yahoo.ca',
    'yahoo.co.id',
    'yahoo.co.il',
    'yahoo.co.in',
    'yahoo.co.jp',
    'yahoo.co.nz',
    'yahoo.co.th',
    'yahoo.co.uk',
    'yahoo.co.za',
    'yahoo.com',
    'yahoo.com.ar',
    'yahoo.com.br',
    'yahoo.com.co',
    'yahoo.com.hk',
    'yahoo.com.my',
    'yahoo.com.ph',
    'yahoo.com.sg',
    'yahoo.com.tr',
    'yahoo.com.tw',
    'yahoo.com.vn',
    'yahoo.cz',
    'yahoo.de',
    'yahoo.dk',
    'yahoo.es',
    'yahoo.fi',
    'yahoo.fr',
    'yahoo.gr',
    'yahoo.hu',
    'yahoo.ie',
    'yahoo.in',
    'yahoo.it',
    'yahoo.nl',
    'yahoo.no',
    'yahoo.pl',
    'yahoo.pt',
    'yahoo.ro',
    'yahoo.se',
    'ymail.com',
    'rocketmail.com'
];
export const AOL_DOMAINS = [
    'aol.asia',
    'aol.at',
    'aol.be',
    'aol.ch',
    'aol.cl',
    'aol.co.nz',
    'aol.co.uk',
    'aol.com',
    'aol.com.ar',
    'aol.com.au',
    'aol.com.br',
    'aol.com.co',
    'aol.com.mx',
    'aol.com.tr',
    'aol.com.ve',
    'aol.cz',
    'aol.de',
    'aol.dk',
    'aol.es',
    'aol.fi',
    'aol.fr',
    'aol.in',
    'aol.it',
    'aol.jp',
    'aol.nl',
    'aol.pl',
    'aol.se',
    'aol.tw',
    'wow.com',
    'games.com',
    'love.com',
    'ygm.com'
];
export const MAIL_RU_DOMAINS = ['mail.ru', 'inbox.ru', 'list.ru', 'bk.ru'];
export const GMAIL_DOMAINS = ['gmail.com', 'googlemail.com', 'google.com', 'googlegroups.com'];

export const UNSECURE_DOMAINS = [
    ...GMAIL_DOMAINS,
    ...AOL_DOMAINS,
    ...YAHOO_DOMAINS,
    ...YANDEX_DOMAINS,
    ...MAIL_RU_DOMAINS
];

export const DEFAULT_SIGNUP_MODEL = {
    step: SIGNUP_STEPS.LOADING_SIGNUP,
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    verifyMethods: [],
    domains: [],
    recoveryEmail: '',
    recoveryPhone: '',
    verificationCode: '',
    currency: 'EUR',
    cycle: 12,
    planIDs: {},
    humanVerificationMethods: [],
    humanVerificationToken: '',
    verificationToken: '',
    paymentToken: ''
};

export const DEFAULT_CHECK_RESULT = {
    Amount: 0,
    AmountDue: 0,
    Proration: 0,
    Credit: 0,
    Currency: 'EUR',
    Cycle: 0,
    Gift: 0,
    CouponDiscount: 0,
    Coupon: null
};
