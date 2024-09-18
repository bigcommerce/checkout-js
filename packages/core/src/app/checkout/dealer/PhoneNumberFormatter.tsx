
export default function formatPhoneNumber(props: { phoneNumber: string }): string {
    const { phoneNumber } = props;

    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const setNumber = cleanedNumber.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (setNumber) {
        return `(${setNumber[1]})-${setNumber[2]}-${setNumber[3]}`;
    }

    return phoneNumber;

}