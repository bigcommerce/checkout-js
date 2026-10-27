/**
 * Custom checkouts: opt in to experiments here, in your fork.
 *
 * New experiments are OFF for custom checkouts. To turn one ON, add its name
 * below. Only experiments listed in `CUSTOM_CHECKOUT_READY_EXPERIMENTS` can be
 * opted in to; anything else stays OFF.
 *
 * An opted-in experiment follows its rollout: it turns ON for your store when
 * the rollout reaches it, and stays ON after the experiment is removed.
 *
 * Upstream ships this list empty and never edits it, so changes here won't
 * conflict when you merge upstream.
 *
 * Example:
 *
 *     export const CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS: string[] = ['PROJECT-1234.flag_name'];
 */
export const CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS: string[] = [];
