/**
 * Custom checkouts: opt in to experiments here, in your fork.
 *
 * New experiments are OFF for custom checkouts. To include your store in an
 * experiment's rollout, add its name below. An opted-in experiment turns ON for
 * your store only when the rollout reaches it.
 *
 * Check with the checkout team before opting in, to confirm the experiment is
 * ready for custom checkouts.
 *
 * Upstream ships this list empty and never edits it, so changes here won't
 * conflict when you merge upstream.
 *
 * Example:
 *
 *     export const CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS: string[] = ['PROJECT-1234.flag_name'];
 */
export const CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS: string[] = [];
