const giveXCertBalanceAPI='https://1oxhiogeoi.execute-api.ca-central-1.amazonaws.com/dev/givex/lookup';

const giveXCertBalance = async (
  code:string, 
  pin:string): Promise<string> => {

  let result;
  try {
    const url = new URL(giveXCertBalanceAPI)
    var params = { 
      'code': code,
      'pin': pin
    }
    url.search = new URLSearchParams(params).toString();

    result = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':'wrWgBDcikr4Zj7Qk1155E6Z8qrAdt9a53U9pu0hY',
      },
    });
  } catch (error) {
    throw new Error(`Error : ${error}`);
  }

  if (result.status !== 200) {
    throw new Error('Unable to get Auth token');
  }
  
  const res = await result.json();
  if (res.balance)
  {
    return (res.balance)
  }
  else
  {
    const error=res.result[2]
    return (error)
  }
};
export default giveXCertBalance;