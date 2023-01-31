import { creditCardType } from 'card-validator';

export default function configureCardValidator(): void {
    const discoverInfo = creditCardType.getTypeInfo('discover');
    const visaInfo = creditCardType.getTypeInfo('visa');

    // Need to support 13 digit PAN because some gateways only provide test credit card numbers in this format.
    creditCardType.updateCard('visa', {
        lengths: [13, ...(visaInfo.lengths || [])],
    });

    // Add support for 8-BIN Discover Cards.
    creditCardType.updateCard('discover', {
        patterns: [...(discoverInfo.patterns || []), [810, 817]],
    });

    // Add support for Mada-BIN Cards.
    creditCardType.addCard({
        niceType: 'Mada',
        type: 'mada',
        patterns: [
            400861, 401757, 407197, 407395, 409201, 410685, 412565, 417633, 419593, 422817, 422818,
            422819, 428331, 428671, 428672, 428673, 431361, 432328, 434107, 439954, 440533, 440647,
            440795, 445564, 446393, 446404, 446672, 455036, 455708, 457865, 458456, 462220, 468540,
            468541, 468542, 468543, 483010, 483011, 483012, 484783, 486094, 486095, 486096, 489317,
            489318, 489319, 493428, 504300, 506968, 508160, 513213, 520058, 521076, 524130, 524514,
            529415, 529741, 530060, 530906, 531095, 531196, 532013, 535825, 535989, 536023, 537767,
            539931, 543085, 543357, 549760, 554180, 557606, 558848, 585265, 588845, 588846, 588847,
            588848, 588849, 588850, 588851, 588982, 588983, 589005, 589206, 604906, 605141, 636120,
            968201, 968202, 968203, 968204, 968205, 968206, 968207, 968208, 968209, 968210, 968211,
        ],
        gaps: [4, 8, 12],
        lengths: [16, 18, 19],
        code: {
            name: 'CVV',
            size: 3,
        },
    });
}
