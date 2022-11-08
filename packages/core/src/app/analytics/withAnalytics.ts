import { AnalyticsContext } from '@bigcommerce/checkout/analytics';

import { createInjectHoc } from '../common/hoc';

const withAnalytics = createInjectHoc(AnalyticsContext, { displayNamePrefix: 'WithAnalytics' });

export default withAnalytics;
