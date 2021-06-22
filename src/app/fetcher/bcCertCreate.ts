const bcCertCreateAPI = 'https://1oxhiogeoi.execute-api.ca-central-1.amazonaws.com/dev/bigcommerce/giftcard/create';
// x-api-key is exposed and not secure, need a better way to secure aws end point

const bcCertCreate = async (
  code:string,
  pin:string,
  name:string,
  email:string): Promise<string> => {

  let result;
  try {
    const url = new URL(bcCertCreateAPI)
    var params = {
      'code': code,
      'pin': pin,
      'name': name,
      'email': email             
    }
    console.log()
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
  return res.code;
};
export default bcCertCreate;