const int_re   = /^-?\d+$/;

// float_re is incomplete, but close enough for my purposes
const float_re = /^-?\d+\.\d+$/;

export function unstringify(data: any) : any
{
  if (undefined === data) return data;
  if (null === data) return data;
  if (typeof data === 'number') return data;

  // arrays are also objects, so we must do the array test before the object test
  if (Array.isArray(data))
  {
    for (let i = 0; i < data.length; i++)
      data[i] = unstringify(data[i]);
    return data;
  }
  else if (typeof data === 'object')
  {
    for (let key in data)
      data[key] = unstringify(data[key]);
    return data;
  }
  else if (typeof data === 'string')
  {
    if (int_re.exec(data))
      return parseInt(data);
    if (float_re.exec(data))
      return parseFloat(data);
    return data;
  }
  else
  {
    console.log('unstringify: unexpected data type ', typeof data);
    return data;
  }
};

export function money_format(amount: number): number
{
  return Math.round(100*amount)/100;
}

export function is_empty_string(s: string): boolean
{
  if (s === undefined) return true;
  if (s === null) return true;
  return null != s.match(/^\s*$/);
}

export function moneyClass(amount: number) : string {
  let className = "money";
  if (amount < 0) className += " money-debit";
  return className;
}
